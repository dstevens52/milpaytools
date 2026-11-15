import { test, expect } from '@playwright/test';
import { bahAmount } from './helpers/format';
import { BAH_EXPECTED as X } from './fixtures/bah-expected';

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

  // Request-level only (no page load): checks the query string is carried, not
  // that a grade is applied — that is the next test. E-7 matches it.
  test('query string survives the redirect', async ({ request }) => {
    const qs = '?zip=28310&rank=E-7&dependents=yes&mode=compare&zipb=92134';
    const res = await request.get(`/calculators/bah${qs}`, { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    const loc = new URL(res.headers()['location'], 'http://x');
    expect(loc.pathname + loc.search).toBe(`/bah${qs}`);
  });

  // Old links carry the E-7 (hyphen) form. E-7 is not the calculator's default,
  // so this fails if the rank is dropped after the redirect.
  test('old BAH deep link lands on /bah with the calculator pre-filled', async ({ page }) => {
    await page.goto(`/calculators/bah?zip=${X.bragg.zip}&rank=E-7&dependents=yes`);
    await expect(page).toHaveURL(new RegExp(`/bah\\?zip=${X.bragg.zip}&rank=E-7&dependents=yes$`));
    await expect(page.getByLabel('Pay Grade')).toHaveValue('E-7');
    // E-7 with dependents at Fort Bragg (BAH_YEAR fixture, same source as bah-async.spec.ts).
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(X.bragg.e7W) })).toBeVisible();
  });

  test('old pay-charts URL lands on /pay with the pay charts', async ({ page }) => {
    await page.goto('/calculators/pay-charts');
    await expect(page).toHaveURL(/\/pay$/);
    await expect(page).toHaveTitle(/Pay Chart/i);
    await expect(page.getByRole('heading', { name: 'Quick Lookup' })).toBeVisible();
  });
});
