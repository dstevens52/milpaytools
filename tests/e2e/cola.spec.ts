import { test, expect } from '@playwright/test';

// CONUS COLA Calculator uses a single ZIP input with id="zip".
// The empty state message and result rows appear inside the calculator panel.
// The page also has explainer content below — use specific text matches.

test.describe('CONUS COLA Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/cola');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/COLA|Cost of Living/i);
  });

  test('empty state message is shown before ZIP entry', async ({ page }) => {
    // The specific empty-state message in the result panel
    await expect(page.getByText('Enter a 5-digit duty station ZIP code to check CO')).toBeVisible();
  });

  test('valid ZIP for a COLA-eligible location returns a result', async ({ page }) => {
    // 93446 (Paso Robles, CA area) has a CONUS COLA rate
    await page.locator('#zip').fill('93446');
    // Should show a monthly COLA dollar amount
    await expect(page.getByText(/\$\d+.*\/mo|monthly.*COLA|COLA.*monthly/i).first()).toBeVisible();
  });

  test('non-COLA ZIP shows not-eligible message', async ({ page }) => {
    // Chicago area ZIP — no CONUS COLA
    await page.locator('#zip').fill('60601');
    // Component renders "ZIP XXXXX is not a CONUS COLA area"
    await expect(page.getByText(/not a CONUS COLA area|not eligible|no COLA/i).first()).toBeVisible();
  });

  test('pay grade select is present', async ({ page }) => {
    // The pay grade select should be visible
    const gradeSelect = page.locator('select').first();
    await expect(gradeSelect).toBeVisible();
  });

  test('dependency status toggle is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /With|Without|dependent/i }).first()).toBeVisible();
  });

  test('CONUS COLA heading or label is present on the page', async ({ page }) => {
    await expect(page.getByText('CONUS COLA Lookup')).toBeVisible();
  });

  test('2026 rates label appears on the page', async ({ page }) => {
    await expect(page.getByText(/2026/i).first()).toBeVisible();
  });

  test('location tier badge appears for COLA-eligible ZIP', async ({ page }) => {
    await page.locator('#zip').fill('93446');
    // Should show a tier badge (high, moderate-high, or moderate)
    await expect(page.getByText(/high|moderate/i).first()).toBeVisible();
  });
});
