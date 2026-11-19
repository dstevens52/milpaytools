/**
 * PCS Cost Estimator — calculation functions
 * All pure functions: no React, no side effects, independently testable.
 *
 * Rules: docs/sources/pcs-rules-2026.md (JTR check, 2026-11-18).
 */

import { PCS_RATES_2026 } from '@/data/pcs/2026/constants';
import { PCS_PER_DIEM_RATE, type ConusPerDiemRate } from '@/data/pcs/conusPerDiem';

const R = PCS_RATES_2026;

export type PCSMoveType = 'gov' | 'full-ppm' | 'partial-ppm';

/** Where TLE is paid: 21 days for a new PDS in CONUS, 7 days for a CONUS → OCONUS move. */
export type TLERoute = 'conus' | 'conus-to-oconus';

export interface PCSInput {
  rank: string;
  hasDependents: boolean;
  /** Dependents traveling with the member, age 12 or older (a spouse counts here). */
  depsAge12Plus: number;
  /** Dependents traveling with the member, under age 12. */
  depsUnder12: number;
  moveType: PCSMoveType;
  distance: number; // authorized DTOD miles
  numPOVs: 1 | 2;
  hhgWeight: number; // lbs being self-moved (for PPM)
  tleOldDays: number;
  tleNewDays: number;
  /** Defaults to 'conus' (21 days). */
  tleRoute?: TLERoute;
}

export interface PCSOutput {
  /** Distance 0: DLA and TLE depend on the move type, so they're not counted as payable. */
  isLocalMove: boolean;
  travelDays: number;
  /** DLA payable on this move (0 for a local move). */
  dla: number;
  /** The grade's DLA rate, shown for reference on a local move. */
  dlaRate: number;
  malt: number;
  /** POVs MALT is paid for (the second needs a dependent traveling). */
  maltPOVs: number;
  perDiemMember: number;
  perDiemDependents: number;
  perDiemTotal: number;
  /** TLE ceiling ("up to") for the capped days, at the standard CONUS rate. */
  tleTotal: number;
  tleDays: number; // capped combined days
  tleMaxDays: number;
  tleDailyRate: number;
  tlePercent: number;
  weightAllowance: number;
  /** DLA + MALT + per diem + TLE ceiling. A PPM incentive is extra and set per move. */
  govMoveTotal: number;
}

/**
 * POV travel days (JTR par. 050205):
 *  - 400 miles or less: 1 day
 *  - more: distance ÷ 350, rounded down, plus 1 day if the remainder is 51 miles or more
 */
export function calculateTravelDays(distance: number): number {
  if (distance <= 0) return 0;
  if (distance <= R.milesOneDayMax) return 1;
  const days = Math.floor(distance / R.milesPerTravelDay);
  return days + (distance % R.milesPerTravelDay >= R.milesRemainderForExtraDay ? 1 : 0);
}

/**
 * DLA lookup by rank and dependency status.
 */
export function calculateDLA(rank: string, hasDependents: boolean): number {
  const table = hasDependents ? R.dla.withDependents : R.dla.withoutDependents;
  return table[rank] ?? 0;
}

/** Dependents traveling with the member (0 when the member has none). */
function travelingDependents(input: Pick<PCSInput, 'hasDependents' | 'depsAge12Plus' | 'depsUnder12'>) {
  if (!input.hasDependents) return { age12Plus: 0, under12: 0 };
  return { age12Plus: Math.max(0, input.depsAge12Plus), under12: Math.max(0, input.depsUnder12) };
}

/**
 * POVs MALT is paid for (JTR 050203, Table 5-1): two at most, and a second POV only when a
 * dependent travels. A member traveling alone gets one.
 */
export function authorizedPOVs(numPOVs: number, dependentsTraveling: number): number {
  if (numPOVs <= 0) return 0;
  if (dependentsTraveling <= 0) return 1;
  return Math.min(numPOVs, R.maltMaxPOVs);
}

/**
 * MALT (mileage allowance): distance × rate/mile × authorized POVs.
 */
export function calculateMALT(distance: number, numPOVs: number, dependentsTraveling = 1): number {
  return distance * R.maltPerMile * authorizedPOVs(numPOVs, dependentsTraveling);
}

export interface PerDiemResult {
  memberPerDiem: number;
  dependentsPerDiem: number;
  total: number;
}

/**
 * En route per diem by POV — MALT Plus (JTR Table 5-4 row 1): the full standard CONUS rate
 * (lodging + M&IE) for each authorized travel day; no 75% day. Each dependent traveling with
 * the member: 75% of the member's rate if 12 or older, 50% if under 12.
 */
