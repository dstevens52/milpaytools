import { test, expect } from '@playwright/test';

// Verifies the two-ZIP Compare calculator resolves both locations via the
// async /api/bah/lookup route (deep-link on mount + race-safety on the final ZIP).
// The BAH row renders "$X,XXX/mo" per location.

test.describe('Compare Calculator — async route migration (two ZIPs)', () => {
  test('deep-link resolves both locations on mount', async ({ page }) => {
    await page.goto('/calculators/compare?zip1=28310&zip2=92134&rank=E-5&dependents=yes');
    // Fort Bragg E-5 w/dep $1,806/mo and San Diego $3,975/mo both appear.
    await expect(page.getByText(/\$1,806\/mo/).first()).toBeVisible();
    await expect(page.getByText(/\$3,975\/mo/).first()).toBeVisible();
  });

  test('rapid destination ZIP change lands on the FINAL location (race-safe)', async ({ page }) => {
    await page.goto('/calculators/compare?zip1=28310&zip2=28310&rank=E-5&dependents=yes');
    const inputs = page.locator('input[type="text"]'); // two ZIP inputs share a label
    await inputs.nth(1).fill('20001'); // DC
    await inputs.nth(1).fill('92134'); // San Diego — final
    await expect(page.getByText(/\$3,975\/mo/).first()).toBeVisible();
  });

  test('no "NaN"/"undefined" in the rendered comparison', async ({ page }) => {
    await page.goto('/calculators/compare?zip1=28310&zip2=92134&rank=E-5&dependents=yes');
    await expect(page.getByText(/\$3,975\/mo/).first()).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/\$undefined|undefined\/mo/);
  });
});
