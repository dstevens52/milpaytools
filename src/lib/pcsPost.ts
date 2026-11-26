/**
 * S8 (FIX_QUEUE row 10): the DLA table and MALT rate in pcs-financial-planning-guide,
 * read from the PCS calculator's own rate file (src/data/pcs/2026/constants.ts,
 * DTMO MAP 72-25(I); DLA cells checked by tests/e2e/pcs-dla-unit.spec.ts).
 *
 * The year label comes from the same rates object (`rates.year`), so the label
 * and the figures change together. Server/build only.
 */

import { PCS_RATES_2026 } from '@/data/pcs/2026/constants';
import { formatCurrency } from '@/lib/utils';

export interface PcsPostRates {
  year: number;
  maltPerMile: number;
  dla: { withDependents: Record<string, number>; withoutDependents: Record<string, number> };
}

export const CURRENT_PCS_POST_RATES: PcsPostRates = PCS_RATES_2026;

/** The post's four rows (the grades each covers). */
export const DLA_POST_ROWS: { label: string; grades: string[] }[] = [
  { label: 'E-1 – E-4', grades: ['E-1', 'E-2', 'E-3', 'E-4'] },
  { label: 'E-5 – E-9', grades: ['E-5', 'E-6', 'E-7', 'E-8', 'E-9'] },
  { label: 'O-1 – O-3', grades: ['O-1', 'O-2', 'O-3'] },
  { label: 'O-4 – O-6', grades: ['O-4', 'O-5', 'O-6'] },
];

const usdCents = (n: number) => formatCurrency(n, true);

/** "$1,870.58 – $2,389.42", or one figure when every grade in the row has the same rate. */
export function dlaRangeText(grades: string[], table: Record<string, number>): string {
  const values = grades.map((g) => {
    const v = table[g];
    if (!(v > 0)) throw new Error(`pcsPost: no DLA rate for ${g}`);
    return v;
  });
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? usdCents(lo) : `${usdCents(lo)} – ${usdCents(hi)}`;
}

export function dlaPostTable(rates: PcsPostRates = CURRENT_PCS_POST_RATES): {
  year: number;
  rows: { label: string; without: string; with: string }[];
} {
  return {
    year: rates.year,
    rows: DLA_POST_ROWS.map((r) => ({
      label: r.label,
      without: dlaRangeText(r.grades, rates.dla.withoutDependents),
      with: dlaRangeText(r.grades, rates.dla.withDependents),
    })),
  };
}

/** "$0.205" — MALT per mile as DTMO publishes it (three decimals). */
export function maltPerMileText(rates: PcsPostRates = CURRENT_PCS_POST_RATES): string {
  if (!(rates.maltPerMile > 0)) throw new Error('pcsPost: no MALT rate');
  return `$${rates.maltPerMile.toFixed(3)}`;
}
