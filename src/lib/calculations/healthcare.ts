/**
 * Healthcare cost comparison math, moved unchanged from
 * HealthcareComparisonCalculator.tsx so the calculator and the page's
 * server-rendered summary block (src/lib/calculatorSummaries.ts) share it.
 * Figures come from src/data/healthcare/2026/constants.ts; TRICARE Reserve
 * Select reads src/data/tricare/current.ts (TRICARE_COST_YEAR).
 */

import {
  HEALTHCARE_2026,
  type PlanTier,
  type VaRating,
  type CoveragePath,
  type FamilyStatus,
} from '@/data/healthcare/2026/constants';
import { currentTricareCosts, upcomingTricareCosts } from '@/data/tricare/current';

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

// ─── TRICARE Reserve Select ───────────────────────────────────────────────────

const usd0 = (n: number) => '$' + n.toLocaleString('en-US');
const usd2 = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * TRS follows TRICARE Select Group B active duty family member cost-sharing
 * (HC-03): the deductible shown is for sponsors in pay grade E-5 and above,
 * and the out-of-pocket maximum is the Group B catastrophic cap, which TRICARE
 * sets per family, so single and family coverage show the same cap.
 */
export function trsCosts(coverage: 'single' | 'family') {
  const c = currentTricareCosts;
  const ded = c.adfm.selectB.deductible.e5AndAbove;
  return {
    premium: coverage === 'family' ? c.premiumPlans.trsFamily : c.premiumPlans.trsMember,
    deductible: coverage === 'family' ? ded.family : ded.individual,
    oopMax: c.adfm.selectB.catastrophicCap,
  };
}

export function trsNotes(): string[] {
  const c = currentTricareCosts;
  const junior = c.adfm.selectB.deductible.e1ToE4;
  const notes = [
    'Must have qualifying Reserve/Guard service and a drilling unit assignment.',
    `Sponsors in pay grades E-1–E-4 have a lower deductible (${usd0(junior.individual)} individual / ${usd0(junior.family)} family).`,
    `The out-of-pocket maximum is TRICARE's catastrophic cap, ${usd0(c.adfm.selectB.catastrophicCap)} a year, set per family.`,
  ];
  if (upcomingTricareCosts) {
    const u = upcomingTricareCosts.premiumPlans;
    notes.push(
      `${upcomingTricareCosts.year} premiums (from Jan. 1, ${upcomingTricareCosts.year}): ${usd2(u.trsMember)} member only / ${usd2(u.trsFamily)} member and family.`,
    );
  }
  return notes;
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
      const p = trsCosts(coverage);
      const dedUsage = Math.round(p.deductible * 0.45);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: p.oopMax,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: trsNotes(),
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
