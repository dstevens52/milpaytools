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
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
    // Primary rate is in a <p class="text-4xl"> element
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  test('valid ZIP returns correct E-5 rate with dependents', async ({ page }) => {
    const rate = getBAH('28307', 'E-5', true);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
    await page.getByRole('button', { name: 'With Dependents' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  test('location name appears after valid ZIP', async ({ page }) => {
    const name = getLocationName('28307');
    if (!name) test.skip();
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
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
    await page.getByLabel('Duty Station ZIP Code').fill('20001');
    await page.getByLabel('Pay Grade').selectOption('O-5');
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });

  test('grade rate table appears after valid ZIP', async ({ page }) => {
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
    await expect(page.getByText('All rates at this location')).toBeVisible();
  });

  test('invalid ZIP shows error message', async ({ page }) => {
    await page.getByLabel('Duty Station ZIP Code').fill('00000');
    await expect(page.getByText('ZIP code not found in BAH dataset').first()).toBeVisible();
  });

  test('Compare mode shows two ZIP inputs', async ({ page }) => {
    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByLabel('Current / Origin ZIP')).toBeVisible();
    await expect(page.getByLabel('Gaining / Destination ZIP')).toBeVisible();
  });

  test('Compare mode shows difference callout', async ({ page }) => {
    await page.getByRole('button', { name: 'Compare' }).click();
    await page.getByLabel('Current / Origin ZIP').fill('28307');
    await page.getByLabel('Gaining / Destination ZIP').fill('20001');
    await expect(page.getByText('Monthly BAH difference')).toBeVisible();
  });

  test('W-4 warrant officer rate is selectable and shows data', async ({ page }) => {
    const rate = getBAH('28307', 'W-4', false);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station ZIP Code').fill('28307');
    await page.getByLabel('Pay Grade').selectOption('W-4');
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });
});
