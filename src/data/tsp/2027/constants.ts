/**
 * TSP contribution limits for 2027 (take effect January 1, 2027).
 *
 * Source: IRS Notice 2026-66 / IRS news release IR-2026-136, announced
 * November 12, 2026 (retrieved 2026-11-13):
 *   - https://www.irs.gov/newsroom/401k-limit-increases-to-25500-for-2027-ira-limit-remains-7500
 *   - https://www.irs.gov/pub/irs-drop/n-26-66.pdf
 * Source record: docs/sources/tsp-limits-2027.md (tests/e2e/tsp-limits-2027.spec.ts
 * checks this file against it row for row).
 *
 * Limits only. Fund return assumptions, BRS matching tiers, fund descriptions
 * and allocation presets are not year data; they stay in ../2026/constants.ts.
 * The TSP projection still uses the 2026 limits (2026 contributions follow 2026 limits).
 */

export const TSP_CONSTANTS_2027 = {
  electiveDeferralLimit: 25_500,     // IRS 402(g) limit
  catchUpLimit: 8_500,               // age 50+ (414(v)); ages 60–63 use the higher limit below
  enhancedCatchUpLimit: 11_750,      // ages 60–63 (SECURE 2.0)
  annualAdditionsLimit: 75_000,      // IRS 415(c) limit (combat zone max)

  DATA_YEAR: 2027,
} as const;

/** ISO date the IRS announced the 2027 limits (IR-2026-136). */
export const TSP_LIMITS_2027_ANNOUNCED = '2026-11-12';

/** Notice number, for copy and the calendar entry. */
export const TSP_LIMITS_2027_NOTICE = 'IRS Notice 2026-66';

export const TSP_LIMITS_2027_SOURCE_URL = 'https://www.irs.gov/pub/irs-drop/n-26-66.pdf';
