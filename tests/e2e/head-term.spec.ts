import { test, expect, type Page } from '@playwright/test';
import { waitForHydration } from './helpers/hydration';
import { CALCULATORS } from '../../src/data/calculators';
import { SOCIAL_PROFILES } from '../../src/lib/schema';

/**
 * S8 head-term fixes: sitewide anchor text, homepage title/H1/meta, structured data,
 * /calculators/tsp head. Station, /pay and Nov 11 calculator heads are guarded by
 * their own specs (station-serp*, pay-rank-meta, faq-schema-parity, total-compensation).
 */

const BASE = 'https://www.milpaytools.com';

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  // JSON.parse throws on invalid JSON, which fails the test.
  return blocks.map((b) => JSON.parse(b) as Record<string, unknown>);
}

/** Visible link text → href for a container, in DOM order. */
async function links(page: Page, selector: string) {
  return page.locator(`${selector} a`).evaluateAll((as) =>
    as.map((a) => ({ text: (a.textContent ?? '').trim(), href: a.getAttribute('href') })),
  );
}

test.describe('sitewide anchor text', () => {
  test('desktop nav calculator menu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /Calculators/ }).first();
    await waitForHydration(toggle);
    await toggle.hover(); // the dropdown opens on hover (a click would toggle it shut again)
    const menu = page.locator('header');
    await expect(menu.getByRole('menuitem', { name: 'Military Pay Calculator', exact: true })).toHaveAttribute('href', '/calculators/total-compensation');
    await expect(menu.getByRole('menuitem', { name: 'VA Disability Calculator', exact: true })).toHaveAttribute('href', '/calculators/va-disability');
    await expect(menu).not.toContainText('Total Military Compensation');
    await expect(menu).not.toContainText('VA Disability Rating');
  });

  test('mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle navigation' });
    await waitForHydration(toggle);
    await toggle.click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    // Expand the calculators group if it's collapsed.
    const group = menu.getByRole('button', { name: /Calculators/ }).first();
    if (await group.count()) await group.click();
    await expect(menu.getByRole('link', { name: 'Military Pay Calculator', exact: true })).toHaveAttribute('href', '/calculators/total-compensation');
    await expect(menu.getByRole('link', { name: 'VA Disability Calculator', exact: true })).toHaveAttribute('href', '/calculators/va-disability');
  });

  test('footer calculator links (snapshot)', async ({ page }) => {
    await page.goto('/');
    const all = await links(page, 'footer');
    const calcLinks = all.filter((l) => l.href === '/calculators/total-compensation' || l.href === '/calculators/va-disability');
    expect(calcLinks).toEqual([
      { text: 'Military Pay Calculator', href: '/calculators/total-compensation' },
      { text: 'VA Disability Calculator', href: '/calculators/va-disability' },
    ]);
  });
});

test.describe('homepage', () => {
  test('title, H1, tagline and meta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('MilPayTools: Military Pay, BAH & VA Benefits Calculators');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Military pay and benefits calculators');
    await expect(page.getByTestId('home-tagline')).toHaveText('Know Your Worth.');
    await expect(page.getByTestId('home-tagline')).toBeVisible();
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeLessThanOrEqual(155);
    expect(desc).not.toMatch(/\d/); // no figures
  });

  test('first in-body link to the total compensation calculator says "military pay calculator"', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('main a[href="/calculators/total-compensation"]').first();
    await expect(first).toHaveText('military pay calculator');
  });

  test('Organization and WebSite JSON-LD', async ({ page }) => {
    await page.goto('/');
    const blocks = await jsonLd(page);
    const org = blocks.find((b) => b['@type'] === 'Organization');
    const site = blocks.find((b) => b['@type'] === 'WebSite');
    expect(org).toMatchObject({ '@context': 'https://schema.org', name: 'MilPayTools', url: BASE, logo: `${BASE}/images/logo-shield.svg` });
    expect(org!.sameAs).toEqual([...SOCIAL_PROFILES]);
    expect(SOCIAL_PROFILES.length).toBeGreaterThan(0);
    expect(site).toMatchObject({ '@context': 'https://schema.org', name: 'MilPayTools', url: BASE });
  });
});

test.describe('/calculators', () => {
  test('ItemList of every calculator (name + url), valid JSON', async ({ page }) => {
    await page.goto('/calculators');
    const list = (await jsonLd(page)).find((b) => b['@type'] === 'ItemList') as
      | { itemListElement: { position: number; name: string; url: string }[] }
      | undefined;
    expect(list).toBeTruthy();
    const items = list!.itemListElement;
    expect(items.length).toBe(CALCULATORS.length);
    expect(items.map((i) => i.position)).toEqual(items.map((_, i) => i + 1));
    expect(new Set(items.map((i) => i.url))).toEqual(new Set(CALCULATORS.map((c) => `${BASE}${c.href}`)));
    for (const i of items) expect(i.name, i.url).toBe(CALCULATORS.find((c) => `${BASE}${c.href}` === i.url)!.name);
  });
});

test.describe('/calculators/tsp', () => {
  test('title ≤ 60, meta ≤ 160, H1 + subheading', async ({ page }) => {
    await page.goto('/calculators/tsp');
    const title = await page.title();
    expect(title).toBe('Military TSP Calculator 2026: BRS Match, Roth vs Traditional');
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(desc).toBe(
      'Project your TSP balance with BRS matching, Roth vs Traditional and your fund mix. 2026 and 2027 contribution limits. Free, no account.',
    );
    expect(desc.length).toBeLessThanOrEqual(160);
    await expect(page.locator('h1')).toHaveText('Military TSP Calculator');
    await expect(page.getByText('Your TSP could be worth more than you think — run the numbers.')).toBeVisible();
    // The meta's "2026 and 2027" claim: the page shows both years' limits.
    await expect(page.getByRole('heading', { name: 'TSP Contribution Limits: 2026 and 2027' })).toBeVisible();
  });
});
