import { test, expect } from '@playwright/test';

// /pay/[rank] — "2027 pay raise" section + appended FAQ (feat/pay-raise-2027-pass).
// Figures typed from the hand-computed golden table (see pay-raise-2027.spec.ts).

const RANKS = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'o1', 'o2', 'o3', 'o4', 'o5', 'o6'];

test.describe('/pay/[rank] 2027 pay raise section', () => {
  test('E-5: over-6 row shows $4,397.70 and $4,258.00; sentence +$287.70', async ({ page }) => {
    await page.goto('/pay/e5');
    const section = page.getByTestId('rank-raise-2027');
    await expect(section.locator('h2')).toHaveText('2027 pay raise for an E-5 (not final)');
    const row = section.locator('[data-raise-row="6"]');
    await expect(row).toContainText('$4,110.00');
    await expect(row).toContainText('$4,397.70');
    await expect(row).toContainText('$4,258.00');
    await expect(page.getByTestId('rank-raise-sentence')).toHaveText(
      'An E-5 with over 6 years of service would get $4,397.70 a month under the current plan (+$287.70) or $4,258.00 under the Senate version (+$148.00).',
    );
    await expect(section.getByRole('link', { name: 'Compare every grade and year on the 2027 pay raise calculator →' })).toHaveAttribute(
      'href',
      '/pay/raise?grade=e5',
    );
  });

  test('O-6: † at over 26 and the cap footnote', async ({ page }) => {
    await page.goto('/pay/o6');
    const section = page.getByTestId('rank-raise-2027');
    const row = section.locator('[data-raise-row="26"]');
    await expect(row).toContainText('$15,408.30†');
    await expect(page.getByTestId('rank-raise-cap-note')).toHaveText(
      '† May be limited by the pay cap; 2027 cap not yet published. Shown at the 2026 cap.',
    );
  });

  test('E-1: compact table rows only (same rows as the 2026 table)', async ({ page }) => {
    await page.goto('/pay/e1');
    const rows = page.getByTestId('rank-raise-2027').locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('$2,407.20');
    await expect(rows.first()).toContainText('$2,575.70');
    await expect(rows.first()).toContainText('$2,493.90');
  });

  for (const slug of RANKS) {
    test(`/pay/${slug}: section present; 2027 FAQ appended last (visible + schema)`, async ({ page }) => {
      await page.goto(`/pay/${slug}`);
      await expect(page.getByTestId('rank-raise-2027')).toBeVisible();
      const grade = `${slug[0].toUpperCase()}-${slug.slice(1)}`;
      const q = `What will the 2027 pay raise be for an ${grade}?`;
      const visible = await page.locator('[data-faq-question]').evaluateAll((els) =>
        els.map((e) => e.getAttribute('data-faq-question')),
      );
      expect(visible[visible.length - 1]).toBe(q);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = blocks.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
      const names = faq.mainEntity.map((m: { name: string }) => m.name);
      expect(names[names.length - 1]).toBe(q);
    });
  }
});
