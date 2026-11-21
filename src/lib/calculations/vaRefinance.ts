/**
 * VA refinance math (IRRRL and cash-out), shared by the calculator
 * (VARefinanceCalculator.tsx) and the server-rendered page copy (hero strip,
 * example, FAQs), so the page's figures are the calculator's own (build 10b,
 * audit VRF-01–06).
 *
 * Rules: docs/sources/va-refinance-rules-2026.md (38 U.S.C. § 3709, 38 CFR § 36.4306).
 * Fee rates and exemptions: ./vaLoanFees.ts (docs/sources/va-funding-fee-2026.md).
 * Payment formula: calcMonthlyPI in ./vaLoan.ts (the only copy).
 *
 * Client-safe: no data imports.
 */

import { formatCurrency } from '@/lib/utils';
import { calcMonthlyPI } from '@/lib/calculations/vaLoan';
import {
  type FeeStatus,
  fundingFeeAmount,
  getRefinanceFundingFeeRate,
  refinanceFeeRateFor,
} from '@/lib/calculations/vaLoanFees';

export type RefinanceType = 'irrrl' | 'cashout';

// ─── VA's rules (docs/sources/va-refinance-rules-2026.md) ────────────────────

/** § 3709(b): fixed to fixed, the new rate is at least 50 basis points lower. */
export const IRRRL_MIN_RATE_DROP_BPS = 50;
/** § 3709(a): fees and costs (not the funding fee) recouped within 36 months. */
export const VA_RECOUPMENT_LIMIT_MONTHS = 36;
/** § 3709(c)(2): 210 days after the first payment due date. */
export const SEASONING_DAYS = 210;
/** § 3709(c)(1): six consecutive monthly payments. */
export const SEASONING_PAYMENTS = 6;

/** Rate drop in whole basis points (VRF-04): 8.2 → 7.7 is 50, not 49.99… */
export function rateDropBps(currentRatePct: number, newRatePct: number): number {
  return Math.round((currentRatePct - newRatePct) * 100);
}

/** "50 basis points (0.50 percentage points)", from the integer, never a float. */
export function bpsLabel(bps: number): string {
  const n = Math.abs(bps);
  return `${n} basis point${n === 1 ? '' : 's'} (${(n / 100).toFixed(2)} percentage points)`;
}

// ─── Inputs and results ──────────────────────────────────────────────────────

export interface VaRefinanceInput {
  type: RefinanceType;
  /** Current loan balance (the payoff). */
  balance: number;
  /** Annual rates, percent. */
  currentRate: number;
  yearsRemaining: number;
  newRate: number;
  newTermYears: number;
  closingCosts: number;
  lenderCredits: number;
  feeStatus: FeeStatus;
  /** Cash-out funding fee: first use or after first use. */
  firstUse: boolean;
  /** Cash taken out (cash-out mode only; ignored for an IRRRL). */
  cashOut: number;
  /** Funding fee rolled into the new loan (true) or paid at closing (false). */
  financeFee: boolean;
}

