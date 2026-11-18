/**
 * VA compensation rate-year registry — the ONLY place that decides which year's
 * table is "current". The calculator (src/lib/calculations/va-disability.ts),
 * retirement, transition readiness and the rate table on
 * /calculators/va-disability all read CURRENT_VA_RATES from here.
 *
 * Client-safe: data only (the two tables are small).
 *
 * The switch to 2027: CURRENT_VA_RATES becomes the 2027 table when
 *   1. src/data/va-rates/2027-status.ts says 'published', and
 *   2. src/data/va-rates/2027.ts holds VA's table (vaRates + colaPercent), and
 *   3. the build date is on or after the 2027 effective date (December 1, 2026).
 * Pages are prerendered, so (3) uses the BUILD date (next.config.ts sets
 * process.env.BUILD_DATE; the same literal is inlined into server and client
 * bundles, so they always agree). If the 2027 data lands before December 1,
 * redeploy production on December 1 to switch. Outside Next (unit tests,
 * scripts) the date falls back to today.
 */

import type { VADisabilityTable } from '@/data/types';
import { vaRates as rates2026, VA_RATES_META as meta2026 } from './2026';
import { vaRates as rates2027, VA_RATES_META as meta2027 } from './2027';
import { VA_RATES_2027_STATUS, type VaRates2027StatusConfig } from './2027-status';

export interface VaRatesYear {
  year: string;
  table: VADisabilityTable;
  /** ISO date the rates take effect (December 1 of the prior calendar year). */
  effectiveDate: string;
  /** COLA percent over the prior year's table. */
  colaPercent: number;
  /** VA.gov page the table was copied from. */
  sourceUrl: string;
}

export const VA_RATES_2026: VaRatesYear = {
  year: '2026',
  table: rates2026,
  effectiveDate: meta2026.effectiveDate,
  colaPercent: meta2026.colaPercent ?? 0,
  sourceUrl: meta2026.sourceUrl,
};

/** The effective date of the 2027 rates, known before the table is published. */
export const VA_2027_EFFECTIVE_DATE = meta2027.effectiveDate;

/**
 * The 2027 rate year, or null until VA has published it (status 'published'
 * and the table + COLA percent filled in 2027.ts).
 */
export function vaRates2027(
  status: VaRates2027StatusConfig = VA_RATES_2027_STATUS,
  table: VADisabilityTable | null = rates2027,
  meta: typeof meta2027 = meta2027,
): VaRatesYear | null {
  if (status.status !== 'published' || !table || meta.colaPercent === null) return null;
  return {
    year: '2027',
    table,
    effectiveDate: meta.effectiveDate,
    colaPercent: meta.colaPercent,
    sourceUrl: meta.sourceUrl,
  };
}

/** Which table is current on `asOf` (ISO date). Pure, for tests. */
export function selectVaRatesYear(asOf: string, published2027: VaRatesYear | null = vaRates2027()): VaRatesYear {
  if (published2027 && asOf >= published2027.effectiveDate) return published2027;
  return VA_RATES_2026;
}

/** ISO date the site was built (see the header). */
export const VA_RATES_AS_OF: string = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);

/** The current-year table, used everywhere a VA compensation figure is shown. */
export const CURRENT_VA_RATES: VaRatesYear = selectVaRatesYear(VA_RATES_AS_OF);
