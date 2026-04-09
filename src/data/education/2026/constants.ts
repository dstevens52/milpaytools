/**
 * Education Benefits Rate Data — 2026
 *
 * Sources:
 *   Post-9/11 GI Bill (Chapter 33): VA.gov
 *     https://www.va.gov/education/about-gi-bill-benefits/post-9-11/
 *   VR&E (Chapter 31): VA.gov
 *     https://www.va.gov/careers-employment/vocational-rehabilitation/
 *   Tuition Assistance: DoD Voluntary Education policies (DoDI 1322.25)
 *   Montgomery GI Bill (Chapter 30): VA.gov
 *     https://www.va.gov/education/about-gi-bill-benefits/montgomery-active-duty/
 *
 * Academic year note: GI Bill rates update August 1 each year.
 * This file reflects 2026–2027 academic year rates (effective Aug 1, 2026)
 * using 2026 BAH data for MHA calculations.
 * The current academic year (through Jul 31, 2026) uses 2025 BAH rates.
 */

export const EDUCATION_RATES = {
  dataYear: '2026',
  academicYear: '2026–2027',

  giBill: {
    /** Maximum annual tuition coverage at private/foreign schools (2026-2027 academic year) */
    privateCapAnnual: 30908.34,
    /** Maximum annual books/supplies stipend */
    bookStipendAnnualMax: 1000,
    /** Monthly MHA for exclusively online students (half national average E-5 w/dep BAH) */
    onlineMHAMonthly: 1261,
    /** Total months of entitlement */
    entitlementMonths: 36,
    /** Months of MHA paid per academic year (2-semester model, no summer) */
    mhaMonthsPerYear: 9,
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
  },

  ta: {
    /** TA rate per credit hour (DoD standard) */
    perCreditHour: 250,
    /** Annual cap per service member */
    annualCap: 4500,
  },

  mgib: {
    /** Chapter 30 monthly payment — full-time, 2025-2026 rate */
    fullTimeMonthly: 2185,
    /** Total months of entitlement */
    entitlementMonths: 36,
    /** Months paid per academic year (same 2-semester model) */
    monthsPerYear: 9,
  },
} as const;

/**
 * Post-9/11 GI Bill eligibility tier percentages by active duty service length.
 * Eligibility begins at 90 aggregate days on active duty after September 10, 2001.
 */
export const GI_BILL_TIERS: Record<string, number> = {
  'lt-90':  0,    // Less than 90 days — not eligible
  '90d':    40,   // 90 aggregate days
  '6mo':    50,   // 6 months
  '12mo':   60,   // 12 months
  '18mo':   70,   // 18 months
  '24mo':   80,   // 24 months
  '30mo':   90,   // 30 months
  '36mo+':  100,  // 36+ months, Purple Heart, or 30+ days with service-connected discharge
};

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
