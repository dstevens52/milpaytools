import { test, expect } from '@playwright/test';
import {
  TAMP_ELIGIBILITY,
  TAMP_VOLUNTARY_NOTE,
  tampEndDate,
  vgliDeadline,
  vgliNoHealthReviewEnd,
  preseparationCounselingStart,
} from '../../src/data/separation/rules';
import {
  buildTimeline,
  parseISODate,
  separationDeadlines,
} from '../../src/lib/calculations/separation-timeline';
import {
  calculateHealthcare,
  parseHealthcareParams,
  tampFirstYearSplit,
  ACA_TAX_CREDIT_NOTE,
  COVERAGE_PATHS,
} from '../../src/lib/calculations/healthcare';
import { HEALTHCARE_2026 } from '../../src/data/healthcare/2026/constants';
import { TRICARE_COSTS_2026 } from '../../src/data/tricare/2026/costs';
import { TRICARE_COST_YEAR, currentTricareCosts } from '../../src/data/tricare/current';
import { calculateTransitionReadiness, defaultFilingStatus } from '../../src/lib/calculations/transition-readiness';
import type { TransitionReadinessInput } from '../../src/types/calculator';

// Build 10a (FIX_QUEUE row 10): HC-01/02/04/05/06, TR-02–05, SEP-02–05. No browser page.
// Rules: docs/sources/separation-rules-2026.md.

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

test.describe('SEP-03 VGLI deadline: one calendar year, then 120 days', () => {
  for (const [sep, want] of [
    ['2027-06-01', '2028-09-29'],
    ['2027-03-01', '2028-06-29'],
    ['2026-09-30', '2028-01-28'],
  ] as const) {
    test(`${sep} → ${want}`, () => {
      expect(ymd(vgliDeadline(parseISODate(sep)!))).toBe(want);
    });
  }

  test('Feb 29 separation: the anniversary is Feb 28 (Feb 29, 2028 → Jun 28, 2029)', () => {
    expect(ymd(vgliDeadline(day(2028, 2, 29)))).toBe('2029-06-28');
    // Not Mar 1 + 120 days (the old roll-over).
    expect(ymd(vgliDeadline(day(2028, 2, 29)))).not.toBe('2029-06-29');
    // Feb 28 stays Feb 28, also into a leap year.
    expect(ymd(vgliDeadline(day(2027, 2, 28)))).toBe('2028-06-27');
  });

  test('240 days is the no-health-review window, not the deadline', () => {
    expect(ymd(vgliNoHealthReviewEnd(day(2026, 9, 30)))).toBe('2027-05-28');
  });

  test('no timeline text states a fixed 485 days', () => {
    const items = buildTimeline(day(2027, 6, 1), day(2026, 11, 20), 'separating', 'unknown', 'unknown');
    for (const i of items) expect(i.what, i.id).not.toMatch(/485/);
    expect(ymd(items.find((i) => i.id === 'vgli-closes')!.date!)).toBe('2028-09-29');
  });
});

test.describe('SEP-04 TAMP day 1 and preseparation counseling', () => {
  test('TAMP for a Mar 1, 2027 separation ends Aug 27, 2027 (the separation date is day 1)', () => {
    expect(ymd(tampEndDate(day(2027, 3, 1)))).toBe('2027-08-27');
    const tamp = buildTimeline(day(2027, 3, 1), day(2026, 11, 20), 'separating', 'yes', 'no').find((i) => i.id === 'tamp')!;
    expect(ymd(tamp.startDate!)).toBe('2027-03-01');
    expect(ymd(tamp.endDate!)).toBe('2027-08-27');
  });

  test('preseparation counseling card: no later than 365 days before (10 U.S.C. § 1142)', () => {
    expect(ymd(preseparationCounselingStart(day(2027, 6, 1)))).toBe('2026-06-01');
    const card = buildTimeline(day(2027, 6, 1), day(2026, 11, 20), 'separating', 'unknown', 'unknown').find((i) => i.id === 'tap-start')!;
    expect(card.what).toContain('no later than 365 days');
    expect(card.what).toContain('§ 1142');
    expect(ymd(card.date!)).toBe('2026-06-01');
  });
});

