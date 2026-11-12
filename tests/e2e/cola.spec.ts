import { test, expect } from '@playwright/test';
import { lookupCola } from '@/lib/calculations/cola';
import { compareLocations } from '@/lib/calculations/compare';
import { COLA_AREAS, COLA_SOURCE } from '@/data/cola/2026/constants';

// CONUS COLA — 2026 official DTMO list (docs/sources/conus-cola-locations-2026.md).
// Eligibility is keyed by MHA; the site shows eligibility + official index only,
// never a dollar amount.

// Expected values typed from the source doc (NOT read from the data file), so a
// data-file edit that drifts from the DTMO PDF fails here. Sample ZIPs verified
// against DTMO sorted_zipmha26.txt on 2026-11-12.
const OFFICIAL_2026: { dtmoName: string; mhaCode: string; zip: string; index: number }[] = [
  { dtmoName: 'Camp Pendleton', mhaCode: 'CA024', zip: '92055', index: 1 },
  { dtmoName: 'Los Angeles', mhaCode: 'CA037', zip: '90012', index: 3 },
  { dtmoName: 'Marin/Sonoma', mhaCode: 'CA027', zip: '94949', index: 1 },
  { dtmoName: 'Oakland', mhaCode: 'CA018', zip: '94612', index: 6 },
  { dtmoName: 'Sacramento', mhaCode: 'CA034', zip: '95814', index: 3 },
  { dtmoName: 'San Diego', mhaCode: 'CA038', zip: '92101', index: 1 },
  { dtmoName: 'San Francisco', mhaCode: 'CA019', zip: '94102', index: 8 },
  { dtmoName: 'Santa Clara County', mhaCode: 'CA044', zip: '94043', index: 5 },
  { dtmoName: 'Chicago', mhaCode: 'IL325', zip: '60601', index: 1 },
  { dtmoName: 'Baltimore', mhaCode: 'MD129', zip: '21201', index: 1 },
  { dtmoName: 'Nantucket', mhaCode: 'MA119', zip: '02554', index: 1 },
  { dtmoName: 'Long Island', mhaCode: 'NY218', zip: '11501', index: 2 },
  { dtmoName: 'New York City', mhaCode: 'NY219', zip: '10001', index: 4 },
  { dtmoName: 'Staten Island', mhaCode: 'NY413', zip: '10301', index: 4 },
  { dtmoName: 'Westchester County', mhaCode: 'NY349', zip: '10601', index: 2 },
  { dtmoName: 'Warrenton', mhaCode: 'VA302', zip: '20186', index: 1 },
  { dtmoName: 'Everett', mhaCode: 'WA307', zip: '98207', index: 1 },
  { dtmoName: 'Seattle', mhaCode: 'WA309', zip: '98101', index: 4 },
];

// ─── Data + lib (no page) ─────────────────────────────────────────────────────

test.describe('CONUS COLA — data and lookup', () => {
  test('data file holds exactly the 18 official 2026 areas', () => {
    expect(COLA_AREAS).toHaveLength(OFFICIAL_2026.length);
    const got = COLA_AREAS.map((a) => `${a.mhaCode}|${a.dtmoName}|${a.index}`).sort();
    const want = OFFICIAL_2026.map((a) => `${a.mhaCode}|${a.dtmoName}|${a.index}`).sort();
    expect(got).toEqual(want);
  });

  test('data file carries no dollar figures', () => {
    for (const a of COLA_AREAS) expect(Object.keys(a).sort()).toEqual(['dtmoName', 'index', 'mhaCode', 'state']);
    expect(JSON.stringify(COLA_AREAS)).not.toContain('$');
  });

  for (const a of OFFICIAL_2026) {
    test(`${a.zip} → ${a.dtmoName} is eligible at ${a.index}%`, () => {
      const r = lookupCola(a.zip);
      expect(r.status).toBe('eligible');
      if (r.status !== 'eligible') return;
      expect(r.mhaCode).toBe(a.mhaCode);
      expect(r.dtmoName).toBe(a.dtmoName);
      expect(r.index).toBe(a.index);
    });
  }

  for (const [zip, mhaCode, label] of [
    ['93940', 'CA039', 'Monterey'],
    ['93246', 'CA023', 'Lemoore'],
    ['92278', 'CA032', 'Twentynine Palms'],
    ['28310', 'NC182', 'Fort Bragg'],
  ] as const) {
    test(`${zip} (${label}) is not eligible`, () => {
      const r = lookupCola(zip);
      expect(r.status).toBe('not-eligible');
      if (r.status !== 'not-eligible') return;
      expect(r.mhaCode).toBe(mhaCode);
      expect(r).not.toHaveProperty('index');
    });
  }

  test('11252 (Fort Hamilton, Brooklyn) → New York City 4%, not Long Island', () => {
    const r = lookupCola('11252');
    expect(r.status).toBe('eligible');
    if (r.status !== 'eligible') return;
    expect(r.dtmoName).toBe('New York City');
    expect(r.index).toBe(4);
  });

  test('10301 → Staten Island 4%', () => {
    const r = lookupCola('10301');
    expect(r.status).toBe('eligible');
    if (r.status !== 'eligible') return;
    expect(r.dtmoName).toBe('Staten Island');
    expect(r.index).toBe(4);
  });

  test('malformed and unknown ZIPs → not-found', () => {
    for (const z of ['9394', '', 'abcde', '939400']) expect(lookupCola(z).status).toBe('not-found');
    expect(lookupCola('00000').status).toBe('not-found'); // not in the DTMO ZIP table
    expect(lookupCola('00601').status).toBe('not-found'); // territory (OHA area)
  });
});

