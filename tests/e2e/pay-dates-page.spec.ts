import { test, expect, type Page } from '@playwright/test';
import { PAYDAY_SOURCES } from '@/data/paydays/2027';
import { payDatesFaqs } from '@/lib/pay-dates/content';

// /pay/dates (feat/pay-dates-2027). Dates and copy are unit-tested in
// pay-dates-data.spec.ts; this checks the rendered page.

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((r) => JSON.parse(r) as Record<string, unknown>);
}

test.describe('/pay/dates', () => {
  test('head: title ≤60, description, canonical; H1', async ({ page }) => {
    await page.goto('/pay/dates');
    const title = await page.title();
    expect(title).toBe('Military Pay Dates 2027: Active Duty & Retiree | MilPayTools');
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc!.length).toBeLessThanOrEqual(155);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/pay\/dates$/);
    await expect(page.locator('h1')).toHaveText('Military Pay Dates 2027: Active Duty, Retiree and VA');
  });

  test('top answer: three lines, links back to the raise calculator', async ({ page }) => {
    await page.goto('/pay/dates');
    const box = page.getByTestId('pay-dates-answer');
    await expect(box.locator('p')).toHaveCount(3);
    await expect(box).toContainText('Friday, January 15, 2027 is the first payday at 2027 rates');
    await expect(box.getByRole('link', { name: 'See your 2027 base pay →' })).toHaveAttribute('href', '/pay/raise#your-2027-base-pay');
  });

  test('active duty 2027 table: 24 rows, one pending, label, no LES column', async ({ page }) => {
    await page.goto('/pay/dates');
    await expect(page.getByTestId('ad-label')).toContainText("DFAS hasn't posted its 2027 active-duty payday table (checked November 13, 2026).");
    const table = page.getByTestId('ad-2027-table');
    await expect(table.locator('thead th')).toHaveText(['Pay period', 'Scheduled', 'Paid', 'Why it moved']);
    await expect(table.getByTestId('ad-row')).toHaveCount(24);
    const pending = table.locator('[data-testid="ad-row"][data-status="pending"]');
    await expect(pending).toHaveCount(1);
    await expect(pending).toContainText('Not yet published. January 1, 2028 is a Saturday');
    await expect(pending).not.toContainText('2021');
    await expect(table.locator('[data-paid="2027-02-12"]')).toContainText("Feb 15 is Washington's Birthday");
    await expect(table.locator('[data-paid="2027-01-15"]')).toContainText('Fri, Jan 15, 2027');
    await expect(table).not.toContainText('LES');
  });

  test('rest of 2026: 4 official rows with LES dates; Dec 31 at 2026 rates', async ({ page }) => {
    await page.goto('/pay/dates');
    const rows = page.getByTestId('rest-2026-row');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toContainText('Fri, Nov 13, 2026');
    await expect(rows.nth(0)).toContainText('Sat, Nov 7, 2026');
    await expect(rows.nth(3)).toContainText('Thu, Dec 31, 2026');
    await expect(rows.nth(3)).toContainText('Thu, Dec 24, 2026');
    await expect(page.locator('#rest-of-2026')).toContainText('covers December 16–31 at 2026 rates');
  });

  test('retired, VA and Guard/Reserve sections', async ({ page }) => {
    await page.goto('/pay/dates');
    await expect(page.getByTestId('retired-row')).toHaveCount(15);
    await expect(page.getByTestId('retired-row').nth(2)).toContainText('Thu, Dec 31, 2026');
    await expect(page.getByTestId('retired-row').nth(2)).toContainText('Mon, Jan 4, 2027');
    await expect(page.getByTestId('retiree-cola-line')).toContainText(
      'first appears in the December 2026 retired pay, paid December 31, 2026 (annuitants: January 4, 2027)',
    );
    await expect(page.getByTestId('retiree-cola-line').getByRole('link', { name: '2027 key dates →' })).toHaveAttribute('href', '/pay/raise#key-dates');
    await expect(page.getByTestId('va-row')).toHaveCount(13);
    await expect(page.getByTestId('va-label')).toContainText('38 U.S.C. 5120(e)');
    await expect(page.getByTestId('va-cola-line')).not.toContainText('$');
    await expect(page.getByTestId('guard-reserve')).toContainText('check myPay');
  });

  test('internal links in the body', async ({ page }) => {
    await page.goto('/pay/dates');
    const main = page.locator('main');
    for (const href of ['/pay/raise', '/pay', '/calculators/total-compensation', '/calculators/retirement', '/calculators/va-disability']) {
      await expect(main.locator(`a[href="${href}"]`).first(), href).toBeVisible();
    }
  });

  test('FAQ visible = FAQPage JSON-LD; Article + BreadcrumbList present', async ({ page }) => {
    await page.goto('/pay/dates');
    const blocks = await jsonLd(page);
    const faq = blocks.find((b) => b['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const names = faq.mainEntity.map((q) => q.name);
    expect(names).toEqual(payDatesFaqs().map((f) => f.question));
    const visible = await page.locator('[data-faq-question]').evaluateAll((els) => els.map((e) => e.getAttribute('data-faq-question')));
    expect(visible).toEqual(names);
    for (const q of faq.mainEntity) expect(q.acceptedAnswer.text).not.toMatch(/\]\(\//); // links reduced to text
    expect(blocks.some((b) => b['@type'] === 'Article')).toBe(true);
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList') as { itemListElement: { name: string }[] };
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(['Home', 'Pay by Rank', 'Pay Dates 2027']);
  });

  test('sources: every source listed with its link; last checked', async ({ page }) => {
    await page.goto('/pay/dates');
    const box = page.getByTestId('pay-dates-sources');
    for (const s of Object.values(PAYDAY_SOURCES)) {
      await expect(box.locator(`a[href="${s.url}"]`), s.name).toHaveText(s.name);
    }
    await expect(box).toContainText('Last checked November 13, 2026.');
  });

  test('no client errors; no element id that shadows window.va (Vercel Analytics)', async ({ page }) => {
    // An element with id="va" becomes window.va, and @vercel/analytics calls window.va(...).
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/pay/dates');
    await expect(page.getByTestId('next-payday')).toBeVisible();
    await expect(page.locator('#va')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('no bank early-deposit dates on the page', async ({ page }) => {
    await page.goto('/pay/dates');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/early deposit|USAA|Navy Federal|PenFed|Armed Forces Bank/i);
  });

  test('no horizontal page scroll at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/pay/dates');
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
  });
});

test.describe('/pay/dates next-payday widget', () => {
  test('hidden without JavaScript', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/pay/dates');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByTestId('next-payday')).toHaveCount(0);
    await ctx.close();
  });

  test('local date Dec 16, 2026 → Thursday, December 31, 2026 (in 15 days)', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 11, 16, 9, 0, 0));
    await page.goto('/pay/dates');
    await expect(page.getByTestId('next-payday-date')).toHaveText('Thursday, December 31, 2026 (in 15 days)');
  });

  test('payday itself shows "today"', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 1, 12, 9, 0, 0));
    await page.goto('/pay/dates');
    await expect(page.getByTestId('next-payday-date')).toHaveText('Friday, February 12, 2027 (today)');
  });

  test('after Dec 15, 2027 → pending wording', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 11, 20, 9, 0, 0));
    await page.goto('/pay/dates');
    await expect(page.getByTestId('next-payday-date')).toHaveText("late December 2027 (DFAS hasn't published the exact date)");
  });
});

