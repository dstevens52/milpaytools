/**
 * /pay/dates — every string the page and its FAQ schema show, built from data.
 * Source record: docs/sources/paydays-2027.md. Dates come from src/data/paydays/2027.ts
 * (official tables) or src/lib/calculations/paydays.ts (computed); none are typed here.
 */

import {
  OPM_HOLIDAYS,
  DFAS_ACTIVE_DUTY_2026,
  DFAS_RETIRED_PAY,
  REST_OF_2026_PERIODS,
  VA_BENEFIT_MONTHS,
  DFAS_2027_CHECKED,
  PENDING_JAN_2028_WIDGET,
} from '@/data/paydays/2027';
import { activeDutyPaydays, vaPaymentDate, monthLabel, type ActiveDutyPayday, type VaPayment } from '@/lib/calculations/paydays';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';
import { KEY_DATES_2027, getCalendar2027, weekdayDate } from '@/data/calendar-2027';
import { formatIsoDate, formatPercent, retireeColaTiming } from '@/lib/calculations/payRaise';
import type { FaqItem } from '@/components/FaqSection';

export const PAY_DATES_PATH = '/pay/dates';
/** Root layout appends " | MilPayTools" (60 characters in all). */
export const PAY_DATES_TITLE = 'Military Pay Dates 2027: Active Duty & Retiree';
export const PAY_DATES_H1 = 'Military Pay Dates 2027: Active Duty, Retiree and VA';
export const PAY_DATES_DESCRIPTION =
  'Every 2027 military payday: active duty on the 1st and 15th, moved for weekends and holidays, plus retired, annuitant and VA disability payment dates.';
export const PAY_DATES_PUBLISHED = '2026-11-13';

/** The 2027 active-duty paydays (24: 23 computed + the pending January 1, 2028 payday). */
export function paydays2027(): ActiveDutyPayday[] {
  return activeDutyPaydays(2027, OPM_HOLIDAYS);
}

/** VA payment dates, December 2026 through December 2027 benefit months. */
export function vaPayments2027(): VaPayment[] {
  return VA_BENEFIT_MONTHS.map((m) => vaPaymentDate(m));
}

/** Rest of 2026 (official DFAS rows, with LES dates). */
export function restOf2026() {
  return DFAS_ACTIVE_DUTY_2026.filter((r) => (REST_OF_2026_PERIODS as readonly string[]).includes(r.period)).flatMap((r) => [
    { period: r.period, half: 'mid' as const, paid: r.midMonth, les: r.midMonthLes },
    { period: r.period, half: 'end' as const, paid: r.endOfMonth, les: r.endOfMonthLes },
  ]);
}

/** Retired and annuitant rows shown on the page (the whole DFAS table, Oct 2026–Dec 2027). */
export const retiredPayRows = () => DFAS_RETIRED_PAY;

export const periodLabel = (period: string, half: 'mid' | 'end') =>
  `${monthLabel(period)}, ${half === 'mid' ? 'mid-month' : 'end of month'}`;

// ─── Copy ────────────────────────────────────────────────────────────────────

export function answerLines(): [string, string, string] {
  return [
    'Active duty is paid on the 1st and 15th, moved to the workday before when that day is a weekend or federal holiday.',
    `The ${formatIsoDate(KEY_DATES_2027.lastPayday2026)} payday is still at 2026 rates; ${weekdayDate(KEY_DATES_2027.firstPayday2027)} is the first payday at 2027 rates.`,
    'Retired pay and VA compensation are paid once a month, for the month before.',
  ];
}

export function activeDutyLabel(): string {
  return `DFAS hasn't posted its 2027 active-duty payday table (checked ${formatIsoDate(DFAS_2027_CHECKED)}). These dates apply the DoD payday rule (FMR Vol. 7A, ch. 1, 010701–010702) to OPM's 2027 federal holidays. The same rule reproduces DFAS's 2026 table exactly.`;
}

export function rest2026Note(): string {
  return `The ${formatIsoDate(KEY_DATES_2027.lastPayday2026)} payday covers ${KEY_DATES_2027.lastPayday2026Covers} at 2026 rates. January 1, 2027 is New Year's Day, so the January 1 payday moves to the workday before.`;
}

export const GUARD_RESERVE_TEXT =
  "Guard and Reserve members on active-duty orders are paid on the same paydays as active duty. Drill pay doesn't follow a fixed calendar date; check myPay for when yours posts.";

export const RETIRED_RULE_TEXT =
  "Retired pay for a month is due on the 1st of the next month. If the 1st is a weekend or holiday, retirees are paid the last business day before and annuitants the first business day after (DFAS).";

