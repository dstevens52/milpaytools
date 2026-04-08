/**
 * TSP constants for FY2026.
 *
 * Sources:
 *   - IRS: https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits
 *   - TSP.gov: https://www.tsp.gov/making-contributions/contribution-limits/
 *   - DoD BRS: https://militarypay.defense.gov/BlendedRetirement/
 */

export const TSP_CONSTANTS_2026 = {
  electiveDeferralLimit: 24_500,     // IRS 402(g) limit
  catchUpLimit: 8_000,               // age 50–59 and 64+
  enhancedCatchUpLimit: 11_250,      // ages 60–63 (SECURE 2.0)
  annualAdditionsLimit: 72_000,      // IRS 415(c) limit (combat zone max)

  defaultFundReturns: {
    G: 0.040,   // Government Securities: ~4% (guaranteed, no risk of loss)
    F: 0.050,   // Fixed Income Index: ~5% long-term average
    C: 0.100,   // Common Stock Index (S&P 500): ~10% long-term average
    S: 0.095,   // Small Cap Stock Index: ~9.5% long-term average
    I: 0.070,   // International Stock Index: ~7% long-term average
  },

  brsMatchingTiers: {
    auto: 0.01,           // 1% automatic (always, after 60 days service)
    dollarForDollar: 0.03, // dollar-for-dollar match on first 3%
    fiftyPercent: 0.02,    // 50¢ per dollar on next 2%
    maxGovernment: 0.05,   // maximum total government contribution = 5%
  },

  DATA_YEAR: 2026,
} as const;

export type FundKey = 'G' | 'F' | 'C' | 'S' | 'I';

export const FUND_DESCRIPTIONS: Record<FundKey, string> = {
  G: 'G Fund — Government Securities (no loss risk)',
  F: 'F Fund — Fixed Income Index (bonds)',
  C: 'C Fund — Common Stock Index (S&P 500)',
  S: 'S Fund — Small/Mid Cap Stock Index',
  I: 'I Fund — International Stock Index',
};

export const ALLOCATION_PRESETS = {
  conservative: { G: 60, F: 20, C: 10, S: 5,  I: 5  },
  moderate:     { G: 20, F: 10, C: 40, S: 20, I: 10 },
  aggressive:   { G: 0,  F: 0,  C: 60, S: 25, I: 15 },
  cFund100:     { G: 0,  F: 0,  C: 100, S: 0, I: 0  },
} as const;
