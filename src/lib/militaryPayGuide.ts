/**
 * S8 (FIX_QUEUE row 10): figures on /guides/military-pay that used to be typed.
 *
 * - BAH ranges (BAH alone): lowest and highest with-dependents rate for a grade
 *   across every MHA (territories excluded) for BAH_YEAR, with that year as the label.
 * - Pay + BAH examples: one year for both (the one-year rule, src/lib/combinedPayYear.ts):
 *   the pay table's year, with combinedBahForZip for that year's BAH.
 *
 * Inputs are arguments with current defaults, so tests can pass another year.
 * Server/build only (reads the BAH registry).
 */

import { BAH_YEAR } from '@/data/bah/current';
import { BAH_LOOKUP_TABLES, BAH_RATES_BY_YEAR, type MhaRateTable } from '@/data/bah/registry';
import { combinedBahForZip } from '@/lib/calculations/bah';
import { displayMhaName } from '@/lib/mhaDisplay';
import { CURRENT_PAY_POST_DATA, bas, basicPay, brsMaxGovernmentMonthly, type PayPostData } from '@/lib/payPost';

export interface BahRange {
  year: string;
  grade: string;
  min: number;
  max: number;
  /** DTMO area of the highest rate (display name), when the year's MHA names are loaded. */
  maxArea: string | null;
}

export function bahRangeForGrade(
  grade: string,
  year: string = BAH_YEAR,
  rates: MhaRateTable | undefined = (BAH_RATES_BY_YEAR as Record<string, MhaRateTable>)[year],
  names: Record<string, string> | undefined = (BAH_LOOKUP_TABLES as Record<string, { mhaNames: Record<string, string> }>)[year]?.mhaNames,
): BahRange {
  if (!rates) throw new Error(`militaryPayGuide: no BAH rates for ${year}`);
  const entries = Object.entries(rates)
    .filter(([code]) => !code.startsWith('XX'))
    .map(([code, set]) => [code, set.w[grade] ?? 0] as const)
    .filter(([, v]) => v > 0);
  if (entries.length === 0) throw new Error(`militaryPayGuide: no ${year} BAH for ${grade}`);
  let min = entries[0][1];
  let [maxCode, max] = entries[0];
  for (const [code, v] of entries) {
    if (v < min) min = v;
    if (v > max) [maxCode, max] = [code, v];
  }
  const name = names?.[maxCode];
  return { year, grade, min, max, maxArea: name ? displayMhaName(maxCode, name) : null };
}

export interface PayBahExample {
  year: string;
  basePay: number;
  bah: number;
  bas: number;
  /** BRS maximum government TSP contribution (5% of basic pay); 0 when not included. */
  tspMatch: number;
  total: number;
}

/** Enlisted, with dependents: basic pay + BAH at the ZIP + BAS (+ the BRS 5% government contribution). */
export function payBahExample(
  zip: string,
  grade: string,
  yos: number,
  opts: { withTspMatch: boolean },
  data: PayPostData = CURRENT_PAY_POST_DATA,
  bahAt: (zip: string, grade: string) => number = (z, g) => combinedBahForZip(z, g, true),
): PayBahExample {
  const basePay = basicPay(grade, yos, data);
  const bah = bahAt(zip, grade);
  if (!(bah > 0)) throw new Error(`militaryPayGuide: no BAH for ${grade} at ZIP ${zip}`);
  const b = bas('enlisted', data);
  const tspMatch = opts.withTspMatch ? brsMaxGovernmentMonthly(grade, yos, data) : 0;
  return { year: data.year, basePay, bah, bas: b, tspMatch, total: basePay + bah + b + tspMatch };
}

/** The two worked examples on the page. */
export const GUIDE_EXAMPLES = {
  /** "What would a civilian need to earn" accordion: E-5, 6 years, JBLM (ZIP 98433 → WA311 Tacoma, WA). */
  jblm: { zip: '98433', grade: 'E-5', yos: 6, label: 'Joint Base Lewis-McChord' },
  /** Sample card: E-5, 6 years, Fort Carson (ZIP 80913 → CO046 Colorado Springs, CO). */
  fortCarson: { zip: '80913', grade: 'E-5', yos: 6, label: 'Fort Carson, CO' },
} as const;
