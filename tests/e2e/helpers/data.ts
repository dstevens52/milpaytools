/**
 * Test data helpers — source of truth for expected values.
 *
 * All expected values in the test suite are computed from these helpers,
 * which import directly from the same src/data/ files the calculators use.
 * When rates update, tests automatically stay in sync.
 */

import { payTable } from '../../../src/data/pay-tables/2026';
import { BAS_RATES } from '../../../src/data/constants';
import { vaRates } from '../../../src/data/va-rates/2026';
import { lookupBAH } from '../../../src/lib/calculations/bah';
import {
  calculateCombinedRating,
  getCompensation,
} from '../../../src/lib/calculations/va-disability';
import type { PayGrade, YearsOfService } from '../../../src/types/military';
import type { DisabilityEntry, DependentConfig } from '../../../src/lib/calculations/va-disability';

// ─── Pay table lookup ─────────────────────────────────────────────────────────

/**
 * Return the monthly basic pay for a grade at the given years of service.
 * Uses the same bracket logic as the calculators.
 */
export function getBasePay(grade: PayGrade, yos: number): number {
  const entry = payTable[grade];
  if (!entry) throw new Error(`Grade not found in pay table: ${grade}`);
  const keys = Object.keys(entry)
    .map(Number)
    .sort((a, b) => a - b);
  const validKeys = keys.filter((k) => k <= yos);
  if (validKeys.length === 0)
    throw new Error(`No YOS bracket for ${grade} at ${yos} years`);
  const bracket = validKeys[validKeys.length - 1] as YearsOfService;
  return entry[bracket] as number;
}

/**
 * Return the monthly basic pay at exactly the given DFAS column key.
 * Throws if the grade does not have that column (e.g. E-8 at yosKey=2 → N/A).
 */
export function getBasePayAtColumn(grade: PayGrade, yosKey: YearsOfService): number {
  const entry = payTable[grade];
  if (!entry) throw new Error(`Grade not found: ${grade}`);
  const val = entry[yosKey];
  if (val === undefined)
    throw new Error(`${grade} has no column at YOS key ${yosKey}`);
  return val;
}

// ─── BAS ─────────────────────────────────────────────────────────────────────

/** Monthly BAS for a grade (enlisted vs officer split). */
export function getBAS(grade: PayGrade): number {
  return grade.startsWith('E') ? BAS_RATES.enlisted : BAS_RATES.officer;
}

// ─── BAH ─────────────────────────────────────────────────────────────────────

/** Monthly BAH rate, or null if ZIP not found. */
export function getBAH(
  zipCode: string,
  grade: PayGrade,
  hasDependents: boolean
): number | null {
  const result = lookupBAH({ zipCode, payGrade: grade, hasDependents });
  return result?.monthlyRate ?? null;
}

/** MHA location name for a ZIP, or null. */
export function getLocationName(zipCode: string): string | null {
  const result = lookupBAH({ zipCode, payGrade: 'E-5', hasDependents: false });
  return result?.locationName ?? null;
}

// ─── VA disability ────────────────────────────────────────────────────────────

/** Build a simple DisabilityEntry for test use. */
export function makeDisability(
  rating: number,
  label = '',
  side: DisabilityEntry['side'] = 'none',
  pairKey: string | null = null
): DisabilityEntry {
  return { id: `test-${rating}-${label}`, rating, label, side, pairKey };
}

/** Combined rating result from a list of simple disabilities. */
export function combinedRating(ratings: number[]) {
  const entries = ratings.map((r) => makeDisability(r));
  return calculateCombinedRating(entries);
}

/** Monthly VA compensation for a rating + dependent config. */
export function vaCompensation(rounded: number, deps: DependentConfig) {
  return getCompensation(rounded, deps);
}

/** Raw VA rate at a given rating percentage and dependent column key. */
export function vaRate(pct: number, key: keyof typeof vaRates[100]): number {
  const row = vaRates[pct as keyof typeof vaRates];
  if (!row) throw new Error(`No VA rate for ${pct}%`);
  return row[key] as number;
}

// ─── Re-exports for convenience ───────────────────────────────────────────────

export { BAS_RATES };
export type { PayGrade, DependentConfig, DisabilityEntry };
