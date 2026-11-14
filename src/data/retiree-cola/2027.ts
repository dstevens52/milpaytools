/**
 * 2027 military retired pay cost-of-living adjustment (COLA).
 *
 * Source record: docs/sources/pay-raise-cola-2027.md (verified 2026-11-13).
 * - SSA announced a 3.6% COLA on Oct 14, 2026 (CPI-W, Q3 2025 → Q3 2026). SSA pays
 *   December benefits in January; military retired pay runs on DFAS's own schedule.
 * - 10 U.S.C. 1401a(b): retired pay rises each December 1 by the same CPI-W
 *   percent (to the nearest 0.1%), so the military figure matches SSA's.
 * - REDUX / Career Status Bonus electors: the percent minus 1 (1401a(b)(3)) —
 *   computed by reduxPercent(), never typed.
 * - First payment with the increase: the December 2026 entitlement. DFAS retired and
 *   annuitant pay schedule (docs/sources/paydays-2027.md): retired pay for December
 *   2026 is paid December 31, 2026; SBP annuitants are paid January 4, 2027.
 *   (Not "January 2027" — that is Social Security's timing, not military retired pay.)
 *   tests/e2e/pay-dates-data.spec.ts checks both dates against the DFAS table.
 *
 * Annual update: replace with the 2028 figures when SSA announces in October 2027,
 * and take the two first-payment dates from DFAS's retired pay schedule for that
 * December (docs/ANNUAL_DATA_UPDATE.md, docs/RELEASE_DAY_2027_PAY.md).
 */

export interface RetireeCola {
  /** Percent increase, e.g. 3.6. */
  percent: number;
  /** ISO date the increase takes effect (December 1). */
  effectiveDate: string;
  /** ISO date of the first retired pay that includes the increase (DFAS retired pay date for the effective month). */
  firstRetiredPayDate: string;
  /** ISO date of the first SBP annuitant payment that includes the increase (DFAS annuitant pay date). */
  firstAnnuitantPayDate: string;
  /** ISO date SSA announced the CPI-W increase. */
  announcedDate: string;
  sources: { name: string; url: string }[];
}

export const RETIREE_COLA_2027: RetireeCola = {
  percent: 3.6, // SSA, Oct 14 2026; 10 U.S.C. 1401a(b) uses the same CPI-W increase
  effectiveDate: '2026-12-01',
  firstRetiredPayDate: '2026-12-31', // DFAS: December 2026 entitlement, retired pay date
  firstAnnuitantPayDate: '2027-01-04', // DFAS: December 2026 entitlement, annuitant pay date
  announcedDate: '2026-10-14',
  sources: [
    { name: 'SSA: Latest Cost-of-Living Adjustment', url: 'https://www.ssa.gov/oact/cola/latestCOLA.html' },
    { name: '10 U.S.C. 1401a', url: 'https://www.law.cornell.edu/uscode/text/10/1401a' },
    { name: 'DFAS retired and annuitant pay schedule', url: 'https://www.dfas.mil/RetiredMilitary/manage/payschedule/' },
  ],
};

/** REDUX / Career Status Bonus percent: the COLA minus 1 percentage point (10 U.S.C. 1401a(b)(3)). */
export function reduxPercent(cola: RetireeCola = RETIREE_COLA_2027): number {
  return Math.round((cola.percent - 1) * 10) / 10;
}
