/**
 * LES Pay Checker — pure comparison logic.
 *
 * Compares three LES entitlement lines (base pay, BAH, BAS) against the official
 * 2026 rates. Every "should be" figure comes from an existing data library:
 *   - Base pay: payTable / E1_UNDER_4_MONTHS (src/data/pay-tables/2026.ts)
 *   - BAS:      BAS_RATES (src/data/constants.ts)
 *   - BAH:      resolved by the caller (server: bah.ts; client: /api/bah/lookup)
 *
 * This module must never import bah.ts or any BAH dataset — the client widget
 * gets BAH from the cached lookup route, so the dataset stays off the client.
 *
 * Pure functions — no React, no side effects.
 */

import { payTable, E1_UNDER_4_MONTHS } from '@/data/pay-tables/2026';
import { BAS_RATES } from '@/data/constants';
import { YOS_BREAKPOINTS, ALL_PAY_GRADES } from '@/types/military';
import type { PayGrade } from '@/types/military';
import { lookupBasePay } from './basePay';

/**
 * Grades whose 2026 basic-pay rows the data file flags as "estimates pending
 * manual verification against current DFAS tables" (see the header of
 * src/data/pay-tables/2026.ts). A projection may use an estimate; this tool
 * turns a figure into an assertion about someone's paycheck, so these grades
 * get a can't-check state instead of a verdict.
 *
 * Scope is the pay table only — BAH (DTMO) and BAS (DFAS) come from separate,
 * unflagged sources.
 */
export const PENDING_VERIFICATION_GRADES: PayGrade[] = ['W-5', 'O-7', 'O-8', 'O-9', 'O-10'];

export function isPendingVerificationGrade(grade: PayGrade): boolean {
  return PENDING_VERIFICATION_GRADES.includes(grade);
}

/** Grades the checker offers: every grade whose pay row is verified. */
export const CHECKABLE_PAY_GRADES: PayGrade[] = ALL_PAY_GRADES.filter((g) => !isPendingVerificationGrade(g));

/** YOS select value for the E-1 "less than 4 months of service" DFAS footnote rate. */
export const E1_UNDER_4_MONTHS_YOS = 'e1-under-4mo';

export interface YosOption {
  value: string;
  label: string;
}

/**
 * Years-of-service options for a grade, matching the pay table's own columns.
 * Starts at the grade's first published column (e.g. E-8 starts at "Over 8",
 * O-1E at "Over 4") so the list never offers a column DFAS leaves blank.
 */
export function yosOptionsFor(grade: PayGrade): YosOption[] {
  const keys = Object.keys(payTable[grade] ?? {}).map(Number);
  if (keys.length === 0) return [];
  const first = Math.min(...keys);
  const options: YosOption[] = YOS_BREAKPOINTS.filter((b) => b >= first).map((b) => ({
    value: String(b),
    label: b === 0 ? (grade === 'E-1' ? '4 months to 2 years' : 'Under 2 years') : `Over ${b} years`,
  }));
  if (grade === 'E-1') {
    options.unshift({ value: E1_UNDER_4_MONTHS_YOS, label: 'Under 4 months' });
  }
  return options;
}

/**
 * Expected monthly basic pay. Null when the grade/YOS cell is blank in the DFAS
 * table, or when the grade's pay row is pending verification.
 */
export function expectedBasePay(grade: PayGrade, yos: string): number | null {
  if (isPendingVerificationGrade(grade)) return null;
  if (yos === E1_UNDER_4_MONTHS_YOS) return grade === 'E-1' ? E1_UNDER_4_MONTHS : null;
  const n = Number(yos);
  if (yos === '' || !Number.isFinite(n)) return null;
  const pay = lookupBasePay(grade, n);
  return pay > 0 ? pay : null;
}

/** Expected monthly BAS: enlisted rate for E-grades, officer rate for W- and O-grades. */
export function expectedBAS(grade: PayGrade): number {
  return grade.startsWith('E') ? BAS_RATES.enlisted : BAS_RATES.officer;
}

/**
 * True for APO/FPO military-mail ZIPs (AE 090–098, AA 340, AP 962–966).
 * These are overseas addresses — OHA, not BAH — and are not in the DTMO file.
 */
export function isMilitaryMailZip(zip: string): boolean {
  return /^(09[0-8]|340|96[2-6])\d{2}$/.test(zip);
}

/**
 * Parse a currency figure typed from an LES — with or without a dollar sign,
 * thousands separators, or trailing cents.
 * Returns null for blank or unparseable input — a blank row is skipped, never a mismatch.
 */
export function parseLesAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '');
  if (cleaned === '') return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}

export type LesLine = 'basePay' | 'bah' | 'bas';

export const LES_LINE_LABELS: Record<LesLine, string> = {
  basePay: 'Base pay',
  bah: 'BAH',
  bas: 'BAS',
};

/**
 * Row state:
 *   notEntered  — LES field left blank; row skipped
 *   unavailable — can't compute a "should be" (missing station, blank DFAS cell, ZIP not found)
 *   oconus      — overseas / territory station: OHA applies, BAH can't be checked
 *   pending     — the grade's pay row is awaiting verification: no verdict given
 *   loading     — BAH lookup in flight
 *   match / mismatch
 */
export type LesRowStatus = 'notEntered' | 'unavailable' | 'oconus' | 'pending' | 'loading' | 'match' | 'mismatch';

export interface LesRow {
  line: LesLine;
  status: LesRowStatus;
  entered: number | null;
  expected: number | null;
  /** entered − expected, in dollars (negative = LES shows less than the rate). */
  diff: number | null;
  /** diff × 12 */
  annualDiff: number | null;
  /** Why a row is unavailable — shown in place of the figure. */
  note?: string;
}

export const PENDING_VERIFICATION_NOTE =
  'Verification of the 2026 pay-table rows for W-5 and O-7 through O-10 is pending, so this tool doesn’t check base pay for those grades.';

/** Compare one entered figure against its expected rate, to the cent. */
export function compareLine(
  line: LesLine,
  entered: number | null,
  expected: number | null,
  unavailableNote?: string,
): LesRow {
  if (entered === null) {
    return { line, status: 'notEntered', entered, expected, diff: null, annualDiff: null };
  }
  if (expected === null) {
    return { line, status: 'unavailable', entered, expected, diff: null, annualDiff: null, note: unavailableNote };
  }
  const diff = Math.round((entered - expected) * 100) / 100;
  const annualDiff = Math.round(diff * 12 * 100) / 100;
  return {
    line,
    status: diff === 0 ? 'match' : 'mismatch',
    entered,
    expected,
    diff,
    annualDiff,
  };
}

/**
 * If an LES BAH figure matches the *other* dependency rate at the same station,
 * the dependency status on file likely differs from what was entered here.
 */
export function bahMatchesOtherDependencyRate(
  enteredBah: number | null,
  otherRate: number | null,
): boolean {
  return enteredBah !== null && otherRate !== null && Math.round(enteredBah * 100) === Math.round(otherRate * 100);
}
