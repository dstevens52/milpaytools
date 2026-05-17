import { test, expect } from '@playwright/test';
import { getBAH } from './helpers/data';
import { formatCurrency } from './helpers/format';

const FORT_BRAGG = '/bah/fort-bragg?rank=E-5&dep=yes';
const FORT_HOOD = '/bah/fort-hood';

test.describe('BAH Station Page — Fort Bragg (upgraded, rich data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORT_BRAGG);
  });

  test('3-step plan renders on page', async ({ page }) => {
    await expect(page.getByText('Check your rate')).toBeVisible();
    await expect(page.getByText('See what it buys')).toBeVisible();
    await expect(page.getByText('Plan your move')).toBeVisible();
  });

  test('money strip renders with BAH, median rent, and surplus cards', async ({ page }) => {
    const e5Rate = getBAH('28301', 'E-5', true);
    if (!e5Rate) return test.skip();
    // BAH card shows the rate value
    await expect(page.getByText(formatCurrency(e5Rate), { exact: false }).first()).toBeVisible();
    // Rent and surplus labels (use .first() since similar text may appear in other sections)
    await expect(page.getByText('Median rent').first()).toBeVisible();
    await expect(page.getByText('Monthly surplus').first()).toBeVisible();
  });

  test('"What Your BAH Buys Here" section heading exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'What Your BAH Buys Here' })).toBeVisible();
  });

  test('mortgage comparison renders inside housing section', async ({ page }) => {
    await expect(page.getByText('Median home price')).toBeVisible();
    await expect(page.getByText(/Est\. monthly mortgage/i)).toBeVisible();
  });

  test('no duplicate rent/surplus in housing section — appears only once', async ({ page }) => {
    // MoneyStrip has exactly "Monthly surplus"; old repeated cards had "Monthly surplus vs. median rent"
    // exact:true ensures we only count exact matches, confirming no duplication
    await expect(page.getByText('Monthly surplus', { exact: true })).toHaveCount(1);
  });

  test('Key Insights section is NOT present on upgraded page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Key Insights for Fort Bragg/i }),
    ).not.toBeAttached();
  });

  test('primary CTA is a prominent link — "Compare Fort Bragg to another duty station"', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /Compare Fort Bragg to another duty station/i }),
    ).toBeVisible();
  });

  test('secondary CTAs exist below primary', async ({ page }) => {
    await expect(page.getByRole('link', { name: /total military compensation/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /PCS move costs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /long-term wealth/i })).toBeVisible();
  });

  test('installation detail line (82nd Airborne / USASOC) renders below subtitle', async ({ page }) => {
    await expect(page.getByText(/82nd Airborne/i)).toBeVisible();
  });

  test('rank selector updates money strip BAH value when grade changes to E-7', async ({ page }) => {
    const e7Rate = getBAH('28301', 'E-7', true);
    if (!e7Rate) return test.skip();
    await page.getByRole('combobox').selectOption('E-7');
    // The money strip BAH card is the first visible occurrence of the rate
    await expect(page.getByText(formatCurrency(e7Rate), { exact: false }).first()).toBeVisible();
  });
});

test.describe('BAH Station Page — Fort Hood (upgraded, rich data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORT_HOOD);
  });

  test('Key Insights section is NOT present on upgraded page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Key Insights for Fort Hood/i }),
    ).not.toBeAttached();
  });

  test('3-step plan is present', async ({ page }) => {
    await expect(page.getByText('Check your rate')).toBeVisible();
  });
});
