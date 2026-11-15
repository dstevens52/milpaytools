import { test, expect } from '@playwright/test';
import { bahAmount } from './helpers/format';
import { BAH_EXPECTED as X } from './fixtures/bah-expected';

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
    await page.goto('/bah');
    await page.getByLabel('Duty Station').pressSequentially('28310', { delay: 30 });
    await expect(page.getByText('Looking up rates…')).toBeVisible();
    // Fort Bragg E-5 without dependents (default) resolves after the fetch.
    await expect(page.locator('p.text-4xl')).toBeVisible({ timeout: 5000 });
  });

  // Non-default grade (the calculator defaults to E-5), so the test fails if ?rank= is dropped.
  test('deep-link (?zip=28310&rank=E-7&dependents=yes) resolves on mount', async ({ page }) => {
    await page.goto(`/bah?zip=${X.bragg.zip}&rank=E-7&dependents=yes`);
    await expect(page.getByLabel('Pay Grade')).toHaveValue('E-7');
    // E-7 with dependents at Fort Bragg (BAH_YEAR fixture), fetched on mount.
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(X.bragg.e7W) })).toBeVisible();
  });

  test('rapid ZIP change lands on the FINAL ZIP, not a stale one (race-safe)', async ({ page }) => {
    await page.goto('/bah');
    const input = page.getByLabel('Duty Station');
    await input.fill(X.bragg.zip); // Fort Bragg (w/dep) — but we leave dep off
    await input.fill(X.sanDiego.zip); // San Diego → final
    await page.getByRole('button', { name: 'With Dependents' }).click();
    // Final ZIP (San Diego E-5 w/dep) must win.
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(X.sanDiego.e5W) })).toBeVisible();
    // The stale Fort Bragg rate must NOT be displayed.
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(X.bragg.e5W) })).toHaveCount(0);
  });

  test('out-of-dataset ZIP shows not-found feedback — no crash, no undefined/NaN', async ({ page }) => {
    await page.goto('/bah');
    await page.getByLabel('Duty Station').pressSequentially('00000', { delay: 30 });
    await expect(page.getByText('ZIP code not found in BAH dataset').first()).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('undefined');
    expect(body).not.toContain('NaN');
  });

  test('territory ZIP (00601) shows the OHA message, no rate', async ({ page }) => {
    await page.goto('/bah');
    await page.getByLabel('Duty Station').pressSequentially('00601', { delay: 30 });
    await expect(page.getByText(/U\.S\. territory/i).first()).toBeVisible();
    await expect(page.locator('p.text-4xl')).toHaveCount(0);
  });
});
