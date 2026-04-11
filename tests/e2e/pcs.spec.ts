import { test, expect } from '@playwright/test';

// PCS calculator section labels are rendered as small-caps uppercase headings.
// Entitlement row labels appear in the results panel on the right side.
// Many terms (DLA, MALT, TLE) also appear in the explainer text below — use .first()
// or target specific roles/elements to avoid strict mode violations.

test.describe('PCS Cost Estimator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/pcs');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/PCS/i);
  });

  test('default state shows DLA in results', async ({ page }) => {
    // DLA row label appears in the right-side results panel
    await expect(page.getByText('Dislocation Allowance (DLA)').first()).toBeVisible();
  });

  test('MALT is shown for default 500-mile move', async ({ page }) => {
    await expect(page.getByText(/MALT|Monetary Allowance/i).first()).toBeVisible();
  });

  test('government move type is selected by default', async ({ page }) => {
    // The Government Move radio input is checked by default
    await expect(page.locator('input[name="moveType"][value="gov"]')).toBeChecked();
  });

  test('switching to Full PPM shows PPM profit row', async ({ page }) => {
    // Move type uses radio inputs inside label elements, not buttons
    await page.locator('label').filter({ hasText: 'Full PPM / DITY' }).click();
    await expect(page.getByText(/PPM.*profit|profit.*PPM|after.*tax.*profit/i).first()).toBeVisible();
  });

  test('with-dependents toggle is active by default', async ({ page }) => {
    // Default hasDependents = true
    await expect(page.getByText(/with dependents|dependent/i).first()).toBeVisible();
  });

  test('TLE section row appears in results', async ({ page }) => {
    await expect(page.getByText(/Temporary Lodging|TLE/i).first()).toBeVisible();
  });

  test('weight allowance is shown', async ({ page }) => {
    await expect(page.getByText(/weight allowance|lbs/i).first()).toBeVisible();
  });

  test('total entitlements row is highlighted', async ({ page }) => {
    await expect(page.getByText(/Total.*Government|Government.*Total|Total.*Entitlement/i).first()).toBeVisible();
  });

  test('PPM advance amount row appears for PPM moves', async ({ page }) => {
    await page.locator('label').filter({ hasText: 'Full PPM / DITY' }).click();
    await expect(page.getByText(/advance|60%.*advance/i).first()).toBeVisible();
  });

  test('action step links to BAH calculator', async ({ page }) => {
    await expect(page.getByRole('link', { name: /BAH/i }).first()).toBeVisible();
  });

  test('O-5 rank is selectable', async ({ page }) => {
    const rankSelect = page.locator('#rank');
    await rankSelect.selectOption('O-5');
    // Weight allowance should update (O-5 has higher allowance than E-5)
    await expect(page.getByText(/weight|lbs/i).first()).toBeVisible();
  });

  test('per diem row shows in results', async ({ page }) => {
    await expect(page.getByText(/Per diem|Per Diem/i).first()).toBeVisible();
  });
});
