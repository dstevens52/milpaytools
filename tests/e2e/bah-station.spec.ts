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
    await expect(page.getByText('See what it buys')).toBeVisible();
    await expect(page.getByText('Plan your move')).toBeVisible();
  });

  test('money strip renders with BAH, median rent, and surplus cards', async ({ page }) => {
    const e5Rate = getBAH('28301', 'E-5', true);
    if (!e5Rate) return test.skip();
    // BAH card shows the rate value
    await expect(page.getByText(formatCurrency(e5Rate), { exact: false }).first()).toBeVisible();
    // Rent and surplus labels (use .first() since similar text may appear in other sections)
    await expect(page.getByText('Median rent').first()).toBeVisible();
    await expect(page.getByText('Monthly surplus').first()).toBeVisible();
  });

  test('"What Your BAH Buys Here" section heading exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'What Your BAH Buys Here' })).toBeVisible();
  });

  test('mortgage comparison renders inside housing section', async ({ page }) => {
    await expect(page.getByText('Median home price')).toBeVisible();
    await expect(page.getByText(/Est\. monthly mortgage/i)).toBeVisible();
  });

  test('no duplicate rent/surplus in housing section — appears only once', async ({ page }) => {
    // MoneyStrip has exactly "Monthly surplus"; old repeated cards had "Monthly surplus vs. median rent"
    // exact:true ensures we only count exact matches, confirming no duplication
    await expect(page.getByText('Monthly surplus', { exact: true })).toHaveCount(1);
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

  test('rank selector updates money strip BAH value when grade changes to E-7', async ({ page }) => {
    const e7Rate = getBAH('28301', 'E-7', true);
    if (!e7Rate) return test.skip();
    await page.getByRole('combobox').selectOption('E-7');
    // The money strip BAH card is the first visible occurrence of the rate
    await expect(page.getByText(formatCurrency(e7Rate), { exact: false }).first()).toBeVisible();
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
