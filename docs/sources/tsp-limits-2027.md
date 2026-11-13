# TSP / 401(k) contribution limits for 2027 (official source)

- **Announced:** November 12, 2026
- **Issued as:** IRS Notice 2026-66, with IRS news release IR-2026-136
- **News release:** https://www.irs.gov/newsroom/401k-limit-increases-to-25500-for-2027-ira-limit-remains-7500
- **Notice PDF:** https://www.irs.gov/pub/irs-drop/n-26-66.pdf
- **Retrieved:** 2026-11-13 (verified by Claude Chat against the release and the notice)
- **Takes effect:** January 1, 2027. Contributions made in 2026 stay under the 2026 limits
  (IRS Notice 2025-67, https://www.irs.gov/pub/irs-drop/n-25-67.pdf).

No figures from any other site. No projections.

## Limits

The data file `src/data/tsp/2027/constants.ts` must match this table row for row
(checked by `tests/e2e/tsp-limits-2027.spec.ts`).

| Limit | Key | 2026 (Notice 2025-67) | 2027 (Notice 2026-66) |
|---|---|---|---|
| Elective deferral, 402(g) (TSP/401(k)) | electiveDeferralLimit | $24,500 | $25,500 |
| Catch-up, age 50+ (414(v)) | catchUpLimit | $8,000 | $8,500 |
| Catch-up, ages 60–63 (SECURE 2.0) | enhancedCatchUpLimit | $11,250 | $11,750 |
| Annual additions, 415(c) (combat-zone max) | annualAdditionsLimit | $72,000 | $75,000 |

## Verbatim IRS sentences

- IR-2026-136: deferral "is increased to $25,500, up from $24,500 for 2026."
- IR-2026-136: age 50+ catch-up "is increased to $8,500, up from $8,000 for 2026."
- IR-2026-136 (ages 60–63): "For 2027, this higher catch-up contribution limit is $11,750 instead of the $8,500 noted above."
- Notice 2026-66: "The limitation for defined contribution plans under section 415(c)(1)(A) is increased in 2027 from $72,000 to $75,000."

## Copy rule

Until January 1, 2027, pages state the 2026 limits as current ("for 2026") and may give the
2027 figure beside them. Only these four official limits get a 2027 figure. Derived amounts
(monthly maximums, combined dual-military totals, base-plus-catch-up totals) stay 2026-only
and are labeled "for 2026"; no 2027 derived math.
