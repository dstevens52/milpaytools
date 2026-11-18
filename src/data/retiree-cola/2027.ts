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

// ─── /pay/raise "2027 COLA for military retired pay" section (S8) ───────────
//
// Every item records its source. An item with no published source is null, and the
// section leaves it out. Never fill one in from a past year's notice.
//
// Checked 2026-11-18 (Chrome, pages read in full):
// - SSA latest COLA page: "The latest COLA is 3.6 percent … beginning with the
//   December 2026 benefits".
// - Timing: the same dates as RETIREE_COLA_2027 above (approved 2026-11-13), which
//   the FAQ and the key-dates card on /pay/raise already show: effective Dec 1
//   (10 U.S.C. 1401a(b)), first in the December 2026 retired pay, paid on the DFAS
//   retired and annuitant pay schedule dates. Read from there, never re-typed.
// - DFAS CSB/REDUX page (updated Dec 18, 2024): "Cost of Living Adjustments (COLA)
//   are also reduced by one percent." At 62: "your retired pay will be restored to
//   the same amount paid under the High-3 System. Full COLA rates will be applied to
//   your new computation, but the COLA will continue to be applied at the reduced
//   rate each year following." Matches 10 U.S.C. 1410 (recomputed as if 1401a(b)(2)
//   COLAs applied and no 1409(b)(2) multiplier reduction).
// - DFAS retiree newsletter / COLA page (updated Sept 30, 2026): latest COLA article
//   is the 2026 one (December 2025 issue). No 2027 table of first COLAs for members
//   retired during 2026, so `partialFirstYear` stays null.
//
// When DFAS posts its 2027 notice: fill `partialFirstYear` from its table (quote the
// notice in the comment), set `checked`, and the section shows it.
//
// RETIREE_COLA_2027 above stays the one source for the percent and the dates; the
// /pay/raise FAQ answer (frozen under the pay meta guard until ~Dec 10) reads it too.

export interface OfficialSource {
  name: string;
  url: string;
}

export interface RetireeColaSection {
  /** COLA year (the increase takes effect the December before). */
  year: number;
  /** ISO date the DFAS and SSA pages were last read for this section. */
  checked: string;
  /** The 2027 COLA percent (SSA). */
  percent: { value: number; source: OfficialSource };
  /** When the increase takes effect and the first retired pay / annuitant payment with it. */
  timing: {
    effectiveDate: string;
    firstRetiredPayDate: string;
    firstAnnuitantPayDate: string;
    source: OfficialSource;
  } | null;
  /** CSB/REDUX: COLA minus this many percentage points (DFAS). */
  redux: { minusPoints: number; source: OfficialSource } | null;
  /** DFAS table of first COLAs for members whose retired pay started during 2026. */
  partialFirstYear: {
    rows: { retiredPayStarted: string; percent: number; reduxPercent?: number }[];
    source: OfficialSource;
  } | null;
}

export const SSA_LATEST_COLA: OfficialSource = {
  name: 'SSA: Latest Cost-of-Living Adjustment',
  url: 'https://www.ssa.gov/oact/cola/latestCOLA.html',
};

export const DFAS_CSB_REDUX: OfficialSource = {
  name: 'DFAS: Career Status Bonus (CSB)/REDUX',
  url: 'https://www.dfas.mil/retiredmilitary/plan/estimate/csbredux/',
};

export const DFAS_PAY_SCHEDULE: OfficialSource = {
  name: 'DFAS retired and annuitant pay schedule',
  url: 'https://www.dfas.mil/RetiredMilitary/manage/payschedule/',
};

export const RETIREE_COLA_2027_SECTION: RetireeColaSection = {
  year: 2027,
  checked: '2026-11-18',
  percent: { value: RETIREE_COLA_2027.percent, source: SSA_LATEST_COLA },
  // Same dates the FAQ and key-dates card show (RETIREE_COLA_2027).
  timing: {
    effectiveDate: RETIREE_COLA_2027.effectiveDate,
    firstRetiredPayDate: RETIREE_COLA_2027.firstRetiredPayDate,
    firstAnnuitantPayDate: RETIREE_COLA_2027.firstAnnuitantPayDate,
    source: DFAS_PAY_SCHEDULE,
  },
  redux: { minusPoints: 1, source: DFAS_CSB_REDUX },
  partialFirstYear: null, // DFAS 2027 table not posted as of 2026-11-18
};
