/**
 * Military Retirement calculation logic.
 *
 * Supports both High-3 (Legacy) and BRS (Blended Retirement System).
 * All base pay amounts come from src/data/pay-tables/2026.ts — no hardcoded values.
 *
 * Pure functions — no React, no side effects.
 *
 * Key formulas:
 *   High-3 pension   = 2.5% × years of service × High-3 average
 *   BRS pension      = 2.0% × years of service × High-3 average
 *   Years of service = whole years + 1/12 for each full month (10 U.S.C. § 1409)
 *   High-3 average   = the highest 36 months of basic pay ÷ 36 (10 U.S.C. § 1407(c)(1)).
 *                      Estimated month by month: for each of the last 36 months of
 *                      service, the pay-table column for the years completed in that
 *                      month, at the retirement grade, from today's (2026) pay table.
 *   TSP (BRS)        = member contributions capped at the elective deferral limit, plus
 *                      the BRS government contribution by service month (./brs:
 *                      automatic 1% from month 3, match from month 25, none after 26 years).
 */

import type { RetirementInput, RetirementOutput, High3PayGroup } from '@/types/calculator';
import { payTable } from '@/data/pay-tables/2026';
import { vaRates } from '@/data/va-rates/2026';
import {
  LEGACY_RETIREMENT_MULTIPLIER,
  BRS_RETIREMENT_MULTIPLIER,
  EMPLOYEE_FICA_RATE,
} from '@/data/constants';
import { lookupBasePay } from '@/lib/calculations/basePay';
import { tspMonthContribution } from '@/lib/calculations/tspGrowth';
import { estimateMarginalRate, getYOSBracket } from '@/lib/utils';

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

