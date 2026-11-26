/**
 * S8 (FIX_QUEUE row 10): typed figures converted before the Jan. 1, 2027 data flip.
 * Data-only (no page, no server): run with
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/s8-typed-figures-unit.spec.ts --project=chromium
 *
 * 1. Each computed figure equals its data value (expected values rebuilt here from the raw
 *    data, with controls pinned to today's figures).
 * 2. Year flips: every function takes its data as an argument; passing a second year's data
 *    changes the year word and the figure together.
 * 3. Content guard: the removed typed strings stay out of every file S8 touched.
 * The rendered pages are checked in s8-typed-figures.spec.ts.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { payTable, DATA_YEAR as PAY_TABLE_YEAR } from '@/data/pay-tables/2026';
import type { PayTable } from '@/data/types';
import { BAS_RATES, SGLI_MAX_COVERAGE } from '@/data/constants';
import { PCS_RATES_2026 } from '@/data/pcs/2026/constants';
import { EDUCATION_BAH_YEAR, EDUCATION_RATES } from '@/data/education/2026/constants';
import { BAH_LOOKUP_TABLES, BAH_RATES_BY_YEAR, type MhaRateTable } from '@/data/bah/registry';
import { BAH_YEAR } from '@/data/bah/current';
import { TRICARE_COSTS_2026 } from '@/data/tricare/2026/costs';
import { TRICARE_COSTS_2027 } from '@/data/tricare/2027/costs';
import { TRICARE_COST_YEAR } from '@/data/tricare/current';
import { TAMP_DAYS } from '@/data/separation/rules';
import { calculateDeployment } from '@/lib/calculations/deployment';
import { combinedBahForZip, currentZipToMha } from '@/lib/calculations/bah';
import { giBillBahAtZip } from '@/lib/calculations/educationBah';
import {
  CURRENT_PAY_POST_DATA,
  TAX_TABLE_YEAR,
  bas,
  basicPay,
  brsMaxGovernmentMonthly,
  czteBasePayExample,
  czteYearsLabel,
  sgliBenchmark,
  sgliEnoughFaqAnswer,
  usd0,
  usdCents,
  type PayPostData,
} from '@/lib/payPost';
import { dlaPostTable, maltPerMileText, DLA_POST_ROWS } from '@/lib/pcsPost';
import { CURRENT_GI_BILL_POST_DATA, giBillTotalAtZip } from '@/lib/giBillPost';
import { retireeFamilyFees } from '@/lib/tricareRetireeFees';
import { GUIDE_EXAMPLES, bahRangeForGrade, payBahExample } from '@/lib/militaryPayGuide';

const ROOT = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const cents = (n: number) => Math.round(n * 100 + 1e-7) / 100;
const pay = (g: string, col: number) => (payTable as Record<string, Record<number, number>>)[g][col];

/** A stand-in 2027 pay table: every cell +5% (to the cent), so every figure moves. */
const MOCK_2027: PayPostData = {
  year: '2027',
  table: Object.fromEntries(
    Object.entries(payTable).map(([g, cols]) => [g, Object.fromEntries(Object.entries(cols).map(([y, v]) => [y, cents((v as number) * 1.05)]))]),
  ) as PayTable,
  bas: { enlisted: 500.0, officer: 345.0 },
};

/** A stand-in 2027 BAH rate table: every rate +$100. */
const scaleRates = (t: MhaRateTable): MhaRateTable =>
  Object.fromEntries(
    Object.entries(t).map(([code, s]) => [
      code,
      {
        w: Object.fromEntries(Object.entries(s.w).map(([g, v]) => [g, v + 100])),
        wo: Object.fromEntries(Object.entries(s.wo).map(([g, v]) => [g, v + 100])),
      },
    ]),
  );
const RATES_2026 = BAH_RATES_BY_YEAR['2026'] as MhaRateTable;
const MOCK_BAH_2027 = scaleRates(RATES_2026);

