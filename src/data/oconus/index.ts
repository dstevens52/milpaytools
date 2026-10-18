import type { OconusStation } from './types';
import { ramstein } from './ramstein';
import { rafLakenheath } from './raf-lakenheath';

export type { OconusStation, SourcedFact, SharedLink } from './types';

// v2 OCONUS station registry. /bah/[slug] checks this first; a slug with a
// rendered v2 entry gets OconusStationPage, everything else falls through to
// the existing CONUS / legacy-OCONUS template. A v2 slug with no duty-station
// entry (raf-lakenheath) exists only while it renders.
export const OCONUS_V2_STATIONS: OconusStation[] = [ramstein, rafLakenheath];

export const OCONUS_V2_BY_SLUG: Record<string, OconusStation> = Object.fromEntries(
  OCONUS_V2_STATIONS.map((s) => [s.slug, s]),
);

/** Published v2 station for an installation search name (PCS estimator guide link). */
export function publishedOconusV2ForName(name: string): OconusStation | undefined {
  return OCONUS_V2_STATIONS.find((s) => s.published && (s.name === name || (s.searchNames ?? []).includes(name)));
}

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

// Limit on the full rendered <title> (with the layout's " | MilPayTools").
// Search engines truncate by pixel width, so this is a guide, not a hard cut.
export const OCONUS_RENDERED_TITLE_MAX = 65;
export const OCONUS_DESC_MAX = 155;
export const SITE_TITLE_SUFFIX = ' | MilPayTools';

/** Page title, without the site name (the root layout template appends it). */
export function oconusTitle(s: OconusStation): string {
  return s.titleOverride ?? `${s.shortName} BAH? It's OHA — Housing & COLA Guide`;
}

/** The <title> as rendered, after the root layout's template. */
export function oconusRenderedTitle(s: OconusStation): string {
  return oconusTitle(s) + SITE_TITLE_SUFFIX;
}

/**
 * Meta description. Keeps the country (it carries searches like "Germany
 * OHA"). Long names step down — short name + country, then short name alone —
 * and finally drop the closing sentence. First fit wins.
 */
export function oconusDescription(s: OconusStation): string {
  const mid = ': eligible members renting privately generally get OHA, not BAH.';
  const tail = ' How OHA and COLA work, with official DTMO lookups.';
  const country = s.hostCountry.value;
  const heads = [`${s.name}, ${country}`, `${s.shortName}, ${country}`, s.shortName];
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
