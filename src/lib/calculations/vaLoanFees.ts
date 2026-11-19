/**
 * VA funding fee rates — shared by the VA loan and VA refinance calculators and the
 * server-rendered summary blocks on those pages (src/lib/calculatorSummaries.ts).
 *
 * Rates moved unchanged from VALoanCalculator.tsx (purchase table, noted there as
 * effective through Nov 14, 2031) and VARefinanceCalculator.tsx (IRRRL 0.5%;
 * cash-out 2.15% first use / 3.3% subsequent). Not re-verified in this move.
 */

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
