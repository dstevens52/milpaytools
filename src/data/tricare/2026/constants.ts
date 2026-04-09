/**
 * TRICARE Rate Constants — 2026
 *
 * Sources:
 *   - Tricare Reserve Select premiums: TRICARE.mil, effective January 1, 2026
 *   - Civilian health insurance comparison: KFF Employer Health Benefits Survey 2025
 *     (approximate — actual costs vary widely by employer, plan, and region)
 *
 * Update annually: TRS premiums typically published October–November for next calendar year.
 */

export const TRICARE_RATES_2026 = {
  year: 2026,

  reserveSelect: {
    memberOnly: 57.88, // $/month — 2026 TRS rate
    memberAndFamily: 286.66, // $/month — 2026 TRS rate
  },

  // Approximate civilian health insurance cost (employer + employee combined)
  // Source: KFF Employer Health Benefits Survey — used for educational comparison only
  civilianComparison: {
    individualAnnual: 7500, // rough average total cost (employer + employee share)
    familyAnnual: 23000, // rough average total cost (employer + employee share)
  },
} as const;
