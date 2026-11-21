/**
 * VA loan payment math, shared by the calculator (VALoanCalculator.tsx) and the
 * server-rendered page copy (example, hero strip, FAQs) so the page's figures are
 * the calculator's own (build V1, audit VAL-03). Fee rates: ./vaLoanFees.ts.
 *
 * Client-safe: no data imports.
 */

import {
  type FeeStatus,
  fundingFeeAmount,
  fundingFeeRateFor,
  getFundingFeeRate,
} from '@/lib/calculations/vaLoanFees';

/** Monthly principal and interest on a fixed-rate, fully amortizing loan. */
export function calcMonthlyPI(loanAmount: number, annualRatePct: number, termYears: number): number {
  if (loanAmount <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmount / n;
  return (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

export interface VaLoanInput {
  homePrice: number;
  downDollars: number;
  /** Down payment percent that picks the fee band (bandDownPct in vaLoanFees.ts). */
  bandPct: number;
  /** Annual rate, percent. */
  rate: number;
  termYears: number;
  annualTax: number;
  annualIns: number;
  firstUse: boolean;
  feeStatus: FeeStatus;
  financeFee: boolean;
}

export interface VaLoanResult {
  baseLoan: number;
  /** Rate and fee before any exemption: what a non-exempt borrower pays. */
  standardFeeRate: number;
  standardFeeAmount: number;
  /** Rate and fee charged for this fee status (0 when exempt). */
  fundingFeeRate: number;
  fundingFeeAmount: number;
  financedLoan: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyIns: number;
  totalPITI: number;
  /** Monthly P&I that comes from financing the fee (0 when paid at closing or exempt). */
  feeFinancedExtra: number;
}

export function calcVaLoan(i: VaLoanInput): VaLoanResult {
  const baseLoan = Math.max(0, i.homePrice - i.downDollars);
  const standardFeeRate = getFundingFeeRate(i.firstUse, i.bandPct);
  const standardFeeAmount = fundingFeeAmount(baseLoan, standardFeeRate);
  const fundingFeeRate = fundingFeeRateFor(i.feeStatus, i.firstUse, i.bandPct);
  const feeAmt = fundingFeeAmount(baseLoan, fundingFeeRate);
  const financedLoan = i.financeFee ? baseLoan + feeAmt : baseLoan;
  const monthlyPI = calcMonthlyPI(financedLoan, i.rate, i.termYears);
  const monthlyTax = i.annualTax / 12;
  const monthlyIns = i.annualIns / 12;
  const feeFinancedExtra = i.financeFee && feeAmt > 0 ? calcMonthlyPI(feeAmt, i.rate, i.termYears) : 0;
  return {
    baseLoan,
    standardFeeRate,
    standardFeeAmount,
    fundingFeeRate,
    fundingFeeAmount: feeAmt,
    financedLoan,
    monthlyPI,
    monthlyTax,
    monthlyIns,
    totalPITI: monthlyPI + monthlyTax + monthlyIns,
    feeFinancedExtra,
  };
}

/** The calculator's default inputs (its useState defaults); the page example uses them. */
export const VA_LOAN_DEFAULTS = {
  homePrice: 350000,
  downDollars: 0,
  bandPct: 0,
  rate: 6.0,
  termYears: 30,
  annualTax: 4200,
  annualIns: 1400,
  firstUse: true,
  feeStatus: 'none',
  financeFee: true,
} as const satisfies VaLoanInput;
