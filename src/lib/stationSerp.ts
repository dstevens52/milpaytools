/**
 * Search-result title and meta description for CONUS station pages
 * (/bah/[slug]), for both arms of the Build 03 test (src/data/bah/serpTest.ts).
 *
 * - Variant A is today's output, moved here unchanged from
 *   src/app/bah/[slug]/page.tsx. tests/e2e/station-serp*.spec.ts hold it
 *   byte-identical to a snapshot of main (tests/e2e/fixtures/station-serp-main-snapshot.json).
 * - Variant B: an absolute title (no " | MilPayTools") and a description that
 *   gives the station's rate range instead of the E-5 answer.
 *
 * Server/build only: it reads the BAH dataset through src/lib/calculations/bah.
 */
import type { DutyStation } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, CURRENT_BAH_YEAR, PRIOR_BAH_YEAR } from '@/lib/calculations/bah';
import { formatCurrency } from '@/lib/utils';
import { ENLISTED_GRADES, WARRANT_GRADES, PRIOR_ENLISTED_OFFICER_GRADES } from '@/types/military';
import { stationSerpArm, SERP_TEST_MODE, type SerpTestMode } from '@/data/bah/serpTest';

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;
const SITE_SUFFIX = ' | MilPayTools';

/**
 * The grades in the station page's full rate table, in its order
 * (CollapsibleRateTable: enlisted, warrant, prior-enlisted officer, O-1–O-7).
 * The station SERP spec checks {min}/{max} against the rendered table, so a
 * change there fails a test instead of drifting.
 */
const RATE_TABLE_GRADES: readonly string[] = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  ...PRIOR_ENLISTED_OFFICER_GRADES,
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7',
];

export interface StationSerpMeta {
  arm: 'A' | 'B';
  /** Page title. A: the root layout appends " | MilPayTools". B: used as-is (`absolute`). */
  title: string;
  absolute: boolean;
  /** og:title / twitter:title (social tags skip the layout template), always with the site name. */
  socialTitle: string;
  /** Title on the OG image card (no site suffix; the card's brand row carries it). */
  cardTitle: string;
  description: string;
}

/** Former name without its date range: "Fort Liberty (2023–2025)" → "Fort Liberty". */
function formerShort(station: DutyStation): string | null {
  return station.formerName ? station.formerName.split(' (')[0] : null;
}

/** True when the city adds information beyond the base name ("Fort Hood" + Killeen). */
function cityDistinct(station: DutyStation): boolean {
  return !station.name.toLowerCase().includes(station.city.toLowerCase());
}

// Append the richest trailing clause that keeps the meta description within
// `max` characters. Clauses are whole sentences, tried longest-first, so the
// tail drops cleanly on the longest base names instead of truncating mid-word.
function fitDescription(head: string, tails: string[], max = DESCRIPTION_MAX): string {
  return head + (tails.find((t) => head.length + t.length <= max) ?? '');
}

// ── Variant A (today's output, unchanged) ─────────────────────────────────────

/** Title without the site name (the root layout's template appends " | MilPayTools"). */
export function stationTitleA(station: DutyStation): string {
  const former = formerShort(station);
  // Former name wins the parenthetical; locality is appended only when there's
  // no former name and "{name} BAH Rates {year} — City, ST" fits ~60 chars.
  const core = former
    ? `${station.name} (${former}) BAH Rates ${CURRENT_BAH_YEAR}`
    : `${station.name} BAH Rates ${CURRENT_BAH_YEAR}`;
  const withLocality = `${core} — ${station.city}, ${station.state}`;
  return !former && cityDistinct(station) && withLocality.length <= 60 ? withLocality : core;
}

/** Leads with the actual E-5 figures; trailing clauses drop whole-sentence on long names. */
export function stationDescriptionA(station: DutyStation): string {
  // E-5 reference rates, read from the same dataset the on-page rate table uses
  // so the snippet figures always match the table.
  const mhaCode = getMHACode(station.zip);
  const e5W = mhaCode ? getMHARates(mhaCode, true)?.['E-5'] : undefined;
  const e5WO = mhaCode ? getMHARates(mhaCode, false)?.['E-5'] : undefined;
  // Locality comes from station.city — the MHA name often just repeats the base
  // name (e.g. "Fort Hood, TX"), so it can't capture city queries like
  // "bah killeen tx". Shown only when the city adds info beyond the base name.
  const locality = cityDistinct(station) ? ` (${station.city})` : '';
  if (e5W !== undefined && e5WO !== undefined) {
    const head = `${CURRENT_BAH_YEAR} BAH for ${station.name}, ${station.state}${locality}: E-5 with dependents ${formatCurrency(e5W)}/mo, without ${formatCurrency(e5WO)}/mo.`;
    return fitDescription(head, [
      ' All ranks and dependency statuses. Official DTMO data, no account.',
      ' All ranks and dependency statuses.',
    ]);
  }
  return `${CURRENT_BAH_YEAR} BAH rates for ${station.name}, ${station.stateName}${locality}. Monthly BAH for every pay grade, with and without dependents. Official DTMO data, no account.`;
}

