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

  test('legacy ?ratings= link still hydrates conditions and renders a result', async ({ page }) => {
    await page.goto('/calculators/va-disability?ratings=10,10,60');

    // Three conditions hydrated (each renders a Remove button in the list).
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(3);
    // 10 + 10 + 60 combined (all non-bilateral) rounds to 70%.
    await expect(page.locator('p.text-6xl')).toContainText('70');
  });

  test('copy result link round-trips full state (bilateral + label + dependents)', async ({ page }) => {
    // Stub clipboard so we can capture the copied URL cross-browser without
    // platform clipboard permissions — this still exercises the real handler.
    await page.addInitScript(() => {
      const w = window as unknown as { __copied?: string };
      const nav = navigator as unknown as { clipboard?: { writeText?: (t: string) => Promise<void> } };
      if (!nav.clipboard) nav.clipboard = {};
      nav.clipboard.writeText = async (t: string) => { w.__copied = t; };
    });
    await page.goto('/calculators/va-disability');

    // 10% Left upper extremity + 10% Right upper extremity → qualifying bilateral pair.
    await page.getByRole('button', { name: '10%', exact: true }).click();
    await page.getByLabel('Body Location').selectOption({ label: 'Left upper extremity' });
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    await page.getByRole('button', { name: '10%', exact: true }).click();
    await page.getByLabel('Body Location').selectOption({ label: 'Right upper extremity' });
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    // 60% non-bilateral with a label.
    await page.getByRole('button', { name: '60%', exact: true }).click();
    await page.getByLabel('Condition Label (optional)').fill('ptsd');
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    // Dependents: spouse + 2 children under 18.
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.getByRole('button', { name: 'Increase Children under 18' }).click();
    await page.getByRole('button', { name: 'Increase Children under 18' }).click();

    // Record the displayed combined rating and monthly compensation.
    await expect(page.locator('p.text-6xl')).toContainText('70');
    const combinedBefore = (await page.locator('p.text-6xl').textContent())?.trim();
    const monthlyBefore = (await page.locator('p.text-4xl').first().textContent())?.trim();
    expect(combinedBefore).toBeTruthy();
    expect(monthlyBefore).toBeTruthy();

    // Copy the link and capture the serialized URL.
    await page.getByRole('button', { name: 'Copy result link' }).click();
    await expect(page.getByText('Copied!').first()).toBeVisible();
    const copiedUrl = await page.evaluate(() => (window as unknown as { __copied?: string }).__copied);
    expect(copiedUrl).toBeTruthy();

    // Load the shared URL in a fresh page.
    await page.goto(copiedUrl as string);

    // Same conditions + body locations (bilateral badge proves locations survived).
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(3);
    await expect(page.getByText('bilateral').first()).toBeVisible();
    await expect(page.getByText('ptsd')).toBeVisible();

    // Exactly the same combined rating and monthly compensation.
    await expect(page.locator('p.text-6xl')).toHaveText(combinedBefore!);
    await expect(page.locator('p.text-4xl').first()).toHaveText(monthlyBefore!);
  });

  // §4.25 table method: 50,30,30,20,10,10 non-bilateral + bilateral lower group
  // (20,20,10,10,10,10,0) → bilateral 58 → +5.8 → 63.8 → 64 → chain ends 95 → 100%.
  test('Reddit case: 13 conditions with bilateral legs → 100% and walkthrough shows "rounds to 64"', async ({ page }) => {
    async function add(rating: string, location?: string) {
      await page.getByRole('button', { name: rating, exact: true }).click();
      if (location) await page.getByLabel('Body Location').selectOption(location);
      await page.getByRole('button', { name: '+ Add Rating' }).click();
    }

    // Non-bilateral: 50, 30, 30, 20, 10, 10
    await add('50%');
    await add('30%');
    await add('30%');
    await add('20%');
    await add('10%');
    await add('10%');

    // Bilateral lower-extremity group: 20,20,10,10,10,10,0 split across both legs
    await add('20%', 'left-leg');
    await add('20%', 'right-leg');
    await add('10%', 'left-leg');
    await add('10%', 'right-leg');
    await add('10%', 'left-leg');
    await add('10%', 'right-leg');
    await add('0%', 'left-leg');

    await expect(page.locator('p.text-6xl')).toContainText('100');
    await expect(page.getByText(/rounds to 64/)).toBeVisible();
  });
});
