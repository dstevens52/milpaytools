/**
 * Build 04b: "Total monthly pay at {station} by rank" on CONUS station pages.
 *
 * Expected figures are computed here straight from the data files (DFAS pay
 * table, BAS_RATES, the station's DTMO BAH rates), not from the section's lib
 * (src/lib/calculations/stationTotalPay.ts), so a lib bug can't hide.
 * Title/meta/H1 stay covered by station-serp*.spec.ts; the first screen by
 * station-first-screen.spec.ts.
 */
import { test, expect, type Page } from '@playwright/test';
import { payTable, DATA_YEAR as PAY_YEAR, E1_UNDER_4_MONTHS } from '../../src/data/pay-tables/2026';
import { BAS_RATES } from '../../src/data/constants';
import { getMHACode, getMHARates, getMHARatesForYear, isBahYear, CURRENT_BAH_YEAR } from '../../src/lib/calculations/bah';
import { DUTY_STATIONS, STATION_BY_SLUG } from '../../src/data/duty-stations/stations';
import { stationTotalPay, stationTotalPayForYears } from '../../src/lib/calculations/stationTotalPay';
import { formatCurrency } from '../../src/lib/utils';
import { waitForHydration } from './helpers/hydration';

const GRADES = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  'O-1E', 'O-2E', 'O-3E',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7',
] as const;

const fmt = (n: number) => formatCurrency(n);
const range = (a: number, b: number) => (a === b ? fmt(a) : `${fmt(a)}–${fmt(b)}`);

/** Expected row for one grade, from the raw data files: the pay table's year and that year's BAH. */
function expected(slug: string, grade: string, dependents: boolean) {
  const station = STATION_BY_SLUG[slug];
  const mha = getMHACode(station.zip)!;
  expect(isBahYear(PAY_YEAR), `BAH ${PAY_YEAR} is registered`).toBe(true);
  const bah = getMHARatesForYear(mha, dependents, PAY_YEAR as typeof CURRENT_BAH_YEAR)![grade];
  const pay = Object.values((payTable as Record<string, Record<string, number>>)[grade]);
  const min = Math.min(...pay);
  const max = Math.max(...pay);
  const bas = grade.startsWith('E-') ? BAS_RATES.enlisted : BAS_RATES.officer;
  return {
    basic: range(min, max),
    bah: fmt(bah),
    bas: fmt(bas),
    total: range(min + bah + bas, max + bah + bas),
    totalMin: min + bah + bas,
    totalMax: max + bah + bas,
  };
}

const section = (page: Page) => page.getByTestId('station-total-pay');
const row = (page: Page, g: string) => section(page).locator(`tr[data-grade="${g}"]`);

test.describe('Station total pay: data (no browser)', () => {
  test('every CONUS station has 24 rows, every total = basic min/max + BAH + BAS, no zero or missing figure', () => {
    const conus = DUTY_STATIONS.filter((s) => !s.oconus);
    expect(conus.length).toBeGreaterThan(100); // non-empty control
    for (const s of conus) {
      const mha = getMHACode(s.zip);
      expect(mha, s.slug).toBeTruthy();
      const w = getMHARates(mha!, true)!;
      const wo = getMHARates(mha!, false)!;
      const { rows } = stationTotalPay(w, wo);
      expect(rows.map((r) => r.grade), s.slug).toEqual([...GRADES]);
      for (const r of rows) {
        const pay = Object.values((payTable as Record<string, Record<string, number>>)[r.grade]);
        expect(r.basicMin, `${s.slug} ${r.grade}`).toBe(Math.min(...pay));
        expect(r.basicMax, `${s.slug} ${r.grade}`).toBe(Math.max(...pay));
        expect(r.bas).toBe(r.grade.startsWith('E-') ? BAS_RATES.enlisted : BAS_RATES.officer);
        for (const [d, rates] of [[r.w, w], [r.wo, wo]] as const) {
          expect(d, `${s.slug} ${r.grade}`).not.toBeNull();
          expect(d!.bah).toBe(rates[r.grade]);
          expect(d!.totalMin).toBeCloseTo(r.basicMin! + rates[r.grade] + r.bas, 2);
          expect(d!.totalMax).toBeCloseTo(r.basicMax! + rates[r.grade] + r.bas, 2);
          expect(d!.totalMin!).toBeGreaterThan(0);
        }
      }
    }
  });
});

