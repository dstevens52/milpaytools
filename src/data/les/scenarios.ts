/**
 * LES Pay Checker — shared scenario constants.
 *
 * Inputs only. No dollar figures live here: every "should be" value is computed
 * from the pay table, BAH dataset, and BAS constants. The page's worked example
 * and the E2E spec both consume these, so the page, the tool, and the tests
 * always describe the same member.
 *
 * ZIP → MHA chain (DTMO sorted_zipmha26 → mhanames26):
 *   28301 / 28310 → NC182 Fort Bragg/Pope, NC
 *   76541 / 76544 → TX286 Fort Hood, TX
 *   92136         → CA038 San Diego, CA
 *   98433         → WA311 Tacoma, WA
 *   96818         → HI408 Honolulu County, HI
 *   23511         → VA298 Norfolk/Portsmouth, VA
 */

import type { PayGrade } from '@/types/military';
import { E1_UNDER_4_MONTHS_YOS } from '@/lib/calculations/lesCheck';

export interface LesScenario {
  id: string;
  grade: PayGrade;
  /** YOS select value — a pay-table column key as a string, or E1_UNDER_4_MONTHS_YOS. */
  yos: string;
  zip: string;
  hasDependents: boolean;
}

/**
 * Worked example on the page: an E-5 over 6 at Fort Bragg who recently married.
 * The LES still pays BAH at the without-dependents rate — the deliberate mismatch.
 * Base pay and BAS on the LES are correct.
 */
export const LES_EXAMPLE = {
  grade: 'E-5' as PayGrade,
  yos: '6',
  zip: '28310',
  stationName: 'Fort Bragg, NC',
  hasDependents: true,
  /** The LES BAH line reflects this (stale) dependency status. */
  lesBahHasDependents: false,
} as const;

/** Known-value scenarios for the E2E spec — grade/YOS/station combinations. */
export const LES_TEST_SCENARIOS: LesScenario[] = [
  { id: 'e5-over6-bragg-with', grade: 'E-5', yos: '6', zip: '28310', hasDependents: true },
  { id: 'e3-over2-hood-without', grade: 'E-3', yos: '2', zip: '76544', hasDependents: false },
  { id: 'e7-over20-sandiego-with', grade: 'E-7', yos: '20', zip: '92136', hasDependents: true },
  { id: 'o3-over4-jblm-without', grade: 'O-3', yos: '4', zip: '98433', hasDependents: false },
  { id: 'w2-over8-norfolk-with', grade: 'W-2', yos: '8', zip: '23511', hasDependents: true },
  { id: 'o6-over22-honolulu-with', grade: 'O-6', yos: '22', zip: '96818', hasDependents: true },
];

/** Pay-table edge rows: E-1 footnote rate, warrant series, prior-enlisted officers. */
export const LES_EDGE_SCENARIOS: LesScenario[] = [
  { id: 'e1-under4mo', grade: 'E-1', yos: E1_UNDER_4_MONTHS_YOS, zip: '76544', hasDependents: false },
  { id: 'e1-over0', grade: 'E-1', yos: '0', zip: '76544', hasDependents: false },
  { id: 'w1-over2', grade: 'W-1', yos: '2', zip: '28310', hasDependents: false },
  { id: 'w4-over24', grade: 'W-4', yos: '24', zip: '28310', hasDependents: true },
  { id: 'o1e-over4', grade: 'O-1E', yos: '4', zip: '28310', hasDependents: true },
  { id: 'o2e-over10', grade: 'O-2E', yos: '10', zip: '28310', hasDependents: true },
  { id: 'o3e-over14', grade: 'O-3E', yos: '14', zip: '28310', hasDependents: true },
];

/** Territory ZIP (San Juan, PR → XX499) and an APO ZIP — both must return can't-check. */
export const LES_OCONUS_ZIPS = {
  territory: '00901',
  apo: '09094',
} as const;

/**
 * Grades excluded from the checker because their 2026 pay rows are flagged
 * "estimates pending manual verification" in src/data/pay-tables/2026.ts.
 */
export const LES_PENDING_VERIFICATION_GRADES = ['W-5', 'O-7', 'O-8', 'O-9', 'O-10'] as const;

/** OCONUS installation picked by name from the station search. */
export const LES_OCONUS_STATION_QUERY = 'Ramstein';
