/**
 * Total Military Compensation calculation logic.
 *
 * "Total compensation" = Base Pay + BAH + BAS + tax advantage + TSP match + SGLI
 * This is distinct from "take-home pay" — it's the full economic value of service.
 *
 * Pure functions — no React, no side effects.
 */

import type { TotalCompensationInput, TotalCompensationOutput } from '@/types/calculator';
import { payTable } from '@/data/pay-tables/2026';
import { BAS_RATES, BRS_AUTOMATIC_CONTRIBUTION_PCT, BRS_MATCHING_MAX_PCT, SGLI_MAX_COVERAGE, SGLI_PREMIUM_PER_1000, SGLI_TSGLI_PREMIUM } from '@/data/constants';
import { lookupBAH } from '@/lib/calculations/bah';
import { getYOSBracket, estimateTaxAdvantage } from '@/lib/utils';
import { ENLISTED_GRADES } from '@/types/military';

/**
 * Look up monthly basic pay for a grade + YOS combination.
 * Returns 0 if data is missing.
 */
export function lookupBasePay(payGrade: string, yearsOfService: number): number {
  const gradeTable = payTable[payGrade as keyof typeof payTable];
  if (!gradeTable) return 0;

  const yosBracket = getYOSBracket(yearsOfService);
  // Walk down from the actual bracket to find the nearest available entry
  const breakpoints = [40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 0];
  for (const bp of breakpoints) {
    if (bp <= yosBracket && gradeTable[bp as keyof typeof gradeTable] !== undefined) {
      return gradeTable[bp as keyof typeof gradeTable] as number;
    }
  }
  return (gradeTable[0] as number) ?? 0;
}

/**
 * Calculate BRS TSP agency match (annual).
 * DoD matches: 1% automatic + up to 4% matching = max 5% total.
 */
function calculateBRSAgencyMatch(monthlyBasePay: number, contributionPct: number): number {
  const automatic = monthlyBasePay * BRS_AUTOMATIC_CONTRIBUTION_PCT;
  const matchablePct = Math.min(contributionPct / 100, BRS_MATCHING_MAX_PCT);
  const match = monthlyBasePay * matchablePct;
  return (automatic + match) * 12;
}

/**
 * Calculate monthly SGLI premium (default = max $500k coverage).
 */
function calculateSGLIPremium(coverage: number = SGLI_MAX_COVERAGE): number {
  return (coverage / 1000) * SGLI_PREMIUM_PER_1000 + SGLI_TSGLI_PREMIUM;
}

/**
 * Calculate total military compensation.
 */
export function calculateTotalCompensation(input: TotalCompensationInput): TotalCompensationOutput {
  const monthlyBasePay = lookupBasePay(input.payGrade, input.yearsOfService);
  const annualBasePay = monthlyBasePay * 12;

  // BAH
  const bahResult = lookupBAH({
    payGrade: input.payGrade,
    zipCode: input.zipCode,
    hasDependents: input.hasDependents,
  });
  const monthlyBAH = bahResult?.monthlyRate ?? 0;
  const annualBAH = monthlyBAH * 12;

  // BAS (depends on officer vs enlisted)
  const isEnlisted = ENLISTED_GRADES.includes(input.payGrade as typeof ENLISTED_GRADES[number]);
  const monthlyBAS = isEnlisted ? BAS_RATES.enlisted : BAS_RATES.officer;
  const annualBAS = monthlyBAS * 12;

  // TSP agency contribution (BRS only)
  const tspAgencyContribution =
    input.retirementSystem === 'brs'
      ? calculateBRSAgencyMatch(monthlyBasePay, input.tspContributionPct)
      : 0;

  // SGLI (annual premium)
  const sgliAnnual = calculateSGLIPremium() * 12;

  // Tax advantage (estimated annual value of tax-free BAH + BAS)
  const taxAdvantageValue = estimateTaxAdvantage(annualBasePay, annualBAH, annualBAS);

  // Total monthly / annual (excludes TSP agency match and tax advantage since those aren't cash-in-hand)
  const totalMonthly = monthlyBasePay + monthlyBAH + monthlyBAS;
  const totalAnnual = totalMonthly * 12 + tspAgencyContribution;

  // Civilian equivalent: salary a civilian would need to match the same net economic benefit
  // Accounts for tax-free BAH/BAS and TSP match
  const civilianEquivalent = annualBasePay + taxAdvantageValue + annualBAH + annualBAS + tspAgencyContribution;

  return {
    monthlyBasePay,
    annualBasePay,
    monthlyBAH,
    annualBAH,
    monthlyBAS,
    annualBAS,
    tspAgencyContribution,
    sgli: sgliAnnual,
    taxAdvantageValue,
    totalMonthly,
    totalAnnual,
    civilianEquivalent,
  };
}
