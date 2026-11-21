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
  type RetireePlan,
  type RetireeGroup,
} from '@/data/healthcare/2026/constants';
import { currentTricareCosts, upcomingTricareCosts } from '@/data/tricare/current';

// ─── Allowed values (share links are validated against these: HC-01) ─────────

export const COVERAGE_PATHS: readonly CoveragePath[] = ['employer', 'aca-no-subsidy', 'va', 'trs', 'tricare-retiree', 'tamp'];
export const FAMILY_STATUSES: readonly FamilyStatus[] = [
  'single', 'married-no-kids', 'married-1-child', 'married-2-children', 'married-3plus', 'single-parent',
];
export const PLAN_TIERS: readonly PlanTier[] = ['bronze', 'silver', 'gold'];
export const VA_RATINGS: readonly VaRating[] = ['50plus', '30to40', '10to20', '0sc'];
export const RETIREE_PLANS: readonly RetireePlan[] = ['prime', 'select'];
export const RETIREE_GROUPS: readonly RetireeGroup[] = ['a', 'b'];

export interface HealthcareUrlState {
  family?: FamilyStatus;
  path?: CoveragePath;
  tier?: PlanTier;
  rating?: VaRating;
  plan?: RetireePlan;
  group?: RetireeGroup;
  tamp?: boolean;
}

function pickAllowed<T extends string>(allowed: readonly T[], raw: string | null): T | undefined {
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

/**
 * The settings a share link carries, keeping only values the calculator accepts; anything
 * else is dropped so the calculator keeps its default (HC-01). Older links with
 * path=aca-subsidy open the ACA path without a subsidy (HC-02); their income= is ignored.
 */
export function parseHealthcareParams(raw: Readonly<Record<keyof HealthcareUrlState, string | null>>): HealthcareUrlState {
  return {
    family: pickAllowed(FAMILY_STATUSES, raw.family),
    path: raw.path === 'aca-subsidy' ? 'aca-no-subsidy' : pickAllowed(COVERAGE_PATHS, raw.path),
    tier: pickAllowed(PLAN_TIERS, raw.tier),
    rating: pickAllowed(VA_RATINGS, raw.rating),
    plan: pickAllowed(RETIREE_PLANS, raw.plan),
    group: pickAllowed(RETIREE_GROUPS, raw.group),
    tamp: raw.tamp === 'true' ? true : undefined,
  };
}

/** HC-02: the calculator shows list prices only. */
export const ACA_TAX_CREDIT_NOTE =
  'Premium tax credits depend on household income; see HealthCare.gov for your actual price.';

/** Share of the deductible the calculator assumes a household uses in a year. */
export const DEDUCTIBLE_USAGE_SHARE = 0.45;

export function isFamily(fs: FamilyStatus): boolean {
  return fs !== 'single';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalcResult {
  /** Retiree TRICARE: the annual enrollment fee per month (fee ÷ 12). */
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  oopMax: number;
  estimatedDeductibleUsage: number;
  firstYearTotal: number;
  notes: string[];
  vaRatingLabel?: string;
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

// ─── TRICARE for military retirees (HC-05) ──────────────────────────────────

/** Retiree TRICARE Prime or Select, Group A or B, from the current TRICARE cost year. */
export function retireeTricareCosts(coverage: 'single' | 'family', plan: RetireePlan, group: RetireeGroup) {
  const c = currentTricareCosts.retiree;
  const p = plan === 'prime'
    ? (group === 'a' ? c.primeA : c.primeB)
    : (group === 'a' ? c.selectA : c.selectB);
  const pick = (v: { individual: number; family: number }) => (coverage === 'family' ? v.family : v.individual);
  return {
    year: currentTricareCosts.year,
    enrollmentFeeAnnual: pick(p.enrollmentFee),
    deductible: pick(p.deductible),
    catastrophicCap: p.catastrophicCap,
  };
}

export const RETIREE_PLAN_LABEL: Record<RetireePlan, string> = { prime: 'TRICARE Prime', select: 'TRICARE Select' };

export function retireeTricareNotes(plan: RetireePlan, group: RetireeGroup): string[] {
  const year = currentTricareCosts.year;
  const notes = [
    `${year} TRICARE rates for retirees: ${RETIREE_PLAN_LABEL[plan]}, Group ${group.toUpperCase()}. The monthly figure is the annual enrollment fee ÷ 12.`,
    group === 'a'
      ? 'Group A applies if you entered service before Jan. 1, 2018; Group B rates differ.'
      : 'Group B applies if you entered service on or after Jan. 1, 2018.',
    plan === 'prime'
      ? 'Prime has no deductible; copays apply per visit. Prime is offered only in some locations.'
      : 'Copays or cost-shares apply when you use care.',
  ];
  if (upcomingTricareCosts) {
    const u = upcomingTricareCosts.retiree;
    const up = plan === 'prime' ? (group === 'a' ? u.primeA : u.primeB) : (group === 'a' ? u.selectA : u.selectB);
    notes.push(
      `${upcomingTricareCosts.year} enrollment fees (from Jan. 1, ${upcomingTricareCosts.year}): ${usd2(up.enrollmentFee.individual)} individual / ${usd2(up.enrollmentFee.family)} family per year.`,
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
  retiree: { plan: RetireePlan; group: RetireeGroup } = { plan: 'select', group: 'a' },
): CalcResult {
  const family = isFamily(familyStatus);
  const coverage = family ? 'family' : 'single';

  switch (path) {
    case 'employer': {
      const p = HEALTHCARE_2026.employer[coverage][tier];
      const dedUsage = Math.round(p.deductible * DEDUCTIBLE_USAGE_SHARE);
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
      const dedUsage = Math.round(p.deductible * DEDUCTIBLE_USAGE_SHARE);
      return {
        monthlyPremium: p.premium,
        annualPremium: p.premium * 12,
        deductible: p.deductible,
        oopMax: 0,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: p.premium * 12 + dedUsage,
        notes: [ACA_TAX_CREDIT_NOTE],
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
      const dedUsage = Math.round(p.deductible * DEDUCTIBLE_USAGE_SHARE);
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

    case 'tricare-retiree': {
      const r = retireeTricareCosts(coverage, retiree.plan, retiree.group);
      const dedUsage = Math.round(r.deductible * DEDUCTIBLE_USAGE_SHARE);
      return {
        monthlyPremium: r.enrollmentFeeAnnual / 12,
        annualPremium: r.enrollmentFeeAnnual,
        deductible: r.deductible,
        oopMax: r.catastrophicCap,
        estimatedDeductibleUsage: dedUsage,
        firstYearTotal: r.enrollmentFeeAnnual + dedUsage,
        notes: retireeTricareNotes(retiree.plan, retiree.group),
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

// ─── First year with TAMP ────────────────────────────────────────────────────

export interface TampSplit {
  lastSixMonthsPremiums: number;
  lastSixMonthsDeductible: number;
  totalFirstYear: number;
}

/**
 * First year when TAMP covers the first 180 days: six months of the follow-on plan's
 * premiums. A deductible is annual and resets each January, so the follow-on plan's
 * estimated deductible usage is counted in full, not halved (HC-06).
 */
export function tampFirstYearSplit(result: CalcResult): TampSplit {
  const lastSixMonthsPremiums = result.monthlyPremium * 6;
  const lastSixMonthsDeductible = result.estimatedDeductibleUsage;
  return {
    lastSixMonthsPremiums,
    lastSixMonthsDeductible,
    totalFirstYear: lastSixMonthsPremiums + lastSixMonthsDeductible,
  };
}