test.describe('Station total pay: release day never mixes years (no browser)', () => {
  const NEXT = String(Number(PAY_YEAR) + 1);
  const mha = getMHACode(STATION_BY_SLUG['fort-bragg'].zip)!;
  // The pay year's BAH (not "current"): after the BAH flip the current year is newer.
  const payYear = PAY_YEAR as typeof CURRENT_BAH_YEAR;
  const current = { w: getMHARatesForYear(mha, true, payYear)!, wo: getMHARatesForYear(mha, false, payYear)! };
  // Stand-in next-year BAH: every rate +$123, so any leak into the section shows.
  const bump = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).map(([g, v]) => [g, v + 123]));
  const standIn = { w: bump(current.w), wo: bump(current.wo) };

  test(`${NEXT} BAH loaded, ${PAY_YEAR} pay table: the section stays on ${PAY_YEAR} pay AND ${PAY_YEAR} BAH`, () => {
    expect(current.w['E-5']).toBeGreaterThan(0); // control: real pay-year rates (R2: an equality with CURRENT_BAH_YEAR failed after the flip)
    const asked: string[] = [];
    const d = stationTotalPayForYears((y) => {
      asked.push(y);
      return y === PAY_YEAR ? current : y === NEXT ? standIn : null;
    }, NEXT)!;
    expect(asked).toEqual([PAY_YEAR]); // never reads the newer BAH
    expect(d.payYear).toBe(PAY_YEAR);
    expect(d.pendingYear).toBe(NEXT);
    const e5 = d.rows.find((r) => r.grade === 'E-5')!;
    expect(e5.w!.bah).toBe(current.w['E-5']);
    expect(e5.w!.bah).not.toBe(standIn.w['E-5']);
    for (const r of d.rows) {
      expect(r.w!.bah, r.grade).toBe(current.w[r.grade]);
      expect(r.wo!.bah, r.grade).toBe(current.wo[r.grade]);
      expect(r.w!.totalMin).toBeCloseTo(r.basicMin! + current.w[r.grade] + r.bas, 2);
    }
  });

  test('same year: no pending line; BAH missing for the pay year: no section', () => {
    expect(stationTotalPayForYears(() => current, PAY_YEAR)!.pendingYear).toBeNull();
    expect(stationTotalPayForYears(() => null, NEXT)).toBeNull();
  });
});

