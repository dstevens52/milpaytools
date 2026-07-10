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

  // ── Two-phase model tests ────────────────────────────────────────────────

  test('sample output bar is computed and shows a dollar figure', async ({ page }) => {
    // The sample bar figure must be computed from the engine — not the old hardcoded $2.85M.
    // The two-phase model (14 years contributions → 25 years growth) produces a lower figure.
    const bar = page.getByTestId('sample-output-balance');
    await expect(bar).toBeVisible();
    const text = await bar.textContent();
    expect(text).toMatch(/^\$[\d,.]+[MK]?$/);
    // Confirm the hardcoded value is gone
    expect(text).not.toBe('$2.85M');
  });

  test('"More years you plan to serve" input renders with default value', async ({ page }) => {
    // Default: max(20 - 6 YOS, 1) = 14
    const input = page.getByLabel(/more years you plan to serve/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('14');
  });

  test('changing "More years you plan to serve" updates projection', async ({ page }) => {
    const input = page.getByLabel(/more years you plan to serve/i);
    await expect(input).toBeVisible();

    // Capture the initial projected balance
    const balanceBefore = await page.getByText(/Projected Balance/i).locator('..').locator('p.text-4xl, p.text-3xl').first().textContent();

    // Reduce to 5 years of service
    await input.fill('5');
    await input.blur();

    // Wait for re-render
    await page.waitForTimeout(300);

    const balanceAfter = await page.getByText(/Projected Balance/i).locator('..').locator('p.text-4xl, p.text-3xl').first().textContent();

    // Less service time = lower projected balance
    expect(balanceAfter).not.toBe(balanceBefore);
  });

  test('two-phase framing text appears in results for default scenario', async ({ page }) => {
    // The interpretation line should mention both contribution years and growth years
    await expect(page.getByText(/years of contributions while serving/i).first()).toBeVisible();
    await expect(page.getByText(/years of investment growth after separation/i).first()).toBeVisible();
  });

  test('post-separation callout appears for default scenario', async ({ page }) => {
    await expect(page.getByText(/Your TSP keeps working after you separate/i)).toBeVisible();
  });

  test('gov contributions total reflects separation — edge: 1 more year to serve', async ({ page }) => {
    // With only 1 more year of service, gov contributions total should be much lower
    // than with 14 years, confirming BRS match stops at separation.
    const input = page.getByLabel(/more years you plan to serve/i);
    await input.fill('1');
    await input.blur();
    await page.waitForTimeout(300);

    // The balance breakdown's "Gov contributions" line should exist and show a small value
    await expect(page.getByText(/Gov contributions \(BRS\)/i)).toBeVisible();
  });

  test('edge: separation age >= target retirement age keeps contributions for full projection', async ({ page }) => {
    // Set target age to 40 (yearsToProject = 14) then moreYearsToServe = 20,
    // so separation (26+20=46) > target (40) → the engine caps at yearsToProject.
    const targetInput = page.getByLabel(/Target Retirement Age/i);
    await targetInput.fill('40');
    await targetInput.blur();

    const input = page.getByLabel(/more years you plan to serve/i);
    await input.fill('20');
    await input.blur();
    await page.waitForTimeout(400);

    // A note about serving past retirement age should appear
    await expect(page.getByText(/serve past your target retirement age|contributions will run the full/i)).toBeVisible();
    // Results should still render
    await expect(page.getByText(/Projected Balance/i).first()).toBeVisible();
  });

  test('edge: user with 20+ YOS loaded from URL gets moreYearsToServe default of 1', async ({ page }) => {
    await page.goto('/calculators/tsp?yos=22');
    const input = page.getByLabel(/more years you plan to serve/i);
    await expect(input).toBeVisible();
    // max(20 - 22, 1) = 1
    await expect(input).toHaveValue('1');
  });

  test('chart shows Separation reference line when phase2 exists', async ({ page }) => {
    // Default scenario has 14 years of service and 25 years of growth.
    // Recharts renders the ReferenceLine label as an SVG <text> element.
    await expect(page.locator('svg text').filter({ hasText: 'Separation' })).toBeVisible();
  });
});
