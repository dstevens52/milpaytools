import { test, expect, type Page, type Locator } from '@playwright/test';
import { OCONUS_V2_STATIONS } from '../../src/data/oconus';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { isMilitaryMailZip } from '../../src/lib/militaryMailZip';
import { OCONUS_SEARCH_INDEX } from '../../src/data/oconus/searchIndex.generated';
import { buildOconusSearchIndex } from '../../src/data/oconus/buildSearchIndex';

// Overseas input in the calculators' shared station search (BaseSearchInput):
// an overseas station, APO/FPO ZIP or "APO" text shows a neutral overseas note
// instead of "No matches found" / "ZIP code not found in BAH dataset".
// Stateside matches always win — see the regression guards at the bottom.

const DTMO_OHA = 'https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/';
const DTMO_COLA = 'https://www.travel.dod.mil/Allowances/Overseas-Cost-of-Living-Allowance/';
const NO_MATCH = 'No matches found — try entering your ZIP code directly';

const PUBLISHED_V2 = OCONUS_V2_STATIONS.filter((s) => s.published);
const bySlug = (slug: string) => {
  const s = PUBLISHED_V2.find((x) => x.slug === slug);
  if (!s) throw new Error(`no published v2 station ${slug}`);
  return s;
};

const note = (page: Page) => page.getByTestId('overseas-note');

async function type(input: Locator, text: string) {
  await input.fill('');
  await input.fill(text);
}

async function expectStationNote(page: Page, slug: string) {
  const s = bySlug(slug);
  const n = note(page);
  await expect(n).toBeVisible();
  await expect(n).toContainText(`${s.name} is an overseas station.`);
  const links = n.getByRole('link');
  await expect(links).toHaveCount(1);
  await expect(links.first()).toHaveAttribute('href', `/bah/${s.slug}`);
  await expect(n).not.toContainText(/\d/); // no numbers in the note
}

async function expectGenericNote(page: Page, headline: string, dtmo = DTMO_OHA) {
  const n = note(page);
  await expect(n).toBeVisible();
  await expect(n).toContainText(headline);
  await expect(n.getByRole('link', { name: /Browse overseas station guides/ })).toHaveAttribute('href', '/bah#oconus');
  await expect(n.getByRole('link', { name: /on DTMO/ })).toHaveAttribute('href', dtmo);
  await expect(n.getByRole('link')).toHaveCount(2);
  await expect(n).not.toContainText(/\d/);
}

// ── Unit: the shared APO prefix helper (also used by the PCS estimator) ─────

test.describe('isMilitaryMailZip', () => {
  test('APO AE / AA / AP prefixes match; stateside, Hawaii, Guam and partial input do not', () => {
    for (const z of ['09094', '09099', '09000', '34001', '96205', '96601', '962', '090']) {
      expect(isMilitaryMailZip(z), z).toBe(true);
    }
    for (const z of ['28310', '98433', '92134', '96701', '96813', '96910', '34101', '96101', '09', '', 'abcde']) {
      expect(isMilitaryMailZip(z), z).toBe(false);
    }
  });
});

// ── Unit: the committed slim index matches the v2 registry ──────────────────

test('searchIndex.generated.ts is up to date with the v2 registry (run npm run gen:oconus-index)', () => {
  expect(OCONUS_SEARCH_INDEX).toEqual(buildOconusSearchIndex());
  expect(OCONUS_SEARCH_INDEX.length).toBe(PUBLISHED_V2.length);
  expect(OCONUS_SEARCH_INDEX.length).toBeGreaterThan(0);
  for (const e of OCONUS_SEARCH_INDEX) expect(Object.keys(e).sort()).toEqual(['name', 'searchAliases', 'shortName', 'slug']);
});

// ── Total Compensation ────────────────────────────────────────────────────────

test.describe('Total Comp — overseas station search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/total-compensation');
  });

  test('1. "Ramstein" → Ramstein station note', async ({ page }) => {
    await type(page.getByLabel('Duty Station'), 'Ramstein');
    await expectStationNote(page, 'ramstein-air-base');
    await expect(page.getByText(NO_MATCH)).toHaveCount(0);
  });

  test('2. "09094" → APO note with browse + DTMO links; no red error; no amber box', async ({ page }) => {
    await page.getByLabel('Duty Station').pressSequentially('09094', { delay: 30 });
    await expectGenericNote(page, 'That looks like an overseas military mail ZIP.');
    await expect(page.getByText('ZIP code not found in BAH dataset')).toHaveCount(0);
    await expect(page.getByText("We couldn't match that location")).toHaveCount(0);
  });

  test('"APO AE" text → APO note', async ({ page }) => {
    await type(page.getByLabel('Duty Station'), 'APO AE');
    await expectGenericNote(page, 'That looks like an overseas military mail address.');
  });

  test('Aviano (no v2 guide) → generic note naming the base', async ({ page }) => {
    await type(page.getByLabel('Duty Station'), 'Aviano');
    await expectGenericNote(page, 'Aviano Air Base is an overseas station.');
  });

  test('Osan (no v2 guide) → generic note naming the base', async ({ page }) => {
    await type(page.getByLabel('Duty Station'), 'Osan');
    await expectGenericNote(page, 'Osan Air Base is an overseas station.');
  });

  test('typo ZIP not in the dataset still shows the amber box', async ({ page }) => {
    await page.getByLabel('Duty Station').pressSequentially('00001', { delay: 30 });
    await expect(page.getByText("We couldn't match that location")).toBeVisible();
    await expect(note(page)).toHaveCount(0);
  });

  test('typo name "Fort Brgg" still shows the normal no-match helper, no overseas note', async ({ page }) => {
    await type(page.getByLabel('Duty Station'), 'Fort Brgg');
    await expect(page.getByText(NO_MATCH)).toBeVisible();
    await expect(note(page)).toHaveCount(0);
  });

  // 6. Every published v2 station's own name returns its own guide link.
  for (const s of PUBLISHED_V2) {
    test(`6. station name "${s.name}" → /bah/${s.slug}`, async ({ page }) => {
      await type(page.getByLabel('Duty Station'), s.name);
      await expectStationNote(page, s.slug);
    });
  }
});

