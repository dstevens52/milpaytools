# VA funnel test, November–December 2026 (build V3b)

Which placements on MilPayTools send real traffic to the VA loan pages? The answer could become a revenue line later. For now the VA pages only explain VA loans: no lead form, no contact details, no lenders, no affiliate links.

- **Start:** the day the V3b PR merges (production deploy). **Dan fills in the date:** ________.
- **Read-out:** four weeks after the start, ________. If it merges on Sunday, Nov 22, 2026, the read-out is **Sunday, Dec 20, 2026**.
- **Code:** event types in `src/lib/analytics.ts` (`fireDeepLinkEvent`); the result-card link and its CONUS test in `src/lib/vaFunnel.ts`; the card itself in `src/components/calculators/shared/VaLoanBahCard.tsx`.
- **Tests:** `tests/e2e/va-funnel.spec.ts` (browser) and `tests/e2e/va-funnel-unit.spec.ts` (`npm run test:va-funnel`).

## Placements

Every placement sends the existing event `calc_deeplink_click` with `from_page_type`, `to_calculator` and `placement` (plus `grade` in the short form, e.g. `e5`, where the link carries a rank). The event never carries a ZIP. There is no landing event and no `from=` URL parameter: the VA loan calculator's own URL settings tell a prefilled arrival from a cold one.

| # | Page | Wording | Target URL | Prefill | Event params |
|---|---|---|---|---|---|
| 1 | `/bah` (BAH calculator), under the result | "Thinking about buying near {MHA name}? See how a VA loan payment compares with this BAH →" | `/calculators/va-loan?bah=yes&zip={zip}&rank={e5}&dep={yes\|no}` | BAH comparison on; ZIP, grade and dependents from the lookup just run | `from_page_type: bah-calculator`, `to_calculator: va-loan`, `grade`, `placement: result-card` |
| 2 | `/calculators/pcs`, under the destination's station link | Same wording, the destination's MHA name | Same pattern, the **destination** ZIP (`to`) | As 1, from the PCS inputs | `from_page_type: pcs-calculator`, `to_calculator: va-loan`, `grade`, `placement: result-card` |
| 3 | `/calculators/va-disability`, funding fee waiver card (from V1) | Unchanged: "Estimate your VA loan payment →" | `/calculators/va-loan?fee=comp` | Funding fee status "receives VA disability compensation" | `from_page_type: va-disability-calculator`, `to_calculator: va-loan`, `placement: result-card` |
| 4 | `/blog/file-va-disability-before-separation`, BDD section | "A BDD claim can matter for a home purchase too: if you receive a proposed or memorandum rating from a pre-discharge claim that says you're eligible for compensation, and it's dated before your loan closes, you don't pay the VA funding fee. See how that changes a VA loan estimate." | `/calculators/va-loan?fee=predischarge` | Funding fee status "pre-discharge rating" | `from_page_type: blog`, `to_calculator: va-loan`, `placement: contextual` |
| 5a | `/bah`, "What is BAH?" (from V3) | Unchanged: "…the VA loan calculator compares an estimated mortgage payment with your BAH." | `/calculators/va-loan?bah=yes` | BAH comparison on (no ZIP) | `from_page_type: bah-hub`, `to_calculator: va-loan`, `placement: contextual` |
| 5b | `/guides/pcs`, VA loan paragraph (from V3) | Unchanged: "The VA loan calculator compares an estimated mortgage payment, with the funding fee, to your BAH." | `/calculators/va-loan?bah=yes` | BAH comparison on (no ZIP) | `from_page_type: guide`, `to_calculator: va-loan`, `placement: contextual` |
| 5c | `/guides/va-home-loans` (the VA hub), every link to the two VA calculators (13 rendered links: the hero button, the 3 feature cards, 6 links in the accordion sections, the dark calculator panel, the sample-result card and the VA loan card under "Start with these VA loan calculators") | Unchanged | `/calculators/va-loan`, `/calculators/va-loan?bah=yes`, `/calculators/va-refinance` | None, or BAH comparison on | `from_page_type: guide`, `to_calculator: va-loan` or `va-refinance`, `placement: hub` |

Rules for the placements: one short line or small card next to the result it relates to, education wording, at most one new placement per page, never in footers, banners or pop-ups.

When the card shows (1 and 2): only for a 5-digit ZIP that resolves to a **CONUS** Military Housing Area with a BAH rate for the chosen grade. Not for a territory ZIP (OHA), a ZIP outside the BAH data, an Alaska or Hawaii MHA (they pay BAH but are OCONUS), or an overseas PCS move. In compare mode the BAH calculator shows no card (two locations, no single "this BAH").

`from_page_type: guide` covers both 5b and 5c. Tell them apart by `placement` (`contextual` vs `hub`) or by the event's page path.

## Why no new URL parameter, and what GA sees

