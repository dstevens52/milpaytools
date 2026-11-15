/**
 * Station search-result test (Build 03), checked on the served pages.
 *
 * - Arm A pages: <title>, description, og:* and twitter:* byte-identical to the
 *   main snapshot (tests/e2e/fixtures/station-serp-main-snapshot.json).
 * - Arm B pages: title ≤ 60 with no site suffix, og:title keeps it, description
 *   ≤ 160, and its {min}–{max} equal the min and max of the page's rendered
 *   rate table.
 * - Every CONUS H1 is "{name} BAH Rates {year}", and the year pill is gone.
 * - MHA names are cased for display; the lookup API still returns DTMO's name.
 * Arm logic and the flag modes are covered without a server in station-serp-data.spec.ts.
 */
import { test, expect, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { stationSerpArm } from '../../src/data/bah/serpTest';
import { CURRENT_BAH_YEAR } from '../../src/lib/calculations/bah';

type Snap = { title: string; description: string; ogTitle: string; ogDescription: string; twitterTitle: string; twitterDescription: string };
const SNAPSHOT: Record<string, Snap> = JSON.parse(
  readFileSync(path.join(__dirname, 'fixtures', 'station-serp-main-snapshot.json'), 'utf8'),
).pages;
const CONUS = DUTY_STATIONS.filter((s) => !s.oconus);

const dec = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function head(html: string) {
  const meta = (attr: string, name: string) => {
    const m =
      html.match(new RegExp(`<meta[^>]+${attr}="${name}"[^>]+content="([^"]*)"`)) ||
      html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+${attr}="${name}"`));
    return m ? dec(m[1]) : null;
  };
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => dec(m[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '')).trim());
  return {
    title: dec((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? ''),
    description: meta('name', 'description'),
    ogTitle: meta('property', 'og:title'),
    ogDescription: meta('property', 'og:description'),
    twitterTitle: meta('name', 'twitter:title'),
    twitterDescription: meta('name', 'twitter:description'),
    h1s,
  };
}

/** Monthly rates in the full rate table (with- and without-dependents cells), from the served HTML. */
function tableRates(html: string): { values: number[]; rows: number } {
  const start = html.indexOf(`${CURRENT_BAH_YEAR} BAH Rates — `);
  const table = start === -1 ? '' : html.slice(html.indexOf('<table', start), html.indexOf('</table>', start));
  // Grade rows only (the tbody also holds one heading row per grade group).
  const rows = table.split(/<tr[\s>]/).filter((r) => r.includes('tabular-nums')).length;
  const values = [...table.matchAll(/<span class="block (?:text-zinc-900 font-semibold|text-zinc-600)">\$([\d,]+)<\/span>/g)].map((m) =>
    Number(m[1].replace(/,/g, '')),
  );
  return { values, rows };
}

async function fetchPage(request: APIRequestContext, slug: string) {
  const res = await request.get(`/bah/${slug}`);
  expect(res.status(), slug).toBe(200);
  return res.text();
}

test.describe('station SERP test: served pages', () => {
  test('arm A: head metadata byte-identical to main on every A page', async ({ request }) => {
    test.slow();
    const a = CONUS.filter((s) => stationSerpArm(s.slug) === 'A');
    expect(a).toHaveLength(69);
    for (const s of a) {
      const { h1s, ...meta } = head(await fetchPage(request, s.slug));
      void h1s;
      expect(meta, s.slug).toEqual(SNAPSHOT[s.slug]);
    }
  });

  test('arm B: limits, site name only in og/twitter, and the range equals the rendered rate table', async ({ request }) => {
    test.slow();
    const b = CONUS.filter((s) => stationSerpArm(s.slug) === 'B');
    expect(b).toHaveLength(73);
    for (const s of b) {
      const html = await fetchPage(request, s.slug);
      const m = head(html);
      expect(m.title.length, `${s.slug}: ${m.title}`).toBeLessThanOrEqual(60);
      expect(m.title, s.slug).not.toContain('MilPayTools');
      expect(m.ogTitle, s.slug).toBe(`${m.title} | MilPayTools`);
      expect(m.twitterTitle, s.slug).toBe(`${m.title} | MilPayTools`);
      expect(m.description!.length, `${s.slug}: ${m.description}`).toBeLessThanOrEqual(160);
      expect(m.ogDescription, s.slug).toBe(m.description);
      expect(m.description, s.slug).not.toBe(SNAPSHOT[s.slug].description);

      const range = m.description!.match(/: \$([\d,]+)–\$([\d,]+)\/mo across (\d+) pay grades\./);
      expect(range, `${s.slug}: ${m.description}`).not.toBeNull();
      const { values, rows } = tableRates(html);
      expect(rows, `${s.slug} table rows`).toBe(Number(range![3]));
      expect(values.length, `${s.slug} table cells`).toBe(rows * 2);
      expect(Number(range![1].replace(/,/g, '')), `${s.slug} min`).toBe(Math.min(...values));
      expect(Number(range![2].replace(/,/g, '')), `${s.slug} max`).toBe(Math.max(...values));
    }
  });

  test('every CONUS page: one H1 "{name} BAH Rates {year}", no year pill', async ({ request }) => {
    test.slow();
    for (const s of CONUS) {
      const html = await fetchPage(request, s.slug);
      expect(head(html).h1s, s.slug).toEqual([`${s.name} BAH Rates ${CURRENT_BAH_YEAR}`]);
      expect(html, s.slug).not.toContain(`>${CURRENT_BAH_YEAR} BAH Rates</span>`);
    }
  });

  test('Fort Bragg (B): title, description, H1; former name stays in the hero', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await expect(page).toHaveTitle('Fort Bragg BAH 2026: E-1 to O-7, With & Without Dependents');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      '2026 BAH at Fort Bragg, NC (Fayetteville): $1,341–$2,646/mo across 24 pay grades. Pick your rank to see your rate, the change from 2025 and local rent.',
    );
    await expect(page.locator('h1')).toHaveText('Fort Bragg BAH Rates 2026');
    await expect(page.getByText('Formerly Fort Liberty (2023–2025)')).toBeVisible();
  });
});

test.describe('MHA name casing (display only)', () => {
  test('station page shows "Davis-Monthan AFB, AZ"; the lookup API still returns the DTMO name', async ({ page, request }) => {
    await page.goto('/bah/davis-monthan-afb');
    await expect(page.getByText('Davis-Monthan AFB, AZ').first()).toBeAttached();
    expect(await page.content()).not.toContain('Davis-Monthan Afb');

    const api = await request.get('/api/bah/lookup?zip=85701');
    expect(api.status()).toBe(200);
    const json = await api.json();
    expect(json.mha).toBe('AZ015');
    expect(json.locationName).toBe('Davis-Monthan Afb, AZ');
  });

  test('BAH calculator shows the cased label for a ZIP lookup', async ({ page }) => {
    await page.goto('/bah?zip=85701&rank=e5&dependents=yes', { waitUntil: 'networkidle' });
    await expect(page.getByText('Davis-Monthan AFB, AZ (AZ015)')).toBeVisible();
    await expect(page.getByText(/Davis-Monthan Afb/)).toHaveCount(0); // regex: case-sensitive
  });
});
