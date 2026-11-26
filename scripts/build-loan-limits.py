"""
build-loan-limits.py

  python scripts/build-loan-limits.py --year 2027
  python scripts/build-loan-limits.py --year 2026
  Options: --src PATH   FHFA county CSV (default: data/sources/fhfa/
                        fullcountyloanlimitlist{year}_hera-based_final_flat.csv)
           --downloaded YYYY-MM-DD   date the CSV was downloaded (written to the header)
           --out-dir PATH            write somewhere else (regenerate-and-compare checks)

Generates, from FHFA's official county conforming loan limit file:
  - src/data/va-loan/loanLimits{year}.ts         one row per county: FIPS (state + county),
                                                 state, county name, One-Unit limit
  - src/data/va-loan/loanLimitsSummary{year}.ts  source, SHA-256, row count, and the
                                                 baseline / ceiling values the checks below
                                                 confirmed (small; safe to import client-side)

Source: docs/sources/va-entitlement-loan-limits-2027.md (FHFA, verified 2026-11-25).
VA home loan limits are FHFA's conforming loan limits; VA says to use the One-Unit
limit "even if your property has more than one unit", so only that column is kept.
Every value comes from the CSV. Nothing is typed, estimated or computed.

Sanity checks (the script fails if any is wrong), from the source file:
  - the most common One-Unit value is the year's baseline;
  - the highest value outside AK/HI/GU/VI is the year's ceiling;
  - (2027) every AK/HI/GU/VI county is >= $1,283,100 and <= $1,924,650;
  - about 3,2xx rows.
"""

import argparse
import collections
import csv
import hashlib
import io
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FHFA_BASE_URL = "https://www.fhfa.gov/document/d/cll/"

# Expected values from docs/sources/va-entitlement-loan-limits-2027.md (FHFA releases).
# These are CHECKS on the file, not data: the generated values come from the CSV.
EXPECTED = {
    "2026": {"baseline": 832_750, "ceiling": 1_249_125, "special_min": None, "special_max": None},
    "2027": {"baseline": 855_400, "ceiling": 1_283_100, "special_min": 1_283_100, "special_max": 1_924_650},
}
# Alaska, Hawaii, Guam and the U.S. Virgin Islands have their own (higher) baseline and ceiling.
SPECIAL_STATES = {"AK", "HI", "GU", "VI"}
ONE_UNIT_COL = "One-Unit Limit"
DEFAULT_DOWNLOADED = "2026-11-25"


def parse_money(s: str) -> int:
    t = s.strip()
    if not re.fullmatch(r"\$\d{1,3}(,\d{3})*", t):
        raise SystemExit(f"FATAL: unexpected money value {s!r}")
    return int(t[1:].replace(",", ""))


def parse_args():
    ap = argparse.ArgumentParser(description="FHFA county conforming loan limits -> TS data files.")
    ap.add_argument("--year", required=True, help="loan limit year (YYYY)")
    ap.add_argument("--src", default=None, help="FHFA county CSV")
    ap.add_argument("--downloaded", default=DEFAULT_DOWNLOADED, help="download date (YYYY-MM-DD)")
    ap.add_argument("--out-dir", default=os.path.join(ROOT, "src", "data", "va-loan"))
    a = ap.parse_args()
    if not re.fullmatch(r"\d{4}", a.year):
        raise SystemExit(f"FATAL: --year must be YYYY, got {a.year!r}")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a.downloaded):
        raise SystemExit(f"FATAL: --downloaded must be YYYY-MM-DD, got {a.downloaded!r}")
    a.file = f"fullcountyloanlimitlist{a.year}_hera-based_final_flat.csv"
    a.src = a.src or os.path.join(ROOT, "data", "sources", "fhfa", a.file)
    return a


