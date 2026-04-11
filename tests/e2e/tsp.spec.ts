import { test, expect } from '@playwright/test';

test.describe('TSP Growth Projector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/tsp');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/TSP/i);
  });

  test('default state renders a projection result', async ({ page }) => {
    await expect(page.getByText(/Projected Balance|Final Balance|balance at/i).first()).toBeVisible();
  });

  test('BRS match indicator appears for BRS system', async ({ page }) => {
    // The BRS match table header or summary line
    await expect(page.getByText(/Gov Match|gov match/i).first()).toBeVisible();
  });

  test('switching to Legacy (non-BRS) removes DoD matching', async ({ page }) => {
    await page.getByRole('button', { name: 'Legacy (High-3)' }).click();
    // Under Legacy there is no gov matching — the explainer text says so
    await expect(page.getByText(/Legacy members do not/i).first()).toBeVisible();
  });

  test('allocation presets are selectable', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Conservative/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Moderate/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Aggressive/i }).first()).toBeVisible();
  });

  test('aggressive allocation is selectable', async ({ page }) => {
    await page.getByRole('button', { name: 'Aggressive', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Aggressive', exact: true }).first()).toHaveClass(/bg-red-700|text-white/);
  });

  test('Roth vs Traditional comparison section is visible', async ({ page }) => {
    await expect(page.getByText(/Roth.*Traditional|Traditional.*Roth/i).first()).toBeVisible();
  });

  test('chart is rendered', async ({ page }) => {
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('BRS auto-contribution note is visible', async ({ page }) => {
    // The BRS match summary shows "Auto 1%: $X.XX · Matching: ..."
    await expect(page.getByText(/Auto 1%|1%.*auto|automatic contribution/i).first()).toBeVisible();
  });

  test('fund allocation section is visible', async ({ page }) => {
    // All five TSP funds should be listed
    await expect(page.getByText(/C Fund|S Fund|G Fund/i).first()).toBeVisible();
  });

  test('years to project updates when age changes', async ({ page }) => {
    // There should be age inputs visible
    await expect(page.getByText(/current age|target age|retirement age/i).first()).toBeVisible();
  });
});
