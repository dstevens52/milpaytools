import { test, expect } from '@playwright/test';
import { bahAmount } from './helpers/format';

// Verifies the BAH calculator's migration to the async /api/bah/lookup route:
// loading state, deep-link resolution on mount, race-safety, and clean
// handling of out-of-dataset ZIPs.

test.describe('BAH Calculator — async route migration', () => {
  test('shows a loading state, then resolves to the correct rate', async ({ page }) => {
    // Delay the lookup so the loading state is observable.
    await page.route('**/api/bah/lookup**', async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      await route.continue();
    });
    await page.goto('/calculators/bah');
    await page.getByLabel('Duty Station').pressSequentially('28310', { delay: 30 });
    await expect(page.getByText('Looking up rates…')).toBeVisible();
    // Fort Bragg E-5 without dependents (default) resolves after the fetch.
    await expect(page.locator('p.text-4xl')).toBeVisible({ timeout: 5000 });
  });

  test('deep-link (?zip=28310&rank=E-5&dependents=yes) resolves on mount', async ({ page }) => {
    await page.goto('/calculators/bah?zip=28310&rank=E-5&dependents=yes');
    // E-5 with dependents at Fort Bragg = $1,806/mo, fetched on mount.
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(1806) })).toBeVisible();
  });

  test('rapid ZIP change lands on the FINAL ZIP, not a stale one (race-safe)', async ({ page }) => {
    await page.goto('/calculators/bah');
    const input = page.getByLabel('Duty Station');
    await input.fill('28310'); // Fort Bragg → 1806 (w/dep) — but we leave dep off
    await input.fill('92134'); // San Diego → final
    await page.getByRole('button', { name: 'With Dependents' }).click();
    // Final ZIP (San Diego E-5 w/dep = 3975) must win.
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(3975) })).toBeVisible();
    // The stale Fort Bragg rate must NOT be displayed.
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(1806) })).toHaveCount(0);
  });

  test('out-of-dataset ZIP shows not-found feedback — no crash, no undefined/NaN', async ({ page }) => {
    await page.goto('/calculators/bah');
    await page.getByLabel('Duty Station').pressSequentially('00000', { delay: 30 });
    await expect(page.getByText('ZIP code not found in BAH dataset').first()).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('undefined');
    expect(body).not.toContain('NaN');
  });

  test('territory ZIP (00601) shows the OHA message, no rate', async ({ page }) => {
    await page.goto('/calculators/bah');
    await page.getByLabel('Duty Station').pressSequentially('00601', { delay: 30 });
    await expect(page.getByText(/U\.S\. territory/i).first()).toBeVisible();
    await expect(page.locator('p.text-4xl')).toHaveCount(0);
  });
});
