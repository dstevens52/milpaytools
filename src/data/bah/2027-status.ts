/**
 * 2027 BAH release status — drives the dated "2027 BAH rates" notice on /bah
 * and every CONUS /bah/[slug] page (not OCONUS: overseas uses OHA), the /bah
 * "#2027" section and its FAQs.
 *
 * Facts verified Nov 13, 2026:
 *   - 2027 BAH rates are not yet published; DoD has not announced a date.
 *   - Past releases (dates and DoD's national average increases) come from
 *     src/data/bah/releaseHistory.ts (docs/sources/bah-release-history.md).
 *     This file keeps no copy of its own.
 *
 * Lifecycle: 'pending' → 'released' (DoD published, data being loaded) →
 * once 2027 rates are loaded (BAH_YEAR = '2027' in src/data/bah/current.ts) the
 * notice and its station FAQ disappear automatically: pages show them only in the
 * 'next-year-status' mode (src/lib/calculations/bahTransition.ts). 'released'
 * covers just the gap between DoD posting and our import landing. The /bah
 * "#2027" section stays, saying "2027 BAH rates are out".
 * Release-day steps: docs/RELEASE_DAY_BAH_2027.md.
 * The "last checked" date is shared: src/data/watch.ts.
 */

import { DATA_LAST_CHECKED } from '@/data/watch';
import { BAH_YEAR } from '@/data/bah/current';
import { BAH_RELEASE_HISTORY, type BahRelease } from '@/data/bah/releaseHistory';
import {
  RATE_PROTECTION_PROMOTION,
  RATE_PROTECTION_RULE,
  TEMPORARY_INCREASE_EXCEPTION,
} from '@/data/bah/rateProtection';
import { formatIsoDate } from '@/lib/calculations/payRaise';
import { PAY_RAISE_2027 } from '@/data/pay-raise/2027';

/** The rates year this file tracks. */
const Y = 2027;

export type Bah2027Status = 'pending' | 'released';

export interface Bah2027StatusConfig {
  status: Bah2027Status;
  /** ISO date DoD published 2027 rates, or null while pending. */
  releasedDate: string | null;
  /** DoD's national average increase for 2027 (percent), from its release; null while pending or not stated. */
  avgIncreasePct: number | null;
  /** URL of DoD's 2027 release (the source of releasedDate / avgIncreasePct); null while pending. */
  releaseSourceUrl: string | null;
  /** Most recent first: the last three releases before 2027, from releaseHistory.ts. */
  pastReleases: { ratesYear: number; releasedDate: string }[];
  /** The official DTMO BAH lookup (linked from the released-mode notice). */
  sourceUrl: string;
  lastChecked: string;
}

