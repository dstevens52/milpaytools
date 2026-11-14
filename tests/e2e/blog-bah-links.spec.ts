import { test, expect } from '@playwright/test';

// Hand-placed contextual station links in BAH blog posts (internal-linking v2,
// approved table). Each approved link must render exactly once in the article
// body, and no station link may sit inside a heading.
const APPROVED: Record<string, string[]> = {
  'the-47000-gap-bah-duty-station': [
    'fort-sill', 'fort-hood', 'fort-campbell', 'joint-base-lewis-mcchord',
    'joint-base-pearl-harbor-hickam', 'naval-station-san-diego',
  ],
  'what-is-bah-military-housing-allowance': [
    'fort-sill', 'fort-bragg', 'camp-pendleton', 'fort-polk', 'joint-base-lewis-mcchord', 'fort-hood',
  ],
  'best-worst-bah-duty-stations-2026': [
    'camp-lejeune', 'hanscom-afb', 'joint-base-pearl-harbor-hickam', 'schofield-barracks',
    'presidio-of-monterey', 'naval-postgraduate-school',
  ],
  'what-civilian-salary-do-i-need': ['joint-base-san-antonio', 'fort-bragg'],
  'bah-rates-2026-complete-guide': ['fort-polk', 'vance-afb'],
  'ppm-dity-move-worth-it': ['fort-campbell', 'joint-base-lewis-mcchord'],
  'can-i-use-va-loan-again': ['fort-bragg', 'fort-hood', 'joint-base-lewis-mcchord'],
  'dual-military-bah-rules': ['fort-bragg', 'joint-base-lewis-mcchord'],
  'are-you-financially-ready-to-leave-the-military': ['joint-base-san-antonio'],
};

for (const [post, slugs] of Object.entries(APPROVED)) {
  test(`${post}: approved station links render once, none in headings`, async ({ page }) => {
    await page.goto(`/blog/${post}`);
    const article = page.locator('article');
    for (const slug of slugs) {
      await expect(article.locator(`a[href="/bah/${slug}"]`), `${post} → /bah/${slug}`).toHaveCount(1);
    }
    await expect(article.locator('h1 a[href^="/bah/"], h2 a[href^="/bah/"], h3 a[href^="/bah/"], h4 a[href^="/bah/"]')).toHaveCount(0);
  });
}
