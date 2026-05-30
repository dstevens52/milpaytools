/**
 * Transition Readiness calculation logic.
 * Answers "Am I financially ready to leave the military?" with real numbers.
 *
 * Pure functions — no React, no side effects.
 */

import type { TransitionReadinessInput, TransitionReadinessOutput, ActionStep } from '@/types/calculator';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { BAS_RATES, LEGACY_RETIREMENT_MULTIPLIER, BRS_RETIREMENT_MULTIPLIER, FED_TAX_BRACKETS_SINGLE, STANDARD_DEDUCTION_SINGLE } from '@/data/constants';
import { estimateTaxAdvantage } from '@/lib/utils';
import { ENLISTED_GRADES } from '@/types/military';
import { vaRates } from '@/data/va-rates/2026';

// Healthcare replacement cost benchmarks (KFF 2025 Employer Health Benefits Survey)
const HEALTHCARE_MONTHLY_MARKETPLACE = {
  individual: 525,  // midpoint of $450–600/month, Silver-tier marketplace
  family: 1700,     // midpoint of $1,400–2,000/month, Silver-tier marketplace
} as const;

const HEALTHCARE_MONTHLY_EMPLOYER = {
  individual: 175,  // 2026 est. employee share, single — midpoint of $150–200/mo typical range
  family: 575,      // 2026 est. employee share, family — midpoint of $500–650/mo typical range
} as const;

function resolveHealthcare(
  assumption: TransitionReadinessInput['healthcareAssumption'],
  hasDependents: boolean,
): { cost: number; label: string } {
  if (assumption === 'employer') {
    return {
      cost: hasDependents ? HEALTHCARE_MONTHLY_EMPLOYER.family : HEALTHCARE_MONTHLY_EMPLOYER.individual,
      label: 'Employer-sponsored plan',
    };
  }
  if (assumption === 'va') {
    return { cost: 0, label: 'VA healthcare' };
  }
  return {
    cost: hasDependents ? HEALTHCARE_MONTHLY_MARKETPLACE.family : HEALTHCARE_MONTHLY_MARKETPLACE.individual,
    label: assumption === 'not-sure' ? 'Conservative estimate (marketplace)' : 'Marketplace plan',
  };
}

// Combined civilian effective tax rate — used only for spouse income and action step guidance
// (main civilian salary now uses per-income effective rate calculation)
export const CIVILIAN_COMBINED_TAX_RATE = 0.3465;

const FICA_RATE = 0.0765;            // 6.2% SS + 1.45% Medicare
const CIVILIAN_STATE_TAX_RATE = 0.05; // simplified default state effective rate

function estimateAnnualFederalTax(annualIncome: number): number {
  const taxable = Math.max(0, annualIncome - STANDARD_DEDUCTION_SINGLE);
  let tax = 0;
  let prev = 0;
  for (const bracket of FED_TAX_BRACKETS_SINGLE) {
    if (taxable <= bracket.upTo) {
      tax += (taxable - prev) * bracket.rate;
      break;
    }
    tax += (bracket.upTo - prev) * bracket.rate;
    prev = bracket.upTo;
  }
  return tax;
}

function estimateEffectiveFederalRate(annualIncome: number): number {
  if (annualIncome <= 0) return 0;
  return estimateAnnualFederalTax(annualIncome) / annualIncome;
}

