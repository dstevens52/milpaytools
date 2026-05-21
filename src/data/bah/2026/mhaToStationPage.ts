/**
 * MHA code → /bah/ station page mapping.
 * Derived at module load from DUTY_STATIONS + zipToMha — never hardcoded.
 * Supports multiple stations per MHA (e.g., Eglin + Hurlburt share a Florida MHA).
 */

import { zipToMha } from '@/data/bah/2026/zipToMha';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';

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
