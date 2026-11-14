# Officer Combat Zone Tax Exclusion cap, 2026 (official source record)

**Verified:** 2026-11-14 by Claude Chat (DFAS 2026 basic pay tables and the statute). Recorded in build #8 (deployment cleanup, DEP-05/DEP-06).
**Used by:** `SENIOR_ENLISTED_BASIC_PAY` in `src/data/pay-tables/2026.ts`; `officerCZTEMonthlyCap()` in `src/lib/calculations/deployment.ts`.

## The rule
For a **commissioned officer** serving in a combat zone, the monthly Combat Zone Tax Exclusion is capped at the "maximum enlisted amount" (26 U.S.C. § 112(b), defined in § 112(c)(5)): "the highest rate of basic pay payable for such month to any enlisted member… at the highest pay grade", plus, for an officer entitled to hostile fire or imminent danger special pay, "the amount of such special pay payable to such officer for such month". (Quoted fragments as cited in `docs/audits/math-audit-round-1.md` DEP-05; full text: https://www.law.cornell.edu/uscode/text/26/112.)

- **Commissioned warrant officers are not capped** (rule verified by Claude Chat 2026-11-14; the calculator keeps them uncapped, as before).

## The 2026 figures
| Item | Amount | Source |
|---|---|---|
| Senior enlisted basic pay (Senior Enlisted Advisor to the CJCS, SMA, MCPON, CMSAF, SMMC, CMSSF, MCPOCG) | **$11,166.90 / month**, regardless of years of service | DFAS "Basic Pay – Enlisted, Effective January 1, 2026", **Note 3** |
| Officer CZTE cap reference | Officer table refers to the enlisted note for the cap's base amount | DFAS "Basic Pay – Officers, Effective January 1, 2026", **Note 2** (refers to Basic Pay – Enlisted, Note 3) |
| IDP payable from Oct 1, 2026 | $275 / month | `DEPLOYMENT_RATES_2026.idp` (ASW(M&RA) memo, `docs/sources/hostile-pay-memo.pdf`) |
| HFP payable from Oct 1, 2026 | $450 / month | `DEPLOYMENT_RATES_2026.hfp` (same memo) |

The senior enlisted rate is a footnote on the enlisted table, not a column; it is above the E-9 table maximum ($10,729.20 in `src/data/pay-tables/2026.ts`). The earlier repo comment's "$10,295 (E-9 max)" was neither.

## Why the cap uses the officer's actual HFP/IDP, not "$225"
DFAS Officers Note 2 still prints "($225)" for the special-pay term because it was published before the October 1, 2026 increase, when HFP and IDP were both $225. The statute does not name a dollar amount: it adds "the amount of such special pay **payable to such officer** for such month". So the cap term is:
- **$275** for an officer receiving IDP,
- **$450** for an officer receiving HFP,
- **$0** for an officer receiving neither.

The calculator offers IDP only (HFP is not a user choice), so:
- **With IDP:** $11,166.90 + $275 = **$11,441.90 / month**
- **Without IDP:** **$11,166.90 / month**

## How the calculator applies it
- Compensation tested each month = basic pay + IDP + HDP-L (all taxable absent the exclusion; BAH, BAS and FSA are not taxable income in the first place).
- Excluded = min(compensation, cap); taxable = compensation − excluded.
- Example (check value, build #8): O-6 over 20, IDP, combat zone → ($13,751.10 + $275) − $11,441.90 = **$2,584.20 / month** stays in federal taxable income.

## Annual update
Each January, read the new DFAS enlisted table's senior enlisted note (Note 3 in 2026) and update `SENIOR_ENLISTED_BASIC_PAY`. If HFP/IDP change, the cap follows `DEPLOYMENT_RATES_*` automatically.
