/**
 * Transition Readiness calculation logic.
 * Answers "Am I financially ready to leave the military?" with real numbers.
 *
 * Pure functions — no React, no side effects.
 */

import type { TransitionReadinessInput, TransitionReadinessOutput, ActionStep, FilingStatus } from '@/types/calculator';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import {
  BAS_RATES,
  LEGACY_RETIREMENT_MULTIPLIER,
  BRS_RETIREMENT_MULTIPLIER,
  FED_TAX_BRACKETS_SINGLE,
  STANDARD_DEDUCTION_SINGLE,
  FED_TAX_BRACKETS_MFJ,
  STANDARD_DEDUCTION_MFJ,
  FED_TAX_BRACKETS_HOH,
  STANDARD_DEDUCTION_HOH,
} from '@/data/constants';
import { estimateTaxAdvantage } from '@/lib/utils';
import { ENLISTED_GRADES } from '@/types/military';
import { vaRates } from '@/data/va-rates/2026';
import {
  getStateMilitaryRetirementTax,
  stateTaxableRetiredPay,
  effectiveExemptionCap,
  type StateMilitaryRetirementTax,
  type StateTaxContext,
} from '@/data/state-military-retirement-tax';

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

const FICA_RATE = 0.0765;            // 6.2% SS + 1.45% Medicare
// Default for the calculator's state-rate input.
export const DEFAULT_STATE_TAX_RATE = 0.05;

const FEDERAL_TAX_TABLES: Record<FilingStatus, { brackets: readonly { upTo: number; rate: number }[]; deduction: number }> = {
  single: { brackets: FED_TAX_BRACKETS_SINGLE, deduction: STANDARD_DEDUCTION_SINGLE },
  mfj: { brackets: FED_TAX_BRACKETS_MFJ, deduction: STANDARD_DEDUCTION_MFJ },
  hoh: { brackets: FED_TAX_BRACKETS_HOH, deduction: STANDARD_DEDUCTION_HOH },
};

export const FILING_STATUS_LABEL: Record<FilingStatus, string> = {
  single: 'Single',
  mfj: 'Married filing jointly',
  hoh: 'Head of household',
};

/**
 * Default filing status when the user hasn't picked one. BAH dependent status is a
 * separate question: a single parent draws with-dependents BAH but files as head of
 * household, so dependents alone never imply a joint return.
 */
export function defaultFilingStatus(spouseIncome: number, hasDependents: boolean): FilingStatus {
  if (spouseIncome > 0) return 'mfj';
  if (hasDependents) return 'hoh';
  return 'single';
}

export function estimateAnnualFederalTax(annualIncome: number, filingStatus: FilingStatus): number {
  const { brackets, deduction } = FEDERAL_TAX_TABLES[filingStatus];
  const taxable = Math.max(0, annualIncome - deduction);
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    if (taxable <= bracket.upTo) {
      tax += (taxable - prev) * bracket.rate;
      break;
    }
    tax += (bracket.upTo - prev) * bracket.rate;
    prev = bracket.upTo;
  }
  return tax;
}

// Bisection: smallest x in [lo, ∞) with f(x) >= target, for f increasing in x.
export function solveIncreasing(f: (x: number) => number, target: number, lo: number): number {
  let hi = Math.max(lo, 50_000);
  while (f(hi) < target && hi < 5_000_000) hi *= 2;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < target) lo = mid;
    else hi = mid;
  }
  return hi;
}

// ─── Retired pay and VA offset ─────────────────────────────────────────────

export interface RetiredPaySplit {
  grossRetiredPayAnnual: number;
  vaWaiverAnnual: number;
  taxableRetiredPayAnnual: number; // after the VA waiver — federally taxable
  crscAnnual: number;              // tax-free
  receivesCRDP: boolean;
}

/**
 * Splits retired pay against VA compensation.
 * - 50%+ rating with 20+ years: CRDP — full retired pay and full VA comp.
 * - Below 50%: retired pay is reduced dollar-for-dollar by VA comp (VA waiver).
 *   If the user says the disability is combat-related, CRSC restores the waived
 *   amount tax-free, capped at the waived amount.
 */
