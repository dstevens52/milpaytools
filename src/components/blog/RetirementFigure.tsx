import { formatCurrency } from '@/lib/utils';
import {
  retirementExample,
  annualInYear,
  lifetimeNominal,
  crdpCrscExample,
  cents,
} from '@/lib/calculations/retirementExample';

// MDX posts can't import data modules, so the retirement worked examples are
// rendered here from the retirement calculator's own functions (C1). Server only.

type Format = 'cents' | 'dollars' | 'thousands' | 'millions';

function format(n: number, f: Format): string {
  switch (f) {
    case 'cents':
      return formatCurrency(cents(n), true);
    case 'dollars':
      return formatCurrency(n);
    case 'thousands':
      return formatCurrency(Math.round(n / 1000) * 1000);
    case 'millions':
      return `$${(n / 1_000_000).toFixed(1)} million`;
  }
}

type RetirementFigureName =
  | 'high3Average'
  | 'high3Pension'
  | 'brsPension'
  | 'high3Annual'
  | 'brsAnnual'
  | 'gapMonthly'
  | 'gapAnnual'
  | 'finalYearPay'
  | 'finalYearPayAnnual'
  | 'perExtraYear'
  | 'perExtraYearTotal'
  | 'high3AnnualInYear'
  | 'high3Lifetime'
  | 'brsLifetime';

interface Props {
  name: RetirementFigureName;
  grade?: string;
  // Numbers arrive as strings from MDX: next-mdx-remote drops JS-expression props
  // like years={44}, so posts write years="44".
  yos?: number | string;
  format?: Format;
  /** Collection year (high3AnnualInYear) or years of collection (lifetime totals). */
  years?: number | string;
  /** gapAnnual only: multiply the annual gap by this many years. */
  times?: number | string;
}

/** A numeric MDX prop; throws on anything that isn't a positive number (never renders NaN). */
function num(v: number | string, prop: string): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`RetirementFigure: bad ${prop} "${v}"`);
  return n;
}

/** One figure from a retirement worked example (default: E-7 retiring at exactly 20 years). */
export function RetirementFigure({ name, grade = 'E-7', yos: yosProp = 20, format: f = 'cents', years: yearsProp = 1, times: timesProp = 1 }: Props) {
  const yos = num(yosProp, 'yos');
  const years = num(yearsProp, 'years');
  const times = num(timesProp, 'times');
  const ex = retirementExample(grade, yos);
  const values: Record<RetirementFigureName, () => number> = {
    high3Average: () => ex.high3Average,
    high3Pension: () => ex.high3Pension,
    brsPension: () => ex.brsPension,
    high3Annual: () => ex.high3Pension * 12,
    brsAnnual: () => ex.brsPension * 12,
    gapMonthly: () => ex.high3Pension - ex.brsPension,
    gapAnnual: () => (ex.high3Pension - ex.brsPension) * 12 * times,
    finalYearPay: () => ex.finalYearMonthlyPay,
    finalYearPayAnnual: () => ex.finalYearMonthlyPay * 12,
    perExtraYear: () => ex.high3PerExtraYear,
    // Before COLA: the extra monthly pension × 12 × years of collection.
    perExtraYearTotal: () => ex.high3PerExtraYear * 12 * years,
    high3AnnualInYear: () => annualInYear(ex.high3Pension, years),
    high3Lifetime: () => lifetimeNominal(ex.high3Pension, years),
    brsLifetime: () => lifetimeNominal(ex.brsPension, years),
  };
  return <>{format(values[name](), f)}</>;
}

/** "12 months at the Over 16 rate ($6,000.90) and 24 months at the Over 18 rate ($6,177.30)". */
export function High3Breakdown({ grade = 'E-7', yos = 20 }: { grade?: string; yos?: number }) {
  const parts = retirementExample(grade, yos).breakdown.map(
    (b) => `${b.months} months at the ${b.column} rate (${formatCurrency(b.monthlyPay, true)})`,
  );
  return <>{parts.length === 2 ? `${parts[0]} and ${parts[1]}` : parts.join(', ')}</>;
}

type CrdpCrscName =
  | 'va'
  | 'vaCombat'
  | 'netAfterOffset'
  | 'gross'
  | 'grossPartial'
  | 'taxCrdp'
  | 'taxCrsc'
  | 'netCrdp'
  | 'netCrscFull'
  | 'netCrscPartial'
  | 'taxDiff';

/** One figure from the crdp-vs-crsc worked example (E-7 at 20, 70% VA, 40% combat-related). */
export function CrdpCrscFigure({ name, rate: rateProp = 0.22, format: f = 'cents' }: { name: CrdpCrscName; rate?: number | string; format?: Format }) {
  const rate = num(rateProp, 'rate');
  const ex = crdpCrscExample(retirementExample('E-7', 20).high3Pension);
  const values: Record<CrdpCrscName, () => number> = {
    va: () => ex.va,
    vaCombat: () => ex.vaCombat,
    netAfterOffset: () => ex.netAfterOffset,
    gross: () => ex.gross,
    grossPartial: () => ex.grossPartial,
    taxCrdp: () => ex.tax(rate).crdp,
    taxCrsc: () => ex.tax(rate).crsc,
    netCrdp: () => ex.net(rate).crdp,
    netCrscFull: () => ex.net(rate).crscFull,
    netCrscPartial: () => ex.net(rate).crscPartial,
    taxDiff: () => ex.tax(rate).crdp - ex.tax(rate).crsc,
  };
  return <>{format(values[name](), f)}</>;
}
