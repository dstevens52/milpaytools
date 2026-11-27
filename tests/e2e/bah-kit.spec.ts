import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { OCONUS_V2_STATIONS } from '../../src/data/oconus';
import { BAH_YEAR } from '../../src/data/bah/current';
import { SERP_TEST_MODE } from '../../src/data/bah/serpTest';
import { bahKitData } from '../../src/lib/bahKit';
import { waitForHydration } from './helpers/hydration';

/**
 * BAH kit pages (build W3, /bah/kit/[slug]), served. The sentence figures are
 * checked against the data in bah-kit-unit.spec.ts; here: every CONUS kit page
 * answers 200 with noindex, overseas slugs 404, kit pages stay out of the
 * sitemap and llms.txt, the Copy buttons copy the generator's text, the image
 * download works, the events fire, and the station pages' heads are unchanged.
 */

const CONUS = DUTY_STATIONS.filter((s) => !s.oconus);
const ROBOTS = /<meta name="robots" content="noindex, follow"\s*\/?>/;

test.describe('Kit pages: status, robots and exclusions', () => {
  test('every CONUS kit page: 200, noindex/follow, H1 with the BAH year', async ({ request }) => {
    test.setTimeout(600_000);
    expect(CONUS.length).toBeGreaterThan(100);
    for (const s of CONUS) {
      const res = await request.get(`/bah/kit/${s.slug}`);
      expect(res.status(), s.slug).toBe(200);
      const html = await res.text();
      expect(html, s.slug).toMatch(ROBOTS);
      expect(html, s.slug).toContain(`BAH ${BAH_YEAR} kit</h1>`);
    }
  });

  test('overseas and unknown slugs 404', async ({ request }) => {
    const overseas = [...new Set([...OCONUS_V2_STATIONS.map((s) => s.slug), ...DUTY_STATIONS.filter((s) => s.oconus).map((s) => s.slug)])];
    expect(overseas.length).toBeGreaterThan(0);
    for (const slug of [...overseas, 'not-a-station']) {
      expect((await request.get(`/bah/kit/${slug}`)).status(), slug).toBe(404);
    }
  });

  test('kit pages are not in the sitemap or llms.txt', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('/bah/fort-bragg</loc>'); // control: the station pages are listed
    expect(sitemap).not.toContain('/bah/kit');
    const llms = readFileSync(path.join(__dirname, '..', '..', 'public', 'llms.txt'), 'utf8');
    expect(llms).toContain('/bah/'); // control
    expect(llms).not.toContain('/bah/kit');
    const served = await (await request.get('/llms.txt')).text();
    expect(served).toContain('/bah/');
    expect(served).not.toContain('/bah/kit');
  });

  test('station pages do not link to kit pages', async ({ request }) => {
    const html = await (await request.get('/bah/fort-bragg')).text();
    expect(html).toContain('/bah/camp-lejeune'); // control: nearby links render (Fort Bragg's nearby list)
    expect(html).not.toContain('/bah/kit');
  });
});

test.describe('Station pages unchanged (title test runs to Dec 9)', () => {
  const baseline = JSON.parse(readFileSync(path.join(__dirname, 'fixtures', 'station-head-kit-baseline.json'), 'utf8')) as {
    bahYear: string;
    serpTestMode: string;
    pages: Record<string, { title: string; description: string; h1: string }>;
  };
  const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

  for (const [slug, want] of Object.entries(baseline.pages)) {
    test(`${slug}: title, description and H1 match the pre-W3 production capture`, async ({ request }) => {
      // The capture is for one BAH year and title-test mode; both change those heads on purpose.
      test.skip(baseline.bahYear !== BAH_YEAR || baseline.serpTestMode !== SERP_TEST_MODE, 'baseline is for another BAH year or SERP_TEST_MODE');
      const html = await (await request.get(`/bah/${slug}`)).text();
      expect(decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '')).toBe(want.title);
      expect(decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '')).toBe(want.description);
      expect(decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ''))).toBe(want.h1);
    });
  }
});

type GaCall = [string, string, Record<string, string>];

