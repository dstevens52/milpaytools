/**
 * TRICARE Rate Constants — 2026
 *
 * Sources:
 *   - Tricare Reserve Select premiums: TRICARE.mil, effective January 1, 2026
 *
 * Update annually: TRS premiums typically published October–November for next calendar year.
 */

export const TRICARE_RATES_2026 = {
  year: 2026,

  reserveSelect: {
    memberOnly: 57.88, // $/month — 2026 TRS rate
    memberAndFamily: 286.66, // $/month — 2026 TRS rate
  },
} as const;
