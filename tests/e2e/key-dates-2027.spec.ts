import { test, expect } from '@playwright/test';
import { PAY_PAGE_RANKS } from '@/data/pay-pages/ranks';
import { bahNoticeMode } from '@/lib/calculations/bahTransition';

// 2027 key dates (feat/2027-key-dates): full calendar on /pay/raise, compact on
// /pay, one line on each rank page, a link on /bah, a strip on the homepage.
// Text and statuses are unit-tested in pay-raise-2027.spec.ts; this checks placement.

test.describe('/pay/raise key dates', () => {
  test('#key-dates: H2, 9 rows with status chips, footer and sources', async ({ page }) => {
    await page.goto('/pay/raise');
    const section = page.locator('section#key-dates');
    await expect(section.locator('h2')).toHaveText('2027 military pay calendar: key dates');
    const rows = section.getByTestId('key-date-row');
    await expect(rows).toHaveCount(9);
    const chips = section.getByTestId('key-date-status');
    await expect(chips).toHaveCount(9);
    for (const t of await chips.allTextContents()) expect(['Official', 'Expected', 'Pending']).toContain(t.trim());
    await expect(section.getByTestId('key-dates-footer')).toContainText(
      'Official means set by law, regulation or an official announcement; expected dates follow past years and can change.',
    );
    await expect(section.getByTestId('key-dates-sources')).toContainText('H. Doc. 119-189');
    await expect(section.getByTestId('key-dates-sources')).toContainText(
      'DFAS active duty paydays (2026 schedule; 2027 not yet posted)',
    );
    await expect(rows.filter({ hasText: 'First payday at 2027 rates' })).toContainText('Friday, January 15, 2027');
    await expect(rows.filter({ hasText: 'Last payday at 2026 rates' })).toContainText('Thursday, December 31, 2026');
    // Placed directly after the Summary section.
    await expect(page.locator('section[aria-labelledby="raise-summary-h"] + section#key-dates')).toHaveCount(1);
  });

  test('email signup sits directly after #key-dates with the new headline', async ({ page }) => {
    await page.goto('/pay/raise');
    const next = page.locator('section#key-dates + *');
    await expect(next).toContainText('Get an email when the 2027 raise is final and when 2027 BAH rates are out');
    // The old page-level headline is gone (the site footer keeps its own signup with that text).
    await expect(page.locator('main').getByText('Get notified when 2027 military pay data is updated')).toHaveCount(0);
  });

  test('calculator anchor exists; chart H2 names every branch', async ({ page }) => {
    await page.goto('/pay/raise');
    await expect(page.locator('#your-2027-base-pay')).toHaveCount(1);
    await expect(page.locator('#raise-chart-h')).toHaveText(
      '2027 military pay chart by grade: Army, Navy, Air Force, Marine Corps, Space Force and Coast Guard',
    );
  });

  test('BAH and paycheck FAQ answers carry the calendar dates', async ({ page }) => {
    await page.goto('/pay/raise');
    await expect(page.locator('[data-faq-question="Does the raise affect BAH?"]')).toContainText('December 11, 2025');
    const paycheck = page.locator('[data-faq-question="When will I see the 2027 raise in my paycheck?"]');
    await expect(paycheck).toContainText('January 15, 2027');
    await expect(paycheck).toContainText('December 31, 2026');
  });
});

test('/pay: compact key dates (4 rows) right after the 2027 raise card', async ({ page }) => {
  await page.goto('/pay');
  const compact = page.getByTestId('key-dates-compact');
  await expect(compact).toHaveCount(1);
  await expect(compact.getByTestId('key-date-row')).toHaveCount(4);
  await expect(compact.getByTestId('key-date-status')).toHaveCount(4);
  await expect(compact.getByRole('link', { name: 'See every 2027 key date →' })).toHaveAttribute('href', '/pay/raise#key-dates');
  await expect(compact.getByRole('link', { name: 'All 2027 paydays →' })).toHaveAttribute('href', '/pay/dates');
  await expect(page.locator('[data-testid="pay-raise-card"] + div [data-testid="key-dates-compact"]')).toHaveCount(1);
});

test.describe('rank pages: key-dates line inside the 2027 section', () => {
  for (const { slug } of PAY_PAGE_RANKS) {
    test(`/pay/${slug}`, async ({ page }) => {
      await page.goto(`/pay/${slug}`);
      const line = page.getByTestId('rank-raise-2027').getByTestId('rank-key-dates');
      await expect(line).toContainText(
        'Key dates: the raise takes effect January 1, 2027, and the first payday at 2027 rates is Friday, January 15, 2027. 2027 BAH is expected in mid-December.',
      );
      await expect(line.getByRole('link', { name: 'See the 2027 pay calendar →' })).toHaveAttribute('href', '/pay/raise#key-dates');
      await expect(line.getByRole('link', { name: 'All 2027 paydays →' })).toHaveAttribute('href', '/pay/dates');
      // FAQ count unchanged: 5 branch-term FAQs + the 2027 raise FAQ.
      await expect(page.locator('[data-faq-question]')).toHaveCount(6);
    });
  }
});

test('/bah index: key-dates link next to the 2027 notice; station pages untouched', async ({ page }) => {
  await page.goto('/bah');
  const link = page.getByTestId('bah-key-dates-link').getByRole('link');
  await expect(link).toHaveText('See every 2027 key date →');
  await expect(link).toHaveAttribute('href', '/pay/raise#key-dates');
  await page.goto('/bah/fort-hood');
  // The 2027 notice shows only until 2027 rates are loaded (bahNoticeMode).
  await expect(page.getByTestId('bah-2027-notice')).toHaveCount(bahNoticeMode() === 'next-year-status' ? 1 : 0);
  await expect(page.getByTestId('bah-key-dates-link')).toHaveCount(0);
  await expect(page.getByTestId('key-dates-compact')).toHaveCount(0);
});

test('homepage: 2027 raise strip links to /pay/raise', async ({ page }) => {
  await page.goto('/');
  const strip = page.getByTestId('home-pay-raise-strip');
  await expect(strip).toHaveText('2027 military pay raise: see your 2027 base pay by rank and the key dates →');
  await expect(strip).toHaveAttribute('href', '/pay/raise');
});
