import type { PayGrade } from './military';
import type { StateMilitaryRetirementTax } from '@/data/state-military-retirement-tax';

// ─── Total Compensation ────────────────────────────────────────────────────

export interface TotalCompensationInput {
  payGrade: PayGrade;
  yearsOfService: number;
  hasDependents: boolean;
  zipCode: string;
  retirementSystem: 'legacy' | 'brs';
  tspContributionPct: number; // 0–100
  govHousing: boolean; // living in barracks/on-post (no cash BAH)
  mealCard: boolean;   // dining facility meal card (no cash BAS)
}

export interface TotalCompensationOutput {
  monthlyBasePay: number;
  annualBasePay: number;
  monthlyBAH: number;
  annualBAH: number;
  monthlyBAS: number;
  annualBAS: number;
  tspAgencyContribution: number; // annual, BRS only
  sgli: number; // annual premium
  taxAdvantageValue: number; // annual estimated tax savings on BAH/BAS
  totalMonthly: number;  // full economic value (cash + in-kind)
  totalAnnual: number;
  cashMonthly: number;   // what actually hits the bank account
  cashAnnual: number;
  inKindMonthly: number; // estimated value of in-kind housing/meals
  tricareSavings: number; // annual value of TRICARE vs. employer plan
  // For "equivalent civilian salary" comparison
  civilianEquivalent: number;
}

// ─── BAH ──────────────────────────────────────────────────────────────────

export interface BAHInput {
  payGrade: PayGrade;
  zipCode: string;
  hasDependents: boolean;
}

export interface BAHOutput {
  monthlyRate: number;
  annualRate: number;
  mhaCode: string; // Military Housing Area code
  locationName: string;
  dataYear: string;
}

// ─── VA Disability ────────────────────────────────────────────────────────

export interface VADisabilityRating {
  percentage: number; // 0–100
}

export interface VADisabilityInput {
  ratings: VADisabilityRating[]; // individual condition ratings
  hasDependents: boolean;
  dependentChildren: number;
  hasSpouse: boolean;
  spouseAA: boolean; // Aid and Attendance
  dependentParents: number; // 0–2
  isMedicallyRetired: boolean;
  militaryRetiredPay?: number; // monthly, for CRDP/CRSC calc
}

export interface VADisabilityOutput {
  combinedRating: number; // "whole person" method result
  roundedRating: number; // rounded to nearest 10%
  monthlyCompensation: number;
  annualCompensation: number;
  taxFreeAnnual: number;
  isCRDPEligible: boolean;
  breakdown: {
    baseCompensation: number;
    spouseAddition: number;
    childrenAddition: number;
    parentAddition: number;
    aaAddition: number;
  };
}

// ─── TSP ──────────────────────────────────────────────────────────────────

export interface TSPInput {
  monthlyBasePay: number;
  contributionPct: number; // 0–100
  retirementSystem: 'legacy' | 'brs';
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualReturnPct: number; // assumed rate of return
}

export interface TSPOutput {
  monthlyContribution: number;
  annualContribution: number;
  agencyMatchMonthly: number; // BRS only
  agencyMatchAnnual: number; // BRS only
  projectedBalance: number;
  projectedMonthlyIncome: number; // 4% SWR
  yearsToGrow: number;
}

// ─── Retirement ───────────────────────────────────────────────────────────

export type RetirementSystem = 'high3' | 'brs';
export type VADisabilityRatingOption = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;

export interface RetirementInput {
  retirementSystem: RetirementSystem;
  currentGrade: string;
  currentYOS: number;
  retirementYOS: number;
  retirementGrade: string;
  // BRS-only TSP fields
  tspContributionPct: number; // 0–100
  tspCurrentBalance: number;
  tspAnnualReturnPct: number; // e.g. 7
  // Optional
  vaRating: VADisabilityRatingOption;
}

export interface RetirementOutput {
  // High-3 average base pay
  high3Average: number;
  high3Breakdown: [number, number, number]; // [YOS, YOS-1, YOS-2] base pay values
  // Pension
  pensionMultiplierPct: number; // e.g. 50 for High-3 at 20 yrs
  monthlyPension: number;
  annualPension: number;
  // Lifetime value
  estimatedRetirementAge: number;
  yearsOfCollection: number;
  lifetimeValue: number;
  // TSP (BRS only — zero for High-3)
  tspProjectedBalance: number;
  tspMonthlyIncome: number;
  totalBRSMonthlyIncome: number; // pension + TSP monthly
  // VA disability (if selected)
  monthlyVA: number;
  totalMonthlyIncome: number; // pension + VA (or pension + TSP + VA for BRS)
  crdpEligible: boolean;
  // Civilian equivalent
  civilianEquivalent: number;
  // Stay vs. Go insight
  yearsFromVesting: number;
  lifetimeValueOfStaying: number; // if < 20 yrs
  marginalYearValue: number; // monthly value per additional year
  // High-3 comparison values (for BRS side-by-side)
  high3MonthlyPension: number;
}

