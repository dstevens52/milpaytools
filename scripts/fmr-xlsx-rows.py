"""
fmr-xlsx-rows.py: test helper for tests/e2e/bah-fmr.spec.ts (local only; the HUD
xlsx files are gitignored, so CI skips the tests that call this).

  python scripts/fmr-xlsx-rows.py <safmr.xlsx> < zips.json

stdin: a JSON list of 5-digit ZIPs. stdout: JSON {zip: [0BR, 1BR, 2BR, 3BR, 4BR]}
with the raw HUD values (null where HUD has none), for the ZIPs present in the file.
Reads the file the way scripts/build-fmr-data.py does (calamine, sheet "SAFMRs",
newline-normalized headers, duplicate ZIP rows checked to agree, then deduped).
"""

import sys
import json
import pandas as pd

BEDROOM_COLS = ["SAFMR 0BR", "SAFMR 1BR", "SAFMR 2BR", "SAFMR 3BR", "SAFMR 4BR"]


def zip5(z) -> str:
    s = str(z).strip()
    if s.endswith(".0"):
        s = s[:-2]
    return s.zfill(5)


def main():
    path = sys.argv[1]
    wanted = set(json.load(sys.stdin))
    saf = pd.read_excel(path, sheet_name="SAFMRs", engine="calamine")
    saf.columns = [str(c).replace("\n", " ").strip() for c in saf.columns]
    for c in ["ZIP Code", *BEDROOM_COLS]:
        if c not in saf.columns:
            raise SystemExit(f"FATAL: column '{c}' not found")
    saf["ZIP Code"] = saf["ZIP Code"].map(zip5)
    if int((saf.groupby("ZIP Code")["SAFMR 2BR"].nunique() > 1).sum()) != 0:
        raise SystemExit("FATAL: duplicate ZIP rows disagree on SAFMR 2BR")
    saf = saf.drop_duplicates(subset="ZIP Code").set_index("ZIP Code")
    out = {}
    for z in sorted(wanted & set(saf.index)):
        out[z] = [None if pd.isna(saf.at[z, c]) else int(round(saf.at[z, c])) for c in BEDROOM_COLS]
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
