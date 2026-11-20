# Release day: 2027 BAH rates

DoD usually publishes next year's BAH in mid-December (2026 rates: Dec 11, 2025; 2025 rates:
Dec 13, 2024). Release day is the biggest traffic day of the year for `/bah` and the station
pages. The whole update is: **download the zip → one import command → flip one config → local
checks → draft PR (CI gate + preview) → merge → IndexNow.**

Rehearsed twice:
- **R1, 2026-11-13** (2026 package imported as 2027, every rate unchanged; throwaway local branch,
  no PR): proved import → switch → preview.
- **R2, 2026-11-20** (synthetic package with increases, 40 decreases, 10 unchanged, TX270 below
  its temporary rate and 3 remapped ZIPs incl. a station's; draft PR #69 "REHEARSAL — DO NOT
  MERGE", branch `rehearsal/bah-2027-r2`): exercised every year-over-year path, both title-test
  arms and the CI gate. Its fixes are in `fix/bah-release-day-r2`; this runbook is the corrected
  version.

Who does what: **Claude Chat** verifies sources and figures, **Claude Code** runs the steps, and
**Dan** merges.

**Testing follows CLAUDE.md "What runs where":** locally only `tsc`, lint, the data-only tests and
1–3 changed specs on Chromium. No local `npm run build`, full suite or Firefox/WebKit runs; the
gate is CI on the draft PR. (R1's "build + 1-worker tiered gate" steps are retired.)

**Rate-protection blocker: cleared** (R1, fixed by `feat/bah-2027-what-we-know`). All
rate-protection wording comes from `src/data/bah/rateProtection.ts`, and the TX270
temporary-increase question is resolved (step 5).

**Education stays on 2026 BAH until VA's August 1, 2027 rate change.** GI Bill MHA follows
`EDUCATION_BAH_YEAR` (`src/data/education/2026/constants.ts`), not `BAH_YEAR`. VA: "We use the
2026 rates to calculate the monthly payment you get between August 1, 2026, and July 31, 2027."
So on release day the education calculator and `/guides/education-benefits` keep showing 2026
BAH, correctly (R2: both pages byte-identical before and after the flip). Keep `'2026'` in
`BAH_RATES_BY_YEAR` (step 3 does). On **August 1, 2027**, with VA's 2027–28 rates: set
`EDUCATION_BAH_YEAR = '2027'` and update `EDUCATION_RATES`.

## Timings

Machine time measured in the rehearsals; human review steps are estimates.

| | Step | Who | R1 (Nov 13) | R2 (Nov 20) | Plan for release day |
|---|---|---|---|---|---|
| — | Pre-flight (below) | Code | — | — | 10 min, the morning DoD posts |
| 0 | (optional) "released" notice | Code | 5 min (est.) | 1 min 39 s (edit + 2 specs) | 10 min + CI |
| 1 | Download, record, place the package | Chat → Code | 1 min | 10 s (rehearsal package already generated) | 10 min |
| 2 | Import | Code | 2 s | 3 s | 1 min |
| 2 | Review the report + spot-check | Chat | (not run) | (not run) | 25–35 min |
| 3 | Year switch + registry + history row + llms.txt + `tsc` | Code | 1 min | 1 min 24 s, then 34 s to fix 2 `tsc` errors (fixed in R2) | 5 min |
| 4 | Fixture + release-day test updates + local checks | Chat (values), Code | fixture 15–30 min; 1-worker local gate 29 min | 2 min 26 s (fixture computed from the ASCII by script) | fixture 15–30 min; test updates 15 min; local checks 5 min |
| 5 | Push → Vercel preview | Code | ≈5 min | ≈1 min | 5 min |
| 5 | Push → CI `report` job | CI | (no CI then) | 13 min 21 s | 15 min |
| 5 | Preview review (both title arms, checks below) | Chat | 20–30 min | 20-station script: 1–2 min per mode | 20–30 min |
| 6 | Same week: figures, calendar, status | Code, Chat | 1–2 h | — | 1–2 h |
| 7 | January 1: notice off → IndexNow | Code | 15 min | (2027 mode audited: no new findings) | 15 min |
| 8 | August 1, 2027: GI Bill MHA | Code (Chat: VA rates) | 30 min | — | 30 min |

R2 zip-to-preview: 9 min 34 s machine time (R1: 41 min, 29 of them the local 1-worker gate);
zip-to-CI-result: 22 min. Release day adds the human review in steps 2, 4 and 5 (about
1–1.5 h). **Plan on 2 hours from DoD's posting to merge.**

## Pre-flight checklist (the morning DoD releases)

- [ ] `git pull` on `main`; `git status` clean; nothing listening on :3000.
- [ ] `npx tsc --noEmit -p .` and `npm run test:pay-table` pass on `main` (a broken main costs
      the first hour).
- [ ] `gh pr list` / `gh run list --branch main -L 3`: no CI run pending on main, no open PR
      touching `src/data/bah/`, `src/lib/calculations/bah*.ts`, `src/app/bah/` or the specs
      listed in step 4.
- [ ] Station title test: has the Dec 9 read-out decided `SERP_TEST_MODE`? If not, ask Dan
      before step 3 (see "Both title-test arms", step 5).
- [ ] Pay meta guard (`/pay` pages frozen until ~Dec 10): if release day is before it lifts, the
      BAH release changes `/pay`, `/pay/raise`, `/pay/dates` and every `/pay/[rank]` key-dates
      line. That's the guard's "official event" exception: tell Dan in the PR.
- [ ] Claude Chat has DoD's release URL and the DTMO package URL open.
- [ ] `data/sources/dtmo/2027/` does not exist yet; `src/data/bah/2027/` does not exist yet.

## 0. (Optional) DoD has posted but the import isn't live yet

If the import won't land within an hour or two, switch the existing notice to "released" first so
pages stop saying "not yet published". In `src/data/bah/2027-status.ts` set
`status: 'released'`, `releasedDate: 'YYYY-MM-DD'`, and, from DoD's release (Claude Chat
supplies both), `avgIncreasePct` (e.g. `4.5`; leave `null` if the release doesn't state one) and
`releaseSourceUrl`. Set `DATA_LAST_CHECKED` in `src/data/watch.ts` (it also dates `/pay/raise`,
`/pay/dates` and the rank pages: see the pay meta guard in the pre-flight). The `/bah` "#2027"
section then reads "2027 BAH rates are out" with the date (and the percent when it's set); the
station alert headline drops "when 2027 BAH … is published" (R2 fix); the `/pay` key-dates
calendar marks 2027 BAH official.

Local checks (Chromium), then a small draft PR:
`npx playwright test tests/e2e/bah-2027-notice.spec.ts tests/e2e/bah-2027-hub.spec.ts tests/e2e/bah-release-history.spec.ts --project=chromium --reporter=json`
and `npx playwright test tests/e2e/pay-raise-2027.spec.ts tests/e2e/key-dates-2027.spec.ts tests/e2e/pay-dates-page.spec.ts --project=chromium --reporter=json`.
(R2: before `fix/bah-release-day-r2` these failed 12 and 19 tests in released mode; after it,
30 passed + 2 skipped and 94 passed.) IndexNow after merge: `npm run bah:urls` (now includes
`/pay`, `/pay/raise`, `/pay/dates`).

## 1. Confirm the release, download and record the package (≈10 min)

- Claude Chat confirms DoD's release (DoD news release + DTMO BAH page
  https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/) and downloads the ASCII
  package with the built-in browser. 2026's was
  `https://www.travel.dod.mil/Portals/119/Documents/BAH/BAH_Rates_All_Locations_All_Pay_Grades/ASCII/BAH-ASCII-2026.zip`;
  expect the same path with 2027.
- Write `docs/sources/bah-2027.md` (same layout as `docs/sources/bah-2026.md`): URL, retrieval
  date, zip size in bytes, zip SHA-256, and the DoD release URL + date.
- Put the zip in `data/sources/dtmo/2027/` **and extract the four `.txt` files next to it**
  (`bahw27.txt`, `bahwo27.txt`, `sorted_zipmha27.txt`, `mhanames27.txt`, the layout of
  `data/sources/dtmo/2026/`), and commit all of them. The importer reads either, but
  `tests/e2e/mha-display-override.spec.ts` reads `mhanames27.txt` from
  `data/sources/dtmo/{BAH_YEAR}/` and fails on a zip-only folder (R2). `.gitattributes` keeps
  the bytes exact. Ignore any "old" files in the zip (e.g. `bahw27 - old.txt`).

## 2. Import (≈1 min) and review (≈25–35 min)

```bash
npm run bah:import -- --year 2027 --src data/sources/dtmo/2027
```

This writes `src/data/bah/2027/{zipToMha,mhaRates,mhaNames,zipPriorMha}.ts` and
`docs/sources/bah-2027-import-report.md` (vs the 2026 data **as shipped**, including the TX270
temporary increase). Nothing is written if validation fails. Use `--dry-run` for the report only.
`zipPriorMha.ts` (new in R2) lists every ZIP DTMO moved to a different MHA, with its 2026 MHA;
step 3 registers it.

The report has counts, MHAs added/removed, remapped ZIPs (and which station-page ZIPs moved),
the E-5 with-dependents % change distribution, the top/bottom 10, **"Temporary increase ending"**
(MHAs whose 2026 rates were a temporary increase, from the `temporary` block in
`src/data/bah/2026/midYearChanges.ts`: TX270; their lower cells are listed there and **not**
counted as decreases), every ordinary decrease (station-page MHAs listed), the station-page MHA
table, and 10 seeded sample cells.

- Claude Chat spot-checks the **10 sample cells** and **5 station MHAs** against the DTMO online
  BAH lookup and ticks them in the report. The lookup takes a **ZIP**, not an MHA code: use the
  report's "lookup ZIP" column for the samples, and these for the stations: Fort Bragg 28310
  (NC182), Fort Hood 76544 (TX286), San Diego 92134 (CA038), JBLM 98433 (WA311), Dyess 79607
  (TX270).
- If any MHA was **added, removed or renamed**, check it against the CONUS COLA list: COLA
  eligibility is keyed by MHA code (`src/data/cola/2026/constants.ts`).
- If any **station-page ZIP was remapped** ("Station-page ZIPs remapped" in the report): that
  station page will show a different MHA name and rates. Name it in the PR and check it on the
  preview (step 5). Its year-over-year figures and "the 2026 rate applies" line compare with the
  MHA the ZIP was paid under in 2026, once step 3 registers `zipPriorMha.ts` (R2: before that
  fix, the rehearsal's remapped Fairchild AFB showed the new MHA's 2026 rate, $2,748, instead
  of the $2,184 it was paid).
- The distribution in the report is a computed median, **not** DoD's national-average increase.
  Never use it as that figure.

**If the importer fails**, stop. It exits 1 on any format change: column count ≠ 28, non-numeric
or cents values, O-7..O-10 columns differing, MHA sets differing between with/without files,
missing names or rates, duplicate ZIPs or MHAs, ZIP count outside ±2% or MHA count outside ±5 of
2026. Paste the error list to Claude Chat to inspect the raw files. Don't "fix" by loosening a
tolerance unless Claude Chat confirms the change is real; `--zip-tolerance` / `--mha-tolerance`
print a loud warning into the report.

## 3. Flip the switch (≈5 min)

- `src/data/bah/registry.ts`:
  - import `./2027/mhaRates` into `BAH_RATES_BY_YEAR` (`'2027': rates2027`); drop `'2025'` and
    its import (the prior year is now 2026). **Keep `'2026'`**: it's the prior year and the GI
    Bill year (`EDUCATION_BAH_YEAR`) until August 1, 2027.
  - **move** the `BAH_LOOKUP_TABLES` entry to 2027 and register the remaps:
    `'2027': { zipToMha: zipToMha2027, mhaNames: mhaNames2027, priorMhaByZip: zipPriorMha2027 }`
    (`import { zipPriorMha as zipPriorMha2027 } from './2027/zipPriorMha';`), and delete the
    2026 zipToMha/mhaNames imports. Only one year's ZIP map may be registered; a test enforces
    it, and another fails if `zipPriorMha.ts` exists but isn't registered.
  - add `'2027': {}` to `BAH_MID_YEAR_CHANGES_BY_YEAR`. 2027 starts with no mid-year changes;
    TX270's 2026 temporary increase ends Dec 31, 2026 and the 2027 file supersedes it.
- `src/data/bah/current.ts`: `BAH_YEAR = '2027'`, `BAH_PRIOR_YEAR = '2026'`,
  `BAH_EFFECTIVE_NOTICE = true`.
- **2027 row of the release history** (DoD's national average increase + release date):
  add it to the table in `docs/sources/bah-release-history.md` **first**, then the same row at
  the top of `src/data/bah/releaseHistory.ts` (`ratesYear: 2027`, `avgIncreasePct`,
  `releasedDate`, `sourceUrl`, `sourceLabel`). **Only** the figure from DoD's release; Claude
  Chat supplies it with the source URL. `tests/e2e/bah-release-history.spec.ts` checks the two
  match. This one row feeds `NATIONAL_AVG_BAH_INCREASE` (station pages' "national average
  increase of X%"), the `/bah` "#2027" history table and FAQs, the `/bah/changes` tile, the
  sitemap's station dates and the `/pay` key-dates calendar.
  **If DoD's release states no percent,** leave the row out and set `BAH_2027_STATUS`
  (`status: 'released'`, `releasedDate`, `releaseSourceUrl`; step 0). The sitemap falls back to
  that date (R2: without either, `/sitemap.xml` returned 500, which fails the build).
- `src/data/bah/2027-status.ts`: if step 0 didn't, set `status: 'released'`, `releasedDate`,
  `avgIncreasePct`, `releaseSourceUrl` here (was step 6). Not required for correctness any more
  (the calendar reads the history row too, R2 fix), but it keeps every "status" reader in step.
- `npm run bah:llms` rewrites `public/llms.txt`'s BAH lines (hub, station lines, sources line)
  to the new year and ZIP count. `bah-release-day.spec.ts` fails until it's run.
- `npx tsc --noEmit -p .`: an unregistered year or a missing lookup table fails here. (R2: two
  specs compared `BAH_YEAR` to a `'2026'` literal and failed `tsc` after the flip; fixed.)

What flips by itself: every title (both title-test arms), meta description, H1, FAQ, JSON-LD,
OG image title, rate table, YoY ("vs 2026"), the decrease block, `/pay/[rank]` BAH lines, the
`/calculators` grid, the homepage BAH card (R2 fix), the blog callout default, `/bah/changes`,
and the ZIP lookup's cache key (`&y=2027`). The "2027 BAH rates: not yet published" notice and
its "When will…" FAQ disappear, and the station email alert reads "Get notified when BAH rates
change for {station}" (no year). Station pages and `/bah` show one line instead: "2027 rates
take effect January 1, 2027. Until then, the 2026 rate applies: $X for an E-5 with dependents."
The ZIP calculator shows "2026 rate (through Dec 31, 2026): $X" under each result. Station FAQs
say "Starting January 1, 2027, an E-5 with dependents at {station} will receive $X" while
`BAH_EFFECTIVE_NOTICE` is true. `/bah` "#2027" reads "2027 BAH rates are out". TX270 (Dyess)
shows the "temporary 2026 rates … expire December 31, 2026" paragraph instead of the
rate-protection paragraph, and its year-over-year line compares against the temporary rate.
The station "total pay by rank" section stays on 2026 pay **and** 2026 BAH, with "2027 totals
appear when the 2027 pay table is published" (R2: verified on 20 stations).

## 4. Test fixture + release-day test updates + local checks (≈40 min)

- Copy `tests/e2e/fixtures/bah-expected-2026.ts` to `bah-expected-2027.ts` and register it in
  `tests/e2e/fixtures/bah-expected.ts`. **Claude Chat supplies every value from the 2027 ASCII
  rows** (and the national median/rank from the report's data); never copy them from lib output.
  Without it, every BAH spec fails at load with "no expected fixture for 2027", by design.
- In the 2027 fixture, every `prior…` value is the **2026 rate as shipped** (Dyess/TX270 with
  its temporary increase), and `nationalAvgIncreasePct` is DoD's 2027 figure.
- **Tests that describe 2026 facts and need their 2027 equivalent on the day.** R2 ran the full
  CI gate on the flipped site: 57 distinct tests failed (×3 browsers), against about 11 listed
  here before. `fix/bah-release-day-r2` made the state-dependent ones follow the build's own
  mode (step-0 "released" wording, pending-only FAQs, history counts, the total-pay control, the
  `tsc` literals). What's left is the list below; update each in the release-day PR, with values
  from the 2027 ASCII rows.
  R2's second CI run (flipped site + the fixes): `{ "expected": 5211, "skipped": 36,
  "unexpected": 63, "flaky": 0 }` = 21 tests × 3 browsers, all below. Pick 2027 stations or
  values that match each test's intent; don't weaken the assertion.
  - `bah-changes-unit.spec.ts` (8): `:52` five-MHA accuracy chain (2025/2026 legs → 2026/2027
    legs, typed from the 2027 ASCII), `:89` stored 2026 = raw January file (TX270 note becomes
    `temporary-prior`), `:104` top-10 golden (`AL007` first), `:161` title/H1/scope "2026",
    `:171` FAQ release-timing answer, `:190` Dataset `temporalCoverage` "2025-01-01/2026-12-31",
    `:235` "no 2027 release row" fixture case, `:244` TX270 rate-protection-box line (it now
    appears, correctly).
  - `bah-station.spec.ts:189` decrease page (San Antonio), `:196` mixed page (Fort Bragg): written
    for 2026's signs; pick 2027 stations with a decrease and a mixed change.
  - `bah-rate-protection.spec.ts:91` Fort Bragg decrease paragraph and
    `station-first-screen.spec.ts:108` Fort Bragg E-4 without dependents fell: both assume
    Fort Bragg had a decrease; use a 2027 station that has one.
  - `deployment-math.spec.ts:278` outputs-hash golden (deployment reads BAH): regenerate the
    golden from the release-day build and say so in the PR.
  - `station-serp.spec.ts:67,112`, `station-serp-data.spec.ts:77,84,92,120`: the title test's
    2026 snapshot and B-title/description literals. Settle with the title-arm decision (step 5).
  - Rehearsal-only, not expected on the day: `mha-display-override.spec.ts:31` (needs
    `data/sources/dtmo/2027/mhanames27.txt`, step 1) and `sitemap-dates.spec.ts:35` (the
    rehearsal's release date was in the future).
- Local checks, Chromium only (CLAUDE.md): `npx tsc --noEmit -p .`; `npx eslint` on changed
  files; `npm run test:pay-table`, `npm run test:pay-raise`, `npm run test:figures`; the data-only
  BAH specs `BASE_URL=http://no-server.invalid npx playwright test tests/e2e/bah-release-day.spec.ts tests/e2e/bah-release-history.spec.ts tests/e2e/bah-changes-unit.spec.ts --project=chromium --reporter=json`;
  then 1–3 of the page specs you changed. No local build, full suite or Firefox/WebKit.

## 5. Draft PR → CI gate + preview → verify → merge → IndexNow (≈40 min)

- Push, open a **draft** PR. CI runs the full suite on all three browsers against a production
  build (R2: 13 min 21 s to the `report` job). The Vercel preview is on the commit's deployment
  status (R2: ≈1 min after push). Previews are noindexed and sit behind Vercel login, so Claude
  Chat's built-in browser must be signed in to Vercel.
- **Both title-test arms.** The station title test (`SERP_TEST_MODE` in
  `src/data/bah/serpTest.ts`) splits CONUS station pages into arm A (today's title + E-5
  description) and arm B (absolute title + rate-range description). Both flip to 2027 by
  themselves. On the preview check one page of each:
  - A, e.g. `/bah/dyess-afb`: title "Dyess AFB BAH Rates 2027 — Abilene, TX | MilPayTools";
    description "2027 BAH for Dyess AFB, TX (Abilene): E-5 with dependents $X/mo, without $Y/mo. …"
    with the 2027 figures.
  - B, e.g. `/bah/fort-bragg`: title "Fort Bragg BAH 2027: E-1 to O-7, With & Without
    Dependents" (no " | MilPayTools"); description "2027 BAH at Fort Bragg, NC (Fayetteville):
    $min–$max/mo across 24 pay grades. … the change from 2026 …" with the 2027 range.
  - Both: H1 "{name} BAH Rates 2027"; `og:title` and the `/api/og` image title say 2027.
  - `station-serp.spec.ts` / `station-serp-data.spec.ts` hold arm A byte-identical to a snapshot
    of main (2026), so they fail after the flip in any mode but 'all-b'. The Dec 9 read-out
    decides the mode (plan: `'all-b'` on release day); regenerate the snapshot or set the mode in
    the release-day PR, never both silently.
- **Station pages** (`/bah/fort-hood`, `/bah/dyess-afb`, a decrease page, an unchanged page, any
  remapped station from step 2): rate card and table are 2027; YoY "vs 2026" (▲/▼/"No change");
  decrease pages show "Already stationed here? Rate protection keeps your higher 2026 rate …";
  Dyess shows the temporary-increase-ended paragraph and no rate-protection line; "Until then,
  the 2026 rate applies: $X" (Dyess: $1,872, the temporary rate); FAQ 1 starts "Starting
  January 1, 2027 … will receive"; the total-pay section heading says "(2026)" with the pending
  line; HUD rent block says "(HUD FMR, FY2026)".
  The 20-station figure check from R2 (`scripts/rehearsal/station-diff.ts` on the rehearsal
  branch) compares every dollar figure on 20 pages with the ASCII files; port it to the real
  2027 folder if you want the same check on the day (it reads only the ASCII files).
- **Other pages:** `/bah` ("2027 BAH rates are out", "Until then, 2026 rates apply"), the ZIP
  calculator with 76549 (expect the "2026 rate (through Dec 31, 2026)" line), a remapped ZIP if
  any (its sub-line must show the old MHA's 2026 rate), `/calculators/dual-military-bah`,
  `/pay/raise` (BAH FAQ says "DoD published 2027 BAH rates on …"), a `/pay/[rank]` key-dates
  line, and `/calculators/education` (still 2026 BAH).
- `/bah/changes` flips with `BAH_YEAR` (no edits): check it reads 2026 → 2027, the national
  average tile shows DoD's 2027 figure, and Abilene/Dyess (TX270) is marked "The 2026 rate was
  DTMO's temporary increase…" with the temporary-increase line in the rate-protection box. Its
  sitemap `lastmod` is a fixed date in `src/data/lastReviewed.ts` (`PAGE_LAST_REVIEWED`): set
  `'/bah/changes'` to the merge date in the release-day PR (R2: it stayed 2026-11-18).
  Station `lastmod` follows the release date by itself.
- Transition tense: **fixed** (`feat/bah-2027-what-we-know`). Rate-protection wording: **fixed**
  (one source, `src/data/bah/rateProtection.ts`; `tests/e2e/bah-rate-protection.spec.ts` guards
  the old wording). TX270 temporary increase: **resolved** (Claude Chat, 2026-11-13;
  `docs/sources/bah-2026-abilene-temporary-increase.md`).
- Claude Chat signs off → Dan marks the PR ready and merges (marking ready doesn't re-run CI).
  Then:

```bash
npm run bah:urls     # writes bah-urls.json: { "urls": [...] }
curl -X POST https://www.milpaytools.com/api/indexnow/submit \
  -H "Authorization: Bearer $INDEXNOW_SECRET" -H "Content-Type: application/json" \
  --data @bah-urls.json
```

(Git Bash: `MSYS_NO_PATHCONV=1`.) If the site answers `403` with `X-Vercel-Mitigated: challenge`
(seen for two hours on 2026-11-18), POST `{host, key, urlList}` straight to
`https://api.indexnow.org/indexnow` instead (the same request the route makes). The list covers `/`, `/bah`, `/bah/changes`,
every CONUS station page, `/pay`, `/pay/raise`, `/pay/dates`, the rank pages, the calculators
and guides that read BAH, and blog posts with the default BAH callout; `bah-release-day.spec.ts`
now follows imports transitively, so a page that starts reading the BAH status can't be missed.
Then Search Console "Request Indexing" for `/bah` and the top station pages.

**Alert email (Dan, after the release-day PR merges and production shows 2027 rates).** Station
pages collect signups with `utm_campaign` = `bah-alert-{station slug}` (Beehiiv, via
`/api/subscribe`). Send **one** email from Beehiiv:
- **Audience:** subscribers whose UTM campaign starts with `bah-alert-`. If the Beehiiv plan
  can't segment by UTM campaign, send it to the whole list.
- **Content:** 2027 BAH rates are published and every station page on the site shows them; link
  to `https://www.milpaytools.com/bah`. One email for everyone: don't promise or send
  per-station emails.

## 6. Same week (≈1–2 h)

- `npm run check:figures -- --next-year 2027` for inline BAH figures in blog posts and guides;
  work the list (`docs/figures/year-change-2027.md`). R2: on the synthetic data it listed 203
  BAH-only figures in 28 files, **all marked weak** (a figure that happens to equal some BAH
  cell, e.g. the $4,500 Tuition Assistance cap). Work the posts with 2026 BAH figures in their
  title or body first (`bah-rates-2026-complete-guide`, `best-worst-bah-duty-stations-2026`,
  `the-47000-gap-bah-duty-station`, `dual-military-bah-rules`, the E-5/O-3 "really make" posts,
  `/guides/military-pay`); GI Bill housing figures stay on 2026 (`EDUCATION_BAH_YEAR`).
- Calendar: the 2027 BAH entry in `src/data/calendar-2027.ts` reads the history row (R2); nothing
  to edit unless the date needs a note.
- `/pay` approximate BAH ranges (`BAH_RANGES` in
  `src/components/calculators/pay-charts/PayChartsClient.tsx`, typed "2026 approximate
  values"): re-check against 2027. *Backlog: replace with values computed from the data.*
- `/guides/military-pay` reads the legacy 50-ZIP table `src/data/bah-rates/2026.ts`: update its
  figures for 2027. *Backlog: retire this duplicate dataset and read the registry instead.*

## 7. January 1, 2027 (≈15 min)

- `src/data/bah/current.ts`: `BAH_EFFECTIVE_NOTICE = false`. Static flag, never a date check.
  This removes the "Until then…" line and the ZIP calculator's 2026 sub-line, the API stops
  returning prior-year rates, and station FAQs switch to "For 2027, … receives" (R2: audited on
  20 stations, every figure matched).
- Local: Chromium on `bah-release-day`, `bah-station`, `bah`, `api-bah-lookup`; draft PR (CI);
  merge; `npm run bah:urls` → IndexNow.

## 8. August 1, 2027: GI Bill year

- VA's 2027–28 Post-9/11 rates take effect and use 2027 BAH. In `src/data/education/2026/constants.ts`
  (or a new `2027/` folder): `EDUCATION_BAH_YEAR = '2027'` and the new `EDUCATION_RATES`, with
  VA's source. Local Chromium on `education`, `bah-release-day`; draft PR; IndexNow
  `/calculators/education` and `/guides/education-benefits`.

## Reference

- Year switch: `src/data/bah/current.ts`. Registry (the only importer of year folders):
  `src/data/bah/registry.ts`. Transition copy: `src/lib/calculations/bahTransition.ts`.
- Remapped ZIPs: `src/data/bah/{year}/zipPriorMha.ts` (importer output) →
  `BAH_LOOKUP_TABLES[year].priorMhaByZip` → `priorYearMhaForZip()` in
  `src/lib/calculations/bah.ts`. Every prior-year figure about a place uses it.
- Release date for data dates: `src/lib/bahReleaseDate.ts` (history row, else
  `BAH_2027_STATUS.releasedDate`).
- The lookup API (`/api/bah/lookup`) is cached immutably only for `?y=<BAH_YEAR>`; a request
  without `y` or with another year gets current data with `no-store`. The client sends
  `y=BAH_YEAR`, so a flip changes every lookup URL. Nothing to purge.
- Importer: `scripts/bah-import.mjs`; URL list: `scripts/bah-urls.mjs`; llms.txt:
  `scripts/bah-llms.mjs`. The 2026 regen check (`bah-release-day.spec.ts`) re-imports
  `data/sources/dtmo/2026/` and expects only TX270 to differ.
- Rehearsal tooling (branch `rehearsal/bah-2027-r2` only, never merged):
  `scripts/rehearsal/make-fake-dtmo-2027.ts` (synthetic package), `station-diff.ts` (20-station
  figure check), `surface-dump.ts` (head/H1/JSON-LD/text of 41 BAH-reading pages, for diffing
  modes).
- Mid-year changes during 2027: `docs/ANNUAL_DATA_UPDATE.md` → "Mid-year BAH changes".
