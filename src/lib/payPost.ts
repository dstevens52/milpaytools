/**
 * S8 (FIX_QUEUE row 10): pay figures that posts and guide pages used to type by
 * hand, computed from the pay table, BAS_RATES and the deployment tax lib.
 *
 * Every function takes the pay data as its last argument, defaulting to the
 * current table (CURRENT_PAY_POST_DATA). The year word a page prints next to a
 * figure comes from the same object (`data.year`), so when the January pay flip
 * replaces the table, the text and the number change together. Tests pass a
 * second year's data to prove it (tests/e2e/s8-typed-figures-unit.spec.ts).
 *
 * Server/build only. No projections: every figure is a current monthly or
 * annual amount, or a fixed multiple of one that the page states.
 */

import { DATA_YEAR as PAY_TABLE_YEAR, payTable } from '@/data/pay-tables/2026';
import { BAS_RATES, DATA_YEAR as CONSTANTS_YEAR, SGLI_MAX_COVERAGE } from '@/data/constants';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import type { PayTable } from '@/data/types';
import { lookupBasePay } from '@/lib/calculations/basePay';
import { czteSavingsMarginal } from '@/lib/calculations/deployment';
import { estimateAnnualFederalTax, type FilingStatus } from '@/lib/calculations/federalTax';
import { formatCurrency } from '@/lib/utils';

export interface PayPostData {
  /** The pay table's year. BAS follows it (src/lib/combinedPayYear.ts). */
  year: string;
  table: PayTable;
  bas: { enlisted: number; officer: number };
}

export const CURRENT_PAY_POST_DATA: PayPostData = { year: PAY_TABLE_YEAR, table: payTable, bas: BAS_RATES };

/**
 * The year of the federal brackets and standard deductions (src/data/constants.ts,
 * IRS Rev. Proc. 2025-32 for 2026). That file's DATA_YEAR is its annual-update year.
 */
export const TAX_TABLE_YEAR = CONSTANTS_YEAR;

/** Dollars and cents, "$3,946.80". */
export const usdCents = (n: number) => formatCurrency(Math.round(n * 100 + 1e-7) / 100, true);
/** Whole dollars, "$57,114". */
export const usd0 = (n: number) => formatCurrency(Math.round(n));

/** Monthly basic pay; throws instead of rendering $0 for a grade/YOS the table lacks. */
export function basicPay(grade: string, yos: number, data: PayPostData = CURRENT_PAY_POST_DATA): number {
  const v = lookupBasePay(grade, yos, data.table);
  if (!(v > 0)) throw new Error(`payPost: no ${data.year} basic pay for ${grade} at ${yos} years`);
  return v;
}

export function bas(kind: 'enlisted' | 'officer', data: PayPostData = CURRENT_PAY_POST_DATA): number {
  const v = data.bas[kind];
  if (!(v > 0)) throw new Error(`payPost: no ${data.year} BAS for ${kind}`);
  return v;
}

// ─── SGLI income benchmark (is-sgli-enough-life-insurance) ───────────────────

/** "10–12 times annual income", for an E-6 with 10 years, on basic pay alone. */
export const SGLI_BENCHMARK = { grade: 'E-6', yos: 10, lowMultiple: 10, highMultiple: 12 } as const;

export interface SgliBenchmark {
  year: string;
  monthly: number;
  annual: number;
  low: number;
  high: number;
  max: number;
  /** Where the 10–12× range sits against the SGLI maximum. */
  vsMax: 'above' | 'below' | 'around';
}

export function sgliBenchmark(data: PayPostData = CURRENT_PAY_POST_DATA): SgliBenchmark {
  const b = SGLI_BENCHMARK;
  const monthly = basicPay(b.grade, b.yos, data);
  const annual = Math.round(monthly * 12 * 100 + 1e-7) / 100;
  const low = annual * b.lowMultiple;
  const high = annual * b.highMultiple;
  const max = SGLI_MAX_COVERAGE;
  const vsMax = low > max ? 'above' : high < max ? 'below' : 'around';
  return { year: data.year, monthly, annual, low, high, max, vsMax };
}

/** "above the $500,000 SGLI maximum" / "below …" / "around …". */
export function sgliVsMaxPhrase(s: SgliBenchmark): string {
  return `${s.vsMax} the ${usd0(s.max)} SGLI maximum`;
}

/** The FAQ answer (POST_FAQS, schema + visible <PostFaq />), built from the same figures as the post body. */
export function sgliEnoughFaqAnswer(data: PayPostData = CURRENT_PAY_POST_DATA): string {
  const s = sgliBenchmark(data);
  return (
    `It depends on your situation. A common benchmark is 10–12 times annual income. ` +
    `An E-6 with 10 years of service earns ${usd0(s.annual)} a year in ${s.year} basic pay ` +
    `(${usdCents(s.monthly)} a month × 12), so 10–12 times that is ${usd0(s.low)}–${usd0(s.high)}, ` +
    `${sgliVsMaxPhrase(s)} before counting allowances. ` +
    `Single members with no dependents may need much less; a family with a mortgage, young children, ` +
    `and a single income may need more than ${usd0(s.max)}.`
  );
}

// ─── BRS government TSP contributions ────────────────────────────────────────

/** The BRS maximum government contribution (1% automatic + up to 4% matching). */
export const BRS_MAX_GOVERNMENT_RATE = TSP_CONSTANTS_2026.brsMatchingTiers.maxGovernment;

/** Monthly government TSP contribution at the BRS maximum, on this grade's basic pay. */
export function brsMaxGovernmentMonthly(grade: string, yos: number, data: PayPostData = CURRENT_PAY_POST_DATA): number {
  // Half-cent up (279.585 → 279.59); the +1e-7 absorbs float noise (5591.70 × 0.05 × 100 = 27958.4999…).
  return Math.round(basicPay(grade, yos, data) * BRS_MAX_GOVERNMENT_RATE * 100 + 1e-7) / 100;
}

// ─── CZTE on base pay alone (deployment-pay-explained) ───────────────────────

export interface CzteBasePayExample {
  payYear: string;
  taxYear: string;
  monthlyBasePay: number;
  /** Federal income tax on basic pay alone in a normal month: tax(12 × pay) ÷ 12, the deployment lib's method. */
  monthlyTax: number;
  /** CZTE savings over a 12-month deployment (czteSavingsMarginal, no special pays). */
  savings12: number;
}

/**
 * Base pay only, no IDP/HFP: the same numbers the deployment calculator gives for
 * 12 months in a combat zone with no special pays (the unit test checks it
 * against calculateDeployment).
 */
export function czteBasePayExample(
  grade: string,
  yos: number,
  filingStatus: FilingStatus,
  data: PayPostData = CURRENT_PAY_POST_DATA,
): CzteBasePayExample {
  const monthlyBasePay = basicPay(grade, yos, data);
  return {
    payYear: data.year,
    taxYear: TAX_TABLE_YEAR,
    monthlyBasePay,
    monthlyTax: estimateAnnualFederalTax(monthlyBasePay * 12, filingStatus) / 12,
    savings12: czteSavingsMarginal(monthlyBasePay, monthlyBasePay, 0, 12, filingStatus),
  };
}

/** "2026 pay table, brackets and standard deduction", or both years when they differ. */
export function czteYearsLabel(payYear: string, taxYear: string = TAX_TABLE_YEAR): string {
  return payYear === taxYear
    ? `${payYear} pay table, brackets and standard deduction`
    : `${payYear} pay table; ${taxYear} brackets and standard deduction`;
}
