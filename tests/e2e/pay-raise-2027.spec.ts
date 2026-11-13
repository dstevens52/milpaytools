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
  raiseFaqs,
  branchFaq,
  retireeColaFaq,
  rankRaiseHeading,
  rankRaiseSentence,
  rankRaiseFaq,
  homeStripText,
  formatPercent,
  type RaiseResult,
} from '@/lib/calculations/payRaise';
import { getCalendar2027, weekdayDate, calendarLastChecked, rankKeyDatesLine } from '@/data/calendar-2027';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';
import { RANK_TITLE_YEARS, type RankTitleYears } from '@/data/pay-pages/titleMode';
import { rankTitle, payRange, gradeMinMax } from '@/lib/pay-pages/rankTitle';

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

// ─── 2027 pass: branch / retiree FAQs, rank-page section (feat/pay-raise-2027-pass) ──
// Golden values hand-computed from docs/sources/dfas-2026-basic-pay.csv (× (1 + %),
// nearest $0.10, then the 2026 Level V cap $15,408.30). Literals, not lib output.

test.describe('2027 pay raise — rank pages and new FAQs', () => {
  const GOLDEN: [PayGrade, number, number, number, number, boolean][] = [
    // grade, yos, 2026, current plan, senate 3.6%, capped
    ['E-5', 6, 4110.0, 4397.7, 4258.0, false],
    ['E-1', 0, 2407.2, 2575.7, 2493.9, false],
    ['O-3', 6, 7737.0, 8201.2, 8015.5, false],
    ['O-6', 24, 14479.2, 15203.2, 15000.5, false],
    ['O-6', 26, 15188.7, 15408.3, 15408.3, true],
  ];

  for (const [grade, yos, v26, plan, senate, capped] of GOLDEN) {
    test(`golden ${grade} over ${yos}: 2026 ${v26} / plan ${plan} / senate ${senate}${capped ? ' (capped)' : ''}`, () => {
      const [cPlan, cSenate] = getColumns();
      const p = applicable(resultFor(cPlan, grade, yos));
      const s = applicable(resultFor(cSenate, grade, yos));
      expect(cents(p.pay2026)).toBe(cents(v26));
      expect(cents(p.projected)).toBe(cents(plan));
      expect(cents(s.projected)).toBe(cents(senate));
      expect(p.capped).toBe(capped);
      expect(s.capped).toBe(capped);
    });
  }

  // /pay/raise title + pending description are deliberately unchanged (they
  // already earn clicks); the enacted description was shortened from 169 chars
  // (feat/2027-key-dates) so every mode fits.
  test('title ≤ 60 and description ≤ 160 in every mode', () => {
    for (const cfg of [PAY_RAISE_2027, ENACTED_FIXTURE, OFFICIAL_FIXTURE]) {
      expect(pageTitle(cfg).length).toBeLessThanOrEqual(60);
      expect(pageDescription(cfg).length).toBeLessThanOrEqual(160);
    }
    const enacted = pageDescription(ENACTED_FIXTURE);
    expect(enacted).toContain('official');
    expect(enacted).toContain('7-6-5');
  });

  test('pending: FAQ order puts branch + retiree right after "When will…"', () => {
    expect(raiseFaqs().map((f) => f.question).slice(0, 3)).toEqual([
      'When will the 2027 raise be final?',
      'Is the 2027 raise the same in every branch?',
      'Do military retirees get the 2027 pay raise?',
    ]);
  });

  test('pending: retiree FAQ has 3.6%, 2.6%, December 1, 2026, January 2027', () => {
    const a = retireeColaFaq().answer;
    for (const s of ['3.6%', '2.6%', 'December 1, 2026', 'January 2027', 'October 14, 2026']) expect(a).toContain(s);
    expect(a).not.toMatch(/VA disability|you should/i);
  });

  test('pending: branch FAQ has Coast Guard and the NOAA/PHS 3.6% line', () => {
    const a = branchFaq().answer;
    expect(a).toContain('Coast Guard');
    expect(a).toContain('NOAA Corps');
    expect(a).toContain('would get 3.6% under the plan');
  });

  test('pending: E-5 rank heading, sentence and FAQ', () => {
    expect(rankRaiseHeading('E-5')).toBe('2027 pay raise for an E-5 (not final)');
    expect(rankRaiseSentence('E-5', 6)).toBe(
      'An E-5 with over 6 years of service would get $4,397.70 a month under the current plan (+$287.70) or $4,258.00 under the Senate version (+$148.00).',
    );
    const f = rankRaiseFaq('E-5', 6);
    expect(f.question).toBe('What will the 2027 pay raise be for an E-5?');
    expect(f.answer).toBe(
      `Not final as of ${formatIsoDate(DATA_LAST_CHECKED)}. Under the current plan, E-5s get 7%: an E-5 with over 6 years of service would go from $4,110.00 to $4,397.70 a month. Under the Senate version (3.6%), it would be $4,258.00. The raise takes effect January 1, 2027.`,
    );
  });

  test('pending: O-6 at a capped YOS mentions the pay cap', () => {
    expect(rankRaiseFaq('O-6', 26).answer).toContain('may be limited by the pay cap');
    expect(rankRaiseSentence('O-6', 26)).toContain('may be limited by the pay cap');
  });

  for (const [name, cfg] of [['enacted', ENACTED_FIXTURE], ['official-table', OFFICIAL_FIXTURE]] as const) {
    test(`${name}: rank heading, sentence and FAQ render; no "not final"; branch FAQ has no NOAA/PHS`, () => {
      const parts = [
        rankRaiseHeading('E-5', cfg),
        rankRaiseSentence('E-5', 6, cfg) ?? '',
        rankRaiseFaq('E-5', 6, cfg).answer,
        rankRaiseFaq('O-6', 26, cfg).answer,
        branchFaq(cfg).answer,
      ];
      for (const p of parts) expect(p.toLowerCase()).not.toContain('not final');
      expect(branchFaq(cfg).answer).not.toMatch(/NOAA|Public Health/);
      expect(retireeColaFaq().answer).toContain('3.6%');
    });
  }

  test('enacted: E-5 figures; official-table: heading "2027 E-5 basic pay"', () => {
    expect(rankRaiseHeading('E-5', ENACTED_FIXTURE)).toBe('2027 pay raise for an E-5');
    expect(rankRaiseFaq('E-5', 6, ENACTED_FIXTURE).answer).toContain('$4,397.70');
    expect(rankRaiseHeading('E-5', OFFICIAL_FIXTURE)).toBe('2027 E-5 basic pay');
    expect(rankRaiseSentence('E-5', 6, OFFICIAL_FIXTURE)).toContain('$4,210.00'); // stub = 2026 + $100
  });
});

