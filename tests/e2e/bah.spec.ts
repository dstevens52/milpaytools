import { test, expect } from '@playwright/test';
import { getBAH, getLocationName } from './helpers/data';
import { bahAmount } from './helpers/format';

// BAH calculator renders the primary rate as "$X,XXX/mo" and also repeats the amount
// in the rate table and the action step text — use .first() to target the headline.

test.describe('BAH Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/bah');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/BAH/i);
  });

  test('empty state shows prompt to enter ZIP', async ({ page }) => {
    await expect(page.getByText('Enter a ZIP code to see BAH rates')).toBeVisible();
  });

  test('valid ZIP returns correct E-5 rate without dependents', async ({ page }) => {
    const rate = getBAH('28307', 'E-5', false);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('28307', { delay: 50 });
    // Primary rate is in a <p class="text-4xl"> element
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  test('valid ZIP returns correct E-5 rate with dependents', async ({ page }) => {
    const rate = getBAH('28307', 'E-5', true);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('28307', { delay: 50 });
    await page.getByRole('button', { name: 'With Dependents' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  test('location name appears after valid ZIP', async ({ page }) => {
    const name = getLocationName('28307');
    if (!name) test.skip();
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('28307', { delay: 50 });
    // Location name appears in the sub-text under the rate
    await expect(page.getByText(name!, { exact: false }).first()).toBeVisible();
  });

  test('with-dependents rate is higher than without for E-5', async ({ page }) => {
    const rateNoDep = getBAH('28307', 'E-5', false);
    const rateWithDep = getBAH('28307', 'E-5', true);
    if (!rateNoDep || !rateWithDep) test.skip();
    expect(rateWithDep!).toBeGreaterThan(rateNoDep!);
  });

  test('O-6 rate exceeds E-5 rate at same location', async ({ page }) => {
    const e5Rate = getBAH('92134', 'E-5', false);
    const o6Rate = getBAH('92134', 'O-6', false);
    if (!e5Rate || !o6Rate) test.skip();
    expect(o6Rate!).toBeGreaterThan(e5Rate!);
  });

  test('switching grade to O-5 updates displayed rate', async ({ page }) => {
    const rate = getBAH('20001', 'O-5', false);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('20001', { delay: 50 });
    await page.getByLabel('Pay Grade').selectOption('O-5');
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  test('grade rate table appears after valid ZIP', async ({ page }) => {
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('28307', { delay: 50 });
    await expect(page.getByText('All rates at this location')).toBeVisible();
  });

  test('invalid ZIP shows error message', async ({ page }) => {
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('00000', { delay: 50 });
    await expect(page.getByText('ZIP code not found in BAH dataset').first()).toBeVisible();
  });

  test('Compare mode shows two ZIP inputs', async ({ page }) => {
    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByLabel('Current / Origin')).toBeVisible();
    await expect(page.getByLabel('Gaining / Destination')).toBeVisible();
  });

  test('Compare mode shows difference callout', async ({ page }) => {
    await page.getByRole('button', { name: 'Compare' }).click();
    await page.getByLabel('Current / Origin').fill('28307');
    await page.getByLabel('Gaining / Destination').fill('20001');
    await expect(page.getByText('Monthly BAH difference').first()).toBeVisible();
  });

  test('W-4 warrant officer rate is selectable and shows data', async ({ page }) => {
    const rate = getBAH('28307', 'W-4', false);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('28307', { delay: 50 });
    await page.getByLabel('Pay Grade').selectOption('W-4');
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  // ── Station page cross-links ────────────────────────────────────────────────

  test('ZIP in a base MHA shows station housing guide link', async ({ page }) => {
    // 28310 is a Fort Bragg area ZIP → NC182 MHA → Fort Bragg station page
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('28310', { delay: 50 });
    await expect(page.getByRole('link', { name: /Fort Bragg.*housing guide/i })).toBeVisible();
  });

  test('ZIP with no station page shows no housing guide link', async ({ page }) => {
    // 66062 is Olathe, KS — residential area with no military base page
    await page.getByLabel('Duty Station ZIP Code').pressSequentially('66062', { delay: 50 });
    await expect(page.getByRole('link', { name: /housing guide/i })).not.toBeVisible();
  });

  test('compare mode shows station guide links for both locations', async ({ page }) => {
    await page.getByRole('button', { name: 'Compare' }).click();
    await page.getByLabel('Current / Origin').pressSequentially('28310', { delay: 50 });
    await page.getByLabel('Gaining / Destination').pressSequentially('92134', { delay: 50 });
    // Fort Bragg (28310 → NC182) and NAS San Diego (92134) both have station pages
    // 92134 maps to the San Diego MHA which has multiple stations — use .first() to avoid strict mode
    await expect(page.getByRole('link', { name: /Fort Bragg.*housing guide/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Naval Station San Diego.*housing guide/i }).first()).toBeVisible();
  });
});
