/**
 * The Transition Readiness worked example — one definition shared by the calculator
 * page (hero proof bar + example table), the "Are you financially ready" blog post
 * (<TransitionReadinessExample />), and the tests that keep public/llms.txt in sync.
 *
 * Server-side only: resolves BAH through bah.ts.
 */

import {
  calculateTransitionReadiness,
  DEFAULT_STATE_TAX_RATE,
  defaultFilingStatus,
  solveIncreasing,
} from '@/lib/calculations/transition-readiness';
import { getMHACode, getMHARates } from '@/lib/calculations/bah';
import type { TransitionReadinessInput, TransitionReadinessOutput } from '@/types/calculator';

// Scenario: E-6, 10 YOS, JBSA (78234), married, 14 months out, Legacy, $75k target
// salary, 40% VA, spouse $24k, $15k emergency fund, $45k TSP, $4,200/mo expenses,
// marketplace family healthcare.
export const TR_EXAMPLE_INPUT: TransitionReadinessInput = {
  payGrade: 'E-6',
  yearsOfService: 10,
  zipCode: '78234',
  hasDependents: true,
  separationMonths: 14,
  retirementSystem: 'legacy',
  targetCivilianSalary: 75000,
  spouseIncome: 24000,
  vaRating: 40,
  crscEligible: false,
  retirementState: null,
  stateTaxRate: DEFAULT_STATE_TAX_RATE,
  filingStatus: defaultFilingStatus(24000, true),
  healthcareAssumption: 'marketplace',
  expenseMode: 'quick',
  totalMonthlyExpenses: 4200,
  expenseHousing: 0,
  expenseCar: 0,
  expenseInsurance: 0,
  expenseGroceries: 0,
  expenseDebt: 0,
  expenseChildcare: 0,
  expenseUtilities: 0,
  expenseOther: 0,
  emergencyFund: 15000,
  tspBalance: 45000,
  otherSavings: 0,
};

function exampleBAH(): number {
  const mha = getMHACode(TR_EXAMPLE_INPUT.zipCode);
  return (mha && getMHARates(mha, TR_EXAMPLE_INPUT.hasDependents)?.[TR_EXAMPLE_INPUT.payGrade]) || 0;
}

export function getTransitionReadinessExample(): TransitionReadinessOutput {
  return calculateTransitionReadiness(TR_EXAMPLE_INPUT, exampleBAH());
}

// Blog action step: the salary the example member would negotiate toward.
export const TR_EXAMPLE_SURPLUS_TARGET = 2_000; // $/month

/**
 * Civilian salary (rounded up to the next $1,000) at which the example — same inputs and
 * filing status, only the salary changed — reaches TR_EXAMPLE_SURPLUS_TARGET per month.
 */
export function getExampleSalaryForSurplusTarget(): number {
  const bah = exampleBAH();
  const surplusAt = (salary: number) =>
    calculateTransitionReadiness({ ...TR_EXAMPLE_INPUT, targetCivilianSalary: salary }, bah).monthlyGapOrSurplus;
  return Math.ceil(solveIncreasing(surplusAt, TR_EXAMPLE_SURPLUS_TARGET, 0) / 1000) * 1000;
}
