import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { GUIDE_SLUGS } from '@/data/guides/pages';
import { gluedTextAt } from './helpers/glued-text';

// Build 10b: the V1 missing-space check (va-loan.spec.ts), run on one page per page
// type. Same regexes and exceptions (./helpers/glued-text.ts). Each page is read in
// its default state, after hydration, with every <details> opened.
//
// The lists come from the repo, so a new calculator, guide or post is checked
// without editing this file:
//   - every calculator: the route directories under src/app/calculators/;
//   - every guide: GUIDE_SLUGS (src/data/guides/pages.ts, the sitemap's list);
//   - every blog post: the MDX files in src/content/blog/;
//   - one BAH station page (Fort Hood; Fort Bragg has a dev-server-only JSON flake);
//   - one /pay/[rank] page;
//   - /bah, /bah/changes, /pay/raise, /transition and the home page.

const ROOT = process.cwd();

const CALCULATORS = fs
  .readdirSync(path.join(ROOT, 'src', 'app', 'calculators'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !/^[[_(]/.test(d.name))
  .map((d) => `/calculators/${d.name}`)
  .sort();

const GUIDES = GUIDE_SLUGS.map((s) => `/guides/${s}`);

const POSTS = fs
  .readdirSync(path.join(ROOT, 'src', 'content', 'blog'))
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => `/blog/${f.replace(/\.mdx$/, '')}`)
  .sort();

const ONE_OF_EACH = ['/bah/fort-hood', '/pay/e5', '/bah', '/bah/changes', '/pay/raise', '/transition', '/'];

const GROUPS: [string, string[]][] = [
  ['calculators', CALCULATORS],
  ['guides', GUIDES],
  ['blog posts', POSTS],
  ['other page types', ONE_OF_EACH],
];

test.describe('Rendered text has no missing spaces (every page type)', () => {
  test.describe.configure({ timeout: 90_000 });

  // An empty list is evidence of nothing (CLAUDE.md): fail if a scan found no pages.
  test('the page lists are not empty', () => {
    expect(CALCULATORS.length).toBeGreaterThanOrEqual(16);
    expect(GUIDES.length).toBeGreaterThanOrEqual(8);
    // 55 since S7 (Nov 2026) merged seven near-duplicate posts into their pairs.
    expect(POSTS.length).toBeGreaterThanOrEqual(55);
  });

  for (const [group, paths] of GROUPS) {
    test.describe(group, () => {
      for (const p of paths) {
        test(p, async ({ page }) => {
          expect(await gluedTextAt(page, p)).toEqual([]);
        });
      }
    });
  }
});
