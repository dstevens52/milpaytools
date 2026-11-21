/**
 * VA funding fee figures for blog posts (build V3): every funding fee rate and
 * dollar amount a post shows is computed here from the calculators' own fee table
 * (src/lib/calculations/vaLoanFees.ts) and payment math (calcMonthlyPI in
 * src/lib/calculations/vaLoan.ts). Nothing is typed by hand. Rendered by
 * <VaFundingFee> / <VaFundingFeeTable> (src/components/blog/VaFundingFee.tsx).
 *
 * Inputs arrive as strings from MDX: next-mdx-remote drops JS-expression props
 * like loan={350000}, so posts write loan="350000".
 *
 * Source: docs/sources/va-funding-fee-2026.md. Client-safe: no data imports.
 */

import { formatCurrency } from '@/lib/utils';
import { calcMonthlyPI } from '@/lib/calculations/vaLoan';
import {
  VA_ASSUMPTION_FUNDING_FEE,
  VA_CASH_OUT_FUNDING_FEE,
  VA_IRRRL_FUNDING_FEE,
  VA_MANUFACTURED_HOME_FUNDING_FEE,
  feeRateLabel,
  fundingFeeAmount,
  getFundingFeeRate,
} from '@/lib/calculations/vaLoanFees';

export type FeeLoanType = 'purchase' | 'irrrl' | 'cashout' | 'assumption' | 'manufactured';
export type FeeUse = 'first' | 'subsequent';

/**
 * What to show:
 * - fee: the funding fee in whole dollars
 * - rate: the fee rate ("2.15%")
 * - loan: the base loan (purchase: price minus down payment)
 * - down: the down payment in dollars (purchase)
 * - financed: base loan plus the fee
 * - monthly: the monthly principal and interest the financed fee adds (needs interest + years)
 * - totalPaid: that monthly amount over the full term (needs interest + years)
 * - payment: monthly principal and interest on the base loan, without the fee
 *   (needs interest + years; withFee="yes" finances the fee; plus="300" adds stated
 *   monthly taxes/insurance; subtractFrom="2050" shows that amount minus the total)
 */
export type FeeShow = 'fee' | 'rate' | 'loan' | 'down' | 'financed' | 'monthly' | 'totalPaid' | 'payment';

export interface FeeFigureInput {
  type?: FeeLoanType;
  use?: FeeUse;
  /** Purchase: home price. The base loan is price minus the down payment. */
  price?: string | number;
  /** Purchase: down payment as a percent of the price ("0", "5", "10"). */
  down?: string | number;
  /** Non-purchase loans (IRRRL, cash-out, assumption, manufactured): the loan amount. Purchase: an explicit base loan. */
  loan?: string | number;
  show?: FeeShow;
  /** monthly / totalPaid: annual interest rate in percent ("6.5"). */
  interest?: string | number;
  /** monthly / totalPaid: term in years ("30"). */
  years?: string | number;
  /** payment only: "yes" = P&I on the base loan plus the financed fee. */
  withFee?: 'yes' | 'no';
  /** payment only: monthly amounts the post states as example inputs (taxes, insurance) added to P&I. */
  plus?: string | number;
  /** payment only: show this monthly amount (e.g. an example BAH) minus the payment instead. */
  subtractFrom?: string | number;
  /** fee only: show the difference from the same price with this use instead. */
  vsUse?: FeeUse;
  /** fee only: show the difference from the same price with this down payment percent instead. */
  vsDown?: string | number;
}

/** A numeric MDX prop; throws on anything that isn't a number ≥ min (never renders NaN). */
function num(v: string | number | undefined, prop: string, min = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (v === undefined || v === '' || !Number.isFinite(n) || n < min) {
    throw new Error(`VaFundingFee: bad ${prop} "${v}"`);
  }
  return n;
}

export interface FeeScenario {
  rate: number;
  baseLoan: number;
  downDollars: number;
  fee: number;
}

