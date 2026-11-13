/**
 * BAH calculation logic.
 * Pure functions — no React, no side effects.
 *
 * Data source: the DTMO BAH ASCII files for BAH_YEAR (src/data/bah/current.ts),
 * imported by scripts/bah-import.mjs and registered in src/data/bah/registry.ts.
 * Server/build only — it holds the full ZIP map. Clients use /api/bah/lookup.
 */

import type { BAHInput, BAHOutput } from '@/types/calculator';
import { BAH_YEAR, BAH_PRIOR_YEAR } from '@/data/bah/current';
import {
  BAH_RATES_BY_YEAR,
  BAH_LOOKUP_TABLES,
  BAH_MID_YEAR_CHANGES_BY_YEAR,
  type BahYear,
} from '@/data/bah/registry';
import type { BahMidYearChange } from '@/data/bah/midYear';
import { isValidZip } from '@/lib/utils';

export type { BahYear };

// ─── Year-generic rate access ────────────────────────────────────────────────
// The current year comes from current.ts; every year's data comes from the
// registry. A BAH_YEAR / BAH_PRIOR_YEAR that isn't registered fails the type
// check here, and the build with it. Prior-year data is used only at build time
// (server components and the lookup route) — it never ships to the client.
export const CURRENT_BAH_YEAR: BahYear = BAH_YEAR;
export const PRIOR_BAH_YEAR: BahYear = BAH_PRIOR_YEAR;

const RATES_BY_YEAR = BAH_RATES_BY_YEAR;
const mhaRates = RATES_BY_YEAR[CURRENT_BAH_YEAR];

const lookupTables = BAH_LOOKUP_TABLES[CURRENT_BAH_YEAR];
if (!lookupTables) {
  throw new Error(
    `BAH registry: no zipToMha/mhaNames registered for BAH_YEAR ${CURRENT_BAH_YEAR} (src/data/bah/registry.ts → BAH_LOOKUP_TABLES)`,
  );
}
const { zipToMha, mhaNames } = lookupTables;

/** Current-year ZIP → MHA map. Server/build only (~650 KB). */
export function currentZipToMha(): Readonly<Record<string, string>> {
  return zipToMha;
}

/** Current-year MHA code → DTMO display name. Server/build only. */
export function currentMhaNames(): Readonly<Record<string, string>> {
  return mhaNames;
}

/** ZIP codes in the current-year dataset (includes XX499 territory ZIPs). */
export const BAH_ZIP_COUNT = Object.keys(zipToMha).length;

/** Military Housing Areas with published rates in the current year. */
export const BAH_MHA_COUNT = Object.keys(mhaRates).length;

/**
 * DTMO mid-year change for an MHA in `year` (default: the current BAH year), or
 * null. Pass PRIOR_BAH_YEAR after the year switch to find a prior-year temporary
 * increase that the new rates replace (e.g. TX270's 2026 increase).
 */
export function getBahMidYearChange(
  mhaCode: string | null | undefined,
  year: BahYear = CURRENT_BAH_YEAR,
): BahMidYearChange | null {
  if (!mhaCode) return null;
  return BAH_MID_YEAR_CHANGES_BY_YEAR[year]?.[mhaCode] ?? null;
}

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

/** True if `year` has rates registered in src/data/bah/registry.ts. */
export function isBahYear(year: string): year is BahYear {
  return Object.prototype.hasOwnProperty.call(RATES_BY_YEAR, year);
}

/** Prior-year (BAH_PRIOR_YEAR) rates for an MHA: the rates still paid until January 1. */
export interface PriorYearRates {
  year: string;
  ratesW: Record<string, number> | null;
  ratesWO: Record<string, number> | null;
}
export function priorYearRates(mhaCode: string): PriorYearRates {
  return {
    year: PRIOR_BAH_YEAR,
    ratesW: getMHARatesForYear(mhaCode, true, PRIOR_BAH_YEAR),
    ratesWO: getMHARatesForYear(mhaCode, false, PRIOR_BAH_YEAR),
  };
}

/**
 * List every MHA code present in a given year's dataset. Build-time only —
 * lets stats helpers iterate all MHAs without coupling to the data structure.
 */
export function listMHACodes(year: BahYear = CURRENT_BAH_YEAR): string[] {
  return Object.keys(RATES_BY_YEAR[year] ?? {});
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
    dataYear: CURRENT_BAH_YEAR,
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
