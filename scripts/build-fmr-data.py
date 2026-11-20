"""
build-fmr-data.py

  python scripts/build-fmr-data.py        # FY2026 (the default; gives a byte-identical fmr2026.ts)
  python scripts/build-fmr-data.py --year 2027 --src data/sources/hud/FY27_safmrs.xlsx
  Options: --mha-year YYYY  BAH folder whose zipToMha.ts + mhaRates.ts to aggregate with
                            (default: --year when src/data/bah/{year}/zipToMha.ts exists,
                            else the newest folder that has one)
           --out PATH       write somewhere else (regenerate-and-compare checks)

Generates src/data/bah/fmr/fmr{year}.ts: each CONUS Military Housing Area mapped
to its HUD FY{year} SAFMR rent benchmark (all bedroom sizes), derived deterministically
from the official HUD SAFMR file. Which FMR year a page shows is decided in one place,
src/lib/calculations/fmr.ts (the FMR year that pairs with the BAH year on the page).

Sources (read-only, gitignored), sheet "SAFMRs":
  - FY2026: data/sources/hud/fy2026_safmrs_revised.xlsx
  - FY2027: data/sources/hud/FY27_safmrs.xlsx (docs/sources/hud-safmr-fy2027.md)
  - Headers contain embedded newlines (normalized).
  - Read with engine="calamine" (openpyxl chokes on a malformed metadata timestamp).
  - Duplicate ZIP rows are identical on rents (verified: 0 disagree) → dedup by ZIP is safe.

Method: for each MHA, the MEDIAN of each "SAFMR {n}BR" across the MHA's covered ZIPs.
MHAs with zero SAFMR coverage are OMITTED (none occur in FY2026; logic kept for robustness).
Rent values come ONLY from the HUD file — never estimated or computed.
"""

import os
import re
import json
import argparse
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_YEAR = "2026"
DEFAULT_SRC = os.path.join(ROOT, "data", "sources", "hud", "fy2026_safmrs_revised.xlsx")

BEDROOM_COLS = ["SAFMR 0BR", "SAFMR 1BR", "SAFMR 2BR", "SAFMR 3BR", "SAFMR 4BR"]


def zip5(z) -> str:
    s = str(z).strip()
    if s.endswith(".0"):
        s = s[:-2]
    return s.zfill(5)


def median_int(values: list[int]) -> int:
    s = sorted(values)
    n = len(s)
    mid = n // 2
    return round((s[mid - 1] + s[mid]) / 2) if n % 2 == 0 else s[mid]


def pctile_int(values: list[int], q: float) -> int:
    """Linear-interpolated percentile (numpy default), rounded to whole dollars.
    Used for p25/p75 so a single outlier ZIP doesn't distort the range.
    (The median stays on median_int above to remain byte-identical to prior output.)"""
    import numpy as np
    return int(round(float(np.percentile(np.asarray(values, dtype=float), q))))


def load_ts_object(path: str, var: str) -> str:
    s = open(path, encoding="utf-8").read()
    s = s[s.index(var):]
    return s[s.index("{"): s.rindex("};") + 1].rstrip(";")


def default_mha_year(year: str) -> str:
    """The ZIP->MHA map to aggregate with: the FMR year's own BAH folder when it has
    one, else the newest BAH folder that does (HUD publishes a new year in late August,
    months before DoD publishes that year's BAH)."""
    bah = os.path.join(ROOT, "src", "data", "bah")
    if os.path.isfile(os.path.join(bah, year, "zipToMha.ts")):
        return year
    have = sorted(
        d for d in os.listdir(bah)
        if re.fullmatch(r"\d{4}", d) and os.path.isfile(os.path.join(bah, d, "zipToMha.ts"))
    )
    if not have:
        raise SystemExit("FATAL: no src/data/bah/{year}/zipToMha.ts found")
    return have[-1]


def parse_args():
    ap = argparse.ArgumentParser(description="Aggregate a HUD SAFMR xlsx by Military Housing Area.")
    ap.add_argument("--year", default=DEFAULT_YEAR, help="HUD fiscal year of the file (default 2026)")
    ap.add_argument("--src", default=None, help="HUD SAFMR xlsx (default: the FY2026 file; required for other years)")
    ap.add_argument("--mha-year", default=None, help="BAH folder whose zipToMha.ts + mhaRates.ts to use")
    ap.add_argument("--out", default=None, help="output path (default src/data/bah/fmr/fmr{year}.ts)")
    a = ap.parse_args()
    if not re.fullmatch(r"\d{4}", a.year):
        raise SystemExit(f"FATAL: --year must be YYYY, got {a.year!r}")
    if a.src is None:
        if a.year != DEFAULT_YEAR:
            raise SystemExit(f"FATAL: --src is required for --year {a.year}")
        a.src = DEFAULT_SRC
    a.mha_year = a.mha_year or default_mha_year(a.year)
    if not re.fullmatch(r"\d{4}", a.mha_year):
        raise SystemExit(f"FATAL: --mha-year must be YYYY, got {a.mha_year!r}")
    a.out = a.out or os.path.join(ROOT, "src", "data", "bah", "fmr", f"fmr{a.year}.ts")
    return a


