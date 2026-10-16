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
  - `src/content/blog/hfp-idp-hdpl-rate-changes-october-2026.mdx` — the whole post is about this
    change. Current: HFP $450, IDP $275, $9.16/day, HDP-L $50/$100. Prior (historical, keep):
    HFP/IDP $225 (since Oct 2002, per DoD release), top HDP-L $150. Derived arithmetic: +$225/mo
    & $2,700/yr (HFP), +$50/mo & $600/yr (IDP), −$50/mo & $600/yr (top-tier HDP-L, no HFP/IDP),
    $275 + $100 = $375 (shown only as exceeding the $325 ceiling), proration table
    $91.60 / $137.40 / $183.20, 30 × $9.16 = $274.80 (not $275), "$175" (HFP − IDP) in the
    calculator note. From FMR Ch. 17 (not the data layer): $100 HDP-L limit and $325 combined
    ceiling (para. 3.1), "$225 for HFP or IDP" (Table 17-1 Note 3) — re-check these against the
    next Ch. 17 revision. Same figures in its `POST_FAQS` entry in `src/app/blog/[slug]/page.tsx` and its
    `public/llms.txt` entry. On the next rate change, update or retire this post rather than
    silently editing — it is a dated explainer of the Oct 2026 change.
  - `src/content/blog/deployment-pay-explained.mdx` (answer block, QA, HFP/IDP and HDP sections, E-6 table)
  - `src/content/blog/deployment-financial-planning.mdx` (QA, CZTE list, IDP section, 9-month total, monthly table total)
  - `src/content/blog/how-deployment-pay-works.mdx`
  - `src/content/blog/how-to-read-your-les.mdx` (HFP/IDP and HDP entries, abbreviation table)
  - `src/content/blog/roth-tsp-deployment-strategy.mdx` (pay table + monthly cash total)
  - `POST_FAQS` "How much is Hostile Fire Pay" in `src/app/blog/[slug]/page.tsx`
  - `public/llms.txt` — three deployment blog entries
  - `scripts/add_answer_blocks.py`, `scripts/add_calc_guide_answers.py` (generator text)
- [x] **Prior HDP-L combined-payment cap** — CLOSED 2026-10-16. Confirmed from
  `docs/sources/fmr-vol7a-ch17-hdpl.pdf`: DoD 7000.14-R Vol. 7A, Ch. 17, "Special Pay – Hardship
  Duty," December 2024 revision (location table updated August 2025). Para. 3.1: "When a member
  is in receipt of Hostile Fire Pay (HFP) or Imminent Danger Pay (IDP), then the maximum amount of
  HDP – L is $100. The total entitlement of HDP – L plus HFP or IDP in any 1 month may not exceed
  $325." Repeated in Table 17-2 Rules 5 and 10 and Table 17-1 Note 3. Authority (chapter
  references): ASD (M&RA) Memo, September 26, 2017 — policy, not statute.
- [ ] **HDP-L combined limit under the October 2026 rates** — PENDING: Ch. 17 predates the change.
  Its $325 ceiling (= old $225 + $100) is below HFP $450 alone and below IDP $275 + $100 = $375,
  and Table 17-1 Note 3 still names "$225 for HFP or IDP." Watch for a Ch. 17 revision or ASW
  (M&RA) memo stating the new combined maximum. When it appears: update the post's combined-limit
  section, and decide whether the deployment calculator should model the limit (it currently adds
  HDP-L to IDP with no combined cap — `src/lib/calculations/deployment.ts`).
- [ ] **IDP for a whole calendar month** — PENDING: the memo states $275/month prorated at
  $9.16/day but not how a whole month is paid (30 × $9.16 = $274.80). FMR Vol. 7A Ch. 10 (October
  2024; `docs/sources/fmr-vol7a-ch10-hfp-idp.pdf`) para. 2.2 says IDP is "payable on a prorated
  daily basis not to exceed a monthly rate" and that proration "does not apply to the 31st of a
  month" for members on active duty 30+ days, but was written for the $225 rate. Resolve when
  Ch. 10 is revised; until then the post hedges.
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
