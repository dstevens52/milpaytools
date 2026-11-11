# Source snapshots

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
