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
    // The notes section in the calculator column shows the copay info
    await expect(page.getByText('Copays for non-SC care vary by priority group', { exact: false })).toBeVisible();
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

  // HC-02 (build 10a): no computed subsidy. Older links with path=aca-subsidy still load.
  test('ACA path has no income input or subsidy; shows the tax-credit line', async ({ page }) => {
    await expect(page.locator('#path-select option[value="aca-subsidy"]')).toHaveCount(0);
    await page.locator('#path-select').selectOption('aca-no-subsidy');
    await expect(page.locator('#income-input')).toHaveCount(0);
    await expect(page.getByText('Premium tax credits depend on household income; see HealthCare.gov for your actual price.').first()).toBeVisible();
  });

  test('old share link path=aca-subsidy&income= opens the no-subsidy path', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?path=aca-subsidy&family=married-1-child&income=50000');
    await expect(page.locator('#path-select')).toHaveValue('aca-no-subsidy');
    await expect(page.locator('#family-select')).toHaveValue('married-1-child');
    await expect(page.getByText(/subsidy applied/i)).toHaveCount(0);
    await expect(page.getByText('Premium tax credits depend on household income; see HealthCare.gov for your actual price.').first()).toBeVisible();
  });

  // HC-01: malformed share links fall back to defaults instead of crashing.
  test('malformed share link loads with defaults', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/calculators/healthcare-comparison?path=cobra&tier=platinum&rating=70&family=x&plan=gold&group=c');
    await expect(page.locator('#path-select')).toHaveValue('employer');
    await expect(page.locator('#family-select')).toHaveValue('single');
    await expect(page.getByTestId('hc-annual-gap')).toHaveText('$2,940');
    await page.goto('/calculators/healthcare-comparison?path=va&rating=70');
    await expect(page.locator('#va-rating-select')).toHaveValue('50plus');
    expect(errors).toEqual([]);
  });

  // HC-05: retiree TRICARE (2026 rates from src/data/tricare until Jan 1).
  test('retiree path: Prime Group A family shows the $765 enrollment fee', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?path=tricare-retiree&family=married-2-children&plan=prime&group=a');
    await expect(page.locator('#retiree-plan-select')).toHaveValue('prime');
    await expect(page.locator('#retiree-group-select')).toHaveValue('a');
    await expect(page.locator('p', { hasText: /^TRICARE \(military retiree\)$/ })).toBeVisible();
    await expect(page.getByText('Annual enrollment fee', { exact: true })).toBeVisible();
    await expect(page.getByTestId('hc-annual-gap')).toHaveText('$765');
    await expect(page.getByText('Group A applies if you entered service before Jan. 1, 2018; Group B rates differ.')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /qualify for TAMP/i })).toHaveCount(0);
  });

  test('retiree path: Select Group B family shows the $1,191 fee', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?path=tricare-retiree&family=married-1-child');
    await expect(page.locator('#retiree-plan-select')).toHaveValue('select');
    await page.locator('#retiree-group-select').selectOption('b');
    await expect(page.getByText(/\$1,191/).first()).toBeVisible();
    await expect(page.getByText('Group B applies if you entered service on or after Jan. 1, 2018.')).toBeVisible();
  });

  // HC-04: the page's TAMP list is the statutory list.
  test('TAMP eligibility list matches 10 U.S.C. § 1145', async ({ page }) => {
    const list = page.getByTestId('tamp-eligibility');
    await expect(list.locator('li')).toHaveCount(7);
    await expect(list).toContainText('Members who join the Selected Reserve when they separate');
    await expect(page.locator('main')).not.toContainText(/early retirement|Voluntary Separation Incentive|Special Separation Benefit/);
  });

  // HC-06: TAMP split keeps the full deductible estimate; VA 0% claim removed.
  test('TAMP split: full-year deductible estimate', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?family=single&path=employer&tier=silver&tamp=true');
    const split = page.getByTestId('tamp-split');
    await expect(split).toContainText('deductibles reset each January');
    await expect(split).toContainText('$900');
    await expect(page.locator('main')).not.toContainText('generally limited to their service-connected conditions');
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
    await expect(page.getByText(/\$57\.88/).first()).toBeVisible();
  });

  test('share button appears', async ({ page }) => {
    // Desktop viewport (config default): "Share result" is mobile-only, so check "Copy result link".
    await expect(page.getByRole('button', { name: 'Copy result link', exact: true })).toBeVisible();
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
