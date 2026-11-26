import {
  CURRENT_PAY_POST_DATA,
  bas,
  basicPay,
  brsMaxGovernmentMonthly,
  czteBasePayExample,
  czteYearsLabel,
  sgliBenchmark,
  sgliVsMaxPhrase,
  usd0,
  usdCents,
} from '@/lib/payPost';
import type { FilingStatus } from '@/lib/calculations/federalTax';

// S8: pay figures for posts, from the pay table and BAS_RATES via src/lib/payPost.ts.
// Server only. Props arrive as strings from MDX (next-mdx-remote drops
// JS-expression props like yos={4}), so numbers are parsed and checked here.

function num(v: string | undefined, prop: string, component: string): number {
  const n = Number(v);
  if (v === undefined || !Number.isFinite(n) || n < 0) throw new Error(`${component}: bad ${prop} "${v}"`);
  return n;
}

type PayFigureName = 'basicPay' | 'basicPayAnnual' | 'basicPayDiff' | 'bas' | 'brsMatch';

/**
 * One pay figure.
 * - basicPay / basicPayAnnual: grade + yos (completed years of service).
 * - basicPayDiff: basic pay at `to` years minus basic pay at `yos` years.
 * - bas: kind="enlisted" | "officer".
 * - brsMatch: the BRS maximum government TSP contribution (5%) a month at grade + yos.
 */
export function PayFigure({
  name,
  grade,
  yos,
  to,
  kind,
}: {
  name: PayFigureName;
  grade?: string;
  yos?: string;
  to?: string;
  kind?: 'enlisted' | 'officer';
}) {
  const g = () => {
    if (!grade) throw new Error(`PayFigure ${name}: grade is required`);
    return grade;
  };
  switch (name) {
    case 'basicPay':
      return <>{usdCents(basicPay(g(), num(yos, 'yos', 'PayFigure')))}</>;
    case 'basicPayAnnual':
      return <>{usd0(basicPay(g(), num(yos, 'yos', 'PayFigure')) * 12)}</>;
    case 'basicPayDiff':
      return <>{usdCents(basicPay(g(), num(to, 'to', 'PayFigure')) - basicPay(g(), num(yos, 'yos', 'PayFigure')))}</>;
    case 'bas':
      if (kind !== 'enlisted' && kind !== 'officer') throw new Error(`PayFigure bas: bad kind "${kind}"`);
      return <>{usdCents(bas(kind))}</>;
    case 'brsMatch':
      return <>{usdCents(brsMaxGovernmentMonthly(g(), num(yos, 'yos', 'PayFigure')))}</>;
  }
}

/** The pay table's year (DATA_YEAR of the pay table in use), for labels next to PayFigure values. */
export function PayYear() {
  return <>{CURRENT_PAY_POST_DATA.year}</>;
}

type SgliName = 'monthly' | 'annual' | 'low' | 'high' | 'vsMax' | 'year';

/** The is-sgli-enough benchmark: E-6 with 10 years, 10–12 × annual basic pay. */
export function SgliBenchmarkFigure({ name }: { name: SgliName }) {
  const s = sgliBenchmark();
  switch (name) {
    case 'monthly':
      return <>{usdCents(s.monthly)}</>;
    case 'annual':
      return <>{usd0(s.annual)}</>;
    case 'low':
      return <>{usd0(s.low)}</>;
    case 'high':
      return <>{usd0(s.high)}</>;
    case 'vsMax':
      return <>{sgliVsMaxPhrase(s)}</>;
    case 'year':
      return <>{s.year}</>;
  }
}

type CzteName = 'basePay' | 'monthlyTax' | 'savings12' | 'years';

/**
 * CZTE on basic pay alone (no special pays), from the deployment lib's tax method.
 * filing="single" | "mfj". Base pay in dollars and cents (the pay table's figure); the tax
 * estimates in whole dollars, the way the deployment calculator shows them.
 */
export function CzteBasePayFigure({
  name,
  grade,
  yos,
  filing,
}: {
  name: CzteName;
  grade: string;
  yos: string;
  filing: FilingStatus;
}) {
  if (filing !== 'single' && filing !== 'mfj') throw new Error(`CzteBasePayFigure: bad filing "${filing}"`);
  const ex = czteBasePayExample(grade, num(yos, 'yos', 'CzteBasePayFigure'), filing);
  switch (name) {
    case 'basePay':
      return <>{usdCents(ex.monthlyBasePay)}</>;
    case 'monthlyTax':
      return <>{usd0(ex.monthlyTax)}</>;
    case 'savings12':
      return <>{usd0(ex.savings12)}</>;
    case 'years':
      return <>{czteYearsLabel(ex.payYear, ex.taxYear)}</>;
  }
}
