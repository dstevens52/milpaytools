/**
 * Separation Benefits Timeline: dates and timeline items, moved out of
 * SeparationTimelineCalculator.tsx (build 10a) so the calculator, the page's example
 * and the tests share one set of rules.
 *
 * TAMP, VGLI and preseparation-counseling rules: src/data/separation/rules.ts
 * (docs/sources/separation-rules-2026.md). Other periods (BDD 180–90 days, TAP
 * completion 90 days, SGLI 120 days, final move) are unchanged from the calculator;
 * the final-move limits are JTR values not re-verified in build 10a.
 *
 * Client-safe: no data imports beyond the rules file.
 */

import {
  addDays,
  addYears,
  preseparationCounselingStart,
  retireeTricareEnrollmentDeadline,
  tampEndDate,
  vgliDeadline,
  vgliNoHealthReviewEnd,
} from '@/data/separation/rules';

export type Phase = 'pre' | 'sep' | 'post';
export type ItemStatus = 'past' | 'active' | 'approaching' | 'future' | 'sep-day';
export type TampOption = 'yes' | 'no' | 'unknown';
export type SepType = 'separating' | 'retiring';
export type VaOption = 'yes' | 'no' | 'unknown';

export interface TimelineItem {
  id: string;
  phase: Phase;
  name: string;
  what: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  isRange: boolean;
  status: ItemStatus;
  daysFromToday: number | null;
  daysUntilStart: number | null;
  daysUntilEnd: number | null;
}

/** Final government-paid move: JTR limits as the calculator had them (not re-verified in 10a). */
export const FINAL_MOVE_RETIRING_YEARS = 3;
export const FINAL_MOVE_SEPARATING_DAYS = 180;

export function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/**
 * A YYYY-MM-DD date, or null. Rejects dates whose parts don't round-trip, such as
 * 2026-02-31 or 2026-13-45 (SEP-05), instead of rolling them into the next month.
 */
export function parseISODate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(y, mo - 1, day);
  if (isNaN(d.getTime()) || d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== day) return null;
  return d;
}

export interface SeparationDeadlines {
  preseparationCounselingStart: Date;
  bddOpens: Date;
  bddCloses: Date;
  tampEnd: Date;
  sgliFreeEnds: Date;
  vgliNoHealthReviewEnd: Date;
  vgliDeadline: Date;
  finalMoveDeadline: Date;
  /** Retirees: last day to enroll in Prime or Select (retirement date + 90 days). */
  retireeTricareEnrollmentDeadline: Date;
}

export function separationDeadlines(sepDate: Date, sepType: SepType): SeparationDeadlines {
  return {
    preseparationCounselingStart: preseparationCounselingStart(sepDate),
    bddOpens: addDays(sepDate, -180),
    bddCloses: addDays(sepDate, -90),
    tampEnd: tampEndDate(sepDate),
    sgliFreeEnds: addDays(sepDate, 120),
    vgliNoHealthReviewEnd: vgliNoHealthReviewEnd(sepDate),
    vgliDeadline: vgliDeadline(sepDate),
    finalMoveDeadline: sepType === 'retiring'
      ? addYears(sepDate, FINAL_MOVE_RETIRING_YEARS)
      : addDays(sepDate, FINAL_MOVE_SEPARATING_DAYS),
    retireeTricareEnrollmentDeadline: retireeTricareEnrollmentDeadline(sepDate),
  };
}

