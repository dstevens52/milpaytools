import { test, expect, type Page } from '@playwright/test';
import { PAY_RAISE_2027 } from '@/data/pay-raise/2027';
import { pageTitle, pageDescription } from '@/lib/calculations/payRaise';
import { combinedPayBahYear } from '@/lib/combinedPayYear';

// P1: the /pay/raise result → Military Pay Calculator handoff.
// Every test uses a non-default grade AND years (/pay/raise defaults to E-5,
// 6 years), so a dropped ?rank= or ?yos= fails instead of passing by accident.

const YEAR = combinedPayBahYear();

/**
 * After a click-through, let the calculator page's own requests finish before the test (and
 * its browser context) ends. The page's desktop hero is a /_next/image WebP (DesktopHeroImage).
 * In the first PR #98 CI run (Firefox shard 2), these click-throughs ended about 0.9 s after
 * landing, and from then on every full load of /calculators/total-compensation at desktop width
 * on that shard's `next start` server never reached "load". A 375 px load (data: URI, no image
 * request) and `commit`-only loads still passed. The click is a client-side navigation, so the
 * window "load" event has already fired; wait for every image in the document to finish instead,
 * so no context closes with that image request in flight.
 */
async function settleLandedPage(page: Page) {
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete));
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
    await page.goto('/pay/raise?grade=o3&yos=8');
    const link = page.getByTestId('raise-handoff-link');
    await expect(link).toHaveAttribute('href', '/calculators/total-compensation?rank=o3&yos=8');
    await link.click();
    await expect(page).toHaveURL(/\/calculators\/total-compensation\?rank=o3&yos=8$/);
    await expect(page.getByLabel('Rank / Pay Grade')).toHaveValue('O-3');
    await expect(page.getByLabel('Years of Service')).toHaveValue('8');
    await settleLandedPage(page);
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
    await settleLandedPage(page);
  });

  test('head unchanged: title and meta description still come from the raise config', async ({ page }) => {
    // The /pay* meta guard: this build is body-only. The H1 is checked in pay-raise-page.spec.ts.
    await page.goto('/pay/raise?grade=o3&yos=8');
    await expect(page).toHaveTitle(pageTitle(PAY_RAISE_2027));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', pageDescription(PAY_RAISE_2027));
  });
});
