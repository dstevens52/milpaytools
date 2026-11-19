import { test, expect, type Page } from '@playwright/test';
import { bahAmount } from './helpers/format';
import { BAH_EXPECTED as X } from './fixtures/bah-expected';

// Grade deep links: every test uses a non-default grade (the calculators
// default to E-5), so a dropped ?rank= fails instead of passing by accident.
//
// Background: station pages linked to the total-compensation calculator with
// ?rank=E-7, which its parser rejected, so non-E-5 members saw an E-5 total.

const FORT_BRAGG_STATION_ZIP = '28301'; // stations.ts fort-bragg zip (NC182, same MHA as 28310)

/** Capture what "Copy result link" writes, without needing clipboard permissions. */
async function stubClipboard(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __copied: string[] }).__copied = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (t: string) => {
          (window as unknown as { __copied: string[] }).__copied.push(t);
        },
      },
    });
  });
}

async function copiedUrl(page: Page): Promise<URL> {
  await page.getByRole('button', { name: 'Copy result link' }).click();
  const handle = await page.waitForFunction(() => {
    const c = (window as unknown as { __copied: string[] }).__copied;
    return c.length > 0 ? c[c.length - 1] : null;
  });
  return new URL((await handle.jsonValue()) as string);
}

test.describe('Station page → total compensation deep link', () => {
  test('Fort Bragg, E-7 with dependents carries rank, ZIP and dependents', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await page.getByRole('combobox').selectOption('E-7');
    await page.getByRole('button', { name: 'With', exact: true }).click();

    const link = page.getByRole('link', { name: /Calculate your total compensation/ });
    await expect(link).toHaveAttribute(
      'href',
      `/calculators/total-compensation?rank=e7&zip=${FORT_BRAGG_STATION_ZIP}&dependents=yes`,
    );
    await link.click();

    await expect(page).toHaveURL(/\/calculators\/total-compensation\?/);
    await expect(page.getByLabel('Rank / Pay Grade')).toHaveValue('E-7');
    await expect(page.getByRole('button', { name: 'With dependents' })).toHaveClass(/bg-red-700/);
    // The BAH line is the E-7 with-dependents Fort Bragg rate: proves grade, ZIP
    // and dependents all reached the calculation (E-5 would show $1,806).
    await expect(page.getByText(bahAmount(X.bragg.e7W)).first()).toBeVisible();
  });
});

test.describe('Grade params in the long (E-7) form are accepted', () => {
  test('total compensation: ?rank=E-7 selects E-7', async ({ page }) => {
    await page.goto('/calculators/total-compensation?rank=E-7');
    await expect(page.getByLabel('Rank / Pay Grade')).toHaveValue('E-7');
  });

  test('BAH hub (redirect target of old /calculators/bah links): ?rank=E-7 selects E-7', async ({ page }) => {
    await page.goto('/bah?rank=E-7');
    await expect(page.getByLabel('Pay Grade')).toHaveValue('E-7');
  });
});

test.describe('PCS: old and new share links', () => {
  const rest = 'dep=yes&numdep=1&movetype=gov&miles=1000&povs=1';

  test('old share link (?rank=E-7) loads E-7', async ({ page }) => {
    await page.goto(`/calculators/pcs?rank=E-7&${rest}`);
    await expect(page.locator('#rank')).toHaveValue('E-7');
  });

  test('new share link (?rank=e7) loads E-7', async ({ page }) => {
    await page.goto(`/calculators/pcs?rank=e7&${rest}`);
    await expect(page.locator('#rank')).toHaveValue('E-7');
  });

  // O-1E–O-3E are valid PCS grades since build 07 (PCS-05); O-4E doesn't exist.
  for (const bad of ['x5', 'E-99', 'O-4E', '']) {
    test(`invalid ?rank=${JSON.stringify(bad)} falls back to E-5 without an error`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      // povs=2 is not the default: wait for it so the URL params have been
      // applied before checking the rank (E-5 is also the first-render value).
      // Before the fix an invalid rank left the select on E-1.
      await page.goto(`/calculators/pcs?rank=${encodeURIComponent(bad)}&dep=yes&numdep=1&movetype=gov&miles=1000&povs=2`);
      await expect(page.locator('#numPOVs')).toHaveValue('2');
      await expect(page.locator('#rank')).toHaveValue('E-5');
      const body = await page.locator('main').innerText();
      expect(body).not.toContain('NaN');
      expect(errors).toEqual([]);
    });
  }

  test('copied share link uses the short form (rank=e7)', async ({ page }) => {
    await stubClipboard(page);
    await page.goto(`/calculators/pcs?rank=E-7&${rest}`);
    await expect(page.locator('#rank')).toHaveValue('E-7');
    const url = await copiedUrl(page);
    expect(url.searchParams.get('rank')).toBe('e7');
  });
});

test.describe('Guard/Reserve: old and new share links', () => {
  test('old share link (?rank=E-7) loads E-7', async ({ page }) => {
    await page.goto('/calculators/guard-reserve?rank=E-7&yos=10');
    await expect(page.locator('#gr-rank')).toHaveValue('E-7');
  });

  test('new share link (?rank=e7) loads E-7', async ({ page }) => {
    await page.goto('/calculators/guard-reserve?rank=e7&yos=10');
    await expect(page.locator('#gr-rank')).toHaveValue('E-7');
  });

  test('prior-enlisted grade (not offered here) falls back to E-5', async ({ page }) => {
    // yos=10 is not the default: wait for it so the URL params have been applied.
    await page.goto('/calculators/guard-reserve?rank=o1e&yos=10');
    await expect(page.locator('#gr-yos')).toHaveValue('10'); // default is 6
    await expect(page.locator('#gr-rank')).toHaveValue('E-5');
  });

  test('copied share link uses the short form (rank=e7)', async ({ page }) => {
    await stubClipboard(page);
    await page.goto('/calculators/guard-reserve?rank=E-7&yos=10');
    await expect(page.locator('#gr-rank')).toHaveValue('E-7');
    const url = await copiedUrl(page);
    expect(url.searchParams.get('rank')).toBe('e7');
  });
});
