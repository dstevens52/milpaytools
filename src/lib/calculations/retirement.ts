/**
 * Military Retirement calculation logic.
 *
 * Supports both High-3 (Legacy) and BRS (Blended Retirement System).
 * All base pay amounts come from src/data/pay-tables/2026.ts — no hardcoded values.
 *
 * Pure functions — no React, no side effects.
 *
 * Key formulas:
 *   High-3 pension = 2.5% × YOS × High-3 average base pay
 *   BRS pension    = 2.0% × YOS × High-3 average base pay
 *   High-3 average = average of base pay at retirement YOS, YOS-1, YOS-2
 *   TSP match      = 1% auto + dollar-for-dollar up to 3% + 50¢ per $ on next 2%
 *                    (matching begins at month 25 — beginning of year 3)
 */

import type { RetirementInput, RetirementOutput } from '@/types/calculator';
import { payTable } from '@/data/pay-tables/2026';
import { vaRates } from '@/data/va-rates/2026';
import { LEGACY_RETIREMENT_MULTIPLIER, BRS_RETIREMENT_MULTIPLIER } from '@/data/constants';
import { lookupBasePay } from '@/lib/calculations/total-compensation';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Average life expectancy used for lifetime pension calculations */
export const LIFE_EXPECTANCY = 78;

/** Historical average annual COLA for military retired pay */
export const ANNUAL_COLA_PCT = 2.5; // display value: 2.5%
const ANNUAL_COLA = ANNUAL_COLA_PCT / 100;

/** Safe withdrawal rate for TSP income estimate */
export const TSP_SWR_PCT = 4; // display value: 4%
const TSP_SWR = TSP_SWR_PCT / 100;

/**
 * Average enlisted entry age (~18-20) and officer entry age (~22-24).
 * Used to estimate retirement age from years of service.
 */
const ENLISTED_ENTRY_AGE = 19;
const OFFICER_ENTRY_AGE = 23;
const WARRANT_ENTRY_AGE = 22;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Return true if grade is enlisted (E-1 through E-9).
 */
function isEnlisted(grade: string): boolean {
  return grade.startsWith('E-');
}

function isWarrant(grade: string): boolean {
  return grade.startsWith('W-');
}

/**
 * Estimate the member's age at a given YOS based on grade category.
 */
function estimateRetirementAge(retirementGrade: string, retirementYOS: number): number {
  const entryAge = isEnlisted(retirementGrade)
    ? ENLISTED_ENTRY_AGE
    : isWarrant(retirementGrade)
    ? WARRANT_ENTRY_AGE
    : OFFICER_ENTRY_AGE;
  return entryAge + retirementYOS;
}

// ─── Core Calculation Functions ───────────────────────────────────────────────

/**
 * Calculate the High-3 average base pay.
 * Uses base pay at retirement YOS, YOS-1, and YOS-2 for the retirement grade.
 * All three values come from the 2026 pay table.
 */
export function calculateHigh3Average(
  retirementGrade: string,
  retirementYOS: number
): { average: number; breakdown: [number, number, number] } {
  const pay0 = lookupBasePay(retirementGrade, retirementYOS);
  const pay1 = lookupBasePay(retirementGrade, Math.max(0, retirementYOS - 1));
  const pay2 = lookupBasePay(retirementGrade, Math.max(0, retirementYOS - 2));
  const average = (pay0 + pay1 + pay2) / 3;
  return { average, breakdown: [pay0, pay1, pay2] };
}

/**
 * Calculate monthly pension.
 */
export function calculatePension(
  system: 'high3' | 'brs',
  yearsOfService: number,
  high3Average: number
): number {
  const multiplier =
    system === 'brs' ? BRS_RETIREMENT_MULTIPLIER : LEGACY_RETIREMENT_MULTIPLIER;
  return multiplier * yearsOfService * high3Average;
}

/**
 * Calculate BRS TSP agency contributions.
 * - 1% automatic (starts day 1)
 * - Dollar-for-dollar match on first 3% of member contribution
 * - 50 cents per dollar on next 2% of member contribution
 * - Matching (above the 1% auto) begins at month 25 (start of year 3)
 *
 * Returns monthly total government contribution at full matching.
 */
export function calculateTSPAgencyMonthly(
  monthlyBasePay: number,
  memberContributionPct: number // 0–100
): number {
  const memberPct = memberContributionPct / 100;
  const auto = monthlyBasePay * 0.01;
  const matchable1 = Math.min(memberPct, 0.03);
  const matchable2 = Math.max(0, Math.min(memberPct - 0.03, 0.02));
  const match = monthlyBasePay * matchable1 + monthlyBasePay * matchable2 * 0.5;
  return auto + match;
}

