import type { PayGrade } from './military';

// ─── Total Compensation ────────────────────────────────────────────────────

export interface TotalCompensationInput {
  payGrade: PayGrade;
  yearsOfService: number;
  hasDependents: boolean;
  zipCode: string;
  retirementSystem: 'legacy' | 'brs';
  tspContributionPct: number; // 0–100
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
  totalMonthly: number;
  totalAnnual: number;
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
