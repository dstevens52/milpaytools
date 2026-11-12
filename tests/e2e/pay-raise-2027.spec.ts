/**
 * 2027 pay raise math + status wording — data-only, no browser or server.
 * Run via `npm run test:pay-raise`.
 *
 * Golden values come from the priority #16 spec (verified Nov 11, 2026) and
 * must match to the cent. The 'enacted' and 'official-table' modes are
 * exercised with fixtures so release day can't surprise us.
 */

import { test, expect } from '@playwright/test';
import {
  PAY_RAISE_2027,
  GRADE_TIERS,
  ASSUMED_TIER_GRADES,
  type PayRaiseConfig,
  type RaiseTier,
} from '@/data/pay-raise/2027';
import { payTable } from '@/data/pay-tables/2026';
import { DATA_LAST_CHECKED } from '@/data/watch';
import type { PayTable } from '@/data/types';
import { ALL_PAY_GRADES, YOS_BREAKPOINTS, type PayGrade } from '@/types/military';
import {
  projectRaise,
  getColumns,
  resultFor,
  resultLabel,
  countCapped,
  statusLabel,
  statusText,
  pageTitle,
  pageDescription,
  rankPageLinkText,
  isAssumedTier,
  pay2026,
  formatIsoDate,
  type RaiseResult,
} from '@/lib/calculations/payRaise';

const cents = (d: number) => Math.round(d * 100);
const plan = PAY_RAISE_2027.scenarios.find((s) => s.id === 'current-plan')!;
const senate = PAY_RAISE_2027.scenarios.find((s) => s.id === 'senate-3-6')!;
const caps = PAY_RAISE_2027.caps;

type Golden = {
  grade: PayGrade;
  yos: number;
  pay2026: number;
  plan: number;
  planCapped?: number; // uncapped amount when held at the cap
  senate: number;
  senateCapped?: number;
};

const GOLDEN: Golden[] = [
  { grade: 'E-1', yos: 0, pay2026: 2407.2, plan: 2575.7, senate: 2493.9 },
  { grade: 'E-5', yos: 6, pay2026: 4110.0, plan: 4397.7, senate: 4258.0 },
  { grade: 'E-7', yos: 14, pay2026: 5835.0, plan: 6185.1, senate: 6045.1 },
  { grade: 'E-9', yos: 20, pay2026: 8105.1, plan: 8591.4, senate: 8396.9 },
  { grade: 'W-2', yos: 8, pay2026: 6051.0, plan: 6414.1, senate: 6268.8 },
  { grade: 'O-1E', yos: 6, pay2026: 5576.7, plan: 5911.3, senate: 5777.5 },
  { grade: 'O-3', yos: 6, pay2026: 7737.0, plan: 8201.2, senate: 8015.5 },
  { grade: 'O-4', yos: 10, pay2026: 9420.0, plan: 9891.0, senate: 9759.1 },
  { grade: 'O-6', yos: 30, pay2026: 15408.3, plan: 15408.3, planCapped: 16178.7, senate: 15408.3, senateCapped: 15963.0 },
  { grade: 'O-7', yos: 30, pay2026: 17242.2, plan: 18104.3, senate: 17862.9 },
  { grade: 'O-8', yos: 22, pay2026: 18999.9, plan: 18999.9, planCapped: 19949.9, senate: 18999.9, senateCapped: 19683.9 },
  { grade: 'O-10', yos: 20, pay2026: 18999.9, plan: 18999.9, planCapped: 19949.9, senate: 18999.9, senateCapped: 19683.9 },
];

function applicable(r: RaiseResult) {
  if (!r.applicable) throw new Error('expected an applicable result');
  return r;
}

test.describe('2027 pay raise — golden values', () => {
  for (const g of GOLDEN) {
    test(`${g.grade} at ${g.yos} YOS`, () => {
      const p = applicable(projectRaise(g.grade, g.yos, plan.percentByTier, caps));
      const s = applicable(projectRaise(g.grade, g.yos, senate.percentByTier, caps));
      expect(cents(p.pay2026)).toBe(cents(g.pay2026));
      expect(cents(p.projected)).toBe(cents(g.plan));
      expect(cents(s.projected)).toBe(cents(g.senate));
      expect(p.capped).toBe(g.planCapped !== undefined);
      expect(s.capped).toBe(g.senateCapped !== undefined);
      if (g.planCapped !== undefined) expect(cents(p.uncappedAmount)).toBe(cents(g.planCapped));
      if (g.senateCapped !== undefined) expect(cents(s.uncappedAmount)).toBe(cents(g.senateCapped));
      // Increases are derived from the (capped) projection.
      expect(cents(p.monthlyIncrease)).toBe(cents(g.plan) - cents(g.pay2026));
      expect(cents(p.annualIncrease)).toBe((cents(g.plan) - cents(g.pay2026)) * 12);
    });
  }
});