export interface VaRefinanceResult {
  type: RefinanceType;
  /** Cash out actually applied (0 for an IRRRL). */
  cashOut: number;
  /** True when cash out > $0: VA's recoupment and rate tests don't apply (§ 3709(d)). */
  isCashOut: boolean;
  /** The amount the funding fee is a percentage of: balance + cash out. */
  feeBase: number;
  /** Rate and fee before any exemption. */
  standardFeeRate: number;
  standardFeeAmount: number;
  /** Rate and fee charged for this fee status (0 when exempt). */
  fundingFeeRate: number;
  fundingFeeAmount: number;
  /** Balance + cash out + the fee when financed. */
  newLoan: number;
  currentPayment: number;
  newPayment: number;
  /** Current payment − new payment (positive = lower payment). */
  monthlySavings: number;
  /** Closing costs − lender credits, floor $0. */
  netClosingCosts: number;
  /**
   * Months to recover closing costs (VRF-06, VA's method: the funding fee is left
   * out). 0 when there are no net closing costs; null when the payment doesn't drop.
   * Not used when isCashOut.
   */
  monthsToRecover: number | null;
  rateDropBps: number;
  /** IRRRL only: § 3709(b) fixed-to-fixed rate test. */
  ratePass: boolean;
  /** IRRRL only: § 3709(a) 36-month recoupment test. */
  recoupmentPass: boolean;
  // ── Over the full term (VRF-03) ──
  /** Current payment × months remaining, whole dollars. */
  currentRemainingTotal: number;
  /** New payment × new term, whole dollars, + net closing costs (+ the fee if paid at closing). */
  newLoanTotal: number;
  /** newLoanTotal − currentRemainingTotal (positive = the new loan costs more). */
  fullTermDifference: number;
  /** The new loan's payment if paid off over the years left on the current loan. */
  sameTermPayment: number;
  /** Current payment − sameTermPayment. */
  sameTermSavings: number;
  /** New term − years remaining (positive = the new loan adds years of payments). */
  extraYears: number;
}

export function calcVaRefinance(i: VaRefinanceInput): VaRefinanceResult {
  const cashOut = i.type === 'cashout' ? Math.max(0, i.cashOut) : 0;
  const isCashOut = cashOut > 0;
  // VA: the fee is "a percentage of your total loan amount" (VRF-01).
  const feeBase = i.balance + cashOut;
  const standardFeeRate = getRefinanceFundingFeeRate(i.type, i.firstUse);
  const standardFeeAmount = fundingFeeAmount(feeBase, standardFeeRate);
  const fundingFeeRate = refinanceFeeRateFor(i.feeStatus, i.type, i.firstUse);
  const fee = fundingFeeAmount(feeBase, fundingFeeRate);
  const newLoan = feeBase + (i.financeFee ? fee : 0);

  const currentPayment = calcMonthlyPI(i.balance, i.currentRate, i.yearsRemaining);
  const newPayment = calcMonthlyPI(newLoan, i.newRate, i.newTermYears);
  const monthlySavings = currentPayment - newPayment;
  const netClosingCosts = Math.max(0, i.closingCosts - i.lenderCredits);

  // VRF-06: one figure, VA's method. A financed fee is already in the new payment.
  const monthsToRecover =
    monthlySavings > 0 ? (netClosingCosts > 0 ? Math.ceil(netClosingCosts / monthlySavings) : 0) : null;

  const bps = rateDropBps(i.currentRate, i.newRate);
  const ratePass = bps >= IRRRL_MIN_RATE_DROP_BPS;
  const recoupmentPass = monthsToRecover !== null && monthsToRecover <= VA_RECOUPMENT_LIMIT_MONTHS;

  const currentRemainingTotal = Math.round(currentPayment * i.yearsRemaining * 12);
  const newLoanTotal =
    Math.round(newPayment * i.newTermYears * 12) + netClosingCosts + (i.financeFee ? 0 : fee);
  const sameTermPayment = calcMonthlyPI(newLoan, i.newRate, i.yearsRemaining);

  return {
    type: i.type,
    cashOut,
    isCashOut,
    feeBase,
    standardFeeRate,
    standardFeeAmount,
    fundingFeeRate,
    fundingFeeAmount: fee,
    newLoan,
    currentPayment,
    newPayment,
    monthlySavings,
    netClosingCosts,
    monthsToRecover,
    rateDropBps: bps,
    ratePass,
    recoupmentPass,
    currentRemainingTotal,
    newLoanTotal,
    fullTermDifference: newLoanTotal - currentRemainingTotal,
    sameTermPayment,
    sameTermSavings: currentPayment - sameTermPayment,
    extraYears: i.newTermYears - i.yearsRemaining,
  };
}

