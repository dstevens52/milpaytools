/**
 * Total Military Compensation calculation logic.
 *
 * "Total compensation" = Base Pay + BAH + BAS + tax advantage + TSP match + SGLI
 * This is distinct from "take-home pay" — it's the full economic value of service.
 *
 * Pure functions — no React, no side effects.
 */

import type { TotalCompensationInput, TotalCompensationOutput } from '@/types/calculator';
import { BAS_RATES, BRS_AUTOMATIC_CONTRIBUTION_PCT, SGLI_MAX_COVERAGE, SGLI_PREMIUM_PER_1000, SGLI_TSGLI_PREMIUM } from '@/data/constants';
import { lookupBasePay } from '@/lib/calculations/basePay';
import { estimateTaxAdvantage } from '@/lib/utils';
import { HEALTHCARE_2026 } from '@/data/healthcare/2026/constants';
import { ENLISTED_GRADES } from '@/types/military';

// Re-exported so existing callers `import { lookupBasePay } from '.../total-compensation'`
// keep working unchanged. The implementation now lives in ./basePay (pay-table only,
// no BAH dataset) — see that module for why.
export { lookupBasePay };

/**
 * Calculate BRS TSP agency match (annual).
 * DoD contributes: 1% automatic + dollar-for-dollar on the first 3% of base pay
 * contributed + 50¢ per dollar on the next 2% (3%–5%) = max 5% of base pay.
 * `contributionPct` is the member's contribution as a percent (0–100).
 */
function calculateBRSAgencyMatch(monthlyBasePay: number, contributionPct: number): number {
  const auto = monthlyBasePay * BRS_AUTOMATIC_CONTRIBUTION_PCT;
  const matchedAt100 = (Math.min(contributionPct, 3) / 100) * monthlyBasePay;
  const matchedAt50 = (Math.max(0, Math.min(contributionPct, 5) - 3) / 100) * monthlyBasePay * 0.5;
  return (auto + matchedAt100 + matchedAt50) * 12;
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
export function calculateTotalCompensation(
  input: TotalCompensationInput,
  monthlyBAH: number,
): TotalCompensationOutput {
  const monthlyBasePay = lookupBasePay(input.payGrade, input.yearsOfService);
  const annualBasePay = monthlyBasePay * 12;

  // BAH — resolved via /api/bah/lookup and injected by the caller.
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

  const govHousing = input.govHousing ?? false;
  const mealCard = input.mealCard ?? false;

  // Cash = what actually hits the bank; in-kind = estimated value of benefits received as services
  const cashMonthly = monthlyBasePay + (govHousing ? 0 : monthlyBAH) + (mealCard ? 0 : monthlyBAS);
  const inKindMonthly = (govHousing ? monthlyBAH : 0) + (mealCard ? monthlyBAS : 0);

  // Total monthly value = cash + in-kind (full economic picture)
  const totalMonthly = monthlyBasePay + monthlyBAH + monthlyBAS;
  const totalAnnual = totalMonthly * 12 + tspAgencyContribution;

  // TRICARE value: what a civilian would pay in employer premiums for equivalent coverage
  const tricareSavings = input.hasDependents
    ? HEALTHCARE_2026.employer.family.silver.premium * 12  // $6,840/yr
    : HEALTHCARE_2026.employer.single.silver.premium * 12; // $2,040/yr

  // Civilian equivalent always includes full BAH + BAS value: a civilian pays for housing and food
  // out of taxable income regardless of whether the service member receives these as cash or in-kind.
  const civilianEquivalent = annualBasePay + taxAdvantageValue + annualBAH + annualBAS + tspAgencyContribution + tricareSavings;

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
    tricareSavings,
    totalMonthly,
    totalAnnual,
    cashMonthly,
    cashAnnual: cashMonthly * 12,
    inKindMonthly,
    civilianEquivalent,
  };
}
