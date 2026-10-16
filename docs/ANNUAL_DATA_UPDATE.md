# Annual Data Update Checklist (every January)

All rate data updates annually in January when DoD/DFAS/DTMO/IRS publish new
figures. The data layer (`src/data/`) is designed for versioned annual
replacement. This file tracks **content that hard-codes dollar figures inline**
and therefore does NOT update automatically when the data layer is replaced —
each item below must be re-traced against the new source and revised by hand.

## Pay posts with inline dollar figures

These blog posts render as raw MDX strings (`next-mdx-remote/rsc` cannot import
data modules), so every dollar figure is an inline literal traced to a
data-library value at authoring time. On each January update, re-trace every
figure against the new-year source and update the prose, tables, and the
figure-manifest comment block at the top of each post.

- [ ] **E-5 pay post** — `src/content/blog/how-much-does-an-e5-really-make-2026.mdx`
  - Base pay: `payTable['E-5']` in `src/data/pay-tables/2026.ts`
  - BAS: `BAS_RATES.enlisted` in `src/data/constants.ts`
  - BAH: `mhaRates` (E-5 with-dependents) in `src/data/bah/2026/mhaRates.ts`
  - Also update the `slug`/`title`/`description` year and the `date`/review date.

- [ ] **O-3 pay post** — `src/content/blog/how-much-does-an-o3-really-make-2026.mdx`
  - Base pay: `payTable['O-3']` (and `payTable['O-3E']` for the prior-enlisted section)
  - E-7 contrast: `payTable['E-7'][6]`
  - BAS: `BAS_RATES.officer` (and `.enlisted` for the contrast line)
  - BAH: `mhaRates` (O-3 with-dependents) — ZIP 28307→NC182, 80913→CO046, 92134→CA038
  - Derived totals, BRS match, and the civilian-equivalent illustration all
    depend on the above — recompute when any input changes.
  - The full figure manifest is in the comment block at the top of the post.

## Special and incentive pays — NOT January-only

HFP, IDP, and HDP-L changed **off-cycle**, effective October 1, 2026 (ASW(M&RA)
memo signed July 14, 2026 — `docs/sources/hostile-pay-memo.pdf`). The January pass
alone is not sufficient for these pays; check for new memos/FMR Vol. 7A Ch. 10 and
Ch. 17 changes whenever a rate-change announcement appears, not just in January.

Canonical values: `DEPLOYMENT_RATES_2026` in `src/data/deployment/2026/constants.ts`
(`hfp`, `idp`, `idpDaily`, `hdpLevels`, `ratesEffectiveDate`). The deployment
calculator page and component read these; the items below hard-code them inline.

- [ ] **HFP $450 / IDP $275 / IDP $9.16/day / HDP-L tiers $50–$100** — inline in:
  - `src/content/blog/deployment-pay-explained.mdx` (answer block, QA, HFP/IDP and HDP sections, E-6 table)
  - `src/content/blog/deployment-financial-planning.mdx` (QA, CZTE list, IDP section, 9-month total, monthly table total)
  - `src/content/blog/how-deployment-pay-works.mdx`
  - `src/content/blog/how-to-read-your-les.mdx` (HFP/IDP and HDP entries, abbreviation table)
  - `src/content/blog/roth-tsp-deployment-strategy.mdx` (pay table + monthly cash total)
  - `POST_FAQS` "How much is Hostile Fire Pay" in `src/app/blog/[slug]/page.tsx`
  - `public/llms.txt` — three deployment blog entries
  - `scripts/add_answer_blocks.py`, `scripts/add_calc_guide_answers.py` (generator text)
- [ ] **Officer CZTE cap** (`officerCZTECap`) — PENDING: still built on the
  pre-October $225 HFP/IDP; unconfirmed whether it tracks HFP ($450) or IDP ($275).

## Notes

- The `llms.txt` Blog entries for both posts embed a headline dollar figure —
  update those too (`public/llms.txt`).
- The FAQ answers for the O-3 post live in `POST_FAQS` in
  `src/app/blog/[slug]/page.tsx` and also embed dollar figures — update them
  alongside the post.
- Figures traced from a lib lookup alone are a hypothesis until confirmed
  against the official source (DFAS pay table, DTMO ASCII, DoD BAS page). See
  the Accuracy Conventions in `CLAUDE.md`.
