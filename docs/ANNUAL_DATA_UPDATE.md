# Annual Data Update Checklist (every January)

All rate data updates annually in January when DoD/DFAS/DTMO/IRS publish new
figures. The data layer (`src/data/`) is designed for versioned annual
replacement. This file tracks **content that hard-codes dollar figures inline**
and therefore does NOT update automatically when the data layer is replaced —
each item below must be re-traced against the new source and revised by hand.

## BAH rates (DoD release, mid-December)

- [ ] Follow **`docs/RELEASE_DAY_BAH_2027.md`**: download the DTMO zip → `npm run bah:import` →
  flip `src/data/bah/current.ts` → gate → merge → IndexNow, then `BAH_EFFECTIVE_NOTICE = false`
  on January 1. BAH titles, FAQs, counts and labels follow `BAH_YEAR`; nothing to hand-edit.
- [ ] `/api/bah/lookup` responses are cached at the CDN for a year (`s-maxage=31536000, immutable`). The January data deploy must purge the edge cache (Vercel does this on deploy; confirm after release day). Browsers can hold a response for up to a day. (The year flip also changes every lookup URL through `?y=`, per `docs/RELEASE_DAY_BAH_2027.md`; a same-year data correction keeps the URL, so it relies on the deploy purge.)

## HUD Small Area Fair Market Rents — each fall (HUD publishes, usually late August)

Station pages compare BAH with HUD's 2-bedroom SAFMR. HUD posts the next fiscal year's file
(FY N, Oct. 1 of N−1 to Sept. 30 of N) on its Small Area FMR page, usually in late August, and
sometimes a revised file later.
- Claude Chat verifies the file and writes `docs/sources/hud-safmr-fy{N}.md` (URL, size, date).
- Download it **in a browser** (huduser.gov answers `curl` and other scripted downloads with an
  empty HTTP 202, seen 2026-11-20), then copy it to `data/sources/hud/` (gitignored). Check the
  size against the source doc and record its SHA-256 there.
- `python scripts/build-fmr-data.py --year N --src data/sources/hud/<file>.xlsx` writes
  `src/data/bah/fmr/fmr{N}.ts`; register it in `FMR_BY_YEAR` (`src/lib/calculations/fmr.ts`) and
  extend `tests/e2e/bah-fmr.spec.ts`.
- Pairing is automatic: BAH year N shows HUD FY N (`fmrYearForBahYear`), so pages switch on BAH
  release day, not when the HUD file loads. A BAH year with no loaded FMR year shows no rent
  section (no fallback), so load FY N before DoD's December release.
- On BAH release day, regenerate `fmr{N}.ts` with year N's ZIP map
  (`docs/RELEASE_DAY_BAH_2027.md`, step 3).

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

## Military retiree COLA — October (SSA announcement)

