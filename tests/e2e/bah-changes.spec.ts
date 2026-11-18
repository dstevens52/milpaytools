import { test, expect } from '@playwright/test';
import { waitForHydration } from './helpers/hydration';
import { BAH_YEAR, BAH_PRIOR_YEAR } from '../../src/data/bah/current';
import { BAH_RATES_BY_YEAR } from '../../src/data/bah/registry';
import { BAH_MHA_COUNT } from '../../src/lib/calculations/bah';
import { currentBahChanges } from '../../src/lib/calculations/bahChangesData';
import { bahChangesDescription, bahChangesH1, bahChangesTitle } from '../../src/lib/calculations/bahChanges';

/** /bah/changes in the browser. Data checks: bah-changes-unit.spec.ts. */

const C = currentBahChanges();

test.describe('/bah/changes', () => {
  test('returns 200 with its own title, H1 and description (no /bah/[slug] collision)', async ({ page }) => {
    const res = await page.goto('/bah/changes');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(bahChangesTitle(BAH_YEAR));
    await expect(page.locator('h1')).toHaveText(bahChangesH1(BAH_YEAR));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', bahChangesDescription(C));
    await expect(page.getByTestId('bah-changes-scope')).toHaveText(
      `${BAH_MHA_COUNT} housing areas · E-5 with dependents · ${BAH_PRIOR_YEAR} → ${BAH_YEAR} · source DTMO`,
    );
    await expect(page.getByTestId('bah-changes-tiles')).toBeVisible();
  });

  test('the server HTML has every MHA row', async ({ request }) => {
    const html = await (await request.get('/bah/changes')).text();
    const ids = new Set([...html.matchAll(/<tr[^>]*\bid="mha-([A-Z]{2}\d{3})"/g)].map((m) => m[1]));
    expect(ids.size).toBe(BAH_MHA_COUNT);
    expect([...ids].sort()).toEqual(Object.keys(BAH_RATES_BY_YEAR[BAH_YEAR]).sort());
  });

  test(`every dollar figure is a ${BAH_PRIOR_YEAR} or ${BAH_YEAR} E-5 rate or a change between them`, async ({ page }) => {
    await page.goto('/bah/changes');
    const allowed = new Set<number>();
    for (const r of C.rows) {
      allowed.add(r.current);
      if (r.prior !== null) allowed.add(r.prior);
      if (r.abs !== null) allowed.add(Math.abs(r.abs));
    }
    const text = await page.locator('main').innerText();
    const amounts = [...text.matchAll(/\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, '')));
    expect(amounts.length).toBeGreaterThan(BAH_MHA_COUNT * 3);
    expect(amounts.filter((a) => !allowed.has(a)), 'dollar figures not from the data').toEqual([]);
  });

  test('sort buttons reorder the table and set aria-sort', async ({ page }) => {
    await page.goto('/bah/changes');
    const table = page.getByTestId('bah-changes-table');
    const firstRow = table.locator('tbody tr').first();
    const pctHeader = table.locator('th', { has: page.getByTestId('bah-changes-sort-pct') });
    const absHeader = table.locator('th', { has: page.getByTestId('bah-changes-sort-abs') });
    const nameHeader = table.locator('th', { has: page.getByTestId('bah-changes-sort-name') });
    await expect(pctHeader).toHaveAttribute('aria-sort', 'descending');
    await expect(firstRow).toHaveAttribute('data-mha', C.rows[0].mha);

    await waitForHydration(page.getByTestId('bah-changes-sort-abs'));
    await page.getByTestId('bah-changes-sort-abs').click();
    await expect(absHeader).toHaveAttribute('aria-sort', 'descending');
    await expect(pctHeader).toHaveAttribute('aria-sort', 'none');
    const maxAbs = [...C.rows].sort((a, b) => b.abs! - a.abs! || b.pct! - a.pct!)[0];
    await expect(firstRow).toHaveAttribute('data-mha', maxAbs.mha);

    await page.getByTestId('bah-changes-sort-name').click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    const firstByName = [...C.rows].sort((a, b) => a.name.localeCompare(b.name))[0];
    await expect(firstRow).toHaveAttribute('data-mha', firstByName.mha);
    await expect(table.locator('tbody tr')).toHaveCount(BAH_MHA_COUNT);
  });

  test('every station link returns 200', async ({ page, request }) => {
    test.slow(); // ~114 station pages
    await page.goto('/bah/changes');
    const hrefs = await page.locator('main a[href^="/bah/"]').evaluateAll((as) =>
      [...new Set(as.map((a) => a.getAttribute('href')!))],
    );
    const stationHrefs = hrefs.filter((h) => /^\/bah\/[a-z0-9-]+$/.test(h) && h !== '/bah/changes');
    expect(stationHrefs.length).toBe(new Set(C.rows.filter((r) => r.station).map((r) => r.station!.slug)).size);
    const bad: string[] = [];
    // One at a time: parallel requests to `next dev` intermittently 500 (dev-server
    // JSON flake, different page each run); production builds are fine either way.
    for (const h of stationHrefs) {
      const status = (await request.head(h)).status();
      if (status !== 200) bad.push(`${h} → ${status}`);
    }
    expect(bad).toEqual([]);
  });

  test('mid-year-changed areas are unranked but in the full table; County Cost Group note links to DTMO', async ({ page }) => {
    await page.goto('/bah/changes');
    for (const r of C.unranked) {
      await expect(page.getByTestId('bah-changes-tile-largest')).not.toContainText(r.name);
      await expect(page.getByTestId('bah-changes-top-increases').locator(`[data-mha="${r.mha}"]`)).toHaveCount(0);
      await expect(page.getByTestId('bah-changes-top-decreases').locator(`[data-mha="${r.mha}"]`)).toHaveCount(0);
      await expect(page.locator(`#mha-${r.mha}`)).toHaveCount(1);
    }
    await expect(page.getByTestId('bah-changes-tile-largest')).toContainText(C.largestIncrease!.name);
    if (C.unranked.length) await expect(page.getByTestId('bah-changes-unranked')).toContainText('Not ranked:');
    const ccg = page.getByTestId('bah-changes-ccg-note');
    await expect(ccg).toContainText('County Cost Groups');
    await expect(ccg.locator('a')).toHaveAttribute('href', 'https://www.travel.dod.mil/Support/ALL-FAQs/Article/2980103/');
  });

  test('rate protection callout sits with the decreases and links to /bah', async ({ page }) => {
    await page.goto('/bah/changes');
    const box = page.getByTestId('bah-changes-protection');
    await expect(box).toContainText('Rate protection means a member already receiving BAH');
    await expect(box.locator('a[href="/bah"]')).toHaveCount(1);
  });
});

test.describe('links in', () => {
  test('/bah links to /bah/changes', async ({ page }) => {
    await page.goto('/bah');
    const link = page.getByTestId('bah-changes-hub-link').locator('a');
    await expect(link).toHaveAttribute('href', '/bah/changes');
    await expect(link).toHaveText(`See which areas' BAH rose or fell for ${BAH_YEAR} →`);
  });

  test('a station page links to its row', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    const link = page.getByTestId('bah-changes-station-link').locator('a');
    await expect(link).toHaveText('How Fort Bragg compares nationally →');
    await expect(link).toHaveAttribute('href', '/bah/changes#mha-NC182');
    await link.click();
    await expect(page).toHaveURL(/\/bah\/changes#mha-NC182$/);
    await expect(page.locator('#mha-NC182')).toBeVisible();
  });
});
