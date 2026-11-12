import { test, expect } from '@playwright/test';

// /pay/[rank] titles and meta descriptions (click-rate batch 1, Nov 2026).
// Titles are branch-neutral and absolute (no " | MilPayTools" suffix);
// descriptions lead with every branch's rank title.

const RANK_SLUGS = [
  'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9',
  'o1', 'o2', 'o3', 'o4', 'o5', 'o6',
];

const metaDescription = (page: import('@playwright/test').Page) =>
  page.locator('meta[name="description"]').getAttribute('content');

test.describe('Rank page titles and descriptions', () => {
  test('E-3: exact title, branch rank names in description', async ({ page }) => {
    await page.goto('/pay/e3');
    await expect(page).toHaveTitle('E-3 Pay 2026: $2,837–$3,198/Month, All Branches');
    const desc = await metaDescription(page);
    expect(desc).toContain('Navy Seaman');
    expect(desc).toContain('Airman First Class');
    expect(desc).toContain('Lance Corporal');
  });

  test('E-1: flat-rate title format', async ({ page }) => {
    await page.goto('/pay/e1');
    const title = await page.title();
    expect(title).toMatch(/^E-1 Pay 2026: \$[\d,]+\/Month(, All Branches)?$/);
    expect(title).not.toContain('–');
  });

  test('O-6: range title format, ≤ 60 characters', async ({ page }) => {
    await page.goto('/pay/o6');
    const title = await page.title();
    expect(title).toMatch(/^O-6 Pay 2026: \$[\d,]+–\$[\d,]+\/Month(, All Branches)?$/);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  test('social titles carry the site name', async ({ page }) => {
    await page.goto('/pay/e3');
    const expected = 'E-3 Pay 2026: $2,837–$3,198/Month, All Branches | MilPayTools';
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', expected);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', expected);
  });

  for (const slug of RANK_SLUGS) {
    test(`/pay/${slug}: title ≤ 60 chars, description ≤ 160 chars`, async ({ page }) => {
      await page.goto(`/pay/${slug}`);
      const title = await page.title();
      const desc = await metaDescription(page);
      expect(title).toMatch(/ Pay 2026: \$/);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(title).not.toContain('MilPayTools');
      expect(desc).not.toBeNull();
      expect(desc!.length).toBeLessThanOrEqual(160);
      // Army, Navy, Air Force and Marine titles are never dropped.
      for (const branch of ['Army ', 'Navy ', 'Air Force ', 'Marine ']) {
        expect(desc).toContain(branch);
      }
    });
  }
});
