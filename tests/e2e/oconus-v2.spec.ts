import { test, expect } from '@playwright/test';
import { ramstein } from '../../src/data/oconus/ramstein';

// v2 OCONUS station template — Ramstein reference migration.
//
// Ramstein is unpublished until Dan verifies its data, so the v2 page renders
// only on a server started with OCONUS_V2_PREVIEW=1 (the local Playwright
// webServer sets it). Against the live site it still serves the legacy page,
// so the v2 checks are skipped there until `published: true`.

const RAMSTEIN = '/bah/ramstein-air-base';
const H1 = 'Ramstein Air Base OHA, COLA & PCS Housing Guide';
const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
const v2Expected = ramstein.published || isLocal;

test.describe('OCONUS v2 — Ramstein Air Base', () => {
  test.skip(!v2Expected, 'Ramstein v2 is unpublished; live site still serves the legacy page');

  test.beforeEach(async ({ page }) => {
    await page.goto(RAMSTEIN);
    const h1 = await page.locator('h1').first().textContent();
    expect(
      h1,
      'Ramstein rendered the legacy template — is a reused dev server running without OCONUS_V2_PREVIEW=1?',
    ).toBe(H1);
  });

  test('H1 is the v2 guide heading', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(H1);
  });

  test('title and meta description follow the v2 pattern', async ({ page }) => {
    await expect(page).toHaveTitle("Ramstein AB BAH? It's OHA — Housing & COLA Guide | MilPayTools");
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('Ramstein Air Base, Germany:');
    expect(desc!.length).toBeLessThanOrEqual(155);
  });

  test('emits Article, BreadcrumbList, and FAQPage schema', async ({ page }) => {
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent || '{}')));
    expect(blocks.length).toBeGreaterThan(0);
    const byType = Object.fromEntries(blocks.map((b) => [b['@type'], b]));
    expect(byType.Article?.headline).toBe("Ramstein AB BAH? It's OHA — Housing & COLA Guide");
    expect(byType.BreadcrumbList).toBeTruthy();
    const questions = byType.FAQPage?.mainEntity?.map((q: { name: string }) => q.name);
    expect(questions).toEqual([
      'Do members at Ramstein Air Base receive BAH?',
      'How does OHA work?',
      'How often do OHA and OCONUS COLA change?',
    ]);
    // Every FAQ answer must be text that is visible on the page.
    const main = await page.locator('main').innerText();
    const flat = (t: string) => t.replace(/\s+/g, ' ');
    for (const q of byType.FAQPage.mainEntity) {
      const firstSentence = q.acceptedAnswer.text.split('. ')[0];
      expect(flat(main)).toContain(flat(firstSentence));
    }
  });

  test('contains the eligibility qualifier and "Last reviewed"', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('depends on your situation');
    await expect(main).toContainText('Last reviewed');
  });

  test('contains no BAH-rate, VA loan, CONUS COLA, MHA, or currency text', async ({ page }) => {
    const text = (await page.locator('main').innerText()).trim();
    expect(text.length).toBeGreaterThan(500); // an empty page would pass every check below
    // Word-boundary match: "CONUS COLA" must not hit the legitimate "OCONUS COLA".
    for (const banned of ['2027 BAH rates', 'VA loan', 'CONUS COLA', 'Military Housing Area']) {
      expect(text, `found "${banned}"`).not.toMatch(new RegExp(`\\b${banned}\\b`, 'i'));
    }
    expect(text, 'found €').not.toContain('€');
    expect(text, 'found $ followed by a digit').not.toMatch(/\$\s?\d/);
  });

  test('"Other overseas stations" links only to OCONUS slugs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Other overseas stations' })).toBeVisible();
    const links = page.locator('[data-related-station]');
    const slugs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('data-related-station')));
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs.sort()).toEqual(['camp-humphreys', 'kadena-air-base', 'yokota-air-base']);
  });

  test('no in-page signup — the footer signup is the only one', async ({ page }) => {
    await expect(page.locator('main input[type="email"]')).toHaveCount(0);
    await expect(page.locator('footer input[type="email"]')).toHaveCount(1);
  });

  test('OCONUS disclaimer replaces the BAH/MHA disclaimer', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('MilPayTools does not display these rates');
    await expect(main).not.toContainText('DTMO 2026 BAH data');
  });
});

// Unchanged pages — snapshot H1 + title. Expected values captured from
// production (main @ 444c09c) before this branch.
const UNCHANGED: { path: string; h1: string; title: string }[] = [
  { path: '/bah/yokota-air-base', h1: 'Yokota Air Base', title: 'Yokota Air Base BAH & OHA 2026 | MilPayTools' },
  { path: '/bah/kadena-air-base', h1: 'Kadena Air Base', title: 'Kadena Air Base BAH & OHA 2026 | MilPayTools' },
  { path: '/bah/camp-humphreys', h1: 'Camp Humphreys (K-6)', title: 'Camp Humphreys (K-6) BAH & OHA 2026 | MilPayTools' },
  { path: '/bah/fort-bragg', h1: 'Fort Bragg', title: 'Fort Bragg (Fort Liberty) BAH Rates 2026 | MilPayTools' },
  { path: '/bah/fort-hood', h1: 'Fort Hood', title: 'Fort Hood (Fort Cavazos) BAH Rates 2026 | MilPayTools' },
];

test.describe('OCONUS v2 — CONUS and legacy OCONUS pages unchanged', () => {
  for (const p of UNCHANGED) {
    test(`${p.path} keeps its H1 and title`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('h1').first()).toHaveText(p.h1);
      await expect(page).toHaveTitle(p.title);
    });
  }
});
