/**
 * Transition Readiness calculation logic.
 * Answers "Am I financially ready to leave the military?" with real numbers.
 *
 * Pure functions — no React, no side effects.
 */

import type { TransitionReadinessInput, TransitionReadinessOutput, ActionStep } from '@/types/calculator';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { lookupBAH } from '@/lib/calculations/bah';
import { BAS_RATES, LEGACY_RETIREMENT_MULTIPLIER, BRS_RETIREMENT_MULTIPLIER } from '@/data/constants';
import { estimateTaxAdvantage } from '@/lib/utils';
import { ENLISTED_GRADES } from '@/types/military';
import { vaRates } from '@/data/va-rates/2026';

// Healthcare replacement cost benchmarks (KFF 2025 Employer Health Benefits Survey, Silver-tier marketplace)
const HEALTHCARE_MONTHLY = {
  individual: 525,  // midpoint of $450–600/month
  family: 1700,     // midpoint of $1,400–2,000/month
} as const;

// Combined civilian effective tax rate used throughout
// 22% federal effective + 7.65% FICA + 5% state default
export const CIVILIAN_COMBINED_TAX_RATE = 0.3465;

// ─── VA compensation lookup ────────────────────────────────────────────────

function lookupVACompMonthly(rating: number, hasDependents: boolean): number {
  if (rating < 0) return 0;
  const normalized = Math.max(0, Math.min(100, Math.round(rating / 10) * 10));
  const row = vaRates[normalized];
  if (!row) return 0;
  // 10% and 20% ratings have no dependent additions per VA policy
  if (hasDependents && normalized >= 30) return row.withSpouse;
  return row.veteranAlone;
}

// ─── Action steps ─────────────────────────────────────────────────────────

function buildActionSteps(
  input: TransitionReadinessInput,
  computed: {
    monthlyGapOrSurplus: number;
    emergencyFundMonths: number;
    adjustedMonthlyExpenses: number;
    totalLiquidSavings: number;
    vaClaimStatus: 'green' | 'yellow' | 'na';
    timelineStatus: 'green' | 'yellow' | 'red';
    isRetirementEligible: boolean;
  }
): ActionStep[] {
  const steps: ActionStep[] = [];

  // 1. VA claim — highest priority if unfiled and not retirement-eligible
  if (computed.vaClaimStatus === 'yellow') {
    steps.push({
      label: 'File your VA disability claim before you separate',
      description:
        'The Benefits Delivery at Discharge (BDD) program lets the VA process your claim while you\'re still serving. File 90–180 days before separation. Even a 20% rating adds $286/month — tax-free for life.',
      priority: 'high',
      href: '/calculators/va-disability',
    });
  }

  // 2. Income deficit
  if (computed.monthlyGapOrSurplus < 0) {
    const gap = Math.abs(Math.round(computed.monthlyGapOrSurplus));
    const targetSalary =
      Math.ceil(
        ((computed.adjustedMonthlyExpenses + 500) * 12 -
          (input.spouseIncome * (1 - CIVILIAN_COMBINED_TAX_RATE)) -
          lookupVACompMonthly(Math.max(0, input.vaRating), input.hasDependents) * 12) /
          (1 - CIVILIAN_COMBINED_TAX_RATE) /
          1000
      ) * 1000;
    steps.push({
      label: `Your projected income falls $${gap.toLocaleString()}/month short`,
      description: `Negotiate a higher salary before separating. To cover expenses with a $500/month cushion, target at least $${targetSalary.toLocaleString()}/year gross salary.`,
      priority: 'high',
    });
  } else if (computed.monthlyGapOrSurplus < 500) {
    steps.push({
      label: 'Your income surplus is thin — aim for a larger cushion',
      description: `You have $${Math.round(computed.monthlyGapOrSurplus).toLocaleString()}/month surplus after expenses and healthcare. A $500+/month cushion covers unexpected costs in the first year. Consider negotiating a higher starting salary before you lock in an offer.`,
      priority: 'medium',
    });
  }

  // 3. Emergency fund
  if (computed.emergencyFundMonths < 6) {
    const target = Math.ceil(6 * computed.adjustedMonthlyExpenses);
    const gap = target - computed.totalLiquidSavings;
    if (gap > 0) {
      steps.push({
        label: `Emergency fund covers ${computed.emergencyFundMonths.toFixed(1)} months — build to 6 before separation`,
        description: `You need $${gap.toLocaleString()} more to reach a 6-month cushion ($${target.toLocaleString()} total). Military transition timelines stretch — employment gaps, delayed VA decisions, and relocation delays are common.`,
        priority: computed.emergencyFundMonths < 3 ? 'high' : 'medium',
      });
    }
  }

  // 4. TSP note (informational)
  if (input.tspBalance > 5000) {
    steps.push({
      label: `Your $${input.tspBalance.toLocaleString()} TSP stays invested — don't touch it for transition expenses`,
      description:
        'Withdrawals before age 59½ trigger income taxes plus a 10% early withdrawal penalty. Your TSP stays in the account (or rolls to an IRA) after separation. It\'s retirement money, not a cash reserve.',
      priority: 'low',
      href: '/calculators/tsp',
    });
  }

  // 5. Timeline urgency
  if (computed.timelineStatus === 'red') {
    steps.push({
      label: 'Tight timeline — front-load the critical tasks now',
      description:
        'With less than 6 months until separation, prioritize: (1) file your VA BDD claim, (2) confirm TRICARE transition options, (3) verify your LES and TSP. See the transition financial roadmap for a phase-by-phase checklist.',
      priority: 'high',
      href: '/transition',
    });
  } else if (computed.timelineStatus === 'yellow' && computed.emergencyFundMonths < 6) {
    steps.push({
      label: 'Use the next 6–11 months to close the gaps you identified',
      description:
        'You have time — but not much. Build your emergency fund and nail down your job offer before the clock runs out. The transition financial roadmap has a phase-by-phase checklist.',
      priority: 'medium',
      href: '/transition',
    });
  }

  return steps.slice(0, 4);
}

