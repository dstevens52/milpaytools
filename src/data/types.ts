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

export interface VADependentRates {
  veteranAlone: number;
  withSpouse: number;
  withSpouseAA: number; // spouse receiving Aid & Attendance
  withSpouseAndOneChild: number;
  withSpouseAndTwoChildren: number;
  withSpouseAndThreeChildren: number;
  withOneChild: number;
  withTwoChildren: number;
  withThreeChildren: number;
  additionalChild: number;       // per additional child under 18
  additionalSchoolChild: number; // per child 18-23 attending an approved school program
  additionalParent: number;      // per dependent parent (up to 2)
}

/**
 * Keyed by disability rating percentage (0, 10, 20 ... 100).
 */
export type VADisabilityTable = Record<number, VADependentRates>;
