/**
 * BRS government TSP contributions: the one place for the tier math and its timing.
 *
 * Tiers (TSP_CONSTANTS_2026.brsMatchingTiers): 1% of basic pay automatically, plus a
 * dollar-for-dollar match on the first 3% the member contributes and 50¢ per dollar on
 * the next 2%. Most the government contributes: 5% of basic pay.
 *
 * Timing, for members who joined on or after Jan 1, 2018. Service months are counted
 * from the first month of service (month 1).
 *   - The automatic 1% starts after 60 days of service, so from service month 3.
 *     Source: DoD BRS Defined Contribution fact sheet; Army/Navy TSP vesting
 *     checklists (militarypay.defense.gov).
 *   - Matching starts after 2 years of service, so from service month 25.
 *     Source: same as above.
 *   - Automatic and matching contributions end the first pay period after 26 years of
 *     service, so the last month with government money is service month 312.
 *     Source: Coast Guard "Vesting in the TSP" member checklist (militarypay.defense.gov);
 *     TSP booklet "Managing Accounts for Members of the Uniformed Services".
 *     Member contributions continue after 26 years; only government money stops.
 *
 * Callers:
 *   - Month-by-month projections (retirement.ts, tspGrowth.projectTSP) call
 *     brsGovContribution with the member's actual service month.
 *   - Snapshots shown for "a member at N years of service" (total-compensation.ts, the
 *     TSP calculator's match box) call brsContributionAtYOS.
 *   - Guard/Reserve applies its own timing (YOS-based, from inactive-duty pay) and
 *     uses the untimed tiers through tspGrowth.calcBRSMatch, so it is not gated twice.
 *
 * Pure functions — no React, no side effects.
 */

import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';

const { brsMatchingTiers } = TSP_CONSTANTS_2026;

/** First service month with the automatic 1% (after 60 days of service). */
export const BRS_AUTO_FIRST_SERVICE_MONTH = 3;
/** First service month with matching (after completing 2 years of service). */
export const BRS_MATCH_FIRST_SERVICE_MONTH = 25;
/** Last service month with any government contribution (26 years of service). */
export const BRS_GOV_LAST_SERVICE_MONTH = 26 * 12;

export interface BRSContribution {
  auto: number;
  match: number;
  total: number;
}

const NONE: BRSContribution = { auto: 0, match: 0, total: 0 };

/**
 * Tier math only, no timing: the monthly government contribution for a member who is
 * past the two-year point and short of 26 years.
 */
export function brsTierContribution(
  basePayMonthly: number,
  memberMonthlyContrib: number,
): BRSContribution {
  if (basePayMonthly <= 0) return NONE;
  const auto = basePayMonthly * brsMatchingTiers.auto;
  const contribPct = memberMonthlyContrib / basePayMonthly;
  const first = brsMatchingTiers.dollarForDollar;
  const next = brsMatchingTiers.fiftyPercent;

  let match = 0;
  if (contribPct >= first + next) {
    match = basePayMonthly * (first + next * 0.5); // full: 3% + 1% (50¢ × 2%)
  } else if (contribPct >= first) {
    match = basePayMonthly * first + basePayMonthly * (contribPct - first) * 0.5;
  } else if (contribPct > 0) {
    match = basePayMonthly * contribPct; // dollar-for-dollar up to 3%
  }

  const total = Math.min(auto + match, basePayMonthly * brsMatchingTiers.maxGovernment);
  return { auto, match: total - auto, total };
}

/**
 * Monthly government contribution in a given month of service (1-based).
 * Months 1–2: none. Months 3–24: automatic 1% only. Months 25–312: automatic + match.
 * After month 312: none.
 */
export function brsGovContribution(
  basePayMonthly: number,
  memberMonthlyContrib: number,
  serviceMonth: number,
): BRSContribution {
  if (serviceMonth < BRS_AUTO_FIRST_SERVICE_MONTH || serviceMonth > BRS_GOV_LAST_SERVICE_MONTH) {
    return NONE;
  }
  const tiers = brsTierContribution(basePayMonthly, memberMonthlyContrib);
  if (serviceMonth < BRS_MATCH_FIRST_SERVICE_MONTH) {
    return { auto: tiers.auto, match: 0, total: tiers.auto };
  }
  return tiers;
}

export type BRSPhase = 'automatic-only' | 'full' | 'ended';

/**
 * Which contributions a member at `yearsOfService` completed years receives.
 * Under 2 years: automatic 1% only. 2 to under 26: automatic + match. 26+: none.
 * A member in their first year is treated as past the 60-day point, so a snapshot
 * at 0 years shows the automatic 1% that most of that year receives.
 */
export function brsPhaseAtYOS(yearsOfService: number): BRSPhase {
  const serviceMonth = Math.max(
    BRS_AUTO_FIRST_SERVICE_MONTH,
    Math.floor(Math.max(0, yearsOfService)) * 12 + 1,
  );
  if (serviceMonth > BRS_GOV_LAST_SERVICE_MONTH) return 'ended';
  if (serviceMonth < BRS_MATCH_FIRST_SERVICE_MONTH) return 'automatic-only';
  return 'full';
}

/** Monthly government contribution for a snapshot of a member at `yearsOfService`. */
export function brsContributionAtYOS(
  basePayMonthly: number,
  memberMonthlyContrib: number,
  yearsOfService: number,
): BRSContribution {
  const serviceMonth = Math.max(
    BRS_AUTO_FIRST_SERVICE_MONTH,
    Math.floor(Math.max(0, yearsOfService)) * 12 + 1,
  );
  return brsGovContribution(basePayMonthly, memberMonthlyContrib, serviceMonth);
}
