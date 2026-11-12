// CONUS COLA — official 2026 location list (eligibility + index only).
//
// Source: DTMO, "CONUS COLA LOCATIONS FOR 2026" (cclocs26.pdf). Source record:
// docs/sources/conus-cola-locations-2026.md — the ONLY allowed source for the
// areas and indexes below. Do not add, infer or "correct" an area or index.
//
// MHA mapping verified against DTMO mhanames26.txt / sorted_zipmha26.txt on 2026-11-12.
//
// No dollar amounts live here on purpose. The monthly CONUS COLA amount depends
// on pay grade, years of service and dependents (DTMO spendable-income tables);
// the site links to DTMO's official rate lookup instead of estimating it.
//
// Client-safe: no ZIP data. ZIP → MHA resolution happens in
// src/lib/calculations/cola.ts (server/tests) or via /api/bah/lookup (client).
//
// Annual update: docs/ANNUAL_DATA_UPDATE.md → "CONUS COLA".

export const DATA_YEAR = '2026';

export interface ColaArea {
  /** DTMO Military Housing Area code (matches src/data/bah/{year}/zipToMha.ts). */
  mhaCode: string;
  /** Area name exactly as printed in the DTMO location list. */
  dtmoName: string;
  /** State, as printed in the DTMO location list. */
  state: string;
  /** Official COLA index, in percent (8 = 8%). */
  index: number;
}

export const COLA_AREAS: readonly ColaArea[] = [
  { mhaCode: 'CA024', dtmoName: 'Camp Pendleton', state: 'California', index: 1 },
  { mhaCode: 'CA037', dtmoName: 'Los Angeles', state: 'California', index: 3 },
  { mhaCode: 'CA027', dtmoName: 'Marin/Sonoma', state: 'California', index: 1 },
  { mhaCode: 'CA018', dtmoName: 'Oakland', state: 'California', index: 6 },
  { mhaCode: 'CA034', dtmoName: 'Sacramento', state: 'California', index: 3 },
  { mhaCode: 'CA038', dtmoName: 'San Diego', state: 'California', index: 1 },
  { mhaCode: 'CA019', dtmoName: 'San Francisco', state: 'California', index: 8 },
  { mhaCode: 'CA044', dtmoName: 'Santa Clara County', state: 'California', index: 5 },
  { mhaCode: 'IL325', dtmoName: 'Chicago', state: 'Illinois', index: 1 },
  { mhaCode: 'MD129', dtmoName: 'Baltimore', state: 'Maryland', index: 1 },
  { mhaCode: 'MA119', dtmoName: 'Nantucket', state: 'Massachusetts', index: 1 },
  { mhaCode: 'NY218', dtmoName: 'Long Island', state: 'New York', index: 2 },
  { mhaCode: 'NY219', dtmoName: 'New York City', state: 'New York', index: 4 },
  { mhaCode: 'NY413', dtmoName: 'Staten Island', state: 'New York', index: 4 },
  { mhaCode: 'NY349', dtmoName: 'Westchester County', state: 'New York', index: 2 },
  { mhaCode: 'VA302', dtmoName: 'Warrenton', state: 'Virginia', index: 1 },
  { mhaCode: 'WA307', dtmoName: 'Everett', state: 'Washington', index: 1 },
  { mhaCode: 'WA309', dtmoName: 'Seattle', state: 'Washington', index: 4 },
];

export const COLA_SOURCE = {
  title: 'CONUS COLA Locations for 2026',
  sourceUrl: 'https://www.travel.dod.mil/Portals/119/Documents/Allowances/COLA/CONUS/Locations/cclocs26.pdf',
  /** ISO date the source PDF was retrieved and verified. */
  retrievedDate: '2026-11-12',
  rateLookupUrl: 'https://www.travel.dod.mil/Allowances/CONUS-Cost-of-Living-Allowance/CONUS-COLA-Rate-Lookup/',
} as const;

const BY_MHA: ReadonlyMap<string, ColaArea> = new Map(COLA_AREAS.map((a) => [a.mhaCode, a]));

/** The 2026 COLA area for an MHA code, or null if the MHA is not on the list. */
export function getColaAreaByMha(mhaCode: string | null | undefined): ColaArea | null {
  if (!mhaCode) return null;
  return BY_MHA.get(mhaCode) ?? null;
}

/** The area with the highest 2026 index (first in list order on a tie). */
export function highestIndexArea(): ColaArea {
  return COLA_AREAS.reduce((best, a) => (a.index > best.index ? a : best));
}

/** "November 12, 2026" from an ISO date, without timezone drift. */
export function formatRetrievedDate(iso: string = COLA_SOURCE.retrievedDate): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