// ── Variant B ─────────────────────────────────────────────────────────────────

/** Lowest and highest monthly rate across the rate table (both columns), and its grade count. */
export function stationRateRange(station: DutyStation): { min: number; max: number; count: number } | null {
  const mhaCode = getMHACode(station.zip);
  if (!mhaCode) return null;
  const w = getMHARates(mhaCode, true) ?? {};
  const wo = getMHARates(mhaCode, false) ?? {};
  const values: number[] = [];
  let count = 0;
  for (const g of RATE_TABLE_GRADES) {
    const a = w[g as keyof typeof w];
    const b = wo[g as keyof typeof wo];
    if (a === undefined && b === undefined) continue;
    count++;
    if (a !== undefined) values.push(a);
    if (b !== undefined) values.push(b);
  }
  return values.length ? { min: Math.min(...values), max: Math.max(...values), count } : null;
}

/** First template that fits 60 characters. `{n}` = searchName ?? name. */
export function stationTitleB(station: DutyStation): string {
  const n = station.searchName ?? station.name;
  const y = CURRENT_BAH_YEAR;
  const steps = [
    `${n} BAH ${y}: E-1 to O-7, With & Without Dependents`,
    `${n} BAH ${y}: All Ranks, With & Without Dependents`,
    `${n} BAH ${y} by Rank, With/Without Dependents`,
    `${n} BAH ${y}: Every Rank + Dependents`,
    `${n} BAH Rates ${y} by Rank`,
    `${n} BAH Rates ${y}`,
  ];
  return steps.find((t) => t.length <= TITLE_MAX) ?? steps[steps.length - 1];
}

/**
 * `{year} BAH at {name}, {ST}{ (city)}: {min}–{max}/mo across {count} pay grades.
 * Pick your rank to see your rate, the change from {priorYear} and local rent.`
 *
 * Over 160: drop "and local rent", then drop " (city)". A former name, where
 * the page shows one, is added after {name} only if it still fits.
 */
export function stationDescriptionB(station: DutyStation): string {
  const range = stationRateRange(station);
  if (!range) return stationDescriptionA(station);
  const city = cityDistinct(station) ? ` (${station.city})` : '';
  const rates = `${formatCurrency(range.min)}–${formatCurrency(range.max)}/mo across ${range.count} pay grades.`;
  const tailFull = ` Pick your rank to see your rate, the change from ${PRIOR_BAH_YEAR} and local rent.`;
  const tailShort = ` Pick your rank to see your rate and the change from ${PRIOR_BAH_YEAR}.`;
  const build = (former: string, loc: string, tail: string) =>
    `${CURRENT_BAH_YEAR} BAH at ${station.name}${former}, ${station.state}${loc}: ${rates}${tail}`;

  const fallbacks: [string, string][] = [
    [city, tailFull],
    [city, tailShort],
    ['', tailShort],
  ];
  const [loc, tail] = fallbacks.find(([l, t]) => build('', l, t).length <= DESCRIPTION_MAX) ?? fallbacks[fallbacks.length - 1];
  const former = formerShort(station);
  if (former) {
    const withFormer = build(` (formerly ${former})`, loc, tail);
    if (withFormer.length <= DESCRIPTION_MAX) return withFormer;
  }
  return build('', loc, tail);
}

// ── Both arms ─────────────────────────────────────────────────────────────────

export function stationSerpMeta(station: DutyStation, mode: SerpTestMode = SERP_TEST_MODE): StationSerpMeta {
  const arm = stationSerpArm(station.slug, mode);
  if (arm === 'A') {
    const title = stationTitleA(station);
    return { arm, title, absolute: false, socialTitle: `${title}${SITE_SUFFIX}`, cardTitle: title, description: stationDescriptionA(station) };
  }
  const title = stationTitleB(station);
  return { arm, title, absolute: true, socialTitle: `${title}${SITE_SUFFIX}`, cardTitle: title, description: stationDescriptionB(station) };
}
