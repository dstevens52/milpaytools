import { test, expect, type Page } from '@playwright/test';

// P1 #1 (docs/perf/p1-step1-report.md): desktop-only hero images (1.4–1.7 MB PNGs) must never
// download on phones, nor on other pages through Next's link prefetch of their page (React used to
// preload every server-rendered <img>, and the hint rode along in the prefetch). On desktop they
// load as optimized images from /_next/image. See src/components/DesktopHeroImage.tsx.
//
// Prefetching only happens in production builds, so the prefetch cases are meaningful in CI
// (`next start`); under `next dev` they pass trivially.

const HEROES = [
  { page: '/calculators/total-compensation', file: 'desk-soldier.png', linkFrom: '/bah/fort-bragg' },
  { page: '/guides/starting-service', file: 'young-soldier.png', linkFrom: '/' },
];

function recordImage(page: Page, file: string) {
  const hits: string[] = [];
  page.on('request', (r) => {
    if (decodeURIComponent(r.url()).includes(file)) hits.push(r.url());
  });
  return hits;
}

/** Bring every link on the page into view (triggers viewport prefetches), then let the network settle. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1_000);
}

for (const { page: path, file, linkFrom } of HEROES) {
  test.describe(`${path} hero image (${file})`, () => {
    test('server HTML has no image preload for it', async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).toContain(file); // control: the <source> is in the page
      const esc = file.replace('.', '\\.');
      expect(html).not.toMatch(new RegExp(`<link[^>]*rel="preload"[^>]*${esc}|<link[^>]*${esc}[^>]*rel="preload"`));
      expect(html).not.toMatch(new RegExp(`HL\\[\\\\?"[^\\]]*${esc}`));
    });

    test.describe('phone width', () => {
      test.use({ viewport: { width: 390, height: 844 } });

      test('not downloaded on the page itself', async ({ page }) => {
        const hits = recordImage(page, file);
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await scrollThrough(page);
        expect(hits).toEqual([]);
      });

      test(`not downloaded by ${linkFrom}, which links to the page`, async ({ page }) => {
        const hits = recordImage(page, file);
        await page.goto(linkFrom);
        // control: the page links here, so a prefetch of it is possible
        await expect(page.locator(`a[href^="${path}"]`).first()).toBeAttached();
        await scrollThrough(page);
        expect(hits).toEqual([]);
      });
    });

    test.describe('desktop width', () => {
      test.use({ viewport: { width: 1280, height: 800 } });

      test('loads once, optimized, and renders', async ({ page }) => {
        const hits = recordImage(page, file);
        await page.goto(path);
        const img = page.locator('section picture img').first();
        await expect(img).toBeVisible();
        await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth)).toBeGreaterThan(600);
        const current = await img.evaluate((e: HTMLImageElement) => e.currentSrc);
        expect(current).toContain(`/_next/image?url=%2Fimages%2F${file}`);
        expect(hits.filter((h) => !h.includes('/_next/image'))).toEqual([]); // never the raw PNG
      });

      test(`not downloaded by prefetch from ${linkFrom}`, async ({ page }) => {
        const hits = recordImage(page, file);
        await page.goto(linkFrom);
        await expect(page.locator(`a[href^="${path}"]`).first()).toBeAttached();
        await scrollThrough(page);
        expect(hits).toEqual([]);
      });
    });
  });
}
