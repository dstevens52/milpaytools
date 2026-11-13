/**
 * MHA code → /bah/ station page mapping.
 * Derived at module load from DUTY_STATIONS + the current BAH year's zipToMha —
 * never hardcoded. Server only (it reads the full ZIP map).
 * Supports multiple stations per MHA (e.g., Eglin + Hurlburt share a Florida MHA).
 */

import { currentZipToMha } from '@/lib/calculations/bah';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';

const zipToMha = currentZipToMha();

export interface StationPageInfo {
  slug: string;
  name: string;
}

export const MHA_TO_STATION_PAGES: Record<string, StationPageInfo[]> = (() => {
  const map: Record<string, StationPageInfo[]> = {};
  for (const station of DUTY_STATIONS) {
    if (station.oconus) continue;
    const mha = zipToMha[station.zip];
    if (!mha) continue;
    if (!map[mha]) map[mha] = [];
    map[mha].push({ slug: station.slug, name: station.name });
  }
  return map;
})();

/** Returns all /bah/ station pages for a ZIP code's MHA, or [] if none exist. */
export function getStationPagesForZip(zip: string): StationPageInfo[] {
  if (!zip || zip.length !== 5) return [];
  const mha = zipToMha[zip];
  if (!mha) return [];
  return MHA_TO_STATION_PAGES[mha] ?? [];
}
