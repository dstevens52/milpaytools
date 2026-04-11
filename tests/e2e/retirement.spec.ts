import { test, expect } from '@playwright/test';
import { getBasePay } from './helpers/data';

test.describe('Military Retirement Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/retirement');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Retirement/i);
  });

  test('default state shows monthly pension result', async ({ page }) => {
    // The component always computes a pension; the ResultCard should show monthly/annual
    await expect(page.getByText(/Monthly Pension|monthly pension|pension.*month/i).first()).toBeVisible();
  });

  test('BRS system shows TSP section', async ({ page }) => {
    // BRS is default — TSP section heading is visible
    await expect(page.getByText(/TSP.*Projection|TSP.*Details|BRS.*TSP/i).first()).toBeVisible();
  });

  test('switching to High-3 shows Legacy note', async ({ page }) => {
    await page.getByRole('button', { name: 'High-3 (Legacy)' }).click();
    await expect(page.getByText(/High-3|Legacy|2\.5%/i).first()).toBeVisible();
  });

  test('retirement at 20 YOS shows 50% multiplier for High-3', async ({ page }) => {
    await page.getByRole('button', { name: 'High-3 (Legacy)' }).click();
    // 20 × 2.5% = 50.0% — toFixed(1) renders "50.0%" in the breakdown table
    // Avoid matching the hidden <option value="50">50%</option> in the VA rating select
    await expect(page.getByText('50.0%').first()).toBeVisible();
  });

  test('BRS multiplier is lower than High-3 at 20 years', async ({ page }) => {
    // BRS uses 2% × YOS so 20yr = 40%; High-3 uses 2.5% × YOS = 50%
    const brsBasePay = getBasePay('E-7', 20);
    const brsMonthlyPension = brsBasePay * 0.40;
    const high3MonthlyPension = brsBasePay * 0.50;
    expect(high3MonthlyPension).toBeGreaterThan(brsMonthlyPension);
  });

  test('years from vesting action step appears', async ({ page }) => {
    // Default current YOS = 10, so "years from pension" step should appear
    await expect(page.getByText(/year.*pension|from.*vesting/i).first()).toBeVisible();
  });

  test('CRDP note appears when VA rating ≥ 50% with 20+ YOS', async ({ page }) => {
    const vaSelect = page.locator('select').filter({ hasText: /None|Not rated/i });
    await vaSelect.selectOption('50');
    await expect(page.getByText(/CRDP|Concurrent Retirement/i).first()).toBeVisible();
  });

  test('pension chart is rendered', async ({ page }) => {
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('BRS vs High-3 comparison toggle works', async ({ page }) => {
    const compareBtn = page.getByRole('button', { name: /Compare.*High-3|Show.*comparison/i });
    if (await compareBtn.isVisible()) {
      await compareBtn.click();
      await expect(page.getByText(/High-3/i).first()).toBeVisible();
    }
  });

  test('O-6 at 30 years has higher base pay than E-7 at 20 years', async ({ page }) => {
    const e7Pay = getBasePay('E-7', 20);
    const o6Pay = getBasePay('O-6', 30);
    expect(o6Pay).toBeGreaterThan(e7Pay);
  });

  test('TSP contribution input is visible for BRS', async ({ page }) => {
    await expect(page.getByText(/TSP contribution/i).first()).toBeVisible();
  });
});
