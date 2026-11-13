/**
 * BAH year-transition copy (DoD release → January 1). Pure functions, no data
 * imports — client-safe. Every function takes the year config as an argument so
 * the transition can be unit-tested with fixtures while src/data/bah/current.ts
 * still says 2026 (tests/e2e/bah-release-day.spec.ts).
 *
 * Modes, from current.ts:
 *  - 'next-year-status': BAH_YEAR is before the year src/data/bah/2027-status.ts
 *    tracks → show the dated "2027 BAH rates" notice + its FAQ (pending, or
 *    'released' for the short gap between DoD posting and our import landing).
 *  - 'transition': BAH_EFFECTIVE_NOTICE is on → the new rates are the headline,
 *    with one line saying the prior year's rate applies until January 1.
 *  - 'none': after January 1 (BAH_EFFECTIVE_NOTICE back to false).
 */

import { BAH_YEAR, BAH_PRIOR_YEAR, BAH_EFFECTIVE_NOTICE } from '@/data/bah/current';

/** The rates year src/data/bah/2027-status.ts tracks. */
export const BAH_STATUS_NOTICE_YEAR = '2027';

export interface BahYearConfig {
  year: string;
  priorYear: string;
  effectiveNotice: boolean;
}

export const CURRENT_BAH_CONFIG: BahYearConfig = {
  year: BAH_YEAR,
  priorYear: BAH_PRIOR_YEAR,
  effectiveNotice: BAH_EFFECTIVE_NOTICE,
};

export type BahNoticeMode = 'next-year-status' | 'transition' | 'none';

export function bahNoticeMode(cfg: BahYearConfig = CURRENT_BAH_CONFIG): BahNoticeMode {
  if (cfg.effectiveNotice) return 'transition';
  if (Number(cfg.year) < Number(BAH_STATUS_NOTICE_YEAR)) return 'next-year-status';
  return 'none';
}

function dollars(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * The one transition line near a rate table. Station pages pass the prior-year
 * E-5 with-dependents rate; the /bah hub (no single location) passes null.
 */
export function bahTransitionText(cfg: BahYearConfig, priorE5WithDeps: number | null): string {
  const head = `${cfg.year} rates take effect January 1, ${cfg.year}.`;
  return priorE5WithDeps === null
    ? `${head} Until then, ${cfg.priorYear} rates apply.`
    : `${head} Until then, the ${cfg.priorYear} rate applies: ${dollars(priorE5WithDeps)} for an E-5 with dependents.`;
}

/** ZIP-calculator sub-line under a result during the transition. */
export function bahPriorRateSubline(priorYear: string, rate: number): string {
  return `${priorYear} rate (through Dec 31, ${priorYear}): ${dollars(rate)}`;
}
