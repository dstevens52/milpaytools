/**
 * Guard/Reserve Pay Calculator — calculation functions
 * All pure functions: no React, no side effects, independently testable.
 */

import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { TRICARE_RATES_2026 } from '@/data/tricare/2026/constants';

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
  totalMilitaryPay: number; // drill + AT + additional — full base for BRS calculation
  memberContrib: number;    // annual $ member contributes
  govAutoContrib: number;   // 1% automatic (applies to all military pay)
  govMatchContrib: number;  // matching contributions (applies to all military pay)
  totalGovContrib: number;
}

export interface GuardReserveOutput {
  // Pay rates
  monthlyBasePay: number;
  dailyRate: number;
  // Drill
  weekendPay: number;
  annualDrillPay: number;
  // AT
  atPay: number;
  // Additional duty
  additionalPay: number;
  // Totals
  totalMilitaryPay: number;
  // TRS
  trsAnnualPremium: number;
  trsCivilianComparable: number;
  trsSavings: number; // civilian cost - TRS premium
  // BRS/TSP
  brs: BRSMatchResult;
  // Summary
  totalValue: number; // military pay + healthcare savings + gov TSP match
  perWeekendValue: number; // total value / weekendsPerYear
  totalHours: number; // per spec: 8 hrs per drill weekend + 8 hrs per AT/additional day
  effectiveHourlyRate: number;
}

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
 * Annual Training pay.
 */
export function calculateATPay(dailyRate: number, atDays: number): number {
  return atDays * dailyRate;
}

/**
 * Additional duty pay.
 */
export function calculateAdditionalPay(dailyRate: number, additionalDays: number): number {
  return additionalDays * dailyRate;
}

/**
 * TRS savings vs civilian health insurance.
 */
export function calculateTRSSavings(plan: TRSPlan): {
  annualPremium: number;
  civilianComparable: number;
  savings: number;
} {
  if (plan === 'none') {
    return { annualPremium: 0, civilianComparable: 0, savings: 0 };
  }
  const monthly =
    plan === 'family'
      ? TRICARE_RATES_2026.reserveSelect.memberAndFamily
      : TRICARE_RATES_2026.reserveSelect.memberOnly;
  const annualPremium = monthly * 12;
  const civilianComparable =
    plan === 'family'
      ? TRICARE_RATES_2026.civilianComparison.familyAnnual
      : TRICARE_RATES_2026.civilianComparison.individualAnnual;
  const savings = civilianComparable - annualPremium;
  return { annualPremium, civilianComparable, savings };
}

/**
 * BRS government TSP match — applies to ALL military pay for Reserve Component members,
 * including IDT drill pay, Annual Training pay, and additional duty pay.
 *
 * Matching structure (same as active component):
 *   - 1% automatic (always, regardless of member contribution)
 *   - Dollar-for-dollar on first 3% of member contribution
 *   - 50 cents per dollar on next 2% (member contribution 4–5%)
 *   - Maximum government contribution: 5% of base pay
 * Note: Vesting of matching contributions requires 2 years of service.
 */
export function calculateBRSMatch(
  totalAnnualMilitaryPay: number,
  tspContribPct: number,
  brsEnrolled: boolean
): BRSMatchResult {
  if (!brsEnrolled || totalAnnualMilitaryPay <= 0) {
    return {
      totalMilitaryPay: totalAnnualMilitaryPay,
      memberContrib: 0,
      govAutoContrib: 0,
      govMatchContrib: 0,
      totalGovContrib: 0,
    };
  }

  const memberPct = Math.min(tspContribPct, 100) / 100;
  const memberContrib = totalAnnualMilitaryPay * memberPct;

  // Government auto: 1% of all military pay
  const govAutoContrib = totalAnnualMilitaryPay * 0.01;

  // Government match on member contributions
  let govMatchContrib = 0;
  // First 3%: dollar for dollar
  govMatchContrib += Math.min(memberPct, 0.03) * totalAnnualMilitaryPay;
  // Next 2% (4–5%): 50 cents per dollar
  if (memberPct > 0.03) {
    govMatchContrib += (Math.min(memberPct, 0.05) - 0.03) * 0.5 * totalAnnualMilitaryPay;
  }

  return {
    totalMilitaryPay: totalAnnualMilitaryPay,
    memberContrib,
    govAutoContrib,
    govMatchContrib,
    totalGovContrib: govAutoContrib + govMatchContrib,
  };
}

/**
 * Master calculation.
 */
export function calculateGuardReserve(input: GuardReserveInput): GuardReserveOutput {
  const monthlyBasePay = lookupBasePay(input.rank, input.yearsOfService);
  const dailyRate = monthlyBasePay / 30;

  const { weekendPay, annualDrillPay } = calculateDrillPay(
    dailyRate,
    input.periodsPerWeekend,
    input.weekendsPerYear
  );
  const atPay = calculateATPay(dailyRate, input.atDays);
  const additionalPay = calculateAdditionalPay(dailyRate, input.additionalDays);
  const totalMilitaryPay = annualDrillPay + atPay + additionalPay;

  const trs = calculateTRSSavings(input.trsPlan);

  const brs = calculateBRSMatch(totalMilitaryPay, input.tspContribPct, input.brsEnrolled);

  const totalValue = totalMilitaryPay + trs.savings + brs.totalGovContrib;

  const perWeekendValue = input.weekendsPerYear > 0 ? totalValue / input.weekendsPerYear : 0;

  // Per spec: 8 hours per drill weekend + 8 hours per AT/additional day
  const totalHours =
    input.weekendsPerYear * 8 + (input.atDays + input.additionalDays) * 8;
  const effectiveHourlyRate = totalHours > 0 ? totalValue / totalHours : 0;

  return {
    monthlyBasePay,
    dailyRate,
    weekendPay,
    annualDrillPay,
    atPay,
    additionalPay,
    totalMilitaryPay,
    trsAnnualPremium: trs.annualPremium,
    trsCivilianComparable: trs.civilianComparable,
    trsSavings: trs.savings,
    brs,
    totalValue,
    perWeekendValue,
    totalHours,
    effectiveHourlyRate,
  };
}
