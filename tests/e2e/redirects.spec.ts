import { test, expect } from '@playwright/test';
import { bahAmount } from './helpers/format';

// B2 hub consolidation: the standalone calculator URLs were retired into the
// /bah and /pay hubs via permanent redirects in next.config.ts.
//
// ALLOWLISTED: this file intentionally contains the retired URLs. It is the one
// exception (besides next.config.ts) to the zero-reference rule in CLAUDE.md
// ("Retired URLs"). These are not stale links — do not rewrite them.

const RETIRED = [
  { from: '/calculators/bah', to: '/bah' },
  { from: '/calculators/pay-charts', to: '/pay' },
];

test.describe('Retired calculator URLs redirect to hubs', () => {
  for (const { from, to } of RETIRED) {
    test(`${from} → ${to} is a 308 permanent redirect`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(to);
    });
  }

  test('query string survives the redirect', async ({ request }) => {
    const qs = '?zip=28310&rank=E-5&dependents=yes&mode=compare&zipb=92134';
    const res = await request.get(`/calculators/bah${qs}`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    const loc = new URL(res.headers()['location'], 'http://x');
    expect(loc.pathname + loc.search).toBe(`/bah${qs}`);
  });

  test('old BAH deep link lands on /bah with the calculator pre-filled', async ({ page }) => {
    await page.goto('/calculators/bah?zip=28310&rank=E-5&dependents=yes');
    await expect(page).toHaveURL(/\/bah\?zip=28310&rank=E-5&dependents=yes$/);
    // E-5 with dependents at Fort Bragg = $1,806/mo (same known answer as bah-async.spec.ts).
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(1806) })).toBeVisible();
  });

  test('old pay-charts URL lands on /pay with the pay charts', async ({ page }) => {
    await page.goto('/calculators/pay-charts');
    await expect(page).toHaveURL(/\/pay$/);
    await expect(page).toHaveTitle(/Pay Chart/i);
    await expect(page.getByRole('heading', { name: 'Quick Lookup' })).toBeVisible();
  });
});
