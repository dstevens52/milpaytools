/**
 * Guards the dollar-figure staleness tool (scripts/check-figures.ts) so it
 * can't silently break. Data-only: no page fixture, no browser, no server.
 * Run with `npm run test:figures`.
 *
 * It tests the TOOL, not the content: the report never fails on a figure.
 */

import { test, expect } from '@playwright/test';
import { join } from 'node:path';
import * as pay2026 from '@/data/pay-tables/2026';
import * as va2026 from '@/data/va-rates/2026';
import * as bah2026 from '@/data/bah/2026/mhaRates';
import * as constants from '@/data/constants';
import * as deployment2026 from '@/data/deployment/2026/constants';
import * as education2026 from '@/data/education/2026/constants';
import * as healthcare2026 from '@/data/healthcare/2026/constants';
import * as pcs2026 from '@/data/pcs/2026/constants';
import * as tricare2026 from '@/data/tricare/2026/constants';
import * as tsp2026 from '@/data/tsp/2026/constants';
import {
  SOURCE_GROUPS,
  buildIndex,
  classify,
  collectFiles,
  diffYears,
  extractFigures,
  extractFromText,
  indexFromEntries,
  makeClassifier,
  type ClassifiedFigure,
} from '../../scripts/figures/lib';

const ROOT = join(__dirname, '..', '..');

/**
 * Parser floors, ~90% of the counts on 2026-11-11 (2,695 figures in 69 of 72
 * scanned files). A broken regex or scan path drops far below these.
 */
const MIN_FIGURES = 2_425;
const MIN_FILES_WITH_FIGURES = 62;

const MODULES: Record<string, Record<string, unknown>> = {
  pay: pay2026,
  va: va2026,
  bah: bah2026,
  const: constants,
  deployment: deployment2026,
  education: education2026,
  healthcare: healthcare2026,
  pcs: pcs2026,
  tricare: tricare2026,
  tsp: tsp2026,
};

function classifyAll(): ClassifiedFigure[] {
  const index = buildIndex(
    '2026',
    SOURCE_GROUPS.map((group) => {
      const mod = MODULES[group.id];
      if (!mod) throw new Error(`No 2026 module wired into this test for source group "${group.id}"`);
      return { group, mod };
    }),
  );
  const classifier = makeClassifier(index);
  return extractFigures(ROOT, collectFiles(ROOT)).map((f) => classify(f, classifier));
}

const find = (figs: ClassifiedFigure[], fileSuffix: string, raw: string) =>
  figs.filter((f) => f.file.endsWith(fileSuffix) && f.raw === raw);

test.describe('figure check — data-only', () => {
  let figs: ClassifiedFigure[];
  test.beforeAll(() => {
    figs = classifyAll();
  });

  test('extract finds figures across the blog and guides', () => {
    const files = new Set(figs.map((f) => f.file));
    expect(figs.length).toBeGreaterThanOrEqual(MIN_FIGURES);
    expect(files.size).toBeGreaterThanOrEqual(MIN_FILES_WITH_FIGURES);
    expect([...files].some((f) => f.startsWith('src/app/guides/'))).toBe(true);
  });

  test('extraction: formats, magnitude skip and flags', () => {
    const figs = extractFromText(
      'x.mdx',
      [
        'Pay is $4,110.00/month, about $1,807 a year, or $12.',
        'A $1.5 million house and a $200K salary are skipped.',
        '| E-5 | $3,959.40 | $4,110.00 |',
        'Costs run $1,000–$2,000.',
      ].join('\n'),
    );
    expect(figs.map((f) => f.raw)).toEqual(['$4,110.00', '$1,807', '$12', '$3,959.40', '$4,110.00', '$1,000', '$2,000']);
    expect(figs[0]).toMatchObject({ line: 1, value: 4110, cents: 411000, whole: false });
    expect(figs[1].flags).toMatchObject({ approximate: true, annual: true });
    expect(figs[3]).toMatchObject({ line: 3, flags: { tableCell: true } });
    expect(figs[5].flags.range && figs[6].flags.range).toBe(true);
    expect(figs[0].flags).toEqual({ approximate: false, annual: false, tableCell: false, range: false });
  });

  test('$4,110.00 in the 2026 pay raise post is data from pay:E-5@6', () => {
    const hits = find(figs, '2026-military-pay-raise-explained.mdx', '$4,110.00');
    expect(hits.length).toBeGreaterThan(0);
    for (const f of hits) {
      expect(f.class).toBe('data');
      expect(f.sources.map((s) => s.label)).toContain('pay:E-5@6');
    }
  });

  test('$476.95 is data from bas:enlisted', () => {
    const hits = find(figs, '2026-military-pay-raise-explained.mdx', '$476.95');
    expect(hits.length).toBeGreaterThan(0);
    for (const f of hits) {
      expect(f.class).toBe('data');
      expect(f.sources.map((s) => s.label)).toContain('bas:enlisted');
    }
  });

  test('$373.43 in va-math-costs-you-money is unbound or derived, never an error', () => {
    const hits = find(figs, 'va-math-costs-you-money.mdx', '$373.43');
    expect(hits.length).toBeGreaterThan(0);
    for (const f of hits) expect(['unbound', 'data-derived']).toContain(f.class);
  });

  test('year-change mode lists a changed E-5@6 figure with old and new values', () => {
    const base = makeClassifier(
      indexFromEntries('2026', [['pay:E-5@6', 4110.0], ['pay:E-5@4', 3946.8], ['bas:enlisted', 476.95]], ['pay', 'const']),
    );
    const classified = extractFromText(
      'fixture.mdx',
      'E-5 at 6 years: $4,110.00. At 4 years: $3,946.80. Annual: $49,320/year. BAS $476.95. Other $123.45.',
    ).map((f) => classify(f, base));

    // Fixture 2027: only E-5@6 changes. BAS (`const`) has not landed.
    const next = indexFromEntries('2027', [['pay:E-5@6', 4250.0], ['pay:E-5@4', 3946.8]], ['pay']);
    const result = diffYears(classified, next);

    expect(result.stale.map((s) => s.figure.raw)).toEqual(['$4,110.00', '$49,320']);
    expect(result.stale[0].changes).toEqual([
      { label: 'pay:E-5@6', op: '=', oldValue: 4110, newValue: 4250, newFigure: 4250 },
    ]);
    expect(result.stale[1].changes[0]).toMatchObject({ label: 'pay:E-5@6', op: 'x12', newFigure: 51000 });
    // $476.95 matches only BAS, which has no 2027 data: counted as not checked, not stale.
    expect(result.notChecked).toBe(1);
  });
});
