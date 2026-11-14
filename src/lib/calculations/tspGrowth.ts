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
import {
  brsTierContribution,
  brsGovContribution,
  brsContributionAtYOS,
  type BRSContribution,
} from '@/lib/calculations/brs';

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
  annualPayRaisePct: number;      // e.g. 4.5 for 4.5%
  moreYearsToServe: number;       // years of active service remaining; contributions and BRS match stop after this
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
  monthlyGovContribution: number;     // BRS contribution at today's years of service (for display)
  isMaxContribLimit: boolean;         // hit annual deferral limit
  phase1Years: number;               // years of active contributions (capped at yearsToProject)
  phase2Years: number;               // years of growth-only after separation
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
 * Monthly BRS government contribution from the tiers alone (no service-time gate).
 * Returns { auto, match, total } — all monthly dollar amounts; zero unless
 * retirementSystem === 'brs'.
 *
 * Tier math lives in ./brs (brsTierContribution). Timing (60 days, 2 years, 26 years)
 * is applied by brsGovContribution / brsContributionAtYOS; Guard/Reserve applies its
 * own YOS gate and calls this untimed version.
 */
export function calcBRSMatch(
  basePayMonthly: number,
  memberMonthlyContrib: number,
  retirementSystem: RetirementSystem
): { auto: number; match: number; total: number } {
  if (retirementSystem !== 'brs') return { auto: 0, match: 0, total: 0 };
  return brsTierContribution(basePayMonthly, memberMonthlyContrib);
}

/**
 * One in-service month of TSP contributions — shared by projectTSP and the retirement
 * calculator so the deferral cap and BRS timing are applied the same way everywhere.
 *
 * - Member contribution is capped at what is left of the annual elective deferral
 *   limit (TSP_CONSTANTS_2026.electiveDeferralLimit) for the projection year.
 * - The BRS government contribution is computed on what the member actually
 *   contributed that month, for that service month (brsGovContribution). Once the
 *   limit is hit, matching stops for the rest of the year; the automatic 1% continues.
 * - Member contributions continue after 26 years of service; government money stops.
 */
export function tspMonthContribution(params: {
  basePayMonthly: number;
  desiredMemberMonthly: number;
  memberYTD: number;
  serviceMonth: number;
  isBRS: boolean;
  limit?: number;
}): { member: number; gov: BRSContribution; hitLimit: boolean } {
  const limit = params.limit ?? TSP_CONSTANTS_2026.electiveDeferralLimit;
  const remainingLimit = Math.max(0, limit - params.memberYTD);
  const member = Math.min(params.desiredMemberMonthly, remainingLimit);
  const hitLimit = member < params.desiredMemberMonthly;
  const gov = params.isBRS
    ? brsGovContribution(params.basePayMonthly, member, params.serviceMonth)
    : { auto: 0, match: 0, total: 0 };
  return { member, gov, hitLimit };
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
    moreYearsToServe,
  } = input;

  // Phase 1: contributions + BRS match run while in service.
  // Phase 2: growth-only after separation. Contributions are capped at yearsToProject
  // so that the edge case of "still serving at retirement age" just runs the full projection.
  const phase1Months = Math.min(moreYearsToServe, yearsToProject) * 12;

  // Merge custom returns with defaults
  const effectiveReturns: FundReturns = {
    ...TSP_CONSTANTS_2026.defaultFundReturns,
    ...input.customReturns,
  };

  const annualReturn = blendedReturn(allocation, effectiveReturns);
  // Use r/12 monthly rate (matches TSP.gov calculator convention and
  // produces the standard FV-of-annuity result expected by most users).
  const monthlyReturn = annualReturn / 12;

  // Starting pay and the BRS contribution at today's years of service (for display)
  const initialBasePay = getBasePayMonthly(payGrade, yearsOfService);
  const isBRS = retirementSystem === 'brs';
  const initialBRS = isBRS
    ? brsContributionAtYOS(initialBasePay, input.monthlyContribution, yearsOfService)
    : { auto: 0, match: 0, total: 0 };

  // Service month at projection month 1 is the first month after the completed years.
  // BRS timing (automatic 1% from month 3, match from month 25, none after month 312)
  // is applied per service month by brsGovContribution.
  const serviceMonthOffset = Math.floor(Math.max(0, yearsOfService)) * 12;

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

    const inService = month <= phase1Months;

    // In service: member contribution capped at the annual deferral limit, then the
    // BRS government contribution for this service month (shared helper).
    // After separation: no contributions of either kind.
    let actualMemberContrib = 0;
    let brs: BRSContribution = { auto: 0, match: 0, total: 0 };
    if (inService) {
      const step = tspMonthContribution({
        basePayMonthly: basePay,
        desiredMemberMonthly: memberContrib,
        memberYTD: annualMemberYTD,
        serviceMonth: serviceMonthOffset + month,
        isBRS,
      });
      actualMemberContrib = step.member;
      brs = step.gov;
      if (step.hitLimit) hitLimit = true;
    }

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
    phase1Years: Math.min(moreYearsToServe, yearsToProject),
    phase2Years: Math.max(0, yearsToProject - moreYearsToServe),
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
