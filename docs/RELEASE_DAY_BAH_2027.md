# Release day: 2027 BAH rates

DoD usually publishes next year's BAH in mid-December (2026 rates: Dec 11, 2025; 2025 rates:
Dec 13, 2024). Release day is the biggest traffic day of the year for `/bah` and the station
pages. The whole update is: **download the zip → one import command → flip one config → build,
test, preview → merge → IndexNow.** Rehearsed on `rehearsal/bah-2027` (see the PR for timings).

Who does what: **Claude Chat** verifies sources and figures, **Claude Code** runs the steps, and
**Dan** merges.

**Rate-protection blocker: cleared** (found in the 2026-11-13 rehearsal, fixed by
`feat/bah-2027-what-we-know`). All rate-protection wording now comes from
`src/data/bah/rateProtection.ts`, and the TX270 temporary-increase question is resolved
(step 5 below).

**Education stays on 2026 BAH until VA's August 1, 2027 rate change.** GI Bill MHA follows
`EDUCATION_BAH_YEAR` (`src/data/education/2026/constants.ts`), not `BAH_YEAR`. VA: "We use the
2026 rates to calculate the monthly payment you get between August 1, 2026, and July 31, 2027."
So on release day the education calculator and `/guides/education-benefits` keep showing 2026
BAH, correctly. Keep `'2026'` in `BAH_RATES_BY_YEAR` (step 3 does). On **August 1, 2027**, with
VA's 2027–28 rates: set `EDUCATION_BAH_YEAR = '2027'` and update `EDUCATION_RATES`.

Measured in the rehearsal (machine time; the human review steps are estimates):

| | Step | Who | Time |
|---|---|---|---|
| 0 | (optional) "released" notice while the import is in progress | Code | 5 min |
| 1 | Download, record and place the DTMO package | Chat → Code | 10 min (rehearsal: 1 min) |
| 2 | Import + review the report + spot-check | Code, Chat | import 2 s; review + spot-check 25–35 min |
| 3 | Flip the year switch + registry + national average + llms.txt | Code (Chat supplies the %) | 5 min (rehearsal: 1 min incl. type check) |
| 4 | 2027 test fixture + build + tiered gate | Chat (values), Code | fixture 15–30 min; build 1 min; gate 30 min at 1 worker |
| 5 | Preview → verify → rate-protection check → merge → IndexNow | Code, Chat, Dan | preview ≈5 min after push; review 20–30 min |
| 6 | Same week: figures, calendar, status | Code, Chat | 1–2 h |
| 7 | January 1: notice off → IndexNow | Code | 15 min |
| 8 | August 1, 2027: GI Bill MHA moves to 2027 BAH (`EDUCATION_BAH_YEAR`) | Code (Chat: VA rates) | 30 min |

Rehearsal (2026-11-13), zip to preview: 41 min wall clock, of which the 1-worker gate was 29 min
and the rehearsal's own fixes about 8 min. Release day adds the human review in steps 2, 4 and 5
(about 1–1.5 h), so plan on 2 hours from DoD's posting to merge.

## 0. (Optional) DoD has posted but the import isn't live yet

