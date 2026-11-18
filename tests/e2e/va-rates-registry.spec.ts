import { test, expect } from '@playwright/test';
import {
  CURRENT_VA_RATES,
  VA_RATES_2026,
  VA_2027_EFFECTIVE_DATE,
  selectVaRatesYear,
  vaRates2027,
  type VaRatesYear,
} from '../../src/data/va-rates/registry';
import { VA_RATES_2027_STATUS, type VaRates2027StatusConfig } from '../../src/data/va-rates/2027-status';
import { vaRates as rates2027, VA_RATES_META as meta2027 } from '../../src/data/va-rates/2027';
import { vaDecemberPaymentDay, vaRatesNotice, vaRatesShortStatus } from '../../src/lib/calculations/vaRatesStatus';

/**
 * The VA rate-year registry and the 2027 status file. Data-only: no browser.
 *
 * Loading 2027 is a data-only change (2027.ts + the status flip). These tests
 * need no edits that day: the typo check below starts running on its own.
 */

const status = (s: VaRates2027StatusConfig['status'], extra: Partial<VaRates2027StatusConfig> = {}) =>
  ({ ...VA_RATES_2027_STATUS, status: s, ...extra });

// A stand-in "published" year for the switch logic. Its table is the 2026 table
// on purpose: these tests check WHICH year is picked, never a 2027 figure.
const fake2027: VaRatesYear = { ...VA_RATES_2026, year: '2027', effectiveDate: VA_2027_EFFECTIVE_DATE, colaPercent: 9.9 };