export function buildTimeline(
  sepDate: Date,
  today: Date,
  sepType: SepType,
  tamp: TampOption,
  vaFiled: VaOption,
): TimelineItem[] {
  function pointStatus(date: Date, isSepDay = false): ItemStatus {
    if (isSepDay) return 'sep-day';
    if (date < today) return 'past';
    const days = diffDays(today, date);
    if (days === 0) return 'active';
    if (days <= 30) return 'approaching';
    return 'future';
  }

  function rangeStatus(startDate: Date, endDate: Date): ItemStatus {
    if (today >= startDate && today <= endDate) return 'active';
    if (endDate < today) return 'past';
    const daysToStart = diffDays(today, startDate);
    if (daysToStart <= 30) return 'approaching';
    return 'future';
  }

  const d = separationDeadlines(sepDate, sepType);
  const { bddOpens, bddCloses } = d;
  const retiring = sepType === 'retiring';

  const items: TimelineItem[] = [];

  // ── Pre-separation ────────────────────────────────────────────────────────

  // SEP-04: 10 U.S.C. § 1142 — counseling starts no later than 365 days before.
  items.push({
    id: 'tap-start',
    phase: 'pre',
    name: 'Start Preseparation Counseling (TAP)',
    what: `Start preseparation counseling no later than 365 days before ${retiring ? 'retirement' : 'separation'} (10 U.S.C. § 1142). It is the first step of the Transition Assistance Program.`,
    date: d.preseparationCounselingStart,
    isRange: false,
    status: pointStatus(d.preseparationCounselingStart),
    daysFromToday: diffDays(today, d.preseparationCounselingStart),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  if (vaFiled !== 'yes') {
    // A past opening date is not "Expired" while the window is still open (through bddCloses).
    // math-audit-round-2 SEP-01.
    const bddWindowOpen = today >= bddOpens && today <= bddCloses;
    items.push({
      id: 'bdd-opens',
      phase: 'pre',
      name: 'BDD Filing Window Opens',
      what: 'File your VA disability claim through Benefits Delivery at Discharge. Filing now may help VA process your claim sooner.',
      date: bddOpens,
      isRange: false,
      status: bddWindowOpen ? 'active' : pointStatus(bddOpens),
      daysFromToday: diffDays(today, bddOpens),
      daysUntilStart: null,
      daysUntilEnd: null,
    });
  }

  items.push({
    id: 'shpe-sha',
    phase: 'pre',
    name: 'Schedule SHPE / SHA',
    what: 'Schedule your Separation Health Physical Exam and Separation Health Assessment. SHA Part A is required for BDD claims.',
    startDate: bddOpens,
    endDate: bddCloses,
    isRange: true,
    status: rangeStatus(bddOpens, bddCloses),
    daysFromToday: null,
    daysUntilStart: diffDays(today, bddOpens),
    daysUntilEnd: diffDays(today, bddCloses),
  });

  if (vaFiled !== 'yes') {
    items.push({
      id: 'bdd-closes',
      phase: 'pre',
      name: 'BDD Filing Window Closes',
      what: 'Last day to file through BDD. After this, file a standard claim post-separation.',
      date: bddCloses,
      isRange: false,
      status: pointStatus(bddCloses),
      daysFromToday: diffDays(today, bddCloses),
      daysUntilStart: null,
      daysUntilEnd: null,
    });
  }

  items.push({
    id: 'tap',
    phase: 'pre',
    name: 'TAP Completion Deadline',
    what: 'All TAP requirements should be complete by this date. Retirees should begin 18–24 months before separation.',
    date: bddCloses,
    isRange: false,
    status: pointStatus(bddCloses),
    daysFromToday: diffDays(today, bddCloses),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  // ── Separation day ─────────────────────────────────────────────────────────

  items.push({
    id: 'last-day',
    phase: 'sep',
    name: 'Last Active Duty Day',
    what: 'Final active-duty paycheck. Base pay, BAH, BAS, and all active-duty entitlements end.',
    date: sepDate,
    isRange: false,
    status: 'sep-day',
    daysFromToday: diffDays(today, sepDate),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  items.push({
    id: 'tricare-ends',
    phase: 'sep',
    name: 'TRICARE Active-Duty Coverage Ends',
    what: retiring
      ? 'Active-duty TRICARE coverage ends with active duty. Retiree TRICARE (Prime or Select) does not start on its own: you enroll.'
      : 'Active-duty TRICARE coverage ends with active duty. If you qualify for TAMP, its 180 days start on your separation date (day 1).',
    date: sepDate,
    isRange: false,
    status: 'sep-day',
    daysFromToday: diffDays(today, sepDate),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  // SEP-02: retirees enroll in a retiree plan instead of TAMP. Window: 90 days after the
  // retirement date, retroactive enrollment up to 12 months (tricare.mil/retire, /retiring).
  if (retiring) {
    items.push({
      id: 'retiree-tricare',
      phase: 'post',
      name: 'Enroll in Retiree TRICARE',
      what: "Last day to enroll in TRICARE Prime or TRICARE Select: you have 90 days after your retirement date. If you don't enroll by then, you may request a retroactive enrollment up to 12 months from your retirement date.",
      date: d.retireeTricareEnrollmentDeadline,
      isRange: false,
      status: pointStatus(d.retireeTricareEnrollmentDeadline),
      daysFromToday: diffDays(today, d.retireeTricareEnrollmentDeadline),
      daysUntilStart: null,
      daysUntilEnd: null,
    });
  }

  // ── Post-separation ───────────────────────────────────────────────────────

  if (!retiring && tamp !== 'no') {
    items.push({
      id: 'tamp',
      phase: 'post',
      name: 'TAMP Coverage Period',
      what: "If you qualify, the Transitional Assistance Management Program provides 180 days of TRICARE coverage; your separation date is day 1. Not automatic — verify eligibility with your service branch before separation. After TAMP, you'll need employer coverage, VA healthcare, or a marketplace plan.",
      startDate: sepDate,
      endDate: d.tampEnd,
      isRange: true,
      status: rangeStatus(sepDate, d.tampEnd),
      daysFromToday: null,
      daysUntilStart: diffDays(today, sepDate),
      daysUntilEnd: diffDays(today, d.tampEnd),
    });
  }

  items.push({
    id: 'sgli-ends',
    phase: 'post',
    name: 'SGLI Free Coverage Ends',
    what: "Servicemembers' Group Life Insurance continues at no cost for 120 days after separation, then ends unless converted to VGLI.",
    date: d.sgliFreeEnds,
    isRange: false,
    status: pointStatus(d.sgliFreeEnds),
    daysFromToday: diffDays(today, d.sgliFreeEnds),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  items.push({
    id: 'vgli-no-exam',
    phase: 'post',
    name: 'VGLI No-Exam Window',
    what: "Apply for Veterans' Group Life Insurance within 240 days and you won't need to prove you're in good health. After 240 days, you'll need to submit evidence of good health. The full application window is 1 year and 120 days.",
    startDate: sepDate,
    endDate: d.vgliNoHealthReviewEnd,
    isRange: true,
    status: rangeStatus(sepDate, d.vgliNoHealthReviewEnd),
    daysFromToday: null,
    daysUntilStart: diffDays(today, sepDate),
    daysUntilEnd: diffDays(today, d.vgliNoHealthReviewEnd),
  });

  items.push({
    id: 'final-move',
    phase: 'post',
    name: 'Final Move Deadline',
    what: retiring
      ? 'Deadline to complete your final government-paid move. Retirees have up to 3 years from retirement date. Contact your branch transportation office to begin coordination.'
      : 'Deadline to complete your final government-paid move. Separating members have 180 days. Check your orders and branch transportation office for your specific entitlement.',
    date: d.finalMoveDeadline,
    isRange: false,
    status: pointStatus(d.finalMoveDeadline),
    daysFromToday: diffDays(today, d.finalMoveDeadline),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  items.push({
    id: 'vgli-closes',
    phase: 'post',
    name: 'VGLI Application Window Closes',
    what: 'Last day to apply for VGLI: 1 year and 120 days after separation (one calendar year, then 120 days). After this date, conversion from SGLI is no longer available.',
    date: d.vgliDeadline,
    isRange: false,
    status: pointStatus(d.vgliDeadline),
    daysFromToday: diffDays(today, d.vgliDeadline),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  return items;
}