export function splitRetiredPay(
  grossRetiredPayAnnual: number,
  vaCompAnnual: number,
  vaRating: number,
  yearsOfService: number,
  crscEligible: boolean,
): RetiredPaySplit {
  if (grossRetiredPayAnnual <= 0) {
    return { grossRetiredPayAnnual: 0, vaWaiverAnnual: 0, taxableRetiredPayAnnual: 0, crscAnnual: 0, receivesCRDP: false };
  }
  const receivesCRDP = vaRating >= 50 && yearsOfService >= 20;
  const vaWaiverAnnual = receivesCRDP ? 0 : Math.min(grossRetiredPayAnnual, Math.max(0, vaCompAnnual));
  const taxableRetiredPayAnnual = grossRetiredPayAnnual - vaWaiverAnnual;
  const crscAnnual = crscEligible && !receivesCRDP ? vaWaiverAnnual : 0;
  return { grossRetiredPayAnnual, vaWaiverAnnual, taxableRetiredPayAnnual, crscAnnual, receivesCRDP };
}

// ─── Household taxes after separation ─────────────────────────────────────

export interface CivilianTaxResult {
  filingStatus: FilingStatus;
  fedTaxableIncomeAnnual: number;
  fedTaxAnnual: number;
  ficaAnnual: number;
  stateTaxAnnual: number;
  stateRetiredPayTaxedAnnual: number;
  stateExemptionCapAnnual: number | null; // cap-based partial rules, after modeled conditions
  netAnnual: number; // wages + all retired pay/VA/CRSC, minus all taxes
}

/** State rule is unresolved ("not sure yet", or a `varies` state) — show both outcomes. */
function isUnresolvedStateRule(rule: StateMilitaryRetirementTax | null): boolean {
  return !rule || rule.treatment === 'varies';
}

/**
 * One household return:
 * - Federal: salary + spouse income + taxable retired pay (VA comp and CRSC excluded),
 *   using the household's filing status.
 * - FICA: wages only.
 * - State: user rate × wages, plus taxable retired pay only as far as the state taxes it.
 *   Unresolved rule ("not sure yet" / `varies`) — `retiredPayStateTaxed` picks the case.
 */
