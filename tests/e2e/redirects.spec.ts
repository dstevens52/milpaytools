import fs from 'fs';
import path from 'path';
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

// S7 / S7b blog cleanup (Nov 2026): near-duplicate posts merged into the URL Google
// already shows (or, in S7b, a post folded into the calculator that answers it), each
// old URL a permanent redirect (next.config.ts). This file is the allowlisted home of
// the old slugs, as for the hub URLs above. `to` is the full destination path.
const MERGED_POSTS: { from: string; to: string; build: 'S7' | 'S7b' }[] = [
  { from: 'les-abbreviations-explained', to: '/blog/how-to-read-your-les', build: 'S7' },
  { from: 'how-deployment-pay-works', to: '/blog/deployment-pay-explained', build: 'S7' },
  { from: 'brs-vs-high-3-retirement', to: '/blog/brs-vs-high-3-difference', build: 'S7' },
  { from: 'gi-bill-vs-tuition-assistance', to: '/blog/tuition-assistance-and-gi-bill-together', build: 'S7' },
  { from: 'sgli-vgli-private-life-insurance', to: '/blog/is-sgli-enough-life-insurance', build: 'S7' },
  { from: 'what-is-scra-military-protection', to: '/blog/scra-mla-protections-new-service-members', build: 'S7' },
  { from: 'pcs-out-of-pocket-costs', to: '/blog/pcs-financial-planning-guide', build: 'S7' },
  { from: 'deployment-financial-planning', to: '/blog/deployment-pay-explained', build: 'S7b' },
  { from: 'gi-bill-housing-allowance-zip-code', to: '/blog/post-911-gi-bill-explained-2026', build: 'S7b' },
  { from: 'are-you-financially-ready-to-leave-the-military', to: '/calculators/transition-readiness', build: 'S7b' },
];

test.describe('S7: merged blog posts redirect to the kept page', () => {
  test('the list has both builds (control)', () => {
    expect(MERGED_POSTS.filter((m) => m.build === 'S7')).toHaveLength(7);
    expect(MERGED_POSTS.filter((m) => m.build === 'S7b')).toHaveLength(3);
  });

  for (const { from, to } of MERGED_POSTS) {
    test(`/blog/${from} → ${to} is a 308 permanent redirect`, async ({ request }) => {
      const res = await request.get(`/blog/${from}`, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(to);
    });
  }

  test('sitemap lists every kept page and none of the redirected posts', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain('/blog/tricare-costs-2026-vs-civilian</loc>'); // control: the sitemap has blog URLs
    for (const { from, to } of MERGED_POSTS) {
      expect(xml, to).toContain(`${to}</loc>`);
      expect(xml, from).not.toContain(`/blog/${from}<`);
    }
  });
});

// Zero-reference rule (CLAUDE.md "Retired URLs"), for the S7 / S7b slugs: outside this
// file and next.config.ts's one redirect line each, nothing in src/, public/ or tests/
// names an old slug (links, POST_FAQS keys, guide cards, llms.txt lines, tests).
// docs/ and the root build reports are records and are not scanned.
test.describe('S7: zero references to the redirected slugs', () => {
  const ROOT = process.cwd();
  const SELF = path.join('tests', 'e2e', 'redirects.spec.ts');
  const walk = (dir: string): string[] =>
    fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((d) => {
      const rel = path.join(dir, d.name);
      if (d.isDirectory()) return walk(rel);
      return /\.(tsx?|mdx?|txt|json|mjs|js|css)$/.test(d.name) ? [rel] : [];
    });

  test('src/, public/ and tests/ never name an old slug', () => {
    const files = ['src', 'public', 'tests'].flatMap(walk).filter((f) => f !== SELF);
    // An empty scan is evidence of nothing: the control slug must be found.
    expect(files.length).toBeGreaterThan(200);
    const texts = files.map((f) => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')] as const);
    expect(texts.some(([, t]) => t.includes('/blog/how-to-read-your-les')), 'control').toBe(true);
    const hits: string[] = [];
    for (const { from } of MERGED_POSTS) {
      const re = new RegExp(`\\b${from}\\b`);
      for (const [f, t] of texts) if (re.test(t)) hits.push(`${f}: ${from}`);
    }
    expect(hits).toEqual([]);
  });

  test('next.config.ts names each old slug once, in its redirect', () => {
    const cfg = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
    for (const { from, to } of MERGED_POSTS) {
      expect(cfg.split(from).length - 1, from).toBe(1);
      expect(cfg).toContain(`{ source: '/blog/${from}', destination: '${to}', permanent: true }`);
    }
  });

  test('the redirected posts are gone from src/content/blog', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/content/blog/how-to-read-your-les.mdx'))).toBe(true); // control
    for (const { from } of MERGED_POSTS) {
      expect(fs.existsSync(path.join(ROOT, `src/content/blog/${from}.mdx`)), from).toBe(false);
    }
  });
});
