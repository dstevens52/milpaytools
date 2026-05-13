import { test, expect } from '@playwright/test';

test.describe('Healthcare Cost Comparison Calculator', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Healthcare Cost Comparison/i);
  });

  test('default state shows TRICARE and employer comparison', async ({ page }) => {
    await expect(page.getByText('Active-Duty TRICARE', { exact: true })).toBeVisible();
    await expect(page.getByText('Employer-Sponsored Insurance', { exact: true })).toBeVisible();
  });

  test('TRICARE column always shows $0 premium', async ({ page }) => {
    // TRICARE column shows $0 monthly premium
    const tricareCol = page.locator('.bg-green-50').first();
    await expect(tricareCol).toContainText('$0');
  });

  test('single family status shows lower costs than family', async ({ page }) => {
    // Single Silver employer: $170/mo
    await page.locator('#family-select').selectOption('single');
    await page.getByRole('button', { name: /silver/i }).click();
    await expect(page.getByText(/\$170/).first()).toBeVisible();

    // Married Silver employer: $570/mo — higher than single
    await page.locator('#family-select').selectOption('married-2-children');
    await expect(page.getByText(/\$570/).first()).toBeVisible();
  });

  test('employer Bronze shows lower premium than Gold', async ({ page }) => {
    await page.getByRole('button', { name: /bronze/i }).click();
    await expect(page.getByText(/\$105/).first()).toBeVisible();

    await page.getByRole('button', { name: /gold/i }).click();
    await expect(page.getByText(/\$250/).first()).toBeVisible();
  });

  test('VA healthcare at 50%+ shows $0 monthly copay', async ({ page }) => {
    await page.locator('#path-select').selectOption('va');
    await expect(page.locator('#va-rating-select')).toBeVisible();
    await page.locator('#va-rating-select').selectOption('50plus');
    // Annual gap should show $0 or green $0
    await expect(page.getByText(/\$0/i).first()).toBeVisible();
  });

  test('VA healthcare at 30-40% shows copay info', async ({ page }) => {
    await page.locator('#path-select').selectOption('va');
    await page.locator('#va-rating-select').selectOption('30to40');
    // The notes section in the calculator column shows the copay schedule
    await expect(page.getByText('$15 primary / $50 specialist', { exact: false })).toBeVisible();
  });

  test('VA shows family coverage warning for family status', async ({ page }) => {
    await page.locator('#path-select').selectOption('va');
    await page.locator('#family-select').selectOption('married-1-child');
    await expect(page.getByText(/VA healthcare covers you only/i)).toBeVisible();
  });

  test('VA does not show family warning for single', async ({ page }) => {
    await page.locator('#path-select').selectOption('va');
    await page.locator('#family-select').selectOption('single');
    await expect(page.getByText(/VA healthcare covers you only/i)).not.toBeVisible();
  });

  test('TAMP option shows 6-month free coverage section', async ({ page }) => {
    await page.locator('#path-select').selectOption('tamp');
    await expect(page.getByText(/TAMP coverage period/i)).toBeVisible();
    await expect(page.getByText(/Days 1–180/)).toBeVisible();
  });

  test('TAMP option hides annual gap section', async ({ page }) => {
    await page.locator('#path-select').selectOption('tamp');
    await expect(page.getByText(/Annual healthcare cost gap/i)).not.toBeVisible();
  });

  test('TAMP toggle splits first year cost', async ({ page }) => {
    // Default employer silver
    await expect(page.getByText(/Estimated Year 1 total/i)).toBeVisible();

    // Check the TAMP toggle
    await page.getByRole('checkbox', { name: /qualify for TAMP/i }).check();

    // TAMP split section should appear
    await expect(page.getByTestId('tamp-split')).toBeVisible();
    await expect(page.getByText(/Months 1–6 \(TAMP, free\)/i)).toBeVisible();
    await expect(page.getByText(/Months 7–12 premiums/i)).toBeVisible();
    await expect(page.getByText(/Year 1 total with TAMP/i)).toBeVisible();
  });

  test('unchecking TAMP toggle hides split section', async ({ page }) => {
    await page.getByRole('checkbox', { name: /qualify for TAMP/i }).check();
    await expect(page.getByTestId('tamp-split')).toBeVisible();

    await page.getByRole('checkbox', { name: /qualify for TAMP/i }).uncheck();
    await expect(page.getByTestId('tamp-split')).not.toBeVisible();
  });

  test('gap calculation displays correctly for employer', async ({ page }) => {
    // Single Silver employer: $170/mo = $2,040/yr premium + ~$900 deductible
    await page.locator('#family-select').selectOption('single');
    await page.getByRole('button', { name: /silver/i }).click();
    await expect(page.getByText(/Annual healthcare cost gap/i)).toBeVisible();
    // Gap should show annual amount
    await expect(page.getByText(/\$2,940/).first()).toBeVisible();
  });

  test('ACA subsidy path shows income input', async ({ page }) => {
    await page.locator('#path-select').selectOption('aca-subsidy');
    await expect(page.locator('#income-input')).toBeVisible();
  });

  test('ACA subsidy shows subsidy note when income is entered', async ({ page }) => {
    await page.locator('#path-select').selectOption('aca-subsidy');
    await page.locator('#income-input').fill('30000');
    await expect(page.getByText(/subsidy applied/i)).toBeVisible();
  });

  test('ACA no-subsidy path shows correct premiums', async ({ page }) => {
    await page.locator('#path-select').selectOption('aca-no-subsidy');
    await page.getByRole('button', { name: /silver/i }).click();
    await page.locator('#family-select').selectOption('single');
    await expect(page.getByText(/\$500/).first()).toBeVisible();
  });

  test('TRS path shows low premiums', async ({ page }) => {
    await page.locator('#path-select').selectOption('trs');
    await page.locator('#family-select').selectOption('single');
    await expect(page.getByText(/\$52/).first()).toBeVisible();
  });

  test('share button appears', async ({ page }) => {
    await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible();
  });

  test('URL params pre-populate family status and path', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?family=married-2-children&path=trs');
    await expect(page.locator('#family-select')).toHaveValue('married-2-children');
    await expect(page.locator('#path-select')).toHaveValue('trs');
  });

  test('URL param tamp=true pre-checks TAMP toggle', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?family=single&path=employer&tamp=true');
    await expect(page.getByRole('checkbox', { name: /qualify for TAMP/i })).toBeChecked();
    await expect(page.getByTestId('tamp-split')).toBeVisible();
  });

  test('plan tier buttons are visible for employer path', async ({ page }) => {
    await expect(page.getByRole('button', { name: /bronze/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /silver/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /gold/i })).toBeVisible();
  });

  test('plan tier buttons hidden for VA path', async ({ page }) => {
    await page.locator('#path-select').selectOption('va');
    await expect(page.getByRole('button', { name: /bronze/i })).not.toBeVisible();
  });

  test('mobile: results visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText('Active-Duty TRICARE', { exact: true })).toBeVisible();
    await expect(page.getByText(/Annual healthcare cost gap/i)).toBeVisible();
  });
});
