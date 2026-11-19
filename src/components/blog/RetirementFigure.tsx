import { formatCurrency } from '@/lib/utils';
import { BAS_RATES } from '@/data/constants';
import { lookupBasePay } from '@/lib/calculations/basePay';
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
  | 'brsLifetime'
  | 'basEnlisted'
  | 'basEnlistedAnnual'
  | 'basicPayAt';

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
    basEnlisted: () => BAS_RATES.enlisted,
    basEnlistedAnnual: () => BAS_RATES.enlisted * 12,
    // Monthly basic pay for `grade` with `years` completed years of service.
    basicPayAt: () => lookupBasePay(grade, years),
  };
  return <>{format(values[name](), f)}</>;
}

/**
 * The 20th-year compensation total in what-walking-away-at-12-years-costs: final-year
 * basic pay (lib) + BAS (lib) + the post's stated example amounts, which the post
 * lists right above the total (BAH example a month, TRICARE value, retirement accrual).
 */
export function FinalYearCompTotal({
  bahMonthly,
  tricare,
  accrual,
  grade = 'E-7',
  yos = 20,
}: {
  bahMonthly: string;
  tricare: string;
  accrual: string;
  grade?: string;
  yos?: number | string;
}) {
  const ex = retirementExample(grade, num(yos, 'yos'));
  const total =
    ex.finalYearMonthlyPay * 12 +
    num(bahMonthly, 'bahMonthly') * 12 +
    BAS_RATES.enlisted * 12 +
    num(tricare, 'tricare') +
    num(accrual, 'accrual');
  return <>{format(total, 'thousands')}</>;
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
  | 'taxDiff'
  | 'advantageFull'
  | 'advantagePartial'
  | 'uncovered';

/** One figure from the crdp-vs-crsc worked example (E-7 at 20, 70% VA, 40% combat-related). */
export function CrdpCrscFigure({
  name,
  rate: rateProp = 0.22,
  format: f = 'cents',
  times: timesProp = 1,
}: {
  name: CrdpCrscName;
  rate?: number | string;
  format?: Format;
  /** Multiply the monthly figure (e.g. times="12" for a year). */
  times?: number | string;
}) {
  const rate = num(rateProp, 'rate');
  const times = num(timesProp, 'times');
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
    // Example 1 (all combat-related): CRSC take-home minus CRDP take-home.
    advantageFull: () => ex.net(rate).crscFull - ex.net(rate).crdp,
    // Example 2 (40% combat-related): CRDP take-home minus CRSC take-home.
    advantagePartial: () => ex.net(rate).crdp - ex.net(rate).crscPartial,
    // The part of the offset CRSC doesn't cover in example 2.
    uncovered: () => ex.va - ex.vaCombat,
  };
  return <>{format(values[name]() * times, f)}</>;
}