test.describe('SEP-02 retirees', () => {
  test('retiring: no TAMP period, a retiree TRICARE enrollment card instead', () => {
    for (const tamp of ['yes', 'no', 'unknown'] as const) {
      const items = buildTimeline(day(2027, 6, 1), day(2026, 11, 20), 'retiring', tamp, 'unknown');
      expect(items.find((i) => i.id === 'tamp'), tamp).toBeUndefined();
      expect(items.find((i) => i.id === 'retiree-tricare')?.what).toMatch(/enroll in TRICARE Prime or TRICARE Select/);
      expect(items.find((i) => i.id === 'tricare-ends')?.what).not.toMatch(/TAMP/);
    }
  });

  test('retiree card: retirement date + 90 days, with the 12-month retroactive note', () => {
    const card = buildTimeline(day(2027, 6, 1), day(2026, 11, 20), 'retiring', 'unknown', 'unknown')
      .find((i) => i.id === 'retiree-tricare')!;
    expect(ymd(card.date!)).toBe('2027-08-30');
    expect(card.phase).toBe('post');
    expect(card.what).toContain('90 days after your retirement date');
    expect(card.what).toContain('retroactive enrollment up to 12 months from your retirement date');
    expect(ymd(separationDeadlines(day(2027, 6, 1), 'retiring').retireeTricareEnrollmentDeadline)).toBe('2027-08-30');
  });

  test('separating with TAMP unknown: TAMP period shown, no retiree card', () => {
    const items = buildTimeline(day(2027, 6, 1), day(2026, 11, 20), 'separating', 'unknown', 'unknown');
    expect(items.find((i) => i.id === 'tamp')).toBeDefined();
    expect(items.find((i) => i.id === 'retiree-tricare')).toBeUndefined();
  });

  test('final move limits unchanged (180 days / 3 years)', () => {
    expect(ymd(separationDeadlines(day(2026, 9, 30), 'separating').finalMoveDeadline)).toBe('2027-03-29');
    expect(ymd(separationDeadlines(day(2026, 9, 30), 'retiring').finalMoveDeadline)).toBe('2029-09-30');
  });
});

test.describe('SEP-05 impossible dates are rejected', () => {
  test('2026-02-31 and 2026-13-45 → null (not rolled forward)', () => {
    expect(parseISODate('2026-02-31')).toBeNull();
    expect(parseISODate('2026-13-45')).toBeNull();
    expect(parseISODate('2027-02-29')).toBeNull();
    expect(parseISODate('2026-6-1')).toBeNull();
  });

  test('real dates still parse, leap day included', () => {
    expect(ymd(parseISODate('2028-02-29')!)).toBe('2028-02-29');
    expect(ymd(parseISODate('2027-06-30')!)).toBe('2027-06-30');
  });
});

test.describe('HC-04 / TR-01 TAMP eligibility: one statutory list', () => {
  test('seven categories from 10 U.S.C. § 1145(a)(2); none that the statute leaves out', () => {
    expect(TAMP_ELIGIBILITY).toHaveLength(7);
    const all = TAMP_ELIGIBILITY.join(' | ');
    expect(all).toContain('Involuntary separation');
    expect(all).toContain('Selected Reserve');
    expect(all).toContain('stop-loss');
    expect(all).toContain('Sole survivorship');
    expect(all).not.toMatch(/early retirement|VSI|SSB|Voluntary Separation Incentive/i);
    expect(TAMP_VOLUNTARY_NOTE).toMatch(/does not qualify on its own/);
  });

  test('the healthcare data note no longer states TAMP as a given', () => {
    expect(HEALTHCARE_2026.tamp.note).toMatch(/^If you qualify for TAMP/);
    expect(HEALTHCARE_2026.tamp.note).toContain('separation date (day 1)');
  });
});

test.describe('HC-01 share-link values are validated', () => {
  const none = { family: null, path: null, tier: null, rating: null, plan: null, group: null, tamp: null };

  test('unknown path, tier, rating, family, plan, group are dropped', () => {
    const u = parseHealthcareParams({
      family: 'x', path: 'cobra', tier: 'platinum', rating: '70', plan: 'gold', group: 'c', tamp: 'yes',
    });
    expect(u).toEqual({
      family: undefined, path: undefined, tier: undefined, rating: undefined, plan: undefined, group: undefined, tamp: undefined,
    });
  });

  test('accepted values pass through', () => {
    expect(parseHealthcareParams({ ...none, family: 'married-2-children', path: 'tricare-retiree', plan: 'prime', group: 'b', tamp: 'true' }))
      .toMatchObject({ family: 'married-2-children', path: 'tricare-retiree', plan: 'prime', group: 'b', tamp: true });
  });

  test('every accepted path calculates without throwing', () => {
    for (const p of COVERAGE_PATHS) {
      const r = calculateHealthcare('married-1-child', p, 'silver', '30to40');
      expect(Number.isFinite(r.firstYearTotal), p).toBe(true);
    }
  });
});

