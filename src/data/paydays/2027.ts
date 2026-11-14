/**
 * Military pay dates 2027 — official tables and the inputs the payday rules run on.
 *
 * Source record: docs/sources/paydays-2027.md (verified by Claude Chat 2026-11-13).
 * Everything here is typed from that doc. The 2027 active-duty and VA dates are NOT
 * typed: src/lib/calculations/paydays.ts computes them from the OPM holidays below,
 * and tests/e2e/pay-dates-data.spec.ts pins them to the doc's golden lists. The same
 * code reproduces DFAS's 2026 active-duty table 24/24 (the proof test).
 *
 * Not here on purpose: bank early-deposit dates (bank policy, not DFAS) and 2027 LES
 * dates (DFAS hasn't published them).
 *
 * Annual update: when DFAS posts its 2027 active-duty table, compare it to the
 * computed list (the test will show any difference), then swap the "computed" label
 * on /pay/dates for the official table. Add the next year's OPM holidays and DFAS
 * retired pay schedule each fall.
 */

export interface FederalHoliday {
  /** ISO date the holiday is observed for federal pay and leave. */
  date: string;
  name: string;
}

/**
 * OPM federal holidays (https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/).
 * Observed dates, as OPM lists them (a Saturday holiday moves to the Friday before,
 * a Sunday holiday to the Monday after; 5 U.S.C. 6103(b)).
 */
export const OPM_HOLIDAYS_2026: readonly FederalHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-19', name: 'Birthday of Martin Luther King, Jr.' },
  { date: '2026-02-16', name: "Washington's Birthday" },
  { date: '2026-05-25', name: 'Memorial Day' },
  { date: '2026-06-19', name: 'Juneteenth National Independence Day' },
  { date: '2026-07-03', name: 'Independence Day' }, // observed; Jul 4 is a Saturday
  { date: '2026-09-07', name: 'Labor Day' },
  { date: '2026-10-12', name: 'Columbus Day' },
  { date: '2026-11-11', name: 'Veterans Day' },
  { date: '2026-11-26', name: 'Thanksgiving Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
];

export const OPM_HOLIDAYS_2027: readonly FederalHoliday[] = [
  { date: '2027-01-01', name: "New Year's Day" },
  { date: '2027-01-18', name: 'Birthday of Martin Luther King, Jr.' },
  { date: '2027-02-15', name: "Washington's Birthday" },
  { date: '2027-05-31', name: 'Memorial Day' },
  { date: '2027-06-18', name: 'Juneteenth National Independence Day' }, // observed; Jun 19 is a Saturday
  { date: '2027-07-05', name: 'Independence Day' }, // observed; Jul 4 is a Sunday
  { date: '2027-09-06', name: 'Labor Day' },
  { date: '2027-10-11', name: 'Columbus Day' },
  { date: '2027-11-11', name: 'Veterans Day' },
  { date: '2027-11-25', name: 'Thanksgiving Day' },
  { date: '2027-12-24', name: 'Christmas Day' }, // observed; Dec 25 is a Saturday
];

/** Every OPM holiday on file. OPM hasn't published 2028, so any 2028 payday is left pending. */
export const OPM_HOLIDAYS: readonly FederalHoliday[] = [...OPM_HOLIDAYS_2026, ...OPM_HOLIDAYS_2027];

/** One row of DFAS's active-duty payday table: a pay period's two paydays and their LES dates. */
export interface DfasActiveDutyRow {
  /** Pay period month, "2026-01". */
  period: string;
  midMonth: string;
  midMonthLes: string;
  endOfMonth: string;
  endOfMonthLes: string;
}

/**
 * DFAS 2026 Active Duty Paydays (official; page updated August 25, 2026), verbatim.
 * https://www.dfas.mil/MilitaryMembers/payentitlements/2026ACPayDay/
 */
export const DFAS_ACTIVE_DUTY_2026: readonly DfasActiveDutyRow[] = [
  { period: '2026-01', midMonth: '2026-01-15', midMonthLes: '2026-01-08', endOfMonth: '2026-01-30', endOfMonthLes: '2026-01-23' },
  { period: '2026-02', midMonth: '2026-02-13', midMonthLes: '2026-02-06', endOfMonth: '2026-02-27', endOfMonthLes: '2026-02-20' },
  { period: '2026-03', midMonth: '2026-03-13', midMonthLes: '2026-03-06', endOfMonth: '2026-04-01', endOfMonthLes: '2026-03-25' },
  { period: '2026-04', midMonth: '2026-04-15', midMonthLes: '2026-04-08', endOfMonth: '2026-05-01', endOfMonthLes: '2026-04-25' },
  { period: '2026-05', midMonth: '2026-05-15', midMonthLes: '2026-05-08', endOfMonth: '2026-06-01', endOfMonthLes: '2026-05-22' },
  { period: '2026-06', midMonth: '2026-06-15', midMonthLes: '2026-06-05', endOfMonth: '2026-07-01', endOfMonthLes: '2026-06-24' },
  { period: '2026-07', midMonth: '2026-07-15', midMonthLes: '2026-07-08', endOfMonth: '2026-07-31', endOfMonthLes: '2026-07-24' },
  { period: '2026-08', midMonth: '2026-08-14', midMonthLes: '2026-08-07', endOfMonth: '2026-09-01', endOfMonthLes: '2026-08-25' },
  { period: '2026-09', midMonth: '2026-09-15', midMonthLes: '2026-09-10', endOfMonth: '2026-10-01', endOfMonthLes: '2026-09-24' },
  { period: '2026-10', midMonth: '2026-10-15', midMonthLes: '2026-10-09', endOfMonth: '2026-10-30', endOfMonthLes: '2026-10-23' },
  { period: '2026-11', midMonth: '2026-11-13', midMonthLes: '2026-11-07', endOfMonth: '2026-12-01', endOfMonthLes: '2026-11-24' },
  { period: '2026-12', midMonth: '2026-12-15', midMonthLes: '2026-12-10', endOfMonth: '2026-12-31', endOfMonthLes: '2026-12-24' },
];

