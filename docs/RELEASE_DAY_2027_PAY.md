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

## January 2027

- **Retiree COLA FAQ on /pay/raise:** reads `RETIREE_COLA_2027` (`src/data/retiree-cola/2027.ts`).
  Replace it with the 2028 figures when SSA announces in October 2027 (the REDUX figure is
  computed as the percent minus 1).
