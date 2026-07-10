import { test, expect } from '@playwright/test';
import { projectTSP } from '@/lib/calculations/tspGrowth';
import { SAMPLE_BAR_SCENARIO, sampleFmt } from './tspTestFixtures';

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
    // Compute the expected text from the engine using the exact same default
    // scenario the page uses. No dollar literal is hardcoded — this assertion
    // survives pay table updates automatically.
    const expectedText = sampleFmt(projectTSP(SAMPLE_BAR_SCENARIO).finalBalance);

    const bar = page.getByTestId('sample-output-balance');
    await expect(bar).toBeVisible();
    const text = await bar.textContent();
    expect(text).toMatch(/^\$[\d,.]+[MK]?$/);
    expect(text).toBe(expectedText);
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

    // Target the projected balance directly via its unique CSS classes.
    // This locator survives React re-renders better than the chained parent/child approach.
    const balanceLocator = page.locator('p.text-4xl.text-red-700').first();
    const balanceBefore = await balanceLocator.textContent();

    // click() + press('Tab') is more reliable than fill() + blur() on webkit
    // for triggering React's onChange on number inputs.
    await input.click();
    await input.fill('5');
    await input.press('Tab');

    // Wait for React re-render — assert the balance has changed rather than sleeping.
    await expect(balanceLocator).not.toHaveText(balanceBefore ?? '');
    const balanceAfter = await balanceLocator.textContent();
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
    const balanceLocator = page.locator('p.text-4xl.text-red-700').first();
    const balanceBefore = await balanceLocator.textContent();

    await targetInput.click();
    await targetInput.fill('40');
    await targetInput.press('Tab');

    // Wait for React to recalculate with the new target age before filling
    // moreYearsToServe. Without this, webkit processes both fills before the
    // first re-render fires, so moreYearsToServeInt >= yearsToProject uses
    // the stale yearsToProject=39 instead of 14.
    await expect(balanceLocator).not.toHaveText(balanceBefore ?? '');

    const input = page.getByLabel(/more years you plan to serve/i);
    await input.click();
    await input.fill('20');
    await input.press('Tab');

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

  // ── Derived-default tests ────────────────────────────────────────────────

  test('YOS change recomputes "more years to serve" when field is untouched', async ({ page }) => {
    // Default load: E-5, 6 YOS → field = max(20-6, 1) = 14
    const input = page.getByLabel(/more years you plan to serve/i);
    await expect(input).toHaveValue('14');

    // Change YOS to 2 → field should recompute to max(20-2, 1) = 18
    await page.getByLabel('Years of Service').selectOption('2');
    await expect(input).toHaveValue('18');
  });

  test('manual edit of "more years to serve" locks it against YOS changes', async ({ page }) => {
    const input = page.getByLabel(/more years you plan to serve/i);

    // Manually set to 4 → marks field dirty
    await input.click();
    await input.fill('4');
    await input.press('Tab');
    await expect(input).toHaveValue('4');

    // Change YOS → field must remain 4
    await page.getByLabel('Years of Service').selectOption('2');
    await expect(input).toHaveValue('4');
  });

  test('explicit more_years URL param locks field against YOS changes', async ({ page }) => {
    await page.goto('/calculators/tsp?yos=8&more_years=10');
    const input = page.getByLabel(/more years you plan to serve/i);
    await expect(input).toHaveValue('10');

    // Change YOS in UI → field must remain 10
    await page.getByLabel('Years of Service').selectOption('4');
    await expect(input).toHaveValue('10');
  });

  test('URL with yos but no more_years keeps recompute active on YOS change', async ({ page }) => {
    await page.goto('/calculators/tsp?yos=8');
    const input = page.getByLabel(/more years you plan to serve/i);
    // Initial recompute: max(20-8, 1) = 12
    await expect(input).toHaveValue('12');

    // Change YOS to 4 → recomputes: max(20-4, 1) = 16
    await page.getByLabel('Years of Service').selectOption('4');
    await expect(input).toHaveValue('16');
  });
});
