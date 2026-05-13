/**
 * Healthcare Cost Comparison — 2026 Reference Data
 *
 * Sources:
 *   - Employer-sponsored plans: KFF Employer Health Benefits Survey 2025 (national averages)
 *   - ACA Marketplace rates: KFF Health Insurance Marketplace Calculator 2026 estimates
 *   - ACA Federal Poverty Levels: HHS 2026 FPL guidelines
 *   - VA copay schedule: VA.gov copay rates, effective January 1, 2026
 *   - TRICARE Reserve Select premiums: TRICARE.mil, effective January 1, 2026
 *   - TAMP coverage: DoDI 1341.10, 10 U.S.C. § 1145
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

  // 2026 Federal Poverty Level thresholds (contiguous U.S.)
  fpl: {
    base1: 15650,
    increment: 5500, // per additional person above 1
  },

  // Subsidy percentage bands by FPL % (approximate 2026 APTC estimates)
  acaSubsidyBands: [
    { maxPct: 150, subsidyRate: 0.90 },
    { maxPct: 250, subsidyRate: 0.75 },
    { maxPct: 400, subsidyRate: 0.40 },
  ] as const,

  va: {
    '50plus': {
      monthlyCopayEst: 0,
      primaryCopay: 0,
      specialistCopay: 0,
      label: '50%+ disability rating',
      note: '$0 copays for service-connected conditions. No premiums.',
    },
    '30to40': {
      monthlyCopayEst: 15,
      primaryCopay: 15,
      specialistCopay: 50,
      label: '30–40% disability rating',
      note: '$15 primary / $50 specialist for service-connected conditions. No premiums.',
    },
    '10to20': {
      monthlyCopayEst: 15,
      primaryCopay: 15,
      specialistCopay: 50,
      label: '10–20% disability rating',
      note: '$15 primary / $50 specialist for service-connected conditions. No premiums.',
    },
    '0sc': {
      monthlyCopayEst: 0,
      primaryCopay: 0,
      specialistCopay: 0,
      label: '0% service-connected rating',
      note: 'Coverage limited to service-connected conditions only.',
    },
  },

  tricareReserveSelect: {
    single: { premium: 52,  deductible: 150, oopMax: 3000 },
    family: { premium: 260, deductible: 300, oopMax: 6000 },
  },

  tamp: {
    premium: 0,
    deductible: 0,
    durationDays: 180,
    note: 'Free TRICARE coverage for 180 days post-separation. TAMP is a bridge — you need a follow-on plan before day 181.',
  },
} as const;

export type PlanTier = 'bronze' | 'silver' | 'gold';
export type VaRating = '50plus' | '30to40' | '10to20' | '0sc';
export type CoveragePath = 'employer' | 'aca-no-subsidy' | 'aca-subsidy' | 'va' | 'trs' | 'tamp';
export type FamilyStatus =
  | 'single'
  | 'married-no-kids'
  | 'married-1-child'
  | 'married-2-children'
  | 'married-3plus'
  | 'single-parent';