def ts_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    args = parse_args()
    year = args.year
    raw = open(args.src, "rb").read()
    sha = hashlib.sha256(raw).hexdigest()
    text = raw.decode("utf-8-sig")
    reader = csv.reader(io.StringIO(text, newline=""))
    header = [h.replace("\n", " ").strip() for h in next(reader)]
    need = ["FIPS State Code", "FIPS County Code", "County Name", "State", ONE_UNIT_COL]
    for c in need:
        if c not in header:
            raise SystemExit(f"FATAL: column {c!r} not in {header}")
    ix = {c: header.index(c) for c in need}

    rows = []
    seen = set()
    for r in reader:
        if not any(x.strip() for x in r):
            continue
        st_fips = r[ix["FIPS State Code"]].strip()
        co_fips = r[ix["FIPS County Code"]].strip()
        if not (re.fullmatch(r"\d{2}", st_fips) and re.fullmatch(r"\d{3}", co_fips)):
            raise SystemExit(f"FATAL: bad FIPS {st_fips!r}/{co_fips!r} in {r}")
        fips = st_fips + co_fips
        if fips in seen:
            raise SystemExit(f"FATAL: duplicate FIPS {fips}")
        seen.add(fips)
        state = r[ix["State"]].strip()
        if not re.fullmatch(r"[A-Z]{2}", state):
            raise SystemExit(f"FATAL: bad state {state!r}")
        county = re.sub(r"\s+", " ", r[ix["County Name"]].strip())
        if not county:
            raise SystemExit(f"FATAL: empty county name for {fips}")
        rows.append((fips, state, county, parse_money(r[ix[ONE_UNIT_COL]])))

    rows.sort(key=lambda x: x[0])

    # ── Sanity checks ──
    print(f"{year}: {args.src}")
    print(f"  SHA-256 {sha}")
    print(f"  rows: {len(rows)}  states/territories: {len({x[1] for x in rows})}")
    if not (3200 <= len(rows) <= 3299):
        raise SystemExit(f"FATAL: expected about 3,2xx counties, got {len(rows)}")
    counts = collections.Counter(x[3] for x in rows)
    baseline, baseline_n = counts.most_common(1)[0]
    others = [x for x in rows if x[1] not in SPECIAL_STATES]
    special = [x for x in rows if x[1] in SPECIAL_STATES]
    ceiling = max(x[3] for x in others)
    special_min = min(x[3] for x in special)
    special_max = max(x[3] for x in special)
    at_ceiling = sum(1 for x in others if x[3] == ceiling)
    print(f"  most common One-Unit: ${baseline:,} ({baseline_n} counties)")
    print(f"  highest outside AK/HI/GU/VI: ${ceiling:,} ({at_ceiling} counties)")
    print(f"  AK/HI/GU/VI: {len(special)} counties, ${special_min:,} to ${special_max:,}")
    exp = EXPECTED.get(year)
    if exp is None:
        raise SystemExit(f"FATAL: no expected values for {year}; add them from the source file first")
    if baseline != exp["baseline"]:
        raise SystemExit(f"FATAL: baseline ${baseline:,} != expected ${exp['baseline']:,}")
    if ceiling != exp["ceiling"]:
        raise SystemExit(f"FATAL: ceiling ${ceiling:,} != expected ${exp['ceiling']:,}")
    if exp["special_min"] is not None and special_min < exp["special_min"]:
        raise SystemExit(f"FATAL: AK/HI/GU/VI min ${special_min:,} < ${exp['special_min']:,}")
    if exp["special_max"] is not None and special_max > exp["special_max"]:
        raise SystemExit(f"FATAL: AK/HI/GU/VI max ${special_max:,} > ${exp['special_max']:,}")
    if min(x[3] for x in rows) < baseline:
        raise SystemExit("FATAL: a county is below the baseline")
    print("  sanity checks: PASS")

    # ── Emit TS ──
    os.makedirs(args.out_dir, exist_ok=True)
    url = FHFA_BASE_URL + args.file
    head = (
        "/**\n"
        f" * FHFA {year} conforming loan limits by county: the One-Unit limit (VA home loan\n"
        " * limits are FHFA's conforming loan limits; VA: use the One-Unit limit \"even if\n"
        " * your property has more than one unit\").\n"
        f" * Source: {url}\n"
        f" * File: {args.file} (downloaded {args.downloaded})\n"
        f" * SHA-256 of the raw CSV: {sha}\n"
        " * Notes: docs/sources/va-entitlement-loan-limits-2027.md\n"
        " *\n"
        f" * Generated by scripts/build-loan-limits.py --year {year} — DO NOT EDIT BY HAND.\n"
        " * Every value comes from the FHFA file (never typed or estimated).\n"
        " */\n"
    )

    data_lines = [f"  [{ts_str(f)},{ts_str(s)},{ts_str(c)},{v}]" for f, s, c, v in rows]
    data = (
        head
        + "\nimport type { CountyLoanLimitRow } from './types';\n\n"
        + "/** [FIPS (2-digit state + 3-digit county), state, county name as FHFA writes it, One-Unit limit]. */\n"
        + f"export const LOAN_LIMITS_{year}: readonly CountyLoanLimitRow[] = [\n"
        + ",\n".join(data_lines)
        + "\n];\n"
    )
    with open(os.path.join(args.out_dir, f"loanLimits{year}.ts"), "w", encoding="utf-8", newline="\n") as f:
        f.write(data)

    summary = (
        head
        + "\nimport type { LoanLimitSummary } from './types';\n\n"
        + f"export const LOAN_LIMIT_SUMMARY_{year}: LoanLimitSummary = {{\n"
        + f"  year: {year},\n"
        + f"  sourceUrl: {ts_str(url)},\n"
        + f"  file: {ts_str(args.file)},\n"
        + f"  downloaded: {ts_str(args.downloaded)},\n"
        + f"  sha256: {ts_str(sha)},\n"
        + f"  counties: {len(rows)},\n"
        + "  /** The most common One-Unit limit (\"most U.S. counties\"). */\n"
        + f"  baseline: {baseline},\n"
        + f"  baselineCounties: {baseline_n},\n"
        + "  /** The highest One-Unit limit outside Alaska, Hawaii, Guam and the U.S. Virgin Islands. */\n"
        + f"  ceiling: {ceiling},\n"
        + "  /** Lowest and highest One-Unit limit in Alaska, Hawaii, Guam and the U.S. Virgin Islands. */\n"
        + f"  specialMin: {special_min},\n"
        + f"  specialMax: {special_max},\n"
        + "};\n"
    )
    with open(os.path.join(args.out_dir, f"loanLimitsSummary{year}.ts"), "w", encoding="utf-8", newline="\n") as f:
        f.write(summary)
    print(f"  wrote loanLimits{year}.ts + loanLimitsSummary{year}.ts to {args.out_dir}")


if __name__ == "__main__":
    main()