// ─── Main calculation ──────────────────────────────────────────────────────

export function calculateTransitionReadiness(input: TransitionReadinessInput): TransitionReadinessOutput {
  // 1. Current military compensation
  const basePay = lookupBasePay(input.payGrade, input.yearsOfService);
  const bahResult = lookupBAH({
    payGrade: input.payGrade,
    zipCode: input.zipCode,
    hasDependents: input.hasDependents,
  });
  const monthlyBAH = bahResult?.monthlyRate ?? 0;
  const isEnlisted = ENLISTED_GRADES.includes(input.payGrade as typeof ENLISTED_GRADES[number]);
  const monthlyBAS = isEnlisted ? BAS_RATES.enlisted : BAS_RATES.officer;
  const taxAdvantageMonthly = estimateTaxAdvantage(basePay * 12, monthlyBAH * 12, monthlyBAS * 12) / 12;
  const militaryTotalMonthly = basePay + monthlyBAH + monthlyBAS;

  // 2. Retirement eligibility at planned separation
  const separationYOS = input.yearsOfService + input.separationMonths / 12;
  const isRetirementEligible = separationYOS >= 20;
  const yosAtSep = Math.floor(separationYOS);

  // 3. Pension (if retirement-eligible)
  const multiplier =
    input.retirementSystem === 'legacy' ? LEGACY_RETIREMENT_MULTIPLIER : BRS_RETIREMENT_MULTIPLIER;
  const pensionMonthly = isRetirementEligible ? basePay * multiplier * yosAtSep : 0;

  // 4. VA compensation
  const vaCompMonthly = lookupVACompMonthly(input.vaRating, input.hasDependents);

  // 5. Projected civilian income (after combined tax rate)
  const netCivilianSalaryMonthly = (input.targetCivilianSalary * (1 - CIVILIAN_COMBINED_TAX_RATE)) / 12;
  const netSpouseMonthly = (input.spouseIncome * (1 - CIVILIAN_COMBINED_TAX_RATE)) / 12;
  const projectedCivilianMonthly =
    netCivilianSalaryMonthly + vaCompMonthly + pensionMonthly + netSpouseMonthly;

  // 6. Healthcare replacement cost
  const hasRetireeTricare = isRetirementEligible;
  const healthcareCostMonthly = hasRetireeTricare
    ? 0
    : input.hasDependents
    ? HEALTHCARE_MONTHLY.family
    : HEALTHCARE_MONTHLY.individual;

  // 7. Monthly expenses
  const rawMonthlyExpenses =
    input.expenseMode === 'quick'
      ? input.totalMonthlyExpenses
      : input.expenseHousing +
        input.expenseCar +
        input.expenseInsurance +
        input.expenseGroceries +
        input.expenseDebt +
        input.expenseChildcare +
        input.expenseUtilities +
        input.expenseOther;
  const adjustedMonthlyExpenses = rawMonthlyExpenses + healthcareCostMonthly;

  // 8. Monthly gap or surplus
  const monthlyGapOrSurplus = projectedCivilianMonthly - adjustedMonthlyExpenses;

  // 9. Emergency fund runway (liquid savings only — excludes TSP)
  const totalLiquidSavings = input.emergencyFund + input.otherSavings;
  const emergencyFundMonths =
    adjustedMonthlyExpenses > 0 ? totalLiquidSavings / adjustedMonthlyExpenses : 0;

  // 10. Readiness verdict factors
  const surplusStatus: 'green' | 'yellow' | 'red' =
    monthlyGapOrSurplus >= 500 ? 'green' : monthlyGapOrSurplus >= 0 ? 'yellow' : 'red';
  const emergencyFundStatus: 'green' | 'yellow' | 'red' =
    emergencyFundMonths >= 6 ? 'green' : emergencyFundMonths >= 3 ? 'yellow' : 'red';
  const vaClaimStatus: 'green' | 'yellow' | 'na' = isRetirementEligible
    ? 'na'
    : input.vaRating >= 0
    ? 'green'
    : 'yellow';
  const timelineStatus: 'green' | 'yellow' | 'red' =
    input.separationMonths >= 12 ? 'green' : input.separationMonths >= 6 ? 'yellow' : 'red';

  // 11. Overall verdict
  const hasDeficit = monthlyGapOrSurplus < 0;
  const veryLowEF = emergencyFundMonths < 3;
  const shortTimelineWithIssues = input.separationMonths < 6 && (hasDeficit || veryLowEF);

  let verdict: 'ready' | 'almost' | 'not-yet';
  if (hasDeficit || veryLowEF || shortTimelineWithIssues) {
    verdict = 'not-yet';
  } else if (
    surplusStatus === 'green' &&
    emergencyFundStatus === 'green' &&
    (vaClaimStatus === 'green' || vaClaimStatus === 'na')
  ) {
    verdict = 'ready';
  } else {
    verdict = 'almost';
  }

  // 12. Action steps
  const actionSteps = buildActionSteps(input, {
    monthlyGapOrSurplus,
    emergencyFundMonths,
    adjustedMonthlyExpenses,
    totalLiquidSavings,
    vaClaimStatus,
    timelineStatus,
    isRetirementEligible,
  });

  return {
    militaryMonthlyBasePay: basePay,
    militaryMonthlyBAH: monthlyBAH,
    militaryMonthlyBAS: monthlyBAS,
    militaryTaxAdvantageMonthly: taxAdvantageMonthly,
    militaryTotalMonthly,
    netCivilianSalaryMonthly,
    vaCompMonthly,
    pensionMonthly,
    netSpouseMonthly,
    projectedCivilianMonthly,
    isRetirementEligible,
    separationYOS,
    healthcareCostMonthly,
    hasRetireeTricare,
    rawMonthlyExpenses,
    adjustedMonthlyExpenses,
    monthlyGapOrSurplus,
    totalLiquidSavings,
    emergencyFundMonths,
    verdict,
    surplusStatus,
    emergencyFundStatus,
    vaClaimStatus,
    timelineStatus,
    actionSteps,
  };
}