/**
 * Pay periods shown in the "Rest of 2026" table. A fixed list, not "rows after
 * today": the page is prerendered, so nothing may depend on the server clock.
 */
export const REST_OF_2026_PERIODS = ['2026-11', '2026-12'] as const;

/** One row of DFAS's retired and annuitant pay schedule. */
export interface RetiredPayRow {
  /** Entitlement month, "2026-10". */
  month: string;
  retired: string;
  annuitant: string;
}

/**
 * DFAS retired and annuitant pay schedule (official; page updated Sept. 16, 2026), verbatim.
 * https://www.dfas.mil/RetiredMilitary/manage/payschedule/
 * (The page's example sentence says November 2, 2026 for the October retired pay; its
 * table says October 30, 2026. The table is followed, per the source doc.)
 */
export const DFAS_RETIRED_PAY: readonly RetiredPayRow[] = [
  { month: '2026-10', retired: '2026-10-30', annuitant: '2026-11-02' },
  { month: '2026-11', retired: '2026-12-01', annuitant: '2026-12-01' },
  { month: '2026-12', retired: '2026-12-31', annuitant: '2027-01-04' },
  { month: '2027-01', retired: '2027-02-01', annuitant: '2027-02-01' },
  { month: '2027-02', retired: '2027-03-01', annuitant: '2027-03-01' },
  { month: '2027-03', retired: '2027-04-01', annuitant: '2027-04-01' },
  { month: '2027-04', retired: '2027-04-30', annuitant: '2027-05-03' },
  { month: '2027-05', retired: '2027-06-01', annuitant: '2027-06-01' },
  { month: '2027-06', retired: '2027-07-01', annuitant: '2027-07-01' },
  { month: '2027-07', retired: '2027-07-30', annuitant: '2027-08-02' },
  { month: '2027-08', retired: '2027-09-01', annuitant: '2027-09-01' },
  { month: '2027-09', retired: '2027-10-01', annuitant: '2027-10-01' },
  { month: '2027-10', retired: '2027-11-01', annuitant: '2027-11-01' },
  { month: '2027-11', retired: '2027-12-01', annuitant: '2027-12-01' },
  { month: '2027-12', retired: '2027-12-31', annuitant: '2028-01-03' },
];

/** Benefit months in the VA table (December 2026 through December 2027). */
export const VA_BENEFIT_MONTHS: readonly string[] = [
  '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06',
  '2027-07', '2027-08', '2027-09', '2027-10', '2027-11', '2027-12',
];

/**
 * The December 2027 end-of-month payday (scheduled Saturday, January 1, 2028) is not
 * computed: OPM treats Friday, December 31, 2027 as the New Year's holiday for federal
 * employees, and DFAS hasn't said which day it will pay. (The December 2021 precedent
 * is left out: the sources found conflict and DFAS's own 2021 table couldn't be read.)
 */
export const PENDING_JAN_2028_TEXT =
  'Not yet published. January 1, 2028 is a Saturday and OPM treats Friday, December 31, 2027 as the New Year\'s holiday for federal employees, so DFAS will pay either Thursday, December 30 or Friday, December 31.';

/** What the "next payday" widget says when the next payday is the pending one. */
export const PENDING_JAN_2028_WIDGET = "late December 2027 (DFAS hasn't published the exact date)";

/** Date DFAS's 2027 active-duty page was last checked and found empty. */
export const DFAS_2027_CHECKED = '2026-11-13';

export const PAYDAY_SOURCES = {
  fmr: {
    name: 'DoD FMR Vol. 7A, ch. 1, 010701–010702 (paydays)',
    url: 'https://comptroller.war.gov/Portals/45/documents/fmr/current/07a/07a_01.pdf',
  },
  usc37_1014: { name: '37 U.S.C. 1014 (mid-month payment)', url: 'https://www.law.cornell.edu/uscode/text/37/1014' },
  dfas2026: {
    name: 'DFAS 2026 Active Duty Paydays',
    url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/2026ACPayDay/',
  },
  dfas2027: {
    name: 'DFAS 2027 Active Duty Paydays (not yet published)',
    url: 'https://www.dfas.mil/MilitaryMembers/payentitlements/2027ACPayDay/',
  },
  opm: { name: 'OPM federal holidays', url: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/' },
  dfasRetired: { name: 'DFAS retired and annuitant pay schedule', url: 'https://www.dfas.mil/RetiredMilitary/manage/payschedule/' },
  usc1401a: { name: '10 U.S.C. 1401a (retired pay COLA)', url: 'https://www.law.cornell.edu/uscode/text/10/1401a' },
  ssaCola: { name: 'SSA: Latest Cost-of-Living Adjustment', url: 'https://www.ssa.gov/oact/cola/latestCOLA.html' },
  usc5120: { name: '38 U.S.C. 5120(e) (VA payment dates)', url: 'https://www.law.cornell.edu/uscode/text/38/5120' },
} as const;