/** Records gtag calls and clipboard writes in the browser (no real GA, works in every browser). */
async function instrument(page: Page, opts: { optedOut?: boolean } = {}) {
  const calls: GaCall[] = [];
  const copied: string[] = [];
  await page.exposeFunction('__recordGa', (args: GaCall) => void calls.push(args));
  await page.exposeFunction('__recordCopy', (text: string) => void copied.push(text));
  await page.addInitScript((optedOut: boolean) => {
    if (optedOut) localStorage.setItem('milpaytools_disable_analytics', 'true');
    const w = window as unknown as { gtag: (...a: unknown[]) => void; __recordGa: (a: unknown[]) => void; __recordCopy: (t: string) => Promise<void> };
    w.gtag = (...a: unknown[]) => w.__recordGa(a);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (t: string) => w.__recordCopy(t) },
    });
  }, !!opts.optedOut);
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
  const events = (name: string) => calls.filter((c) => c[0] === 'event' && c[1] === name).map((c) => c[2]);
  return { calls, copied, events };
}

test.describe('Kit page: copy, download and events', () => {
  test('Fort Bragg: every Copy button writes the generator text; kit_copy per click; one kit_view', async ({ page }) => {
    const kit = bahKitData('fort-bragg')!;
    const rec = await instrument(page);
    await page.goto('/bah/kit/fort-bragg');
    await waitForHydration(page.getByTestId('kit-copy-headline'));

    for (const s of kit.sentences) {
      await expect(page.getByTestId(`kit-sentence-${s.id}-text`)).toHaveText(s.text);
    }
    const clicks: [string, string][] = [
      ...kit.sentences.map((s) => [s.id, s.text] as [string, string]),
      ['all', kit.allText],
      ['html', kit.credit.html],
      ['link', kit.credit.url],
    ];
    for (const [item, text] of clicks) {
      await page.getByTestId(`kit-copy-${item}`).click();
      await expect.poll(() => rec.copied.at(-1), { message: item }).toBe(text);
      await expect(page.getByTestId(`kit-copy-${item}`)).toHaveText('Copied');
    }
    await expect.poll(() => rec.events('kit_copy').length).toBe(clicks.length);
    expect(rec.events('kit_copy')).toEqual(clicks.map(([item]) => ({ item, station: 'fort-bragg', year: BAH_YEAR })));
    expect(rec.events('kit_view')).toEqual([{ station: 'fort-bragg', year: BAH_YEAR }]);
    await expect(page.getByTestId('kit-credit-html')).toHaveText(kit.credit.html);
  });

  test('JB San Antonio (decrease): the protection sentence shows; Copy all includes it', async ({ page }) => {
    const kit = bahKitData('joint-base-san-antonio')!;
    test.skip(!kit.sentences.some((s) => s.id === 'protection'), `no E-5 decrease at JB San Antonio in ${BAH_YEAR}`);
    const rec = await instrument(page);
    await page.goto('/bah/kit/joint-base-san-antonio');
    await waitForHydration(page.getByTestId('kit-copy-all'));
    await expect(page.getByTestId('kit-sentence-protection-text')).toHaveText(kit.sentences.find((s) => s.id === 'protection')!.text);
    await page.getByTestId('kit-copy-all').click();
    await expect.poll(() => rec.copied.at(-1)).toBe(kit.allText);
  });

  test('Download image: portrait PNG as an attachment; kit_image_download fires', async ({ page, request }) => {
    const kit = bahKitData('fort-bragg')!;
    const rec = await instrument(page);
    await page.goto('/bah/kit/fort-bragg');
    const link = page.getByTestId('kit-download');
    await waitForHydration(link);
    await expect(link).toHaveAttribute('href', kit.image.downloadHref);
    await expect(link).toHaveAttribute('download', kit.image.filename);

    const res = await request.get(kit.image.downloadHref);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
    expect(res.headers()['content-disposition']).toBe(`attachment; filename="${kit.image.filename}"`);
    const buf = await res.body();
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([1080, 1350]);

    // The preview image on the page is the same portrait image, without download=1.
    await expect(page.getByTestId('kit-image').locator('img')).toHaveAttribute('src', kit.image.src);

    // Count the click without saving a file.
    await link.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await link.click();
    await expect.poll(() => rec.events('kit_image_download')).toEqual([{ station: 'fort-bragg', year: BAH_YEAR }]);
  });

  test('GA opt-out: no kit events', async ({ page }) => {
    const rec = await instrument(page, { optedOut: true });
    await page.goto('/bah/kit/fort-bragg');
    await waitForHydration(page.getByTestId('kit-copy-headline'));
    await page.getByTestId('kit-copy-headline').click();
    await expect.poll(() => rec.copied.length).toBe(1); // control: the click was handled
    await page.waitForTimeout(500);
    expect(rec.calls.filter((c) => c[0] === 'event' && String(c[1]).startsWith('kit_'))).toEqual([]);
  });
});