// ── Compare ───────────────────────────────────────────────────────────────────

test('3. Compare new-station field: "Ramstein" → Ramstein station note', async ({ page }) => {
  await page.goto('/calculators/compare');
  // Both inputs share one id today (separate fix), so select by position.
  await type(page.locator('input[type="text"]').nth(1), 'Ramstein');
  await expectStationNote(page, 'ramstein-air-base');
});

// ── Dual-Military BAH ─────────────────────────────────────────────────────────

test.describe('Dual-Military BAH — shared station', () => {
  for (const q of ['Kadena', 'okinawa']) {
    test(`4. "${q}" → Kadena station note`, async ({ page }) => {
      await page.goto('/calculators/dual-military-bah');
      await type(page.getByLabel('Shared Duty Station'), q);
      await expectStationNote(page, 'kadena-air-base');
    });
  }
});

// ── COLA ──────────────────────────────────────────────────────────────────────

test.describe('COLA — overseas variant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/cola');
  });

  test('5. "lakenheath" → Lakenheath station note in the COLA wording; overseas line present', async ({ page }) => {
    const line = page.getByTestId('cola-overseas-line');
    await expect(line).toContainText('Stationed overseas? Overseas COLA is a separate allowance set by DTMO.');
    await expect(line.getByRole('link')).toHaveAttribute('href', '/bah#oconus');

    await type(page.locator('#zip'), 'lakenheath');
    await expectStationNote(page, 'raf-lakenheath');
    await expect(note(page)).toContainText('Overseas stations get overseas COLA instead of CONUS COLA.');
    await expect(note(page)).not.toContainText('price housing');
  });

  test('APO ZIP → generic note with the overseas COLA DTMO link; no "not a CONUS COLA area" box', async ({ page }) => {
    await page.locator('#zip').pressSequentially('96205', { delay: 30 });
    await expectGenericNote(page, 'That looks like an overseas military mail ZIP.', DTMO_COLA);
    await expect(page.getByText('is not a CONUS COLA area')).toHaveCount(0);
  });

  test('stateside non-COLA ZIP still shows the "not a CONUS COLA area" box', async ({ page }) => {
    await page.locator('#zip').pressSequentially('28310', { delay: 30 });
    await expect(page.getByText('ZIP 28310 is not a CONUS COLA area')).toBeVisible();
    await expect(note(page)).toHaveCount(0);
  });
});

// ── 7. Regression guards: stateside input is untouched ───────────────────────

test.describe('7. Regression guards (Total Comp)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/total-compensation');
  });

  for (const q of ['Fort Bragg', 'San Diego']) {
    test(`"${q}" still shows CONUS suggestions, no overseas note`, async ({ page }) => {
      await type(page.getByLabel('Duty Station'), q);
      await expect(page.getByRole('listbox', { name: 'Military installations' })).toBeVisible();
      await expect(note(page)).toHaveCount(0);
    });
  }

  for (const z of ['28310', '98433']) {
    test(`ZIP ${z} still resolves to a location, no overseas note`, async ({ page }) => {
      await page.getByLabel('Duty Station').pressSequentially(z, { delay: 30 });
      await expect(page.locator('p', { hasText: /^📍 / })).toBeVisible();
      await expect(note(page)).toHaveCount(0);
      await expect(page.getByText('Pay & Allowances Breakdown')).toBeVisible();
    });
  }

  test('"zzzz" still shows the normal no-match message', async ({ page }) => {
    await type(page.getByLabel('Duty Station'), 'zzzz');
    await expect(page.getByText(NO_MATCH)).toBeVisible();
    await expect(note(page)).toHaveCount(0);
  });
});

test('PCS estimator keeps its own overseas handling (no overseas note)', async ({ page }) => {
  await page.goto('/calculators/pcs');
  await page.getByLabel('Moving to (optional)').pressSequentially('09094', { delay: 30 });
  await expect(note(page)).toHaveCount(0);
});

// ── 8. /bah hub ───────────────────────────────────────────────────────────────

test('8. /bah hub lists exactly the 5 overseas guides, no duplicates, under #oconus', async ({ page }) => {
  await page.goto('/bah');
  const heading = page.locator('#oconus');
  await expect(heading).toHaveCount(1);
  const cards = page.locator('#oconus + div a');
  const hrefs = await cards.evaluateAll((els) => els.map((e) => e.getAttribute('href')));

  // Expected set derived from the data: duty-station overseas entries + v2-only guides.
  const expected = new Set([
    ...DUTY_STATIONS.filter((s) => s.oconus).map((s) => `/bah/${s.slug}`),
    ...PUBLISHED_V2.map((s) => `/bah/${s.slug}`),
  ]);
  expect(expected.size).toBe(5);
  expect(hrefs).toHaveLength(5);
  expect(new Set(hrefs).size).toBe(hrefs.length); // no duplicate slugs
  expect(new Set(hrefs)).toEqual(expected);
  expect(hrefs).toContain('/bah/raf-lakenheath');
});