export function calculatePerDiem(
  travelDays: number,
  depsAge12Plus: number,
  depsUnder12: number,
  rate: ConusPerDiemRate = PCS_PER_DIEM_RATE,
): PerDiemResult {
  if (travelDays <= 0) return { memberPerDiem: 0, dependentsPerDiem: 0, total: 0 };
  const daily = rate.lodging + rate.mie;
  const memberPerDiem = travelDays * daily;
  const s = R.dependentPerDiemShare;
  const dependentsPerDiem =
    travelDays * daily * (Math.max(0, depsAge12Plus) * s.age12OrOlder + Math.max(0, depsUnder12) * s.under12);
  return { memberPerDiem, dependentsPerDiem, total: memberPerDiem + dependentsPerDiem };
}

/**
 * TLE percentage of the locality lodging + M&IE rate (JTR Table 5-17).
 * One person 65%; member + 1 dependent (or 2 dependents) 100%; each additional dependent
 * +35% if 12 or older, +25% if under 12. The member counts as a person when `memberPresent`.
 * The first dependent alongside the member is taken from the 12-or-older group (a spouse).
 */
export function tlePercent(depsAge12Plus: number, depsUnder12: number, memberPresent = true): number {
  const p = R.tle.percent;
  let older = Math.max(0, depsAge12Plus);
  let younger = Math.max(0, depsUnder12);
  const people = (memberPresent ? 1 : 0) + older + younger;
  if (people <= 0) return 0;
  if (people === 1) return p.onePerson;
  // The first two people make 100%. Remove them, member first, then a 12-or-older dependent.
  let toRemove = 2 - (memberPresent ? 1 : 0);
  while (toRemove > 0) {
    if (older > 0) older -= 1;
    else younger -= 1;
    toRemove -= 1;
  }
  return p.twoPeople + older * p.eachAdditional12OrOlder + younger * p.eachAdditionalUnder12;
}

export interface TLEResult {
  total: number;
  days: number;
  maxDays: number;
  percent: number;
  /** Daily ceiling: lesser of the $290 cap and percent × (lodging + M&IE). */
  dailyRate: number;
}

/**
 * TLE ceiling (JTR par. 050601). Daily amount = lesser of $290 and percent × (locality lodging
 * + locality M&IE); the estimator uses the standard CONUS rate as the locality rate, so the
 * result is an "up to" figure. Days are a total across the old and new locations: 21 for a new
 * PDS in CONUS, 7 for a CONUS → OCONUS move.
 */
export function calculateTLE(
  tleOldDays: number,
  tleNewDays: number,
  depsAge12Plus = 0,
  depsUnder12 = 0,
  route: TLERoute = 'conus',
  rate: ConusPerDiemRate = PCS_PER_DIEM_RATE,
): TLEResult {
  const maxDays = route === 'conus-to-oconus' ? R.tle.maxDaysConusToOconus : R.tle.maxDaysConus;
  const days = Math.min(Math.max(0, tleOldDays) + Math.max(0, tleNewDays), maxDays);
  const percent = tlePercent(depsAge12Plus, depsUnder12);
  const dailyRate = Math.min(R.tle.dailyCap, round2(percent * (rate.lodging + rate.mie)));
  return { total: days * dailyRate, days, maxDays, percent, dailyRate };
}

/**
 * Weight allowance (JTR Table 5-37) by rank and dependency status. Prior-enlisted officers
 * (O-1E–O-3E) use the O-1/O-2/O-3 rows.
 */
export function getWeightAllowance(rank: string, hasDependents: boolean): number {
  const table = hasDependents ? R.weightAllowance.withDependents : R.weightAllowance.withoutDependents;
  const row = R.weightAllowance.rowFor[rank] ?? rank;
  return table[row] ?? 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Master calculation: takes all PCS inputs, returns full output.
 */
export function calculatePCS(input: PCSInput): PCSOutput {
  const deps = travelingDependents(input);
  const depsTraveling = deps.age12Plus + deps.under12;
  const distance = Math.max(0, input.distance);
  const isLocalMove = distance === 0;

  const travelDays = calculateTravelDays(distance);
  const dlaRate = calculateDLA(input.rank, input.hasDependents);
  const dla = isLocalMove ? 0 : dlaRate;
  const maltPOVs = authorizedPOVs(input.numPOVs, depsTraveling);
  const malt = distance * R.maltPerMile * maltPOVs;
  const perDiem = calculatePerDiem(travelDays, deps.age12Plus, deps.under12);
  const tle = calculateTLE(input.tleOldDays, input.tleNewDays, deps.age12Plus, deps.under12, input.tleRoute ?? 'conus');
  const tleTotal = isLocalMove ? 0 : tle.total;
  const weightAllowance = getWeightAllowance(input.rank, input.hasDependents);

  return {
    isLocalMove,
    travelDays,
    dla,
    dlaRate,
    malt,
    maltPOVs,
    perDiemMember: perDiem.memberPerDiem,
    perDiemDependents: perDiem.dependentsPerDiem,
    perDiemTotal: perDiem.total,
    tleTotal,
    tleDays: tle.days,
    tleMaxDays: tle.maxDays,
    tleDailyRate: tle.dailyRate,
    tlePercent: tle.percent,
    weightAllowance,
    govMoveTotal: dla + malt + perDiem.total + tleTotal,
  };
}
