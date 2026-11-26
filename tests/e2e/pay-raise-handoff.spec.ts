import { test, expect, type Page } from '@playwright/test';
import { PAY_RAISE_2027 } from '@/data/pay-raise/2027';
import { pageTitle, pageDescription } from '@/lib/calculations/payRaise';
import { combinedPayBahYear } from '@/lib/combinedPayYear';

// P1: the /pay/raise result → Military Pay Calculator handoff.
// Every test uses a non-default grade AND years (/pay/raise defaults to E-5,
// 6 years), so a dropped ?rank= or ?yos= fails instead of passing by accident.

const YEAR = combinedPayBahYear();

/**
 * Before a click-through, keep the calculator's hero image request inside the browser.
 * The page's desktop hero is a /_next/image WebP (DesktopHeroImage). In two of three PR #98 CI
 * runs (Firefox), the first request for it, made by this client-side navigation, never finished
 * on the shard's `next start` server. From then on, every full load of
 * /calculators/total-compensation at desktop width on that server never reached "load" (16+ tests
 * in other specs timed out). Loads at 375 px (data: URI, no image request) and `commit`-only
 * loads passed. These tests check that grade and years reach the calculator; the image plays no
 * part, so it is aborted in the browser and never reaches the server.
 */
async function blockOptimizedImages(page: Page) {
  await page.route('**/_next/image**', (route) => route.abort());
}

test.describe('/pay/raise → total compensation handoff', () => {
  test('O-3, 8 years: block under the result, exact href and copy', async ({ page }) => {
    await page.goto('/pay/raise?grade=o3&yos=8');
    await expect(page.locator('#raise-grade')).toHaveValue('O-3');
    await expect(page.locator('#raise-yos')).toHaveValue('8');

    const block = page.getByTestId('raise-handoff');
    await expect(block).toBeVisible();
    await expect(block).toContainText('Basic pay is only part of what you make.');
    await expect(block).toContainText(
      `Add your duty station to see your full ${YEAR} pay as an O-3 with 8 years of service: base pay, BAH, BAS, the tax advantage, and the civilian salary it equals.`,
    );
    await expect(block).not.toContainText('2027');

    const link = page.getByTestId('raise-handoff-link');
    await expect(link).toHaveText('See my full military pay →');
    await expect(link).toHaveAttribute('href', '/calculators/total-compensation?rank=o3&yos=8');

    // Under the "Basic pay only" line: the block comes after it in the result.
    const basicOnly = page.getByText('Basic pay only. BAH and BAS are set separately');
    const lineBox = await basicOnly.boundingBox();
    const blockBox = await block.boundingBox();
    expect(lineBox).not.toBeNull();
    expect(blockBox).not.toBeNull();
    expect(blockBox!.y).toBeGreaterThan(lineBox!.y);
  });

  test('clicking opens the calculator with O-3 and 8 years selected', async ({ page }) => {
    await blockOptimizedImages(page);
    await page.goto('/pay/raise?grade=o3&yos=8');
    const link = page.getByTestId('raise-handoff-link');
    await expect(link).toHaveAttribute('href', '/calculators/total-compensation?rank=o3&yos=8');
    await link.click();
    await expect(page).toHaveURL(/\/calculators\/total-compensation\?rank=o3&yos=8$/);
    await expect(page.getByLabel('Rank / Pay Grade')).toHaveValue('O-3');
    await expect(page.getByLabel('Years of Service')).toHaveValue('8');
  });

  test('changing to W-2, 4 years updates the href and says "a W-2"', async ({ page }) => {
    await page.goto('/pay/raise?grade=o3&yos=8');
    await expect(page.getByTestId('raise-handoff-link')).toHaveAttribute('href', '/calculators/total-compensation?rank=o3&yos=8');
    await page.locator('#raise-grade').selectOption('W-2');
    await page.locator('#raise-yos').selectOption('4');

    const block = page.getByTestId('raise-handoff');
    await expect(page.getByTestId('raise-handoff-link')).toHaveAttribute('href', '/calculators/total-compensation?rank=w2&yos=4');
    await expect(block).toContainText(`your full ${YEAR} pay as a W-2 with 4 years of service:`);
    await expect(block).not.toContainText('an W-2');
    await expect(block).not.toContainText('2027');
  });

  test('no DFAS rate (E-9, 5 years): no block', async ({ page }) => {
    await page.goto('/pay/raise?grade=E-9&yos=5');
    await expect(page.locator('#raise-grade')).toHaveValue('E-9');
    await expect(page.getByTestId('raise-not-applicable')).toBeVisible();
    await expect(page.getByTestId('raise-handoff')).toHaveCount(0);
    await expect(page.getByTestId('raise-handoff-link')).toHaveCount(0);
  });

  test('O-1E round-trips: href rank=o1e, calculator shows O-1E', async ({ page }) => {
    await blockOptimizedImages(page);
    await page.goto('/pay/raise?grade=o1e&yos=10');
    await expect(page.locator('#raise-grade')).toHaveValue('O-1E');
    const block = page.getByTestId('raise-handoff');
    await expect(block).toContainText(`your full ${YEAR} pay as an O-1E with 10 years of service:`);
    const link = page.getByTestId('raise-handoff-link');
    await expect(link).toHaveAttribute('href', '/calculators/total-compensation?rank=o1e&yos=10');
    await link.click();
    await expect(page).toHaveURL(/\/calculators\/total-compensation\?rank=o1e&yos=10$/);
    await expect(page.getByLabel('Rank / Pay Grade')).toHaveValue('O-1E');
    await expect(page.getByLabel('Years of Service')).toHaveValue('10');
  });

  test('head unchanged: title and meta description still come from the raise config', async ({ page }) => {
    // The /pay* meta guard: this build is body-only. The H1 is checked in pay-raise-page.spec.ts.
    await page.goto('/pay/raise?grade=o3&yos=8');
    await expect(page).toHaveTitle(pageTitle(PAY_RAISE_2027));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pageDescription(PAY_RAISE_2027));
  });
});
