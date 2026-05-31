import { test, expect } from '@playwright/test';
import { getBAH } from './helpers/data';
import { formatCurrency } from './helpers/format';

const FORT_BRAGG = '/bah/fort-bragg?rank=E-5&dep=yes';
const FORT_HOOD = '/bah/fort-hood';

test.describe('BAH Station Page — Fort Bragg (upgraded, rich data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORT_BRAGG);
  });

  test('3-step plan renders on page', async ({ page }) => {
    await expect(page.getByText('Check your rate')).toBeVisible();
    await expect(page.getByText('See it vs. local rent')).toBeVisible();
    await expect(page.getByText('Plan your move')).toBeVisible();
  });

  test('rent section shows the E-5 BAH rate; no surplus/median-rent framing', async ({ page }) => {
    const e5Rate = getBAH('28301', 'E-5', true);
    if (!e5Rate) return test.skip();
    // The rate renders in the visible rent-comparison section (scope past the
    // collapsed Quick-reference accordion). The old MoneyStrip "Median rent"/
    // "Monthly surplus" cards are intentionally gone.
    const rentSection = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'BAH vs. Local Rent' }) })
      .last();
    await expect(rentSection.getByText(formatCurrency(e5Rate), { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Monthly surplus')).toHaveCount(0);
    await expect(page.getByText('Median rent', { exact: true })).toHaveCount(0);
  });

  test('Key Insights section is NOT present on upgraded page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Key Insights for Fort Bragg/i }),
    ).not.toBeAttached();
  });

  test('primary CTA is a prominent link — "Compare Fort Bragg to another duty station"', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /Compare Fort Bragg to another duty station/i }),
    ).toBeVisible();
  });

  test('secondary CTAs exist below primary', async ({ page }) => {
    await expect(page.getByRole('link', { name: /total military compensation/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /PCS move costs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /long-term wealth/i })).toBeVisible();
  });

  test('installation detail line (82nd Airborne / USASOC) renders below subtitle', async ({ page }) => {
    await expect(page.getByText(/82nd Airborne/i)).toBeVisible();
  });

  test('rank selector updates the displayed BAH value when grade changes to E-7', async ({ page }) => {
    const e7Rate = getBAH('28301', 'E-7', true);
    if (!e7Rate) return test.skip();
    await page.getByRole('combobox').selectOption('E-7');
    // The E-7 rate surfaces in the visible rent-comparison section (scope past the
    // collapsed Quick-reference accordion, which also lists the rate but is hidden).
    const rentSection = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'BAH vs. Local Rent' }) })
      .last();
    await expect(rentSection.getByText(formatCurrency(e7Rate), { exact: false }).first()).toBeVisible();
  });
});

test.describe('BAH Station Page — Fort Hood (upgraded, rich data)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FORT_HOOD);
  });

  test('Key Insights section is NOT present on upgraded page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Key Insights for Fort Hood/i }),
    ).not.toBeAttached();
  });

  test('3-step plan is present', async ({ page }) => {
    await expect(page.getByText('Check your rate')).toBeVisible();
  });
});

test.describe('BAH Station Page — Year-over-year deltas', () => {
  // Fort Bragg (MHA NC182) E-5 with dependents: 2025 $1,785 → 2026 $1,806 = +$21 (1.2%).
  // Values are stable for the FY2026 dataset; they update with the annual data refresh.
  test('selector card shows the E-5 w/dep YoY increase with correct sign + value', async ({ page }) => {
    await page.goto(FORT_BRAGG); // ?rank=E-5&dep=yes
    await expect(page.getByText('Year over year:', { exact: false })).toBeVisible();
    await expect(page.getByText(/\+\$21 \(1\.2%\)/).first()).toBeVisible();
    await expect(page.getByText(/vs 2025/).first()).toBeVisible();
  });

  test('direct-answer FAQ states the YoY change for E-5 with dependents', async ({ page }) => {
    await page.goto(FORT_BRAGG);
    // Phase-1 reworded YoY into a dedicated "How much did … change" FAQ + summary line.
    await expect(page.getByText(/rose \$21 \(\+1\.2%\)/).first()).toBeVisible();
    await expect(page.getByText(/from 2025.s \$1,785/).first()).toBeVisible();
  });

  test('no "NaN" or "undefined" leaks into the rendered page (null-safety)', async ({ page }) => {
    await page.goto(FORT_BRAGG);
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/\$undefined|undefined%|undefined\/mo/);
  });

  test('OCONUS station (no BAH) renders no YoY indicator and stays clean', async ({ page }) => {
    await page.goto('/bah/yokota-air-base');
    await expect(page.getByText('Year over year:', { exact: false })).not.toBeAttached();
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('NaN');
    expect(body).not.toContain('New for 2026'); // no false "new" label when there are simply no rates
  });
});

