import { test, expect } from '@playwright/test';
import {
  RETIREE_COLA_2027,
  RETIREE_COLA_2027_SECTION,
  reduxPercent,
  type RetireeColaSection,
} from '../../src/data/retiree-cola/2027';
import { retireeColaSectionCopy, RETIREE_COLA_SECTION_ID } from '../../src/lib/calculations/retireeColaSection';
import { retireeColaFaq, retireeColaTiming } from '../../src/lib/calculations/payRaise';

/**
 * /pay/raise "2027 COLA for military retired pay" section (S8).
 * Figures only from DFAS and SSA pages recorded in src/data/retiree-cola/2027.ts;
 * an item DFAS hasn't published is null and leaves no copy behind.
 * Data-only part runs without a server; the page part needs the dev server.
 */

const OFFICIAL_HOSTS = new Set(['www.ssa.gov', 'www.dfas.mil']);

test.describe('retiree COLA section — data', () => {
  test('every source is a DFAS or SSA page', () => {
    const s = RETIREE_COLA_2027_SECTION;
    const sources = [s.percent.source, s.timing?.source, s.redux?.source, s.partialFirstYear?.source].filter(Boolean);
    expect(sources.length).toBeGreaterThan(0); // control
    for (const src of sources) expect(OFFICIAL_HOSTS.has(new URL(src!.url).host), src!.url).toBe(true);
    for (const src of retireeColaSectionCopy().sources) expect(OFFICIAL_HOSTS.has(new URL(src.url).host), src.url).toBe(true);
  });

  test('percent is the one the frozen FAQ uses, and REDUX is computed from it', () => {
    expect(RETIREE_COLA_2027_SECTION.percent.value).toBe(RETIREE_COLA_2027.percent);
    const copy = retireeColaSectionCopy();
    const text = copy.paragraphs.map((p) => p.text).join(' ');
    expect(text).toContain(`${RETIREE_COLA_2027.percent}%`);
    expect(text).toContain(`${reduxPercent()}%`);
    // The FAQ answer (pay meta guard) states the same two figures.
    const faq = retireeColaFaq().answer;
    expect(faq).toContain(`${RETIREE_COLA_2027.percent}%`);
    expect(faq).toContain(`${reduxPercent()}%`);
  });

  test('timing is the same sentence and dates the FAQ and key-dates card use', () => {
    const s = RETIREE_COLA_2027_SECTION;
    expect(s.timing).not.toBeNull();
    expect(s.timing!.effectiveDate).toBe(RETIREE_COLA_2027.effectiveDate);
    expect(s.timing!.firstRetiredPayDate).toBe(RETIREE_COLA_2027.firstRetiredPayDate);
    expect(s.timing!.firstAnnuitantPayDate).toBe(RETIREE_COLA_2027.firstAnnuitantPayDate);
    const byKey = Object.fromEntries(retireeColaSectionCopy().paragraphs.map((p) => [p.key, p.text]));
    expect(byKey.timing).toBe(retireeColaTiming());
    expect(retireeColaFaq().answer).toContain(retireeColaTiming()); // control: the FAQ states it too
  });

  test('unpublished items (null) produce no copy; no "not posted" line', () => {
    const s = RETIREE_COLA_2027_SECTION;
    const copy = retireeColaSectionCopy();
    const keys = copy.paragraphs.map((p) => p.key);
    expect(keys).toEqual(['percent', 'timing', 'redux', ...(s.partialFirstYear ? ['partial'] : [])]);
    expect(keys.includes('partial')).toBe(s.partialFirstYear !== null);
    expect(copy.paragraphs.map((p) => p.text).join(' ')).not.toMatch(/hasn't posted|not posted|unknown/i);
  });

  test('REDUX age-62 wording (approved; matches DFAS CSB/REDUX and 10 U.S.C. 1410)', () => {
    const redux = retireeColaSectionCopy().paragraphs.find((p) => p.key === 'redux')!.text;
    expect(redux).toContain(
      'At age 62, DFAS recalculates your retired pay to what it would have been under High-3, with the full multiplier and full COLAs to date. COLAs after that are again 1 percentage point lower.',
    );
  });

  test('filled-in items render from the data (fixture, not real figures)', () => {
    const fixture: RetireeColaSection = {
      ...RETIREE_COLA_2027_SECTION,
      timing: {
        effectiveDate: '2000-12-01',
        firstRetiredPayDate: '2000-12-29',
        firstAnnuitantPayDate: '2001-01-02',
        source: { name: 'DFAS fixture', url: 'https://www.dfas.mil/fixture/' },
      },
      partialFirstYear: {
        rows: [{ retiredPayStarted: 'Fixture quarter', percent: 1.1, reduxPercent: 0.1 }],
        source: { name: 'DFAS table fixture', url: 'https://www.dfas.mil/fixture-table/' },
      },
    };
    const copy = retireeColaSectionCopy(fixture);
    const byKey = Object.fromEntries(copy.paragraphs.map((p) => [p.key, p.text]));
    expect(byKey.timing).toContain('December 1, 2000');
    expect(byKey.timing).toContain('December 29, 2000');
    expect(byKey.timing).toContain('January 2, 2001');
    expect(byKey.partial).toContain('Fixture quarter: 1.1% (REDUX 0.1%)');
    expect(copy.sources.map((s) => s.url)).toEqual(
      expect.arrayContaining(['https://www.dfas.mil/fixture/', 'https://www.dfas.mil/fixture-table/']),
    );
  });
});

test.describe('retiree COLA section — /pay/raise', () => {
  test('renders the H2, the published items and the source links', async ({ page }) => {
    await page.goto('/pay/raise');
    const section = page.locator(`#${RETIREE_COLA_SECTION_ID}`);
    await expect(section.locator('h2')).toHaveText('2027 COLA for military retired pay');
    const copy = retireeColaSectionCopy();
    for (const p of copy.paragraphs) {
      await expect(section.locator(`[data-cola-item="${p.key}"]`)).toHaveText(p.text);
    }
    await expect(section.locator('[data-cola-item]')).toHaveCount(copy.paragraphs.length);
    await expect(section).not.toContainText("hasn't posted");
    const hrefs = await section.locator('a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs).toEqual(copy.sources.map((s) => s.url));
  });

  test('title, H1 and the FAQ entry are untouched (pay meta guard)', async ({ page }) => {
    await page.goto('/pay/raise');
    // Exactly one H1, and the section's H2 isn't it.
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).not.toContainText('COLA');
    // The FAQ answer still comes from retireeColaFaq() verbatim.
    const faq = retireeColaFaq();
    await expect(page.locator(`[data-faq-question="${faq.question}"] p`)).toHaveText(faq.answer);
  });
});
