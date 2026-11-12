import { test, expect } from '@playwright/test';
import { DATA_LAST_CHECKED } from '@/data/watch';
import { formatIsoDate } from '@/lib/calculations/payRaise';

// /pay/raise — the 2027 pay raise calculator page (figures locked separately
// by the data-only pay-raise-2027.spec.ts).

test.describe('/pay/raise page', () => {
  test('loads with the status box visible above the calculator', async ({ page }) => {
    const res = await page.goto('/pay/raise');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('2027 Military Pay Raise Calculator: 7-6-5 Plan vs 3.6%');
    const status = page.getByTestId('raise-status');
    await expect(status).toBeVisible();
    // Same shared last-checked date as the BAH 2027 notice (src/data/watch.ts).
    await expect(status).toContainText(`Not final as of ${formatIsoDate(DATA_LAST_CHECKED)}.`);
    await expect(status).toContainText('Your 2026 pay is the only guaranteed figure.');
    // Above the fold at the default 1280×800 viewport.
    const box = await status.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThan(800);
  });

  test('prefills from ?grade=E-5&yos=6 and shows both scenarios', async ({ page }) => {
    await page.goto('/pay/raise?grade=E-5&yos=6');
    await expect(page.locator('#raise-grade')).toHaveValue('E-5');
    await expect(page.locator('#raise-yos')).toHaveValue('6');
    await expect(page.getByTestId('raise-2026')).toContainText('$4,110.00');
    await expect(page.getByTestId('raise-col-current-plan')).toContainText('$4,397.70');
    await expect(page.getByTestId('raise-col-senate-3-6')).toContainText('$4,258.00');
    await expect(page.getByTestId('raise-cap-note')).toHaveCount(0);
    await expect(page.getByTestId('raise-tier-note')).toHaveCount(0);
  });

  test('short grade param from rank pages (?grade=e5) also prefills', async ({ page }) => {
    await page.goto('/pay/raise?grade=e5');
    await expect(page.locator('#raise-grade')).toHaveValue('E-5');
  });

  test('O-8 at 22 years shows the cap note', async ({ page }) => {
    await page.goto('/pay/raise?grade=O-8&yos=22');
    await expect(page.locator('#raise-grade')).toHaveValue('O-8');
    const notes = page.getByTestId('raise-cap-note');
    await expect(notes).toHaveCount(2);
    await expect(notes.first()).toContainText('May be limited by the pay cap; 2027 cap not yet published.');
    await expect(page.getByTestId('raise-col-current-plan')).toContainText('$18,999.90');
  });

  test('warrant officer shows the 6% assumption note', async ({ page }) => {
    await page.goto('/pay/raise?grade=W-2&yos=8');
    await expect(page.locator('#raise-grade')).toHaveValue('W-2');
    await expect(page.getByTestId('raise-tier-note')).toContainText('does not list warrant officer grades');
    await expect(page.getByTestId('raise-col-current-plan')).toContainText('$6,414.10');
  });

  test('E-9 under 10 years is "not applicable", never $0', async ({ page }) => {
    await page.goto('/pay/raise?grade=E-9&yos=5');
    await expect(page.locator('#raise-grade')).toHaveValue('E-9');
    await expect(page.getByTestId('raise-not-applicable')).toBeVisible();
    await expect(page.getByTestId('raise-calculator')).not.toContainText('$0.00');
  });

  test('FAQPage schema lists the five questions', async ({ page }) => {
    await page.goto('/pay/raise');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = blocks.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    expect(faq).toBeTruthy();
    expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual([
      'When will the 2027 raise be final?',
      'Why is the raise different by rank?',
      'Do warrant officers get 6%?',
      'Why might senior officers see a smaller raise?',
      'Does the raise affect BAH?',
    ]);
  });

  test('rank page links to the raise calculator with its grade', async ({ page }) => {
    await page.goto('/pay/e5');
    const link = page.getByTestId('pay-raise-link');
    await expect(link).toHaveAttribute('href', '/pay/raise?grade=e5');
    await expect(link).toHaveText("2027 raise: see what you'd make under each plan →");
  });
});
