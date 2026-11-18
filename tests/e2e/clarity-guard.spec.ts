import { test, expect, type Page } from '@playwright/test';
import { CLARITY_LOADER_JS, CLARITY_PROJECT_ID } from '../../src/lib/analytics';

// Microsoft Clarity loads only for real visitors on the production host.
//
// The loader (CLARITY_LOADER_JS, rendered by layout.tsx behind the
// NEXT_PUBLIC_VERCEL_ENV === 'production' server guard) returns early on any
// other host, when the opt-out flag is set, and in automated browsers
// (navigator.webdriver, which every Playwright browser sets).
//
// Nothing here reaches Clarity: every request to clarity.ms / c.bing.com is
// recorded and aborted in the browser.

const CLARITY = /clarity\.ms|c\.bing\.com/;
const TAG_URL = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;

/** Record (and abort) every request bound for Clarity. */
async function recordClarity(page: Page) {
  const hits: string[] = [];
  page.on('request', (r) => {
    if (CLARITY.test(r.url())) hits.push(r.url());
  });
  await page.route(CLARITY, (route) => route.abort());
  return hits;
}

const clarityGlobal = (page: Page) =>
  page.evaluate(() => typeof (window as unknown as { clarity?: unknown }).clarity);

test.describe('loader logic (the exact string layout.tsx renders)', () => {
  // Each case serves a stub page that runs CLARITY_LOADER_JS at a real hostname.
  // Playwright answers every request to that origin in the browser, so nothing
  // reaches production or a preview, but location.hostname is the real one.
  async function runLoader(
    page: Page,
    origin: string,
    opts: { webdriver: boolean; optOutKey?: string },
  ) {
    const hits = await recordClarity(page);
    await page.route(`${origin}/**`, (route) =>
      route.request().url() === `${origin}/__clarity-test`
        ? route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: `<!doctype html><html><head><title>t</title></head><body><script>${CLARITY_LOADER_JS}</script></body></html>`,
          })
        : route.fulfill({ status: 404, body: '' }),
    );
    await page.addInitScript(({ webdriver, optOutKey }) => {
      if (!webdriver) Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true });
      if (optOutKey) localStorage.setItem(optOutKey, 'true');
    }, opts);
    await page.goto(`${origin}/__clarity-test`);
    // The override must have taken, or the "loads" cases would prove nothing.
    expect(await page.evaluate(() => navigator.webdriver)).toBe(opts.webdriver);
    return hits;
  }

  for (const origin of ['https://www.milpaytools.com', 'https://milpaytools.com']) {
    test(`${origin}, real visitor: loads Clarity once`, async ({ page }) => {
      const hits = await runLoader(page, origin, { webdriver: false });
      await expect.poll(() => hits).toEqual([TAG_URL]);
      expect(await clarityGlobal(page)).toBe('function');
      await page.waitForTimeout(500);
      expect(hits).toEqual([TAG_URL]); // the tag was aborted, so nothing follows it
    });
  }

  const skipped: { name: string; origin: string; webdriver: boolean; optOutKey?: string }[] = [
    { name: 'production, opt-out flag set', origin: 'https://www.milpaytools.com', webdriver: false, optOutKey: 'milpaytools_disable_analytics' },
    { name: 'production, legacy opt-out flag set', origin: 'https://www.milpaytools.com', webdriver: false, optOutKey: 'milpaytools_internal' },
    { name: 'production, automated browser', origin: 'https://www.milpaytools.com', webdriver: true },
    { name: 'Vercel preview host', origin: 'https://milpaytools-git-fix-clarity-guard-dstevens52.vercel.app', webdriver: false },
    { name: 'localhost', origin: 'http://localhost:3000', webdriver: false },
  ];
  for (const c of skipped) {
    test(`${c.name}: no Clarity`, async ({ page }) => {
      const hits = await runLoader(page, c.origin, c);
      // The loader is a synchronous inline script, so by `load` it has returned.
      expect(await clarityGlobal(page)).toBe('undefined');
      await page.waitForTimeout(500);
      expect(hits).toEqual([]);
    });
  }
});

test.describe('real pages: no Clarity under Playwright', () => {
  // Locally the loader isn't rendered at all (no NEXT_PUBLIC_VERCEL_ENV); under
  // test:e2e:live it's rendered and must skip itself (navigator.webdriver).
  for (const path of ['/', '/bah/fort-bragg', '/calculators/va-disability']) {
    test(`${path}: no request to Clarity`, async ({ page }) => {
      const hits = await recordClarity(page);
      await page.goto(path);
      await page.waitForTimeout(3000); // lazyOnload runs after `load`, when the browser is idle
      expect(hits).toEqual([]);
      expect(await clarityGlobal(page)).toBe('undefined');
      // Where the loader is rendered (production), it must be exactly CLARITY_LOADER_JS.
      const rendered = await page.evaluate(
        () => document.getElementById('microsoft-clarity')?.textContent ?? null,
      );
      if (rendered !== null) expect(rendered).toBe(CLARITY_LOADER_JS);
    });
  }
});
