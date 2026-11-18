import { test, expect } from '@playwright/test';
import { vaRates2027, VA_RATES_2026 } from '../../src/data/va-rates/registry';
import {
  ADDED_COLUMNS,
  DEPENDENT_RATINGS,
  NO_CHILD_COLUMNS,
  WITH_CHILD_COLUMNS,
  vaRatesPageH1,
  vaRatesPageMode,
  vaRatesPageTitle,
} from '../../src/lib/calculations/vaRatesPage';

/**
 * /va-disability-rates in the browser, in whatever mode the status file is in
 * (the other mode is covered by va-rates-page-unit.spec.ts).
 */

const MODE = vaRatesPageMode(vaRates2027());
const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

test.describe('/va-disability-rates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/va-disability-rates');
  });

  test('title, H1 and dated status box', async ({ page }) => {
    await expect(page).toHaveTitle(vaRatesPageTitle(MODE));
    await expect(page.locator('h1')).toHaveText(vaRatesPageH1(MODE));
    const status = page.getByTestId('va-rates-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Checked \w+ \d{1,2}, \d{4}\./);
    await expect(status).toContainText('December 1, 2026');
  });

  test('pending mode: every dollar figure on the page is a 2026 VA.gov cell', async ({ page }) => {
    test.skip(MODE !== 'pending', 'published mode shows 2027 figures');
    const allowed = new Set<number>();
    for (const row of Object.values(VA_RATES_2026.table)) for (const v of Object.values(row)) allowed.add(Math.round(v * 100));
    const text = (await page.locator('body').innerText()) ?? '';
    const amounts = [...text.matchAll(/\$([\d,]+(?:\.\d\d)?)/g)].map((m) => Math.round(Number(m[1].replace(/,/g, '')) * 100));
    expect(amounts.length).toBeGreaterThan(100); // the tables rendered
    expect(amounts.filter((c) => !allowed.has(c)), 'dollar figures not in the 2026 table').toEqual([]);
  });

  test('pending mode: every 2026 cell is shown', async ({ page }) => {
    test.skip(MODE !== 'pending', 'published mode shows 2027 figures');
    const tables = (await page.locator('table').allInnerTexts()).join('\n');
    const missing: string[] = [];
    for (const r of [10, 20]) if (!tables.includes(money(VA_RATES_2026.table[r].veteranAlone))) missing.push(`${r}%`);
    for (const r of DEPENDENT_RATINGS) {
      for (const c of [...NO_CHILD_COLUMNS, ...WITH_CHILD_COLUMNS, ...ADDED_COLUMNS]) {
        if (!tables.includes(money(VA_RATES_2026.table[r][c.key]))) missing.push(`${r}%/${c.key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('links back to the calculator', async ({ page }) => {
    const link = page.getByRole('link', { name: /Work out your combined rating/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/calculators/va-disability');
  });
});

test('VA calculator links to /va-disability-rates above its rate table', async ({ page }) => {
  await page.goto('/calculators/va-disability');
  const link = page.getByTestId('va-rates-page-link').locator('a');
  await expect(link).toHaveAttribute('href', '/va-disability-rates');
  await link.click();
  await expect(page).toHaveURL(/\/va-disability-rates$/);
  await expect(page.locator('h1')).toHaveText(vaRatesPageH1(MODE));
});
