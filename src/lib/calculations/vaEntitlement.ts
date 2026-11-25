/**
 * VA remaining entitlement math (build V2), shared by the VA entitlement calculator,
 * its page copy and the blog figures (<VaEntitlementFigure>).
 *
 * Rules (docs/sources/va-entitlement-loan-limits-2027.md; VA.gov "VA home loan limits",
 * Army Benefits Center, VA's archived guaranty examples):
 * - VA's rule: remaining entitlement = 25% of the county's One-Unit limit minus the
 *   entitlement already used (and not restored). Never below 0.
 * - Lender convention, as VA describes it: most lenders lend up to 4 × the remaining
 *   entitlement with no down payment.
 * - Lender convention: if the loan is larger, most lenders want the remaining
 *   entitlement and a down payment together to cover at least 25% of the loan.
 * - Full entitlement: no loan limit (the lender still approves the amount).
 * - A prior loan above $144,000: VA guaranteed 25% of it, so 25% of that loan is an
 *   estimate of the entitlement it used. At $144,000 or less, basic entitlement
 *   applies and the COE shows the amount: no estimate.
 *
 * Client-safe: no data imports. Every input is whole dollars; 25% and 4× of whole
 * dollars are exact in floating point, so results can carry cents (25% of $832,750 is
 * $208,187.50) but never rounding noise.
 */

import { fundingFeeAmount, fundingFeeRateFor, isFeeExempt, type FeeStatus } from '@/lib/calculations/vaLoanFees';

/** VA's guaranty share of the county limit (and of the loan): 25%. */
export const VA_GUARANTY_SHARE = 0.25;
/** Most lenders lend up to this multiple of the remaining entitlement with $0 down. */
export const LENDER_ZERO_DOWN_MULTIPLE = 4;
/** VA: basic entitlement covers a loan of "$144,000 or less". */
export const BASIC_ENTITLEMENT_MAX_LOAN = 144_000;

/** VA's rule: 25% of the county's One-Unit limit minus entitlement already used. Never below 0. */
export function remainingEntitlement(countyLimit: number, used: number): number {
  return Math.max(0, VA_GUARANTY_SHARE * countyLimit - used);
}

/** Lender convention: up to 4 × the remaining entitlement with no down payment. */
export function maxZeroDownLoan(remaining: number): number {
  return LENDER_ZERO_DOWN_MULTIPLE * remaining;
}

/** Lender convention: the down payment most lenders look for (25% of the loan minus remaining). */
export function typicalDownPayment(loan: number, remaining: number): number {
  return Math.max(0, VA_GUARANTY_SHARE * loan - remaining);
}

/**
 * Estimated entitlement used by a prior VA loan, from its original amount: 25% when
 * the loan was above $144,000. Otherwise null ("check your COE").
 */
export function estimatedUsedFromPriorLoan(priorLoan: number): number | null {
  if (!(priorLoan > BASIC_ENTITLEMENT_MAX_LOAN)) return null;
  return VA_GUARANTY_SHARE * priorLoan;
}

export interface EntitlementInput {
  /** The county's One-Unit limit for the closing year. */
  countyLimit: number;
  /** Entitlement already used (COE, or the prior-loan estimate). */
  used: number;
  /** Home price; 0 = not entered. */
  price: number;
  /** Down payment in dollars; 0 = none. */
  down: number;
  feeStatus: FeeStatus;
}

export interface EntitlementResult {
  countyLimit: number;
  /** 25% of the county limit. */
  vaShare: number;
  used: number;
  remaining: number;
  /** Lender convention: 4 × remaining. */
  maxZeroDown: number;
  /** price − down, or the max $0-down loan when no price is entered. */
  loan: number;
  /** True when a home price was entered. */
  hasPrice: boolean;
  /** Loan is above the $0-down maximum (and a price was entered). */
  aboveMax: boolean;
  /** Lender convention, when aboveMax: about this much down. */
  typicalDown: number;
  /** Down payment percent that picks the funding fee band. */
  downPct: number;
  /** Subsequent-use funding fee rate for this status (0 when exempt). */
  feeRate: number;
  feeAmount: number;
  exempt: boolean;
}

/** One closing year's result. The funding fee is always the subsequent-use rate. */
export function calcEntitlement(i: EntitlementInput): EntitlementResult {
  const vaShare = VA_GUARANTY_SHARE * i.countyLimit;
  const remaining = remainingEntitlement(i.countyLimit, i.used);
  const maxZeroDown = maxZeroDownLoan(remaining);
  const hasPrice = i.price > 0;
  const down = hasPrice ? Math.min(Math.max(0, i.down), i.price) : 0;
  const loan = hasPrice ? i.price - down : maxZeroDown;
  const aboveMax = hasPrice && loan > maxZeroDown;
  const typicalDown = aboveMax ? typicalDownPayment(loan, remaining) : 0;
  const downPct = hasPrice ? (down / i.price) * 100 : 0;
  const feeRate = fundingFeeRateFor(i.feeStatus, false, downPct);
  return {
    countyLimit: i.countyLimit,
    vaShare,
    used: i.used,
    remaining,
    maxZeroDown,
    loan,
    hasPrice,
    aboveMax,
    typicalDown,
    downPct,
    feeRate,
    feeAmount: fundingFeeAmount(loan, feeRate),
    exempt: isFeeExempt(i.feeStatus),
  };
}

/** Whole dollars without cents; cents only when the amount has them ("$158,187.50"). */
export function usdExact(n: number): string {
  const cents = Math.round(n * 100);
  const whole = cents % 100 === 0;
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
}

const SMALL_WORDS = new Set(['of', 'and', 'the']);

/** FHFA writes names in capitals ("PRINCE GEORGE'S COUNTY"); show them in title case. */
export function countyDisplayName(raw: string): string {
  return raw
    .toLowerCase()
    .split(' ')
    .map((w, idx) => {
      if (idx > 0 && SMALL_WORDS.has(w)) return w;
      const cap = w.replace(/(^|[-/(])([a-z])/g, (_m, p: string, c: string) => p + c.toUpperCase());
      return cap
        .replace(/^Mc([a-z])/, (_m, c: string) => `Mc${c.toUpperCase()}`)
        .replace(/^O'([a-z])/, (_m, c: string) => `O'${c.toUpperCase()}`);
    })
    .join(' ');
}
