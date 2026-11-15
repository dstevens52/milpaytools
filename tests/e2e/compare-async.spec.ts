import { test, expect } from '@playwright/test';
import { bahAmount } from './helpers/format';
import { BAH_EXPECTED as X } from './fixtures/bah-expected';

// Verifies the two-ZIP Compare calculator resolves both locations via the
// async /api/bah/lookup route (deep-link on mount + race-safety on the final ZIP).
// The BAH row renders "$X,XXX/mo" per location.
//
// Deep links use E-7, not the calculator's default E-5, so a dropped ?rank=
// fails these tests instead of passing by accident.

/** "$2,094/mo" as a regex (bahAmount already includes the "$"). */
const mo = (n: number) => new RegExp(`${bahAmount(n).replace('$', '\\$')}/mo`);

test.describe('Compare Calculator — async route migration (two ZIPs)', () => {
  test('deep-link resolves both locations on mount', async ({ page }) => {
    await page.goto(`/calculators/compare?zip1=${X.bragg.zip}&zip2=${X.sanDiego.zip}&rank=E-7&dependents=yes`);
    await expect(page.locator('select').first()).toHaveValue('E-7');
    // Fort Bragg and San Diego E-7 with dependents both appear.
    await expect(page.getByText(mo(X.bragg.e7W)).first()).toBeVisible();
    await expect(page.getByText(mo(X.sanDiego.e7W)).first()).toBeVisible();
  });

  test('rapid destination ZIP change lands on the FINAL location (race-safe)', async ({ page }) => {
    await page.goto(`/calculators/compare?zip1=${X.bragg.zip}&zip2=${X.bragg.zip}&rank=E-7&dependents=yes`);
    await expect(page.locator('select').first()).toHaveValue('E-7');
    const inputs = page.locator('input[type="text"]'); // two ZIP inputs share a label
    await inputs.nth(1).fill('20001'); // DC
    await inputs.nth(1).fill(X.sanDiego.zip); // San Diego — final
    await expect(page.getByText(mo(X.sanDiego.e7W)).first()).toBeVisible();
  });

  test('no "NaN"/"undefined" in the rendered comparison', async ({ page }) => {
    await page.goto(`/calculators/compare?zip1=${X.bragg.zip}&zip2=${X.sanDiego.zip}&rank=E-7&dependents=yes`);
    await expect(page.locator('select').first()).toHaveValue('E-7');
    await expect(page.getByText(mo(X.sanDiego.e7W)).first()).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/\$undefined|undefined\/mo/);
  });
});
