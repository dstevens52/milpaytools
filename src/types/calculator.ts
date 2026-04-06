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

// ─── Shared ────────────────────────────────────────────────────────────────

export interface ActionStep {
  label: string;
  description: string;
  href?: string;
  priority: 'high' | 'medium' | 'low';
}
