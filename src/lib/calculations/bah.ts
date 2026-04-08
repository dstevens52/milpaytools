/**
 * BAH calculation logic.
 * Pure functions — no React, no side effects.
 */

import type { BAHInput, BAHOutput } from '@/types/calculator';
import { bahTable, DATA_YEAR } from '@/data/bah-rates/2026';
import { isValidZip } from '@/lib/utils';

// Map prior-enlisted officer grades to their BAH grade (BAH uses O-1/O-2/O-3, not E variants)
function bahGrade(payGrade: string): string {
  const map: Record<string, string> = { 'O-1E': 'O-1', 'O-2E': 'O-2', 'O-3E': 'O-3' };
  return map[payGrade] ?? payGrade;
}

/**
 * Look up the BAH rate for a given pay grade, ZIP code, and dependency status.
 * Returns null if ZIP not found in the current dataset.
 */
export function lookupBAH(input: BAHInput): BAHOutput | null {
  if (!isValidZip(input.zipCode)) return null;

  const location = bahTable[input.zipCode];
  if (!location) return null;

  const grade = bahGrade(input.payGrade);
  const gradeRates = location.rates[grade as keyof typeof location.rates];
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
