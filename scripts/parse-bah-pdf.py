"""
parse-bah-pdf.py
Run once: python scripts/parse-bah-pdf.py

Extracts 2025 BAH rates from the official DTMO PDF (2025_BAH_Rates.pdf in the
project root) and generates src/data/bah/2025/mhaRates.ts in the EXACT same
shape as the existing src/data/bah/2026/mhaRates.ts.

Design notes / verification basis:
- The PDF is text-based (no OCR). 16 pages: WITH DEPENDENTS (pp.1-8),
  WITHOUT DEPENDENTS (pp.9-16). 338 MHA rows in each section.
- Header (identical in both sections):
    MHA MHA_NAME E01..E09 W01..W05 O01E O02E O03E O01..O07
  => 24 rate columns, matching the 24 deduped grade keys produced by the 2026
  ASCII generator (scripts/parse-bah-data.js). The single O07 column in the PDF
  corresponds to the 2026 "O-7" key (O-7/O-8/O-9/O-10 share one rate).
- Rates are mapped POSITIONALLY using GRADES (the verified 2026 order). The MHA
  name can contain spaces/commas/slashes, so we anchor on: token[0] = MHA code,
  last 24 tokens = rates. This is robust to multi-word names.
- PDF rates are already whole-dollar integers; we int() them (matches the 2026
  whole-dollar convention).
"""

import os
import re
import sys
import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, "2025_BAH_Rates.pdf")
OUT_DIR = os.path.join(ROOT, "src", "data", "bah", "2025")
OUT_FILE = os.path.join(OUT_DIR, "mhaRates.ts")

# Deduped 2026 grade order (from scripts/parse-bah-data.js GRADE_COLS).
GRADES = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
          'W-1', 'W-2', 'W-3', 'W-4', 'W-5', 'O-1E', 'O-2E', 'O-3E',
          'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7']
N = len(GRADES)  # 24

MHA_RE = re.compile(r'^[A-Z]{2}\d{3}$')
INT_RE = re.compile(r'-?\d+$')


def parse():
    with_dep = {}
    without_dep = {}
    section = None  # 'W' or 'WO'
    counts = {'W': 0, 'WO': 0}

    with pdfplumber.open(PDF) as pdf:
        for page in pdf.pages:
            txt = page.extract_text() or ""
            for line in txt.split("\n"):
                line = line.strip()
                if not line:
                    continue
                up = line.upper()
                if "WITHOUT DEPENDENTS" in up:
                    section = "WO"
                    continue
                if "WITH DEPENDENTS" in up:
                    section = "W"
                    continue
                if line.startswith("MHA "):  # column header row
                    continue
                toks = line.split()
                if not toks or not MHA_RE.match(toks[0]):
                    continue
                mha = toks[0]
                rate_toks = toks[-N:]
                if len(rate_toks) != N or not all(INT_RE.match(t) for t in rate_toks):
                    print(f"  ✗ MALFORMED ROW [{section}] {line[:80]}", file=sys.stderr)
                    sys.exit(1)
                rates = {GRADES[i]: int(rate_toks[i]) for i in range(N)}
                target = with_dep if section == "W" else without_dep
                if mha in target:
                    print(f"  ✗ DUPLICATE MHA in section {section}: {mha}", file=sys.stderr)
                    sys.exit(1)
                target[mha] = rates
                counts[section] += 1

    return with_dep, without_dep, counts


def validate(with_dep, without_dep):
    errs = 0
    wk, wok = set(with_dep), set(without_dep)
    only_w = wk - wok
    only_wo = wok - wk
    if only_w:
        print(f"  ✗ {len(only_w)} MHA(s) in WITH but not WITHOUT: {sorted(only_w)[:10]}")
        errs += 1
    if only_wo:
        print(f"  ✗ {len(only_wo)} MHA(s) in WITHOUT but not WITH: {sorted(only_wo)[:10]}")
        errs += 1
    # every MHA must have all 24 grades in both sections
    for label, d in (("W", with_dep), ("WO", without_dep)):
        for mha, rates in d.items():
            if set(rates) != set(GRADES):
                print(f"  ✗ {label} {mha} grade-key mismatch")
                errs += 1
                break
    return errs


def emit(with_dep, without_dep):
    os.makedirs(OUT_DIR, exist_ok=True)
    codes = sorted(with_dep)  # deterministic, sorted by MHA code

    def grades_str(rates):
        # emit in canonical GRADES order
        return ",".join(f'"{g}":{rates[g]}' for g in GRADES)

    entries = []
    for mha in codes:
        w = grades_str(with_dep[mha])
        wo = grades_str(without_dep[mha])
        entries.append(f'"{mha}":{{w:{{{w}}},wo:{{{wo}}}}}')
    body = ",\n  ".join(entries)

    content = (
        "/**\n"
        " * FY2025 BAH monthly rates by Military Housing Area (MHA) code.\n"
        " * Source: DTMO 2025_BAH_Rates.pdf (WITH / WITHOUT DEPENDENTS tables)\n"
        " * Effective: January 1, 2025\n"
        " *\n"
        " * w  = withDependents rates\n"
        " * wo = withoutDependents rates\n"
        " * Rates are whole-dollar integers (BAH is always a whole-dollar amount).\n"
        " *\n"
        " * O-8, O-9, O-10 use O-7 rate — map them before lookup.\n"
        " * Column order verified column-for-column against FY2026 (same 24 grades).\n"
        " */\n\n"
        "export const DATA_YEAR = '2025';\n\n"
        "export interface MHARateSet {\n"
        "  w:  Record<string, number>; // withDependents\n"
        "  wo: Record<string, number>; // withoutDependents\n"
        "}\n\n"
        "export const mhaRates: Record<string, MHARateSet> = {\n"
        f"  {body}\n"
        "};\n"
    )
    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    return len(codes)


if __name__ == "__main__":
    # Windows consoles default to cp1252 and choke on ✓/✗; force UTF-8 output.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print("Parsing 2025_BAH_Rates.pdf...")
    with_dep, without_dep, counts = parse()
    print(f"  WITH DEPENDENTS:    {counts['W']} MHAs")
    print(f"  WITHOUT DEPENDENTS: {counts['WO']} MHAs")
    print("Validating...")
    errs = validate(with_dep, without_dep)
    print("  ✓ No validation errors" if errs == 0 else f"  ✗ {errs} error(s)")
    if errs:
        sys.exit(1)
    n = emit(with_dep, without_dep)
    print(f"\n✅ Wrote {n} MHAs to src/data/bah/2025/mhaRates.ts")