test.describe('links into /pay/dates', () => {
  test('/pay/raise: Dec 31 and first-payday rows link to /pay/dates', async ({ page }) => {
    await page.goto('/pay/raise');
    for (const id of ['dec31-payday', 'first-payday']) {
      const row = page.locator(`section#key-dates [data-testid="key-date-row"][data-id="${id}"]`);
      await expect(row.getByRole('link', { name: 'See all 2027 paydays →' }), id).toHaveAttribute('href', '/pay/dates');
    }
  });
});

test.describe('retiree COLA timing in rendered HTML', () => {
  const PAGES = ['/pay/raise', '/pay/dates', '/pay', '/pay/e5', '/pay/o6', '/', '/calculators/retirement'];
  for (const path of PAGES) {
    test(`${path}: no "first paid in January 2027"`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html.length).toBeGreaterThan(1000); // non-empty control
      expect(html).not.toMatch(/first paid (in )?(the )?January 2027/i);
    });
  }

  test('/pay/raise shows the corrected COLA timing (FAQ + calendar)', async ({ page }) => {
    await page.goto('/pay/raise');
    const sentence =
      'It takes effect December 1, 2026 and first appears in the December 2026 retired pay, paid December 31, 2026 (SBP annuitants: January 4, 2027).';
    await expect(page.locator('[data-faq-question="Do military retirees get the 2027 pay raise?"]')).toContainText(sentence);
    await expect(page.locator('[data-testid="key-date-row"][data-id="retiree-cola"]')).toContainText(
      'Tuesday, December 1, 2026 (first in the December 31, 2026 retired pay)',
    );
  });
});
