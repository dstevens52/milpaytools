/**
 * 2027 military retired pay cost-of-living adjustment (COLA).
 *
 * Source record: docs/sources/pay-raise-cola-2027.md (verified 2026-11-13).
 * - SSA announced a 3.6% COLA on Oct 14, 2026 (CPI-W, Q3 2025 → Q3 2026), payable
 *   with December 2026 benefits paid in January 2027.
 * - 10 U.S.C. 1401a(b): retired pay rises each December 1 by the same CPI-W
 *   percent (to the nearest 0.1%), so the military figure matches SSA's.
 * - REDUX / Career Status Bonus electors: the percent minus 1 (1401a(b)(3)) —
 *   computed by reduxPercent(), never typed.
 *
 * Annual update: replace with the 2028 figures when SSA announces in October 2027
 * (docs/ANNUAL_DATA_UPDATE.md, docs/RELEASE_DAY_2027_PAY.md).
 */

export interface RetireeCola {
  /** Percent increase, e.g. 3.6. */
  percent: number;
  /** ISO date the increase takes effect. */
  effectiveDate: string;
  /** First payment that includes the increase. */
  firstPaidMonth: string;
  /** ISO date SSA announced the CPI-W increase. */
  announcedDate: string;
  sources: { name: string; url: string }[];
}

export const RETIREE_COLA_2027: RetireeCola = {
  percent: 3.6, // SSA, Oct 14 2026; 10 U.S.C. 1401a(b) uses the same CPI-W increase
  effectiveDate: '2026-12-01',
  firstPaidMonth: 'January 2027',
  announcedDate: '2026-10-14',
  sources: [
    { name: 'SSA: Latest Cost-of-Living Adjustment', url: 'https://www.ssa.gov/oact/cola/latestCOLA.html' },
    { name: '10 U.S.C. 1401a', url: 'https://www.law.cornell.edu/uscode/text/10/1401a' },
  ],
};

/** REDUX / Career Status Bonus percent: the COLA minus 1 percentage point (10 U.S.C. 1401a(b)(3)). */
export function reduxPercent(cola: RetireeCola = RETIREE_COLA_2027): number {
  return Math.round((cola.percent - 1) * 10) / 10;
}