/** The calculator's default inputs (its useState defaults); the page example uses them. */
export const VA_REFINANCE_DEFAULTS = {
  type: 'irrrl',
  balance: 300000,
  currentRate: 7.0,
  yearsRemaining: 25,
  newRate: 6.0,
  newTermYears: 30,
  closingCosts: 2500,
  lenderCredits: 0,
  feeStatus: 'none',
  firstUse: true,
  cashOut: 0,
  financeFee: true,
} as const satisfies VaRefinanceInput;

// ─── Seasoning (VRF-05) ──────────────────────────────────────────────────────
// Calendar dates only: parsed from YYYY-MM-DD as numbers (never new Date('YYYY-MM-DD'),
// which is UTC midnight) and stepped with Date.UTC, so the result doesn't depend on
// the viewer's time zone.

export interface CalendarDate {
  y: number;
  m: number; // 1–12
  d: number;
}

export function parseIsoDate(s: string | null | undefined): CalendarDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s ?? '').trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
  return { y, m: mo, d };
}

function fromUtc(t: Date): CalendarDate {
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function addDays(dt: CalendarDate, days: number): CalendarDate {
  return fromUtc(new Date(Date.UTC(dt.y, dt.m - 1, dt.d + days)));
}

/** Same day n months later; a day past the month's end moves to its last day. */
export function addMonths(dt: CalendarDate, months: number): CalendarDate {
  const first = new Date(Date.UTC(dt.y, dt.m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return { y: first.getUTCFullYear(), m: first.getUTCMonth() + 1, d: Math.min(dt.d, lastDay) };
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.y - b.y || a.m - b.m || a.d - b.d;
}

export function toIsoDate(dt: CalendarDate): string {
  return `${dt.y}-${String(dt.m).padStart(2, '0')}-${String(dt.d).padStart(2, '0')}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "November 12, 2026". */
export function formatLongDate(dt: CalendarDate): string {
  return `${MONTHS[dt.m - 1]} ${dt.d}, ${dt.y}`;
}

/** Today's calendar date on the viewer's own clock. */
export function localToday(now: Date = new Date()): CalendarDate {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

export interface SeasoningResult {
  firstPayment: CalendarDate;
  /** First payment due date + 210 days. */
  day210: CalendarDate;
  /** Sixth consecutive payment, each made on its due date: first payment + 5 months. */
  sixthPayment: CalendarDate;
  /** The later of the two (§ 3709(c)). */
  earliestClosing: CalendarDate;
  /** Earliest closing date against today, by calendar date. */
  status: 'past' | 'today' | 'ahead';
}

export function calcSeasoning(firstPaymentIso: string, today: CalendarDate): SeasoningResult | null {
  const firstPayment = parseIsoDate(firstPaymentIso);
  if (!firstPayment) return null;
  const day210 = addDays(firstPayment, SEASONING_DAYS);
  const sixthPayment = addMonths(firstPayment, SEASONING_PAYMENTS - 1);
  const earliestClosing = compareDates(day210, sixthPayment) >= 0 ? day210 : sixthPayment;
  const c = compareDates(earliestClosing, today);
  return { firstPayment, day210, sixthPayment, earliestClosing, status: c < 0 ? 'past' : c === 0 ? 'today' : 'ahead' };
}

// ─── Plain-language summary ("The Bottom Line") ──────────────────────────────
// Facts from the numbers and VA's rules; no verdicts.

const usd = (n: number) => formatCurrency(n);

export function paymentSentence(r: VaRefinanceResult): string {
  const cur = usd(Math.round(r.currentPayment));
  const next = usd(Math.round(r.newPayment));
  const diff = Math.round(r.monthlySavings);
  const lead = r.isCashOut ? `With ${usd(r.cashOut)} cash out, your` : 'Your';
  if (diff > 0) return `${lead} monthly principal and interest drops by ${usd(diff)}, from ${cur} to ${next}.`;
  if (diff < 0) return `${lead} monthly principal and interest rises by ${usd(-diff)}, from ${cur} to ${next}.`;
  return `${lead} monthly principal and interest stays at about ${cur}.`;
}

export function fullTermSentence(r: VaRefinanceResult): string {
  const d = r.fullTermDifference;
  const amount = usd(Math.abs(d));
  const cash = r.isCashOut ? `, including repaying the ${usd(r.cashOut)} cash out` : '';
  const years =
    r.extraYears > 0 ? ` The new loan adds ${r.extraYears} year${r.extraYears === 1 ? '' : 's'} of payments.` : '';
  if (d === 0) {
    return `Paid to the end of its term, the new loan (payments plus net closing costs) totals the same as the remaining payments on your current loan${cash}.${years}`;
  }
  return `Paid to the end of its term, the new loan (payments plus net closing costs) totals ${amount} ${d > 0 ? 'more' : 'less'} than the remaining payments on your current loan${cash}.${years}`;
}

/**
 * The cash-out result card ("Payment change"). Uses the same unrounded difference as
 * paymentSentence, so the card and the summary always give the same dollar figure.
 */
export function paymentChangeLabel(r: VaRefinanceResult): string {
  const diff = Math.round(r.monthlySavings);
  if (diff > 0) return `${usd(diff)} less a month`;
  if (diff < 0) return `${usd(-diff)} more a month`;
  return 'No change';
}

const yearsLabel = (n: number) => `${n} year${n === 1 ? '' : 's'}`;

/** "At the same remaining term" line in the full-term block; works in both directions. */
export function sameTermSentence(r: VaRefinanceResult, yearsRemaining: number): string {
  const diff = Math.round(r.sameTermSavings);
  const lead = `At the same remaining term: paid off over ${yearsLabel(yearsRemaining)}, the new loan's payment would be ${usd(Math.round(r.sameTermPayment))} a month,`;
  if (diff === 0) return `${lead} the same as your current payment.`;
  return `${lead} ${usd(Math.abs(diff))} ${diff > 0 ? 'less' : 'more'} than your current payment.`;
}

/**
 * Longer-term line in the full-term block. Says the longer term lowers the payment only
 * when the payment actually drops; null when the new loan adds no years.
 */
export function longerTermSentence(r: VaRefinanceResult): string | null {
  if (r.extraYears <= 0) return null;
  if (Math.round(r.monthlySavings) > 0) {
    return `Part of the lower payment comes from the longer term: ${r.extraYears} more year${r.extraYears === 1 ? '' : 's'} of payments.`;
  }
  return `The new loan also adds ${yearsLabel(r.extraYears)} of payments.`;
}

export function bottomLineSentences(r: VaRefinanceResult): string[] {
  const out: string[] = [paymentSentence(r)];

  if (r.isCashOut) {
    out.push(
      "VA's 36-month recoupment test and its rate test don't apply to a cash-out refinance where the new loan is larger than the payoff (38 U.S.C. § 3709(d)).",
    );
  } else if (r.netClosingCosts === 0) {
    out.push('There are no net closing costs to recover.');
  } else if (r.monthsToRecover !== null) {
    out.push(
      `The ${usd(r.netClosingCosts)} in net closing costs is recovered through the lower payment in ${r.monthsToRecover} month${r.monthsToRecover === 1 ? '' : 's'}.`,
    );
  } else {
    out.push("With no monthly saving, the closing costs aren't recovered through the payment.");
  }

  if (r.type === 'irrrl') {
    const rate = r.ratePass ? 'meets' : "doesn't meet";
    const recoup = r.recoupmentPass ? 'meets' : "doesn't meet";
    const drop =
      r.rateDropBps >= 0 ? `drops ${bpsLabel(r.rateDropBps)}` : `rises ${bpsLabel(r.rateDropBps)}`;
    out.push(
      `The rate ${drop}, so this ${rate} VA's fixed-to-fixed rate test (at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower). It ${recoup} VA's ${VA_RECOUPMENT_LIMIT_MONTHS}-month recoupment test.`,
    );
  }

  out.push(fullTermSentence(r));
  out.push('Your actual rate, fees and savings depend on the lender. Compare quotes from multiple VA-approved lenders.');
  return out;
}