- [ ] When SSA announces the next COLA (mid-October), add `src/data/retiree-cola/{YYYY}.ts` from
  `RETIREE_COLA_2027` (percent, effective Dec 1, SSA announcement date, sources) and repoint
  `src/lib/calculations/payRaise.ts`. Retired pay first reflects the COLA in the December
  entitlement, paid on DFAS's retired pay date for December (`firstRetiredPayDate`; annuitants:
  `firstAnnuitantPayDate`). Check DFAS's pay schedule each year
  (https://www.dfas.mil/RetiredMilitary/manage/payschedule/); it is not SSA's January timing. 10 U.S.C. 1401a(b) uses the same
  CPI-W increase; the REDUX figure is computed (percent − 1), never typed. Record the source in
  `docs/sources/` (see `pay-raise-cola-2027.md`).

## VA disability compensation rates — November/December (VA publishes)

- [ ] The new rates take effect December 1 and need the annual veterans' COLA law. Track it in
  `src/data/va-rates/{YYYY}-status.ts` (`'law-pending'` → `'law-enacted'` → `'published'`,
  `checkedDate`, `lawCitation`). While pending, the calculator shows a dated notice and the prior
  year's table; never a projected figure.
- [ ] When VA.gov shows the new tables: copy every cell into `src/data/va-rates/{YYYY}.ts`
  (header: URL + date fetched; `colaPercent`; `fetchedDate`) and set the status to
  `'published'`. Data-only — no component edits. `tests/e2e/va-rates-registry.spec.ts` then
  runs its typo check (each cell vs. the prior cell × (1 + COLA), about a dollar of tolerance):
  a miss means compare with VA.gov, never adjust the figure.
- [ ] `src/data/va-rates/registry.ts` switches the calculator, retirement, transition readiness
  and the rate table on the effective date, using the BUILD date (`BUILD_DATE` in
  `next.config.ts`). If the data lands before December 1, redeploy production on December 1.
  The calculator's title and copy follow the registry year; no hand edits.
- [ ] For the following year: add the next `{YYYY}.ts` placeholder (`vaRates: null`) and status
  file, and point the registry at them.

## FHFA conforming loan limits — late November (FHFA announces) and January 1 (build V2)

VA home loan limits are FHFA's conforming loan limits (One-Unit column). The VA entitlement
calculator (`/calculators/va-entitlement`) and `<VaEntitlementFigure>` in posts read them.

1. **When FHFA announces next year's limits (late November):** Claude Chat writes the source note
   (baseline, ceiling, AK/HI/GU/VI range, county CSV URL), like `docs/sources/va-entitlement-loan-limits-2027.md`.
   Download the county CSV into `data/sources/fhfa/` (exact bytes; `-text` in `.gitattributes`), add the
   year's expected values to `EXPECTED` in `scripts/build-loan-limits.py`, then run
   `python scripts/build-loan-limits.py --year YYYY --downloaded YYYY-MM-DD`. It fails if the most common
   value isn't the baseline or the highest value outside AK/HI/GU/VI isn't the ceiling.
2. Register the year in `src/data/va-loan/loanLimitYear.ts` (`LOAN_LIMIT_SUMMARIES` and `loadLoanLimits`).
   The calculator then shows both years ("Closing in YYYY (from Jan. 1)") until the flip.
3. **January 1:** set `LOAN_LIMIT_YEAR` to the new year (one year shown; post figures move to it). Bump
   `CALCULATOR_LAST_REVIEWED['va-entitlement']` and the `updated` date of posts that use
   `<VaEntitlementFigure>`; update the year expectations in `tests/e2e/va-entitlement*.spec.ts`; IndexNow.
   The oldest year's files can be removed once nothing reads them.

## TRICARE costs — November (DHA publishes) and January 1

- [ ] Each November DHA publishes the next calendar year's TRICARE Prime/Select costs in the
  Federal Register ("TRICARE; Calendar Year (CY) {YYYY} TRICARE Prime and TRICARE Select
  Out-of-Pocket Expenses") and on tricare.mil/comparecosts (premium plans: TRS, TRR, TYA), with
  Open Season dates and the official civilian comparison on tricare.mil/openseason. Record every
  figure with its source in `docs/sources/tricare-costs-{YYYY}.md` (template:
  `tricare-costs-2027.md`).
- [ ] Add `src/data/tricare/{YYYY}/costs.ts` (same `TricareCosts` shape, `src/data/tricare/types.ts`)
  and `{YYYY}/openSeason.ts`; register the year in `TRICARE_COSTS_BY_YEAR`
  (`src/data/tricare/current.ts`). A figure missing from the official source stays at the prior
  year with a dated "pending" note; never filled any other way. The healthcare comparison shows
  the next year's TRS premiums as a note automatically once the file exists.
- [ ] Update the TRICARE costs post (`/blog/tricare-costs-2026-vs-civilian`; slug kept) to the new
  year pair, and its POST_FAQS (built from `src/lib/tricarePost.ts`).
- [ ] Open Season status: `'open'` from the start date; set `OPEN_SEASON_{YYYY}_STATUS = 'closed'`
  the day after it ends (the post's Open Season section and FAQ switch wording).
- [ ] **January 1:** flip `TRICARE_COST_YEAR` in `src/data/tricare/current.ts`. That moves the
  healthcare comparison (TRS path + page example), the guard-reserve TRS figures (once they read
  `current.ts`; today they read `TRICARE_RATES_2026`, derived from `2026/costs.ts`) and the TAMP
  post's TRS figures. Recheck CHCBP premiums (not in the TRICARE year files).

## Key dates calendar — October

- [ ] Each October, create `calendar-{next year}.ts` from the same template
  (`src/data/calendar-2027.ts`): same entry type and statuses (official / expected / pending),
  weekdays computed in UTC, the raise row from the pay-raise config, COLA figures from the
  retiree-COLA file, BAH from the BAH status file. Recheck every date and source first and record
  them in `docs/sources/calendar-{next year}.md`. Point `KeyDates2027` (rename it) and the
  /pay/raise FAQs at the new file. No projected figures (TSP limits, BAS, BAH percent).

## Mid-year BAH changes — quarterly, NOT January-only

DTMO can change BAH for individual MHAs mid-year. Case: TX270 (Abilene/Dyess AFB), "2026 Abilene
Temporary Increase (Effective 05/16/2026)", missed until 2026-11-12 and understating every Dyess
lookup by about $200–$600/month (`docs/sources/bah-2026-abilene-temporary-increase.md`).

- [ ] Each quarter (Feb, May, Aug, Nov), download the current DTMO ASCII package
  (`BAH-ASCII-{YYYY}.zip`) and diff `bahw{YY}.txt` / `bahwo{YY}.txt` against
  `src/data/bah/{YYYY}/mhaRates.ts` for every MHA and grade. Also look for "old" files in the zip.
  Shortcut: `npm run bah:import -- --year {YYYY} --src <zip> --out <scratch dir>`, then diff the
  scratch `mhaRates.ts` against `src/data/bah/{YYYY}/mhaRates.ts`.
- [ ] Check the DTMO BAH year selector for options other than the plain year (e.g. "Temporary
  Increase").
- [ ] For any changed MHA: write a source record in `docs/sources/` (old vs current, raw rows),
  update only that MHA in `mhaRates.ts` with a comment citing it, add it to
  `src/data/bah/{YYYY}/midYearChanges.ts` (drives the station-page line and effective date), and
  add a data test plus an "every other MHA unchanged" checksum test like
  `tests/e2e/bah-tx270.spec.ts`. Run `npm run check:figures -- --baseline` and the full gate.

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
  - `src/content/blog/how-to-read-your-les.mdx` (HFP/IDP and HDP entries, abbreviation table)
  - `src/content/blog/roth-tsp-deployment-strategy.mdx` (pay table + monthly cash total)
  - `public/llms.txt` — two deployment blog entries (the third, `how-deployment-pay-works`, was
    merged into `deployment-pay-explained` and redirected in S7, Nov 2026; its "How much is Hostile
    Fire Pay" `POST_FAQS` entry went with it)
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
BAH pages (`/bah`, `/bah/[slug]`, `/calculators/dual-military-bah`) follow `BAH_YEAR` in
`src/data/bah/current.ts` and flip on BAH release day; no hand edits.

- [ ] `/calculators/pcs`, `/calculators/deployment`,
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
