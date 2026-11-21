/**
 * VA funding fee rates — shared by the VA loan and VA refinance calculators and the
 * server-rendered summary blocks on those pages (src/lib/calculatorSummaries.ts).
 *
 * Source: docs/sources/va-funding-fee-2026.md (VA.gov, checked 2026-11-20/21; rates
 * effective April 7, 2023). The purchase, IRRRL and cash-out rates below match it.
 * The exemption statuses and refund rule (build V1) use its wording.
 */

/** Date VA's current funding fee rates took effect (VA.gov). */
export const FUNDING_FEE_RATES_EFFECTIVE = 'April 7, 2023';

/** Purchase / construction loans, by down payment. */
export const VA_PURCHASE_FUNDING_FEE = {
  first: { lt5: 0.0215, gte5lt10: 0.015, gte10: 0.0125 },
  subsequent: { lt5: 0.033, gte5lt10: 0.015, gte10: 0.0125 },
} as const;

/** Interest Rate Reduction Refinancing Loan (IRRRL), every use. */
export const VA_IRRRL_FUNDING_FEE = 0.005;

/** Cash-out refinance. */
export const VA_CASH_OUT_FUNDING_FEE = { first: 0.0215, subsequent: 0.033 } as const;

/** Purchase funding fee rate for first or subsequent use at a down payment percent. */
export function getFundingFeeRate(firstUse: boolean, downPct: number): number {
  const tier = firstUse ? VA_PURCHASE_FUNDING_FEE.first : VA_PURCHASE_FUNDING_FEE.subsequent;
  if (downPct < 5) return tier.lt5;
  if (downPct < 10) return tier.gte5lt10;
  return tier.gte10;
}

/** Refinance funding fee rate (before any exemption). */
export function getRefinanceFundingFeeRate(type: 'irrrl' | 'cashout', firstUse: boolean): number {
  if (type === 'irrrl') return VA_IRRRL_FUNDING_FEE;
  return firstUse ? VA_CASH_OUT_FUNDING_FEE.first : VA_CASH_OUT_FUNDING_FEE.subsequent;
}

/** Funding fee in whole dollars. */
export function fundingFeeAmount(loanAmount: number, rate: number): number {
  return Math.round(loanAmount * rate);
}

// ─── Funding fee status (build V1) ──────────────────────────────────────────
// VA exempts by compensation status, not by a rating number. Five exempt statuses
// (VA's list), plus "none" and "claim pending" (fee charged at closing; refund
// possible under VA's rule). Labels are first-person for the calculator's radios.

export type FeeStatus = 'none' | 'comp' | 'eligible' | 'dic' | 'predischarge' | 'purpleheart' | 'pending';

export const FEE_STATUSES: readonly { value: FeeStatus; label: string; exempt: boolean }[] = [
  { value: 'none', label: 'None of these apply', exempt: false },
  { value: 'comp', label: 'I receive VA disability compensation', exempt: true },
  {
    value: 'eligible',
    label: 'I’m eligible for VA disability compensation but receive retirement or active-duty pay instead',
    exempt: true,
  },
  { value: 'dic', label: 'I receive DIC as the surviving spouse of a Veteran', exempt: true },
  {
    value: 'predischarge',
    label: 'I’m on active duty with a proposed or memorandum rating from a pre-discharge claim, dated before closing',
    exempt: true,
  },
  {
    value: 'purpleheart',
    label: 'I’m on active duty and have received a Purple Heart (evidence provided on or before closing)',
    exempt: true,
  },
  { value: 'pending', label: 'My disability claim is still pending', exempt: false },
];

const FEE_STATUS_VALUES = new Set<string>(FEE_STATUSES.map((s) => s.value));

export function isFeeExempt(status: FeeStatus): boolean {
  return FEE_STATUSES.some((s) => s.value === status && s.exempt);
}

/**
 * Purchase funding fee rate for a fee status: 0 for VA's five exempt statuses,
 * otherwise the normal rate for first/subsequent use at the down payment percent.
 */
export function fundingFeeRateFor(status: FeeStatus, firstUse: boolean, downPct: number): number {
  return isFeeExempt(status) ? 0 : getFundingFeeRate(firstUse, downPct);
}

/**
 * Refinance funding fee rate for a fee status: 0 for VA's five exempt statuses,
 * otherwise the IRRRL or cash-out rate (build 10b; same statuses as V1).
 */
export function refinanceFeeRateFor(status: FeeStatus, type: 'irrrl' | 'cashout', firstUse: boolean): number {
  return isFeeExempt(status) ? 0 : getRefinanceFundingFeeRate(type, firstUse);
}

/** A fee rate as a percent with two decimals: 0.005 → "0.50%", 0.033 → "3.30%". */
export function feeRateLabel(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Fee status from the URL. `fee=<status>` wins; without it the old `exempt=yes|no`
 * still works (yes → comp, no → none). Anything unrecognised → none.
 */
export function parseFeeStatus(feeRaw: string | null, exemptRaw: string | null): FeeStatus {
  if (feeRaw !== null) {
    const v = feeRaw.trim().toLowerCase();
    return FEE_STATUS_VALUES.has(v) ? (v as FeeStatus) : 'none';
  }
  if (exemptRaw !== null) {
    const v = exemptRaw.trim().toLowerCase();
    if (v === 'yes' || v === '1' || v === 'true') return 'comp';
  }
  return 'none';
}

/**
 * The down payment percent that picks the fee band. In percent mode it is the
 * percentage the borrower typed (VAL-02): recomputing it from rounded dollars can
 * fall just under 5% or 10% (e.g. 5% of $389,905 rounds to $19,495 = 4.99994%).
 * In dollar mode it is the dollars over the price.
 */
export function bandDownPct(
  downType: 'dollar' | 'percent',
  typedPct: number,
  downDollars: number,
  homePrice: number,
): number {
  if (downType === 'percent') return typedPct;
  return homePrice > 0 ? (downDollars / homePrice) * 100 : 0;
}
