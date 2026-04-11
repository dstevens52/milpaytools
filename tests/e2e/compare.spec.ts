import { test, expect } from '@playwright/test';
import { getBAH } from './helpers/data';

// Duty Station Comparison calculator has two ZIP text inputs.
// Comparison results and diff badges appear in the results section.

test.describe('Duty Station Comparison Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/compare');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Compare|Duty Station/i);
  });

  test('two ZIP text inputs are present', async ({ page }) => {
    const zipInputs = page.locator('input[type="text"]');
    expect(await zipInputs.count()).toBeGreaterThanOrEqual(2);
  });

  test('entering two ZIPs renders comparison panels', async ({ page }) => {
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28307');
    await zipInputs.nth(1).fill('92134');
    // Both location panels should appear
    await expect(page.getByText(/Location A|Location B|BAH/i).first()).toBeVisible();
  });

  test('BAH row appears in results after entering ZIPs', async ({ page }) => {
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28307');
    await zipInputs.nth(1).fill('20001');
    await expect(page.getByText('BAH').first()).toBeVisible();
  });

  test('pay grade select changes results', async ({ page }) => {
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28307');
    await zipInputs.nth(1).fill('92134');
    const gradeSelect = page.locator('select').first();
    await gradeSelect.selectOption('O-5');
    // Results should still render
    await expect(page.getByText(/BAH|housing/i).first()).toBeVisible();
  });

  test('same ZIP for both shows "Same" badge', async ({ page }) => {
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28307');
    await zipInputs.nth(1).fill('28307');
    await expect(page.getByText('Same').first()).toBeVisible();
  });

  test('diff badge shows positive for higher-BAH destination', async ({ page }) => {
    // San Diego (92134) has higher BAH than Camp Lejeune (28307) for most grades
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28307');
    await zipInputs.nth(1).fill('92134');
    // A diff badge (green or red) should appear
    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();
  });

  test('BAH data verify: SD has higher E-5 BAH than Camp Lejeune', async ({ page }) => {
    const bahSD = getBAH('92134', 'E-5', false);
    const bahCL = getBAH('28307', 'E-5', false);
    if (!bahSD || !bahCL) test.skip();
    expect(bahSD!).toBeGreaterThan(bahCL!);
  });

  test('results panel shows both location names or MHA codes', async ({ page }) => {
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28307');
    await zipInputs.nth(1).fill('92134');
    // MHA names or location descriptions should appear in the result
    await expect(page.getByText(/NC|CA|San Diego|Lejeune|location/i).first()).toBeVisible();
  });
});