test.describe('VA rate-year registry', () => {
  test('2027 takes effect December 1, 2026', () => {
    expect(VA_2027_EFFECTIVE_DATE).toBe('2026-12-01');
    expect(VA_RATES_2026.effectiveDate).toBe('2025-12-01');
  });

  test('unpublished 2027 → 2026 stays current on every date', () => {
    for (const d of ['2026-11-18', '2026-12-01', '2027-06-30']) {
      expect(selectVaRatesYear(d, null).year).toBe('2026');
    }
  });

  test('published 2027 switches on its effective date, not before', () => {
    expect(selectVaRatesYear('2026-11-30', fake2027).year).toBe('2026');
    expect(selectVaRatesYear('2026-12-01', fake2027).year).toBe('2027');
    expect(selectVaRatesYear('2027-01-15', fake2027).year).toBe('2027');
  });

  test('2027 counts as published only with the status flip AND the table AND its COLA', () => {
    const table = VA_RATES_2026.table;
    const meta = { ...meta2027, colaPercent: 9.9 };
    expect(vaRates2027(status('law-pending'), table, meta)).toBeNull();
    expect(vaRates2027(status('law-enacted'), table, meta)).toBeNull();
    expect(vaRates2027(status('published'), null, meta)).toBeNull();
    expect(vaRates2027(status('published'), table, { ...meta, colaPercent: null })).toBeNull();
    expect(vaRates2027(status('published'), table, meta)?.year).toBe('2027');
  });

  test('status file and 2027 placeholder agree', () => {
    expect(['law-pending', 'law-enacted', 'published']).toContain(VA_RATES_2027_STATUS.status);
    expect(VA_RATES_2027_STATUS.checkedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (VA_RATES_2027_STATUS.status === 'published') {
      expect(rates2027, '2027.ts must hold VA’s table when the status is published').not.toBeNull();
      expect(meta2027.colaPercent).not.toBeNull();
      expect(meta2027.fetchedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    } else {
      // No 2027 figure anywhere until VA publishes.
      expect(rates2027).toBeNull();
      expect(meta2027.colaPercent).toBeNull();
      expect(CURRENT_VA_RATES.year).toBe('2026');
    }
    if (VA_RATES_2027_STATUS.status === 'law-enacted' || VA_RATES_2027_STATUS.status === 'published') {
      expect(VA_RATES_2027_STATUS.lawCitation).toBeTruthy();
    }
  });

  // Typo check ONLY: every published 2027 cell should be close to the 2026 cell
  // × (1 + COLA). A miss means stop and compare with VA.gov — never change a
  // published figure to fit the formula. Skips until 2027.ts holds VA's table.
  test('2027 table typo check against 2026 × (1 + COLA)', () => {
    test.skip(rates2027 === null || meta2027.colaPercent === null, '2027 table not published yet');
    const t27 = rates2027!;
    const f = 1 + meta2027.colaPercent! / 100;
    const misses: string[] = [];
    for (const [rating, row26] of Object.entries(VA_RATES_2026.table)) {
      const row27 = t27[Number(rating)];
      expect(row27, `2027 row ${rating}%`).toBeDefined();
      for (const [col, v26] of Object.entries(row26)) {
        const v27 = (row27 as unknown as Record<string, number>)[col];
        // Base rates carry cents; VA's added dependent amounts are whole dollars at
        // most ratings (e.g. 30% spouse +$65), and the combination cells are base +
        // those amounts, so a correct cell can sit up to about a dollar off the
        // straight product. A typo (a transposed or dropped digit) misses by far more.
        const tolerance = 1.1;
        if (typeof v27 !== 'number' || Math.abs(v27 - v26 * f) > tolerance) {
          misses.push(`${rating}%/${col}: 2027 ${v27} vs 2026 ${v26} × ${f.toFixed(3)} = ${(v26 * f).toFixed(2)}`);
        }
      }
    }
    expect(misses, 'cells to compare against VA.gov (do not "fix" them to the formula)').toEqual([]);
  });
});

test.describe('2027 status wording', () => {
  test('pending and enacted notices are dated and carry no dollar figure', () => {
    for (const s of [status('law-pending'), status('law-enacted', { lawCitation: 'Pub. L. 119-00' })]) {
      const n = vaRatesNotice(s, VA_RATES_2026, null)!;
      expect(n).not.toBeNull();
      const text = `${n.heading} ${n.body}`;
      expect(text).not.toContain('$');
      expect(text).toContain('November 18, 2026'); // checkedDate
      expect(text).toContain('December 1, 2026'); // effective date
      expect(text).toContain('2026 rates, effective December 1, 2025');
      expect(text).toContain('§ 5120(e)');
    }
    expect(vaRatesNotice(status('law-pending'), VA_RATES_2026, null)!.body).toContain('H.R. 8552');
    // Payment timing (wording approved by Claude Chat, 2026-11-18).
    expect(vaRatesNotice(status('law-pending'), VA_RATES_2026, null)!.body).toContain(
      "If the law is signed in time, the first payment at the new rates is December 2026's, which VA normally pays on December 31 because January 1 is a federal holiday (38 U.S.C. § 5120(e)).",
    );
    expect(vaRatesNotice(status('law-enacted', { lawCitation: 'Pub. L. 119-00' }), VA_RATES_2026, null)!.body).toContain(
      "The first payment at the new rates is December 2026's, which VA normally pays on December 31",
    );
    expect(vaRatesNotice(status('law-enacted', { lawCitation: 'Pub. L. 119-00' }), VA_RATES_2026, null)!.body).toContain('Pub. L. 119-00');
  });

  test('published but not yet effective → notice says when it switches; current 2027 → no notice', () => {
    const pub = status('published', { lawCitation: 'Pub. L. 119-00' });
    const n = vaRatesNotice(pub, VA_RATES_2026, fake2027)!;
    expect(n.heading).toContain('published');
    expect(`${n.heading} ${n.body}`).not.toContain('$');
    expect(vaRatesNotice(pub, fake2027, fake2027)).toBeNull();
    expect(vaRatesShortStatus(pub, fake2027)).toBeNull();
  });

  test('the live notice matches the status file', () => {
    const n = vaRatesNotice();
    if (CURRENT_VA_RATES.year === '2026') {
      expect(n).not.toBeNull();
      expect(`${n!.heading} ${n!.body}`).not.toContain('$');
      expect(vaRatesShortStatus()).toBeTruthy();
    } else {
      expect(n).toBeNull();
    }
  });
});

test('December payment day: last weekday of December (§ 5120(e))', () => {
  expect(vaDecemberPaymentDay('2026-12-01')).toBe('December 31'); // Thursday
  expect(vaDecemberPaymentDay('2028-12-01')).toBe('December 29'); // Dec 31, 2028 is a Sunday
});
