# TSP Growth Projector — Two-Phase Model Fix: Phase 0 Investigation

**Date:** 2026-07-10  
**Status:** Phase 0 complete — awaiting approval before Phase 1

---

## 1. Projection Engine

**Location:** `src/lib/calculations/tspGrowth.ts`, function `projectTSP()` (line 131).

**Algorithm:** Month-by-month loop from month 1 to `yearsToProject * 12`. Each iteration:
1. Applies annual pay raise multiplier at the start of each new year (month 1 excepted)
2. Enforces the annual elective deferral limit on member contributions
3. Calls `calcBRSMatch()` to compute government contribution for that month
4. Applies investment growth, then adds contributions to balance

**The flaw:** `yearsToProject` is passed as the full horizon from today to target retirement age (39 years for the default E-5 scenario). The loop applies member contributions and BRS match for all 39 months, regardless of when the member would separate. There is no concept of separation in the current engine.

**Inputs that will need to change:**
- `TSPProjectionInput.yearsToProject` — currently the full retirement horizon; Phase 1 will add `moreYearsToServe` alongside it (or replace it with a two-phase structure)

**BRS matching rules in current engine:** `calcBRSMatch()` (lines 87–108) applies full BRS match based only on the `retirementSystem` flag. It does **not** model the 25th-month eligibility rule (matching doesn't start until month 25 of service). This is an existing simplification — the build spec says to preserve it.

---

## 2. All Consumers of the Projection Output

### On `TSPCalculator.tsx` (client component)

| Consumer | Source field(s) | Location |
|---|---|---|
| Projected balance headline | `projection.finalBalance` | Line 511 |
| Est. monthly withdrawal (4% rule) | `projection.monthlyRetirementIncome4pct` | Line 516 |
| Balance breakdown — Your contributions | `projection.totalMemberContributions` | Line 524 |
| Balance breakdown — Gov contributions (BRS) | `projection.totalGovContributions` | Line 527 |
| Balance breakdown — Investment growth | `projection.totalInvestmentGrowth` | Line 530 |
| Balance Growth Over Time chart | `projection.snapshots` (thinned to ≤40 points) | Lines 176–186 |
| Chart series "Your Contributions" | `s.memberContributionsTotal` per snapshot | Line 182 |
| Chart series "Gov Match" | `s.govContributionsTotal` per snapshot | Line 183 |
| Chart series "Investment Growth" | `s.investmentGrowthTotal` per snapshot | Line 184 |
| Roth vs. Traditional section | `rothVsTraditional(projection.finalBalance, ...)` | Lines 164–171 |
| Save/Share URL | Encodes `yearsToProject` in URL params | Lines 222–232 |

### On `page.tsx` (server component)

The server-side call on lines 48–57 computes the E-6 worked example (see section 3 below). Also produces:
- `tspGovMatch = tspProjection.monthlyGovContribution` (line 58)
- `tspTotalMonthly` (line 59)
- `tspReturnPct` (line 60)
- `tspFvBalance = projectTSPBalance(...)` (line 61) — FV of starting balance only
- `tspFvContributions = tspProjection.finalBalance - tspFvBalance` (line 62)
- `tspGovFutureValue = projectTSPBalance(...)` (line 63) — FV of gov-match stream
- `tspE7Pension` (line 65) — pension calc, unrelated to projection

---

## 3. Static Scenario Box ("E-6 at 10 Years…")

**Scenario definition (page.tsx lines 45–57):**
```
E-6, 10 YOS, BRS, 10% base pay contribution, aggressive allocation (C60/S25/I15),
$25,000 starting balance, yearsToProject: 10, annualPayRaisePct: 0
```

**Assessment: Already correct for this specific case.** The scenario projects exactly 10 more years — matching the 10 remaining service years to reach a 20-year retirement. Because `yearsToProject: 10 = remaining service years`, the flawed assumption (contributions run to target retirement age) happens to produce the right result: contributions and match do end at the 20-year point, which is also the "retirement age" for this scenario.

**All figures are computed, not hand-keyed:**
- Base pay, member contribution, BRS match → from data libs + `calcBRSMatch()`
- FV of starting balance → `projectTSPBalance(tspStartBalance, 0, tspReturnPct, 10)`
- FV of contributions → `tspProjection.finalBalance - tspFvBalance`
- FV of gov-match stream → `projectTSPBalance(0, tspGovMatch, tspReturnPct, 10)`
- Monthly retirement income → `tspProjection.monthlyRetirementIncome4pct`
- E-7 BRS pension supplement → `calculatePension('brs', 20, ...)`
- Explanatory sentence "government contribution alone is worth approximately {formatCurrency(tspGovFutureValue)}" is dynamic.

**Post-Phase 1 impact:** The `projectTSP()` function signature changes. The server-side call in `page.tsx` will need to be updated to use the new two-phase API. For this specific scenario, the correct equivalent call is: contributions for 10 years (moreYearsToServe = 10), then 0 years of post-separation growth (since the scenario ends at retirement, not a later target age). If the Phase 1 API accepts `moreYearsToServe` and `yearsToProject`, the call should set both to 10.

---

## 4. BRS Match at Different Contribution Levels Table

**Location:** `TSPCalculator.tsx` lines 662–708.  
**Data source:** `brsMatchTable(basePay)` — a per-month snapshot, computed separately from `projectTSP()`.

**Not affected by the projection model fix.** This table shows what different contribution percentages yield in monthly BRS match for the current base pay. It has nothing to do with the projection horizon.

---

## 5. Sample Output Bar (page.tsx line 117)

```tsx
Projected at 65: <span className="font-semibold text-red-700">$2.85M</span>
```

**This is HARD-KEYED static text.** The label context is:
```
E-5 · age 26 · BRS 5% · aggressive · $0 starting
```

Per the figure policy, this violates the build rule: "All displayed figures must be computed… If any static copy requires a dollar figure that cannot be computed, insert `[[VERIFY: description]]`."

**Fix required in Phase 1:** Compute this figure server-side using `projectTSP()` with the old API (full 39-year horizon — this is what the calculator *currently* shows as the default before the user enters separation years). After the Phase 1 new model is live, the sample bar scenario will need to include a `moreYearsToServe` assumption; the natural choice is the default (20-year career → 14 more years to serve from 6 YOS). The computed figure will be substantially lower than $2.85M.

**Alternative:** The sample bar could be omitted or changed to a non-calculator-output framing. Recommend computing it from the two-phase model with the 14-year default, so it accurately represents what a user sees.

---

## 6. "Power of Starting Early" Section (page.tsx lines 254–263)

```
An E-3 who starts contributing $200/month at age 20 (with a 10% blended return) reaches
retirement at 65 with approximately $1.7M. An E-5 who waits until age 26 to contribute the
same amount reaches the same age with approximately $1.1M — $600K less...
```

**HARD-KEYED.** These figures are approximate FV calculations ($200/month at 10%/yr for 45 vs. 39 years), but they're static text. Per figure policy, these should either be computed or marked `[[VERIFY: ...]]`.

**Scope note:** These figures are NOT affected by the two-phase model fix — they describe continuous contributions from age 20/26 all the way to 65 (not a military-service scenario). They represent the general compound-growth illustration, not the TSP Growth Projector's output. However, they remain static text and should be flagged for follow-up.

**Recommendation for Phase 1:** Mark both figures with `[[VERIFY: FV of $200/month at 10% for 45 years (E-3 age 20 scenario)]]` and `[[VERIFY: FV of $200/month at 10% for 39 years (E-5 age 26 scenario)]]` unless these can be computed by `projectTSPBalance()` server-side. Since `projectTSPBalance()` exists and handles this exact case, **compute them server-side** in Phase 1.

---

## 7. Blog Posts / Guides / llms.txt Citing Calculator Output Figures

Searched for: `$2.85M`, `2,850,000`, `1.7M`, `1.1M`, `$600K`, plus TSP projection figure patterns across all content.

**No blog posts or guides cite the calculator's default scenario output ($2.85M or the monthly withdrawal).** The blog posts that contain TSP figures use independently-reasoned scenarios:

| File | Figure | Notes |
|---|---|---|
| `blog/roth-tsp-advantage-junior-enlisted.mdx` | `~$1.9M` at age 60 | $300/month at 10% for 40 years — continuous contribution scenario, not from calculator default |
| `blog/roth-tsp-deployment-strategy.mdx` | `$213,540` at age 60 | One-time $20K lump sum at age 25, 7% return for 35 years |
| `blog/tsp-for-beginners-what-happens-if-you-do-nothing.mdx` | `$47,000 in gov contributions` | $197/month × 240 months — 20-year career snapshot math |
| `blog/should-i-stay-to-20-years-military.mdx` | `$2M+` pension lifetime value | Pension math, unrelated to TSP calculator |
| `llms.txt` | No TSP projection figures | Describes the calculator in general terms only |

**None of these need updating as a result of the Phase 1 model fix.** They are independent scenarios appropriate to their context.

---

## 8. Deployment Pay Calculator Cross-Link

**Location:** `TSPCalculator.tsx` lines 712–722.

Text references combat zone TSP limits and Roth TSP capping rules. It is a static link — no TSP projection output is consumed. The linked page (`/calculators/deployment`) does not depend on the retirement-age-length contribution assumption. **Not affected.**

---

## Summary: Phase 0 Conclusion

**The flaw is confirmed.** For the default scenario (E-5, 6 YOS, age 26, BRS, target 65), the current engine models 39 years of contributions and BRS match. A member with 6 YOS at age 26 pursuing a 20-year career has 14 more years of service remaining — so the correct model is 14 years of contributions, then 25 years of growth-only compounding. The headline balance of $2.85M is materially overstated.

**What will drop:**
- Projected balance headline (client) — substantially lower
- Est. monthly withdrawal (4% rule) — proportionally lower
- Gov contributions total in balance breakdown — reflects ~14 years of match, not 39
- Roth vs. Traditional monthlies — both lower (same relative difference)
- Chart contribution series — flattens at separation year, investment growth continues
- Sample output bar `$2.85M` — must be recomputed (currently hard-keyed, a bug)

**What is NOT affected:**
- BRS Match at Different Contribution Levels table — per-month snapshot, unaffected
- Deployment Pay cross-link — static link, unaffected
- E-6 worked example in static scenario box — already correct for 10-year projection to 20-year retirement; will need API call updated for new function signature
- Blog post figures — independently reasoned scenarios, not tied to calculator default output

---

## Phase 1 Implementation Plan

### `src/lib/calculations/tspGrowth.ts`
1. Add `moreYearsToServe: number` to `TSPProjectionInput` (required; validated at call site)
2. Add `separationYear: number` to `TSPProjectionResult` for reporting in copy-result and UI
3. In the main `projectTSP()` loop, gate member contributions and BRS match on `month <= moreYearsToServe * 12`. After that, growth-only.
4. Retain all existing BRS matching logic inside the gate.

### `src/components/calculators/tsp/TSPCalculator.tsx`
1. Add state `moreYearsToServe` with default `Math.max(20 - parseInt(yos), 1)`
2. Add input in Military Information card below Years of Service
3. Validate that `parseInt(currentAge) + moreYearsToServe <= parseInt(targetAge)`; cap at `yearsToProject` if violated (edge case: still serving at retirement age)
4. Pass `moreYearsToServe` to `projectTSP()` call
5. Add two-line interpretation under projected balance
6. Add post-separation callout
7. Add two items to "What this projection does not include" list
8. Update copy-result text
9. Rename "Annual Pay Raise Assumption" to "Annual pay growth (raises + promotions)", update default to 4.5%, update hint text
10. Update share URL to include `moreYearsToServe` param

### `src/app/calculators/tsp/page.tsx`
1. Update server-side `projectTSP()` call for E-6 scenario: add `moreYearsToServe: 10` (remains correct since that scenario ends at 20-year retirement)
2. Compute sample output bar figure server-side with `moreYearsToServe` = 14 (default for E-5 at 6 YOS)
3. Compute "Power of Starting Early" figures server-side using `projectTSPBalance()`
4. Append one sentence to disclaimer
5. Update Roth vs. Traditional wording if any implies contributions run to retirement age

---

*Ready for Phase 1 approval.*