test.describe('Site header and footer on kit pages (src/lib/kitChrome.ts)', () => {
  // Kit sentences are pasted under a realtor's name: on /bah/kit/* only, no VA
  // home-loan links, no "Built by … (NMLS-licensed)" line and no email signup.
  // Everywhere else the chrome is unchanged.
  const HEADER_LOAN_HREFS = ['/calculators/va-loan', '/calculators/va-entitlement', '/calculators/va-refinance', '/guides/va-home-loans'];
  const FOOTER_LOAN_HREFS = ['/calculators/va-loan', '/guides/va-home-loans'];
  const SIGNUP = 'Get notified when';
  const CREDIT = 'NMLS-licensed';

  /** The site header and footer from the server HTML (the layout's own elements). */
  async function chrome(request: import('@playwright/test').APIRequestContext, url: string) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    const html = await res.text();
    const header = html.match(/<header class="sticky[\s\S]*?<\/header>/)?.[0] ?? '';
    const footer = html.match(/<footer class="bg-zinc-900[\s\S]*?<\/footer>/)?.[0] ?? '';
    expect(header.length, `${url}: site header found`).toBeGreaterThan(500);
    expect(footer.length, `${url}: site footer found`).toBeGreaterThan(500);
    return { html, header, footer };
  }

  test('kit page: loan links, credit line and signup absent; logo, home link and other navigation kept', async ({ request }) => {
    const { html, header, footer } = await chrome(request, '/bah/kit/fort-bragg');
    for (const href of HEADER_LOAN_HREFS) expect(header, href).not.toContain(`href="${href}"`);
    for (const href of FOOTER_LOAN_HREFS) expect(footer, href).not.toContain(`href="${href}"`);
    expect(footer).not.toContain(CREDIT);
    expect(footer).not.toContain(SIGNUP);
    expect(footer).not.toMatch(/type="email"/);
    // Nowhere in the page, RSC payload included.
    expect(html).not.toMatch(/\bloans?\b|lender|mortgage|NMLS/i);
    expect(html).not.toContain(SIGNUP);
    // Kept: logo + home link, the rest of the navigation, the footer.
    expect(header).toMatch(/<a [^>]*aria-label="MilPayTools home"[^>]*>|<a [^>]*href="\/"[^>]*aria-label="MilPayTools home"/);
    expect(header).toContain('href="/"');
    for (const href of ['/about', '/calculators/total-compensation', '/calculators/tsp', '/guides/military-pay', '/blog']) {
      expect(header, href).toContain(`href="${href}"`);
    }
    for (const href of ['/calculators/tsp', '/guides/military-pay', '/blog', '/about', '/terms', '/privacy']) {
      expect(footer, href).toContain(`href="${href}"`);
    }
    expect(footer).toContain('Data Sources');
  });

  for (const url of ['/bah/fort-bragg', '/']) {
    test(`${url}: loan links, credit line and signup still present`, async ({ request }) => {
      const { header, footer } = await chrome(request, url);
      for (const href of HEADER_LOAN_HREFS) expect(header, href).toContain(`href="${href}"`);
      for (const href of FOOTER_LOAN_HREFS) expect(footer, href).toContain(`href="${href}"`);
      expect(footer).toContain(CREDIT);
      expect(footer).toContain(SIGNUP);
      expect(footer).toMatch(/type="email"/);
    });
  }

  test('kit page after hydration: still no loan links, credit line or signup', async ({ page }) => {
    await page.goto('/bah/kit/fort-bragg');
    await waitForHydration(page.getByTestId('kit-copy-headline'));
    for (const href of HEADER_LOAN_HREFS) await expect(page.locator(`header a[href="${href}"]`), href).toHaveCount(0);
    for (const href of FOOTER_LOAN_HREFS) await expect(page.locator(`footer a[href="${href}"]`), href).toHaveCount(0);
    await expect(page.locator('footer')).not.toContainText(CREDIT);
    await expect(page.locator('footer input[type="email"]')).toHaveCount(0);
    await expect(page.locator('header a[aria-label="MilPayTools home"]')).toHaveAttribute('href', '/');
    await expect(page.locator('footer a[href="/calculators/tsp"]')).toHaveCount(1); // control: the footer rendered
  });
});