test.describe('HC-02 no computed ACA subsidy', () => {
  test('old aca-subsidy links open the no-subsidy path', () => {
    expect(parseHealthcareParams({
      family: 'married-1-child', path: 'aca-subsidy', tier: null, rating: null, plan: null, group: null, tamp: null,
    }).path).toBe('aca-no-subsidy');
    expect(COVERAGE_PATHS).not.toContain('aca-subsidy');
  });

  test('ACA path: list price plus the tax-credit line', () => {
    const r = calculateHealthcare('single', 'aca-no-subsidy', 'silver', '50plus');
    expect(r.monthlyPremium).toBe(HEALTHCARE_2026.acaNoSubsidy.single.silver.premium);
    expect(r.notes).toContain(ACA_TAX_CREDIT_NOTE);
    expect(ACA_TAX_CREDIT_NOTE).toBe('Premium tax credits depend on household income; see HealthCare.gov for your actual price.');
  });
});

test.describe('HC-05 retiree TRICARE path (current TRICARE year)', () => {
  test('cost year is the 2026 file until Jan 1, 2027', () => {
    expect(TRICARE_COST_YEAR).toBe(2026);
    expect(currentTricareCosts).toBe(TRICARE_COSTS_2026);
  });

  test('Prime Group A family 2026 = $765.00/yr enrollment', () => {
    const fee = TRICARE_COSTS_2026.retiree.primeA.enrollmentFee.family;
    expect(fee).toBe(765.0);
    const r = calculateHealthcare('married-2-children', 'tricare-retiree', 'silver', '50plus', { plan: 'prime', group: 'a' });
    expect(r.annualPremium).toBe(fee);
    expect(r.monthlyPremium).toBeCloseTo(fee / 12, 10);
    expect(r.deductible).toBe(0);
    expect(r.oopMax).toBe(TRICARE_COSTS_2026.retiree.primeA.catastrophicCap);
    expect(r.firstYearTotal).toBe(fee);
  });

  test('Select Group B family 2026 = $1,191.00/yr enrollment, plus the ~45% deductible convention', () => {
    const p = TRICARE_COSTS_2026.retiree.selectB;
    expect(p.enrollmentFee.family).toBe(1191.0);
    const r = calculateHealthcare('married-1-child', 'tricare-retiree', 'silver', '50plus', { plan: 'select', group: 'b' });
    expect(r.annualPremium).toBe(p.enrollmentFee.family);
    expect(r.deductible).toBe(p.deductible.family);
    expect(r.estimatedDeductibleUsage).toBe(Math.round(p.deductible.family * 0.45));
    expect(r.firstYearTotal).toBe(p.enrollmentFee.family + Math.round(p.deductible.family * 0.45));
    expect(r.notes.join(' ')).toContain('Group B applies if you entered service on or after Jan. 1, 2018.');
  });

  test('Group A note and year label from the data; Select Group A is the default', () => {
    const r = calculateHealthcare('single', 'tricare-retiree', 'silver', '50plus');
    expect(r.annualPremium).toBe(TRICARE_COSTS_2026.retiree.selectA.enrollmentFee.individual);
    expect(r.notes).toContain('Group A applies if you entered service before Jan. 1, 2018; Group B rates differ.');
    expect(r.notes[0]).toContain(`${TRICARE_COST_YEAR} TRICARE rates for retirees`);
  });
});

test.describe('HC-06 smaller items', () => {
  test('0% service-connected: no "limited to service-connected conditions" claim', () => {
    expect(HEALTHCARE_2026.va['0sc'].note).not.toMatch(/limited to service-connected/);
  });

  test('TAMP split counts the full annual deductible estimate (deductibles reset in January)', () => {
    const r = calculateHealthcare('single', 'employer', 'silver', '50plus');
    const split = tampFirstYearSplit(r);
    expect(split.lastSixMonthsDeductible).toBe(r.estimatedDeductibleUsage);
    expect(split.totalFirstYear).toBe(r.monthlyPremium * 6 + r.estimatedDeductibleUsage);
  });
});

// ─── Transition readiness ──────────────────────────────────────────────────

