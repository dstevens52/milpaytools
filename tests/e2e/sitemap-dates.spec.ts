import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import sitemap from '../../src/app/sitemap';
import { BAH_YEAR } from '../../src/data/bah/current';
import { bahRelease } from '../../src/data/bah/releaseHistory';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { PAY_PAGE_RANKS } from '../../src/data/pay-pages/ranks';
import { CALCULATOR_LAST_REVIEWED, PAGE_LAST_REVIEWED } from '../../src/data/lastReviewed';
import { getMHACode, getBahMidYearChange } from '../../src/lib/calculations/bah';

/**
 * S8: sitemap <lastmod> values are real content/data dates, never the build time.
 * Data-only (no browser or server):
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/sitemap-dates.spec.ts --project=chromium
 *
 * Stands in for "two builds a minute apart give identical dates": sitemap() is
 * what the build serializes, so calling it twice with time passing in between
 * must return identical output, and no entry may carry a time of day.
 */

const BASE = 'https://www.milpaytools.com';
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const byUrl = () => new Map(sitemap().map((e) => [e.url, String(e.lastModified)]));

test.describe('sitemap dates', () => {
  test('identical across two calls with time passing between them', async () => {
    const first = JSON.stringify(sitemap());
    await new Promise((r) => setTimeout(r, 1100));
    const second = JSON.stringify(sitemap());
    expect(first.length).toBeGreaterThan(1000); // control: a real sitemap, not an empty list
    expect(second).toBe(first);
  });

  test('every entry has a plain YYYY-MM-DD date, none of them in the future', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(250); // control
    const today = new Date().toISOString().slice(0, 10);
    for (const e of entries) {
      expect(typeof e.lastModified, e.url).toBe('string');
      expect(String(e.lastModified), e.url).toMatch(ISO_DAY);
      expect(String(e.lastModified) <= today, `${e.url} ${e.lastModified}`).toBe(true);
    }
  });

  test('sitemap.ts never reads the clock', () => {
    const src = readFileSync(path.join(__dirname, '../../src/app/sitemap.ts'), 'utf8');
    expect(src).toContain('lastModified'); // control
    expect(src).not.toMatch(/new Date\(\s*\)|Date\.now\(/);
  });

  test('station pages use the BAH data date (or a later mid-year change)', () => {
    const release = bahRelease(BAH_YEAR)?.releasedDate;
    expect(release).toMatch(ISO_DAY);
    const dates = byUrl();
    const conus = DUTY_STATIONS.filter((s) => !s.oconus);
    expect(conus.length).toBeGreaterThan(100); // control
    for (const s of conus) {
      const change = getBahMidYearChange(getMHACode(s.zip));
      const expected = change && change.effective > release! ? change.effective : release;
      expect(dates.get(`${BASE}/bah/${s.slug}`), s.slug).toBe(expected);
    }
  });

  test('rank pages use PAY_PAGES_LAST_UPDATED; calculators and pages use their reviewed dates', () => {
    const dates = byUrl();
    for (const r of PAY_PAGE_RANKS) expect(dates.get(`${BASE}/pay/${r.slug}`), r.slug).toBe('2026-07-30');
    const calcs = Object.entries(CALCULATOR_LAST_REVIEWED);
    expect(calcs.length).toBe(17); // control: all 17 calculators (V2 added va-entitlement)
    for (const [slug, date] of calcs) expect(dates.get(`${BASE}/calculators/${slug}`), slug).toBe(date);
    for (const [p, date] of Object.entries(PAGE_LAST_REVIEWED)) expect(dates.get(`${BASE}${p}`), p).toBe(date);
  });

  test('hubs carry the newest date among their children', () => {
    const dates = byUrl();
    const newestUnder = (prefix: string, extra: string[] = []) =>
      [...dates.entries()]
        .filter(([u]) => u.startsWith(`${BASE}${prefix}/`) || extra.includes(u))
        .map(([, d]) => d)
        .sort()
        .at(-1);
    // /calculators also lists the /bah and /pay hubs.
    const extras: Record<string, string[]> = { '/calculators': [`${BASE}/bah`, `${BASE}/pay`] };
    for (const hub of ['/calculators', '/bah', '/pay', '/blog', '/guides']) {
      const child = newestUnder(hub, extras[hub]);
      expect(child, hub).toMatch(ISO_DAY);
      expect(dates.get(`${BASE}${hub}`), hub).toBe(child);
    }
    const all = [...dates.values()].sort().at(-1);
    expect(dates.get(BASE)).toBe(all);
  });
});
