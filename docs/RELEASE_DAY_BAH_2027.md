# Release day: 2027 BAH rates

DoD usually publishes next year's BAH in mid-December (2026 rates: Dec 11, 2025; 2025 rates:
Dec 13, 2024). Release day is the biggest traffic day of the year for `/bah` and the station
pages. The whole update is: **download the zip → one import command → flip one config → build,
test, preview → merge → IndexNow.** Rehearsed on `rehearsal/bah-2027` (see the PR for timings).

Who does what: **Claude Chat** verifies sources and figures, **Claude Code** runs the steps, and
**Dan** merges.

**Blockers to clear before release day** (found in the 2026-11-13 rehearsal; both in
`docs/audits/FIX_QUEUE.md`):
- Rate-protection wording is wrong (step 5 below).
- The education calculator and `/guides/education-benefits` label their GI Bill housing figure
  "2026 BAH rates for the 2026–2027 academic year" but read the *current* BAH year. After the
  flip they would show 2027 rates under a 2026 label. Claude Chat confirms which BAH year VA uses
  for the 2026–27 academic year; if it's 2026 until August 1, 2027, those two pages must be
  pinned to their academic year's BAH before the flip.

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

Rehearsal total from zip to preview: see the PR (#26) rehearsal comment.

## 0. (Optional) DoD has posted but the import isn't live yet

If the import won't land within an hour or two, switch the existing notice to "released" first so
pages stop saying "not yet published". In `src/data/bah/2027-status.ts` set
`status: 'released'` and `releasedDate: 'YYYY-MM-DD'`, and set `DATA_LAST_CHECKED` in
`src/data/watch.ts`. Small PR, `npm run test:e2e -- tests/e2e/bah-2027-notice.spec.ts --project=chromium`.

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
distribution, the top/bottom 10, every decrease (station-page MHAs listed), the station-page MHA
table, and 10 seeded sample cells.

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
    its import (the prior year is now 2026)
  - **move** the `BAH_LOOKUP_TABLES` entry to 2027
    (`'2027': { zipToMha: zipToMha2027, mhaNames: mhaNames2027 }`) and delete the 2026
    zipToMha/mhaNames imports. Only one year's ZIP map may be registered; a test enforces it.
  - add `'2027': {}` to `BAH_MID_YEAR_CHANGES_BY_YEAR`. 2027 starts with no mid-year changes;
    TX270's 2026 temporary increase ends Dec 31, 2026 and the 2027 file supersedes it.
- `src/data/bah/current.ts`: `BAH_YEAR = '2027'`, `BAH_PRIOR_YEAR = '2026'`,
  `BAH_EFFECTIVE_NOTICE = true`.
- `src/lib/calculations/bahStats.ts`: add `NATIONAL_AVG_BAH_INCREASE['2027']`. **Only** the
  figure from DoD's release; Claude Chat supplies it with the source URL. Keep `'2026': 4.2`.
- `npm run bah:llms` rewrites `public/llms.txt`'s BAH lines (hub, station lines, sources line)
  to the new year and ZIP count. Do it here: `bah-release-day.spec.ts` fails the step-4 gate until
  it's run.
- `npx tsc --noEmit`: an unregistered year or a missing lookup table fails here.

What flips by itself: every title, meta description, FAQ, JSON-LD, OG footer, rate table, YoY
("2026 → 2027"), the decrease block, `/pay/[rank]` BAH lines, the `/calculators` grid, the
blog callout default, and the ZIP lookup's cache key (`&y=2027`). The "2027 BAH rates: not yet
published" notice and its "When will…" FAQ disappear, and the station email signup asks about
2028 rates. Station pages and `/bah` show one line instead:
"2027 rates take effect January 1, 2027. Until then, the 2026 rate applies: $X for an E-5 with
dependents." The ZIP calculator shows "2026 rate (through Dec 31, 2026): $X" under each result.

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
- Also review the present tense during the transition: station FAQs say "For 2027, an E-5 …
  receives $X/month" while the 2026 rate is still being paid until January 1.
- **Claude Chat verifies the rate-protection wording, and whether it applies to the end of
  TX270's temporary increase, before release-day merge.** The decrease block on station pages
  (`StationPageClient.tsx`, shown wherever any grade fell) reads: "Some pay grades at {station}
  decreased for 2027 compared with 2026. Under individual rate protection, service members who
  have remained at this duty station with the same pay grade and dependency status keep their
  higher prior-year rate. The lower 2027 rate applies to members who arrive at this location or
  whose dependency status changes in 2027." Related copy: the "How much did … change" FAQ
  ("Rate protection means a member who stays at the same location with the same dependency
  status keeps their rate even if the published table rate falls.") and the ZIP calculator's
  "Understand rate protection" step. Dyess AFB (TX270) will likely show a decrease vs the
  temporary increase; confirm the wording is accurate for an expiring temporary increase, or
  hold the merge for a copy change.
- **Known issue (found 2026-11-13): that wording is wrong.** Per DTMO's official FAQ
  (travel.dod.mil, "BAH Rate Changes / Rate Protection"), protection continues unless there is a
  **reduction** in pay grade or a change in dependency status; a promotion does **not** end it.
  The current copy implies otherwise ("same pay grade", "change pay grade"). **Fix rate-protection
  wording in the next BAH build (decrease paragraph, station FAQ, ZIP calculator step); Claude
  Chat supplies the text.** The same error also appears in the `/bah` "Rate protection" section,
  the dual-military page and calculator step, and `/guides/military-pay`; the full list is in
  `docs/audits/FIX_QUEUE.md`. If that build hasn't shipped by release day, ship the fix before or
  with the release-day merge.
- Dan merges. Then:

```bash
npm run bah:urls     # writes bah-urls.json: { "urls": [...] }
curl -X POST https://www.milpaytools.com/api/indexnow/submit \
  -H "Authorization: Bearer $INDEXNOW_SECRET" -H "Content-Type: application/json" \
  --data @bah-urls.json
```

(Git Bash: `MSYS_NO_PATHCONV=1`.) Then Search Console "Request Indexing" for `/bah` and the top
station pages.

## 6. Same week (≈1–2 h)

- `npm run check:figures -- --next-year 2027` for inline BAH figures in blog posts and guides;
  work the list (`docs/figures/year-change-2027.md`).
- Calendar: the 2027 BAH entry in `src/data/calendar-2027.ts` → official, with the released date.
- `src/data/bah/2027-status.ts`: set `status: 'released'` and `releasedDate` so the key-dates
  calendar shows the real date (the notice itself is already gone because `BAH_YEAR` is '2027').
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
