/**
 * Payday rules — pure functions, UTC dates only (no server clock, no time zones).
 *
 * Active duty — DoD FMR Vol. 7A, ch. 1:
 *   010701 the payday is the 1st of the month after the month the pay was earned;
 *   paydays fall on the 1st and the 15th (DFAS practice; section 0107 cites 37 U.S.C. 1014);
 *   010702 a payday on a Saturday, Sunday or federal holiday is paid on the earlier
 *   workday, "but not more than 3 days before the scheduled payday."
 * VA compensation — 38 U.S.C. 5120(e): paid on the 1st of the following month; a 1st on
 *   a Saturday or Sunday is paid the Friday before; a 1st on a legal public holiday is
 *   paid the weekday before.
 *
 * Source record and golden lists: docs/sources/paydays-2027.md.
 */

import { OPM_HOLIDAYS, type FederalHoliday } from '@/data/paydays/2027';

const DAY_MS = 86_400_000;

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  return toIso(new Date(toDate(iso).getTime() + n * DAY_MS));
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: string): number {
  return toDate(iso).getUTCDay();
}

const isWeekend = (iso: string) => weekday(iso) === 0 || weekday(iso) === 6;

/** "2027-01" → "2027-02". */
export function nextMonth(period: string): string {
  const [y, m] = period.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

/** "Feb 15" — short label used in "why it moved" notes. */
export function shortDate(iso: string): string {
  return toDate(iso).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
}

/** "January 2027". */
export function monthLabel(period: string): string {
  return toDate(`${period}-01`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
}

/** "Fri, Jan 15, 2027". */
export function tableDate(iso: string): string {
  return toDate(iso).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Years the holiday list covers. A date in any other year can't be checked. */
function coveredYears(holidays: readonly FederalHoliday[]): Set<number> {
  return new Set(holidays.map((h) => Number(h.date.slice(0, 4))));
}

/** Why a scheduled payday isn't a workday, or null if it is. */
export function nonWorkdayReason(iso: string, holidays: readonly FederalHoliday[]): string | null {
  const wd = weekday(iso);
  if (wd === 6) return `${shortDate(iso)} is a Saturday`;
  if (wd === 0) return `${shortDate(iso)} is a Sunday`;
  const h = holidays.find((x) => x.date === iso);
  return h ? `${shortDate(iso)} is ${h.name}` : null;
}

export interface ActiveDutyPayday {
  /** Pay period month, "2027-01". */
  period: string;
  half: 'mid' | 'end';
  /** The 15th of the period, or the 1st of the next month. */
  scheduled: string;
  /** Date paid; null while pending. */
  paid: string | null;
  status: 'computed' | 'pending';
  /** "Feb 15 is Washington's Birthday" — set when paid ≠ scheduled. */
  reason: string | null;
}

/**
 * The workday on or before `scheduled`, under FMR 010702. Returns null when the
 * holiday list doesn't cover the scheduled date's year (the answer can't be known).
 */
export function paidDate(scheduled: string, holidays: readonly FederalHoliday[]): string | null {
  if (!coveredYears(holidays).has(Number(scheduled.slice(0, 4)))) return null;
  const off = new Set(holidays.map((h) => h.date));
  let d = scheduled;
  while (isWeekend(d) || off.has(d)) d = addDays(d, -1);
  return d;
}

/**
 * The 24 active-duty paydays for the pay periods of `year`: the 15th, and the 1st of
 * the next month, each moved to the preceding workday when it's a Saturday, Sunday or
 * federal holiday. A payday in a year `holidays` doesn't cover (the December
 * end-of-month payday on January 1 of the next year, before OPM publishes it) comes
 * back as pending with no date.
 */
export function activeDutyPaydays(year: number, holidays: readonly FederalHoliday[]): ActiveDutyPayday[] {
  const out: ActiveDutyPayday[] = [];
  for (let m = 1; m <= 12; m++) {
    const period = `${year}-${String(m).padStart(2, '0')}`;
    for (const [half, scheduled] of [
      ['mid', `${period}-15`],
      ['end', `${nextMonth(period)}-01`],
    ] as const) {
      const paid = paidDate(scheduled, holidays);
      out.push({
        period,
        half,
        scheduled,
        paid,
        status: paid ? 'computed' : 'pending',
        reason: paid && paid !== scheduled ? nonWorkdayReason(scheduled, holidays) : null,
      });
    }
  }
  return out;
}

export interface VaPayment {
  /** Benefit month, "2027-01". */
  benefitMonth: string;
  /** The 1st of the following month. */
  scheduled: string;
  paid: string;
  /** "May 1 is a Saturday" — set when paid ≠ scheduled. */
  reason: string | null;
}

/**
 * VA compensation payment date for a benefit month (38 U.S.C. 5120(e)): the 1st of the
 * next month; if that's a Saturday or Sunday, the Friday immediately before; if it's a
 * legal public holiday, the weekday immediately before. Throws if the 1st is a weekday
 * in a year the holiday list doesn't cover.
 */
export function vaPaymentDate(benefitMonth: string, holidays: readonly FederalHoliday[] = OPM_HOLIDAYS): VaPayment {
  const scheduled = `${nextMonth(benefitMonth)}-01`;
  const wd = weekday(scheduled);
  let paid = scheduled;
  if (wd === 6) paid = addDays(scheduled, -1);
  else if (wd === 0) paid = addDays(scheduled, -2);
  else {
    if (!coveredYears(holidays).has(Number(scheduled.slice(0, 4)))) {
      throw new Error(`vaPaymentDate: no holiday data for ${scheduled}`);
    }
    if (holidays.some((h) => h.date === scheduled)) {
      paid = addDays(scheduled, -1);
      while (isWeekend(paid)) paid = addDays(paid, -1);
    }
  }
  return { benefitMonth, scheduled, paid, reason: paid === scheduled ? null : nonWorkdayReason(scheduled, holidays) };
}

/** Whole days from `fromIso` to `toIso` (both calendar dates). */
export function daysBetween(fromIso: string, toIsoDate: string): number {
  return Math.round((toDate(toIsoDate).getTime() - toDate(fromIso).getTime()) / DAY_MS);
}