// ─── 1. Computed figures = data ───────────────────────────────────────────────

test.describe('S8 figures equal their data', () => {
  test('controls: the pay table year and BAS are the 2026 values today', () => {
    expect(CURRENT_PAY_POST_DATA.year).toBe(PAY_TABLE_YEAR);
    expect(PAY_TABLE_YEAR).toBe('2026');
    expect(TAX_TABLE_YEAR).toBe('2026');
    expect(bas('enlisted')).toBe(BAS_RATES.enlisted);
    expect(bas('officer')).toBe(BAS_RATES.officer);
    expect(usdCents(BAS_RATES.enlisted)).toBe('$476.95');
    expect(usdCents(BAS_RATES.officer)).toBe('$328.48');
  });

  test('LES PEBD example: E-5 at 4 and 6 years, and the gap', () => {
    expect(basicPay('E-5', 4)).toBe(pay('E-5', 4));
    expect(basicPay('E-5', 6)).toBe(pay('E-5', 6));
    expect(usdCents(basicPay('E-5', 4))).toBe('$3,946.80');
    expect(usdCents(basicPay('E-5', 6))).toBe('$4,110.00');
    expect(usdCents(basicPay('E-5', 6) - basicPay('E-5', 4))).toBe('$163.20');
    expect(() => basicPay('E-8', 2)).toThrow(); // E-8 has no column under 8 years: never renders $0
  });

  test('SGLI benchmark: E-6 at 10 years × 12 × 10–12, against SGLI_MAX_COVERAGE', () => {
    const s = sgliBenchmark();
    expect(s.monthly).toBe(pay('E-6', 10));
    expect(s.annual).toBe(cents(pay('E-6', 10) * 12));
    expect(usd0(s.annual)).toBe('$57,114');
    expect(usd0(s.low)).toBe('$571,140');
    expect(usd0(s.high)).toBe('$685,368');
    expect(s.max).toBe(SGLI_MAX_COVERAGE);
    expect(s.vsMax).toBe('above');
    expect(sgliEnoughFaqAnswer()).toContain(
      'An E-6 with 10 years of service earns $57,114 a year in 2026 basic pay ($4,759.50 a month × 12), so 10–12 times that is $571,140–$685,368, above the $500,000 SGLI maximum before counting allowances.',
    );
  });

  test('CZTE on base pay alone = the deployment calculator (12 months, combat zone, no special pays)', () => {
    const lib = (grade: string, yos: number, fs: 'single' | 'mfj') =>
      calculateDeployment({
        payGrade: grade as never,
        yearsOfService: yos,
        hasDependents: true,
        filingStatus: fs,
        zipCode: '28310',
        monthlyBAH: 0,
        bahFound: false,
        deploymentMonths: 12,
        isCombatZone: true,
        receivingIDP: false,
        hdpLevel: 0,
        hasFSA: false,
        tspContributionPct: 0,
        usingSDP: false,
        sdpDeposit: 0,
      });
    for (const [grade, yos, fs] of [['E-6', 10, 'single'], ['E-6', 10, 'mfj'], ['E-7', 12, 'mfj']] as const) {
      const ex = czteBasePayExample(grade, yos, fs);
      const r = lib(grade, yos, fs);
      expect(ex.monthlyBasePay, `${grade} ${fs}`).toBe(r.pre.monthlyBasePay);
      expect(ex.monthlyTax, `${grade} ${fs}`).toBeCloseTo(r.pre.monthlyFederalTax, 6);
      expect(ex.savings12, `${grade} ${fs}`).toBeCloseTo(r.tour.totalCZTESavings, 6);
    }
    // Controls: the figures the post typed before S8, now computed.
    const e6s = czteBasePayExample('E-6', 10, 'single');
    const e6j = czteBasePayExample('E-6', 10, 'mfj');
    const e7j = czteBasePayExample('E-7', 12, 'mfj');
    expect([usd0(e6s.monthlyTax), usd0(e6j.monthlyTax), usd0(e6s.savings12), usd0(e6j.savings12)]).toEqual(['$389', '$208', '$4,674', '$2,494']);
    expect([usdCents(e7j.monthlyBasePay), usd0(e7j.monthlyTax), usd0(e7j.savings12)]).toEqual(['$5,591.70', '$308', '$3,692']);
    expect(czteYearsLabel(e6s.payYear, e6s.taxYear)).toBe('2026 pay table, brackets and standard deduction');
  });

  test('PCS: DLA rows are the min–max of the rate file; MALT and year from the same file', () => {
    const t = dlaPostTable();
    expect(t.year).toBe(PCS_RATES_2026.year);
    expect(t.rows.map((r) => r.label)).toEqual(DLA_POST_ROWS.map((r) => r.label));
    DLA_POST_ROWS.forEach((row, i) => {
      for (const [key, table] of [['without', PCS_RATES_2026.dla.withoutDependents], ['with', PCS_RATES_2026.dla.withDependents]] as const) {
        const v = row.grades.map((g) => table[g]);
        const lo = usdCents(Math.min(...v));
        const hi = usdCents(Math.max(...v));
        expect(t.rows[i][key], `${row.label} ${key}`).toBe(lo === hi ? lo : `${lo} – ${hi}`);
      }
    });
    expect(t.rows[0]).toEqual({ label: 'E-1 – E-4', without: '$1,870.58 – $2,389.42', with: '$3,548.02' }); // control
    expect(t.rows[3]).toEqual({ label: 'O-4 – O-6', without: '$4,247.61 – $4,758.96', with: '$4,885.43 – $5,749.63' });
    expect(maltPerMileText()).toBe('$0.205');
  });

  test('GI Bill totals: MHA at the ZIP × 33 months + books stipend × 4 years', () => {
    expect(CURRENT_GI_BILL_POST_DATA.bahYear).toBe(EDUCATION_BAH_YEAR);
    expect(CURRENT_GI_BILL_POST_DATA.academicYear).toBe(EDUCATION_RATES.academicYear);
    for (const zip of ['78712', '02215', '94132']) {
      const t = giBillTotalAtZip(zip, 33, 4);
      const mha = giBillBahAtZip(zip)!;
      expect(t.mhaMonthly, zip).toBe(mha);
      expect(t.mhaTotal, zip).toBe(mha * 33);
      expect(t.books, zip).toBe(EDUCATION_RATES.giBill.bookStipendAnnualMax * 4);
      expect(t.total, zip).toBe(mha * 33 + EDUCATION_RATES.giBill.bookStipendAnnualMax * 4);
    }
    // Controls (2026 BAH, 2026–2027 academic year).
    expect(usd0(giBillTotalAtZip('78712', 33, 4).total)).toBe('$77,953');
    expect(usd0(giBillTotalAtZip('02215', 33, 4).total)).toBe('$162,103');
    expect(usd0(giBillTotalAtZip('94132', 33, 0).mhaTotal)).toBe('$169,191');
    expect(() => giBillTotalAtZip('00000', 33, 4)).toThrow();
  });

  test('TRICARE retiree family fees read the TRICARE_COST_YEAR file', () => {
    const t = retireeFamilyFees();
    expect(t.year).toBe(TRICARE_COST_YEAR);
    const f26 = retireeFamilyFees(2026);
    expect(f26.rows).toEqual([
      { plan: 'TRICARE Select retiree (family)', groupA: TRICARE_COSTS_2026.retiree.selectA.enrollmentFee.family, groupB: TRICARE_COSTS_2026.retiree.selectB.enrollmentFee.family },
      { plan: 'TRICARE Prime retiree (family)', groupA: TRICARE_COSTS_2026.retiree.primeA.enrollmentFee.family, groupB: TRICARE_COSTS_2026.retiree.primeB.enrollmentFee.family },
    ]);
    expect(f26.rows.map((r) => [r.groupA, r.groupB])).toEqual([[375, 1191], [765, 927]]); // control
  });

  test('military-pay guide: BAH ranges, the JBLM and Fort Carson examples', () => {
    const e5 = bahRangeForGrade('E-5');
    expect(e5.year).toBe(BAH_YEAR);
    const all = Object.entries(BAH_RATES_BY_YEAR[BAH_YEAR as '2026'] as MhaRateTable)
      .filter(([c]) => !c.startsWith('XX'))
      .map(([, s]) => s.w['E-5'])
      .filter((v) => v > 0);
    expect(e5.min).toBe(Math.min(...all));
    expect(e5.max).toBe(Math.max(...all));
    expect([e5.min, e5.max, e5.maxArea]).toEqual([1185, 5127, 'San Francisco, CA']); // control
    expect([bahRangeForGrade('O-3').min, bahRangeForGrade('O-3').max]).toEqual([1686, 6633]);
    expect([bahRangeForGrade('O-5').min, bahRangeForGrade('O-5').max]).toEqual([1827, 8064]);

    const j = GUIDE_EXAMPLES.jblm;
    const jblm = payBahExample(j.zip, j.grade, j.yos, { withTspMatch: true });
    // ZIP 98433 → WA311 (sorted_zipmha26.txt) → "TACOMA, WA" (mhanames26.txt) → E-5 w/ deps $2,556 (bahw26.txt).
    expect(currentZipToMha()['98433']).toBe('WA311');
    expect(jblm.bah).toBe(combinedBahForZip('98433', 'E-5', true));
    expect(jblm.bah).toBe(2556);
    expect(jblm.tspMatch).toBe(cents(pay('E-5', 6) * 0.05));
    expect(jblm.total).toBeCloseTo(pay('E-5', 6) + 2556 + BAS_RATES.enlisted + cents(pay('E-5', 6) * 0.05), 6);
    expect([usdCents(jblm.tspMatch), usd0(jblm.total), usd0(jblm.total * 12)]).toEqual(['$205.50', '$7,348', '$88,181']);

    const c = GUIDE_EXAMPLES.fortCarson;
    const carson = payBahExample(c.zip, c.grade, c.yos, { withTspMatch: false });
    // ZIP 80913 → CO046 → "COLORADO SPRINGS, CO" → E-5 w/ deps $2,358.
    expect(currentZipToMha()['80913']).toBe('CO046');
    expect(carson.bah).toBe(2358);
    expect(usd0(carson.total)).toBe('$6,945');
    expect(brsMaxGovernmentMonthly('E-7', 12)).toBe(cents(pay('E-7', 12) * 0.05));
  });
});

