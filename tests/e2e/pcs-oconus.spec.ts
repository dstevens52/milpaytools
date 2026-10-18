import { test, expect, type Page } from '@playwright/test';

// PCS estimator — overseas result mode (fix/pcs-oconus). An overseas move
// shows Dislocation Allowance only plus an explanation panel; no total, no
// mileage, per diem, TLE, or PPM figures. Stateside moves are unchanged.

const OLD_WARNING = 'OCONUS move — limited estimate';
// E-5 with dependents — src/data/pcs/2026/constants.ts (unchanged by this branch).
const DLA_E5_WITH_DEPS = '$3,548.02';

async function expectOverseasMode(page: Page) {
  const results = page.getByTestId('pcs-results');
  await expect(page.getByTestId('pcs-overseas-panel')).toBeVisible();
  await expect(page.getByRole('heading', { name: "What's different about an overseas move" })).toBeVisible();

  const dla = page.getByTestId('pcs-overseas-dla');
  await expect(dla).toContainText('Dislocation Allowance (DLA)');
  await expect(dla).toContainText(DLA_E5_WITH_DEPS);
  await expect(dla).toContainText("It doesn't depend on how far you move.");

  const text = await results.innerText();
  expect(text.length).toBeGreaterThan(200); // an empty panel would pass every absence check below
  for (const absent of [
    'Total estimated PCS entitlements',
    'Government move entitlements total',
    'MALT',
    'Per Diem',
    'TLE (',
    'Gross reimbursement estimate',
    'Move Type Comparison',
    'travel day',
    OLD_WARNING,
  ]) {
    expect(text, `found "${absent}"`).not.toContain(absent);
  }
  // The only dollar figure in the results is DLA.
  expect(text.match(/\$[\d,]+(\.\d+)?/g)).toEqual([DLA_E5_WITH_DEPS]);

  // No input that does nothing: mileage, vehicles, move type, PPM weight/expenses, TLE days.
  for (const sel of ['#distance', '#numPOVs', 'input[name="moveType"]', '#hhgWeight', '#ppmExp', '#tleOld', '#tleNew']) {
    await expect(page.locator(sel), `found input ${sel}`).toHaveCount(0);
  }
  await expect(page.getByText(OLD_WARNING)).toHaveCount(0);
  // BAH / Total Comp cross-links hidden; Save/share kept.
  await expect(page.getByTestId('pcs-cross-links')).toHaveCount(0);
  await expect(page.getByText('Save or share your PCS estimate')).toBeVisible();
  await expect(page.getByTestId('pcs-overseas-panel')).toContainText(
    "Travel to or from an overseas station is usually by air on government-arranged travel, so mileage-based allowances from a stateside move generally don't apply.",
  );

  for (const href of [
    'https://www.travel.dod.mil/Travel-Transportation-Rates/Dislocation-Allowance/',
    'https://www.travel.dod.mil/Allowances/Temporary-Lodging-Allowance/',
    'https://www.militaryonesource.mil/moving-pcs/moving-personal-property/',
    'https://www.militaryonesource.mil/moving-pcs/living-oconus/',
  ]) {
    await expect(page.getByTestId('pcs-overseas-panel').locator(`a[href="${href}"]`)).toHaveCount(1);
  }
}

