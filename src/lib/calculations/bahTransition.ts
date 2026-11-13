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
 *
 * Also here (pure, year-agnostic): the station email-alert headline and the
 * future-tense E-5 FAQ lead used during the transition.
 */

import { BAH_YEAR, BAH_PRIOR_YEAR, BAH_EFFECTIVE_NOTICE } from '@/data/bah/current';
import { temporaryIncreaseEndingText, type BahMidYearChange } from '@/data/bah/midYear';
import { rateProtectionDecreaseText } from '@/data/bah/rateProtection';

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

/**
 * Station-page email alert headline. Before the new year loads it names the year
 * it's waiting for; after the switch it carries NO year (a year here once read
 * "2028" in the release-day rehearsal).
 */
export function bahAlertHeadline(stationName: string, mode: BahNoticeMode = bahNoticeMode()): string {
  return mode === 'next-year-status'
    ? `Get an email when ${BAH_STATUS_NOTICE_YEAR} BAH for ${stationName} is published`
    : `Get notified when BAH rates change for ${stationName}`;
}

/** Signup source → Beehiiv utm_campaign, one per station ("bah-alert-fort-hood"). */
export function bahAlertSource(slug: string): string {
  return `bah-alert-${slug}`;
}

/**
 * Lead of the station FAQs that state an E-5 rate. During the transition the new
 * year's rate isn't paid yet, so it's future tense:
 *   "Starting January 1, 2027, an E-5 with dependents at Fort Hood will receive"
 * otherwise "For 2026, an E-5 with dependents at Fort Hood receives".
 */
export function bahE5RateLead(cfg: BahYearConfig, stationName: string): string {
  return cfg.effectiveNotice
    ? `Starting January 1, ${cfg.year}, an E-5 with dependents at ${stationName} will receive`
    : `For ${cfg.year}, an E-5 with dependents at ${stationName} receives`;
}

/** The station FAQ answer for "What is the {year} BAH rate for an E-5 with dependents at …?" */
export function bahE5RateFaqAnswer(
  cfg: BahYearConfig,
  stationName: string,
  mhaLabel: string,
  w: Record<string, number>,
  wo: Record<string, number>,
): string {
  const d = (g: string, r: Record<string, number>) => dollars(r[g] ?? 0);
  const future = cfg.effectiveNotice;
  return `${bahE5RateLead(cfg, stationName)} ${d('E-5', w)}/month in BAH (${mhaLabel} MHA). Other grades with dependents${future ? ' will receive' : ''}: E-6 ${d('E-6', w)}/month, E-7 ${d('E-7', w)}/month, O-3 ${d('O-3', w)}/month. E-5 without dependents ${future ? 'will receive' : 'is'} ${d('E-5', wo)}/month. BAH is excluded from federal taxable income.`;
}

export type BahDecreaseNotice = { kind: 'rate-protection' | 'temporary-ending'; text: string };

/**
 * The station-page paragraph where any grade decreased year over year. If the
 * prior year's rates were a temporary increase (`priorMidYear.temporary`, e.g.
 * TX270's 2026 increase), rate protection doesn't apply: say the temporary rates
 * ended instead. Data-driven; no MHA check. Null when nothing decreased.
 */
export function bahDecreaseNotice(
  stationName: string,
  cfg: BahYearConfig,
  hasDecrease: boolean,
  priorMidYear: BahMidYearChange | null,
): BahDecreaseNotice | null {
  if (!hasDecrease) return null;
  const ending = priorMidYear ? temporaryIncreaseEndingText(priorMidYear, cfg.year) : null;
  return ending
    ? { kind: 'temporary-ending', text: ending }
    : { kind: 'rate-protection', text: rateProtectionDecreaseText(stationName, cfg.year, cfg.priorYear) };
}

/** ZIP-calculator sub-line under a result during the transition. */
export function bahPriorRateSubline(priorYear: string, rate: number): string {
  return `${priorYear} rate (through Dec 31, ${priorYear}): ${dollars(rate)}`;
}
