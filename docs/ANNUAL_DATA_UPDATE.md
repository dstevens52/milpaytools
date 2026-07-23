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

## Notes

- The `llms.txt` Blog entries for both posts embed a headline dollar figure —
  update those too (`public/llms.txt`).
- The FAQ answers for the O-3 post live in `POST_FAQS` in
  `src/app/blog/[slug]/page.tsx` and also embed dollar figures — update them
  alongside the post.
- Figures traced from a lib lookup alone are a hypothesis until confirmed
  against the official source (DFAS pay table, DTMO ASCII, DoD BAS page). See
  the Accuracy Conventions in `CLAUDE.md`.