If the import won't land within an hour or two, switch the existing notice to "released" first so
pages stop saying "not yet published". In `src/data/bah/2027-status.ts` set
`status: 'released'`, `releasedDate: 'YYYY-MM-DD'`, and, from DoD's release (Claude Chat
supplies both), `avgIncreasePct` (e.g. `4.5`; leave `null` if the release doesn't state one) and
`releaseSourceUrl`. Set `DATA_LAST_CHECKED` in `src/data/watch.ts`. The `/bah` "#2027" section
then reads "2027 BAH rates are out" with the date (and the percent when it's set). Small PR,
`npm run test:e2e -- tests/e2e/bah-2027-notice.spec.ts tests/e2e/bah-2027-hub.spec.ts --project=chromium`.

## 1. Confirm the release, download and record the package (≈10 min)

- Claude Chat confirms DoD's release (DoD news release + DTMO BAH page
  https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/) and downloads the ASCII
  package with the built-in browser. 2026's was
  `https://www.travel.dod.mil/Portals/119/Documents/BAH/BAH_Rates_All_Locations_All_Pay_Grades/ASCII/BAH-ASCII-2026.zip`;
  expect the same path with 2027.
- Write `docs/sources/bah-2027.md` (same layout as `docs/sources/bah-2026.md`): URL, retrieval
  date, zip size in bytes, zip SHA-256, and the DoD release URL + date.
- Put the zip in `data/sources/dtmo/2027/` and commit it. The raw files are the source of record;
  `.gitattributes` keeps their bytes exact. The importer reads the zip directly (no unzip needed),
  or the four `.txt` files if you extract them there.

## 2. Import (≈1 min) and review (≈25–35 min)

```bash
npm run bah:import -- --year 2027 --src data/sources/dtmo/2027
```

This writes `src/data/bah/2027/{zipToMha,mhaRates,mhaNames}.ts` and
`docs/sources/bah-2027-import-report.md` (vs the 2026 data **as shipped**, including the TX270
temporary increase). Nothing is written if validation fails. Use `--dry-run` for the report only.

The report has counts, MHAs added/removed, remapped ZIPs, the E-5 with-dependents % change
distribution, the top/bottom 10, **"Temporary increase ending"** (MHAs whose 2026 rates were a
temporary increase, from the `temporary` block in `src/data/bah/2026/midYearChanges.ts`: TX270;
their lower cells are listed there and **not** counted as decreases), every ordinary decrease
(station-page MHAs listed), the station-page MHA table, and 10 seeded sample cells.

- Claude Chat spot-checks the **10 sample cells** and **5 station MHAs** against the DTMO online
  BAH lookup and ticks them in the report. The lookup takes a **ZIP**, not an MHA code: use the
  report's "lookup ZIP" column for the samples, and these for the stations: Fort Bragg 28310
  (NC182), Fort Hood 76544 (TX286), San Diego 92134 (CA038), JBLM 98433 (WA311), Dyess 79607
  (TX270).
- If any MHA was **added, removed or renamed**, check it against the CONUS COLA list: COLA
  eligibility is keyed by MHA code (`src/data/cola/2026/constants.ts`).
- If any **station-page ZIP was remapped**, note it for the PR.
- The distribution in the report is a computed median, **not** DoD's national-average increase.
  Never use it as that figure.

**If the importer fails**, stop. It exits 1 on any format change: column count ≠ 28, non-numeric
or cents values, O-7..O-10 columns differing, MHA sets differing between with/without files,
missing names or rates, duplicate ZIPs or MHAs, ZIP count outside ±2% or MHA count outside ±5 of
2026. Paste the error list to Claude Chat to inspect the raw files. Don't "fix" by loosening a
tolerance unless Claude Chat confirms the change is real; `--zip-tolerance` / `--mha-tolerance`
print a loud warning into the report. The zip may also contain "old" files (e.g.
`bahw27 - old.txt`); only the exact names `bahw27.txt`, `bahwo27.txt`, `sorted_zipmha27.txt` and
`mhanames27.txt` are read.

## 3. Flip the switch (≈5 min)

- `src/data/bah/registry.ts`:
  - import `./2027/mhaRates` into `BAH_RATES_BY_YEAR` (`'2027': rates2027`); drop `'2025'` and
    its import (the prior year is now 2026). **Keep `'2026'`**: it's the prior year and the GI
    Bill year (`EDUCATION_BAH_YEAR`) until August 1, 2027.
  - **move** the `BAH_LOOKUP_TABLES` entry to 2027
    (`'2027': { zipToMha: zipToMha2027, mhaNames: mhaNames2027 }`) and delete the 2026
    zipToMha/mhaNames imports. Only one year's ZIP map may be registered; a test enforces it.
  - add `'2027': {}` to `BAH_MID_YEAR_CHANGES_BY_YEAR`. 2027 starts with no mid-year changes;
    TX270's 2026 temporary increase ends Dec 31, 2026 and the 2027 file supersedes it.
- `src/data/bah/current.ts`: `BAH_YEAR = '2027'`, `BAH_PRIOR_YEAR = '2026'`,
  `BAH_EFFECTIVE_NOTICE = true`.
- **2027 row of the release history** (DoD's national average increase + release date):
  add it to the table in `docs/sources/bah-release-history.md` **first**, then the same row at
  the top of `src/data/bah/releaseHistory.ts` (`ratesYear: 2027`, `avgIncreasePct`,
  `releasedDate`, `sourceUrl`, `sourceLabel`). **Only** the figure from DoD's release; Claude Chat
  supplies it with the source URL. `tests/e2e/bah-release-history.spec.ts` checks the two match.
  This one row feeds `NATIONAL_AVG_BAH_INCREASE` (station pages' "national average increase of
  X%") and the `/bah` "#2027" history table and FAQs. If DoD's release states no percent, leave
  the row out and set only `BAH_2027_STATUS` (step 0).
- `npm run bah:llms` rewrites `public/llms.txt`'s BAH lines (hub, station lines, sources line)
  to the new year and ZIP count. Do it here: `bah-release-day.spec.ts` fails the step-4 gate until
  it's run.
- `npx tsc --noEmit`: an unregistered year or a missing lookup table fails here.

What flips by itself: every title, meta description, FAQ, JSON-LD, OG footer, rate table, YoY
("2026 → 2027"), the decrease block, `/pay/[rank]` BAH lines, the `/calculators` grid, the
blog callout default, and the ZIP lookup's cache key (`&y=2027`). The "2027 BAH rates: not yet
published" notice and its "When will…" FAQ disappear, and the station email alert reads
"Get notified when BAH rates change for {station}" (no year). Station pages and `/bah` show one
line instead: "2027 rates take effect January 1, 2027. Until then, the 2026 rate applies: $X for
an E-5 with dependents." The ZIP calculator shows "2026 rate (through Dec 31, 2026): $X" under
each result. Station FAQs say "Starting January 1, 2027, an E-5 with dependents at {station} will
receive $X" while `BAH_EFFECTIVE_NOTICE` is true. `/bah` "#2027" reads "2027 BAH rates are out".
TX270 (Dyess) shows the "temporary 2026 rates … expire December 31, 2026" paragraph instead of
the rate-protection paragraph, and its year-over-year line compares against the temporary rate.

## 4. Test fixture + gate (≈30 min)

- Copy `tests/e2e/fixtures/bah-expected-2026.ts` to `bah-expected-2027.ts` and register it in
  `tests/e2e/fixtures/bah-expected.ts`. **Claude Chat supplies every value from the 2027 ASCII
  rows** (and the national median/rank from the report's data); never copy them from lib output.
  Without it, every BAH spec fails at load with "no expected fixture for 2027", by design.
- In the 2027 fixture, every `prior…` value is the **2026 rate as shipped** (Dyess/TX270 with
  its temporary increase), and `nationalAvgIncreasePct` is DoD's 2027 figure.
- Some 2026 assertions describe 2026 facts and may need the 2027 equivalent picked fresh. In the
  rehearsal (every 2027 rate = 2026 January, so every YoY was "unchanged") these failed only
  because of the fixture/data, on all three browsers:
  `bah-stats.spec.ts` (Fort Bragg rank, Fort Bragg YoY, "has a decrease" for Fort Bragg / San
  Antonio / Norfolk, both annualized changes), `bah-station.spec.ts` (Fort Bragg YoY card + FAQ,
  Norfolk "increase page", San Antonio "decrease page", Fort Bragg "mixed page") and
  `bah-release-day.spec.ts` (prior-year rate). `bah-station.spec.ts` is written for an increase
  at Fort Bragg and Norfolk and a decrease at San Antonio; pick 2027 stations that match, or
  adjust the sign.
- `npm run build`, then the tiered gate (CLAUDE.md, tier 2: affected specs on 3 browsers + full
  Chromium) plus `npm run test:pay-table`, `npm run test:pay-raise`, `npm run test:figures`.
  Use `--workers=1` if memory is tight (a 2-worker run was killed for low memory on 2026-11-13).
  Rehearsal times at 1 worker: full Chromium 9.5 min, BAH specs on Firefox 12.5 min, on WebKit
  6.5 min.
  `tests/e2e/bah-release-day.spec.ts` checks the registry, counts, importer and URL list.

## 5. Preview → verify → merge → IndexNow (≈20–30 min)

- Push, open the PR, get the Vercel preview (deployment status on the commit, ≈5 min). Previews
  sit behind Vercel login, so Claude Chat's built-in browser must be signed in to Vercel. Claude
  Chat checks `/bah`, `/bah/fort-hood`, `/bah/dyess-afb`, the ZIP calculator with 76549 (expect
  the "2026 rate (through Dec 31, 2026)" line under the result), and
  `/calculators/dual-military-bah`.
- Transition tense: **fixed** (`feat/bah-2027-what-we-know`). While `BAH_EFFECTIVE_NOTICE` is
  true, station FAQs say "Starting January 1, 2027, an E-5 with dependents at {station} will
  receive $X…" (`bahE5RateFaqAnswer` in `src/lib/calculations/bahTransition.ts`). Spot-check one
  station FAQ on the preview.
- Rate-protection wording: **fixed** (`feat/bah-2027-what-we-know`; Claude Chat's approved text).
  Per DTMO's FAQ, protection continues unless there is a **reduction** in pay grade or a change in
  dependency status; a promotion does **not** end it. Every page that states the rule reads from
  `src/data/bah/rateProtection.ts`; `tests/e2e/bah-rate-protection.spec.ts` fails if the old
  wording returns. Nothing to do on release day beyond the preview spot-check.
- TX270 temporary increase: **resolved** (Claude Chat, 2026-11-13;
  `docs/sources/bah-2026-abilene-temporary-increase.md` → "Expiration and rate protection").
  Rate protection doesn't apply to temporary increases, so `/bah/dyess-afb` shows the
  "temporary 2026 rates … expire December 31, 2026" paragraph, not the rate-protection one. On
  the preview, check `/bah/dyess-afb` shows that paragraph if any 2027 TX270 rate is below the
  temporary rate, and that the "Until then, the 2026 rate applies: $X" line shows the temporary
  rate ($1,872 for an E-5 with dependents).
- Dan merges. Then:

```bash
npm run bah:urls     # writes bah-urls.json: { "urls": [...] }
curl -X POST https://www.milpaytools.com/api/indexnow/submit \
  -H "Authorization: Bearer $INDEXNOW_SECRET" -H "Content-Type: application/json" \
  --data @bah-urls.json
```

(Git Bash: `MSYS_NO_PATHCONV=1`.) Then Search Console "Request Indexing" for `/bah` and the top
station pages.

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
  work the list (`docs/figures/year-change-2027.md`).
- Calendar: the 2027 BAH entry in `src/data/calendar-2027.ts` → official, with the released date.
- `src/data/bah/2027-status.ts`: set `status: 'released'`, `releasedDate`, `avgIncreasePct` and
  `releaseSourceUrl` (if step 0 didn't) so the key-dates calendar shows the real date (the notice
  itself is already gone because `BAH_YEAR` is '2027'). The `/bah` "#2027" section prefers the
  2027 row in `releaseHistory.ts` (step 3) and falls back to these fields.
- `/pay` approximate BAH ranges (`BAH_RANGES` in
  `src/components/calculators/pay-charts/PayChartsClient.tsx`, typed "2026 approximate
  values"): re-check against 2027. *Backlog: replace with values computed from the data.*
- `/guides/military-pay` reads the legacy 50-ZIP table `src/data/bah-rates/2026.ts`: update its
  figures for 2027. *Backlog: retire this duplicate dataset and read the registry instead.*

## 7. January 1, 2027 (≈15 min)

- `src/data/bah/current.ts`: `BAH_EFFECTIVE_NOTICE = false`. Static flag, never a date check.
  This removes the "Until then…" line and the ZIP calculator's 2026 sub-line, and the API stops
  returning prior-year rates.
- Build, Chromium tier 1 on `bah-release-day`, `bah-station`, `bah`, `api-bah-lookup`; PR; merge;
  `npm run bah:urls` → IndexNow.

## 8. August 1, 2027: GI Bill year

- VA's 2027–28 Post-9/11 rates take effect and use 2027 BAH. In `src/data/education/2026/constants.ts`
  (or a new `2027/` folder): `EDUCATION_BAH_YEAR = '2027'` and the new `EDUCATION_RATES`, with
  VA's source. Build; Chromium tier 1 on `education`, `bah-release-day`; IndexNow `/calculators/education`
  and `/guides/education-benefits`.

## Reference

- Year switch: `src/data/bah/current.ts`. Registry (the only importer of year folders):
  `src/data/bah/registry.ts`. Transition copy: `src/lib/calculations/bahTransition.ts`.
- The lookup API (`/api/bah/lookup`) is cached immutably only for `?y=<BAH_YEAR>`; a request
  without `y` or with another year gets current data with `no-store`. The client sends
  `y=BAH_YEAR`, so a flip changes every lookup URL. Nothing to purge.
- Importer: `scripts/bah-import.mjs`; URL list: `scripts/bah-urls.mjs`; llms.txt:
  `scripts/bah-llms.mjs`. The 2026 regen check (`bah-release-day.spec.ts`) re-imports
  `data/sources/dtmo/2026/` and expects only TX270 to differ.
- Mid-year changes during 2027: `docs/ANNUAL_DATA_UPDATE.md` → "Mid-year BAH changes".
