/**
 * Standard CONUS per diem rates (GSA), by federal fiscal year.
 *
 * The standard CONUS rate applies wherever GSA sets no higher locality rate. The PCS
 * estimator uses it for en route per diem (MALT Plus is paid "at the standard CONUS per
 * diem rate", JTR Table 5-4) and as the locality rate for TLE (a ceiling: higher-cost
 * areas have higher locality rates).
 *
 * Rules and provenance: docs/sources/pcs-rules-2026.md §3.
 * Add each new fiscal year when GSA publishes its FTR bulletin (usually August/September).
 */

export interface ConusPerDiemRate {
  /** Federal fiscal year, e.g. 'FY2027' = Oct 1, 2026 – Sep 30, 2027. */
  fiscalYear: string;
  /** First day the rate applies (ISO date, inclusive). */
  start: string;
  /** Last day the rate applies (ISO date, inclusive). */
  end: string;
  lodging: number;
  mie: number;
  source: { label: string; url: string };
}

export const CONUS_PER_DIEM: Record<'FY2026' | 'FY2027', ConusPerDiemRate> = {
  FY2026: {
    fiscalYear: 'FY2026',
    start: '2025-10-01',
    end: '2026-09-30',
    lodging: 110,
    mie: 68,
    source: {
      label: 'GSA FTR Bulletin 26-01 (Federal Register, Aug 19, 2025)',
      url: 'https://www.federalregister.gov/documents/2025/08/19/2025-15771/maximum-per-diem-reimbursement-rates-for-the-continental-united-states-conus',
    },
  },
  FY2027: {
    fiscalYear: 'FY2027',
    start: '2026-10-01',
    end: '2027-09-30',
    lodging: 113,
    mie: 68,
    source: {
      label: 'GSA FTR Bulletin 27-01 (Federal Register, Sep 10, 2026)',
      url: 'https://www.federalregister.gov/documents/2026/09/10/2026-18439/maximum-per-diem-reimbursement-rates-for-the-continental-united-states-conus',
    },
  },
};

/**
 * The rate the estimator uses. It has no move-date input, so it uses the newest fiscal
 * year (moves on or after Oct 1, 2026) and labels it "FY2027 standard CONUS rate".
 */
export const PCS_PER_DIEM_RATE: ConusPerDiemRate = CONUS_PER_DIEM.FY2027;

/** The fiscal-year rate in effect on an ISO date (YYYY-MM-DD), or null outside the stored years. */
export function conusPerDiemForDate(isoDate: string): ConusPerDiemRate | null {
  for (const r of Object.values(CONUS_PER_DIEM)) {
    if (isoDate >= r.start && isoDate <= r.end) return r;
  }
  return null;
}
