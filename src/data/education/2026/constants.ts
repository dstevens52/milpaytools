/**
 * Education Benefits Rate Data — 2026–2027
 *
 * Source record (the ONLY allowed source for rates, tiers and caps):
 *   docs/sources/education-rates-2026-27.md — retrieved and verified 2026-11-12.
 *
 * Post-9/11 GI Bill (Chapter 33) — effective Aug 1, 2026 to Jul 31, 2027
 *   https://www.va.gov/education/benefit-rates/post-9-11-gi-bill-rates/
 *   Tiers: 38 U.S.C. § 3313(c) (reduced rates 90/80/70/60/50 — no 40% tier).
 * Montgomery GI Bill Active Duty (Chapter 30) — effective Oct 1, 2026 to Sep 30, 2027
 *   https://www.va.gov/education/benefit-rates/montgomery-active-duty-rates/
 * VR&E (Chapter 31) subsistence allowance — FY2027, effective Oct 1, 2026
 *   https://www.benefits.va.gov/vocrehab/vrerates27.asp
 *   https://www.benefits.va.gov/vocrehab/subsistence_allowance_rates.asp
 * Tuition Assistance: DoD Voluntary Education policies (DoDI 1322.25)
 *
 * Location-based GI Bill MHA = E-5 with-dependents BAH at the school ZIP, for
 * EDUCATION_BAH_YEAR (below), read from the BAH registry.
 */

/**
 * The BAH year behind Post-9/11 GI Bill MHA for this academic year
 * (Aug 1, 2026 – Jul 31, 2027). Independent of BAH_YEAR (src/data/bah/current.ts):
 * it stays '2026' after the 2027 BAH release, until VA's Aug 1, 2027 rate change.
 * VA: "We use the 2026 rates to calculate the monthly payment you get between
 * August 1, 2026, and July 31, 2027."
 * https://www.va.gov/education/benefit-rates/post-9-11-gi-bill-rates/
 * (confirmed by Claude Chat 2026-11-13). Must be a year registered in
 * src/data/bah/registry.ts (BAH_RATES_BY_YEAR).
 */
export const EDUCATION_BAH_YEAR = '2026';

export const EDUCATION_RATES = {
  dataYear: '2026',
  academicYear: '2026–2027',

  giBill: {
    /** Effective date of the Chapter 33 rates below. */
    effective: '2026-08-01',
    /** Maximum annual net tuition and fees at private or foreign schools (2026–2027). */
    privateCapAnnual: 30908.34,
    /** Maximum annual books/supplies stipend (prorated by tier). */
    bookStipendAnnualMax: 1000,
    /** Monthly MHA cap for exclusively online students — "We'll pay you up to $1,198" (2026–2027). */
    onlineMHAMonthly: 1198,
    /** Total months of entitlement */
    entitlementMonths: 36,
    /** Months of MHA paid per academic year (2-semester model, no summer) */
    mhaMonthsPerYear: 9,
    /** MHA is paid only when the rate of pursuit is MORE than this (50%). */
    mhaMinRateOfPursuitExclusive: 0.5,
  },

  vre: {
    /** Maximum months of entitlement (may extend to 48 in some cases) */
    entitlementMonths: 48,
    /**
     * Books/supplies estimate for comparison purposes.
     * VR&E covers all required books and supplies with no cap via purchase order.
     * Actual cost varies by program. Using a conservative per-year estimate.
     */
    booksAnnualEstimate: 1200,
    /** Effective date of the standard subsistence table below. */
    subsistenceEffective: '2026-10-01',
    /**
     * Standard Chapter 31 subsistence allowance, institutional training (FY2027).
     * Applies when the Veteran is NOT eligible for the Post-9/11 GI Bill housing-rate option.
     * Chapter 31 pays at half time (unlike Chapter 33 MHA).
     */
    standardSubsistence: {
      full:            { noDependents: 837.23, oneDependent: 1038.49, twoDependents: 1223.79, eachAdditional: 89.18 },
      'three-quarter': { noDependents: 629.08, oneDependent: 780.0,   twoDependents: 914.97,  eachAdditional: 68.6 },
      half:            { noDependents: 420.92, oneDependent: 521.51,  twoDependents: 613.01,  eachAdditional: 45.75 },
    },
    /** Maximum monthly Chapter 31 subsistence (FY2027). */
    maxMonthlySubsistence: 3542.47,
  },

  ta: {
    /** TA rate per credit hour (DoD standard) */
    perCreditHour: 250,
    /** Annual cap per service member */
    annualCap: 4500,
  },

  mgib: {
    /** Effective date of the Chapter 30 rates below. */
    effective: '2026-10-01',
    /** Chapter 30 monthly payment, institutional training, 3+ years of service — full time. */
    fullTimeMonthly: 2601.0,
    /** 3/4 time */
    threeQuarterMonthly: 1950.75,
    /** 1/2 time */
    halfTimeMonthly: 1300.5,
    /** Total months of entitlement */
    entitlementMonths: 36,
    /** Months paid per academic year (same 2-semester model) */
    monthsPerYear: 9,
  },
} as const;

/**
 * Post-9/11 GI Bill eligibility tier percentages by active duty service length
 * after Sept 10, 2001 (VA.gov, rates effective Aug 1, 2026; 38 U.S.C. § 3313(c)).
 * There is no 40% tier.
 */
export const GI_BILL_TIERS: Record<string, number> = {
  'lt-90':  0,    // Less than 90 days — not eligible
  '90d':    50,   // 90 to 179 days (90 days to 5 months)
  '6mo':    60,   // 180 to 544 days (6 to 17 months)
  '12mo':   60,   // 12 months falls in the same 180–544 day band
  '18mo':   70,   // 545 to 729 days (18 to 23 months)
  '24mo':   80,   // 730 to 909 days (24 to 29 months)
  '30mo':   90,   // 910 to 1,094 days (30 to 35 months)
  '36mo+':  100,  // 36+ months, Purple Heart, or 30+ days with service-connected discharge
};

/**
 * Minimum months of active duty represented by each service-length option.
 * Used for the MGIB-AD (Chapter 30) service requirement.
 */
export const SERVICE_TIER_MIN_MONTHS: Record<string, number> = {
  'lt-90':  0,
  '90d':    3,
  '6mo':    6,
  '12mo':   12,
  '18mo':   18,
  '24mo':   24,
  '30mo':   30,
  '36mo+':  36,
};

/**
 * MGIB-AD (Chapter 30) Category I service requirement — source doc section
 * "MGIB-AD (Chapter 30) eligibility — service length": continuous active duty of
 * at least 3 years, or 2 years if that was the enlistment agreement, or 2 years
 * plus 4 in the Selected Reserve ("2 by 4"). Every path needs at least 2 years of
 * active duty, and the calculator can't see the enlistment agreement, so it applies
 * the 24-month floor. Early-separation exceptions are noted on the card, not modeled.
 */
export const MGIB_MIN_SERVICE_MONTHS = 24;

export const SERVICE_TIER_LABELS: Record<string, string> = {
  'lt-90':  'Less than 90 days',
  '90d':    '90 days',
  '6mo':    '6 months',
  '12mo':   '12 months',
  '18mo':   '18 months',
  '24mo':   '24 months',
  '30mo':   '30 months',
  '36mo+':  '36+ months',
};

/** Lowest and highest non-zero tier, for UI hints ("50%–100%"). */
export function tierRange(): { min: number; max: number } {
  const v = Object.values(GI_BILL_TIERS).filter((t) => t > 0);
  return { min: Math.min(...v), max: Math.max(...v) };
}
