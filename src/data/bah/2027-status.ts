/**
 * 2027 BAH release status — drives the dated "2027 BAH rates" notice on /bah
 * and every CONUS /bah/[slug] page (not OCONUS: overseas uses OHA).
 *
 * Facts verified Nov 11, 2026:
 *   - 2027 BAH rates are not yet published; DoD has not announced a date.
 *   - Past releases: 2026 rates Dec 11, 2025; 2025 rates Dec 13, 2024;
 *     2024 rates Dec 15, 2023. Each took effect January 1.
 *
 * Lifecycle: 'pending' → 'released' (DoD published, data being loaded) →
 * once 2027 rates are loaded (BAH_YEAR = '2027' in src/data/bah/current.ts) the
 * notice and its FAQ disappear automatically: pages show them only in the
 * 'next-year-status' mode (src/lib/calculations/bahTransition.ts). 'released'
 * covers just the gap between DoD posting and our import landing.
 * Release-day steps: docs/RELEASE_DAY_BAH_2027.md.
 * The "last checked" date is shared: src/data/watch.ts.
 */

import { DATA_LAST_CHECKED } from '@/data/watch';
import { formatIsoDate } from '@/lib/calculations/payRaise';
import { PAY_RAISE_2027 } from '@/data/pay-raise/2027';

export type Bah2027Status = 'pending' | 'released';

export interface Bah2027StatusConfig {
  status: Bah2027Status;
  /** ISO date DoD published 2027 rates, or null while pending. */
  releasedDate: string | null;
  /** Most recent first. */
  pastReleases: { ratesYear: number; releasedDate: string }[];
  sourceUrl: string;
  lastChecked: string;
}

export const BAH_2027_STATUS: Bah2027StatusConfig = {
  status: 'pending',
  releasedDate: null,
  pastReleases: [
    { ratesYear: 2026, releasedDate: '2025-12-11' },
    { ratesYear: 2025, releasedDate: '2024-12-13' },
    { ratesYear: 2024, releasedDate: '2023-12-15' },
  ],
  sourceUrl: 'https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/',
  lastChecked: DATA_LAST_CHECKED,
};

/** Link text inside the released-mode notice; the component links it to sourceUrl. */
export const BAH_LOOKUP_LINK_TEXT = 'official DoD BAH lookup';

function released(config: Bah2027StatusConfig): string {
  if (!config.releasedDate) {
    throw new Error("bah-2027: status 'released' requires releasedDate");
  }
  return formatIsoDate(config.releasedDate);
}

/** The notice sentence(s). Station pages pass the station name; the /bah hub doesn't. */
export function bah2027NoticeText(stationName?: string, config: Bah2027StatusConfig = BAH_2027_STATUS): string {
  if (config.status === 'released') {
    return `DoD published 2027 BAH rates on ${released(config)}, effective January 1, 2027. We're updating this page; until then, check the ${BAH_LOOKUP_LINK_TEXT}.`;
  }
  const latest = config.pastReleases[0];
  const text = `2027 BAH rates: not yet published as of ${formatIsoDate(config.lastChecked)}. DoD usually releases next year's rates in mid-December (the ${latest.ratesYear} rates came out ${formatIsoDate(latest.releasedDate)}); they take effect January 1, 2027. The rates below are 2026 rates, in effect through December 31, 2026.`;
  return stationName ? `${text} This page will show 2027 rates for ${stationName} once DoD publishes them.` : text;
}

export function bah2027FaqQuestion(stationName: string): string {
  return `When will 2027 BAH rates for ${stationName} be released?`;
}

/** FAQ answer — plain text (it also feeds FAQPage JSON-LD). */
export function bah2027FaqAnswer(stationName: string, config: Bah2027StatusConfig = BAH_2027_STATUS): string {
  if (config.status === 'released') {
    return `DoD published 2027 BAH rates on ${released(config)}, effective January 1, 2027. This page is being updated with the 2027 rates for ${stationName}; until then, the official DoD BAH lookup has them: ${config.sourceUrl}`;
  }
  // "the 2026 rates came out December 11, 2025; the 2025 rates, December 13, 2024; and the 2024 rates, December 15, 2023"
  const parts = config.pastReleases.map((r, i) =>
    i === 0
      ? `the ${r.ratesYear} rates came out ${formatIsoDate(r.releasedDate)}`
      : `the ${r.ratesYear} rates, ${formatIsoDate(r.releasedDate)}`,
  );
  const history =
    parts.length > 1 ? `${parts.slice(0, -1).join('; ')}; and ${parts[parts.length - 1]}` : parts[0];
  return `As of ${formatIsoDate(config.lastChecked)}, DoD has not published 2027 BAH rates or announced a release date. DoD usually releases next year's rates in mid-December: ${history}. Each took effect January 1. 2027 rates for ${stationName} take effect January 1, 2027; the 2026 rates shown on this page are in effect through December 31, 2026.`;
}

/** Status-aware cross-link to /pay/raise shown under the notice. */
export function bahPayRaiseCrossLinkText(): string {
  return PAY_RAISE_2027.status === 'pending'
    ? 'Also changing January 1: the 2027 base pay raise →'
    : 'Also changing January 1: your official 2027 base pay →';
}
