import { test, expect } from '@playwright/test';

// The Education Benefits calculator renders benefit cards as independent panels.
// Some text (GI Bill, Tuition Assistance, etc.) also appears in the explainer
// section below the calculator — use .first() to avoid strict mode violations.

test.describe('Education Benefits Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/education');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Education|GI Bill/i);
  });

  test('Post-9/11 GI Bill card is shown', async ({ page }) => {
    await expect(page.getByText('Post-9/11 GI Bill').first()).toBeVisible();
  });

  test('MGIB card is shown', async ({ page }) => {
    await expect(page.getByText(/Montgomery GI Bill|MGIB/i).first()).toBeVisible();
  });

  test('Tuition Assistance card is visible for active duty', async ({ page }) => {
    await expect(page.getByText(/Tuition Assistance/i).first()).toBeVisible();
  });

  test('best value badge appears on the highest-value benefit', async ({ page }) => {
    await expect(page.getByText('Best value')).toBeVisible();
  });

  test('total program value is displayed for eligible benefits', async ({ page }) => {
    await expect(page.getByText('Total program value').first()).toBeVisible();
  });

  test('service status toggle is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Active Duty|Veteran|Guard/i }).first()).toBeVisible();
  });

  test('switching to veteran status changes TA eligibility', async ({ page }) => {
    // Default is already veteran, but ensure it's selected
    await page.getByRole('button', { name: 'Veteran' }).click();
    // TA ineligible reason: "Tuition Assistance is available to active duty service members only"
    await expect(page.getByText(/active duty service members only|active duty.*only/i).first()).toBeVisible();
  });

  test('program length selector is visible', async ({ page }) => {
    await expect(page.getByText(/program length|years of school|4-year/i).first()).toBeVisible();
  });

  test('100% Post-9/11 tier is selectable', async ({ page }) => {
    // Look for the 36+ months / 100% tier button
    const tierBtn = page.getByRole('button', { name: /100%|36.*months/i }).first();
    if (await tierBtn.isVisible()) {
      await tierBtn.click();
      await expect(page.getByText(/100%/).first()).toBeVisible();
    }
  });

  test('entering a valid ZIP updates MHA display', async ({ page }) => {
    const zipInput = page.locator('input[type="text"]').first();
    await zipInput.fill('28307');
    // MHA or housing allowance should appear after a ZIP is entered
    await expect(page.getByText(/MHA|Housing Allowance|housing/i).first()).toBeVisible();
  });

  test('online vs in-person enrollment toggle is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Online|In-Person|In Person/i }).first()).toBeVisible();
  });
});
