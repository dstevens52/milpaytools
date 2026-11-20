/**
 * HUD Fair Market Rent (SAFMR) accessor — build-time/server use, mirrors the
 * getMHARatesForYear pattern (returns null when the MHA isn't present).
 *
 * Data: src/data/bah/fmr/fmr{year}.ts, generated from HUD SAFMR files by
 * scripts/build-fmr-data.py. Each bedroom size carries { p25, median, p75 }
 * across the MHA's covered ZIPs.
 *
 * THE PAIRING RULE (H1, FIX_QUEUE row 11e) lives here and only here: rent shown
 * next to a BAH figure is the HUD fiscal year that pairs with that BAH year
 * (fmrYearForBahYear). Readers pass the BAH year they are showing; no reader
 * picks an FMR year on its own. Pages switch to FY2027 rents when 2027 BAH loads
 * (BAH_YEAR in src/data/bah/current.ts), not before.
 */

import { MHA_FMR_2026, FMR_DATA_YEAR as FMR_2026_YEAR, type MHAFmr, type FmrRange } from '@/data/bah/fmr/fmr2026';
import { MHA_FMR_2027, FMR_DATA_YEAR as FMR_2027_YEAR } from '@/data/bah/fmr/fmr2027';

export type Bedrooms = 0 | 1 | 2 | 3 | 4;

export type { MHAFmr, FmrRange };

/**
 * Every loaded HUD SAFMR year, keyed by HUD fiscal year. `year` is the
 * generated file's own FMR_DATA_YEAR, so labels carry the year from the data
 * (a test checks it equals the key).
 */
export const FMR_BY_YEAR = {
  '2026': { year: FMR_2026_YEAR, data: MHA_FMR_2026 },
  '2027': { year: FMR_2027_YEAR, data: MHA_FMR_2027 },
} satisfies Record<string, { year: string; data: Record<string, MHAFmr> }>;

export type FmrYear = keyof typeof FMR_BY_YEAR;

function isFmrYear(y: string): y is FmrYear {
  return Object.prototype.hasOwnProperty.call(FMR_BY_YEAR, y);
}

/**
 * The HUD fiscal year whose rents go with a BAH year: BAH for calendar year N
 * pairs with HUD FY N (Oct. 1 of N−1 to Sept. 30 of N), the HUD file current
 * when DoD publishes year N's BAH in December. 2026 → FY2026, 2027 → FY2027.
 * Returns null when that FMR year isn't loaded: never another year as a fallback.
 */
export function fmrYearForBahYear(bahYear: string): FmrYear | null {
  return isFmrYear(bahYear) ? bahYear : null;
}

/** An MHA's FMR range for the BAH year shown, with the HUD fiscal year it comes from. */
export interface PairedFmr {
  /** HUD fiscal year of the data, e.g. '2026' (label: "FY2026"). */
  fmrYear: string;
  range: FmrRange;
}

/**
 * Full FMR range (p25 / median / p75) for an MHA + bedroom size, from the FMR
 * year that pairs with `bahYear`. Defaults to 2BR, the standard BAH/rent
 * reference. Returns null when no FMR year pairs with `bahYear` or the MHA has
 * no entry.
 */
export function getPairedFMR(mhaCode: string, bahYear: string, bedrooms: Bedrooms = 2): PairedFmr | null {
  const fy = fmrYearForBahYear(bahYear);
  if (!fy) return null;
  const entry = FMR_BY_YEAR[fy].data[mhaCode];
  const range = entry?.[`br${bedrooms}` as 'br0' | 'br1' | 'br2' | 'br3' | 'br4'];
  return range ? { fmrYear: FMR_BY_YEAR[fy].year, range } : null;
}

/** getPairedFMR's range alone (null when unpaired or no entry). */
export function getFMRRange(mhaCode: string, bahYear: string, bedrooms: Bedrooms = 2): FmrRange | null {
  return getPairedFMR(mhaCode, bahYear, bedrooms)?.range ?? null;
}

/** FMR median (the SAFMR ZIP-median) for an MHA + bedroom size, paired with `bahYear`. */
export function getFMR(mhaCode: string, bahYear: string, bedrooms: Bedrooms = 2): number | null {
  return getFMRRange(mhaCode, bahYear, bedrooms)?.median ?? null;
}

/** The full FMR entry for an MHA (all bedroom sizes + coverage), paired with `bahYear`, or null. */
export function getFMRDetail(mhaCode: string, bahYear: string): MHAFmr | null {
  const fy = fmrYearForBahYear(bahYear);
  return fy ? FMR_BY_YEAR[fy].data[mhaCode] ?? null : null;
}