// ─── 2. Year flips ────────────────────────────────────────────────────────────

test.describe('S8 year flips: the year word and the figure change together', () => {
  test('pay (LES, SGLI, walking-away, guide): a 2027 table moves the year and every figure', () => {
    expect(basicPay('E-5', 4, MOCK_2027)).toBe(cents(pay('E-5', 4) * 1.05));
    expect(basicPay('E-5', 4, MOCK_2027)).not.toBe(basicPay('E-5', 4));
    expect(bas('enlisted', MOCK_2027)).toBe(500);

    const now = sgliEnoughFaqAnswer();
    const next = sgliEnoughFaqAnswer(MOCK_2027);
    const s = sgliBenchmark(MOCK_2027);
    expect(now).toContain('2026 basic pay');
    expect(next).toContain(`${usd0(s.annual)} a year in 2027 basic pay (${usdCents(s.monthly)} a month × 12)`);
    expect(next).toContain(`${usd0(s.low)}–${usd0(s.high)}`);
    expect(next).not.toContain('2026');
    expect(next).not.toContain('$57,114');

    const g = GUIDE_EXAMPLES.fortCarson;
    const ex = payBahExample(g.zip, g.grade, g.yos, { withTspMatch: false }, MOCK_2027, () => 2458);
    expect(ex.year).toBe('2027');
    expect(ex.total).toBeCloseTo(cents(pay('E-5', 6) * 1.05) + 2458 + 500, 6);
    expect(brsMaxGovernmentMonthly('E-7', 12, MOCK_2027)).toBe(cents(cents(pay('E-7', 12) * 1.05) * 0.05));
  });

  test('CZTE: a 2027 pay table changes base pay, tax and the label; the bracket year is named separately', () => {
    const now = czteBasePayExample('E-7', 12, 'mfj');
    const next = czteBasePayExample('E-7', 12, 'mfj', MOCK_2027);
    expect(next.payYear).toBe('2027');
    expect(next.monthlyBasePay).toBe(cents(pay('E-7', 12) * 1.05));
    expect(next.monthlyTax).toBeGreaterThan(now.monthlyTax);
    expect(next.savings12).toBeGreaterThan(now.savings12);
    expect(czteYearsLabel(next.payYear, next.taxYear)).toBe('2027 pay table; 2026 brackets and standard deduction');
    expect(czteYearsLabel('2027', '2027')).toBe('2027 pay table, brackets and standard deduction');
  });

  test('PCS: a 2027 rate file moves the DLA heading year, the cells and MALT', () => {
    const scale = (t: Record<string, number>) => Object.fromEntries(Object.entries(t).map(([g, v]) => [g, cents(v * 1.1)]));
    const mock = {
      year: 2027,
      maltPerMile: 0.21,
      dla: { withDependents: scale(PCS_RATES_2026.dla.withDependents), withoutDependents: scale(PCS_RATES_2026.dla.withoutDependents) },
    };
    const t = dlaPostTable(mock);
    expect(t.year).toBe(2027);
    expect(t.rows[0].with).toBe(usdCents(cents(3548.02 * 1.1)));
    expect(t.rows[0].with).not.toBe(dlaPostTable().rows[0].with);
    expect(maltPerMileText(mock)).toBe('$0.210');
  });

  test('GI Bill: 2027 BAH and a 2027–2028 academic year move the label and the totals', () => {
    const data = {
      bahYear: '2027',
      academicYear: '2027–2028',
      bookStipendAnnualMax: 1000,
      tables: { zipToMha: currentZipToMha(), ratesByYear: { '2027': MOCK_BAH_2027 } },
    };
    const now = giBillTotalAtZip('78712', 33, 4);
    const next = giBillTotalAtZip('78712', 33, 4, data);
    expect(next.academicYear).toBe('2027–2028');
    expect(next.mhaMonthly).toBe(now.mhaMonthly + 100);
    expect(next.total).toBe(now.total + 3300);
  });

  test('TRICARE: the 2027 file gives the 2027 year and fees (what TRICARE_COST_YEAR = 2027 shows on Jan. 1)', () => {
    const f27 = retireeFamilyFees(2027);
    expect(f27.year).toBe(2027);
    expect(f27.rows.map((r) => [r.groupA, r.groupB])).toEqual([
      [TRICARE_COSTS_2027.retiree.selectA.enrollmentFee.family, TRICARE_COSTS_2027.retiree.selectB.enrollmentFee.family],
      [TRICARE_COSTS_2027.retiree.primeA.enrollmentFee.family, TRICARE_COSTS_2027.retiree.primeB.enrollmentFee.family],
    ]);
    expect(f27.rows[1].groupA).toBe(792.96); // control
    expect(f27.rows[1].groupA).not.toBe(retireeFamilyFees(2026).rows[1].groupA);
    expect(() => retireeFamilyFees(2031)).toThrow();
  });

  test('BAH range: a 2027 rate table moves the year label and the range', () => {
    const names = BAH_LOOKUP_TABLES['2026']!.mhaNames;
    const r = bahRangeForGrade('E-5', '2027', MOCK_BAH_2027, names);
    expect(r.year).toBe('2027');
    expect([r.min, r.max]).toEqual([1285, 5227]);
    expect(() => bahRangeForGrade('E-5', '2031')).toThrow();
  });
});

