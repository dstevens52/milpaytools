/**
 * TSP (Thrift Savings Plan) projection calculation logic.
 * Pure functions — no React, no side effects.
 */

import type { TSPInput, TSPOutput } from '@/types/calculator';
import {
  TSP_ELECTIVE_DEFERRAL_LIMIT,
  BRS_AUTOMATIC_CONTRIBUTION_PCT,
  BRS_MATCHING_MAX_PCT,
} from '@/data/constants';
import { projectTSPBalance } from '@/lib/utils';

/**
 * Calculate monthly TSP contribution and DoD match (BRS only).
 */
export function calculateTSP(input: TSPInput): TSPOutput {
  const rawMonthlyContribution = input.monthlyBasePay * (input.contributionPct / 100);

  // Cap at IRS elective deferral limit
  const annualCap = TSP_ELECTIVE_DEFERRAL_LIMIT;
  const monthlyContribution = Math.min(rawMonthlyContribution, annualCap / 12);
  const annualContribution = monthlyContribution * 12;

  // BRS agency match
  let agencyMatchMonthly = 0;
  if (input.retirementSystem === 'brs') {
    const automatic = input.monthlyBasePay * BRS_AUTOMATIC_CONTRIBUTION_PCT;
    const matchablePct = Math.min(input.contributionPct / 100, BRS_MATCHING_MAX_PCT);
    const matching = input.monthlyBasePay * matchablePct;
    agencyMatchMonthly = automatic + matching;
  }
  const agencyMatchAnnual = agencyMatchMonthly * 12;

  const totalMonthlyContribution = monthlyContribution + agencyMatchMonthly;
  const yearsToGrow = Math.max(0, input.retirementAge - input.currentAge);

  const projectedBalance = projectTSPBalance(
    input.currentBalance,
    totalMonthlyContribution,
    input.annualReturnPct,
    yearsToGrow
  );

  // Safe withdrawal rate: 4%/year → monthly income
  const projectedMonthlyIncome = (projectedBalance * 0.04) / 12;

  return {
    monthlyContribution,
    annualContribution,
    agencyMatchMonthly,
    agencyMatchAnnual,
    projectedBalance,
    projectedMonthlyIncome,
    yearsToGrow,
  };
}
