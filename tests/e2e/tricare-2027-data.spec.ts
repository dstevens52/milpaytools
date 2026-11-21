/**
 * T1 (FIX_QUEUE row 8c): TRICARE 2026/2027 year files, the computed changes
 * the post quotes, the Open Season wording for both statuses, and the
 * healthcare comparison TRS figures (HC-03). Data-only: no page, no server.
 *
 * Expected values are typed here from docs/sources/tricare-costs-2027.md (one
 * value per source table row), not read from the lib under test.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TRICARE_COSTS_2026 as Y26 } from '@/data/tricare/2026/costs';
import { TRICARE_COSTS_2027 as Y27 } from '@/data/tricare/2027/costs';
import { TRICARE_RATES_2026 } from '@/data/tricare/2026/constants';
import { OFFICIAL_COMPARISON_2027, OPEN_SEASON_2026, OPEN_SEASON_2026_STATUS } from '@/data/tricare/2027/openSeason';
import { TRICARE_COST_YEAR, currentTricareCosts } from '@/data/tricare/current';
import { calculateHealthcare } from '@/lib/calculations/healthcare';
import {
  changeRange,
  openSeasonParagraphs,
  tricareChange,
  tricarePostFaqs,
  tricareTable,
  TABLE_NAMES,
} from '@/lib/tricarePost';

const ROOT = join(__dirname, '..', '..');

test.describe('TRICARE year files match the source doc', () => {
  test('source doc is in docs/sources and names every source key used', () => {
    const doc = readFileSync(join(ROOT, 'docs/sources/tricare-costs-2027.md'), 'utf8');
    expect(doc.length).toBeGreaterThan(2000); // non-empty control
    for (const s of [...Y26.sources, ...Y27.sources]) expect(doc, s.key).toContain(s.key);
    expect(Y27.effective).toBe('2027-01-01');
    expect(Y26.effective).toBe('2026-01-01');
  });

  test('retiree enrollment fees (all 8 rows, both years)', () => {
    const r26 = Y26.retiree, r27 = Y27.retiree;
    expect([r26.primeA.enrollmentFee.individual, r27.primeA.enrollmentFee.individual]).toEqual([381.96, 396.0]);
    expect([r26.primeA.enrollmentFee.family, r27.primeA.enrollmentFee.family]).toEqual([765.0, 792.96]);
    expect([r26.primeB.enrollmentFee.individual, r27.primeB.enrollmentFee.individual]).toEqual([462.96, 480.0]);
    expect([r26.primeB.enrollmentFee.family, r27.primeB.enrollmentFee.family]).toEqual([927.0, 960.0]);
    expect([r26.selectA.enrollmentFee.individual, r27.selectA.enrollmentFee.individual]).toEqual([186.96, 193.92]);
    expect([r26.selectA.enrollmentFee.family, r27.selectA.enrollmentFee.family]).toEqual([375.0, 388.92]);
    expect([r26.selectB.enrollmentFee.individual, r27.selectB.enrollmentFee.individual]).toEqual([594.96, 616.92]);
    expect([r26.selectB.enrollmentFee.family, r27.selectB.enrollmentFee.family]).toEqual([1191.0, 1233.96]);
  });

  test('retiree deductibles and caps', () => {
    for (const y of [Y26, Y27]) {
      expect(y.retiree.primeA.deductible).toEqual({ individual: 0, family: 0 });
      expect(y.retiree.primeB.deductible).toEqual({ individual: 0, family: 0 });
      expect(y.retiree.selectA.deductible).toEqual({ individual: 150, family: 300 });
      expect(y.retiree.primeA.catastrophicCap).toBe(3000);
      expect(y.retiree.selectACapSurvivorsMedicallyRetired).toBe(3000);
    }
    expect(Y26.retiree.selectB.deductible).toEqual({ individual: 198, family: 397 });
    expect(Y27.retiree.selectB.deductible).toEqual({ individual: 205, family: 411 });
    expect(Y26.retiree.selectB.nonNetworkDeductible).toEqual({ individual: 397, family: 794 });
    expect(Y27.retiree.selectB.nonNetworkDeductible).toEqual({ individual: 411, family: 823 });
    expect([Y26.retiree.primeB.catastrophicCap, Y27.retiree.primeB.catastrophicCap]).toEqual([4635, 4802]);
    expect([Y26.retiree.selectA.catastrophicCap, Y27.retiree.selectA.catastrophicCap]).toEqual([4381, 4538]);
    expect([Y26.retiree.selectB.catastrophicCap, Y27.retiree.selectB.catastrophicCap]).toEqual([4635, 4802]);
  });

  test('retiree network copays (primary / specialty / ER / urgent / preventive)', () => {
    const c = (y: typeof Y26, p: 'primeA' | 'primeB' | 'selectA' | 'selectB') => {
      const x = y.retiree[p].copays;
      return [x.primary, x.specialty, x.er, x.urgent, x.preventive];
    };
    expect(c(Y26, 'primeA')).toEqual([26, 39, 79, 39, 0]);
    expect(c(Y26, 'primeB')).toEqual([26, 39, 79, 39, 0]);
    expect(c(Y27, 'primeA')).toEqual([27, 41, 82, 41, 0]);
    expect(c(Y27, 'primeB')).toEqual([27, 41, 82, 41, 0]);
    expect(c(Y26, 'selectA')).toEqual([38, 52, 138, 38, 0]);
    expect(c(Y27, 'selectA')).toEqual([40, 52, 143, 40, 0]);
    expect(c(Y26, 'selectB')).toEqual([33, 52, 105, 52, 0]);
    expect(c(Y27, 'selectB')).toEqual([34, 54, 109, 54, 0]);
  });

  test('active duty family members', () => {
    for (const y of [Y26, Y27]) {
      for (const p of [y.adfm.primeA, y.adfm.primeB]) {
        expect([p.enrollmentFee, p.deductible, p.copay]).toEqual([0, 0, 0]);
      }
      expect([y.adfm.selectA.enrollmentFee, y.adfm.selectB.enrollmentFee]).toEqual([0, 0]);
      expect(y.adfm.selectA.deductible).toEqual({ e1ToE4: { individual: 50, family: 100 }, e5AndAbove: { individual: 150, family: 300 } });
      expect([y.adfm.primeA.catastrophicCap, y.adfm.selectA.catastrophicCap]).toEqual([1000, 1000]);
      expect(y.adfm.selectNonNetworkCostSharePct).toBe(20);
    }
    expect(Y26.adfm.selectB.deductible).toEqual({ e1ToE4: { individual: 66, family: 132 }, e5AndAbove: { individual: 198, family: 397 } });
    expect(Y27.adfm.selectB.deductible).toEqual({ e1ToE4: { individual: 68, family: 137 }, e5AndAbove: { individual: 205, family: 411 } });
    expect([Y26.adfm.primeB.catastrophicCap, Y26.adfm.selectB.catastrophicCap]).toEqual([1324, 1324]);
    expect([Y27.adfm.primeB.catastrophicCap, Y27.adfm.selectB.catastrophicCap]).toEqual([1372, 1372]);
    const cp = (x: { primary: number; specialty: number; er: number; urgent: number }) => [x.primary, x.specialty, x.er, x.urgent];
    expect(cp(Y26.adfm.selectA.copays)).toEqual([28, 39, 103, 28]);
    expect(cp(Y27.adfm.selectA.copays)).toEqual([30, 39, 107, 30]);
    expect(cp(Y26.adfm.selectB.copays)).toEqual([19, 33, 52, 26]);
    expect(cp(Y27.adfm.selectB.copays)).toEqual([20, 34, 54, 27]);
  });

  test('premium-based plans (monthly)', () => {
    expect(Y26.premiumPlans).toEqual({ trsMember: 57.88, trsFamily: 286.66, trrMember: 645.9, trrFamily: 1548.3, tyaPrime: 794, tyaSelect: 363 });
    expect(Y27.premiumPlans).toEqual({ trsMember: 60.54, trsFamily: 307.48, trrMember: 707.59, trrFamily: 1697.7, tyaPrime: 893, tyaSelect: 394 });
  });

  test('2027 extras: retiree COLA, pharmacy, Open Season dates', () => {
    expect(Y27.retireeColaPct).toBe(3.6);
    expect(Y27.pharmacyCopaysUnchangedThrough).toBe('2027-12-31');
    expect(OPEN_SEASON_2026).toEqual({
      start: '2026-11-09',
      end: '2026-12-08',
      changesEffective: '2027-01-01',
      fedvipStart: '2026-11-09',
      fedvipEnd: '2026-12-14',
    });
  });

  test('official 2027 comparison: 6 rows × 5 columns, TRICARE column = Select Group B retiree family', () => {
    const t = tricareTable('officialComparison2027');
    expect(t.head).toHaveLength(6);
    expect(t.rows).toHaveLength(6);
    for (const r of t.rows) expect(r).toHaveLength(6);
    expect(t.rows.map((r) => r[1])).toEqual(['$1,233.96', '$411 network; $823 non-network', '$4,802', '$34', '$54', '20–25%']);
    expect(t.rows[0].slice(2)).toEqual(['$12,919.40', '$20,833.92', '$28,618', '$7,471']);
    expect(t.rows[2].slice(2)).toEqual(['$14,000 network; $18,000 non-network', '$22,900', '$21,000', 'Not available']);
    expect(t.rows[3].slice(2)).toEqual(['$30', '$0', '$20', '$27']);
    expect(t.rows[4].slice(2)).toEqual(['$40', '$90', '$90', '$46']);
    expect(OFFICIAL_COMPARISON_2027.footnotes.join(' ')).toContain('80202');
    expect(OFFICIAL_COMPARISON_2027.footnotes.join(' ')).toContain('Kaiser Family Foundation 2026');
    expect(t.source?.url).toBe('https://tricare.mil/openseason');
  });
});

test.describe('computed changes', () => {
  test('TRS family +$20.82 / +7.3%; TYA-Prime +$99.00 / +12.5%; retiree Prime B family +$33.00 / +3.6%', () => {
    const trs = tricareChange('premiumPlans.trsFamily');
    expect(trs.dollars).toBe(20.82);
    expect(trs.pct.toFixed(1)).toBe('7.3');
    const tya = tricareChange('premiumPlans.tyaPrime');
    expect(tya.dollars).toBe(99);
    expect(tya.pct.toFixed(1)).toBe('12.5');
    const pb = tricareChange('retiree.primeB.enrollmentFee.family');
    expect(pb.dollars).toBe(33);
    expect(pb.pct.toFixed(1)).toBe('3.6');
    expect(tricareChange('premiumPlans.trsMember').pct.toFixed(1)).toBe('4.6');
    expect(tricareChange('premiumPlans.trrFamily').pct.toFixed(1)).toBe('9.6');
    expect(tricareChange('premiumPlans.tyaSelect').pct.toFixed(1)).toBe('8.5');
  });

  test('ranges: retiree fees 3.6–3.7%, copays $0–$5', () => {
    expect(changeRange('retireeFees', 'pct')).toBe('3.6–3.7%');
    expect(changeRange('copays', 'dollars')).toBe('$0–$5');
  });

  test('every named table renders without NaN or empty cells', () => {
    for (const name of TABLE_NAMES) {
      const t = tricareTable(name);
      expect(t.rows.length, name).toBeGreaterThan(0);
      for (const r of t.rows) for (const cell of r) expect(cell, `${name}: ${r[0]}`).toMatch(/^(?!.*(NaN|undefined)).+$/);
    }
    expect(tricareTable('premiumPlans').rows[1]).toEqual([
      'TRICARE Reserve Select, member and family',
      '$286.66',
      '$307.48',
      '+$20.82 (+7.3%)',
    ]);
  });
});

test.describe('Open Season wording', () => {
  test('status is open until Dec 9', () => {
    expect(OPEN_SEASON_2026_STATUS).toBe('open');
  });

  test('open wording', () => {
    const t = openSeasonParagraphs('open').join(' ');
    expect(t).toContain('TRICARE Open Season runs Nov. 9–Dec. 8, 2026.');
    expect(t).toContain('take effect Jan. 1, 2027');
    expect(t).toContain('no action is needed');
    expect(t).toContain('(FEDVIP) runs Nov. 9–Dec. 14, 2026');
    expect(t).toContain('Qualifying Life Event');
    expect(t).not.toContain('ended');
  });

  test('closed wording', () => {
    const t = openSeasonParagraphs('closed').join(' ');
    expect(t).toContain('ran Nov. 9–Dec. 8, 2026 and ended Dec. 8, 2026');
    expect(t).toContain('Qualifying Life Event');
    expect(t).not.toContain(' runs ');
  });

  test('FAQ answers for both statuses', () => {
    for (const status of ['open', 'closed'] as const) {
      const faqs = tricarePostFaqs(status);
      expect(faqs.map((f) => f.question)).toEqual([
        'When is TRICARE Open Season for 2027 coverage?',
        'How much is TRICARE Reserve Select in 2027?',
        'Did TRICARE pharmacy copays change for 2027?',
      ]);
      expect(faqs[1].answer).toContain('$60.54 a month for member-only coverage and $307.48 a month for member and family, up from $57.88 and $286.66 in 2026');
      expect(faqs[1].answer).toContain('$68 individual / $137 family');
      expect(faqs[1].answer).toContain('$205 / $411');
      expect(faqs[1].answer).toContain('$1,372 per family');
      expect(faqs[2].answer).toContain('through Dec. 31, 2027');
    }
    expect(tricarePostFaqs('open')[0].answer).toContain('runs Nov. 9–Dec. 8, 2026');
    expect(tricarePostFaqs('closed')[0].answer).toContain('has ended');
  });
});

test.describe('healthcare comparison TRS (HC-03), current year 2026', () => {
  test('TRICARE_COST_YEAR is 2026 until Jan 1, 2027', () => {
    expect(TRICARE_COST_YEAR).toBe(2026);
    expect(currentTricareCosts).toBe(Y26);
  });

  test('single: $783.56 first-year, $198 deductible, $1,324 cap', () => {
    const r = calculateHealthcare('single', 'trs', 'silver', '50plus');
    expect(r.monthlyPremium).toBe(57.88);
    expect(r.deductible).toBe(198);
    expect(r.oopMax).toBe(1324);
    expect(r.estimatedDeductibleUsage).toBe(89);
    expect(r.firstYearTotal).toBeCloseTo(783.56, 6);
  });

  test('family: $3,618.92 first-year, $397 deductible, $1,324 cap', () => {
    const r = calculateHealthcare('married-2-children', 'trs', 'silver', '50plus');
    expect(r.monthlyPremium).toBe(286.66);
    expect(r.deductible).toBe(397);
    expect(r.oopMax).toBe(1324);
    expect(r.estimatedDeductibleUsage).toBe(179);
    expect(r.firstYearTotal).toBeCloseTo(3618.92, 6);
  });

  test('notes: E-1–E-4 deductible, per-family cap, 2027 premiums', () => {
    const { notes } = calculateHealthcare('single', 'trs', 'silver', '50plus');
    expect(notes).toContain('Sponsors in pay grades E-1–E-4 have a lower deductible ($66 individual / $132 family).');
    expect(notes).toContain("The out-of-pocket maximum is TRICARE's catastrophic cap, $1,324 a year, set per family.");
    expect(notes).toContain('2027 premiums (from Jan. 1, 2027): $60.54 member only / $307.48 member and family.');
  });

  test('guard-reserve TRS premiums unchanged (derived from the 2026 year file)', () => {
    expect(TRICARE_RATES_2026.reserveSelect.memberOnly).toBe(57.88);
    expect(TRICARE_RATES_2026.reserveSelect.memberAndFamily).toBe(286.66);
  });
});
