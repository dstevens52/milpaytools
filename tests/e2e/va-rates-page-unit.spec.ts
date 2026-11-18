import { test, expect } from '@playwright/test';
import type { VADisabilityTable } from '../../src/data/types';
import { VA_RATES_2026, VA_2027_EFFECTIVE_DATE, type VaRatesYear } from '../../src/data/va-rates/registry';
import { VA_RATES_2027_STATUS, type VaRates2027StatusConfig } from '../../src/data/va-rates/2027-status';
import {
  ADDED_COLUMNS,
  DEPENDENT_RATINGS,
  NO_CHILD_COLUMNS,
  WITH_CHILD_COLUMNS,
  rateCell,
  vaRatesPageDescription,
  vaRatesPageFaqs,
  vaRatesPageH1,
  vaRatesPageMode,
  vaRatesPageTitle,
  vaRatesPageYear,
  vaRatesStatusBox,
} from '../../src/lib/calculations/vaRatesPage';

/**
 * /va-disability-rates — both modes from the one status field. Data-only.
 *
 * The "published" fixture below is SYNTHETIC: the 2026 table plus $1.00 in
 * every cell, used only to check that the mode switch flips everything and
 * that per-cell changes are computed. It is never shown on the site.
 */

const status = (s: VaRates2027StatusConfig['status'], extra: Partial<VaRates2027StatusConfig> = {}) =>
  ({ ...VA_RATES_2027_STATUS, status: s, ...extra });

const plusOne: VADisabilityTable = Object.fromEntries(
  Object.entries(VA_RATES_2026.table).map(([r, row]) => [
    r,
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Math.round((v + 1) * 100) / 100])),
  ]),
) as unknown as VADisabilityTable;
const FIXTURE_2027: VaRatesYear = { year: '2027', table: plusOne, effectiveDate: VA_2027_EFFECTIVE_DATE, colaPercent: 9.9, sourceUrl: VA_RATES_2026.sourceUrl };

const CALC_LINK = '[VA disability calculator](/calculators/va-disability)';

test.describe('/va-disability-rates — pending mode', () => {
  test('title, H1 and description are the spec strings and fit', () => {
    expect(vaRatesPageMode(null)).toBe('pending');
    expect(vaRatesPageTitle('pending')).toBe('VA Disability Rates 2027: COLA Status and 2026 Pay Chart');
    expect(vaRatesPageTitle('pending').length).toBe(56);
    expect(vaRatesPageH1('pending')).toBe('VA Disability Compensation Rates: 2027 Status and 2026 Rates');
    expect(vaRatesPageDescription('pending', null).length).toBeLessThanOrEqual(160);
  });

  test('no 2027 dollar figure anywhere in pending-mode text', () => {
    for (const s of [status('law-pending'), status('law-enacted', { lawCitation: 'Pub. L. 119-00' })]) {
      const box = vaRatesStatusBox(s);
      const text = [
        vaRatesPageTitle('pending'), vaRatesPageH1('pending'), vaRatesPageDescription('pending', null),
        box.label, ...box.official, ...box.pending, box.effective, box.payment, box.checked,
        ...vaRatesPageFaqs(s, null).flatMap((f) => [f.question, f.answer]),
      ].join('\n');
      expect(text).not.toContain('$');
    }
  });

  test('status box: official, pending, effective date, checked date', () => {
    const box = vaRatesStatusBox(status('law-pending'));
    expect(box.official.join(' ')).toContain('effective December 1, 2025 (2.8% COLA)');
    expect(box.pending.join(' ')).toContain('H.R. 8552');
    expect(box.pending.join(' ')).toContain('not published as of November 18, 2026');
    expect(box.effective).toBe('The 2027 rates take effect December 1, 2026.');
    expect(box.payment).toBe(
      "If the law is signed in time, the first payment at the new rates is December 2026's, which VA normally pays on December 31 because January 1 is a federal holiday (38 U.S.C. § 5120(e)).",
    );
    expect(box.checked).toBe('Checked November 18, 2026.');
    // Enacted: the law moves to "official" and the "if signed" condition drops.
    const enacted = vaRatesStatusBox(status('law-enacted', { lawCitation: 'Pub. L. 119-00' }));
    expect(enacted.official.join(' ')).toContain('Pub. L. 119-00');
    expect(enacted.pending.join(' ')).not.toContain('H.R. 8552');
    expect(enacted.payment.startsWith('The first payment')).toBe(true);
  });

  test('tables show the 2026 cells exactly, with no change column', () => {
    expect(vaRatesPageYear(null).year).toBe('2026');
    for (const r of DEPENDENT_RATINGS) {
      for (const c of [...NO_CHILD_COLUMNS, ...WITH_CHILD_COLUMNS, ...ADDED_COLUMNS]) {
        expect(rateCell(r, c.key, null)).toEqual({ amount: VA_RATES_2026.table[r][c.key], change: null });
      }
    }
  });
});

test.describe('/va-disability-rates — the status field flips everything', () => {
  test('published: title, H1, description, table and FAQ switch', () => {
    expect(vaRatesPageMode(FIXTURE_2027)).toBe('published');
    expect(vaRatesPageTitle('published')).toBe('VA Disability Rates 2027: Official Pay Chart by Rating');
    expect(vaRatesPageTitle('published').length).toBe(54);
    expect(vaRatesPageH1('published')).toBe('VA Disability Compensation Rates 2027');
    expect(vaRatesPageDescription('published', FIXTURE_2027)).toContain('effective December 1, 2026 (9.9% COLA)');
    expect(vaRatesPageYear(FIXTURE_2027).year).toBe('2027');
    expect(rateCell(70, 'withSpouse', FIXTURE_2027)).toEqual({ amount: plusOne[70].withSpouse, change: 1 });
    const pendingFaqs = vaRatesPageFaqs(status('law-pending'), null);
    const publishedFaqs = vaRatesPageFaqs(status('published', { lawCitation: 'Pub. L. 119-00' }), FIXTURE_2027);
    expect(publishedFaqs.map((f) => f.question)).toEqual(pendingFaqs.map((f) => f.question));
    expect(publishedFaqs[0].answer).not.toEqual(pendingFaqs[0].answer);
    expect(publishedFaqs[0].answer).toContain('9.9% COLA');
  });

  test('three FAQs; each answer ends by naming the combined-rating calculator', () => {
    for (const faqs of [
      vaRatesPageFaqs(status('law-pending'), null),
      vaRatesPageFaqs(status('law-enacted', { lawCitation: 'Pub. L. 119-00' }), null),
      vaRatesPageFaqs(status('published', { lawCitation: 'Pub. L. 119-00' }), FIXTURE_2027),
    ]) {
      expect(faqs.map((f) => f.question)).toEqual([
        'When do the 2027 VA disability rates take effect?',
        'When does the first payment at the 2027 rates arrive?',
        'Is the VA disability COLA increase automatic?',
      ]);
      for (const f of faqs) {
        const last = f.answer.split(/(?<=\.)\s+/).pop()!;
        expect(last, f.question).toContain(CALC_LINK);
      }
    }
  });
});