test.describe('2027 pay raise — tiers, caps, applicability', () => {
  test('tier assignment for all 27 grades', () => {
    const expected: Record<PayGrade, RaiseTier> = {
      'E-1': 'E1-E5', 'E-2': 'E1-E5', 'E-3': 'E1-E5', 'E-4': 'E1-E5', 'E-5': 'E1-E5',
      'E-6': 'E6-O3', 'E-7': 'E6-O3', 'E-8': 'E6-O3', 'E-9': 'E6-O3',
      'W-1': 'E6-O3', 'W-2': 'E6-O3', 'W-3': 'E6-O3', 'W-4': 'E6-O3', 'W-5': 'E6-O3',
      'O-1': 'E6-O3', 'O-2': 'E6-O3', 'O-3': 'E6-O3',
      'O-1E': 'E6-O3', 'O-2E': 'E6-O3', 'O-3E': 'E6-O3',
      'O-4': 'O4-up', 'O-5': 'O4-up', 'O-6': 'O4-up', 'O-7': 'O4-up',
      'O-8': 'O4-up', 'O-9': 'O4-up', 'O-10': 'O4-up',
    };
    expect(ALL_PAY_GRADES.length).toBe(27);
    expect(Object.keys(GRADE_TIERS).sort()).toEqual([...ALL_PAY_GRADES].sort());
    expect(Object.keys(payTable).sort()).toEqual([...ALL_PAY_GRADES].sort());
    expect(GRADE_TIERS).toEqual(expected);
    expect(plan.percentByTier).toEqual({ 'E1-E5': 7, 'E6-O3': 6, 'O4-up': 5 });
    expect(senate.percentByTier).toEqual({ 'E1-E5': 3.6, 'E6-O3': 3.6, 'O4-up': 3.6 });
    // Warrant officers and O-1E–O-3E are the assumed-6% grades, and only they.
    expect([...ASSUMED_TIER_GRADES].sort()).toEqual(
      ['O-1E', 'O-2E', 'O-3E', 'W-1', 'W-2', 'W-3', 'W-4', 'W-5'].sort(),
    );
    for (const g of ALL_PAY_GRADES) {
      expect(isAssumedTier(g)).toBe(ASSUMED_TIER_GRADES.includes(g));
    }
  });

  test('41 amounts held at the 2026 caps under the current plan', () => {
    expect(caps).toEqual({ levelII: 18999.9, levelV: 15408.3, capYear: 2026, pending: true });
    expect(countCapped(plan.percentByTier, caps)).toBe(41);
  });

  test('no $0: applicable cells are > 0, the rest are "not applicable"', () => {
    let applicableCount = 0;
    let naCount = 0;
    for (const grade of ALL_PAY_GRADES) {
      for (const yos of YOS_BREAKPOINTS) {
        const has2026 = pay2026(grade, yos) !== null;
        for (const s of PAY_RAISE_2027.scenarios) {
          const r = projectRaise(grade, yos, s.percentByTier, caps);
          if (has2026) {
            const a = applicable(r);
            expect(a.pay2026).toBeGreaterThan(0);
            expect(a.projected).toBeGreaterThan(0);
          } else {
            expect(r).toEqual({ applicable: false });
          }
        }
        if (has2026) applicableCount++;
        else naCount++;
      }
    }
    // Same 541 / 53 split as the DFAS source snapshot (pay-table-dfas.spec.ts).
    expect(applicableCount).toBe(541);
    expect(naCount).toBe(53);
    // Spot-check: E-9 under 10 years and O-9 under 20 are not applicable.
    expect(projectRaise('E-9', 5, plan.percentByTier, caps)).toEqual({ applicable: false });
    expect(projectRaise('O-9', 10, plan.percentByTier, caps)).toEqual({ applicable: false });
  });
});

// ─── Status modes ───────────────────────────────────────────────────────────

const ENACTED_FIXTURE: PayRaiseConfig = {
  ...PAY_RAISE_2027,
  status: 'enacted',
  lastChecked: '2026-12-20',
  enacted: {
    percentByTier: { 'E1-E5': 7, 'E6-O3': 6, 'O4-up': 5 },
    lawName: 'FY2027 National Defense Authorization Act',
    signedDate: '2026-12-18',
    sourceUrl: 'https://www.congress.gov/',
  },
};

