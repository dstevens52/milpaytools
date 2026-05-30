"""
build-fmr-data.py
Run once: python scripts/build-fmr-data.py

Generates src/data/bah/fmr/fmr2026.ts — each CONUS Military Housing Area mapped
to its FY2026 HUD SAFMR rent benchmark (all bedroom sizes), derived deterministically
from the official HUD SAFMR file.

Source (read-only): data/sources/hud/fy2026_safmrs_revised.xlsx, sheet "SAFMRs".
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
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAFMR_FILE = os.path.join(ROOT, "data", "sources", "hud", "fy2026_safmrs_revised.xlsx")
OUT_FILE = os.path.join(ROOT, "src", "data", "bah", "fmr", "fmr2026.ts")

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


def main():
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
    zip_to_mha = json.loads(load_ts_object(os.path.join(ROOT, "src/data/bah/2026/zipToMha.ts"), "zipToMha"))
    mr = open(os.path.join(ROOT, "src/data/bah/2026/mhaRates.ts"), encoding="utf-8").read()
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

    content = (
        "/**\n"
        " * FY2026 HUD Small Area Fair Market Rents (SAFMR), aggregated by Military Housing Area.\n"
        " * Source: HUD fy2026_safmrs_revised.xlsx (official ZIP-level SAFMR data).\n"
        " * Method: 25th percentile / median / 75th percentile of each bedroom size's SAFMR\n"
        " * across the MHA's covered ZIPs (p25/p75 use linear interpolation; the median is\n"
        " * the true median — so 'does BAH cover rent' can reflect WHERE in the MHA you live).\n"
        " *\n"
        " * Generated by scripts/build-fmr-data.py — DO NOT EDIT BY HAND.\n"
        " * Rent values come only from the HUD file (never estimated or computed).\n"
        " * MHAs with zero SAFMR coverage are omitted (the lookup returns null).\n"
        " */\n\n"
        "export const FMR_DATA_YEAR = '2026';\n\n"
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
        "export const MHA_FMR_2026: Record<string, MHAFmr> = {\n"
        f"{body}\n"
        "};\n"
    )
    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"\nWrote {len(entries)} MHAs to {os.path.relpath(OUT_FILE, ROOT)}")


if __name__ == "__main__":
    main()
