# Release day: 2027 military pay raise

Everything on `/pay/raise`, the `/pay` hub FAQ, the rank-page links, the homepage link and
the blog callout reads its wording from `src/data/pay-raise/2027.ts`. Edit only that file
(plus `src/data/pay-tables/2027.ts` once DFAS publishes the table).

The "2027 pay raise" section and the 2027 raise FAQ on every `/pay/[rank]` page, and the
"same in every branch" and retiree COLA FAQs on `/pay/raise`, also flip with the `2027.ts`
status — no page edits are needed on release day.

1. **Edit `src/data/pay-raise/2027.ts`.** Set `DATA_LAST_CHECKED` in `src/data/watch.ts` to today
   (`lastChecked` reads from it; the same date also shows on the BAH 2027 notice). Then either:
   - **Law signed, no DFAS table yet:** `status: 'enacted'` and fill `enacted`:
     `{ percentByTier, lawName, signedDate, sourceUrl }`. If the 2027 Executive Schedule is out,
     update `caps` (`levelII`, `levelV`, `capYear: 2027`, `pending: false`).
   - **DFAS 2027 table published:** add `src/data/pay-tables/2027.ts` from the DFAS pages, import
     it in `2027.ts`, set `officialTable` to it and `status: 'official-table'`.
   - **When enacted:** re-verify whether the NOAA Corps / Public Health Service got a different
     raise. The branch FAQ drops its NOAA/PHS line automatically in enacted mode; if the law gives
     them a rate worth stating, that needs a deliberate copy change.
2. **Run `npm run test:pay-raise`.** The pending-mode assertions (title, status text, 7-6-5/3.6%
   golden values) will fail by design once the status changes. Update them to the new official
   figures and verify those against the law or DFAS table first, then rerun until the suite passes.
3. **Build:** `npm run build`.
4. **Open a PR.**
5. **After merge,** submit `/pay/raise`, `/pay` and the rank pages (`/pay/e1` … `/pay/o6`) to
   IndexNow, and use Google Search Console "Request Indexing" for each.

## Key dates calendar flips (`src/data/calendar-2027.ts`)

The calendar on /pay/raise (full), /pay (compact), the rank-page key-dates line, the /bah link and
the homepage strip all read `src/data/calendar-2027.ts`. Record each change in
`docs/sources/calendar-2027.md` first, bump `DATA_LAST_CHECKED`, then run `npm run test:pay-raise`
(the status assertions in "2027 key dates — calendar data" will fail by design; update them).

- **Final raise (NDAA):** nothing to edit in the calendar. The row reads `PAY_RAISE_2027` through
  `raiseCalendarEntry()`, so the release-day steps above flip it to official, with the law name and
  signing date. The homepage strip (`homeStripText()`) flips with it.
- **VA COLA law enacted:** in the `va-cola` entry set `status: 'official'`, `isoDate` to the
  effective date, and name the law (public law number) and its signing date in the body; change
  the source to the enacted law. Still no dollar figures until VA publishes its 2027 rate tables.
- **IRS announces 2027 limits:** in the `tsp-limits` entry set `status: 'official'`, `isoDate` to
  the announcement date, give the figure in the body, and cite the new IRS notice as the source.
  Update the TSP calculator's 2027 limit in the **same PR**. (The "no $ in calendar bodies" test
  needs a deliberate exception for this one entry.)
- **2027 BAH released:** set `status: 'released'` and `releasedDate` in
  `src/data/bah/2027-status.ts`. The calendar's BAH row, the /pay/raise BAH FAQ and the rank-page
  line flip to official with the release date automatically. This also changes the 142 station
  notices, so IndexNow every CONUS station page in that PR.
- **DFAS posts its 2027 paydays page:** in `CALENDAR_SOURCES.dfasPaydays` swap the URL from the
  2026 schedule (`/2026ACPayDay/`) to the 2027 page, drop "(2026 schedule; 2027 not yet posted)"
  from its name, and confirm the page shows the first 2027 mid-month payday on Friday, January 15,
  2027. The December 31 entry keeps DoD FMR Vol. 7A ch. 1 (010701/010702) as its source.
- **BAS posted:** in the `bas` entry set `status: 'official'`, `isoDate` to the posting date, give
  the rates in the body (copied from the DFAS BAS page, not typed from memory), and keep the DFAS
  source. Same "no $" test exception as above.

## Dec 10, 2026: rank-page title switch

Built and off (`src/data/pay-pages/titleMode.ts`, `RANK_TITLE_YEARS = '2026'`).

1. After Claude Chat pulls the PR #13 branch-term GSC data for the rank pages, set
   `RANK_TITLE_YEARS = '2026-2027'`. Titles become e.g. "E-5 Pay 2026 & 2027: $3,343–$4,422/Month,
   All Branches" (still the 2026 range; description and OG unchanged).
2. `npm run test:pay-raise` (the "live mode is '2026'" assertion fails by design; update it), then
   `npm run build`. Verify all 15 `<title>`s are ≤ 60 characters and contain " & 2027".
3. Open a PR. After merge, submit the 15 rank pages (`/pay/e1` … `/pay/o6`) to IndexNow.
4. `'2027'` mode throws "not ready: needs the DFAS 2027 table" until `PAY_RAISE_2027.status` is
   `'official-table'`. Switching to it is January work: the branch-FAQ range must move to the
   2027 figures in the same change, or the title guardrail fails the build.

## January 2027

- **Retiree COLA FAQ on /pay/raise:** reads `RETIREE_COLA_2027` (`src/data/retiree-cola/2027.ts`).
  Replace it with the 2028 figures when SSA announces in October 2027 (the REDUX figure is
  computed as the percent minus 1).
