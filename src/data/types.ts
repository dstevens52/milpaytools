import type { PayGrade, YearsOfService } from '@/types/military';

// ─── Pay Tables ────────────────────────────────────────────────────────────

/**
 * Monthly basic pay by pay grade and years of service.
 * YOS key is the minimum years to qualify for that column.
 * E.g. key 6 means "6 but less than 8 years."
 */
export type PayTableEntry = Partial<Record<YearsOfService, number>>;
export type PayTable = Record<PayGrade, PayTableEntry>;

// ─── BAH Rates ────────────────────────────────────────────────────────────

export interface BAHRateEntry {
  withDependents: number;
  withoutDependents: number;
}

/** Keyed by pay grade */
export type BAHByGrade = Partial<Record<PayGrade, BAHRateEntry>>;

/**
 * Keyed by ZIP code (5-digit string, preserve leading zeros).
 * Each ZIP maps to a named location and rates by grade.
 */
export interface BAHLocation {
  mhaName: string;
  mhaCode: string;
  rates: BAHByGrade;
}

export type BAHTable = Record<string, BAHLocation>; // key = ZIP code

// ─── VA Disability Rates ──────────────────────────────────────────────────

/**
 * VA disability compensation rates for one rating percentage.
 *
 * Table A — rates WITHOUT children (veteran alone, spouse, parents).
 * Table B — rates WITH exactly 1 child (various spouse/parent combos).
 * For 2+ children: use Table B as the base, then add additionalChild
 * for each child beyond the first (or additionalSchoolChild for 18-23).
 *
 * All values are official VA.gov 2026 rates, effective December 1, 2025.
 */
export interface VADependentRates {
  // ─── Table A: No children ───────────────────────────────────────────────
  veteranAlone: number;
  withSpouse: number;                  // spouse, no parents, no children
  withSpouseAnd1Parent: number;        // spouse + 1 parent, no children
  withSpouseAnd2Parents: number;       // spouse + 2 parents, no children
  with1Parent: number;                 // 1 parent, no spouse, no children
  with2Parents: number;                // 2 parents, no spouse, no children

  // ─── Table B: With exactly 1 child ──────────────────────────────────────
  with1Child: number;                          // 1 child, no spouse, no parents
  withSpouseAnd1Child: number;                 // spouse + 1 child, no parents
  withSpouseAnd1ChildAnd1Parent: number;       // spouse + 1 child + 1 parent
  withSpouseAnd1ChildAnd2Parents: number;      // spouse + 1 child + 2 parents
  with1ChildAnd1Parent: number;                // 1 child + 1 parent, no spouse
  with1ChildAnd2Parents: number;               // 1 child + 2 parents, no spouse

  // ─── Additional amounts (added on top of the nearest published base) ────
  additionalChild: number;        // per additional child under 18 beyond the first
  additionalSchoolChild: number;  // per child 18-23 in approved school program
  spouseAA: number;               // spouse receiving Aid & Attendance
}

/**
 * Keyed by disability rating percentage (0, 10, 20 ... 100).
 */
export type VADisabilityTable = Record<number, VADependentRates>;
