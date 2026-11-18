/**
 * FY2027 VA Disability Compensation Rates (monthly) — NOT YET PUBLISHED.
 *
 * Placeholder until VA publishes its 2027 tables. While `vaRates` is null the
 * site uses the 2026 table (src/data/va-rates/registry.ts) and shows a dated
 * notice from src/data/va-rates/2027-status.ts.
 *
 * Publish day (data-only, no component edits):
 *   1. Copy every cell from https://www.va.gov/disability/compensation-rates/veteran-rates/
 *      (and the added-amounts table) into `vaRates` below, same shape as 2026.ts.
 *      Record the URL and the date fetched in this header.
 *   2. Set VA_RATES_META.colaPercent to the COLA VA states on that page.
 *   3. Set status: 'published' (and checkedDate) in ./2027-status.ts.
 *   tests/e2e/va-rates-registry.spec.ts then checks every cell against the 2026
 *   cell × (1 + COLA) as a TYPO CHECK ONLY: if a cell is off by more than a few
 *   cents, stop and report it. Never "correct" a published figure to the formula.
 *
 * Never fill this table with computed or estimated values.
 */

import type { VADisabilityTable } from '@/data/types';

export const DATA_YEAR = '2027';

/** null until VA publishes its 2027 table. */
export const vaRates: VADisabilityTable | null = null;

export const VA_RATES_META = {
  /** The 2027 rates take effect December 1, 2026. */
  effectiveDate: '2026-12-01',
  /** COLA percent as VA states it with the 2027 table; null until published. */
  colaPercent: null as number | null,
  sourceUrl: 'https://www.va.gov/disability/compensation-rates/veteran-rates/',
  /** ISO date the table was copied from VA.gov; null until published. */
  fetchedDate: null as string | null,
};