// Stub 2027 table: every 2026 value + $100, so the official mode is checkable.
const STUB_2027: PayTable = Object.fromEntries(
  Object.entries(payTable).map(([g, entry]) => [
    g,
    Object.fromEntries(Object.entries(entry).map(([k, v]) => [k, Math.round((v as number) * 100 + 10000) / 100])),
  ]),
) as PayTable;

const OFFICIAL_FIXTURE: PayRaiseConfig = {
  ...ENACTED_FIXTURE,
  status: 'official-table',
  officialTable: STUB_2027,
};

test.describe('2027 pay raise — status modes', () => {
  test('pending (live config): two scenarios, dated "not final" wording', () => {
    expect(PAY_RAISE_2027.status).toBe('pending');
    expect(PAY_RAISE_2027.enacted).toBeNull();
    expect(statusLabel()).toBe('Not final');
    expect(pageTitle()).toBe('2027 Military Pay Raise Calculator: 7-6-5 Plan vs 3.6%');
    expect(pageDescription()).toBe(
      "See your 2027 base pay under the current 7-6-5 plan and the Senate's 3.6% version, by grade and years of service. Not final yet; updated as Congress acts.",
    );
    // lastChecked comes from the shared watch date (updated weekly), not a literal.
    expect(PAY_RAISE_2027.lastChecked).toBe(DATA_LAST_CHECKED);
    expect(formatIsoDate('2026-11-11')).toBe('November 11, 2026');
    expect(statusText()).toBe(
      `Not final as of ${formatIsoDate(DATA_LAST_CHECKED)}. The current plan (7% E-1 to E-5, 6% E-6 to O-3, 5% O-4 and above) takes effect January 1, 2027 unless Congress enacts a different raise. The Senate's version would set 3.6% for everyone.`,
    );
    expect(getColumns().map((c) => c.label)).toEqual(['Current plan (7-6-5)', 'Senate version (3.6%)']);
    expect(rankPageLinkText()).toBe("2027 raise: see what you'd make under each plan →");
  });

  test('enacted: "Official: X%" per grade, calculated from the law', () => {
    expect(statusLabel(ENACTED_FIXTURE)).toBe('Official: 7-6-5');
    expect(pageTitle(ENACTED_FIXTURE)).toBe('2027 Military Pay Raise Calculator: Official 7-6-5 Raise');
    expect(statusText(ENACTED_FIXTURE)).toContain('signed December 18, 2026');
    expect(statusText(ENACTED_FIXTURE)).toContain('calculated from the law until DFAS publishes the 2027 table');
    const cols = getColumns(ENACTED_FIXTURE);
    expect(cols).toHaveLength(1);
    expect(resultLabel(cols[0], 'E-5')).toBe('Official: 7%');
    expect(resultLabel(cols[0], 'W-2')).toBe('Official: 6%');
    expect(resultLabel(cols[0], 'O-4')).toBe('Official: 5%');
    const r = applicable(resultFor(cols[0], 'E-5', 6, ENACTED_FIXTURE));
    expect(cents(r.projected)).toBe(cents(4397.7));
    expect(r.estimate).toBe(true);
    expect(rankPageLinkText(ENACTED_FIXTURE)).toBe('2027 raise: see your official 2027 pay →');
  });

  test('official-table: DFAS values, no scenario math', () => {
    expect(statusLabel(OFFICIAL_FIXTURE)).toBe('Official DFAS 2027 rates');
    expect(pageTitle(OFFICIAL_FIXTURE)).toBe('2027 Military Pay Raise Calculator: Official DFAS 2027 Rates');
    const cols = getColumns(OFFICIAL_FIXTURE);
    expect(cols.map((c) => c.label)).toEqual(['Official DFAS 2027 rates']);
    const r = applicable(resultFor(cols[0], 'E-5', 6, OFFICIAL_FIXTURE));
    expect(cents(r.projected)).toBe(cents(4210.0)); // stub = 4,110.00 + 100
    expect(r.estimate).toBe(false);
    expect(r.capped).toBe(false);
    expect(cents(r.monthlyIncrease)).toBe(10000);
    expect(resultFor(cols[0], 'E-9', 5, OFFICIAL_FIXTURE)).toEqual({ applicable: false });
  });

  test('misconfigured modes fail loudly', () => {
    expect(() => getColumns({ ...PAY_RAISE_2027, status: 'enacted' })).toThrow();
    expect(() => getColumns({ ...PAY_RAISE_2027, status: 'official-table' })).toThrow();
  });
});