// Iterative solver: find gross salary whose after-tax equals a target monthly take-home
function computeGrossedUpSalary(militaryTakeHomeAnnual: number): number {
  let guess = militaryTakeHomeAnnual / 0.65; // start with ~35% combined rate
  for (let i = 0; i < 3; i++) {
    const fedRate = estimateEffectiveFederalRate(guess);
    const totalRate = fedRate + FICA_RATE + CIVILIAN_STATE_TAX_RATE;
    guess = militaryTakeHomeAnnual / Math.max(0.1, 1 - totalRate);
  }
  return Math.round(guess / 1000) * 1000;
}

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
    netSpouseAnnual: number;
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
        'The Benefits Delivery at Discharge (BDD) program lets the VA process your claim while you\'re still serving. File 180–90 days before separation. Even a 20% rating adds $286/month — tax-free for life.',
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
          computed.netSpouseAnnual -
          lookupVACompMonthly(Math.max(0, input.vaRating), input.hasDependents) * 12) /
          (1 - CIVILIAN_COMBINED_TAX_RATE) /
          1000
      ) * 1000;
    steps.push({
      label: `Your projected income falls $${gap.toLocaleString()}/month short`,
      description: `Your current inputs require roughly $${targetSalary.toLocaleString()}/year gross salary to cover adjusted expenses with a $500/month cushion. Ways to close the gap include: targeting a higher salary, reducing monthly expenses, adding or increasing spouse/partner income, using GI Bill MHA if planning education benefits post-separation, exploring lower-cost healthcare options, or extending your timeline to build more savings.`,
      priority: 'high',
    });
  } else if (computed.monthlyGapOrSurplus < 500) {
    steps.push({
      label: 'Your income surplus is thin — aim for a larger cushion',
      description: `You have $${Math.round(computed.monthlyGapOrSurplus).toLocaleString()}/month surplus after expenses and healthcare. A $500+/month cushion covers unexpected costs in the first year. Options to strengthen it: target a higher salary, reduce monthly expenses, increase spouse/partner income, or explore lower-cost healthcare options.`,
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

export function calculateTransitionReadiness(
  input: TransitionReadinessInput,
  monthlyBAH: number,
): TransitionReadinessOutput {
  // 1. Current military compensation (monthlyBAH resolved via /api/bah/lookup)
  const basePay = lookupBasePay(input.payGrade, input.yearsOfService);
  const isEnlisted = ENLISTED_GRADES.includes(input.payGrade as typeof ENLISTED_GRADES[number]);
  const monthlyBAS = isEnlisted ? BAS_RATES.enlisted : BAS_RATES.officer;
  const taxAdvantageMonthly = estimateTaxAdvantage(basePay * 12, monthlyBAH * 12, monthlyBAS * 12) / 12;
  const militaryTotalMonthly = basePay + monthlyBAH + monthlyBAS;

  // 1b. Military after-tax breakdown (only base pay is taxable; BAH and BAS are excluded)
  const militaryAnnualFedTax = estimateAnnualFederalTax(basePay * 12);
  const militaryFedEffectiveRate = basePay > 0 ? militaryAnnualFedTax / (basePay * 12) : 0;
  const militaryFedTaxMonthly = militaryAnnualFedTax / 12;
  const militaryFICAMonthly = basePay * FICA_RATE;
  const militaryTakeHomeMonthly = (basePay - militaryFedTaxMonthly - militaryFICAMonthly) + monthlyBAH + monthlyBAS;

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

  // 5. Projected civilian income (with per-income effective tax rates)
  const civilianFedEffectiveRate = estimateEffectiveFederalRate(input.targetCivilianSalary);
  const civilianFedTaxMonthly = (input.targetCivilianSalary * civilianFedEffectiveRate) / 12;
  const civilianFICAMonthly = (input.targetCivilianSalary * FICA_RATE) / 12;
  const civilianStateTaxMonthly = (input.targetCivilianSalary * CIVILIAN_STATE_TAX_RATE) / 12;
  const civilianCombinedRate = civilianFedEffectiveRate + FICA_RATE + CIVILIAN_STATE_TAX_RATE;
  const netCivilianSalaryMonthly = (input.targetCivilianSalary * (1 - civilianCombinedRate)) / 12;
  const spouseFedEffectiveRate = estimateEffectiveFederalRate(input.spouseIncome);
  const spouseCombinedRate = spouseFedEffectiveRate + FICA_RATE + CIVILIAN_STATE_TAX_RATE;
  const netSpouseAnnual = input.spouseIncome > 0 ? input.spouseIncome * (1 - spouseCombinedRate) : 0;
  const netSpouseMonthly = netSpouseAnnual / 12;
  const projectedCivilianMonthly =
    netCivilianSalaryMonthly + vaCompMonthly + pensionMonthly + netSpouseMonthly;

  // Grossed-up civilian salary: annual gross that produces the same after-tax as military take-home
  const grossedUpCivilianSalary = computeGrossedUpSalary(militaryTakeHomeMonthly * 12);

  // 6. Healthcare replacement cost
  const hasRetireeTricare = isRetirementEligible;
  const hcResult = hasRetireeTricare
    ? { cost: 0, label: 'TRICARE (retiree)' }
    : resolveHealthcare(input.healthcareAssumption, input.hasDependents);
  const healthcareCostMonthly = hcResult.cost;
  const healthcareAssumptionLabel = hcResult.label;

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
    : input.vaRating > 0
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
    netSpouseAnnual,
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
    militaryFedEffectiveRate,
    militaryFedTaxMonthly,
    militaryFICAMonthly,
    militaryTakeHomeMonthly,
    civilianFedEffectiveRate,
    civilianFedTaxMonthly,
    civilianFICAMonthly,
    civilianStateTaxMonthly,
    netCivilianSalaryMonthly,
    vaCompMonthly,
    pensionMonthly,
    netSpouseMonthly,
    projectedCivilianMonthly,
    grossedUpCivilianSalary,
    isRetirementEligible,
    separationYOS,
    healthcareCostMonthly,
    healthcareAssumptionLabel,
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
