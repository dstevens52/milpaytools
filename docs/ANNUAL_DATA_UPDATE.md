# Annual Data Update Checklist (every January)

All rate data updates annually in January when DoD/DFAS/DTMO/IRS publish new
figures. The data layer (`src/data/`) is designed for versioned annual
replacement. This file tracks **content that hard-codes dollar figures inline**
and therefore does NOT update automatically when the data layer is replaced —
each item below must be re-traced against the new source and revised by hand.

## Dollar figures in posts and guides (January 2027)

- [ ] After loading each 2027 dataset, run `npm run check:figures -- --next-year 2027` and work
  the list file by file. Recompute derived figures (annual totals, differences) in any file the
  list names.
  - Output: `docs/figures/year-change-2027.md`. It lists sources still skipped (no 2027 file
    yet), so re-run as each dataset lands. Add `--traffic <gsc-pages.csv>` to sort the worklist
    by Search Console clicks.
  - Baseline it compares against: `docs/figures/2026-baseline.md`. How it classifies figures:
    `docs/figures/README.md`.

## Basic pay table (January 2027)

- [ ] Replace docs/sources/dfas-2027-basic-pay.csv from the DFAS pages, add 2027.ts, point the
  pay-table test at the new year; the test must pass before merge.
  - DFAS pages, CSV format, and retrieval notes: `docs/sources/README.md`.
  - Test: `tests/e2e/pay-table-dfas.spec.ts` (`npm run test:pay-table`) — update its CSV path,
    its `src/data/pay-tables/` import, and the expected cell count if DFAS changes the table shape.

## CONUS COLA location list (January 2027)

The COLA calculator shows eligibility + the official index only — never a dollar amount — so
the yearly update is the location list itself.

- [ ] Download `cclocs{YY}.pdf` (e.g. `cclocs27.pdf`) from the DTMO CONUS COLA page:
  https://www.travel.dod.mil/Allowances/CONUS-Cost-of-Living-Allowance/ (year selector → new year).
- [ ] Write `docs/sources/conus-cola-locations-{YYYY}.md` in the same format as
  `conus-cola-locations-2026.md` (every MHA + index exactly as printed, URL, retrieval date,
  any County Cost Groups). The PDF governs over any announcement or third-party repost.
- [ ] Add `src/data/cola/{YYYY}/constants.ts` (`{ mhaCode, dtmoName, state, index }` per area,
  plus `COLA_SOURCE.sourceUrl` / `retrievedDate` / `rateLookupUrl`) and repoint imports from
  `src/data/cola/2026/constants.ts`. No dollar figures.
- [ ] Re-run the mapping check: each DTMO name → exactly one MHA code in the new year's
  `mhaNames` / `zipToMha`, confirmed against DTMO `mhanames{YY}.txt` / `sorted_zipmha{YY}.txt`
  (name match, ZIP count, one sample ZIP). Hold on any zero or multiple match.
- [ ] Update `tests/e2e/cola.spec.ts` (`OFFICIAL_2026` table typed from the source doc, sample
  ZIPs, not-eligible ZIPs, hero/worked-example expectations) and the COLA block in
  `tests/e2e/data-accuracy.spec.ts`. Check the station-page COLA tests still name a station in /
  out of the new list.
- [ ] `/calculators/cola` title, meta, OG/Twitter and JSON-LD use `DATA_YEAR` from the data file;
  confirm they read the new year. Hand-written area names in page copy
  (`src/app/calculators/cola/page.tsx` — Monterey, National Capital Region, Fort Bragg,
  Fort Hood; `src/content/blog/oconus-cola-trap.mdx`) must be re-checked against the new list.

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

## State military retirement tax check

- [ ] **State treatment of military retired pay** — `src/data/state-military-retirement-tax.ts`
  (used by the Transition Readiness calculator; planned 50-State Military Tax Guide imports it).
  - Re-open every record's `sourceUrl` (official state revenue source only — never values from
    memory or third-party summaries). Update `treatment`, `exemptionCap`/`exemptionPercent`,
    `conditionNote`, `taxYear`, and `lastVerified`.
  - Annual/indexed figures to re-check first: Idaho cap (resets yearly), New Mexico $30,000
    (set through TY2026 only), California $20,000 + AGI limits (TY2025–2029; watch SB 1407 or
    successors), Colorado $15,000 (through TY2028), Utah credit rate, Washington's 2028 tax.
  - `STATE_MILITARY_RETIREMENT_TAX_PENDING` is empty (all 50 states + DC verified 2026-11-11).
    A state moves into the dropdown only once an official state source confirms it.
  - Vermont military retirement thresholds ($125K/$175K) are fixed in statute and not indexed.
    Confirm 32 V.S.A. § 5830e(d) is unchanged each January. D.C.: confirm no new military
    retirement exclusion in § 47-1803.02.
  - Also re-check the federal brackets/standard deductions in `src/data/constants.ts` for all
    three filing statuses (`FED_TAX_BRACKETS_SINGLE`/`_MFJ`/`_HOH`, `STANDARD_DEDUCTION_*`)
    against the new IRS Rev. Proc., and update the literal tables in
    `tests/e2e/transition-readiness-unit.spec.ts` to match.
  - The Transition Readiness worked example (`src/lib/calculations/transition-readiness-example.ts`)
    flows into the calculator page and the "Are you financially ready" post automatically, but
    `public/llms.txt` quotes its surplus as text — the unit spec fails until llms.txt is updated.

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

## Calculator page titles with the year

Titles include "2026". The January annual update must switch them to 2027 on the same day the 2027 figures go live.

- [ ] `/calculators/pcs`, `/calculators/deployment`, `/calculators/dual-military-bah`,
  `/calculators/total-compensation` — `title`, `openGraph.title`, `twitter.title`,
  meta/og/twitter descriptions, the JSON-LD `name`/`description`, and the `ogImage` card title
  in each `page.tsx`. Baseline and context: `docs/seo/2026-11-calculator-search-match.md`.

## Notes

- The `llms.txt` Blog entries for both posts embed a headline dollar figure —
  update those too (`public/llms.txt`).
- The FAQ answers for the O-3 post live in `POST_FAQS` in
  `src/app/blog/[slug]/page.tsx` and also embed dollar figures — update them
  alongside the post.
- Figures traced from a lib lookup alone are a hypothesis until confirmed
  against the official source (DFAS pay table, DTMO ASCII, DoD BAS page). See
  the Accuracy Conventions in `CLAUDE.md`.