/**
 * Project TSP balance at retirement via compound monthly growth.
 * Accounts for:
 *   - Existing current balance
 *   - Member monthly contribution
 *   - Government monthly contribution
 *   - BRS matching begins at month 25 (member's 3rd year of service)
 *
 * @param currentBalance  Current TSP balance in dollars
 * @param memberMonthly   Member's monthly contribution (dollars)
 * @param govMonthly      Government monthly contribution (at full match, dollars)
 * @param autoMonthly     1% auto contribution (always present for BRS members)
 * @param yearsToRetire   Remaining years until retirement
 * @param currentYOS      Current years of service (to determine matching start)
 * @param annualReturnPct Expected annual return (e.g., 7)
 */
export function calculateTSPGrowth(
  currentBalance: number,
  memberMonthly: number,
  govMonthly: number,
  autoMonthly: number,
  yearsToRetire: number,
  currentYOS: number,
  annualReturnPct: number
): number {
  const monthlyRate = annualReturnPct / 100 / 12;
  const totalMonths = Math.round(yearsToRetire * 12);

  // Months until matching kicks in (month 25 = start of year 3).
  // If currentYOS >= 2, matching is already active.
  const matchingStartMonth = currentYOS >= 2 ? 0 : Math.max(0, 25 - currentYOS * 12);

  let balance = currentBalance;

  for (let m = 1; m <= totalMonths; m++) {
    // Before matching starts, only auto 1% + member contribution.
    // matchingStartMonth is months-into-projection when matching activates;
    // use >= so matching begins ON that month, not the month after.
    const govContrib = m >= matchingStartMonth ? govMonthly : autoMonthly;
    const monthContrib = memberMonthly + govContrib;
    balance = balance * (1 + monthlyRate) + monthContrib;
  }

  return balance;
}

/**
 * Calculate the present-value-ish lifetime pension stream.
 * Uses a simple future cash flow sum with COLA: total = Σ monthly × 12 × (1+COLA)^t
 * We use nominal sum (no discounting) since this is a "wow" number for motivation.
 */
export function calculateLifetimeValue(
  monthlyPension: number,
  yearsOfCollection: number,
  annualCOLA: number = ANNUAL_COLA
): number {
  let total = 0;
  for (let t = 0; t < yearsOfCollection; t++) {
    total += monthlyPension * 12 * Math.pow(1 + annualCOLA, t);
  }
  return total;
}

/**
 * Estimate civilian gross salary needed to replace a given monthly retirement income.
 * - Pension is federally taxable (partially); simplification: treat as ordinary income
 * - VA disability is 100% tax-free
 * - Use a 22% effective federal rate as a rough civilian tax estimate
 */
export function calculateCivilianEquivalent(
  monthlyPension: number,
  monthlyVA: number,
  stateTaxesMilRetirement: boolean
): number {
  const annualPension = monthlyPension * 12;
  const annualVA = monthlyVA * 12;
  const totalAfterTax = annualPension + annualVA; // simplified: pension is "net"

  // Civilian would pay ~22% federal + state on gross income
  const effectiveTaxRate = stateTaxesMilRetirement ? 0.28 : 0.22;
  const grossCivilianNeeded = totalAfterTax / (1 - effectiveTaxRate);

  return grossCivilianNeeded;
}

// ─── Main Calculation ─────────────────────────────────────────────────────────

