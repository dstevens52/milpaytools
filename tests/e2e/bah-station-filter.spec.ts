import { test, expect, type Page } from '@playwright/test';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { OCONUS_V2_STATIONS } from '../../src/data/oconus';
import { waitForHydration } from './helpers/hydration';

// /bah hub station list (P1 #5, docs/perf/p1-step1-report.md): the cards are server-rendered
// (every one in the HTML for crawlers) and the search box only hides cards and empty state groups.
// Matching: the query is a substring of a card's name, city, state, state name, former name or a branch.

const dutySlugs = new Set(DUTY_STATIONS.map((s) => s.slug));
const CARDS = [
  ...DUTY_STATIONS.map((s) => ({ slug: s.slug, group: s.oconus ? 'OCONUS' : s.stateName, fields: [s.name, s.city, s.state, s.stateName, s.formerName ?? '', ...s.branches] })),
  ...OCONUS_V2_STATIONS.filter((s) => s.published && !dutySlugs.has(s.slug)).map((s) => ({
    slug: s.slug,
    group: 'OCONUS',
    fields: [s.name, s.cityRegion.value, s.hostCountry.value, s.hostCountry.value, ...s.branches.value],
  })),
];
const expectedMatches = (q: string) => CARDS.filter((c) => c.fields.some((f) => f && f.toLowerCase().includes(q.toLowerCase())));

const cards = (page: Page) => page.locator('#stations [data-station-slug]');
const visibleSlugs = (page: Page) =>
  cards(page).evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.getAttribute('data-station-slug')));
const visibleGroups = (page: Page) =>
  page.locator('#stations [data-station-group]').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.getAttribute('data-station-group')));

test('every station card is in the server HTML', async ({ request }) => {
  const html = await (await request.get('/bah')).text();
  const slugs = [...html.matchAll(/data-station-slug="([^"]+)"/g)].map((m) => m[1]);
  expect(slugs.length).toBe(CARDS.length);
  expect(new Set(slugs)).toEqual(new Set(CARDS.map((c) => c.slug)));
  for (const c of CARDS) expect(html, c.slug).toContain(`href="/bah/${c.slug}"`);
});

test.describe('/bah station filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bah');
    await waitForHydration(page.getByPlaceholder('Search by base name, city, state, or branch…'));
  });

  test('shows everything with no query', async ({ page }) => {
    expect(await visibleSlugs(page)).toHaveLength(CARDS.length);
  });

  for (const q of ['bragg', 'Texas', 'navy', 'liberty', 'japan']) {
    test(`"${q}" shows exactly the matching cards and their groups`, async ({ page }) => {
      const want = expectedMatches(q);
      expect(want.length, 'control: the query matches something').toBeGreaterThan(0);
      const input = page.getByPlaceholder('Search by base name, city, state, or branch…');
      await input.fill(q);
      const n = want.length;
      await expect(page.getByText(`${n} result${n !== 1 ? 's' : ''} for “${q}”`)).toBeVisible();
      await expect.poll(() => visibleSlugs(page)).toEqual(CARDS.filter((c) => want.includes(c)).map((c) => c.slug).sort((a, b) => order(a) - order(b)));
      expect(new Set(await visibleGroups(page))).toEqual(new Set(want.map((c) => c.group)));
      await input.fill('');
      await expect.poll(async () => (await visibleSlugs(page)).length).toBe(CARDS.length);
    });
  }

  test('no match shows the empty message and no cards', async ({ page }) => {
    await page.getByPlaceholder('Search by base name, city, state, or branch…').fill('zzzzqq');
    await expect(page.getByText('No installations found. Try a different search term.')).toBeVisible();
    await expect(page.getByText('0 results for “zzzzqq”')).toBeVisible();
    await expect.poll(() => visibleSlugs(page)).toEqual([]);
    expect(await visibleGroups(page)).toEqual([]);
  });
});

// Cards render grouped by state (A–Z, OCONUS last); visible order follows the DOM.
let domOrder: Map<string, number> | null = null;
function order(slug: string) {
  if (!domOrder) {
    const groups = new Map<string, string[]>();
    for (const c of CARDS) groups.set(c.group, [...(groups.get(c.group) ?? []), c.slug]);
    const keys = [...groups.keys()].sort((a, b) => (a === 'OCONUS' ? 1 : b === 'OCONUS' ? -1 : a.localeCompare(b)));
    domOrder = new Map(keys.flatMap((k) => groups.get(k)!).map((s, i) => [s, i]));
  }
  return domOrder.get(slug)!;
}