/** Rate, base loan and fee for one scenario (no exemption applied). */
export function feeScenario(i: Pick<FeeFigureInput, 'type' | 'use' | 'price' | 'down' | 'loan'>): FeeScenario {
  const type = i.type ?? 'purchase';
  const use = i.use ?? 'first';
  if (use !== 'first' && use !== 'subsequent') throw new Error(`VaFundingFee: bad use "${use}"`);
  const firstUse = use === 'first';

  if (type === 'purchase') {
    const downPct = i.down === undefined ? 0 : num(i.down, 'down');
    if (downPct >= 100) throw new Error(`VaFundingFee: bad down "${i.down}"`);
    const rate = getFundingFeeRate(firstUse, downPct);
    if (i.loan !== undefined) {
      const baseLoan = num(i.loan, 'loan', 1);
      return { rate, baseLoan, downDollars: 0, fee: fundingFeeAmount(baseLoan, rate) };
    }
    // A rate on its own needs no price.
    if (i.price === undefined) return { rate, baseLoan: 0, downDollars: 0, fee: 0 };
    const price = num(i.price, 'price', 1);
    const downDollars = Math.round((price * downPct) / 100);
    const baseLoan = price - downDollars;
    return { rate, baseLoan, downDollars, fee: fundingFeeAmount(baseLoan, rate) };
  }

  const rates: Record<Exclude<FeeLoanType, 'purchase'>, number> = {
    irrrl: VA_IRRRL_FUNDING_FEE,
    cashout: firstUse ? VA_CASH_OUT_FUNDING_FEE.first : VA_CASH_OUT_FUNDING_FEE.subsequent,
    assumption: VA_ASSUMPTION_FUNDING_FEE,
    manufactured: VA_MANUFACTURED_HOME_FUNDING_FEE,
  };
  const rate = rates[type];
  if (rate === undefined) throw new Error(`VaFundingFee: bad type "${type}"`);
  // A rate on its own needs no loan amount.
  const baseLoan = i.loan === undefined ? 0 : num(i.loan, 'loan', 1);
  return { rate, baseLoan, downDollars: 0, fee: fundingFeeAmount(baseLoan, rate) };
}

/** The text one <VaFundingFee> renders. */
export function vaFundingFeeFigure(i: FeeFigureInput): string {
  const show = i.show ?? 'fee';
  const s = feeScenario(i);
  const needsLoan = show !== 'rate';
  if (needsLoan && s.baseLoan <= 0) throw new Error(`VaFundingFee: show="${show}" needs price or loan`);

  switch (show) {
    case 'rate':
      return feeRateLabel(s.rate);
    case 'loan':
      return formatCurrency(s.baseLoan);
    case 'down':
      return formatCurrency(s.downDollars);
    case 'financed':
      return formatCurrency(s.baseLoan + s.fee);
    case 'fee': {
      if (i.vsUse === undefined && i.vsDown === undefined) return formatCurrency(s.fee);
      const other = feeScenario({ ...i, use: i.vsUse ?? i.use, down: i.vsDown ?? i.down });
      return formatCurrency(Math.abs(s.fee - other.fee));
    }
    case 'monthly':
    case 'totalPaid': {
      const interest = num(i.interest, 'interest');
      const years = num(i.years, 'years', 1);
      const monthly = calcMonthlyPI(s.fee, interest, years);
      return formatCurrency(Math.round(show === 'monthly' ? monthly : monthly * years * 12));
    }
    case 'payment': {
      const interest = num(i.interest, 'interest');
      const years = num(i.years, 'years', 1);
      const loan = i.withFee === 'yes' ? s.baseLoan + s.fee : s.baseLoan;
      const plus = i.plus === undefined ? 0 : num(i.plus, 'plus');
      const total = calcMonthlyPI(loan, interest, years) + plus;
      if (i.subtractFrom === undefined) return formatCurrency(Math.round(total));
      return formatCurrency(Math.round(num(i.subtractFrom, 'subtractFrom') - total));
    }
    default:
      throw new Error(`VaFundingFee: bad show "${show}"`);
  }
}

