/**
 * TSP Growth Projection — pure calculation functions.
 * No React, no side effects.
 *
 * Algorithm: month-by-month compound growth with annual contribution
 * increases and BRS matching. Returns year-by-year snapshots for charting.
 */

import { TSP_CONSTANTS_2026, type FundKey } from '@/data/tsp/2026/constants';
import { payTable } from '@/data/pay-tables/2026';
import { getYOSBracket } from '@/lib/utils';
import type { PayGrade } from '@/types/military';

const { brsMatchingTiers } = TSP_CONSTANTS_2026;

// ─── Input / Output Types ──────────────────────────────────────────────────

export interface FundAllocation {
  G: number; // 0–100
  F: number;
  C: number;
  S: number;
  I: number;
}

export interface FundReturns {
  G: number; // decimal (e.g. 0.04)
  F: number;
  C: number;
  S: number;
  I: number;
}

export type RetirementSystem = 'brs' | 'legacy' | 'unknown';

export interface TSPProjectionInput {
  startingBalance: number;
  monthlyContribution: number;    // member's own contribution
  retirementSystem: RetirementSystem;
  payGrade: PayGrade;
  yearsOfService: number;
  allocation: FundAllocation;     // must sum to 100
  customReturns?: Partial<FundReturns>; // overrides for advanced mode
  yearsToProject: number;         // total years until target retirement
  annualPayRaisePct: number;      // e.g. 3.5 for 3.5%
}

export interface YearSnapshot {
  year: number;
  totalBalance: number;
  memberContributionsTotal: number;
  govContributionsTotal: number;
  investmentGrowthTotal: number;
  annualMemberContrib: number;    // that calendar year
  annualGovContrib: number;
}

export interface TSPProjectionResult {
  snapshots: YearSnapshot[];          // year 0 (start) through year N
  finalBalance: number;
  totalMemberContributions: number;
  totalGovContributions: number;      // 0 for legacy / unknown
  totalInvestmentGrowth: number;
  monthlyRetirementIncome4pct: number; // 4% SWR ÷ 12
  blendedAnnualReturn: number;        // weighted average return rate
  monthlyGovContribution: number;     // initial month BRS match (for display)
  isMaxContribLimit: boolean;         // hit annual deferral limit
}

// ─── Core Math Helpers ─────────────────────────────────────────────────────

/**
 * Calculate blended annual return from fund allocation and per-fund returns.
 */
export function blendedReturn(allocation: FundAllocation, returns: FundReturns): number {
  const funds: FundKey[] = ['G', 'F', 'C', 'S', 'I'];
  return funds.reduce((acc, f) => acc + (allocation[f] / 100) * returns[f], 0);
}

/**
 * Calculate monthly BRS government contribution.
 * Returns { auto, match, total } — all monthly dollar amounts.
 *
 * BRS matching begins at start of member's 25th month of service.
 * The matching is only applied when retirementSystem === 'brs'.
 */
export function calcBRSMatch(
  basePayMonthly: number,
  memberMonthlyContrib: number,
  retirementSystem: RetirementSystem
): { auto: number; match: number; total: number } {
  if (retirementSystem !== 'brs') return { auto: 0, match: 0, total: 0 };

  const auto = basePayMonthly * brsMatchingTiers.auto;
  const contribPct = basePayMonthly > 0 ? memberMonthlyContrib / basePayMonthly : 0;

  let match = 0;
  if (contribPct >= 0.05) {
    match = basePayMonthly * 0.04; // full: 3% + 1% (50¢ × 2%)
  } else if (contribPct >= 0.03) {
    match = basePayMonthly * 0.03 + basePayMonthly * (contribPct - 0.03) * 0.5;
  } else if (contribPct > 0) {
    match = basePayMonthly * contribPct; // dollar-for-dollar up to 3%
  }

  const total = Math.min(auto + match, basePayMonthly * brsMatchingTiers.maxGovernment);
  return { auto, match, total };
}

/**
 * Get monthly base pay from pay table for a given grade and YOS.
 */
export function getBasePayMonthly(payGrade: PayGrade, yearsOfService: number): number {
  const gradeTable = payTable[payGrade];
  if (!gradeTable) return 0;
  const bracket = getYOSBracket(yearsOfService);
  const keys = Object.keys(gradeTable)
    .map(Number)
    .sort((a, b) => a - b);
  // Find highest key ≤ bracket
  const key = [...keys].reverse().find((k) => k <= bracket) ?? keys[0];
  return gradeTable[key as keyof typeof gradeTable] ?? 0;
}

// ─── Main Projection ───────────────────────────────────────────────────────

/**
 * Project TSP growth month-by-month over the given horizon.
 * Returns annual snapshots suitable for charting.
 */
