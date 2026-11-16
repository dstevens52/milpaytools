/**
 * Build 04: station page first screen (CONUS).
 *
 * Order: H1 → "Your {year} BAH at {name}" rate card → full rate table (open) →
 * share button → 2027 notice + station alert → How This Market Compares → …
 * Rates come from the same data the page reads, so the checks follow the BAH year.
 * Title, description and H1 are covered by station-serp*.spec.ts (Build 03).
 */
import { test, expect, type Page } from '@playwright/test';
import { getMHACode, getMHARates, getMHARatesForYear, getLocationName, CURRENT_BAH_YEAR, PRIOR_BAH_YEAR } from '../../src/lib/calculations/bah';
import { formatCurrency } from '../../src/lib/utils';
import { formatMhaName } from '../../src/lib/mhaDisplay';
import { STATION_BY_SLUG } from '../../src/data/duty-stations/stations';

const BRAGG = STATION_BY_SLUG['fort-bragg'];
const MHA = getMHACode(BRAGG.zip)!;
const W = getMHARates(MHA, true)!;
const WO = getMHARates(MHA, false)!;
const PW = getMHARatesForYear(MHA, true, PRIOR_BAH_YEAR)!;
const PWO = getMHARatesForYear(MHA, false, PRIOR_BAH_YEAR)!;
const MHA_LABEL = formatMhaName(getLocationName(BRAGG.zip)!);
const rate = (r: Record<string, number>, g: string) => (r as Record<string, number>)[g];

/** The YoYDelta text for a current/prior pair, e.g. "▲ +$21 (1.2%) vs 2025". */
function yoyText(curr: number, prev: number): string {
  const abs = curr - prev;
  if (abs === 0) return `No change vs ${PRIOR_BAH_YEAR}`;
  const pct = Math.abs((abs / prev) * 100).toFixed(1);
  return `${abs > 0 ? '▲ +' : '▼ −'}${formatCurrency(Math.abs(abs))} (${pct}%) vs ${PRIOR_BAH_YEAR}`;
}

const card = (page: Page) => page.getByTestId('bah-rate-card');

test.describe('Station first screen: server HTML (JavaScript off)', () => {
  test.use({ javaScriptEnabled: false });

  test('Fort Bragg: the default rate, YoY line and all 24 table rows are in the HTML and visible', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const e5 = rate(W, 'E-5');
    await expect(card(page)).toBeVisible();
    await expect(card(page).getByRole('heading', { level: 2 })).toHaveText(`Your ${CURRENT_BAH_YEAR} BAH at Fort Bragg`);
    await expect(page.getByTestId('bah-rate-card-amount')).toHaveText(`${formatCurrency(e5)}/month`);
    await expect(card(page)).toContainText(`E-5 with dependents · ${MHA_LABEL} MHA`);
    await expect(page.getByTestId('bah-rate-card-yoy')).toHaveText(`Year over year: ${yoyText(e5, rate(PW, 'E-5'))}`);
    await expect(card(page)).toContainText(`BAH is excluded from federal taxable income. Source: DTMO ${CURRENT_BAH_YEAR} BAH rates.`);

    const rows = page.getByTestId('bah-rate-table').locator('tr[data-grade]');
    await expect(rows).toHaveCount(24);
    for (const g of ['E-1', 'E-5', 'W-3', 'O-1E', 'O-7']) {
      await expect(page.getByTestId('bah-rate-table').locator(`tr[data-grade="${g}"]`), g).toBeVisible();
    }
    await expect(page.getByTestId('bah-rate-table').locator('tr[data-grade="E-5"]')).toHaveAttribute('aria-current', 'true');
    // No expander or collapsed preview.
    await expect(page.getByRole('button', { name: /View all .* BAH rates/ })).toHaveCount(0);
    await expect(page.getByText(/Quick reference/)).toHaveCount(0);
  });

  test('compact hero: facts line, former name + branch line, no 3-step strip', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const hero = page.getByTestId('bah-station-hero');
    await expect(hero.locator('h1')).toHaveText(`Fort Bragg BAH Rates ${CURRENT_BAH_YEAR}`);
    await expect(hero).toContainText(`Fayetteville, NC · ${MHA_LABEL} housing area · effective January 1, ${CURRENT_BAH_YEAR}`);
    await expect(hero).toContainText(`Formerly ${BRAGG.formerName} · ${BRAGG.branches.join(' / ')}`);
    await expect(hero).not.toContainText('82nd Airborne');
    await expect(page.getByText('Check your rate')).toHaveCount(0);
  });

  test('no layout shift on hydration: the card and table sit where the server put them', async ({ browser }) => {
    test.slow(); // two page loads
    const boxes = async (js: boolean) => {
      const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width: 390, height: 844 } });
      const p = await ctx.newPage();
      // 'load' includes the web font. No page.evaluate here: with JavaScript
      // off, Firefox never resolves it.
      await p.goto('/bah/fort-bragg', { waitUntil: 'load' });
      if (js) await p.waitForLoadState('networkidle');
      const r = {
        amount: await p.getByTestId('bah-rate-card-amount').boundingBox(),
        table: await p.getByTestId('bah-rate-table').boundingBox(),
      };
      await ctx.close();
      return r;
    };
    const off = await boxes(false);
    const on = await boxes(true);
    expect(on.amount).toEqual(off.amount);
    expect(on.table).toEqual(off.table);
  });
});

