import { test, expect } from '@playwright/test';
import { getBasePay, getBasePayAtColumn } from './helpers/data';
import { payChartsAmount } from './helpers/format';

// PayChartsClient renders pay amounts in the quick-lookup result card AND in every
// table cell. When a grade/YOS is selected the same amount appears in both the
// result card and the highlighted table cell — use .first() to target the result card.

test.describe('Pay Charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/pay-charts');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Pay Chart/i);
  });

  test('quick lookup default (E-5 / 6 YOS) shows correct pay', async ({ page }) => {
    const pay = getBasePay('E-5', 6);
    // Result card shows the amount in a text-3xl span
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });

  test('changing grade to O-3 in quick lookup updates pay', async ({ page }) => {
    await page.locator('select').first().selectOption('O-3');
    const pay = getBasePay('O-3', 6);
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });

  test('changing YOS to 20 updates pay for E-7', async ({ page }) => {
    await page.locator('select').first().selectOption('E-7');
    await page.locator('select').nth(1).selectOption('20');
    const pay = getBasePayAtColumn('E-7', 20);
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });

  test('enlisted table is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Enlisted Pay Chart/i })).toBeVisible();
  });

  test('warrant officer table is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Warrant Officer Pay Chart/i })).toBeVisible();
  });

  test('officer table is visible', async ({ page }) => {
    // Use exact title to avoid matching "Warrant Officer Pay Chart" which also contains "Officer Pay Chart"
    await expect(page.getByRole('heading', { name: 'Officer Pay Chart — O-1 through O-10' })).toBeVisible();
  });

  test('E-5 row is highlighted in enlisted table', async ({ page }) => {
    await expect(page.getByRole('cell', { name: /^E-5$/ }).first()).toBeVisible();
  });

  test('annual toggle changes displayed values', async ({ page }) => {
    const monthlyPay = getBasePay('E-5', 6);
    const annualPay = monthlyPay * 12;

    await page.getByRole('button', { name: 'Annual' }).click();
    // Annual toggle updates table cells; the quick-lookup span always shows monthly pay
    await expect(page.getByRole('cell', { name: payChartsAmount(annualPay) }).first()).toBeVisible();
  });

  test('monthly toggle restores monthly values', async ({ page }) => {
    const pay = getBasePay('E-5', 6);
    await page.getByRole('button', { name: 'Annual' }).click();
    await page.getByRole('button', { name: 'Monthly' }).click();
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });

  test('N/A cells render dash for inapplicable entries', async ({ page }) => {
    await expect(page.getByRole('cell', { name: '—' }).first()).toBeVisible();
  });

  test('O-1E prior enlisted grade appears in officer table', async ({ page }) => {
    // O-1E appears in the officer table's sticky grade column
    await expect(page.getByRole('cell', { name: /O-1E/ }).first()).toBeVisible();
  });

  test('W-4 at 20 YOS shows correct pay', async ({ page }) => {
    await page.locator('select').first().selectOption('W-4');
    await page.locator('select').nth(1).selectOption('20');
    const pay = getBasePay('W-4', 20);
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });

  test('cross-link to Total Compensation calculator exists', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Total Compensation/i }).first()).toBeVisible();
  });
});
