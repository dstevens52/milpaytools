/**
 * Annual constants — update this file every January when DoD/IRS publishes new rates.
 * Sources:
 *   BAS:  https://militarypay.defense.gov/Pay/Allowances/bas/
 *   TSP:  https://www.tsp.gov/making-contributions/contribution-limits/
 *   SGLI: https://www.benefits.va.gov/insurance/sgli.asp
 */

export const DATA_YEAR = '2026';

// ─── Basic Allowance for Subsistence (BAS) ────────────────────────────────
// Monthly rates — tax-free
// Source: https://militarypay.defense.gov/Pay/Allowances/bas/
export const BAS_RATES = {
  enlisted: 460.25,
  officer:  316.98,
} as const;

// ─── TSP Contribution Limits ──────────────────────────────────────────────
// IRS 415(c) elective deferral limit
export const TSP_ELECTIVE_DEFERRAL_LIMIT = 23_500;  // TODO: verify FY2026 IRS limit
// Catch-up contribution limit (age 50+)
export const TSP_CATCHUP_LIMIT = 7_500;
// BRS: DoD matches up to 4% of basic pay (after 2-year vesting cliff for 1–2%)
export const BRS_AUTOMATIC_CONTRIBUTION_PCT = 0.01; // 1% automatic regardless
export const BRS_MATCHING_MAX_PCT = 0.04;           // DoD matches up to 4%

// ─── SGLI ─────────────────────────────────────────────────────────────────
// Coverage in $50k increments from $0 to $500k
export const SGLI_MAX_COVERAGE = 500_000;
export const SGLI_PREMIUM_PER_1000 = 0.06; // $0.06 per $1,000 of coverage per month
export const SGLI_TSGLI_PREMIUM = 1.00;    // $1.00/month flat for TSGLI

// ─── Retirement Systems ───────────────────────────────────────────────────
// Legacy: 2.5% × years × final base pay (cliff vest at 20 years)
export const LEGACY_RETIREMENT_MULTIPLIER = 0.025;
// BRS: 2.0% × years × average of highest 36 months base pay
export const BRS_RETIREMENT_MULTIPLIER = 0.020;

// ─── Federal Tax Brackets 2026 (Single filer, approximate) ───────────────
// Used only for illustrating tax-advantage of BAH/BAS
// TODO: verify final IRS 2026 bracket inflation adjustments
export const FED_TAX_BRACKETS_SINGLE = [
  { upTo: 11_925, rate: 0.10 },
  { upTo: 48_475, rate: 0.12 },
  { upTo: 103_350, rate: 0.22 },
  { upTo: 197_300, rate: 0.24 },
  { upTo: 250_525, rate: 0.32 },
  { upTo: 626_350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
] as const;

// Standard deduction (single), approximate 2026
export const STANDARD_DEDUCTION_SINGLE = 15_000;