export function retireeColaLine(): string {
  const c = RETIREE_COLA_2027;
  const month = new Date(`${c.effectiveDate}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
  return `The ${formatPercent(c.percent)} retiree COLA (effective ${formatIsoDate(c.effectiveDate)}) first appears in the ${month} retired pay, paid ${formatIsoDate(c.firstRetiredPayDate)} (annuitants: ${formatIsoDate(c.firstAnnuitantPayDate)}).`;
}

export const VA_RULE_TEXT =
  "VA doesn't publish an annual calendar. By law (38 U.S.C. 5120(e)), when the 1st is a Saturday or Sunday VA pays on the Friday before, and when it's a legal public holiday, on the weekday before.";

/** Status-driven from the VA COLA calendar entry (src/data/calendar-2027.ts). No dollar figures. */
export function vaColaLine(): string {
  const entry = getCalendar2027().find((e) => e.id === 'va-cola')!;
  const pct = formatPercent(RETIREE_COLA_2027.percent);
  if (entry.status === 'pending') {
    return `VA's 2027 rates (the Social Security COLA, ${pct}) apply once Congress passes the annual VA COLA law and VA publishes its rate tables.`;
  }
  return `VA's 2027 rates (the Social Security COLA, ${pct}) take effect ${formatIsoDate(RETIREE_COLA_2027.effectiveDate)}.`;
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function list(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "February 12 (Feb 15 is Washington's Birthday)" for each 2027 payday that moves earlier. */
function movedPaydays(): string[] {
  const md = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric' });
  return paydays2027()
    .filter((p) => p.status === 'computed' && p.paid !== p.scheduled)
    .map((p) => `${md(p.paid!)} (${p.reason})`);
}

function movedVa(): string[] {
  return vaPayments2027()
    .filter((v) => v.paid !== v.scheduled)
    .map((v) => `${monthLabel(v.benefitMonth)} on ${formatIsoDate(v.paid)}`);
}

export function payDatesFaqs(): FaqItem[] {
  const c = RETIREE_COLA_2027;
  return [
    {
      question: 'When does the military get paid in 2027?',
      answer: `Active-duty members are paid twice a month, on the 1st and the 15th. When that day is a Saturday, Sunday or federal holiday, pay comes on the workday before. DFAS hasn't posted its 2027 table yet; applying that rule to OPM's 2027 holidays moves these paydays earlier: ${list(movedPaydays())}. The end-of-month payday for December 2027 isn't published yet: January 1, 2028 is a Saturday, so DFAS will pay on Thursday, December 30 or Friday, December 31.`,
    },
    {
      question: 'When is the first paycheck with the 2027 raise?',
      answer: `${weekdayDate(KEY_DATES_2027.firstPayday2027)}. That mid-month payday covers ${KEY_DATES_2027.firstPayday2027Covers}, the first pay period at 2027 rates. [See your 2027 base pay](/pay/raise#your-2027-base-pay).`,
    },
    {
      question: 'Why is there a payday on December 31?',
      answer: `The end-of-month payday for December is scheduled for January 1. ${formatIsoDate(KEY_DATES_2027.ratesEffective)} is New Year's Day, a federal holiday, so the payday moves to the workday before: ${weekdayDate(KEY_DATES_2027.lastPayday2026)}. It covers ${KEY_DATES_2027.lastPayday2026Covers} at 2026 rates.`,
    },
    {
      question: 'When do military retirees get the 2027 COLA?',
      answer: `Military retired pay rises ${formatPercent(c.percent)}. ${retireeColaTiming(c)} DFAS pays retired pay for a month on the 1st of the next month; January 1, 2027 is a holiday, so retirees are paid the last business day before and annuitants the first business day after.`,
    },
    {
      question: 'When is VA disability paid in 2027?',
      answer: `VA pays each month's compensation on the 1st of the following month. When the 1st is a Saturday or Sunday, VA pays on the Friday before; when it's a legal public holiday, on the weekday before (38 U.S.C. 5120(e)). Payments that come early: ${list(movedVa())}. Every other month is paid on the 1st.`,
    },
    {
      question: 'Do Guard and Reserve members get paid on the same days?',
      answer:
        "Members on active-duty orders are paid on the same paydays as active duty. Drill pay doesn't follow a fixed calendar date; check myPay for when yours posts.",
    },
  ];
}

// ─── "Next payday" widget input ──────────────────────────────────────────────

export interface WidgetPayday {
  /** ISO date paid; null for the pending January 1, 2028 payday. */
  paid: string | null;
  /** Scheduled date, used to order the pending row. */
  scheduled: string;
  /** Shown when paid is null. */
  pendingText?: string;
}

/** Every known active-duty payday from the DFAS 2026 table through December 2027, in order. */
export function widgetPaydays(): WidgetPayday[] {
  const official: WidgetPayday[] = DFAS_ACTIVE_DUTY_2026.flatMap((r) => [
    { paid: r.midMonth, scheduled: `${r.period}-15` },
    { paid: r.endOfMonth, scheduled: r.endOfMonth },
  ]);
  const computed: WidgetPayday[] = paydays2027().map((p) =>
    p.paid ? { paid: p.paid, scheduled: p.scheduled } : { paid: null, scheduled: p.scheduled, pendingText: PENDING_JAN_2028_WIDGET },
  );
  return [...official, ...computed];
}