export function calculateRetirement(input: RetirementInput): RetirementOutput {
  const {
    retirementSystem,
    currentGrade,
    currentYOS,
    retirementYOS,
    retirementGrade,
    tspContributionPct,
    tspCurrentBalance,
    tspAnnualReturnPct,
    vaRating,
  } = input;

  // High-3 average base pay
  const { average: high3Average, breakdown: high3Breakdown } = calculateHigh3Average(
    retirementGrade,
    retirementYOS
  );

  // Monthly pension
  const monthlyPension = calculatePension(retirementSystem, retirementYOS, high3Average);
  const annualPension = monthlyPension * 12;

  // Pension multiplier as a percentage (e.g., 50 for 20×2.5%)
  const multiplierRate =
    retirementSystem === 'brs' ? BRS_RETIREMENT_MULTIPLIER : LEGACY_RETIREMENT_MULTIPLIER;
  const pensionMultiplierPct = multiplierRate * retirementYOS * 100;

  // High-3 equivalent (for BRS comparison)
  const high3MonthlyPension = calculatePension('high3', retirementYOS, high3Average);

  // Retirement age / lifetime value
  const estimatedRetirementAge = estimateRetirementAge(retirementGrade, retirementYOS);
  const yearsOfCollection = Math.max(0, LIFE_EXPECTANCY - estimatedRetirementAge);
  const lifetimeValue = calculateLifetimeValue(monthlyPension, yearsOfCollection);

  // TSP (BRS only)
  let tspProjectedBalance = 0;
  let tspMonthlyIncome = 0;

  if (retirementSystem === 'brs') {
    const retirementBasePayAtCurrentGrade = lookupBasePay(retirementGrade, retirementYOS);
    // Use retirement grade base pay for projection (most conservative/accurate)
    // For projection, approximate monthly base pay as average during accumulation
    const avgBasePayForContribs = lookupBasePay(currentGrade, currentYOS);

    const memberMonthly = (avgBasePayForContribs * tspContributionPct) / 100;
    const govMonthly = calculateTSPAgencyMonthly(avgBasePayForContribs, tspContributionPct);
    const autoMonthly = avgBasePayForContribs * 0.01;

    // Clamp: can't contribute more than remaining years to retirement
    const yearsToRetire = Math.max(0, retirementYOS - currentYOS);

    tspProjectedBalance = calculateTSPGrowth(
      tspCurrentBalance,
      memberMonthly,
      govMonthly,
      autoMonthly,
      yearsToRetire,
      currentYOS,
      tspAnnualReturnPct
    );

    tspMonthlyIncome = (tspProjectedBalance * TSP_SWR) / 12;

    // Suppress unused variable warning
    void retirementBasePayAtCurrentGrade;
  }

  const totalBRSMonthlyIncome =
    retirementSystem === 'brs' ? monthlyPension + tspMonthlyIncome : monthlyPension;

  // VA disability
  let monthlyVA = 0;
  if (vaRating > 0 && vaRates[vaRating]) {
    monthlyVA = vaRates[vaRating].veteranAlone;
  }

  // CRDP: eligible if 20+ years service AND VA rating >= 50%
  const crdpEligible = retirementYOS >= 20 && vaRating >= 50;

  // Total monthly income
  const totalMonthlyIncome =
    (retirementSystem === 'brs' ? totalBRSMonthlyIncome : monthlyPension) + monthlyVA;

  // Civilian equivalent (assume state doesn't tax military retirement by default)
  const civilianEquivalent = calculateCivilianEquivalent(monthlyPension, monthlyVA, false);

  // Stay vs. Go
  const yearsFromVesting = Math.max(0, 20 - currentYOS);
  // Lifetime value of vesting: what pension they'd earn by staying to 20
  const { average: high3At20 } = calculateHigh3Average(retirementGrade, 20);
  const pensionAt20 = calculatePension(retirementSystem, 20, high3At20);
  const retirementAgeAt20 = estimateRetirementAge(retirementGrade, 20);
  const collectYearsAt20 = Math.max(0, LIFE_EXPECTANCY - retirementAgeAt20);
  const lifetimeValueOfStaying =
    currentYOS < 20 ? calculateLifetimeValue(pensionAt20, collectYearsAt20) : 0;

  // Marginal value per additional year after vesting
  const marginalYearValue = multiplierRate * high3Average;

  return {
    high3Average,
    high3Breakdown,
    pensionMultiplierPct,
    monthlyPension,
    annualPension,
    estimatedRetirementAge,
    yearsOfCollection,
    lifetimeValue,
    tspProjectedBalance,
    tspMonthlyIncome,
    totalBRSMonthlyIncome,
    monthlyVA,
    totalMonthlyIncome,
    crdpEligible,
    civilianEquivalent,
    yearsFromVesting,
    lifetimeValueOfStaying,
    marginalYearValue,
    high3MonthlyPension,
  };
}

/**
 * Build COLA-adjusted pension chart data for Recharts.
 * Returns an array of data points from retirement age to life expectancy + 10.
 * Optional high3Pension allows rendering a comparison series in the same chart.
 */
export function buildPensionChartData(
  monthlyPension: number,
  retirementAge: number,
  tspMonthlyIncome: number = 0,
  high3Pension: number = 0
): Array<{ age: number; pension: number; tsp: number; total: number; high3?: number }> {
  const data: Array<{ age: number; pension: number; tsp: number; total: number; high3?: number }> = [];
  for (let age = retirementAge; age <= LIFE_EXPECTANCY + 10; age++) {
    const yearsIn = age - retirementAge;
    const pension = monthlyPension * Math.pow(1 + ANNUAL_COLA, yearsIn);
    // TSP income shown flat (4% withdrawal; in reality would vary with market)
    const tsp = tspMonthlyIncome;
    const entry: { age: number; pension: number; tsp: number; total: number; high3?: number } = {
      age,
      pension: Math.round(pension),
      tsp: Math.round(tsp),
      total: Math.round(pension + tsp),
    };
    if (high3Pension > 0) {
      entry.high3 = Math.round(high3Pension * Math.pow(1 + ANNUAL_COLA, yearsIn));
    }
    data.push(entry);
  }
  return data;
}
