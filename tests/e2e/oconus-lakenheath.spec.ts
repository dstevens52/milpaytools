import { test, expect } from '@playwright/test';

// v2 OCONUS station #2 — one combined page for RAF Lakenheath and RAF
// Mildenhall (one DTMO locality, GB352; one housing office).
// /bah/raf-mildenhall 301-redirects here.

const PAGE = '/bah/raf-lakenheath';
const H1 = 'RAF Lakenheath & RAF Mildenhall OHA, COLA & PCS Housing Guide';

test.describe('OCONUS v2 — RAF Lakenheath & RAF Mildenhall', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
  });

  test('H1 and rendered title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(H1);
    await expect(page).toHaveTitle("Lakenheath & Mildenhall BAH? It's OHA | MilPayTools");
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBe(
      'Lakenheath & Mildenhall, United Kingdom: eligible members renting privately generally get OHA, not BAH. How OHA and COLA work, with official DTMO lookups.',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/bah\/raf-lakenheath$/);
  });

  test('"Last reviewed October 2026" and the GB352 code', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('Last reviewed October 2026');
    await expect(main).toContainText('GB352');
    await expect(main).toContainText('(GB352 for RAF Lakenheath & RAF Mildenhall)');
  });

  test('eligibility source is FMR Chapter 26, with no command sponsorship source', async ({ page }) => {
    const explainer = page.locator('section[aria-labelledby="oconus-explainer"]');
    await expect(explainer).toContainText('depends on your situation');
    await expect(explainer.getByRole('link', { name: 'DoD FMR Volume 7A, Chapter 26 (Housing Allowances)' })).toHaveAttribute(
      'href',
      'https://comptroller.war.gov/Portals/45/documents/fmr/current/07a/07a_26.pdf',
    );
    await expect(explainer.locator('[data-command-sponsorship-source]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('Rheinland-Pfalz');
  });

  test('"Other overseas stations" links to the other v2 stations', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Other overseas stations' })).toBeVisible();
    const slugs = await page
      .locator('[data-related-station]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-related-station')));
    expect(slugs).toEqual(['ramstein-air-base', 'yokota-air-base', 'kadena-air-base', 'camp-humphreys']);
    await expect(page.locator('[data-related-station="ramstein-air-base"]')).toHaveAttribute('href', '/bah/ramstein-air-base');
  });

  test('"What to do next" shows exactly three links, in order', async ({ page }) => {
    const links = page.locator('[data-next-link]');
    await expect(links).toHaveCount(3);
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(hrefs).toEqual(['/pay', '/calculators/tsp', '/calculators/retirement']);
  });

  test('station sections render the verified data', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('Suffolk, England, United Kingdom');
    await expect(main).toContainText('United Kingdom – Lakenheath/Mildenhall (Honington, Wattisham, Marham), GB352');
    await expect(main).toContainText('USAFE Form 435');
    await expect(main).not.toContainText('Co-located installations');
    await expect(main).not.toContainText('Rental Partnership Program');
    const officialLinks = await main
      .locator('section', { hasText: 'Living near RAF Lakenheath' })
      .locator('ul a')
      .evaluateAll((els) => els.map((e) => `${e.textContent} -> ${e.getAttribute('href')}`));
    expect(officialLinks).toEqual([
      'Tri-Base housing office (Military OneSource) -> https://installations.militaryonesource.mil/military-installation/raf-lakenheath/housing/housing',
      'Military OneSource — RAF Lakenheath -> https://installations.militaryonesource.mil/military-installation/raf-lakenheath',
      'Military OneSource — RAF Mildenhall -> https://installations.militaryonesource.mil/military-installation/raf-mildenhall',
    ]);
    // Dead and retiring sources are gone; the Electrical source is kept out of Sources.
    const html = await page.content();
    expect(html).not.toContain('lakenheath.af.mil/About-Us');
    expect(html).not.toContain('housing.af.mil/Units/RAF-Lakenheath');
    const sources = main.locator('section', { hasText: 'Last reviewed' });
    await expect(sources.locator('a[href*="housing.af.mil"]')).toHaveCount(0);
  });

  test('"Before you move" lead words are bold', async ({ page }) => {
    const leads = await page
      .locator('#before-you-move li strong')
      .evaluateAll((els) => els.map((e) => e.textContent));
    expect(leads).toEqual(['Driving.', 'Vehicles.', 'Base housing.', 'Electrical.', 'Exchange rate.']);
  });

  test('contains no BAH-rate, MHA, or currency text', async ({ page }) => {
    const text = (await page.locator('main').innerText()).trim();
    expect(text.length).toBeGreaterThan(500); // an empty page would pass every check below
    for (const banned of ['2027 BAH rates', 'Military Housing Area', 'TODO-DAN']) {
      expect(text, `found "${banned}"`).not.toContain(banned);
    }
    expect(text, 'found £ followed by a digit').not.toMatch(/£\s?\d/);
    expect(text, 'found $ followed by a digit').not.toMatch(/\$\s?\d/);
  });
});

test.describe('RAF Mildenhall slug', () => {
  test('/bah/raf-mildenhall is a 301 redirect to /bah/raf-lakenheath', async ({ request }) => {
    const res = await request.get('/bah/raf-mildenhall', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe('/bah/raf-lakenheath');
  });

  test('sitemap lists raf-lakenheath, not raf-mildenhall', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain('/bah/ramstein-air-base</loc>'); // control: the sitemap has station URLs
    expect(xml).toContain('/bah/raf-lakenheath</loc>');
    expect(xml).not.toContain('raf-mildenhall');
  });
});
