# Source snapshots

## `data/sources/dtmo/{YYYY}/` — DTMO BAH ASCII packages

Raw DTMO BAH files, committed as the source of record (exact bytes; see `.gitattributes`).
Provenance + SHA-256 per year: `bah-2026.md` (and `bah-2027.md` on release day). Imported with
`npm run bah:import`; runbook: `docs/RELEASE_DAY_BAH_2027.md`.

## `dfas-2026-basic-pay.csv` — 2026 military basic pay

Extracted from the DFAS HTML tables; DFAS does not publish 2026 basic pay as PDF.

Retrieved: Nov 11, 2026.

| Table | URL | Page updated |
|---|---|---|
| Enlisted (E-1–E-9) | https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/EM/ | Jan 12, 2026 |
| Officers (O-1–O-10) | https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/CO/ | Feb 13, 2026 |
| Officers with more than 4 years of prior enlisted or warrant service (O-1E–O-3E) | https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/CO_FE/ | Jan 12, 2026 |
| Warrant officers (W-1–W-5) | https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/WO/ | Jan 15, 2026 |

Format: one row per grade; columns `2_or_less`, `over_2` … `over_40`, in monthly
dollars. A blank cell means DFAS leaves that cell blank.

`src/data/pay-tables/2026.ts` is checked against this file, cell by cell, by
`tests/e2e/pay-table-dfas.spec.ts` (`npm run test:pay-table`).

## `pcs-rules-2026.md` — PCS allowance rules (build 07)

Claude Chat's rule check of 2026-11-18 (copied verbatim from the build pack): POV travel days
(JTR 050205), MALT Plus flat per diem (Table 5-4), standard CONUS per diem FY2026/FY2027 (GSA),
TLE (Tables 5-13/5-17, $290 cap, 21 days), HHG weight allowances (Table 5-37, both columns,
JTR edition dated Oct 1, 2024), second-POV MALT (050203, Table 5-1), PPM incentive (GCC).
Read by `src/data/pcs/` and `src/lib/calculations/pcs.ts`.

## `hud-safmr-fy2027.md` — HUD Small Area Fair Market Rents, FY2027 (build H1)

Claude Chat's check of 2026-11-20 plus the downloaded file's size and SHA-256. The xlsx itself
(`data/sources/hud/FY27_safmrs.xlsx`) is gitignored like the FY2026 file. Generated into
`src/data/bah/fmr/fmr2027.ts` by `python scripts/build-fmr-data.py --year 2027`; the station
pages pair it with 2027 BAH (`src/lib/calculations/fmr.ts`).

## `separation-rules-2026.md` — TAMP, VGLI and TAP rules (build 10a)

Claude Chat's rule check of 2026-11-20 (copied verbatim from the build pack): TAMP eligibility
(10 U.S.C. § 1145(a)(2), with the plain-words list the pages use) and duration (§ 1145(a)(4):
the separation date is day 1 of 180), VGLI deadlines (VA.gov: 1 year and 120 days; 240 days
without proof of good health), preseparation counseling start (10 U.S.C. § 1142: no later than
365 days before separation). JTR final-move limits were not checked. Read by
`src/data/separation/rules.ts`.
