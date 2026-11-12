# Release day: 2027 military pay raise

Everything on `/pay/raise`, the `/pay` hub FAQ, the rank-page links, the homepage link and
the blog callout reads its wording from `src/data/pay-raise/2027.ts`. Edit only that file
(plus `src/data/pay-tables/2027.ts` once DFAS publishes the table).

1. **Edit `src/data/pay-raise/2027.ts`.** Set `lastChecked` to today. Then either:
   - **Law signed, no DFAS table yet:** `status: 'enacted'` and fill `enacted`:
     `{ percentByTier, lawName, signedDate, sourceUrl }`. If the 2027 Executive Schedule is out,
     update `caps` (`levelII`, `levelV`, `capYear: 2027`, `pending: false`).
   - **DFAS 2027 table published:** add `src/data/pay-tables/2027.ts` from the DFAS pages, import
     it in `2027.ts`, set `officialTable` to it and `status: 'official-table'`.
2. **Run `npm run test:pay-raise`.** The pending-mode assertions (title, status text, 7-6-5/3.6%
   golden values) will fail by design once the status changes. Update them to the new official
   figures and verify those against the law or DFAS table first, then rerun until the suite passes.
3. **Build:** `npm run build`.
4. **Open a PR.**
5. **After merge,** submit `/pay/raise`, `/pay` and the rank pages (`/pay/e1` … `/pay/o6`) to
   IndexNow, and use Google Search Console "Request Indexing" for each.
