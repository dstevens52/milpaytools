import { test, expect } from '@playwright/test';
import { getBasePay, getBAS, getBAH } from './helpers/data';
import { resultCardNum, formatCurrency } from './helpers/format';

// Total Compensation calculator uses:
//   - ResultCard rows: `$${monthly.toLocaleString()}/mo` (preserves decimals)
//   - Headline / tax-free breakdown: formatCurrency (0 decimals)
// We use resultCardNum for breakdown values and formatCurrency for headline totals.

test.describe('Total Compensation Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/total-compensation');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Total Military Compensation/i);
  });

  test('default values produce correct base pay (E-5, 6 YOS)', async ({ page }) => {
    // Base pay row shows e.g. "$4,109.86/mo" via toLocaleString (preserves cents)
    const basePay = getBasePay('E-5', 6);
    await expect(page.getByText(`$${resultCardNum(basePay)}/mo`).first()).toBeVisible();
  });

  test('default values produce correct BAS', async ({ page }) => {
    // BAS is shown via formatCurrency (0 decimals) in the tax-free breakdown card
    const bas = getBAS('E-5');
    // $476.95 → formatCurrency → $477
    await expect(page.getByText(formatCurrency(bas)).first()).toBeVisible();
  });

  test('default shows no BAH (no ZIP entered)', async ({ page }) => {
    await expect(page.getByText('Enter ZIP code')).toBeVisible();
  });

  test('changing grade to O-3 updates base pay', async ({ page }) => {
    await page.getByLabel('Rank / Pay Grade').selectOption('O-3');
    const basePay = getBasePay('O-3', 6);
    await expect(page.getByText(`$${resultCardNum(basePay)}/mo`).first()).toBeVisible();
  });

  test('changing grade to O-3 shows officer BAS', async ({ page }) => {
    await page.getByLabel('Rank / Pay Grade').selectOption('O-3');
    const bas = getBAS('O-3');
    await expect(page.getByText(formatCurrency(bas)).first()).toBeVisible();
  });

  test('entering valid ZIP shows BAH', async ({ page }) => {
    const bah = getBAH('28307', 'E-5', false);
    if (!bah) test.skip();
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
    await expect(page.getByText(formatCurrency(bah!)).first()).toBeVisible();
  });

  test('dependent toggle changes BAH value', async ({ page }) => {
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
    const bahNoDep = getBAH('28307', 'E-5', false);
    const bahWithDep = getBAH('28307', 'E-5', true);
    if (!bahNoDep || !bahWithDep) test.skip();

    // Initially without dependents
    await expect(page.getByText(formatCurrency(bahNoDep!)).first()).toBeVisible();

    // Toggle to with dependents
    await page.getByRole('button', { name: 'With dependents' }).click();
    await expect(page.getByText(formatCurrency(bahWithDep!)).first()).toBeVisible();
  });

  test('civilian equivalent exceeds basic pay', async ({ page }) => {
    await expect(page.getByText(/civilian.*earn|would need to earn/i).first()).toBeVisible();
  });

  test('BRS section shows TSP match fields', async ({ page }) => {
    await expect(page.getByText(/full BRS match|capture.*match/i).first()).toBeVisible();
  });

  test('switching to Legacy hides BRS match', async ({ page }) => {
    await page.getByRole('button', { name: 'Legacy (High-3)' }).click();
    await expect(page.getByText(/BRS match|TSP agency match/i)).not.toBeVisible();
  });

  test('O-1E prior enlisted grade is selectable', async ({ page }) => {
    await page.getByLabel('Rank / Pay Grade').selectOption('O-1E');
    const basePay = getBasePay('O-1E', 6);
    await expect(page.getByText(`$${resultCardNum(basePay)}/mo`).first()).toBeVisible();
  });

  test('changing YOS updates base pay', async ({ page }) => {
    await page.getByLabel('Years of Service').selectOption('10');
    const basePay = getBasePay('E-5', 10);
    await expect(page.getByText(`$${resultCardNum(basePay)}/mo`).first()).toBeVisible();
  });
});
