import { test, expect } from '@playwright/test';

test.describe('Separation Benefits Timeline Calculator', () => {
  // Run serially — parallel execution with shared localhost causes flaky date-fill behavior
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/separation-timeline');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Separation Benefits Timeline/i);
  });

  test('empty state prompts user to enter date', async ({ page }) => {
    await expect(page.getByText(/enter your separation date/i).first()).toBeVisible();
  });

  test('entering a future date shows timeline', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i)).toBeVisible();
    await expect(page.getByText(/TRICARE Active-Duty Coverage Ends/i)).toBeVisible();
    await expect(page.getByText(/SGLI Free Coverage Ends/i)).toBeVisible();
    await expect(page.getByText(/VGLI Application Window Closes/i)).toBeVisible();
  });

  test('pre-separation section appears for a far-future date', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2028-01-01');
    await expect(page.locator('section[aria-label="Pre-Separation"]')).toBeVisible();
    await expect(page.getByText(/TAP Completion Deadline/i)).toBeVisible();
  });

  test('post-separation section appears after date is entered', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.locator('section[aria-label="Post-Separation"]')).toBeVisible();
    // Exact match avoids strict mode — intro paragraph and badge also match the loose regex
    await expect(page.getByText('Final Move Deadline', { exact: true })).toBeVisible();
  });

  test('separating type shows 180-day final move deadline text', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    // Default is separating — text should mention 180 days
    await expect(page.getByText(/180 days/i).first()).toBeVisible();
  });

  test('switching to retiring changes final move text to 3 years', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await page.getByRole('button', { name: /retiring/i }).click();
    // "3 years" appears in both card and explainer; first() avoids strict mode
    await expect(page.getByText(/3 years/i).first()).toBeVisible();
  });

  test('switching back to separating removes 3 years from final move card', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await page.getByRole('button', { name: /retiring/i }).click();
    await page.getByRole('button', { name: /separating/i }).click();
    // "3 years from retirement date" is unique to the card body — not in the static explainer
    await expect(page.getByText(/3 years from retirement date/i)).not.toBeVisible();
  });

  test('TAMP shown by default (not sure)', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByText(/TAMP Coverage Period/i)).toBeVisible();
  });

  test('TAMP shown when set to Yes', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    // Wait for timeline to confirm React committed the date before interacting with select
    await expect(page.getByText(/TAMP Coverage Period/i)).toBeVisible();
    await page.locator('select#tamp-select').selectOption('yes');
    await expect(page.getByText(/TAMP Coverage Period/i)).toBeVisible();
  });

  test('TAMP hidden when set to No', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i)).toBeVisible();
    await page.locator('select#tamp-select').selectOption('no');
    await expect(page.getByText(/TAMP Coverage Period/i)).not.toBeVisible();
  });

  test('BDD window visible when VA claim not filed', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    // With default (unknown), BDD is already visible — confirm before changing select
    await expect(page.getByText('BDD Filing Window Opens')).toBeVisible();
    // Selecting 'no' (not yet filed) keeps the card visible
    await page.locator('select#va-select').selectOption('no');
    await expect(page.getByText('BDD Filing Window Opens')).toBeVisible();
  });

  test('BDD window hidden when VA claim already filed', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i)).toBeVisible();
    await page.locator('select#va-select').selectOption('yes');
    await expect(page.getByText('BDD Filing Window Opens')).not.toBeVisible();
  });

  test('SHPE/SHA always visible regardless of VA toggle', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await page.locator('select#va-select').selectOption('yes');
    // Exact card title — avoids matching the longer card body text
    await expect(page.getByText('Schedule SHPE / SHA')).toBeVisible();
  });

  test('share button appears after entering a date', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByRole('button', { name: /share|copy link/i }).first()).toBeVisible();
  });

  test('print button appears after entering a date', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByRole('button', { name: /print|save as pdf/i })).toBeVisible();
  });

  test('URL params pre-populate date and type', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-06-01&type=retiring&tamp=no');
    await expect(page.getByLabel(/separation date/i)).toHaveValue('2027-06-01');
    await expect(page.getByLabel(/TAMP Eligible/i)).toHaveValue('no');
    await expect(page.getByText(/TAMP Coverage Period/i)).not.toBeVisible();
    // "3 years" appears in card body and explainer; first() avoids strict mode
    await expect(page.getByText(/3 years/i).first()).toBeVisible();
  });

  test('URL param va=yes hides BDD window', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2027-06-01&va=yes');
    await expect(page.getByText('BDD Filing Window Opens')).not.toBeVisible();
  });

  test('separation day section always shows', async ({ page }) => {
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.locator('section[aria-label="Separation Day"]')).toBeVisible();
  });

  test('mobile responsive: timeline visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel(/separation date/i).fill('2027-01-15');
    await expect(page.getByText(/Last Active Duty Day/i)).toBeVisible();
    await expect(page.getByText(/SGLI Free Coverage Ends/i)).toBeVisible();
  });
});
