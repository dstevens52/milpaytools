/**
 * HUD Fair Market Rent (SAFMR) accessor — build-time/server use, mirrors the
 * getMHARatesForYear pattern (returns null when the MHA isn't present).
 *
 * Data source: src/data/bah/fmr/fmr2026.ts (generated from HUD SAFMR data).
 * Each bedroom size carries { p25, median, p75 } across the MHA's covered ZIPs.
 */

import { MHA_FMR_2026, FMR_DATA_YEAR, type MHAFmr, type FmrRange } from '@/data/bah/fmr/fmr2026';

export type Bedrooms = 0 | 1 | 2 | 3 | 4;

export { FMR_DATA_YEAR };
export type { MHAFmr, FmrRange };

/**
 * Full FMR range (p25 / median / p75) for an MHA + bedroom size. Defaults to 2BR
 * — the standard BAH/rent reference. Returns null when the MHA has no FMR entry.
 */
export function getFMRRange(mhaCode: string, bedrooms: Bedrooms = 2): FmrRange | null {
  const entry = MHA_FMR_2026[mhaCode];
  if (!entry) return null;
  return entry[`br${bedrooms}` as 'br0' | 'br1' | 'br2' | 'br3' | 'br4'] ?? null;
}

/**
 * FMR median (the SAFMR ZIP-median) for an MHA + bedroom size. Defaults to 2BR.
 * Returns null when the MHA has no FMR entry.
 */
export function getFMR(mhaCode: string, bedrooms: Bedrooms = 2): number | null {
  const range = getFMRRange(mhaCode, bedrooms);
  return range ? range.median : null;
}

/** The full FMR entry for an MHA (all bedroom sizes + coverage), or null. */
export function getFMRDetail(mhaCode: string): MHAFmr | null {
  return MHA_FMR_2026[mhaCode] ?? null;
}
