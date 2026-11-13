/**
 * Guard/Reserve Pay Calculator — calculation functions
 * All pure functions: no React, no side effects, independently testable.
 *
 * Rules (confirmed 2026-11-12, see docs/audits/FIX_QUEUE.md build #4):
 * - BRS: the government contributes 1% of basic OR inactive-duty pay automatically
 *   (from the 60th day of service) and matches on the same pay base from 2 years and
 *   1 day of service — dollar-for-dollar on the first 3%, 50¢ per dollar on the next
 *   2%, capped at 5% (5 U.S.C. § 8440e). Drill pay counts.
 * - Annual Training / short orders: active-duty basic pay plus BAS for each day.
 *   Housing for orders of 30 days or fewer is generally BAH-RC/T (non-locality) and is
 *   not modeled here.
 * - TRICARE Reserve Select is a cost (the member's premium), not part of pay value.
 */

import { lookupBasePay } from '@/lib/calculations/basePay';
import { calcBRSMatch } from '@/lib/calculations/tspGrowth';
import { TRICARE_RATES_2026 } from '@/data/tricare/2026/constants';
import { BAS_RATES } from '@/data/constants';
import { ENLISTED_GRADES } from '@/types/military';

export type TRSPlan = 'none' | 'member' | 'family';

export interface GuardReserveInput {
  rank: string;
  yearsOfService: number;
  weekendsPerYear: number;
  periodsPerWeekend: 4 | 6 | 8; // MUTA-4, MUTA-6, MUTA-8
  atDays: number;
  additionalDays: number;
  trsPlan: TRSPlan;
  brsEnrolled: boolean;
  tspContribPct: number; // 0–100
}

export interface BRSMatchResult {
  /** Basic pay the contributions are based on: drill + AT + additional duty pay. */
  payBase: number;
  memberContrib: number;
  govAutoContrib: number;
  govMatchContrib: number;
  totalGovContrib: number;
  /** false when YOS < 2 — automatic 1% only. */
  matchingEligible: boolean;
  /** false when YOS < 1 — the 60-day point can't be confirmed from whole years. */
  automaticEligible: boolean;
}

export interface GuardReserveOutput {
  // Pay rates
  monthlyBasePay: number;
  dailyRate: number;
  /** false when the 2026 pay table has no rate for this grade at this YOS (e.g. E-9 under 10). */
  payRateAvailable: boolean;
  // Drill
  weekendPay: number;
  annualDrillPay: number;
  /** Drill pay ÷ weekends (no AT, BAS or TSP). */
  drillPayPerWeekend: number;
  // AT + additional duty (active-duty basic pay)
  atPay: number;
  additionalPay: number;
  // BAS for days on orders (AT + additional duty)
  monthlyBAS: number;
  atBAS: number;
  additionalBAS: number;
  // Totals
  /** Drill + AT + additional basic pay (the BRS pay base). */
  totalBasicPay: number;
  /** Basic pay + BAS. */
  totalMilitaryPay: number;
  // TRS — member's premium only; NOT part of any total
  trsAnnualPremium: number;
  trsMonthlyPremium: number;
  // BRS/TSP
  brs: BRSMatchResult;
  // Summary
  /** Military pay (basic + BAS) + government TSP contributions. */
  totalValue: number;
  /** Drill hours (weekends × periods × 4) + 8 per AT/additional day. */
  totalHours: number;
  effectiveHourlyRate: number;
  /** Days entered: 2 per drill weekend + AT + additional. */
  daysCommitted: number;
  /** true when daysCommitted > 365. */
  daysExceedYear: boolean;
}

/** Minimum hours per paid drill period (each drill period is at least 4 hours). */
export const HOURS_PER_DRILL_PERIOD = 4;
/** Hours counted per AT / additional duty day. */
export const HOURS_PER_DUTY_DAY = 8;

/**
 * Daily base pay rate = monthly base pay / 30.
 */
export function calculateDailyRate(rank: string, yearsOfService: number): number {
  const monthly = lookupBasePay(rank, yearsOfService);
  return monthly / 30;
}

/**
 * Annual drill pay.
 */
export function calculateDrillPay(
  dailyRate: number,
  periodsPerWeekend: number,
  weekendsPerYear: number
): { weekendPay: number; annualDrillPay: number } {
  const weekendPay = periodsPerWeekend * dailyRate;
  const annualDrillPay = weekendsPerYear * weekendPay;
  return { weekendPay, annualDrillPay };
}

/**
 * Annual Training basic pay.
 */
export function calculateATPay(dailyRate: number, atDays: number): number {
  return atDays * dailyRate;
}

/**
 * Additional duty basic pay.
 */
export function calculateAdditionalPay(dailyRate: number, additionalDays: number): number {
  return additionalDays * dailyRate;
}

/** Monthly BAS for the grade's category (enlisted vs officer/warrant), 2026 rates. */
export function monthlyBASFor(rank: string): number {
  return (ENLISTED_GRADES as readonly string[]).includes(rank) ? BAS_RATES.enlisted : BAS_RATES.officer;
}

