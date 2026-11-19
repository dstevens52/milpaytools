import { test, expect, type Page } from '@playwright/test';

// P1 #1 (docs/perf/p1-step1-report.md): the total-compensation hero image (desk-soldier.png,
// 1.73 MB as a PNG) is desktop-only. It must never download on phones, nor on other pages
// through Next's link prefetch of /calculators/total-compensation (React used to preload every
// server-rendered <img>, and the hint rode along in the prefetch). On desktop it loads as an
// optimized image from /_next/image. See src/components/DesktopHeroImage.tsx.
//
// Prefetching only happens in production builds, so the prefetch cases are meaningful in CI
// (`next start`); under `next dev` they pass trivially.

const HERO = /desk-soldier/;

function recordHero(page: Page) {
  const hits: string[] = [];
  page.on('request', (r) => {
    if (HERO.test(decodeURIComponent(r.url()))) hits.push(r.url());
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

test.describe('total-compensation hero image', () => {
  test('server HTML has no image preload for it', async ({ request }) => {
    const html = await (await request.get('/calculators/total-compensation')).text();
    expect(html).toContain('desk-soldier'); // control: the <source> is in the page
    expect(html).not.toMatch(/<link[^>]*rel="preload"[^>]*desk-soldier|<link[^>]*desk-soldier[^>]*rel="preload"/);
    expect(html).not.toMatch(/HL\[\\?"[^\]]*desk-soldier/);
  });

  test.describe('phone width', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('not downloaded on the page itself', async ({ page }) => {
      const hits = recordHero(page);
      await page.goto('/calculators/total-compensation');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await scrollThrough(page);
      expect(hits).toEqual([]);
    });

    test('not downloaded by a station page that links to the calculator', async ({ page }) => {
      const hits = recordHero(page);
      await page.goto('/bah/fort-bragg');
      // control: the page links to the calculator, so a prefetch of it is possible
      await expect(page.locator('a[href^="/calculators/total-compensation"]').first()).toBeAttached();
      await scrollThrough(page);
      expect(hits).toEqual([]);
    });
  });

  test.describe('desktop width', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('loads once, optimized, and renders', async ({ page }) => {
      const hits = recordHero(page);
      await page.goto('/calculators/total-compensation');
      const img = page.locator('section picture img').first();
      await expect(img).toBeVisible();
      await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth)).toBeGreaterThan(600);
      const current = await img.evaluate((e: HTMLImageElement) => e.currentSrc);
      expect(current).toContain('/_next/image?url=%2Fimages%2Fdesk-soldier.png');
      expect(hits.filter((h) => !h.includes('/_next/image'))).toEqual([]); // never the raw PNG
    });

    test('not downloaded by prefetch from another page', async ({ page }) => {
      const hits = recordHero(page);
      await page.goto('/bah/fort-bragg');
      await expect(page.locator('a[href^="/calculators/total-compensation"]').first()).toBeAttached();
      await scrollThrough(page);
      expect(hits).toEqual([]);
    });
  });
});
