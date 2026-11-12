import { test, expect, type Page } from '@playwright/test';
import { calculateDeployment, type DeploymentInput } from '@/lib/calculations/deployment';
import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';

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

// ─── DEP-01: FSA requires dependents (37 U.S.C. § 427(a)(1)) ──────────────────

// UI defaults (E-6 / 10 YOS / 9 months / combat zone / IDP / HDP $100 / TSP 10% / SDP $10,000).
// BAH does not enter the tour total, so monthlyBAH is 0 here.
function uiDefaults(overrides: Partial<DeploymentInput> = {}): DeploymentInput {
  return {
    payGrade: 'E-6',
    yearsOfService: 10,
    hasDependents: true,
    zipCode: '28310',
    monthlyBAH: 0,
    bahFound: true,
    deploymentMonths: 9,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 100,
    hasFSA: true,
    tspContributionPct: 10,
    usingSDP: true,
    sdpDeposit: DEPLOYMENT_RATES_2026.sdpMaxDeposit,
    ...overrides,
  };
}

// Mirrors DeploymentCalculator's fmt()
function usd0(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

test.describe('Deployment — FSA requires dependents (lib)', () => {
  test('hasDependents:false, hasFSA:true → FSA $0 and excluded from the tour', () => {
    const r = calculateDeployment(uiDefaults({ payGrade: 'E-4', yearsOfService: 3, hasDependents: false, hasFSA: true }));
    expect(r.during.monthlyFSA).toBe(0);
    expect(r.tour.totalAdditionalAllowancePay).toBe(
      (DEPLOYMENT_RATES_2026.idp + 100) * 9,
    );
  });

  test('hasDependents:true, hasFSA:true → FSA still paid (regression)', () => {
    const r = calculateDeployment(uiDefaults({ hasDependents: true, hasFSA: true }));
    expect(r.during.monthlyFSA).toBe(DEPLOYMENT_RATES_2026.fsa);
    expect(r.tour.totalAdditionalAllowancePay).toBe(
      (DEPLOYMENT_RATES_2026.idp + 100 + DEPLOYMENT_RATES_2026.fsa) * 9,
    );
  });
});

test.describe('Deployment — FSA requires dependents (UI)', () => {
  const fsaYes = (page: Page) => page.getByRole('button', { name: `Yes — ${usd0(DEPLOYMENT_RATES_2026.fsa)}/mo` });
  const fsaNo = (page: Page) => fsaYes(page).locator('..').getByRole('button', { name: 'No' });
  const tourTotal = (page: Page) =>
    page.getByText('Total deployment financial benefit').locator('xpath=following-sibling::p[1]');

  test('dependents = No disables FSA, turns it off, and the tour total excludes it', async ({ page }) => {
    await page.goto('/calculators/deployment');
    await expect(page.getByText('Family Separation', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Without', exact: true }).click();

    await expect(fsaYes(page)).toBeDisabled();
    await expect(fsaNo(page)).toBeDisabled();
    await expect(fsaNo(page)).toHaveClass(/bg-red-700/);
    await expect(page.getByTestId('fsa-requires-dependents')).toHaveText('FSA requires dependents.');
    await expect(page.getByText('Family Separation', { exact: true })).toHaveCount(0);

    const expected = calculateDeployment(uiDefaults({ hasDependents: false, hasFSA: true }));
    await expect(tourTotal(page)).toHaveText(usd0(expected.tour.totalTourBenefit));
  });

  test('switching dependents back to Yes restores FSA to its default (on)', async ({ page }) => {
    await page.goto('/calculators/deployment');
    await page.getByRole('button', { name: 'Without', exact: true }).click();
    await expect(page.getByText('Family Separation', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'With deps', exact: true }).click();
    await expect(fsaYes(page)).toBeEnabled();
    await expect(fsaYes(page)).toHaveClass(/bg-red-700/);
    await expect(page.getByTestId('fsa-requires-dependents')).toHaveCount(0);

    const expected = calculateDeployment(uiDefaults({ hasDependents: true, hasFSA: true }));
    await expect(tourTotal(page)).toHaveText(usd0(expected.tour.totalTourBenefit));
  });

  test('share link with dependents=no loads with FSA $0', async ({ page }) => {
    await page.goto('/calculators/deployment?dependents=no');
    await expect(fsaYes(page)).toBeDisabled();
    await expect(page.getByText('Family Separation', { exact: true })).toHaveCount(0);

    const expected = calculateDeployment(uiDefaults({ hasDependents: false, hasFSA: true }));
    await expect(tourTotal(page)).toHaveText(usd0(expected.tour.totalTourBenefit));
  });

  test('dependents = Yes with FSA on still includes FSA (regression)', async ({ page }) => {
    await page.goto('/calculators/deployment?dependents=yes');
    const row = page.getByText('Family Separation', { exact: true }).locator('xpath=../..');
    await expect(row).toContainText(`+${usd0(DEPLOYMENT_RATES_2026.fsa)}`);

    const expected = calculateDeployment(uiDefaults({ hasDependents: true, hasFSA: true }));
    await expect(tourTotal(page)).toHaveText(usd0(expected.tour.totalTourBenefit));
  });
});
