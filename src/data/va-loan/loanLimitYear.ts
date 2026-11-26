/**
 * Which FHFA loan limit year the VA entitlement calculator shows (build V2).
 *
 * FHFA's limits apply to loans in that calendar year: 2026 limits through
 * Dec 31, 2026, 2027 limits from Jan 1, 2027 (docs/sources/va-entitlement-loan-limits-2027.md).
 *
 * LOAN_LIMIT_YEAR stays 2026 until Jan. 1, 2027, when the January rollover flips it
 * to 2027 (FIX_QUEUE dated item, next to TRICARE_COST_YEAR). While the next year's
 * file is loaded and the flip hasn't happened, the calculator shows both years:
 * "Closing in 2026" and "Closing in 2027 (from Jan. 1)". After the flip, 2027 only.
 *
 * Client-safe: imports only the small summary files. The county lists (~3,200 rows
 * per year) load on demand through loadLoanLimits().
 */

import type { CountyLoanLimitRow, LoanLimitSummary } from './types';
import { LOAN_LIMIT_SUMMARY_2026 } from './loanLimitsSummary2026';
import { LOAN_LIMIT_SUMMARY_2027 } from './loanLimitsSummary2027';

export const LOAN_LIMIT_YEAR = 2026;

export const LOAN_LIMIT_SUMMARIES: Readonly<Record<number, LoanLimitSummary>> = {
  2026: LOAN_LIMIT_SUMMARY_2026,
  2027: LOAN_LIMIT_SUMMARY_2027,
};

/**
 * The years to show: the current year, plus the next one while its file is loaded
 * (before the Jan. 1 flip). After the flip, only the current year.
 */
export function loanLimitYearsShown(
  current: number = LOAN_LIMIT_YEAR,
  summaries: Readonly<Record<number, LoanLimitSummary>> = LOAN_LIMIT_SUMMARIES,
): number[] {
  if (!summaries[current]) throw new Error(`no FHFA loan limit file for ${current}`);
  return summaries[current + 1] ? [current, current + 1] : [current];
}

/** Column label: "Closing in 2026", or "Closing in 2027 (from Jan. 1)" for the next year. */
export function loanLimitYearLabel(year: number, current: number = LOAN_LIMIT_YEAR): string {
  return year > current ? `Closing in ${year} (from Jan. 1)` : `Closing in ${year}`;
}

/** The county list for a year, loaded on demand (its own chunk, so the page stays light). */
export async function loadLoanLimits(year: number): Promise<readonly CountyLoanLimitRow[]> {
  switch (year) {
    case 2026:
      return (await import('./loanLimits2026')).LOAN_LIMITS_2026;
    case 2027:
      return (await import('./loanLimits2027')).LOAN_LIMITS_2027;
    default:
      throw new Error(`no FHFA loan limit file for ${year}`);
  }
}
