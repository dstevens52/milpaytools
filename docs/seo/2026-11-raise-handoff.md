# /pay/raise → Military Pay Calculator handoff (build P1)

Does a next step under the /pay/raise result send people on to the Military Pay Calculator?

- **Ship date: Thursday, Nov 26, 2026.** PR #98 squash-merged 15:48 UTC, merge commit `28ecb5c`; Vercel production deploy the same minute, checked live (O-3 / 8 years block and href; head unchanged vs `PAY_META_BASELINE.json`). IndexNow: /pay/raise. Test window: Nov 26 – Dec 19.
- **Read-out: Sunday, Dec 20, 2026, with the V3b VA funnel read-out** (`docs/seo/2026-11-va-funnel-test.md`).
- **Code:** the block in `src/components/calculators/pay-raise/PayRaiseCalculator.tsx` (`data-testid="raise-handoff"`); the event type `'pay-raise'` in `DeepLinkFromPage`, `src/lib/analytics.ts`.
- **Tests:** `tests/e2e/pay-raise-handoff.spec.ts`.

## What shipped

Under the "Basic pay only. BAH and BAS are set separately…" line of the /pay/raise result, whenever a result shows (no block when DFAS publishes no rate for the grade and years):

> **Basic pay is only part of what you make.**
> Add your duty station to see your full {payYear} pay as {a/an} {grade} with {years} of service: base pay, BAH, BAS, the tax advantage, and the civilian salary it equals.
> **[See my full military pay →]**

- `{payYear}` is `combinedPayBahYear()` (`src/lib/combinedPayYear.ts`): the pay table's `DATA_YEAR`, the year the calculator's totals use. It flips with the January pay table. The block never says 2027 and shows no 2027 total.
- Link: `/calculators/total-compensation?rank={e5}&yos={n}` (same format as `/pay`'s `tcUrl`).
- Event: `calc_deeplink_click` with `from_page_type: pay-raise`, `to_calculator: total-compensation`, `grade` (short form, e.g. `o3`), `placement: result-card`. The GA4 custom dimensions were registered Nov 15; no GA4 setup was needed.

Untouched: /pay/raise `<title>`, meta description, H1, canonical and structured data (pay meta guard), and the `/calculators/total-compensation` page and component (Nov 11 search-match test).

## Baseline (GA4, Oct 29 – Nov 25, 2026)

| Scope | Views | Active users | Views per active user | Avg. engagement per active user |
|---|---|---|---|---|
| /pay/raise | 1,677 | 1,184 | 1.42 | 1m 19s |
| Site-wide | 8,234 | 4,901 | 1.68 | — |
| /calculators/total-compensation | 696 | 509 | — | — |

## Read-out (Dec 20, 2026)

- **Main metric:** `calc_deeplink_click` events where `from_page_type = pay-raise`, divided by /pay/raise views.
- **Secondary:** /pay/raise views per active user, and site-wide views per active user.
- **Use ratios, not raw counts.** The final FY2027 NDAA passing will move raw traffic a lot.

**Success:** 8% or more of /pay/raise views click through. **Under 3%:** rewrite the copy or move the block higher.
