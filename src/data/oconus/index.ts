import type { OconusStation } from './types';
import { ramstein } from './ramstein';

export type { OconusStation, SourcedFact, SharedLink } from './types';

// v2 OCONUS station registry. /bah/[slug] checks this first; a slug with a
// rendered v2 entry gets OconusStationPage, everything else falls through to
// the existing CONUS / legacy-OCONUS template.
export const OCONUS_V2_STATIONS: OconusStation[] = [ramstein];

export const OCONUS_V2_BY_SLUG: Record<string, OconusStation> = Object.fromEntries(
  OCONUS_V2_STATIONS.map((s) => [s.slug, s]),
);

/**
 * Unpublished v2 stations render only when OCONUS_V2_PREVIEW=1 is set (the
 * local Playwright dev server sets it), and never on a Vercel production
 * deploy. Otherwise an unpublished station falls through to its legacy page.
 */
export function oconusV2PreviewEnabled(): boolean {
  return process.env.OCONUS_V2_PREVIEW === '1' && process.env.VERCEL_ENV !== 'production';
}

/** The v2 entry to render for a slug, or null to fall through to legacy. */
export function getRenderableOconusV2(slug: string): OconusStation | null {
  const s = OCONUS_V2_BY_SLUG[slug];
  if (!s || s.templateVersion !== 2) return null;
  return s.published || oconusV2PreviewEnabled() ? s : null;
}

// ── Metadata (Section 2). Pure so the length unit tests cover every station. ──

export const OCONUS_TITLE_MAX = 60;
export const OCONUS_DESC_MAX = 155;

/** Page title, without the site name (the root layout template appends it). */
export function oconusTitle(s: OconusStation): string {
  return `${s.shortName} BAH? It's OHA — Housing & COLA Guide`;
}

/**
 * Meta description. The spec pattern runs past 155 chars for most stations,
 * so it steps down — full name + country, short name + country, short name
 * alone — and finally drops the closing sentence. First fit wins.
 */
export function oconusDescription(s: OconusStation): string {
  const mid = ' Eligible members renting privately generally receive OHA instead of BAH.';
  const tail = ' How OHA and COLA work, with official lookups.';
  const country = s.hostCountry.value;
  const heads = [
    `${s.name}, ${country} is an overseas station.`,
    `${s.shortName}, ${country} is an overseas station.`,
    `${s.shortName} is an overseas station.`,
  ];
  for (const h of heads) {
    const d = h + mid + tail;
    if (d.length <= OCONUS_DESC_MAX) return d;
  }
  return heads[heads.length - 1] + mid;
}

export function oconusH1(s: OconusStation): string {
  return `${s.name} OHA, COLA & PCS Housing Guide`;
}

export const OCONUS_OG_SUB = 'Overseas housing allowance & COLA guide';