// ─── Shared ────────────────────────────────────────────────────────────────

export interface ActionStep {
  label: string;
  description: string;
  href?: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Transition Readiness ──────────────────────────────────────────────────

// Federal filing status. Separate from BAH dependent status — a single parent draws
// with-dependents BAH but files as head of household.
export type FilingStatus = 'single' | 'mfj' | 'hoh';

export interface TransitionReadinessInput {
  payGrade: PayGrade;
  yearsOfService: number;
  zipCode: string;
  hasDependents: boolean;
  separationMonths: number;
  retirementSystem: 'legacy' | 'brs';
  targetCivilianSalary: number;
  spouseIncome: number;
  vaRating: number; // 0–100, or -1 for "haven't filed"
  crscEligible: boolean; // user says the disability is combat-related (CRSC)
  retirementState: string | null; // USPS code from state-military-retirement-tax.ts; null = "not sure yet"
  stateTaxRate: number; // user-entered effective state rate, decimal (0.05 = 5%)
  filingStatus: FilingStatus; // used on BOTH the military and civilian sides
  healthcareAssumption: 'marketplace' | 'employer' | 'va' | 'not-sure';
  expenseMode: 'quick' | 'detailed';
  totalMonthlyExpenses: number;
  expenseHousing: number;
  expenseCar: number;
  expenseInsurance: number;
  expenseGroceries: number;
  expenseDebt: number;
  expenseChildcare: number;
  expenseUtilities: number;
  expenseOther: number;
  emergencyFund: number;
  tspBalance: number;
  otherSavings: number;
}

export interface TransitionReadinessOutput {
  militaryMonthlyBasePay: number;
  militaryMonthlyBAH: number;
  militaryMonthlyBAS: number;
  militaryTaxAdvantageMonthly: number;
  militaryTotalMonthly: number;
  // After-tax military breakdown
  // Household basis: base pay + spouse wages on one return (same filing status as civilian side)
  militaryFedEffectiveRate: number; // federal tax ÷ (base pay + spouse wages)
  militaryFedTaxMonthly: number;
  militaryFICAMonthly: number; // base pay + spouse wages
  militarySpouseStateTaxMonthly: number; // state tax on spouse wages only (see lib comment)
  militaryTakeHomeMonthly: number;
  // Retired pay and VA offset
  grossRetiredPayMonthly: number; // pension formula before any VA waiver
  vaWaiverMonthly: number; // retired pay waived to receive VA comp (rating below 50%)
  taxableRetiredPayMonthly: number; // retired pay after waiver — federally taxable
  crscMonthly: number; // tax-free CRSC restoring the waived amount
  receivesCRDP: boolean;
  vaCompMonthly: number;
  // After-tax civilian breakdown (one household return)
  filingStatus: FilingStatus;
  civilianFedTaxableIncomeAnnual: number; // gross income subject to federal tax, before the standard deduction
  civilianFedEffectiveRate: number; // federal tax ÷ civilianFedTaxableIncomeAnnual
  civilianFedTaxMonthly: number;
  civilianFICAMonthly: number; // wages only — not retired pay
  civilianStateTaxMonthly: number;
  stateRetiredPayTaxedMonthly: number; // retired pay included in the state base
  stateExemptionCapAnnual: number | null; // cap-based partial states, after modeled conditions (GA/CA/ID)
  stateTaxRule: StateMilitaryRetirementTax | null;
  afterTaxTaxableIncomeMonthly: number; // wages + taxable retired pay, minus all taxes
  projectedCivilianMonthly: number;
  // "I'm not sure yet" or a "varies" state, with retired pay: both outcomes (primary result uses the taxed one)
  projectedCivilianMonthlyIfStateTaxes: number | null;
  projectedCivilianMonthlyIfStateExempts: number | null;
  grossedUpCivilianSalary: number;
  isRetirementEligible: boolean;
  separationYOS: number;
  healthcareCostMonthly: number;
  healthcareAssumptionLabel: string;
  hasRetireeTricare: boolean;
  rawMonthlyExpenses: number;
  adjustedMonthlyExpenses: number;
  monthlyGapOrSurplus: number;
  totalLiquidSavings: number;
  emergencyFundMonths: number;
  verdict: 'ready' | 'almost' | 'not-yet';
  surplusStatus: 'green' | 'yellow' | 'red';
  emergencyFundStatus: 'green' | 'yellow' | 'red';
  vaClaimStatus: 'green' | 'yellow' | 'na';
  timelineStatus: 'green' | 'yellow' | 'red';
  actionSteps: ActionStep[];
}