- `from` is already a PCS calculator setting (the origin ZIP), so a `from=` tag would collide.
- The VA loan calculator's own settings mark a prefilled arrival: `bah=yes` (placements 1, 2, 5a, 5b, some of 5c) and `fee=` (3, 4).
- **V3b adds `bah` to the GA URL allowlist** (`GA_KEEP_PARAMS`), so GA page URLs keep it. `zip` stays out: a prefilled arrival reaches GA as `/calculators/va-loan?bah=yes&rank=e5&dep=yes`.
- **`fee` stays out of GA.** Its values are funding fee statuses that carry VA disability and claim status (`comp`, `pending`, `predischarge` and others), so GA sees `/calculators/va-loan` for a `fee=` arrival. Count those arrivals from the clicks that send them: `calc_deeplink_click` from placements 3 and 4.

## What to compare at the read-out

Pull each for the four weeks from the start date (and, where marked, the four weeks before it).

1. **Clicks by placement.** GA4 → Explore → Free form: event name `calc_deeplink_click`, filter `to_calculator` is `va-loan` or `va-refinance`; rows `from_page_type` × `placement`; values Event count and Total users. Needs the custom dimensions below.
2. **Click rate per eligible view** (the fair comparison, since traffic to each page differs):
   - BAH card: card clicks ÷ `calculation_run` where `calculator_name` = `bah`.
   - PCS card: card clicks ÷ `calculation_run` where `calculator_name` = `pcs`.
   - VA disability card: clicks ÷ `calculation_run` where `calculator_name` = `va-disability` (the card shows at 10% and above, so this understates the rate).
   - Blog, `/bah`, `/guides/pcs`, VA hub: clicks ÷ page views of that page.
3. **Prefilled arrivals on the VA loan calculator.**
   - `bah=yes` arrivals (placements 1, 2, 5a, 5b, some of 5c): page views of `/calculators/va-loan` with "Page path + query string" containing `bah=yes`, against all its page views. (The standard "Page path" dimension drops the query string; use "Page path + query string" or "Page location".)
   - `fee=` arrivals (placements 3 and 4): GA never sees `fee`, so use the `calc_deeplink_click` count for `from_page_type` = `va-disability-calculator` and `blog` (`to_calculator` = `va-loan`). A click is not always a completed page view, so this slightly overstates arrivals.
4. **Use after arrival.** `calculation_run` where `calculator_name` = `va-loan` (and `va-refinance`). It fires only when a person changes an input, never on a prefilled landing.
5. **Before and after.** Sessions and users on `/calculators/va-loan`, `/calculators/va-refinance` and `/guides/va-home-loans`, four weeks after vs the four weeks before; GSC clicks for the same pages. **Dan pulls the 4-week baseline from GA4 and GSC on the start date** and pastes it below.

### Baseline (Dan, on the start date)

| Page | GA4 sessions, 4 weeks before | GA4 users | GSC clicks | GSC impressions |
|---|---|---|---|---|
| `/calculators/va-loan` | | | | |
| `/calculators/va-refinance` | | | | |
| `/guides/va-home-loans` | | | | |

### Things that will move the numbers during the window

- **BAH 2027 release (expected Dec 10–17):** `/bah` traffic jumps, so card 1 gets far more views. Use the per-view rate (item 2), not raw clicks.
- **The Dec 9 station read-out** changes station titles; station pages have no VA placement in this test.
- **Holidays** (late December) lower traffic across the site.
- **Key events:** `calc_deeplink_click` is a GA4 key event. From the start date it counts the new placements too, so site-wide key-event totals rise. Annotate the start date in GA4.

## GA4 custom dimensions (Dan, one-time)

GA4 → Admin → Data display → Custom definitions → Create custom dimension, scope **Event**, one per event parameter. Until a parameter is registered, GA collects it but reports can't show it, and registration doesn't backfill, so **do this on the start date at the latest.**

| Dimension name | Event parameter | Needed for | Status found in the repo |
|---|---|---|---|
| From page type | `from_page_type` | item 1 | No record of registration. GA4 admin "register custom dimensions" was a to-do after Build 02 (Nov 15). |
| To calculator | `to_calculator` | item 1 | Same. |
| Placement | `placement` | item 1 | Listed as pending (Dan) since Build 04 (`STATION_LAYOUT_REPORT.md`); no record it was done. |
| Calculator name | `calculator_name` | items 2 and 4 | No record either way. |
| Grade | `grade` | optional (which ranks click) | No record either way. |

If a dimension already exists, leave it; check Admin → Custom definitions for the five names first.

## Next placement after Dec 9

Station pages: a "Buying near {base}?" line linking to `/calculators/va-loan?bah=yes&zip={zip}` (the station's own ZIP), already a dated FIX_QUEUE item. Give it its own `from_page_type: bah-station` with a new placement value (e.g. `va-line`) so it stays separable from this test's numbers, or wait for this read-out before adding it.