test.describe('PCS estimator — overseas moves', () => {
  test('CONUS → APO ZIP: DLA and overseas panel only (even with PPM and TLE chosen)', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=E-5&dep=yes&numdep=1&movetype=full-ppm&from=28301&to=09012&miles=1000&tleold=3');
    await expectOverseasMode(page);
    await expect(page.getByRole('link', { name: /housing & COLA guide/ })).toHaveCount(0);
  });

  test('typing an APO ZIP as the destination switches to overseas mode', async ({ page }) => {
    await page.goto('/calculators/pcs');
    await page.getByLabel('Moving from (optional)').pressSequentially('28301', { delay: 50 });
    await page.getByLabel('Moving to (optional)').pressSequentially('09012', { delay: 50 });
    await expectOverseasMode(page);
  });

  test('APO origin → stateside ZIP: overseas mode, no guide link', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=E-5&dep=yes&numdep=1&movetype=gov&from=09012&to=28301');
    await expectOverseasMode(page);
    await expect(page.getByRole('link', { name: /housing & COLA guide/ })).toHaveCount(0);
  });

  test('CONUS → Ramstein: overseas mode plus the Ramstein guide link', async ({ page }) => {
    await page.goto('/calculators/pcs');
    await page.getByLabel('Moving from (optional)').pressSequentially('28301', { delay: 50 });
    await page.getByLabel('Moving to (optional)').pressSequentially('Ramstein', { delay: 50 });
    await page.getByRole('option', { name: /Ramstein Air Base/ }).first().locator('button').dispatchEvent('mousedown');
    await expectOverseasMode(page);
    const guide = page.getByRole('link', { name: 'See the Ramstein Air Base housing & COLA guide →' });
    await expect(guide).toHaveAttribute('href', '/bah/ramstein-air-base');
  });

  // Both installations share one v2 guide (one DTMO locality, GB352).
  for (const base of ['RAF Lakenheath', 'RAF Mildenhall']) {
    test(`CONUS → ${base}: overseas mode plus the Lakenheath & Mildenhall guide link`, async ({ page }) => {
      await page.goto('/calculators/pcs');
      await page.getByLabel('Moving from (optional)').pressSequentially('28301', { delay: 50 });
      await page.getByLabel('Moving to (optional)').pressSequentially(base.replace('RAF ', ''), { delay: 50 });
      await page.getByRole('option', { name: new RegExp(base) }).first().locator('button').dispatchEvent('mousedown');
      await expectOverseasMode(page);
      const guide = page.getByRole('link', { name: 'See the RAF Lakenheath & RAF Mildenhall housing & COLA guide →' });
      await expect(guide).toHaveAttribute('href', '/bah/raf-lakenheath');
    });
  }
});

test.describe('PCS estimator — stateside moves unchanged', () => {
  // Snapshot captured from production (main @ d0c1688, before this branch):
  // E-5 with 1 dependent, government move, 1,000 manual miles, 1 POV.
  test('E-5, 1 dependent, 1,000 miles: same figures as before', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=E-5&dep=yes&numdep=1&movetype=gov&miles=1000&povs=1');
    const results = page.getByTestId('pcs-results');
    // URL params apply after hydration — wait for them before reading figures.
    await expect(results).toContainText('1,000 miles');
    const text = (await results.innerText()).replace(/\s+/g, ' ');
    for (const v of [
      '$4,536', // total
      '3 travel days · 1,000 miles',
      '$3,548.02', // DLA
      '$205.00', // MALT
      '$447.50', // per diem — member
      '$335.63', // per diem — dependents
    ]) {
      expect(text, `missing "${v}"`).toContain(v);
    }
    await expect(page.getByTestId('pcs-overseas-panel')).toHaveCount(0);
    for (const sel of ['#distance', '#numPOVs', '#tleOld', '#tleNew']) {
      await expect(page.locator(sel), `missing input ${sel}`).toHaveCount(1);
    }
    await expect(page.locator('input[name="moveType"]')).toHaveCount(3);
    await expect(page.getByTestId('pcs-cross-links')).toBeVisible();
    await expect(page.getByText('Save or share your PCS estimate')).toBeVisible();
  });

  test('stateside PPM move still shows PPM weight and expense inputs', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=E-5&dep=yes&numdep=1&movetype=full-ppm&miles=1000&povs=1');
    await expect(page.getByTestId('pcs-results')).toContainText('1,000 miles');
    await expect(page.locator('#hhgWeight')).toHaveCount(1);
    await expect(page.locator('#ppmExp')).toHaveCount(1);
  });
});