/** Clamp a months value to a whole number of months, 0–11. */
function clampMonths(months: number | undefined): number {
  if (months === undefined || !Number.isFinite(months)) return 0;
  return Math.min(11, Math.max(0, Math.floor(months)));
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

type GradeTable = Record<number, number | undefined>;

function gradeTableFor(grade: string): GradeTable | undefined {
  return payTable[grade as keyof typeof payTable] as GradeTable | undefined;
}

/** Published pay-table column keys for a grade, ascending (e.g. W-5 → [20, 22, …]). */
function publishedColumns(table: GradeTable | undefined): number[] {
  if (!table) return [];
  return Object.keys(table)
    .map(Number)
    .filter((k) => typeof table[k] === 'number')
    .sort((a, b) => a - b);
}

/** DFAS column label: key 0 is "2 or less"; key N is "Over N". */
function columnLabel(key: number): string {
  return key === 0 ? '2 or less' : `Over ${key}`;
}

// ─── Core Calculation Functions ───────────────────────────────────────────────

/**
 * High-3 average base pay: the highest 36 months of basic pay ÷ 36
 * (10 U.S.C. § 1407(c)(1)), estimated month by month.
 *
 * Total months of service T = years × 12 + months. For each of the last 36 months
 * k = T−35 … T, completed years in that month = floor((k−1) / 12), and the pay is the
 * retirement grade's pay-table column for those completed years. Example: retiring at
 * exactly 20 years, the last 36 months are years 18, 19 and 20 of service, paid at the
 * Over 16, Over 18 and Over 18 columns.
 *
 * Assumptions (disclosed in the UI): every month uses today's (2026) pay table and the
 * retirement grade. Real High-3 uses the pay actually received, which is lower by the
 * raises since then, and the grade actually held.
 *
 * Grades with no published column at that many years (W-5, O-9 and O-10 below 20;
 * E-9 below 10): the grade's first published column is used for those months and
 * `usedFirstPublishedColumn` is set, so no month counts as $0. The shared lookupBasePay
 * is not changed (other calculators rely on its $0 for "no rate").
 *
 * `breakdown` groups consecutive months paid at the same column.
 */
export function calculateHigh3Average(
  retirementGrade: string,
  retirementYOS: number,
  retirementMonths: number = 0,
): { average: number; breakdown: High3PayGroup[]; usedFirstPublishedColumn: boolean } {
  const totalMonths = Math.max(0, Math.floor(retirementYOS)) * 12 + clampMonths(retirementMonths);
  const table = gradeTableFor(retirementGrade);
  const columns = publishedColumns(table);
  const firstKey = columns.length > 0 ? columns[0] : null;

  const breakdown: High3PayGroup[] = [];
  let sum = 0;
  let usedFirstPublishedColumn = false;

  for (let k = totalMonths - 35; k <= totalMonths; k++) {
    const completedYears = Math.max(0, Math.floor((k - 1) / 12));
    let pay = lookupBasePay(retirementGrade, completedYears);
    const bracket = getYOSBracket(completedYears);
    let key: number | null = null;
    for (const c of columns) if (c <= bracket) key = c;
    let substituted = false;

    if (pay === 0 && firstKey !== null && table) {
      pay = table[firstKey] ?? 0;
      key = firstKey;
      substituted = true;
      usedFirstPublishedColumn = true;
    }

    sum += pay;
    const label = key === null ? 'No published rate' : columnLabel(key);
    const last = breakdown[breakdown.length - 1];
    if (last && last.column === label && last.firstPublishedColumn === substituted) {
      last.months += 1;
    } else {
      breakdown.push({ column: label, months: 1, monthlyPay: pay, firstPublishedColumn: substituted });
    }
  }

  return { average: sum / 36, breakdown, usedFirstPublishedColumn };
}

/**
 * Calculate monthly pension: multiplier × (years + months/12) × High-3 average.
 * Each full month of service counts as 1/12 of a year (10 U.S.C. § 1409).
 * REDUX (Career Status Bonus takers with under 30 years) is not modeled.
 */
export function calculatePension(
  system: 'high3' | 'brs',
  yearsOfService: number,
  high3Average: number,
  months: number = 0,
): number {
  const multiplier =
    system === 'brs' ? BRS_RETIREMENT_MULTIPLIER : LEGACY_RETIREMENT_MULTIPLIER;
  return multiplier * (yearsOfService + clampMonths(months) / 12) * high3Average;
}

/**
 * Project the TSP balance at retirement via compound monthly growth (BRS).
 *
 * Each month runs through tspGrowth.tspMonthContribution, the same step the TSP
 * projector uses:
 *   - member contribution = contributionPct of base pay, capped at the annual elective
 *     deferral limit (TSP_CONSTANTS_2026.electiveDeferralLimit), reset every 12 months
 *   - government contribution by service month (./brs): automatic 1% from month 3,
 *     match from month 25, none after 26 years of service
 *
 * Pay is held flat at the current grade and years of service for the whole projection
 * (disclosed in the UI).
 */
export function calculateTSPGrowth(params: {
  currentBalance: number;
  basePayMonthly: number;
  contributionPct: number; // 0–100
  monthsToRetire: number;
  currentYOS: number;
  annualReturnPct: number;
}): { balance: number; memberCapped: boolean } {
  const monthlyRate = params.annualReturnPct / 100 / 12;
  const totalMonths = Math.max(0, Math.round(params.monthsToRetire));
  const desiredMember = (params.basePayMonthly * params.contributionPct) / 100;
  const serviceMonthOffset = Math.floor(Math.max(0, params.currentYOS)) * 12;

  let balance = params.currentBalance;
  let memberYTD = 0;
  let memberCapped = false;

  for (let m = 1; m <= totalMonths; m++) {
    if (m > 1 && (m - 1) % 12 === 0) memberYTD = 0;
    const step = tspMonthContribution({
      basePayMonthly: params.basePayMonthly,
      desiredMemberMonthly: desiredMember,
      memberYTD,
      serviceMonth: serviceMonthOffset + m,
      isBRS: true,
    });
    if (step.hitLimit) memberCapped = true;
    memberYTD += step.member;
    balance = balance * (1 + monthlyRate) + step.member + step.gov.total;
  }

  return { balance, memberCapped };
}

/**
 * Nominal lifetime pension stream with COLA: Σ monthly × 12 × (1+COLA)^t.
 * A fractional final year (from months of service) counts pro rata.
 * We use nominal sum (no discounting) since this is a "wow" number for motivation.
 */
export function calculateLifetimeValue(
  monthlyPension: number,
  yearsOfCollection: number,
  annualCOLA: number = ANNUAL_COLA
): number {
  const years = Math.max(0, yearsOfCollection);
  const wholeYears = Math.floor(years);
  const fraction = years - wholeYears;
  let total = 0;
  for (let t = 0; t < wholeYears; t++) {
    total += monthlyPension * 12 * Math.pow(1 + annualCOLA, t);
  }
  if (fraction > 1e-9) {
    total += monthlyPension * 12 * fraction * Math.pow(1 + annualCOLA, wholeYears);
  }
  return total;
}

/**
 * Civilian wages needed to match retired pay plus VA compensation — federal only,
 * single filer.
 *
 * t = the marginal federal rate (single filer, estimateMarginalRate) at the combined
 * annual amount; FICA = the employee rate (EMPLOYEE_FICA_RATE).
 *
 * Retired pay owes federal income tax only (IRS Pub. 525: military retirement pay is
 * taxable as a pension; it is not FICA wages), so it nets retired pay × (1 − t). Wages
 * owe income tax and FICA on the same gross, netting wages × (1 − t − FICA). Matching
 * the retired pay therefore takes retired pay × (1 − t) ÷ (1 − t − FICA).
 * VA compensation owes neither (IRS Pub. 525: not included in income), so it nets in
 * full and a civilian needs VA ÷ (1 − t − FICA) in wages to match it.
 */
export function calculateCivilianEquivalent(
  taxableRetiredPayMonthly: number,
  vaMonthly: number,
): { annual: number; marginalRate: number } {
  const retiredAnnual = taxableRetiredPayMonthly * 12;
  const vaAnnual = vaMonthly * 12;
  const marginalRate = estimateMarginalRate(retiredAnnual + vaAnnual);
  const wageNetShare = 1 - marginalRate - EMPLOYEE_FICA_RATE;
  const annual =
    (retiredAnnual * (1 - marginalRate)) / wageNetShare +
    vaAnnual / wageNetShare;
  return { annual, marginalRate };
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
  const retirementMonths = clampMonths(input.retirementMonths);
  const serviceYears = retirementYOS + retirementMonths / 12;

  // High-3 average base pay (month by month over the last 36 months)
  const {
    average: high3Average,
    breakdown: high3Breakdown,
    usedFirstPublishedColumn: high3UsedFirstPublishedColumn,
  } = calculateHigh3Average(retirementGrade, retirementYOS, retirementMonths);

  // Monthly pension
  const monthlyPension = calculatePension(retirementSystem, retirementYOS, high3Average, retirementMonths);
  const annualPension = monthlyPension * 12;

  // Pension multiplier as a percentage (e.g., 50 for 20 × 2.5%; 51.25 for 20y6m)
  const multiplierRate =
    retirementSystem === 'brs' ? BRS_RETIREMENT_MULTIPLIER : LEGACY_RETIREMENT_MULTIPLIER;
  const pensionMultiplierPct = multiplierRate * serviceYears * 100;

  // High-3 equivalent (for BRS comparison)
  const high3MonthlyPension = calculatePension('high3', retirementYOS, high3Average, retirementMonths);

  // Retirement age (whole years, for display) / lifetime value (months count pro rata)
  const estimatedRetirementAge = estimateRetirementAge(retirementGrade, retirementYOS);
  const yearsOfCollection = Math.max(
    0,
    LIFE_EXPECTANCY - estimatedRetirementAge - retirementMonths / 12,
  );
  const lifetimeValue = calculateLifetimeValue(monthlyPension, yearsOfCollection);

  // TSP (BRS only). Pay is held flat at the current grade and years of service.
  let tspProjectedBalance = 0;
  let tspMonthlyIncome = 0;
  let tspPayUnavailable = false;
  let tspMemberCapped = false;

  if (retirementSystem === 'brs') {
    const basePayForContribs = lookupBasePay(currentGrade, currentYOS);
    // No published rate for this grade at this YOS (e.g. E-9 under 10): contributions
    // can't be estimated — the UI says so instead of showing a silent $0 projection.
    tspPayUnavailable = basePayForContribs <= 0;
    const monthsToRetire = Math.max(0, (retirementYOS - currentYOS) * 12 + retirementMonths);

    const tsp = calculateTSPGrowth({
      currentBalance: tspCurrentBalance,
      basePayMonthly: basePayForContribs,
      contributionPct: tspContributionPct,
      monthsToRetire,
      currentYOS,
      annualReturnPct: tspAnnualReturnPct,
    });
    tspProjectedBalance = tsp.balance;
    tspMemberCapped = tsp.memberCapped;
    tspMonthlyIncome = (tspProjectedBalance * TSP_SWR) / 12;
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

  // VA waiver (10 U.S.C. § 1414(a)): without CRDP, retired pay is reduced dollar-for-dollar
  // by the VA award. Total retired pay + VA becomes max(pension, VA); the VA part is excluded
  // from federal taxable income. With CRDP (50%+ and 20+ years) both are paid in full.
  const waiverApplied = monthlyVA > 0 && !crdpEligible;
  const taxableRetiredPay = waiverApplied
    ? Math.max(monthlyPension - monthlyVA, 0)
    : monthlyPension;
  // Every VA dollar received is excluded from taxable income. When pension >= VA (every case
  // the UI can reach), this equals min(VA, pension). It stays the full VA amount if VA ever
  // exceeds the pension, so taxableRetiredPay + vaTaxFree always equals max(pension, VA).
  const vaTaxFree = monthlyVA;

  // Total monthly income — TSP income (BRS) is not retired pay, so the waiver never touches it
  const tspIncomeForTotal = retirementSystem === 'brs' ? tspMonthlyIncome : 0;
  const totalMonthlyIncome = tspIncomeForTotal + taxableRetiredPay + vaTaxFree;

  // Civilian equivalent of retired pay + VA (federal only, single filer; TSP not included)
  const civilian = calculateCivilianEquivalent(taxableRetiredPay, vaTaxFree);
  const civilianEquivalent = civilian.annual;
  const civilianMarginalRatePct = civilian.marginalRate * 100;

  // Stay vs. Go — the vesting point is 20 years 0 months by definition, so months
  // entered for the planned retirement don't apply here.
  const yearsFromVesting = Math.max(0, 20 - currentYOS);
  const { average: high3At20 } = calculateHigh3Average(retirementGrade, 20, 0);
  const pensionAt20 = calculatePension(retirementSystem, 20, high3At20, 0);
  const retirementAgeAt20 = estimateRetirementAge(retirementGrade, 20);
  const collectYearsAt20 = Math.max(0, LIFE_EXPECTANCY - retirementAgeAt20);
  const lifetimeValueOfStaying =
    currentYOS < 20 ? calculateLifetimeValue(pensionAt20, collectYearsAt20) : 0;

  // Marginal value per additional year of service, at this High-3 average
  const marginalYearValue = multiplierRate * high3Average;

  return {
    retirementMonths,
    high3Average,
    high3Breakdown,
    high3UsedFirstPublishedColumn,
    pensionMultiplierPct,
    monthlyPension,
    annualPension,
    estimatedRetirementAge,
    yearsOfCollection,
    lifetimeValue,
    tspProjectedBalance,
    tspMonthlyIncome,
    totalBRSMonthlyIncome,
    tspPayUnavailable,
    tspMemberCapped,
    monthlyVA,
    totalMonthlyIncome,
    crdpEligible,
    waiverApplied,
    taxableRetiredPay,
    vaTaxFree,
    civilianEquivalent,
    civilianMarginalRatePct,
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