test.describe('BAH Station Page — Phase 1 universal enrichment (DoD-data-only)', () => {
  // fort-gordon is a previously-thin page (no bahVsHousing). The whole point of
  // Phase 1 is that it now carries the full reference set, not just a rate table.
  const THIN = '/bah/fort-gordon';

  test('previously-thin page shows the national-median comparison', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByText(/national median of \$[\d,]+/).first()).toBeVisible();
  });

  test('previously-thin page shows the percentile/rank sentence', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByText(/tracked nationwide \(top \d+%\)/).first()).toBeVisible();
  });

  test('previously-thin page shows the MHA geography explainer', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByText(/set by Military Housing Area \(MHA\), not by your specific ZIP/).first()).toBeVisible();
  });

  test('previously-thin page shows the YoY summary sentence', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByText(/For 2026, the E-5 with-dependents rate at Fort Gordon/).first()).toBeVisible();
  });

  test('previously-thin page has the expanded ZIP-dependence FAQ', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByRole('heading', { name: /Does Fort Gordon BAH depend on my exact ZIP code\?/ })).toBeVisible();
  });

  test('BreadcrumbList schema is present', async ({ page }) => {
    await page.goto(THIN);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((s) => s.includes('"BreadcrumbList"'))).toBe(true);
  });

  test('VA loan calculator link appears in "What to do next"', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByRole('link', { name: /VA loan payment calculator/i })).toBeVisible();
  });

  test('same-MHA sibling callout renders where siblings exist (Norfolk)', async ({ page }) => {
    await page.goto('/bah/naval-station-norfolk');
    await expect(page.getByText(/shares the .* MHA with/).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Naval Air Station Oceana' }).first()).toBeVisible();
  });

  test('no stale "vs. natl avg" label anywhere (standardized to median)', async ({ page }) => {
    await page.goto(THIN);
    await expect(page.getByText('vs. natl avg')).toHaveCount(0);
    await expect(page.getByText('vs. national median').first()).toBeVisible();
  });
});

test.describe('BAH Station Page — Phase 1.5 YoY framing', () => {
  test('increase page: annualized + tax framing + above national average, no decrease block (Norfolk)', async ({ page }) => {
    await page.goto('/bah/naval-station-norfolk');
    await expect(page.getByText(/\$1,260 more over the year, excluded from federal taxable income/).first()).toBeVisible();
    await expect(page.getByText(/above the national average BAH increase of 4\.2%/).first()).toBeVisible();
    await expect(page.getByText(/Some pay grades at Naval Station Norfolk decreased/)).toHaveCount(0);
  });

  test('decrease page: decrease block + "less over the year" (no tax framing) + below national average (San Antonio)', async ({ page }) => {
    await page.goto('/bah/joint-base-san-antonio');
    await expect(page.getByText(/\$792 less over the year\./).first()).toBeVisible();
    await expect(page.getByText(/Some pay grades at Joint Base San Antonio decreased for 2026 compared with 2025/).first()).toBeVisible();
    await expect(page.getByText(/below the national average BAH increase of 4\.2%/).first()).toBeVisible();
  });

  test('mixed page: E-5 rose with tax framing AND a decrease block (Fort Bragg)', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await expect(page.getByText(/\$252 more over the year, excluded from federal taxable income/).first()).toBeVisible();
    await expect(page.getByText(/Some pay grades at Fort Bragg decreased for 2026/).first()).toBeVisible();
  });
});

test.describe('BAH Station Page — Phase 2B HUD FMR rent comparison', () => {
  test('renders statically for the E-5 default (Fort Bragg, BAH above 2BR p75)', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await expect(page.getByRole('heading', { name: 'BAH vs. Local Rent' })).toBeVisible();
    await expect(page.getByText(/2-bedroom Fair Market Rent runs about/).first()).toBeVisible();
    await expect(page.getByText(/above the area's 75th-percentile 2-bedroom rent/).first()).toBeVisible();
    await expect(page.getByText(/about 95% of typical local housing costs/).first()).toBeVisible();
    await expect(page.getByText(/HUD Small Area Fair Market Rents/).first()).toBeVisible();
  });

  test('"within range" branch renders at a high-cost base (Presidio of Monterey)', async ({ page }) => {
    await page.goto('/bah/presidio-of-monterey');
    await expect(page.getByText(/falls within the area's 2-bedroom rent range/).first()).toBeVisible();
  });

  test('OCONUS has NO rent section (Yokota), degrades cleanly', async ({ page }) => {
    await page.goto('/bah/yokota-air-base');
    await expect(page.getByRole('heading', { name: 'BAH vs. Local Rent' })).toHaveCount(0);
    await expect(page.getByText('2-bedroom Fair Market Rent runs about')).toHaveCount(0);
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('$undefined');
    expect(body).not.toContain('NaN');
  });

  test('picker drives the BAH side of the rent section (grade change)', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await expect(page.getByText('E-5 w/dep BAH').first()).toBeVisible();
    await page.getByRole('combobox').selectOption('E-9');
    await expect(page.getByText('E-9 w/dep BAH').first()).toBeVisible();
  });

  test('no surplus/"you keep" language in the rent comparison section', async ({ page }) => {
    await page.goto('/bah/redstone-arsenal'); // thin page (no tier-1 bahVsHousing block)
    await expect(page.getByRole('heading', { name: 'BAH vs. Local Rent' })).toBeVisible();
    const body = await page.locator('main').innerText();
    expect(body).not.toContain('$undefined');
    expect(body).not.toMatch(/you keep|you pocket|Monthly surplus/i);
  });
});