export function computeCivilianTaxes(params: {
  salary: number;
  spouseIncome: number;
  filingStatus: FilingStatus;
  split: RetiredPaySplit;
  vaCompAnnual: number;
  stateRule: StateMilitaryRetirementTax | null;
  stateTaxRate: number;
  retiredPayStateTaxed?: boolean; // only used when the state rule is unresolved
}): CivilianTaxResult {
  const { salary, spouseIncome, filingStatus, split, vaCompAnnual, stateRule, stateTaxRate } = params;
  const wages = salary + spouseIncome;

  const fedTaxableIncomeAnnual = wages + split.taxableRetiredPayAnnual;
  const fedTaxAnnual = estimateAnnualFederalTax(fedTaxableIncomeAnnual, filingStatus);
  const ficaAnnual = wages * FICA_RATE;
  // State conditions we can evaluate: AGI (CA), filing status (ID), the member's own
  // earned income (GA — the civilian salary; the spouse qualifies separately, not modeled).
  const stateCtx: StateTaxContext = {
    filingStatus,
    federalAgiAnnual: fedTaxableIncomeAnnual,
    memberEarnedIncomeAnnual: salary,
  };
  const stateExemptionCapAnnual =
    stateRule?.treatment === 'partial' && stateRule.exemptionPercent === undefined
      ? effectiveExemptionCap(stateRule, stateCtx)
      : null;

  let stateRetiredPayTaxedAnnual: number;
  let stateTaxAnnual: number;
  if (stateRule?.treatment === 'no_income_tax') {
    stateRetiredPayTaxedAnnual = 0;
    stateTaxAnnual = 0;
  } else {
    stateRetiredPayTaxedAnnual = isUnresolvedStateRule(stateRule)
      ? params.retiredPayStateTaxed === false ? 0 : split.taxableRetiredPayAnnual
      : stateTaxableRetiredPay(stateRule!, split.taxableRetiredPayAnnual, stateCtx);
    stateTaxAnnual = Math.max(0, stateTaxRate) * (wages + stateRetiredPayTaxedAnnual);
  }

  const netAnnual =
    fedTaxableIncomeAnnual + split.crscAnnual + vaCompAnnual - fedTaxAnnual - ficaAnnual - stateTaxAnnual;

  return { filingStatus, fedTaxableIncomeAnnual, fedTaxAnnual, ficaAnnual, stateTaxAnnual, stateRetiredPayTaxedAnnual, stateExemptionCapAnnual, netAnnual };
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
    netAnnualForSalary: (salary: number) => number;
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
        `The Benefits Delivery at Discharge (BDD) program lets the VA process your claim while you're still serving. File 180–90 days before separation. Even a 20% rating adds $${Math.round(vaRates[20].veteranAlone)}/month — tax-free for life.`,
      priority: 'high',
      href: '/calculators/va-disability',
    });
  }

  // 2. Income deficit
  if (computed.monthlyGapOrSurplus < 0) {
    const gap = Math.abs(Math.round(computed.monthlyGapOrSurplus));
    // Solve for the salary whose household after-tax income covers expenses + $500/mo,
    // using the same tax model as the result (joint return, retired pay, state rule).
    const needAnnual = (computed.adjustedMonthlyExpenses + 500) * 12;
    const targetSalary =
      Math.ceil(solveIncreasing(computed.netAnnualForSalary, needAnnual, input.targetCivilianSalary) / 1000) * 1000;
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

  // 1b. Military after-tax breakdown — household basis, so it compares like-for-like with
  // the civilian projection:
  // - Same filing status as the civilian side (input.filingStatus).
  // - Spouse income is included on BOTH sides: in the joint federal base, FICA, and state
  //   tax at the user's rate (0 in a no-income-tax state), exactly as on the civilian side.
  // - Only base pay is taxable; BAH and BAS are excluded. State tax on the member's own
  //   military pay is not modeled (it depends on state of legal residence) — listed under
  //   "What this calculator does not include".
  const stateTaxRule = getStateMilitaryRetirementTax(input.retirementState);
  const wageStateRate = stateTaxRule?.treatment === 'no_income_tax' ? 0 : Math.max(0, input.stateTaxRate);
  const militaryFedBaseAnnual = basePay * 12 + input.spouseIncome;
  const militaryAnnualFedTax = estimateAnnualFederalTax(militaryFedBaseAnnual, input.filingStatus);
  const militaryFedEffectiveRate = militaryFedBaseAnnual > 0 ? militaryAnnualFedTax / militaryFedBaseAnnual : 0;
  const militaryFedTaxMonthly = militaryAnnualFedTax / 12;
  const militaryFICAMonthly = (militaryFedBaseAnnual * FICA_RATE) / 12;
  const militarySpouseStateTaxMonthly = (input.spouseIncome * wageStateRate) / 12;
  const militaryTakeHomeMonthly =
    militaryFedBaseAnnual / 12 - militaryFedTaxMonthly - militaryFICAMonthly - militarySpouseStateTaxMonthly
    + monthlyBAH + monthlyBAS;

  // 2. Retirement eligibility at planned separation
  const separationYOS = input.yearsOfService + input.separationMonths / 12;
  const isRetirementEligible = separationYOS >= 20;
  const yosAtSep = Math.floor(separationYOS);

  // 3. Pension (if retirement-eligible)
  const multiplier =
    input.retirementSystem === 'legacy' ? LEGACY_RETIREMENT_MULTIPLIER : BRS_RETIREMENT_MULTIPLIER;
  const grossRetiredPayMonthly = isRetirementEligible ? basePay * multiplier * yosAtSep : 0;

  // 4. VA compensation, and the VA waiver / CRDP / CRSC split of retired pay
  const vaCompMonthly = lookupVACompMonthly(input.vaRating, input.hasDependents);
  const split = splitRetiredPay(
    grossRetiredPayMonthly * 12,
    vaCompMonthly * 12,
    input.vaRating,
    separationYOS,
    input.crscEligible,
  );

  // 5. Projected civilian income — one household return (federal, FICA on wages, state rule)
  const taxesFor = (salary: number, retiredPayStateTaxed?: boolean) =>
    computeCivilianTaxes({
      salary,
      spouseIncome: input.spouseIncome,
      filingStatus: input.filingStatus,
      split,
      vaCompAnnual: vaCompMonthly * 12,
      stateRule: stateTaxRule,
      stateTaxRate: input.stateTaxRate,
      retiredPayStateTaxed,
    });
  // With the state rule unresolved, the primary result assumes the state taxes retired pay (conservative).
  const tax = taxesFor(input.targetCivilianSalary, true);
  const showBothStateCases = isUnresolvedStateRule(stateTaxRule) && split.taxableRetiredPayAnnual > 0;
  const taxExempt = showBothStateCases ? taxesFor(input.targetCivilianSalary, false) : null;

  const civilianFedEffectiveRate = tax.fedTaxableIncomeAnnual > 0 ? tax.fedTaxAnnual / tax.fedTaxableIncomeAnnual : 0;
  const civilianFedTaxMonthly = tax.fedTaxAnnual / 12;
  const civilianFICAMonthly = tax.ficaAnnual / 12;
  const civilianStateTaxMonthly = tax.stateTaxAnnual / 12;
  const afterTaxTaxableIncomeMonthly =
    (tax.fedTaxableIncomeAnnual - tax.fedTaxAnnual - tax.ficaAnnual - tax.stateTaxAnnual) / 12;
  const projectedCivilianMonthly = tax.netAnnual / 12;

  // Grossed-up civilian salary: the salary whose civilian household after-tax equals the
  // military household take-home — same filing status, spouse income on both sides, state
  // tax at the user's rate on wages. Retired pay and VA comp stay out of both sides here
  // (the copy calls them income "on top of this salary").
  const civilianWagesNetAnnual = (salary: number) =>
    computeCivilianTaxes({
      salary,
      spouseIncome: input.spouseIncome,
      filingStatus: input.filingStatus,
      split: splitRetiredPay(0, 0, 0, 0, false),
      vaCompAnnual: 0,
      stateRule: stateTaxRule,
      stateTaxRate: input.stateTaxRate,
    }).netAnnual;
  const grossedUpCivilianSalary =
    Math.round(solveIncreasing(civilianWagesNetAnnual, militaryTakeHomeMonthly * 12, 0) / 1000) * 1000;

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
    netAnnualForSalary: (salary) => taxesFor(salary, true).netAnnual,
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
    militarySpouseStateTaxMonthly,
    militaryTakeHomeMonthly,
    grossRetiredPayMonthly,
    vaWaiverMonthly: split.vaWaiverAnnual / 12,
    taxableRetiredPayMonthly: split.taxableRetiredPayAnnual / 12,
    crscMonthly: split.crscAnnual / 12,
    receivesCRDP: split.receivesCRDP,
    vaCompMonthly,
    filingStatus: tax.filingStatus,
    civilianFedTaxableIncomeAnnual: tax.fedTaxableIncomeAnnual,
    civilianFedEffectiveRate,
    civilianFedTaxMonthly,
    civilianFICAMonthly,
    civilianStateTaxMonthly,
    stateRetiredPayTaxedMonthly: tax.stateRetiredPayTaxedAnnual / 12,
    stateExemptionCapAnnual: tax.stateExemptionCapAnnual,
    stateTaxRule,
    afterTaxTaxableIncomeMonthly,
    projectedCivilianMonthly,
    projectedCivilianMonthlyIfStateTaxes: taxExempt ? projectedCivilianMonthly : null,
    projectedCivilianMonthlyIfStateExempts: taxExempt ? taxExempt.netAnnual / 12 : null,
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
