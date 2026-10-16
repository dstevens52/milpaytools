import { test, expect } from '@playwright/test';

// Deployment Pay Calculator has a default ZIP (28310 — Fort Bragg, NC)
// and defaults to: E-6 / 10 YOS / combat zone / IDP on / FSA on / HDP $100 / 9 months.
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

  test('Imminent Danger Pay row shows the full monthly $275 when enabled', async ({ page }) => {
    // IDP is on by default; rates effective Oct 1, 2026
    const row = page.getByText('Imminent Danger Pay', { exact: true }).locator('xpath=../..');
    await expect(row).toContainText('+$275');
  });

  test('turning IDP off removes the row; HFP is never added alongside it', async ({ page }) => {
    await expect(page.getByText('Imminent Danger Pay', { exact: true })).toBeVisible();
    // Only one special pay is ever modeled — no separate Hostile Fire Pay row
    await expect(page.getByText(/^(HFP|Hostile Fire Pay)( \/ IDP)?$/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Yes — $275/mo' }).locator('..').getByRole('button', { name: 'No' }).click();
    await expect(page.getByText('Imminent Danger Pay', { exact: true })).toHaveCount(0);
  });

  test('HDP-L tiers are None / $50 / $100 — no $150 tier', async ({ page }) => {
    await expect(page.locator('#hdp option')).toHaveText(['None', '$50/month', '$100/month']);
  });

  test('HDP-L $100 is paid in full alongside IDP (no cap)', async ({ page }) => {
    await page.locator('#hdp').selectOption('100');
    const row = page.locator('p', { hasText: /^Hardship Duty Pay$/ }).locator('xpath=../..');
    await expect(row).toContainText('+$100');
    await expect(row).not.toContainText('Capped');
  });

  test('no superseded HFP/IDP rate appears on the page', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\$225(?![\d,])/);
    expect(body).not.toContain('$7.50');
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