def main():
    args = parse_args()
    year, mha_year = args.year, args.mha_year
    SAFMR_FILE, OUT_FILE = args.src, args.out
    print(f"FY{year} from {SAFMR_FILE} | ZIP->MHA map: src/data/bah/{mha_year}/")
    if mha_year != year:
        print(f"  NOTE: src/data/bah/{year}/ has no ZIP map; using {mha_year}'s. Regenerate after the {year} BAH import.")
    print("Loading SAFMR file (calamine)...")
    saf = pd.read_excel(SAFMR_FILE, sheet_name="SAFMRs", engine="calamine")
    saf.columns = [str(c).replace("\n", " ").strip() for c in saf.columns]
    for c in ["ZIP Code", *BEDROOM_COLS]:
        if c not in saf.columns:
            raise SystemExit(f"FATAL: column '{c}' not found in SAFMR file")
    saf["ZIP Code"] = saf["ZIP Code"].map(zip5)

    # Dedup safety guard (must be 0 disagreements before we drop duplicates).
    disagree = int((saf.groupby("ZIP Code")["SAFMR 2BR"].nunique() > 1).sum())
    if disagree != 0:
        raise SystemExit(f"FATAL: {disagree} ZIPs disagree on SAFMR 2BR across duplicate rows")
    saf = saf.drop_duplicates(subset="ZIP Code").set_index("ZIP Code")
    print(f"  {len(saf)} unique ZIPs")

    print("Parsing zipToMha + mhaRates codes...")
    zip_to_mha = json.loads(load_ts_object(os.path.join(ROOT, f"src/data/bah/{mha_year}/zipToMha.ts"), "zipToMha"))
    mr = open(os.path.join(ROOT, f"src/data/bah/{mha_year}/mhaRates.ts"), encoding="utf-8").read()
    mha_codes = sorted(set(re.findall(r'"([A-Z]{2}\d{3})":\{w:', mr)))

    # Reverse map MHA -> its ZIPs (territories XX499 excluded — OHA, not BAH).
    mha_zips: dict[str, list[str]] = {}
    for z, m in zip_to_mha.items():
        if m == "XX499":
            continue
        mha_zips.setdefault(m, []).append(zip5(z))

    saf_index = set(saf.index)
    entries: dict[str, dict] = {}
    omitted: list[str] = []

    for m in mha_codes:
        # "Covered" = ZIPs in this MHA that have a 2BR SAFMR value.
        covered = [z for z in mha_zips.get(m, []) if z in saf_index and pd.notna(saf.at[z, "SAFMR 2BR"])]
        if not covered:
            omitted.append(m)
            continue
        br = {}
        for i, col in enumerate(BEDROOM_COLS):
            vals = [int(round(saf.at[z, col])) for z in covered if pd.notna(saf.at[z, col])]
            br[i] = {"p25": pctile_int(vals, 25), "median": median_int(vals), "p75": pctile_int(vals, 75)}
        entries[m] = {"br": br, "zipsCovered": len(covered)}

    print(f"  Resolved {len(entries)} MHAs | omitted {len(omitted)}: {omitted or 'none'}")

    # ── Emit TS ──
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)

    def rng(d):
        return f'{{p25:{d["p25"]},median:{d["median"]},p75:{d["p75"]}}}'

    lines = []
    for m in sorted(entries):
        e = entries[m]
        b = e["br"]
        lines.append(
            f'  "{m}":{{br0:{rng(b[0])},br1:{rng(b[1])},br2:{rng(b[2])},'
            f'br3:{rng(b[3])},br4:{rng(b[4])},zipsCovered:{e["zipsCovered"]},method:"safmr-zip-pctile"}}'
        )
    body = ",\n".join(lines)

    # Written only when the ZIP map is another year's, so FY2026 output stays byte-identical.
    map_note = (
        f" * ZIP → MHA map: src/data/bah/{mha_year}/ ({year} BAH was not loaded when this was\n"
        f" * generated). Regenerate after the {year} BAH import; tests/e2e/bah-fmr.spec.ts checks.\n"
        if mha_year != year else ""
    )
    content = (
        "/**\n"
        f" * FY{year} HUD Small Area Fair Market Rents (SAFMR), aggregated by Military Housing Area.\n"
        f" * Source: HUD {os.path.basename(SAFMR_FILE)} (official ZIP-level SAFMR data).\n"
        " * Method: 25th percentile / median / 75th percentile of each bedroom size's SAFMR\n"
        " * across the MHA's covered ZIPs (p25/p75 use linear interpolation; the median is\n"
        " * the true median — so 'does BAH cover rent' can reflect WHERE in the MHA you live).\n"
        " *\n"
        " * Generated by scripts/build-fmr-data.py — DO NOT EDIT BY HAND.\n"
        " * Rent values come only from the HUD file (never estimated or computed).\n"
        " * MHAs with zero SAFMR coverage are omitted (the lookup returns null).\n"
        f"{map_note}"
        " */\n\n"
        f"export const FMR_DATA_YEAR = '{year}';\n\n"
        "export interface FmrRange {\n"
        "  p25: number;\n"
        "  median: number;\n"
        "  p75: number;\n"
        "}\n\n"
        "export interface MHAFmr {\n"
        "  br0: FmrRange;\n"
        "  br1: FmrRange;\n"
        "  br2: FmrRange;\n"
        "  br3: FmrRange;\n"
        "  br4: FmrRange;\n"
        "  zipsCovered: number;\n"
        "  method: 'safmr-zip-pctile';\n"
        "}\n\n"
        f"export const MHA_FMR_{year}: Record<string, MHAFmr> = {{\n"
        f"{body}\n"
        "};\n"
    )
    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"\nWrote {len(entries)} MHAs to {OUT_FILE}")


if __name__ == "__main__":
    main()
