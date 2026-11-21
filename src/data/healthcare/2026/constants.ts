/**
 * Healthcare Cost Comparison — 2026 Reference Data
 *
 * Sources:
 *   - Employer-sponsored plans: KFF Employer Health Benefits Survey 2025 (national averages)
 *   - ACA Marketplace rates: KFF Health Insurance Marketplace Calculator 2026 estimates
 *     (list prices; premium tax credits are not modeled — HC-02, build 10a)
 *   - VA healthcare: VA.gov priority groups and eligibility, 2026
 *   - TRICARE Reserve Select and retiree TRICARE: not here. The calculator reads src/data/tricare/current.ts.
 *   - TAMP coverage: 10 U.S.C. § 1145 (who qualifies: src/data/separation/rules.ts)
 *
 * All figures are national averages or approximations for educational comparison only.
 * Actual costs vary significantly by region, employer, health status, and utilization.
 */

export const HEALTHCARE_2026 = {
  year: 2026,

  employer: {
    single: {
      bronze: { premium: 105, deductible: 3500, oopMax: 8000 },
      silver: { premium: 170, deductible: 2000, oopMax: 6500 },
      gold:   { premium: 250, deductible: 1000, oopMax: 5000 },
    },
    family: {
      bronze: { premium: 450, deductible: 7000, oopMax: 16000 },
      silver: { premium: 570, deductible: 4000, oopMax: 13000 },
      gold:   { premium: 750, deductible: 2000, oopMax: 10000 },
    },
  },

  acaNoSubsidy: {
    single: {
      bronze: { premium: 350, deductible: 7500 },
      silver: { premium: 500, deductible: 5000 },
      gold:   { premium: 650, deductible: 2000 },
    },
    family: {
      bronze: { premium: 1200, deductible: 15000 },
      silver: { premium: 1600, deductible: 10000 },
      gold:   { premium: 2100, deductible:  4000 },
    },
  },

  va: {
    '50plus': {
      monthlyCopayEst: 0,
      label: '50%+ disability rating (Priority Group 1)',
      note: 'No premiums. Priority Group 1 generally has no copays for care. Covers veteran only, not family.',
    },
    '30to40': {
      monthlyCopayEst: 0,
      label: '30–40% disability rating',
      note: '$0 for service-connected care. No premiums. Copays for non-SC care vary by priority group. Covers veteran only.',
    },
    '10to20': {
      monthlyCopayEst: 0,
      label: '10–20% disability rating',
      note: '$0 for service-connected care. No premiums. Copays for non-SC care vary by priority group. Covers veteran only.',
    },
    '0sc': {
      monthlyCopayEst: 0,
      label: '0% service-connected rating',
      note: 'No premiums. What you pay for care depends on your VA priority group (see VA.gov). Covers veteran only.',
    },
  },

  tamp: {
    premium: 0,
    deductible: 0,
    durationDays: 180,
    note: 'If you qualify for TAMP, TRICARE continues for 180 days, starting on your separation date (day 1). TAMP is a bridge — you need a follow-on plan before day 181.',
  },
} as const;

export type PlanTier = 'bronze' | 'silver' | 'gold';
export type VaRating = '50plus' | '30to40' | '10to20' | '0sc';
export type CoveragePath = 'employer' | 'aca-no-subsidy' | 'va' | 'trs' | 'tricare-retiree' | 'tamp';
/** Retiree TRICARE plan (tricare-retiree path). */
export type RetireePlan = 'prime' | 'select';
/** Retiree TRICARE group: A = entered service before Jan. 1, 2018; B = on or after. */
export type RetireeGroup = 'a' | 'b';
export type FamilyStatus =
  | 'single'
  | 'married-no-kids'
  | 'married-1-child'
  | 'married-2-children'
  | 'married-3plus'
  | 'single-parent';