test.describe('Station total pay: server HTML (JavaScript off)', () => {
  test.use({ javaScriptEnabled: false });

  for (const slug of ['fort-bragg', 'naval-station-norfolk', 'naval-station-san-diego']) {
    test(`${slug}: heading, lead, 24 with-dependents rows checked against the data files`, async ({ page }) => {
      const station = STATION_BY_SLUG[slug];
      await page.goto(`/bah/${slug}`);
      await expect(section(page).getByRole('heading', { level: 2 })).toHaveText(
        `Total monthly pay at ${station.name} by rank (${PAY_YEAR})`,
      );
      // The "{next} totals appear…" line shows only while a newer BAH year is loaded.
      await expect(page.getByTestId('station-total-pay-pending')).toHaveCount(CURRENT_BAH_YEAR === PAY_YEAR ? 0 : 1);
      const e5 = expected(slug, 'E-5', true);
      await expect(page.getByTestId('station-total-pay-lead')).toHaveText(
        `At ${station.name}, an E-5 with dependents earns between ${fmt(e5.totalMin)} and ${fmt(e5.totalMax)} a month in basic pay + BAH + BAS, depending on years of service.`,
      );
      await expect(section(page).locator('tr[data-grade]')).toHaveCount(24);
      for (const g of GRADES) {
        const e = expected(slug, g, true);
        const r = row(page, g);
        await expect(r.locator('[data-col="basic"]'), g).toHaveText(e.basic);
        await expect(r.locator('[data-col="bah"]'), g).toHaveText(e.bah);
        await expect(r.locator('[data-col="bas"]'), g).toHaveText(e.bas);
        await expect(r.locator('[data-col="total"]'), g).toHaveText(e.total);
        await expect(r.getByRole('link', { name: 'Your exact total →' })).toHaveAttribute(
          'href',
          `/calculators/total-compensation?rank=${g.replace(/-/g, '').toLowerCase()}&zip=${station.zip}&dependents=yes`,
        );
      }
      await expect(row(page, 'E-5')).toHaveAttribute('aria-current', 'true');
      // O-8 and above are not shown, as in the rate table.
      await expect(section(page).locator('tr[data-grade="O-8"]')).toHaveCount(0);
      const text = (await section(page).textContent()) ?? '';
      expect(text).not.toMatch(/\$0(?![\d,])/);
      expect(text).not.toContain('NaN');
    });
  }

  test('Fort Bragg: placement after the rate table and before the share button; footnote', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const inOrder = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="bah-rate-table"]')!;
      const s = document.querySelector('[data-testid="station-total-pay"]')!;
      const sh = document.querySelector('[data-testid="bah-station-share"]')!;
      return !!(t.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        !!(s.compareDocumentPosition(sh) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(inOrder).toBe(true);
    const foot = page.getByTestId('station-total-pay-footnote');
    await expect(foot).toContainText('Not included: special pays, allowances like FSA or COLA, and taxes.');
    await expect(foot).toContainText('Basic pay is taxable; BAH and BAS are excluded from federal taxable income.');
    await expect(foot).toContainText(`An E-1 with less than 4 months of service gets ${fmt(E1_UNDER_4_MONTHS)} basic pay.`);
    await expect(foot).toContainText('(E-8, E-9, W-5, O-1E, O-2E, and O-3E start above the first column)');
    await expect(foot.getByRole('link', { name: `DFAS ${PAY_YEAR} basic pay` })).toHaveAttribute('href', /dfas\.mil/);
    await expect(foot.getByRole('link', { name: `DTMO ${PAY_YEAR} BAH` })).toHaveAttribute('href', /travel\.dod\.mil/);
    await expect(foot.getByRole('link', { name: 'DFAS BAS' })).toHaveAttribute('href', /dfas\.mil/);
    await expect(section(page)).not.toContainText('tax-free');
  });

  test('overseas pages have no total-pay section', async ({ page }) => {
    for (const slug of ['ramstein-air-base', 'yokota-air-base']) {
      await page.goto(`/bah/${slug}`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(section(page), slug).toHaveCount(0);
    }
  });
});

test.describe('Station total pay: toggle and rank selector', () => {
  test('Fort Bragg: Without switches BAH, totals, lead and links; rank pick moves the highlight', async ({ page }) => {
    const slug = 'fort-bragg';
    const station = STATION_BY_SLUG[slug];
    await page.goto(`/bah/${slug}`);
    await waitForHydration(page.getByRole('button', { name: 'Without', exact: true }));
    await page.getByRole('button', { name: 'Without', exact: true }).click();

    await expect(page.getByTestId('station-total-pay-lead')).toContainText('an E-5 without dependents earns between');
    for (const g of GRADES) {
      const e = expected(slug, g, false);
      await expect(row(page, g).locator('[data-col="bah"]'), g).toHaveText(e.bah);
      await expect(row(page, g).locator('[data-col="total"]'), g).toHaveText(e.total);
      await expect(row(page, g).locator('[data-col="basic"]'), g).toHaveText(e.basic); // unchanged
    }
    await expect(row(page, 'O-3').getByRole('link', { name: 'Your exact total →' })).toHaveAttribute(
      'href',
      `/calculators/total-compensation?rank=o3&zip=${station.zip}&dependents=no`,
    );

    await page.getByLabel('Pay grade').selectOption('W-2');
    await expect(row(page, 'W-2')).toHaveAttribute('aria-current', 'true');
    await expect(row(page, 'E-5')).not.toHaveAttribute('aria-current', 'true');
    const w2 = expected(slug, 'W-2', false);
    await expect(page.getByTestId('station-total-pay-lead')).toHaveText(
      `At ${station.name}, a W-2 without dependents earns between ${fmt(w2.totalMin)} and ${fmt(w2.totalMax)} a month in basic pay + BAH + BAS, depending on years of service.`,
    );

    // Single-rate grade: one figure, no "between".
    await page.getByLabel('Pay grade').selectOption('E-1');
    const e1 = expected(slug, 'E-1', false);
    await expect(page.getByTestId('station-total-pay-lead')).toHaveText(
      `At ${station.name}, an E-1 without dependents earns ${fmt(e1.totalMax)} a month in basic pay + BAH + BAS. The ${PAY_YEAR} pay table has one E-1 rate at every years-of-service step.`,
    );
  });

  test('phones: the table fits 390 px with no horizontal scroll and shows the parts under each total', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/bah/fort-bragg');
    const fit = await section(page).locator('.overflow-x-auto').evaluate((d) => [d.scrollWidth, d.clientWidth]);
    expect(fit[0]).toBeLessThanOrEqual(fit[1]);
    const e = expected('fort-bragg', 'E-6', true);
    await expect(row(page, 'E-6').locator('[data-col="parts"]')).toBeVisible();
    await expect(row(page, 'E-6').locator('[data-col="parts"]')).toHaveText(`Basic ${e.basic}+ BAH ${e.bah} + BAS ${e.bas}`);
    await expect(row(page, 'E-6').locator('[data-col="basic"]')).toBeHidden();
  });
});
