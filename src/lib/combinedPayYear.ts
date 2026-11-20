/**
 * The one-year rule (R3, FIX_QUEUE row 11d): any figure that adds pay to BAH
 * uses ONE year for both, the way station pages' "total pay by rank" always has.
 *
 * - Today (2026 pay table, 2026 BAH): 2026 for both.
 * - Transition (DoD has published 2027 BAH and it's loaded, the 2027 pay table
 *   isn't the current table yet): totals use 2026 BAH with 2026 pay, what
 *   members are paid now. 2027 BAH may be shown as its own labeled line
 *   ("2027 BAH (from Jan. 1)"), never added into a 2026 total. Pages that show
 *   BAH alone keep showing BAH_YEAR (2027).
 * - After the January pay flip (2027 pay table current): 2027 for both.
 *
 * The pay year is the pay table the site computes with (`DATA_YEAR` of
 * src/data/pay-tables/2026.ts, which the January pay flip replaces); BAS
 * follows it. The BAH year is BAH_YEAR (src/data/bah/current.ts).
 *
 * Client-safe: imports only the two year constants.
 * Runbooks: docs/RELEASE_DAY_BAH_2027.md, docs/RELEASE_DAY_2027_PAY.md.
 */

import { BAH_YEAR } from '@/data/bah/current';
import { DATA_YEAR as PAY_TABLE_YEAR } from '@/data/pay-tables/2026';

export interface PayBahYears {
  /** Year of the basic pay table in use (BAS follows it). */
  payYear: string;
  /** BAH_YEAR: the newest BAH year loaded. */
  bahYear: string;
}

export const CURRENT_PAY_BAH_YEARS: PayBahYears = { payYear: PAY_TABLE_YEAR, bahYear: BAH_YEAR };

/**
 * The year every figure that adds pay to BAH uses: the pay table's year, with
 * that same year's BAH. A newer BAH year (loaded on BAH release day, before the
 * January pay flip) waits for its pay table. A pay table newer than the BAH
 * data has no matching BAH: that's a configuration error, never a silent mix.
 */
export function combinedPayBahYear(y: PayBahYears = CURRENT_PAY_BAH_YEARS): string {
  if (Number(y.payYear) > Number(y.bahYear)) {
    throw new Error(
      `one-year rule: the ${y.payYear} pay table is in use but BAH is only loaded through ${y.bahYear}; load ${y.payYear} BAH first`,
    );
  }
  return y.payYear;
}

/** The newer BAH year that is loaded but not yet used in totals (transition), or null. */
export function pendingBahYear(y: PayBahYears = CURRENT_PAY_BAH_YEARS): string | null {
  return Number(y.bahYear) > Number(combinedPayBahYear(y)) ? y.bahYear : null;
}

/**
 * For client calculators that fetch BAH from /api/bah/lookup and add it to pay:
 * the `ratesYear` to request, or undefined when the combined year IS BAH_YEAR
 * (then the request, and its cache key, stay exactly what they are today).
 */
export function combinedBahRatesYear(y: PayBahYears = CURRENT_PAY_BAH_YEARS): string | undefined {
  const year = combinedPayBahYear(y);
  return year === y.bahYear ? undefined : year;
}

/** Label for the separate newer-BAH line next to a combined total. */
export function pendingBahLabel(pendingYear: string): string {
  return `${pendingYear} BAH (from Jan. 1)`;
}