/** BAS for days on orders = days × monthly BAS ÷ 30. */
export function calculateBASForDays(rank: string, days: number): number {
  return (days * monthlyBASFor(rank)) / 30;
}

/**
 * TRICARE Reserve Select — the member's premium for the selected plan (a cost).
 */
export function calculateTRSPremium(plan: TRSPlan): { monthly: number; annual: number } {
  if (plan === 'none') return { monthly: 0, annual: 0 };
  const monthly =
    plan === 'family'
      ? TRICARE_RATES_2026.reserveSelect.memberAndFamily
      : TRICARE_RATES_2026.reserveSelect.memberOnly;
  return { monthly, annual: monthly * 12 };
}

/**
 * BRS government TSP contributions for a Reserve Component member.
 * Pay base = all basic pay earned in a paid status (drill + AT + additional duty).
 * Tier math reuses the shared BRS helper (tspGrowth.calcBRSMatch: 1% automatic,
 * dollar-for-dollar on 3%, 50¢ on the next 2%, capped at 5% of pay).
 * Timing: automatic 1% from 60 days of service (YOS ≥ 1 here); matching from
 * 2 years of service (YOS ≥ 2).
 */
export function calculateBRSMatch(
  payBase: number,
  tspContribPct: number,
  brsEnrolled: boolean,
  yearsOfService: number,
): BRSMatchResult {
  const automaticEligible = yearsOfService >= 1;
  const matchingEligible = yearsOfService >= 2;
  const none = {
    payBase,
    memberContrib: 0,
    govAutoContrib: 0,
    govMatchContrib: 0,
    totalGovContrib: 0,
    matchingEligible,
    automaticEligible,
  };
  if (!brsEnrolled || payBase <= 0) return none;

  const memberPct = Math.min(Math.max(tspContribPct, 0), 100) / 100;
  const memberContrib = payBase * memberPct;
  const tiers = calcBRSMatch(payBase, memberContrib, 'brs');

  const govAutoContrib = automaticEligible ? tiers.auto : 0;
  const govMatchContrib = matchingEligible && automaticEligible ? tiers.total - tiers.auto : 0;

  return {
    payBase,
    memberContrib,
    govAutoContrib,
    govMatchContrib,
    totalGovContrib: govAutoContrib + govMatchContrib,
    matchingEligible,
    automaticEligible,
  };
}

/**
 * Master calculation.
 */
export function calculateGuardReserve(input: GuardReserveInput): GuardReserveOutput {
  const monthlyBasePay = lookupBasePay(input.rank, input.yearsOfService);
  const payRateAvailable = monthlyBasePay > 0;
  const dailyRate = monthlyBasePay / 30;

  const { weekendPay, annualDrillPay } = calculateDrillPay(
    dailyRate,
    input.periodsPerWeekend,
    input.weekendsPerYear
  );
  const drillPayPerWeekend = input.weekendsPerYear > 0 ? annualDrillPay / input.weekendsPerYear : 0;
  const atPay = calculateATPay(dailyRate, input.atDays);
  const additionalPay = calculateAdditionalPay(dailyRate, input.additionalDays);
  const totalBasicPay = annualDrillPay + atPay + additionalPay;

  const monthlyBAS = monthlyBASFor(input.rank);
  const atBAS = payRateAvailable ? calculateBASForDays(input.rank, input.atDays) : 0;
  const additionalBAS = payRateAvailable ? calculateBASForDays(input.rank, input.additionalDays) : 0;
  const totalMilitaryPay = totalBasicPay + atBAS + additionalBAS;

  const trs = calculateTRSPremium(input.trsPlan);

  // BRS contributions are based on all basic pay, drill pay included.
  const brs = calculateBRSMatch(totalBasicPay, input.tspContribPct, input.brsEnrolled, input.yearsOfService);

  const totalValue = totalMilitaryPay + brs.totalGovContrib;

  const totalHours =
    input.weekendsPerYear * input.periodsPerWeekend * HOURS_PER_DRILL_PERIOD +
    (input.atDays + input.additionalDays) * HOURS_PER_DUTY_DAY;
  const effectiveHourlyRate = totalHours > 0 ? totalValue / totalHours : 0;

  const daysCommitted = input.weekendsPerYear * 2 + input.atDays + input.additionalDays;

  return {
    monthlyBasePay,
    dailyRate,
    payRateAvailable,
    weekendPay,
    annualDrillPay,
    drillPayPerWeekend,
    atPay,
    additionalPay,
    monthlyBAS,
    atBAS,
    additionalBAS,
    totalBasicPay,
    totalMilitaryPay,
    trsAnnualPremium: trs.annual,
    trsMonthlyPremium: trs.monthly,
    brs,
    totalValue,
    totalHours,
    effectiveHourlyRate,
    daysCommitted,
    daysExceedYear: daysCommitted > 365,
  };
}