test.describe('PCS Compare — CONUS COLA excluded from totals (CMP-02)', () => {
  // Same state (CA), same injected BAH; only B is in a 2026 COLA area.
  const base = {
    payGrade: 'E-5' as const,
    yearsOfService: 6,
    hasDependents: true,
    zipA: '92278',
    zipB: '92101',
    bahA: { monthlyBAH: 2500, locationName: 'A', bahFound: true, mha: 'CA032' },
    bahB: { monthlyBAH: 2500, locationName: 'B', bahFound: true, mha: 'CA038' },
  };

  test('take-home, gross, taxes and verdict are unaffected by COLA', () => {
    const r = compareLocations(base)!;
    expect(r.locA.cola).toBeNull();
    expect(r.locB.cola).toEqual({ dtmoName: 'San Diego', index: 1 });
    expect(r.grossDiffMonthly).toBe(0);
    expect(r.federalTaxDiffAnnual).toBe(0);
    expect(r.stateTaxDiffAnnual).toBe(0);
    expect(r.takeHomeDiffMonthly).toBe(0);
    expect(r.verdict).toBe('similar');
    expect(r).not.toHaveProperty('colaDiffMonthly');
    expect(r.locB).not.toHaveProperty('monthlyCOLA');
  });
});

// ─── Calculator page ─────────────────────────────────────────────────────────

