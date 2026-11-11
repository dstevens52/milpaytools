/**
 * Overseas detection for the calculators' station input (BaseSearchInput).
 *
 * Runs only after the normal CONUS search has come up empty, so it can never
 * replace a stateside result. Station-specific matches come from the slim
 * search index generated from the v2 OCONUS registry at build time
 * (src/data/oconus/searchIndex.generated.ts — name, shortName, slug,
 * searchAliases), so a new v2 station is picked up without touching this file
 * and the full station data never ships to the browser.
 */

import { OCONUS_SEARCH_INDEX } from '@/data/oconus/searchIndex.generated';
import type { OconusSearchEntry } from '@/data/oconus/buildSearchIndex';
import type { OverseasMatch } from '@/data/oconus/stationSearchCopy';
import { searchStations, normalize } from './stationSearch';
import { isMilitaryMailZip } from './militaryMailZip';

function toStationMatch(s: OconusSearchEntry): OverseasMatch {
  return { kind: 'station', name: s.name, shortName: s.shortName, slug: s.slug };
}

// Search terms per published v2 station, normalized the same way as queries.
const TERMS: Array<{ station: OconusSearchEntry; terms: string[] }> = OCONUS_SEARCH_INDEX.map((s) => ({
  station: s,
  terms: [s.name, s.shortName, ...s.searchAliases].map(normalize).filter(Boolean),
}));

function matchGuide(q: string): OconusSearchEntry | undefined {
  const padded = ` ${q} `;
  for (const { station, terms } of TERMS) {
    for (const t of terms) {
      // exact · typing a prefix of a term · a term inside a longer query ("ramstein germany")
      if (q === t || (q.length >= 3 && t.startsWith(q)) || padded.includes(` ${t} `)) return station;
    }
  }
  return undefined;
}

const MAIL_WORD = /\b(apo|fpo|dpo)\b/i;

/**
 * Overseas match for free text that produced no CONUS suggestions, or null.
 * Order: v2 guide (name / alias) → any overseas installation in the search data
 * (one that maps to a v2 guide wins) → the words APO / FPO / DPO.
 */
export function detectOverseasText(text: string): OverseasMatch | null {
  const q = normalize(text);
  if (q.length < 2) return null;

  const guide = matchGuide(q);
  if (guide) return toStationMatch(guide);

  // The CONUS-only search already returned nothing, so anything this finds is overseas.
  const overseas = searchStations(text, false).filter((r) => r.oconus);
  if (overseas.length) {
    for (const r of overseas) {
      // e.g. "Camp Humphreys (K-6)" or "RAF Mildenhall" → their v2 guide
      const g = matchGuide(normalize(r.name));
      if (g) return toStationMatch(g);
    }
    return { kind: 'installation', name: overseas[0].name };
  }

  if (MAIL_WORD.test(text)) return { kind: 'mail-text' };
  return null;
}

/** Overseas match for a complete 5-digit ZIP, or null. */
export function detectOverseasZip(zip: string): OverseasMatch | null {
  return zip.length === 5 && isMilitaryMailZip(zip) ? { kind: 'mail-zip' } : null;
}
