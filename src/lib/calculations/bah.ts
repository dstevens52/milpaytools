/**
 * BAH calculation logic.
 * Pure functions — no React, no side effects.
 *
 * Data source: DTMO 2026 BAH ASCII files (40,959 ZIP codes, 338 MHAs)
 */

import type { BAHInput, BAHOutput } from '@/types/calculator';
import { zipToMha } from '@/data/bah/2026/zipToMha';
import { mhaRates, DATA_YEAR } from '@/data/bah/2026/mhaRates';
import { mhaRates as rates2025 } from '@/data/bah/2025/mhaRates';
import { mhaNames } from '@/data/bah/2026/mhaNames';
import { isValidZip } from '@/lib/utils';

// ─── Year-generic rate access ────────────────────────────────────────────────
// `mhaRates` (imported above) is the current year. Additional years register
// here so future years drop in with no rework. Prior-year data is used only at
// build time (server components) — it never ships to the client.
export type BahYear = '2025' | '2026';

const RATES_BY_YEAR: Record<BahYear, typeof mhaRates> = {
  '2026': mhaRates,
  '2025': rates2025,
};

export const CURRENT_BAH_YEAR: BahYear = '2026';
export const PRIOR_BAH_YEAR: BahYear = '2025';

/**
 * Get all BAH rates for an MHA code, dependency status, and year.
 * Returns null when the MHA isn't present in the requested year — this is the
 * graceful fallback for future years where MHA codes may not align across years.
 */
export function getMHARatesForYear(
  mhaCode: string,
  hasDependents: boolean,
  year: BahYear = CURRENT_BAH_YEAR
): Record<string, number> | null {
  const yearData = RATES_BY_YEAR[year]?.[mhaCode];
  if (!yearData) return null;
  return hasDependents ? yearData.w : yearData.wo;
}

/** O-8/O-9/O-10 receive the same BAH as O-7. */
function bahGrade(payGrade: string): string {
  const map: Record<string, string> = { 'O-8': 'O-7', 'O-9': 'O-7', 'O-10': 'O-7' };
  return map[payGrade] ?? payGrade;
}

/**
 * Look up the BAH rate for a given pay grade, ZIP code, and dependency status.
 * Returns null if ZIP not found, is a territory (XX499), or grade not in dataset.
 */
export function lookupBAH(input: BAHInput): BAHOutput | null {
  if (!isValidZip(input.zipCode)) return null;

  const mhaCode = zipToMha[input.zipCode];
  if (!mhaCode) return null;
  if (mhaCode === 'XX499') return null; // U.S. territory — receives OHA, not BAH

  const rates = mhaRates[mhaCode];
  if (!rates) return null;

  const grade = bahGrade(input.payGrade);
  const rateSet = input.hasDependents ? rates.w : rates.wo;
  const monthlyRate = rateSet[grade];
  if (monthlyRate === undefined) return null;

  return {
    monthlyRate,
    annualRate: monthlyRate * 12,
    mhaCode,
    locationName: mhaNames[mhaCode] ?? mhaCode,
    dataYear: DATA_YEAR,
  };
}

/**
 * Get the display name for a ZIP code's Military Housing Area.
 * Returns null if ZIP not in dataset or is a territory.
 */
export function getLocationName(zipCode: string): string | null {
  if (!isValidZip(zipCode)) return null;
  const mhaCode = zipToMha[zipCode];
  if (!mhaCode || mhaCode === 'XX499') return null;
  return mhaNames[mhaCode] ?? null;
}

/** Check if a ZIP code is in the BAH dataset (and is not a territory). */
export function isZipInDataset(zipCode: string): boolean {
  if (!isValidZip(zipCode)) return false;
  const mhaCode = zipToMha[zipCode];
  return !!mhaCode && mhaCode !== 'XX499';
}

/** Check if a ZIP code is a U.S. territory (receives OHA, not BAH). */
export function isTerritory(zipCode: string): boolean {
  if (!isValidZip(zipCode)) return false;
  return zipToMha[zipCode] === 'XX499';
}

/**
 * Get all BAH rates for a given MHA code and dependency status.
 * Returns rates for every grade, useful for displaying a full rate table.
 */
export function getMHARates(
  mhaCode: string,
  hasDependents: boolean
): Record<string, number> | null {
  const rates = mhaRates[mhaCode];
  if (!rates) return null;
  return hasDependents ? rates.w : rates.wo;
}

/**
 * Get the MHA code for a ZIP code.
 * Returns null if ZIP not in dataset or is a territory.
 */
export function getMHACode(zipCode: string): string | null {
  if (!isValidZip(zipCode)) return null;
  const mhaCode = zipToMha[zipCode];
  if (!mhaCode || mhaCode === 'XX499') return null;
  return mhaCode;
}

/**
 * Compute national median BAH rates for every pay grade across all MHAs.
 * Median is used (not mean) because coastal outliers (SF, NYC) skew the mean
 * significantly upward and don't represent a typical duty station.
 */
export function getNationalAverages(): { w: Record<string, number>; wo: Record<string, number> } {
  const accumW: Record<string, number[]> = {};
  const accumWO: Record<string, number[]> = {};
  for (const mha of Object.values(mhaRates)) {
    for (const [grade, rate] of Object.entries(mha.w)) {
      (accumW[grade] ??= []).push(rate);
    }
    for (const [grade, rate] of Object.entries(mha.wo)) {
      (accumWO[grade] ??= []).push(rate);
    }
  }
  const median = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid];
  };
  return {
    w: Object.fromEntries(Object.entries(accumW).map(([g, rates]) => [g, median(rates)])),
    wo: Object.fromEntries(Object.entries(accumWO).map(([g, rates]) => [g, median(rates)])),
  };
}