export const BAH_2027_STATUS: Bah2027StatusConfig = {
  status: 'pending',
  releasedDate: null,
  avgIncreasePct: null,
  releaseSourceUrl: null,
  pastReleases: BAH_RELEASE_HISTORY.filter((r) => r.ratesYear < Y)
    .slice(0, 3)
    .map(({ ratesYear, releasedDate }) => ({ ratesYear, releasedDate })),
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

/** "the 2026 rates came out December 11, 2025; the 2025 rates, December 13, 2024; and the 2024 rates, December 14, 2023" */
function releaseHistoryProse(config: Bah2027StatusConfig): string {
  const parts = config.pastReleases.map((r, i) =>
    i === 0
      ? `the ${r.ratesYear} rates came out ${formatIsoDate(r.releasedDate)}`
      : `the ${r.ratesYear} rates, ${formatIsoDate(r.releasedDate)}`,
  );
  return parts.length > 1 ? `${parts.slice(0, -1).join('; ')}; and ${parts[parts.length - 1]}` : parts[0];
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
  return `As of ${formatIsoDate(config.lastChecked)}, DoD has not published 2027 BAH rates or announced a release date. DoD usually releases next year's rates in mid-December: ${releaseHistoryProse(config)}. Each took effect January 1. 2027 rates for ${stationName} take effect January 1, 2027; the 2026 rates shown on this page are in effect through December 31, 2026.`;
}

/** Status-aware cross-link to /pay/raise shown under the notice. */
export function bahPayRaiseCrossLinkText(): string {
  return PAY_RAISE_2027.status === 'pending'
    ? 'Also changing January 1: the 2027 base pay raise →'
    : 'Also changing January 1: your official 2027 base pay →';
}

// ─── /bah "#2027" section + FAQs ─────────────────────────────────────────────
//
// Three modes, from the release status and the year switch:
//   pending  — not published (status 'pending', BAH_YEAR before 2027)
//   released — DoD published, our import not live yet (status 'released')
//   loaded   — BAH_YEAR is 2027 or later: the site shows 2027 rates
// Facts for released/loaded come from the 2027 row of releaseHistory.ts once it
// exists (release day adds it), else from BAH_2027_STATUS. No estimates ever.

export type Bah2027HubMode = 'pending' | 'released' | 'loaded';

export function bah2027HubMode(config: Bah2027StatusConfig = BAH_2027_STATUS, bahYear: string = BAH_YEAR): Bah2027HubMode {
  if (Number(bahYear) >= Y) return 'loaded';
  return config.status === 'released' ? 'released' : 'pending';
}

export interface Bah2027Facts {
  releasedDate: string | null;
  avgIncreasePct: number | null;
  sourceUrl: string | null;
}

export function bah2027Facts(
  config: Bah2027StatusConfig = BAH_2027_STATUS,
  history: readonly BahRelease[] = BAH_RELEASE_HISTORY,
): Bah2027Facts {
  const row = history.find((r) => r.ratesYear === Y);
  if (row) return { releasedDate: row.releasedDate, avgIncreasePct: row.avgIncreasePct, sourceUrl: row.sourceUrl };
  return { releasedDate: config.releasedDate, avgIncreasePct: config.avgIncreasePct, sourceUrl: config.releaseSourceUrl };
}

export const BAH_2027_HUB_ANCHOR = '2027';

export function bah2027HubHeading(mode: Bah2027HubMode): string {
  return mode === 'pending'
    ? '2027 BAH rates: release date, increase history and rate protection'
    : '2027 BAH rates are out';
}

const SWITCH_SENTENCE = "Pages on this site switch to 2027 rates as soon as we've loaded and checked DoD's published rates.";

/** "DoD published 2027 BAH rates on December 12, 2026, effective January 1, 2027. DoD reported a national average increase of 4.5%." */
function publishedSentences(facts: Bah2027Facts): string {
  const when = facts.releasedDate
    ? `DoD published 2027 BAH rates on ${formatIsoDate(facts.releasedDate)}, effective January 1, 2027.`
    : 'DoD has published 2027 BAH rates, effective January 1, 2027.';
  const pct = facts.avgIncreasePct !== null ? ` DoD reported a national average increase of ${facts.avgIncreasePct}%.` : '';
  return when + pct;
}

/** The status paragraph at the top of the section. Plain text. */
export function bah2027HubStatusText(
  mode: Bah2027HubMode,
  config: Bah2027StatusConfig = BAH_2027_STATUS,
  facts: Bah2027Facts = bah2027Facts(config),
): string {
  if (mode === 'pending') {
    return `Not yet published as of ${formatIsoDate(config.lastChecked)}. DoD usually releases next year's BAH rates in mid-December; 2027 rates take effect January 1, 2027. ${SWITCH_SENTENCE}`;
  }
  return mode === 'released' ? `${publishedSentences(facts)} ${SWITCH_SENTENCE}` : publishedSentences(facts);
}

/** "4.2% for 2026, 5.4% for 2025 and 5.4% for 2024" — history only, never a forecast. */
function pastIncreasesProse(history: readonly BahRelease[]): string {
  const rows = history.filter((r) => r.ratesYear < Y).slice(0, 3).map((r) => `${r.avgIncreasePct}% for ${r.ratesYear}`);
  return rows.length > 1 ? `${rows.slice(0, -1).join(', ')} and ${rows[rows.length - 1]}` : rows[0];
}

const AVERAGE_CAVEAT =
  'Those are averages across all areas, pay grades and dependency statuses: your area and grade can differ from the average, and rates in some areas fall.';

/** The four /bah FAQs (plain text; [text](/path) links render on the page). */
export function bah2027HubFaqs(
  config: Bah2027StatusConfig = BAH_2027_STATUS,
  bahYear: string = BAH_YEAR,
  history: readonly BahRelease[] = BAH_RELEASE_HISTORY,
): { question: string; answer: string }[] {
  const mode = bah2027HubMode(config, bahYear);
  const facts = bah2027Facts(config, history);

  const when =
    mode === 'pending'
      ? `As of ${formatIsoDate(config.lastChecked)}, DoD has not published 2027 BAH rates or announced a release date. DoD usually releases next year's rates in mid-December: ${releaseHistoryProse(config)}. Each took effect January 1. 2027 rates take effect January 1, 2027; until then, the 2026 rates apply.`
      : publishedSentences({ ...facts, avgIncreasePct: null }) + (mode === 'released' ? ` ${SWITCH_SENTENCE}` : '');

  let howMuch: string;
  if (mode === 'pending') {
    howMuch = `DoD hasn't announced it. DoD's national average increases for recent years were ${pastIncreasesProse(history)}. ${AVERAGE_CAVEAT}`;
  } else if (facts.avgIncreasePct === null) {
    howMuch = `${publishedSentences(facts)} For recent years, DoD's national average increases were ${pastIncreasesProse(history)}. ${AVERAGE_CAVEAT}`;
  } else {
    howMuch = `${publishedSentences(facts)} That's an average across all areas, pay grades and dependency statuses: your area and grade can differ from the average, and rates in some areas fall.`;
  }

  return [
    { question: 'When do 2027 BAH rates come out?', answer: when },
    { question: 'How much will BAH go up in 2027?', answer: howMuch },
    {
      question: 'Can my BAH go down?',
      answer: `The published rate for an area can fall from one year to the next. ${RATE_PROTECTION_RULE} ${RATE_PROTECTION_PROMOTION} ${TEMPORARY_INCREASE_EXCEPTION}`,
    },
    {
      question: 'Does the 2027 pay raise change BAH?',
      answer:
        "No. BAH is set separately from basic pay, from housing costs by location, pay grade and dependency status. The 2027 basic pay raise doesn't change it. See [the 2027 pay raise](/pay/raise).",
    },
  ];
}