test.describe('CONUS COLA Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/cola');
  });

  test('page loads with the 2026 title', async ({ page }) => {
    await expect(page).toHaveTitle('CONUS COLA Calculator 2026: Eligible Locations & Index');
  });

  test('empty state message is shown before ZIP entry', async ({ page }) => {
    await expect(page.getByText('Enter a 5-digit duty station ZIP code to check 2026 CONUS COLA eligibility.')).toBeVisible();
  });

  test('only a ZIP input — no grade or dependents inputs', async ({ page }) => {
    await expect(page.getByText('CONUS COLA Lookup')).toBeVisible();
    await expect(page.locator('#pay-grade')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^(With deps|Without)$/ })).toHaveCount(0);
  });

  test('eligible ZIP (Seattle 98101) shows index and DTMO rate-lookup link, no $', async ({ page }) => {
    await page.locator('#zip').pressSequentially('98101', { delay: 50 });
    const card = page.getByTestId('cola-result-eligible');
    await expect(card).toBeVisible();
    await expect(card.getByRole('heading')).toHaveText('Seattle is a 2026 CONUS COLA area');
    await expect(page.getByTestId('cola-result-index')).toHaveText('Official 2026 COLA index: 4%');
    const link = page.getByTestId('cola-dtmo-rate-lookup');
    await expect(link).toHaveAttribute('href', COLA_SOURCE.rateLookupUrl);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveText(/Get your exact amount from DTMO.s official rate lookup/);
    expect(await page.getByTestId('cola-result-area').innerText()).not.toContain('$');
  });

  test('not-eligible ZIP (Monterey 93940) names the MHA and links to the list', async ({ page }) => {
    await page.locator('#zip').pressSequentially('93940', { delay: 50 });
    const card = page.getByTestId('cola-result-not-eligible');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Monterey, CA is not a 2026 CONUS COLA area.');
    await expect(card).toContainText('Only 18 military housing areas qualify for 2026.');
    expect(await page.getByTestId('cola-result-area').innerText()).not.toContain('$');
    await card.getByTestId('cola-area-list-link').click();
    await expect(page.getByTestId('cola-area-table')).toBeInViewport();
  });

  test('previously mis-routed ZIP (Lemoore 93246) is not eligible', async ({ page }) => {
    await page.locator('#zip').pressSequentially('93246', { delay: 50 });
    await expect(page.getByTestId('cola-result-not-eligible')).toContainText('is not a 2026 CONUS COLA area.');
    await expect(page.getByText(/Santa Barbara|Vandenberg/)).toHaveCount(0);
  });

  test('unknown ZIP shows the not-found state', async ({ page }) => {
    await page.locator('#zip').pressSequentially('00000', { delay: 50 });
    await expect(page.getByTestId('cola-result-not-found')).toContainText(
      "We couldn't match that ZIP to a military housing area. Check the ZIP or see the full list below.",
    );
  });

  test('area table renders exactly the 18 areas from the data, with source line', async ({ page }) => {
    const rows = page.getByTestId('cola-area-row');
    await expect(rows).toHaveCount(18);
    await expect(rows.filter({ hasText: 'San Francisco' })).toContainText('8%');
    await expect(rows.filter({ hasText: 'Staten Island' })).toContainText('4%');
    const source = page.getByTestId('cola-area-source');
    await expect(source).toContainText('Source: DTMO, CONUS COLA Locations for 2026 (retrieved November 12, 2026)');
    await expect(source.getByRole('link')).toHaveAttribute('href', COLA_SOURCE.sourceUrl);
  });

  test('hero sample is computed (San Francisco, 8%) and has no dollar figure', async ({ page }) => {
    const hero = page.getByTestId('cola-hero-sample');
    await expect(hero).toContainText('San Francisco');
    await expect(hero).toContainText('8%');
    expect(await hero.innerText()).not.toContain('$');
  });

  test('worked example: Seattle eligible at 4%, Monterey not eligible', async ({ page }) => {
    const ex = page.locator('.calc-example').filter({ hasText: 'ZIP 98101' });
    await expect(ex).toContainText('2026 COLA area · 4% index');
    await expect(ex).toContainText('Not a 2026 COLA area');
    expect(await ex.innerText()).not.toContain('$');
  });

  test('FAQ is visible and matches the FAQPage schema', async ({ page }) => {
    await expect(page.getByText("Why doesn't this calculator show a dollar amount?")).toBeVisible();
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = schemas.map((s) => JSON.parse(s)).find((s) => s['@type'] === 'FAQPage');
    expect(faq?.mainEntity).toHaveLength(4);
  });
});

// ─── Other consumers ─────────────────────────────────────────────────────────

test.describe('CONUS COLA on other pages', () => {
  test('PCS Compare: COLA note renders per station, no COLA dollar row', async ({ page }) => {
    await page.goto('/calculators/compare?zip1=92278&zip2=92101&rank=E5&dependents=yes&yos=6');
    const note = page.getByTestId('compare-cola-note');
    await expect(note).toBeVisible();
    await expect(page.getByTestId('compare-cola-a')).toContainText('Not a 2026 CONUS COLA area');
    await expect(page.getByTestId('compare-cola-b')).toContainText('2026 CONUS COLA area: 1% index — not included in totals');
    await expect(page.getByTestId('compare-cola-b').getByRole('link', { name: 'DTMO rate lookup' })).toHaveAttribute(
      'href',
      COLA_SOURCE.rateLookupUrl,
    );
    expect(await note.innerText()).not.toContain('$');
  });

  // COLA status renders on basic station pages (the Quick Facts / Key Insights blocks).
  test('BAH station page in a 2026 area shows the index (Fort Hamilton → New York City 4%)', async ({ page }) => {
    await page.goto('/bah/fort-hamilton');
    await expect(page.getByText('2026 area · 4% index')).toBeVisible();
    await expect(page.getByText(/in the New York City military housing area, which is on DTMO.s 2026/)).toBeVisible();
  });

  test('BAH station page outside the 2026 list shows no COLA (Presidio of Monterey)', async ({ page }) => {
    await page.goto('/bah/presidio-of-monterey');
    await expect(page.locator('h1')).toBeVisible();
    // Nav/footer link to the COLA calculator is fine; the station's own COLA status must be absent.
    await expect(page.getByText(/2026 area · \d+% index/)).toHaveCount(0);
    await expect(page.getByText(/2026 CONUS COLA list/)).toHaveCount(0);
  });
});