// ─── 3. Content guard: removed typed strings ─────────────────────────────────

const REMOVED: Record<string, string[]> = {
  'src/app/calculators/transition-readiness/page.tsx': ['$1,400–$2,000/month', 'exceed $10,000/year', 'KFF 2025', 'ends the day you leave', '180 days of continued'],
  'src/content/blog/how-military-retirement-works.mdx': ['$375–$1,191', '$765–$927', '$15,000–$25,000', 'Approximate annual enrollment fees', 'complete 2026 cost details'],
  'src/content/blog/how-to-read-your-les.mdx': ['$3,946.80', '$4,110.00', '$150+', '$476.95', '$328.48', 'in 2026 an E-5', 'In 2026, enlisted', 'reflect 2026 DFAS'],
  'src/content/blog/pcs-financial-planning-guide.mdx': [
    'DLA rates (approximate)', '$1,871', '$2,389', '$3,548', '$4,150', '$2,274', '$3,404', '$3,085', '$4,042', '$4,248', '$4,759', '$4,885', '$5,750', '$0.205', '(2026 rate)',
  ],
  'src/content/blog/is-sgli-enough-life-insurance.mdx': ['$57,000', '$570,000', '$684,000', '$145/month', '$25–$40', 'July 1, 2025'],
  'src/app/blog/[slug]/page.tsx': ['$570,000–$684,000'],
  'src/content/blog/post-911-gi-bill-explained-2026.mdx': ['$72,600', '$148,500', '$165,000', '$2,200/month', '$4,500/month', '$76,600', '$152,500', '$5,000+', '$4,000'],
  'src/content/blog/deployment-pay-explained.mdx': ['$389/month', '$208/month', '$4,670', '$2,490', '$5,592', '$308', '$3,690', '(2026 brackets and standard deduction)'],
  'src/content/blog/should-i-stay-to-20-years-military.mdx': [
    '$3,059', '$918,000', '$2M+', '$1M+', '$6,118', '$6,177', '$6,246', '$36,708', '$2,447', '$29,364', '$46,600', '$59,200', '$93,600', '$1.5–1.6M', '$153/month', '$71,000', 'using 2026 pay tables',
  ],
  'src/content/blog/what-walking-away-at-12-years-costs.mdx': ['$5,900', '$295', '$28,320', '$38,000', '$165,000', '$150,000+', '1.07²²'],
  'src/app/guides/military-pay/page.tsx': [
    '$476.95', '$328.48', '$1,185', '$5,127', '$1,200/mo', '$5,100+', '$110,000', '$120,000', '$5K', '$15K', '$97,000', '$6,945', '$2,358', '$2,556', '$7,348', '$88,176', '$206', '40–60%', '$1,686', '$6,633', '$1,827', '$8,064', '>2026 rates<', '2026 BAH range', '2026 rates:', 'for officers in 2026.',
  ],
  'public/llms.txt': ['$15,000–$24,000', '$2M+', '$3,059/month High-3', 'exact dollar value of the pension, TRICARE retiree healthcare, and TSP matching'],
  'src/app/transition/page.tsx': ['taxable vs. tax-free compensation'],
};

test.describe('S8 content guard', () => {
  for (const [file, strings] of Object.entries(REMOVED)) {
    test(`${file}: removed typed strings absent`, () => {
      const src = read(file);
      expect(src.length, file).toBeGreaterThan(3000); // non-empty control
      for (const s of strings) expect(src, `${file}: ${s}`).not.toContain(s);
    });
  }

  test('TAMP length on the readiness page comes from rules.ts', () => {
    expect(TAMP_DAYS).toBe(180);
    const src = read('src/app/calculators/transition-readiness/page.tsx');
    expect(src.match(/\$\{TAMP_DAYS\} days of continued TRICARE/g)).toHaveLength(2);
  });
});
