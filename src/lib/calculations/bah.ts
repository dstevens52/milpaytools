/**
 * BAH calculation logic.
 * Pure functions — no React, no side effects.
 */

import type { BAHInput, BAHOutput } from '@/types/calculator';
import { bahTable, DATA_YEAR } from '@/data/bah-rates/2026';
import { isValidZip } from '@/lib/utils';

/**
 * Look up the BAH rate for a given pay grade, ZIP code, and dependency status.
 * Returns null if ZIP not found in the current dataset.
 */
export function lookupBAH(input: BAHInput): BAHOutput | null {
  if (!isValidZip(input.zipCode)) return null;

  const location = bahTable[input.zipCode];
  if (!location) return null;

  const gradeRates = location.rates[input.payGrade];
  if (!gradeRates) return null;

  const monthlyRate = input.hasDependents
    ? gradeRates.withDependents
    : gradeRates.withoutDependents;

  return {
    monthlyRate,
    annualRate: monthlyRate * 12,
    mhaCode: location.mhaCode,
    locationName: location.mhaName,
    dataYear: DATA_YEAR,
  };
}

/**
 * Find the BAH location name for a ZIP code without computing a rate.
 */
export function getLocationName(zipCode: string): string | null {
  return bahTable[zipCode]?.mhaName ?? null;
}

/**
 * Check if a ZIP code exists in the current BAH dataset.
 */
export function isZipInDataset(zipCode: string): boolean {
  return zipCode in bahTable;
}