const BASE: TransitionReadinessInput = {
  payGrade: 'E-7', yearsOfService: 20, zipCode: '', hasDependents: true, separationMonths: 12,
  retirementSystem: 'legacy', targetCivilianSalary: 90000, spouseIncome: 0, vaRating: 30, crscEligible: false,
  retirementState: null, stateTaxRate: 0.05, filingStatus: defaultFilingStatus(0, true), healthcareAssumption: 'employer',
  expenseMode: 'quick', totalMonthlyExpenses: 4000, expenseHousing: 0, expenseCar: 0, expenseInsurance: 0,
  expenseGroceries: 0, expenseDebt: 0, expenseChildcare: 0, expenseUtilities: 0, expenseOther: 0,
  emergencyFund: 40000, tspBalance: 0, otherSavings: 0,
};
const tr = (o: Partial<TransitionReadinessInput>) => calculateTransitionReadiness({ ...BASE, ...o }, 1956);
const SEPARATING = { payGrade: 'E-6', yearsOfService: 10, targetCivilianSalary: 80000, totalMonthlyExpenses: 3500 } as const;

test.describe('TR-03 VA claim factor: "Haven\'t filed yet" alone, retirees too', () => {
  test('retiree, not filed → yellow, with the file-your-claim step', () => {
    const r = tr({ vaRating: -1 });
    expect(r.isRetirementEligible).toBe(true);
    expect(r.vaClaimStatus).toBe('yellow');
    expect(r.verdict).not.toBe('ready');
    expect(r.actionSteps.map((s) => s.label)).toContain('File your VA disability claim before you separate');
  });

  test('"0% (filed, no rating)" counts as filed', () => {
    const r = tr({ ...SEPARATING, vaRating: 0 });
    expect(r.vaClaimStatus).toBe('green');
    expect(r.actionSteps.map((s) => s.label)).not.toContain('File your VA disability claim before you separate');
  });
});

test.describe('TR-04 months of service count toward 20 years', () => {
  test('19 years 6 months, separating in 6 months → retirement-eligible', () => {
    const r = tr({ yearsOfService: 19, yearsOfServiceMonths: 6, separationMonths: 6 });
    expect(r.isRetirementEligible).toBe(true);
    expect(r.separationYOS).toBe(20);
    expect(r.grossRetiredPayMonthly).toBeGreaterThan(0);
  });

  test('19 years 0 months, separating in 11 months → not eligible (unchanged)', () => {
    expect(tr({ yearsOfService: 19, separationMonths: 11 }).isRetirementEligible).toBe(false);
  });
});

test.describe('TR-05 healthcare cases that resolved to $0', () => {
  test('VA healthcare with dependents: flagged, veteran only, verdict not "ready"', () => {
    const r = tr({ ...SEPARATING, vaRating: 70, healthcareAssumption: 'va' });
    expect(r.healthcareNeedsAttention).toBe(true);
    expect(r.healthcareAttentionNote).toBe('VA care covers the veteran only.');
    expect(r.verdict).toBe('almost');
  });

  test('VA healthcare without dependents is not flagged', () => {
    expect(tr({ ...SEPARATING, hasDependents: false, vaRating: 70, healthcareAssumption: 'va' }).healthcareNeedsAttention).toBe(false);
  });

  test('retiree TRICARE: the current Select Group A enrollment fee, not $0', () => {
    const fam = tr({});
    expect(fam.retireeTricareFeeAnnual).toBe(currentTricareCosts.retiree.selectA.enrollmentFee.family);
    expect(fam.healthcareCostMonthly).toBeCloseTo(currentTricareCosts.retiree.selectA.enrollmentFee.family / 12, 10);
    const single = tr({ hasDependents: false });
    expect(single.retireeTricareFeeAnnual).toBe(currentTricareCosts.retiree.selectA.enrollmentFee.individual);
  });
});

test.describe('TR-02 timeline does not decide the verdict', () => {
  test('same verdict at 0 and 24 months out', () => {
    for (const o of [{}, { totalMonthlyExpenses: 7000 }, { emergencyFund: 5000 }, { vaRating: -1 }]) {
      const a = tr({ ...SEPARATING, ...o, separationMonths: 0 });
      const b = tr({ ...SEPARATING, ...o, separationMonths: 24 });
      expect(a.timelineStatus).toBe('red');
      expect(a.verdict, JSON.stringify(o)).toBe(b.verdict);
    }
  });
});
