import { test, expect } from '@playwright/test';
import { combinedRating, vaCompensation } from './helpers/data';
import { vaAmount } from './helpers/format';

// The VA calculator renders monthly compensation both in the headline ($X.XX/mo)
// and repeats the amount in the tax-free context sentence below.
// Use p.text-4xl (the large primary result) or .first() to avoid strict mode violations.

// Rating buttons in the "Add a disability" panel each have a unique label (e.g. "70%")
// but Playwright partial matching makes "0%" match all 11 buttons. Use exact: true.

test.describe('VA Disability Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/va-disability');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/VA Disability/i);
  });

  test('empty state prompts to add a rating', async ({ page }) => {
    await expect(page.getByText(/Add at least one/i)).toBeVisible();
  });

  test('single 70% rating shows correct compensation (veteran alone)', async ({ page }) => {
    await page.getByRole('button', { name: '70%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    const comp = vaCompensation(70, {
      hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0,
    });

    // Primary result is rendered in a large heading element
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(comp.monthly) })).toBeVisible();
  });

  test('single 100% rating shows correct compensation', async ({ page }) => {
    await page.getByRole('button', { name: '100%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    const comp = vaCompensation(100, {
      hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0,
    });

    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(comp.monthly) })).toBeVisible();
  });

  test('combined 50% + 30% rounds to 70%', async ({ page }) => {
    const result = combinedRating([50, 30]);
    expect(result.rounded).toBe(70);

    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    await page.getByRole('button', { name: '30%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    // The rounded result shows as large "70" with "%" superscript in the result card
    await expect(page.locator('p.text-6xl')).toContainText('70');
  });

  test('adding spouse increases compensation at 30%+', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    const compAlone = vaCompensation(50, {
      hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0,
    });
    const compWithSpouse = vaCompensation(50, {
      hasSpouse: true, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0,
    });
    expect(compWithSpouse.monthly).toBeGreaterThan(compAlone.monthly);

    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(compWithSpouse.monthly) })).toBeVisible();
  });

  test('100% with spouse and two children shows correct amount', async ({ page }) => {
    await page.getByRole('button', { name: '100%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    const comp = vaCompensation(100, {
      hasSpouse: true, childrenUnder18: 2, schoolChildren: 0, dependentParents: 0,
    });

    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.getByRole('button', { name: 'Increase Children under 18' }).click();
    await page.getByRole('button', { name: 'Increase Children under 18' }).click();

    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(comp.monthly) })).toBeVisible();
  });

  test('dependents do not apply below 30%', async ({ page }) => {
    await page.getByRole('button', { name: '20%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    // Must add a dependent to trigger the warning message (message only shows when anyDependents is true)
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.getByText(/Dependent additions apply only at 30%/i)).toBeVisible();
  });

  test('step-by-step breakdown is visible', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    await expect(page.getByText('How Your Rating Was Calculated')).toBeVisible();
    // The citation paragraph — use .first() since it appears in both calculator and explainer
    await expect(page.getByText(/38 CFR § 4\.25/i).first()).toBeVisible();
  });

  test('removing a disability updates results', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: '30%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    // Remove the first disability (✕ button)
    await page.getByRole('button', { name: 'Remove' }).first().click();

    // Should now show 30% as sole rating
    const comp = vaCompensation(30, {
      hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0,
    });
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(comp.monthly) })).toBeVisible();
  });

  test('0% rating shows $0.00 compensation', async ({ page }) => {
    await page.getByRole('button', { name: '0%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    // $0.00 also appears in the action step text, so use .first() to target primary result
    await expect(page.getByText('$0.00').first()).toBeVisible();
  });

  test('what-if scenario table appears with at least one disability', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText(/What If You Add Another Condition/i)).toBeVisible();
  });
});
