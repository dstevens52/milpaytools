// CONUS COLA calculation logic
// Source: DTMO — https://www.travel.dod.mil/Pay-Entitlements/CONUS-COLA/
// Rates are approximate — always verify at DTMO for your specific grade and dependency status.

import {
  ColaArea,
  GradeGroup,
  ColaTier,
  COLA_RATE_ESTIMATES,
  ZIP_PREFIX_MAP,
  TIER_LABELS,
} from '@/data/cola/2026/constants';
import type { PayGrade } from '@/types/military';

export interface ColaInput {
  zipCode: string;
  payGrade: PayGrade;
  hasDependents: boolean;
}

export interface ColaResult {
  isColaArea: boolean;
  area?: ColaArea;
  tierLabel?: string;
  approxMonthly?: number;
  approxAnnual?: number;
  gradeGroup?: GradeGroup;
  taxNote: string;
}

/** Map a military pay grade to the grade group used for COLA rate lookups */
export function getGradeGroup(payGrade: PayGrade): GradeGroup {
  if (['E-1', 'E-2', 'E-3', 'E-4'].includes(payGrade)) return 'E1-E4';
  if (['E-5', 'E-6', 'E-7', 'E-8', 'E-9'].includes(payGrade)) return 'E5-E9';
  if (['W-1', 'W-2', 'W-3', 'W-4', 'W-5'].includes(payGrade)) return 'W1-W5';
  if (['O-1', 'O-2', 'O-3'].includes(payGrade)) return 'O1-O3';
  if (['O-4', 'O-5', 'O-6'].includes(payGrade)) return 'O4-O6';
  return 'O7-O10'; // O-7 through O-10
}

/** Look up CONUS COLA area by ZIP code */
export function lookupColaArea(zipCode: string): ColaArea | null {
  const prefix = zipCode.replace(/\D/g, '').slice(0, 3);
  if (prefix.length < 3) return null;
  return ZIP_PREFIX_MAP.get(prefix) ?? null;
}

/** Get approximate monthly COLA for a given tier, grade, and dependency status */
export function getApproxMonthlyRate(
  tier: ColaTier,
  gradeGroup: GradeGroup,
  hasDependents: boolean
): number {
  const [withoutDeps, withDeps] = COLA_RATE_ESTIMATES[tier][gradeGroup];
  return hasDependents ? withDeps : withoutDeps;
}

/** Main COLA lookup — returns result with area info and approximate rate */
export function lookupCola(input: ColaInput): ColaResult {
  const { zipCode, payGrade, hasDependents } = input;

  const area = lookupColaArea(zipCode);

  if (!area) {
    return {
      isColaArea: false,
      taxNote: 'CONUS COLA is taxable income — unlike BAH and BAS, which are tax-free.',
    };
  }

  const gradeGroup = getGradeGroup(payGrade);
  const approxMonthly = getApproxMonthlyRate(area.tier, gradeGroup, hasDependents);
  const approxAnnual = approxMonthly * 12;

  return {
    isColaArea: true,
    area,
    tierLabel: TIER_LABELS[area.tier],
    approxMonthly,
    approxAnnual,
    gradeGroup,
    taxNote: 'CONUS COLA is taxable income — unlike BAH and BAS, which are tax-free.',
  };
}
