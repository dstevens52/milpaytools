import { test, expect } from '@playwright/test';

// Deployment Pay Calculator has a default ZIP (28310 — Fort Liberty, NC)
// and defaults to: E-6 / 10 YOS / combat zone / HFP on / FSA on / 9 months.
// Results always show since the ZIP is pre-filled. PhaseCard titles are
// uppercase-tracking-widest text rendered inside card headers.

test.describe('Deployment Pay Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/deployment');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Deployment/i);
  });

  test('default state shows three-phase comparison', async ({ page }) => {
    // PhaseCard titles are shown as uppercase text in card headers
    await expect(page.getByText('Before Deployment').first()).toBeVisible();
    await expect(page.getByText('During Deployment').first()).toBeVisible();
  });

  test('base pay row is shown in the Before Deployment card', async ({ page }) => {
    await expect(page.getByText('Base pay').first()).toBeVisible();
  });

  test('combat zone CZTE label appears during deployment', async ({ page }) => {
    // When combat zone is enabled (default), base pay row shows "Tax-free (CZTE)"
    await expect(page.getByText('Tax-free (CZTE)').first()).toBeVisible();
  });

  test('HFP / IDP row is shown when enabled', async ({ page }) => {
    // HFP is on by default
    await expect(page.getByText('HFP / IDP').first()).toBeVisible();
  });

  test('Family Separation row is shown when enabled', async ({ page }) => {
    // FSA is on by default
    await expect(page.getByText('Family Separation').first()).toBeVisible();
  });

  test('tour total card is shown', async ({ page }) => {
    // The third PhaseCard title includes the deployment duration
    await expect(page.getByText(/Month Tour Total|-Month Tour/i).first()).toBeVisible();
  });

  test('CZTE tax savings row appears in results', async ({ page }) => {
    await expect(page.getByText('CZTE tax savings').first()).toBeVisible();
  });

  test('SDP section heading is visible', async ({ page }) => {
    await expect(page.getByText(/Savings Deposit Program|SDP.*10%/i).first()).toBeVisible();
  });

  test('TSP contribution section is visible', async ({ page }) => {
    await expect(page.getByText('TSP contribution').first()).toBeVisible();
  });

  test('changing grade to O-3 updates the calculator', async ({ page }) => {
    const gradeSelect = page.locator('#pay-grade');
    await gradeSelect.selectOption('O-3');
    // PhaseCard structure should still render
    await expect(page.getByText('Before Deployment').first()).toBeVisible();
  });

  test('Roth TSP action step appears for combat zone', async ({ page }) => {
    // Default is combat zone = true, so the Roth TSP action step should show
    await expect(page.getByText(/Roth TSP|Maximize.*TSP|combat.*TSP/i).first()).toBeVisible();
  });
});
