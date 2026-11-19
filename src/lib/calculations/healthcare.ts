/**
 * Healthcare cost comparison math, moved unchanged from
 * HealthcareComparisonCalculator.tsx so the calculator and the page's
 * server-rendered summary block (src/lib/calculatorSummaries.ts) share it.
 * Figures come from src/data/healthcare/2026/constants.ts.
 */

import {
  HEALTHCARE_2026,
  type PlanTier,
  type VaRating,
  type CoveragePath,
  type FamilyStatus,
} from '@/data/healthcare/2026/constants';

export function getHouseholdSize(fs: FamilyStatus): number {
  switch (fs) {
    case 'single': return 1;
    case 'married-no-kids': return 2;
    case 'married-1-child': return 3;
    case 'married-2-children': return 4;
    case 'married-3plus': return 5;
    case 'single-parent': return 2;
  }
}

export function getFPL(size: number): number {
  return HEALTHCARE_2026.fpl.base1 + (size - 1) * HEALTHCARE_2026.fpl.increment;
}

export function getSubsidyRate(income: number, fpl: number): number {
  const pct = (income / fpl) * 100;
  for (const band of HEALTHCARE_2026.acaSubsidyBands) {
    if (pct < band.maxPct) return band.subsidyRate;
  }
  return 0;
}

export function isFamily(fs: FamilyStatus): boolean {
  return fs !== 'single';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalcResult {
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  oopMax: number;
  estimatedDeductibleUsage: number;
  firstYearTotal: number;
  notes: string[];
  vaRatingLabel?: string;
  subsidyRate?: number;
  coversFamily: boolean;
  isTamp: boolean;
}

// ─── Calculation logic ────────────────────────────────────────────────────────

export function calculateHealthcare(
  familyStatus: FamilyStatus,
  path: CoveragePath,
  tier: PlanTier,
  vaRating: VaRating,
  annualIncome: number,
): CalcResult {
  const family = isFamily(familyStatus);
  const coverage = family ? 'family' : 'single';

  switch (path) {
    case 'employer': {
      const p = HEALTHCARE_2026.employer[coverage][tier];
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: p.oopMax,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: [],
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'aca-no-subsidy': {
      const p = HEALTHCARE_2026.acaNoSubsidy[coverage][tier];
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: 0,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: [],
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'aca-subsidy': {
      const base = HEALTHCARE_2026.acaNoSubsidy[coverage][tier];
      const fpl = getFPL(getHouseholdSize(familyStatus));
      const rate = annualIncome > 0 ? getSubsidyRate(annualIncome, fpl) : 0;
      const subsidizedMonthly = Math.max(0, Math.round(base.premium * (1 - rate)));
      const dedUsage = Math.round(base.deductible * 0.45);
      const notes: string[] = [];
      if (annualIncome > 0) {
        notes.push(`Estimated ~${Math.round(rate * 100)}% subsidy applied. Actual subsidy depends on age, location, and benchmark plan — verify at Healthcare.gov.`);
      } else {
        notes.push('Enter annual household income for an approximate subsidy estimate.');
      }
      return {
        monthlyPremium: subsidizedMonthly,
        annualPremium: subsidizedMonthly * 12,
        deductible: base.deductible,
        oopMax: 0,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: subsidizedMonthly * 12 + dedUsage,
        notes,
        subsidyRate: rate,
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'va': {
      const va = HEALTHCARE_2026.va[vaRating];
      const annualCopayEst = va.monthlyCopayEst * 12;
      return {
        monthlyPremium: 0,
        annualPremium: 0,
        deductible: 0,
        oopMax: 0,
        estimatedDeductibleUsage: annualCopayEst,
        firstYearTotal: annualCopayEst,
        notes: [va.note],
        vaRatingLabel: va.label,
        coversFamily: false,
        isTamp: false,
      };
    }

    case 'trs': {
      const p = HEALTHCARE_2026.tricareReserveSelect[coverage];
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: p.oopMax,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: ['Must have qualifying Reserve/Guard service and a drilling unit assignment.'],
        coversFamily: family,
        isTamp: false,
      };
    }

    case 'tamp': {
      return {
        monthlyPremium: 0,
        annualPremium: 0,
        deductible: 0,
        oopMax: 0,
        estimatedDeductibleUsage: 0,
        firstYearTotal: 0,
        notes: [HEALTHCARE_2026.tamp.note],
        coversFamily: family,
        isTamp: true,
      };
    }
  }
}
