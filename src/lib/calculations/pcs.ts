/**
 * PCS Cost Estimator — calculation functions
 * All pure functions: no React, no side effects, independently testable.
 */

import { PCS_RATES_2026 } from '@/data/pcs/2026/constants';

export type PCSMoveType = 'gov' | 'full-ppm' | 'partial-ppm';

export interface PCSInput {
  rank: string;
  hasDependents: boolean;
  numDependents: number; // number traveling with SM
  moveType: PCSMoveType;
  distance: number; // authorized DTOD miles
  numPOVs: 1 | 2;
  hhgWeight: number; // lbs being self-moved (for PPM)
  tleOldDays: number; // 0–10
  tleNewDays: number; // 0–10
  ppmExpenses: number; // estimated truck, fuel, supplies
}

export interface PCSOutput {
  travelDays: number;
  dla: number;
  malt: number;
  perDiemMember: number;
  perDiemDependents: number;
  perDiemTotal: number;
  tleTotal: number;
  tleDays: number; // capped combined days
  weightAllowance: number;
  // PPM — zero for government move
  ppmGrossReimbursement: number;
  ppmGrossProfit: number;
  ppmAfterTaxProfit: number;
  ppmAdvanceAmount: number;
  // Totals
  govMoveTotal: number; // DLA + MALT + perDiem + TLE
  ppmMoveTotal: number; // govMoveTotal + afterTaxProfit (for PPM moves)
}

/**
 * Travel days per JTR:
 *  - 1 day for the first 400 miles
 *  - +1 day per 350 miles thereafter (remainder ≥ 51 miles rounds up)
 */
export function calculateTravelDays(distance: number): number {
  if (distance <= 0) return 0;
  if (distance <= PCS_RATES_2026.milesFirstDay) return 1;
  const remaining = distance - PCS_RATES_2026.milesFirstDay;
  const fullBlocks = Math.floor(remaining / PCS_RATES_2026.milesPerAdditionalDay);
  const leftover = remaining % PCS_RATES_2026.milesPerAdditionalDay;
  const additionalDays = leftover >= 51 ? fullBlocks + 1 : fullBlocks;
  return 1 + additionalDays;
}

/**
 * DLA lookup by rank and dependency status.
 */
export function calculateDLA(rank: string, hasDependents: boolean): number {
  const table = hasDependents
    ? PCS_RATES_2026.dla.withDependents
    : PCS_RATES_2026.dla.withoutDependents;
  return table[rank] ?? 0;
}

/**
 * MALT (mileage allowance): distance × rate/mile × number of POVs.
 */
export function calculateMALT(distance: number, numPOVs: number): number {
  return distance * PCS_RATES_2026.maltPerMile * numPOVs;
}

export interface PerDiemResult {
  memberPerDiem: number;
  dependentsPerDiem: number;
  total: number;
}

/**
 * Per diem for PCS travel:
 *  - 1 travel day:  first/last rate × 1
 *  - 2+ travel days: first/last rate × 2 + full rate × (days - 2)
 *  - Dependents: each at 75% of member rate (JTR standard for dependents age 12+)
 */
export function calculatePerDiem(
  travelDays: number,
  hasDependents: boolean,
  numDependents: number
): PerDiemResult {
  if (travelDays <= 0) return { memberPerDiem: 0, dependentsPerDiem: 0, total: 0 };

  let memberPerDiem: number;
  if (travelDays === 1) {
    memberPerDiem = PCS_RATES_2026.perDiemFirstLastDay;
  } else {
    memberPerDiem =
      2 * PCS_RATES_2026.perDiemFirstLastDay +
      (travelDays - 2) * PCS_RATES_2026.perDiemTotal;
  }

  // 75% rate per dependent per JTR (approximation — actual rate depends on dependent age)
  const dependentsPerDiem =
    hasDependents && numDependents > 0 ? numDependents * memberPerDiem * 0.75 : 0;

  return {
    memberPerDiem,
    dependentsPerDiem,
    total: memberPerDiem + dependentsPerDiem,
  };
}

/**
 * TLE (Temporary Lodging Expense): per diem rate × days, capped at 14 combined days.
 */
export function calculateTLE(tleOldDays: number, tleNewDays: number): { total: number; days: number } {
  const days = Math.min(tleOldDays + tleNewDays, PCS_RATES_2026.tleMaxDays);
  return { total: days * PCS_RATES_2026.perDiemTotal, days };
}

export interface PPMResult {
  grossReimbursement: number;
  grossProfit: number;
  afterTaxProfit: number;
  advanceAmount: number;
}

/**
 * PPM reimbursement estimate:
 *  - Government cost estimate = (weight / 100) × CWT rate
 *  - Profit = reimbursement − expenses
 *  - After-tax profit: profit × (1 − taxRate) when positive
 */
export function calculatePPM(
  weight: number,
  expenses: number,
  taxRate = 0.22
): PPMResult {
  const grossReimbursement = (weight / 100) * PCS_RATES_2026.ppmPerCWT;
  const grossProfit = grossReimbursement - expenses;
  const afterTaxProfit = grossProfit > 0 ? grossProfit * (1 - taxRate) : grossProfit;
  const advanceAmount = grossReimbursement * PCS_RATES_2026.ppmAdvancePercent;
  return { grossReimbursement, grossProfit, afterTaxProfit, advanceAmount };
}

/**
 * Weight allowance lookup by rank.
 */
export function getWeightAllowance(rank: string): number {
  return PCS_RATES_2026.weightAllowance[rank] ?? 8000;
}

/**
 * Master calculation: takes all PCS inputs, returns full output.
 */
export function calculatePCS(input: PCSInput): PCSOutput {
  const travelDays = calculateTravelDays(input.distance);
  const dla = calculateDLA(input.rank, input.hasDependents);
  const malt = calculateMALT(input.distance, input.numPOVs);
  const perDiem = calculatePerDiem(travelDays, input.hasDependents, input.numDependents);
  const tle = calculateTLE(input.tleOldDays, input.tleNewDays);
  const weightAllowance = getWeightAllowance(input.rank);

  const govMoveTotal = dla + malt + perDiem.total + tle.total;

  const isPPM = input.moveType !== 'gov';
  const ppmResult = isPPM
    ? calculatePPM(input.hhgWeight, input.ppmExpenses)
    : { grossReimbursement: 0, grossProfit: 0, afterTaxProfit: 0, advanceAmount: 0 };

  return {
    travelDays,
    dla,
    malt,
    perDiemMember: perDiem.memberPerDiem,
    perDiemDependents: perDiem.dependentsPerDiem,
    perDiemTotal: perDiem.total,
    tleTotal: tle.total,
    tleDays: tle.days,
    weightAllowance,
    ppmGrossReimbursement: ppmResult.grossReimbursement,
    ppmGrossProfit: ppmResult.grossProfit,
    ppmAfterTaxProfit: ppmResult.afterTaxProfit,
    ppmAdvanceAmount: ppmResult.advanceAmount,
    govMoveTotal,
    ppmMoveTotal: govMoveTotal + (isPPM ? ppmResult.afterTaxProfit : 0),
  };
}