test.describe('Station first screen: interaction', () => {
  test('Fort Bragg E-7 with dependents: card amount, highlighted row, total-pay link', async ({ page }) => {
    await page.goto('/bah/fort-bragg', { waitUntil: 'networkidle' });
    await page.getByLabel('Pay grade').selectOption('E-7');
    await expect(page.getByTestId('bah-rate-card-amount')).toHaveText(`${formatCurrency(rate(W, 'E-7'))}/month`);
    if (CURRENT_BAH_YEAR === '2026') await expect(page.getByTestId('bah-rate-card-amount')).toHaveText('$2,094/month');
    const table = page.getByTestId('bah-rate-table');
    await expect(table.locator('tr[data-grade="E-7"]')).toHaveAttribute('aria-current', 'true');
    await expect(table.locator('tr[data-grade="E-7"]')).toHaveClass(/bg-red-50/);
    await expect(table.locator('tr[data-grade="E-5"]')).not.toHaveAttribute('aria-current', 'true');
    const link = card(page).getByRole('link', { name: `See total pay at Fort Bragg: base pay + BAH + BAS →` });
    await expect(link).toHaveAttribute('href', /rank=e7&zip=28301&dependents=yes/);
    await expect(page.getByRole('button', { name: 'With', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Without', exact: true })).toHaveAttribute('aria-pressed', 'false');
  });

  test('rate protection note: Fort Bragg E-4 without dependents shows it; E-5 with dependents does not', async ({ page }) => {
    await page.goto('/bah/fort-bragg', { waitUntil: 'networkidle' });
    const note = page.getByTestId('bah-rate-card-protection');
    // E-5 with dependents (default) rose, so no note.
    expect(rate(W, 'E-5')).toBeGreaterThanOrEqual(rate(PW, 'E-5'));
    await expect(note).toHaveCount(0);

    await page.getByLabel('Pay grade').selectOption('E-4');
    await page.getByRole('button', { name: 'Without', exact: true }).click();
    await expect(page.getByTestId('bah-rate-card-amount')).toHaveText(`${formatCurrency(rate(WO, 'E-4'))}/month`);
    expect(rate(WO, 'E-4'), 'E-4 without dependents fell at Fort Bragg').toBeLessThan(rate(PWO, 'E-4'));
    await expect(note).toHaveText(
      `Already stationed here? Rate protection keeps your higher ${PRIOR_BAH_YEAR} rate unless your pay grade drops or your dependency status changes.`,
    );
    await expect(page.getByTestId('bah-rate-card-yoy')).toContainText('▼');
  });
});

test.describe('Station first screen: order and moved content', () => {
  test('DOM order: H1, rate card, table, share, 2027 notice / alert, How This Market Compares', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const order = await page.evaluate(() => {
      const q = (sel: string) => document.querySelector(sel);
      const compares = [...document.querySelectorAll('h2')].find((h) => h.textContent === 'How This Market Compares') ?? null;
      const els: [string, Element | null][] = [
        ['h1', q('h1')],
        ['card', q('[data-testid="bah-rate-card"]')],
        ['table', q('[data-testid="bah-rate-table"]')],
        ['share', q('[data-testid="bah-station-share"]')],
        ['notice', q('[data-testid="bah-2027-notice"]') ?? q('[data-testid="bah-station-alert"]')],
        ['compares', compares],
      ];
      const missing = els.filter(([, e]) => !e).map(([n]) => n);
      const inOrder = els.every(([, e], i) => i === 0 || (els[i - 1][1]!.compareDocumentPosition(e!) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
      return { missing, inOrder };
    });
    expect(order.missing).toEqual([]);
    expect(order.inOrder).toBe(true);
    // The share button is the outline (secondary) style now.
    await expect(page.getByTestId('bah-station-share').getByRole('button')).toHaveClass(/border-zinc-300/);
  });

  test('installation sentence opens "How Fort Bragg BAH is set" and is not in the hero', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const how = page.getByTestId('bah-how-set');
    await expect(how.getByTestId('bah-installation-detail')).toHaveText(BRAGG.installationDetail!);
    const first = await how.locator('p').first().textContent();
    expect(first).toBe(BRAGG.installationDetail);
    await expect(page.getByTestId('bah-station-hero')).not.toContainText(BRAGG.installationDetail!);
  });

  test('a station without an installation sentence still renders "How … BAH is set"', async ({ page }) => {
    const slug = Object.values(STATION_BY_SLUG).find((s) => !s.oconus && !s.installationDetail)!.slug;
    await page.goto(`/bah/${slug}`);
    await expect(page.getByTestId('bah-how-set')).toBeVisible();
    await expect(page.getByTestId('bah-installation-detail')).toHaveCount(0);
  });
});

test.describe('Overseas station pages are unchanged', () => {
  for (const slug of ['ramstein-air-base', 'yokota-air-base']) {
    test(`/bah/${slug}: overseas template, no CONUS rate card or table`, async ({ page }) => {
      const res = await page.goto(`/bah/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByTestId('bah-rate-card')).toHaveCount(0);
      await expect(page.getByTestId('bah-rate-table')).toHaveCount(0);
      await expect(page.getByTestId('bah-station-hero')).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'What to do next' })).toBeVisible();
    });
  }
});
