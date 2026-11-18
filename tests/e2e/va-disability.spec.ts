import { test, expect, type Page } from '@playwright/test';
import { combinedRating, vaCompensation, vaRate } from './helpers/data';
import { waitForHydration } from './helpers/hydration';
import { CURRENT_VA_RATES } from '../../src/data/va-rates/registry';
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
    // ~26 clicks + 7 selects: ~17 s alone on WebKit, past 30 s under full-suite load.
    test.slow();
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
    // The step's text keeps a real space between label and detail (not "5.858").
    await expect(page.locator('div.rounded.border', { hasText: 'Bilateral factor: 10% of' }).first())
      .toContainText('= 5.8 58 + 5.8');
  });
});

// ─── Build 06: VA-01 → VA-07 in the UI ───────────────────────────────────────
// Expected dollars are built from the current table's cells (vaRate), never typed.

test.describe('VA Disability Calculator — build 06 fixes', () => {
  async function add(page: Page, rating: string, location?: string) {
    await page.getByRole('button', { name: rating, exact: true }).click();
    if (location) await page.getByLabel('Body Location').selectOption(location);
    await page.getByRole('button', { name: '+ Add Rating' }).click();
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/va-disability');
    await waitForHydration(page.getByRole('button', { name: '+ Add Rating' }));
  });

  test('VA-01: 100%, spouse, one school child = with spouse + school-child amount', async ({ page }) => {
    await add(page, '100%');
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.getByRole('button', { name: /Increase Children 18.23 in school/ }).click();
    const expected = vaRate(100, 'withSpouse') + vaRate(100, 'additionalSchoolChild');
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(expected) })).toBeVisible();
  });

  test('VA-02: L knee 10 + R knee 10 + 90 + 30 → 100% with the § 4.26(d) step', async ({ page }) => {
    await add(page, '10%', 'left-leg');
    await add(page, '10%', 'right-leg');
    await add(page, '90%');
    await add(page, '30%');
    await expect(page.locator('p.text-6xl')).toContainText('100');
    await expect(page.getByText('Combined value: 95% → rounds to 100%')).toBeVisible();
    await expect(page.locator('div.rounded.border', { hasText: 'Bilateral factor exception (38 CFR § 4.26(d))' })).toBeVisible();
    await expect(page.getByText(/gives 100% instead of 90%/)).toBeVisible();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(vaRate(100, 'veteranAlone')) })).toBeVisible();
  });

  test('VA-03: L arm 100 + R arm 10 never shows a combined value above 100', async ({ page }) => {
    await add(page, '100%', 'left-arm');
    await add(page, '10%', 'right-arm');
    await expect(page.getByText('Combined value: 100% → rounds to 100%')).toBeVisible();
    await expect(page.getByText(/110%|rounds to 110/)).toHaveCount(0);
    await expect(page.getByText(/capped at 100/)).toBeVisible();
  });

  test('VA-04: spouse Aid & Attendance adds the A&A amount, only with a spouse', async ({ page }) => {
    await add(page, '50%');
    const aa = page.getByLabel(/Spouse receives Aid & Attendance/);
    await expect(aa).toHaveCount(0); // no spouse, no A&A input
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await aa.check();
    const expected = vaRate(50, 'withSpouse') + vaRate(50, 'spouseAA');
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(expected) })).toBeVisible();
    await aa.uncheck();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(vaRate(50, 'withSpouse')) })).toBeVisible();
  });

  test('VA-04: the share link carries A&A and reproduces the result', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __copied?: string };
      const nav = navigator as unknown as { clipboard?: { writeText?: (t: string) => Promise<void> } };
      if (!nav.clipboard) nav.clipboard = {};
      nav.clipboard.writeText = async (t: string) => { w.__copied = t; };
    });
    await page.goto('/calculators/va-disability');
    await waitForHydration(page.getByRole('button', { name: '+ Add Rating' }));
    await add(page, '70%');
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.getByLabel(/Spouse receives Aid & Attendance/).check();
    const expected = vaAmount(vaRate(70, 'withSpouse') + vaRate(70, 'spouseAA'));
    await expect(page.locator('p.text-4xl').filter({ hasText: expected })).toBeVisible();

    await page.getByRole('button', { name: 'Copy result link' }).click();
    await expect(page.getByText('Copied!').first()).toBeVisible();
    const copiedUrl = await page.evaluate(() => (window as unknown as { __copied?: string }).__copied);
    expect(copiedUrl).toContain('sp=1');
    expect(copiedUrl).toContain('aa=1');

    await page.goto(copiedUrl as string);
    await expect(page.getByLabel(/Spouse receives Aid & Attendance/)).toBeChecked();
    await expect(page.locator('p.text-4xl').filter({ hasText: expected })).toBeVisible();
  });

  test('VA-06: next-threshold text prints the combined value, then the rounded rating', async ({ page }) => {
    await add(page, '50%');
    await add(page, '20%'); // 50 & 20 → 60 → 60%; adding 20 → 68 → 70%
    await expect(page.getByText(/would bring your combined rating\s+to 68%, which rounds to 70%/)).toBeVisible();
  });

  test('VA-07: TDIU note shows below 100% and not at 100%', async ({ page }) => {
    await add(page, '50%');
    await add(page, '40%'); // 70%, one rating ≥ 40
    await expect(page.getByText(/You may qualify for TDIU/)).toBeVisible();
    await add(page, '100%');
    await expect(page.locator('p.text-6xl')).toContainText('100');
    await expect(page.getByText(/You may qualify for TDIU/)).toHaveCount(0);
  });

  test('2027 status notice above the rate table matches the registry and has no dollar figure', async ({ page }) => {
    const notice = page.getByTestId('va-rates-notice');
    if (CURRENT_VA_RATES.year === '2026') {
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(/2027 VA disability rates/);
      await expect(notice).toContainText(/December 1, 2026/);
      expect(await notice.textContent()).not.toContain('$');
    } else {
      await expect(notice).toHaveCount(0);
    }
  });
});