// ─── 2027 key dates calendar, calendar FAQs, rank-title switch (feat/2027-key-dates) ──

test.describe('2027 key dates — calendar data', () => {
  const ORDER = [
    'final-raise', 'retiree-cola', 'va-cola', 'tsp-limits', 'bah',
    'dec31-payday', 'rates-effective', 'first-payday', 'bas',
  ];

  test('nine entries in order; every entry has a source URL; official entries have an isoDate', () => {
    for (const cfg of [PAY_RAISE_2027, ENACTED_FIXTURE, OFFICIAL_FIXTURE]) {
      const cal = getCalendar2027(cfg);
      expect(cal.map((e) => e.id)).toEqual(ORDER);
      for (const e of cal) {
        expect(e.source.url, e.id).toMatch(/^https:\/\//);
        expect(e.source.name.length, e.id).toBeGreaterThan(0);
        if (e.status === 'official') expect(e.isoDate, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (e.status !== 'official') expect(e.isoDate, e.id).toBeNull();
      }
    }
  });

  // One deliberate exception: 'tsp-limits' states the official 2027 IRS limits
  // (docs/sources/calendar-2027.md). Exactly that id, nothing else.
  const DOLLAR_EXCEPTIONS = new Set(['tsp-limits']);

  test('no dollar amounts and no advice wording in any calendar text', () => {
    const cal = getCalendar2027();
    expect(cal.filter((e) => DOLLAR_EXCEPTIONS.has(e.id)).map((e) => e.id)).toEqual(['tsp-limits']);
    for (const e of cal) {
      const text = `${e.dateLabel} ${e.title} ${e.body}`;
      if (!DOLLAR_EXCEPTIONS.has(e.id)) expect(text, e.id).not.toContain('$');
      expect(text, e.id).not.toMatch(/you should|we recommend|consider /i);
    }
  });

  test('weekdays computed in UTC: Jan 15, 2027 Friday; Dec 31, 2026 Thursday; Jan 1, 2027 Friday', () => {
    expect(weekdayDate('2027-01-15')).toBe('Friday, January 15, 2027');
    expect(weekdayDate('2026-12-31')).toBe('Thursday, December 31, 2026');
    expect(weekdayDate('2027-01-01')).toBe('Friday, January 1, 2027');
    const byId = Object.fromEntries(getCalendar2027().map((e) => [e.id, e]));
    expect(byId['first-payday'].dateLabel).toBe('Friday, January 15, 2027');
    expect(byId['dec31-payday'].dateLabel).toBe('Thursday, December 31, 2026');
    expect(byId['rates-effective'].dateLabel).toBe('Friday, January 1, 2027');
  });

  test('NDAA entry: pending in pending mode, official in the enacted fixture', () => {
    const pending = getCalendar2027()[0];
    expect(pending.status).toBe('pending');
    expect(pending.body).toBe(
      "Not final. If Congress doesn't set a different raise, the current plan (7-6-5) takes effect January 1, 2027.",
    );
    const enacted = getCalendar2027(ENACTED_FIXTURE)[0];
    expect(enacted.status).toBe('official');
    expect(enacted.isoDate).toBe('2026-12-18');
    expect(enacted.body).toContain('FY2027 National Defense Authorization Act');
    expect(enacted.body.toLowerCase()).not.toContain('not final');
    expect(getCalendar2027(OFFICIAL_FIXTURE)[0].status).toBe('official');
  });

  test('statuses as of the source doc; COLA from RETIREE_COLA_2027; BAH expected wording', () => {
    const byId = Object.fromEntries(getCalendar2027().map((e) => [e.id, e]));
    expect(Object.fromEntries(Object.entries(byId).map(([k, e]) => [k, e.status]))).toEqual({
      'final-raise': 'pending',
      'retiree-cola': 'official',
      'va-cola': 'pending',
      'tsp-limits': 'official',
      bah: 'expected',
      'dec31-payday': 'official',
      'rates-effective': 'official',
      'first-payday': 'official',
      bas: 'pending',
    });
    // TSP limits: official since IRS Notice 2026-66 (Nov 12, 2026). Literals, not lib output.
    expect(byId['tsp-limits'].isoDate).toBe('2026-11-12');
    expect(byId['tsp-limits'].dateLabel).toBe('November 12, 2026');
    expect(byId['tsp-limits'].body).toBe(
      'The IRS announced the 2027 limits on November 12, 2026 (IRS Notice 2026-66): $25,500 elective deferral limit, $8,500 catch-up at age 50 and older, and $11,750 catch-up at ages 60–63. They take effect January 1, 2027.',
    );
    expect(byId['tsp-limits'].source.url).toBe('https://www.irs.gov/pub/irs-drop/n-26-66.pdf');
    expect(byId['retiree-cola'].title).toContain(formatPercent(RETIREE_COLA_2027.percent));
    expect(byId['va-cola'].body).toContain(`Social Security COLA (${formatPercent(RETIREE_COLA_2027.percent)})`);
    expect(byId.bah.body).toBe('Expected mid-December; the 2026 rates were released December 11, 2025.');
    expect(byId.bah.body.toLowerCase()).not.toContain('schedule');
    expect(calendarLastChecked()).toBe(DATA_LAST_CHECKED);
  });

  test('links match the build spec', () => {
    const links = Object.fromEntries(getCalendar2027().map((e) => [e.id, e.link?.href ?? null]));
    expect(links).toEqual({
      'final-raise': '/pay/raise',
      'retiree-cola': '/calculators/retirement',
      'va-cola': '/calculators/va-disability',
      'tsp-limits': '/calculators/tsp',
      bah: '/bah',
      'dec31-payday': '/pay/raise#your-2027-base-pay',
      'rates-effective': '/pay/raise#your-2027-base-pay',
      'first-payday': '/pay/raise#your-2027-base-pay',
      bas: null,
    });
  });

  test('payday sources: Jan 15 cites the DFAS paydays page, Dec 31 the FMR', () => {
    const byId = Object.fromEntries(getCalendar2027().map((e) => [e.id, e]));
    expect(byId['first-payday'].source.url).toBe('https://www.dfas.mil/MilitaryMembers/payentitlements/2026ACPayDay/');
    expect(byId['first-payday'].source.name).toBe('DFAS active duty paydays (2026 schedule; 2027 not yet posted)');
    expect(byId['dec31-payday'].source.url).toBe(
      'https://comptroller.war.gov/Portals/45/documents/fmr/current/07a/07a_01.pdf',
    );
  });

  test('rank-page key-dates line', () => {
    expect(rankKeyDatesLine()).toBe(
      'Key dates: the raise takes effect January 1, 2027, and the first payday at 2027 rates is Friday, January 15, 2027. 2027 BAH is expected in mid-December.',
    );
  });
});

test.describe('2027 key dates — /pay/raise FAQs and homepage strip', () => {
  const ORDER = [
    'When will the 2027 raise be final?',
    'Is the 2027 raise the same in every branch?',
    'Do military retirees get the 2027 pay raise?',
    'When will I see the 2027 raise in my paycheck?',
    'Why is the raise different by rank?',
    'Do warrant officers get 6%?',
    'Why might senior officers see a smaller raise?',
    'Does the raise affect BAH?',
  ];

  test('8 FAQs in order in every mode', () => {
    for (const cfg of [PAY_RAISE_2027, ENACTED_FIXTURE, OFFICIAL_FIXTURE]) {
      expect(raiseFaqs(cfg).map((f) => f.question)).toEqual(ORDER);
    }
  });

  test('paycheck FAQ and BAH FAQ text', () => {
    const faqs = Object.fromEntries(raiseFaqs().map((f) => [f.question, f.answer]));
    expect(faqs['When will I see the 2027 raise in my paycheck?']).toBe(
      "The 2027 raise takes effect January 1, 2027. The first payday at 2027 rates is the mid-month payday on Friday, January 15, 2027. The December 31, 2026 payday covers December 16–31, so it's still at 2026 rates.",
    );
    expect(faqs['Does the raise affect BAH?']).toBe(
      'No. BAH is set separately from basic pay, based on local housing costs, grade and dependency status. 2027 BAH rates are expected in mid-December; DoD released the 2026 rates on December 11, 2025.',
    );
  });

  test('homepage strip flips with the status', () => {
    expect(homeStripText()).toBe('2027 military pay raise: see your 2027 base pay by rank and the key dates →');
    expect(homeStripText(ENACTED_FIXTURE)).toContain('is final');
    expect(homeStripText(OFFICIAL_FIXTURE)).toContain('official 2027 base pay');
  });
});

test.describe('2027 key dates — rank-title switch (off)', () => {
  const RANKS: PayGrade[] = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6'];
  const titleFor = (grade: PayGrade, mode: RankTitleYears, cfg: PayRaiseConfig = PAY_RAISE_2027) => {
    const [mn, mx] = gradeMinMax(payTable, grade);
    return rankTitle({ title: grade, grade }, mn, mx, mode, cfg);
  };

  test("live mode is '2026'", () => {
    expect(RANK_TITLE_YEARS).toBe('2026');
    expect(titleFor('E-5', '2026')).toBe('E-5 Pay 2026: $3,343–$4,422/Month, All Branches');
  });

  test("'2026-2027' fixture: all 15 titles ≤ 60, contain ' & 2027', keep the 2026 range", () => {
    for (const grade of RANKS) {
      const t = titleFor(grade, '2026-2027');
      expect(t.length, t).toBeLessThanOrEqual(60);
      expect(t).toContain(' & 2027');
      const [mn, mx] = gradeMinMax(payTable, grade);
      expect(t).toContain(`${payRange(mn, mx)}/Month`); // branch-FAQ guardrail
    }
    expect(titleFor('E-5', '2026-2027')).toBe('E-5 Pay 2026 & 2027: $3,343–$4,422/Month, All Branches');
    expect(titleFor('E-9', '2026-2027')).toBe('E-9 Pay 2026 & 2027: $6,910–$10,729/Month, All Branches');
  });

  test("'2027' throws until the DFAS 2027 table is in", () => {
    expect(() => titleFor('E-5', '2027')).toThrow('not ready: needs the DFAS 2027 table');
    expect(() => titleFor('E-5', '2027', ENACTED_FIXTURE)).toThrow('not ready: needs the DFAS 2027 table');
    expect(titleFor('E-5', '2027', OFFICIAL_FIXTURE)).toBe('E-5 Pay 2027: $3,443–$4,522/Month, All Branches');
  });
});