export function projectTSP(input: TSPProjectionInput): TSPProjectionResult {
  const {
    startingBalance,
    retirementSystem,
    payGrade,
    yearsOfService,
    allocation,
    yearsToProject,
    annualPayRaisePct,
  } = input;

  // Merge custom returns with defaults
  const effectiveReturns: FundReturns = {
    ...TSP_CONSTANTS_2026.defaultFundReturns,
    ...input.customReturns,
  };

  const annualReturn = blendedReturn(allocation, effectiveReturns);
  // Use r/12 monthly rate (matches TSP.gov calculator convention and
  // produces the standard FV-of-annuity result expected by most users).
  const monthlyReturn = annualReturn / 12;

  // Starting pay and BRS match
  const initialBasePay = getBasePayMonthly(payGrade, yearsOfService);
  const initialBRS = calcBRSMatch(initialBasePay, input.monthlyContribution, retirementSystem);

  const limit = TSP_CONSTANTS_2026.electiveDeferralLimit;

  // Mutable state
  let balance = startingBalance;
  let memberContrib = input.monthlyContribution;
  let basePay = initialBasePay;
  let cumMember = 0;
  let cumGov = 0;
  let cumGrowth = 0;
  let annualMemberYTD = 0;
  let annualGovYTD = 0;
  let hitLimit = false;

  const snapshots: YearSnapshot[] = [
    {
      year: 0,
      totalBalance: startingBalance,
      memberContributionsTotal: 0,
      govContributionsTotal: 0,
      investmentGrowthTotal: 0,
      annualMemberContrib: 0,
      annualGovContrib: 0,
    },
  ];

  const totalMonths = yearsToProject * 12;
  const raiseMultiplier = 1 + annualPayRaisePct / 100;

  for (let month = 1; month <= totalMonths; month++) {
    // Annual raise at the start of each new year (after year 1)
    if (month > 1 && (month - 1) % 12 === 0) {
      memberContrib *= raiseMultiplier;
      basePay *= raiseMultiplier;
      annualMemberYTD = 0;
      annualGovYTD = 0;
    }

    // Enforce annual deferral limit
    const remainingLimit = Math.max(0, limit - annualMemberYTD);
    const actualMemberContrib = Math.min(memberContrib, remainingLimit);
    if (actualMemberContrib < memberContrib) hitLimit = true;

    // BRS government contribution (not subject to elective deferral limit)
    const brs = calcBRSMatch(basePay, actualMemberContrib, retirementSystem);

    // Apply growth first, then contributions
    const growthThisMonth = balance * monthlyReturn;
    balance += growthThisMonth;
    balance += actualMemberContrib;
    balance += brs.total;

    cumMember += actualMemberContrib;
    cumGov += brs.total;
    cumGrowth += growthThisMonth;
    annualMemberYTD += actualMemberContrib;
    annualGovYTD += brs.total;

    // Record snapshot at end of each year
    if (month % 12 === 0) {
      snapshots.push({
        year: month / 12,
        totalBalance: balance,
        memberContributionsTotal: cumMember,
        govContributionsTotal: cumGov,
        investmentGrowthTotal: cumGrowth,
        annualMemberContrib: annualMemberYTD,
        annualGovContrib: annualGovYTD,
      });
    }
  }

  return {
    snapshots,
    finalBalance: balance,
    totalMemberContributions: cumMember,
    totalGovContributions: cumGov,
    totalInvestmentGrowth: cumGrowth,
    monthlyRetirementIncome4pct: (balance * 0.04) / 12,
    blendedAnnualReturn: annualReturn,
    monthlyGovContribution: initialBRS.total,
    isMaxContribLimit: hitLimit,
  };
}

// ─── Scenario Helpers ──────────────────────────────────────────────────────

/** What different contribution percentages yield in monthly BRS match. */
export function brsMatchTable(
  basePayMonthly: number
): Array<{ pct: number; memberMonthly: number; govMonthly: number; totalMonthly: number }> {
  return [0, 1, 2, 3, 4, 5, 10].map((pct) => {
    const memberMonthly = (basePayMonthly * pct) / 100;
    const brs = calcBRSMatch(basePayMonthly, memberMonthly, 'brs');
    return {
      pct,
      memberMonthly,
      govMonthly: brs.total,
      totalMonthly: memberMonthly + brs.total,
    };
  });
}

/** After-tax monthly income for Traditional vs Roth. */
export function rothVsTraditional(
  finalBalance: number,
  totalMemberContribs: number,
  retirementTaxRatePct: number
): { traditionalAfterTax: number; rothAfterTax: number; annualTraditional: number; annualRoth: number } {
  const rate = retirementTaxRatePct / 100;
  const monthly4pct = (finalBalance * 0.04) / 12;

  // Traditional: full balance is taxable on withdrawal
  const traditionalAfterTax = monthly4pct * (1 - rate);

  // Roth: only the growth portion is untaxed; contributions were already taxed
  // Approximation: treat entire Roth balance as tax-free (already paid tax on contributions)
  const rothAfterTax = monthly4pct;

  return {
    traditionalAfterTax,
    rothAfterTax,
    annualTraditional: traditionalAfterTax * 12,
    annualRoth: rothAfterTax * 12,
  };
}
