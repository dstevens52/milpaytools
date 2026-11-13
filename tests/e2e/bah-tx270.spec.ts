import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BAH_RATES_BY_YEAR } from '@/data/bah/registry';
import { BAH_YEAR } from '@/data/bah/current';

// TX270's mid-year increase is a 2026 record: the data checks read the 2026
// registry entry (and the 2026 DTMO ZIP file, the source of record), so they
// hold after the BAH year flips. The page checks describe the site while 2026
// is the BAH year and are skipped after the flip.
const mhaRates = BAH_RATES_BY_YEAR['2026'];
const zipToMha: Record<string, string> = Object.fromEntries(
  readFileSync(path.join(process.cwd(), 'data/sources/dtmo/2026/sorted_zipmha26.txt'), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => l.trim().split(/\s+/) as [string, string]),
);
const IS_2026: boolean = (BAH_YEAR as string) === '2026';

// TX270 (Abilene/Dyess AFB) — DTMO "2026 Abilene Temporary Increase", effective 2026-05-16.
// Expected values typed from docs/sources/bah-2026-abilene-temporary-increase.md
// ("Current (eff. 05/16/2026)" columns), NOT read from the data file.

// [grade, with dependents, without dependents]
const TX270_CURRENT: [string, number, number][] = [
  ['E-1', 1761, 1380],
  ['E-2', 1761, 1380],
  ['E-3', 1761, 1380],
  ['E-4', 1761, 1380],
  ['E-5', 1872, 1545],
  ['E-6', 2820, 2115],
  ['E-7', 2844, 2133],
  ['E-8', 2853, 2145],
  ['E-9', 2895, 2352],
  ['W-1', 2841, 2130],
  ['W-2', 2850, 2142],
  ['W-3', 2862, 2382],
  ['W-4', 2919, 2817],
  ['W-5', 3030, 2826],
  ['O-1E', 2847, 2139],
  ['O-2E', 2856, 2286],
  ['O-3E', 2937, 2814],
  ['O-1', 1989, 1644],
  ['O-2', 2805, 2136],
  ['O-3', 2859, 2475],
  ['O-4', 3063, 2820],
  ['O-5', 3234, 2829],
  ['O-6', 3258, 2832],
  ['O-7', 3282, 2859],
];

/**
 * sha256 of every MHA except TX270, taken from the pre-change mhaRates.ts (b7d5828).
 * Any edit to another MHA changes this. Recompute only when a new official source
 * record changes other MHAs.
 */
const OTHER_MHAS_SHA256 = '30b601079f69f411af10417adba3481a9562266077c41b6b7cd4da094c6e8329';
const OTHER_MHAS_COUNT = 337;

test.describe('BAH TX270 mid-year update — data', () => {
  test('TX270 matches the DTMO current rates for all 24 grades x 2', () => {
    const r = mhaRates.TX270;
    expect(Object.keys(r.w)).toHaveLength(24);
    expect(Object.keys(r.wo)).toHaveLength(24);
    for (const [grade, w, wo] of TX270_CURRENT) {
      expect(r.w[grade], `w ${grade}`).toBe(w);
      expect(r.wo[grade], `wo ${grade}`).toBe(wo);
    }
  });

  test('every MHA other than TX270 is unchanged', () => {
    const others = Object.keys(mhaRates).filter((k) => k !== 'TX270').sort();
    expect(others).toHaveLength(OTHER_MHAS_COUNT);
    const digest = createHash('sha256')
      .update(JSON.stringify(others.map((k) => [k, mhaRates[k]])))
      .digest('hex');
    expect(digest).toBe(OTHER_MHAS_SHA256);
  });

  test('79607 maps to TX270 (28 ZIPs in the MHA, DTMO sorted_zipmha26.txt)', () => {
    expect(zipToMha['79607']).toBe('TX270');
    expect(Object.values(zipToMha).filter((m) => m === 'TX270')).toHaveLength(28);
  });
});

test.describe('BAH TX270 mid-year update — pages', () => {
  test('BAH lookup 79607, E-5 with dependents shows $1,872', async ({ page }) => {
    test.skip(!IS_2026, 'TX270 temporary increase is a 2026 rate');
    await page.goto('/bah');
    await page.getByLabel('Duty Station').pressSequentially('79607', { delay: 50 });
    await page.getByRole('button', { name: 'With Dependents' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: '$1,872' })).toBeVisible();
  });

  test('Dyess AFB station page states the May 16, 2026 increase and effective date', async ({ page }) => {
    test.skip(!IS_2026, 'TX270 temporary increase is a 2026 rate');
    await page.goto('/bah/dyess-afb');
    await expect(page.getByTestId('bah-midyear-change')).toHaveText(
      'DTMO increased Abilene/Dyess AFB BAH effective May 16, 2026.',
    );
    await expect(page.getByText('effective May 16, 2026 (DTMO mid-year change)').first()).toBeVisible();
    await expect(page.getByText(/effective January 1, 2026/)).toHaveCount(0);
  });

  test('other station pages keep the January 1 effective date and no mid-year line (Fort Bragg)', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await expect(page.getByTestId('bah-midyear-change')).toHaveCount(0);
    await expect(page.getByText(new RegExp(`effective\\s+January 1, ${BAH_YEAR}`)).first()).toBeVisible();
  });
});
