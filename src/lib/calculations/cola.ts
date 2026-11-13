// CONUS COLA eligibility lookup — 2026 official DTMO location list.
//
// Eligibility is keyed by Military Housing Area (MHA): ZIP → MHA (DTMO
// sorted_zipmha26) → is that MHA on the 2026 COLA list? No dollar amounts:
// the monthly amount depends on pay grade, years of service and dependents,
// and users get it from DTMO's official rate lookup (COLA_SOURCE.rateLookupUrl).
//
// SERVER / TESTS ONLY for lookupCola(): it imports the full zipToMha table.
// Client components must NOT import this file: they resolve the MHA via
// /api/bah/lookup (useBahLookup) and import colaForMha from './colaMha'.

import { currentZipToMha, currentMhaNames } from '@/lib/calculations/bah';
import { colaForMha, type ColaLookupResult } from './colaMha';

// ZIP → MHA comes from the current BAH year (src/data/bah/current.ts). The COLA
// list is keyed by MHA code, so a BAH-year flip that renames an MHA needs the
// COLA list checked too (docs/RELEASE_DAY_BAH_2027.md).
const zipToMha = currentZipToMha();
const mhaNames = currentMhaNames();

export { colaForMha };
export type { ColaLookupResult, ColaEligible, ColaNotEligible, ColaNotFound } from './colaMha';

/** Territory MHA (OHA areas) — no BAH, no CONUS COLA. */
const TERRITORY_MHA = 'XX499';

/**
 * Look up 2026 CONUS COLA eligibility for a duty-station ZIP.
 * - eligible:     the ZIP's MHA is on the 2026 list → DTMO name + official index
 * - not-eligible: the ZIP maps to an MHA that isn't on the list
 * - not-found:    malformed ZIP, ZIP not in the DTMO dataset, or a U.S. territory
 */
export function lookupCola(zip: string): ColaLookupResult {
  const z = zip.trim();
  if (!/^\d{5}$/.test(z)) return { status: 'not-found', eligible: false };
  const mhaCode = zipToMha[z];
  if (!mhaCode || mhaCode === TERRITORY_MHA) return { status: 'not-found', eligible: false };
  const mhaName = mhaNames[mhaCode];
  if (!mhaName) return { status: 'not-found', eligible: false };
  return colaForMha(mhaCode, mhaName);
}
