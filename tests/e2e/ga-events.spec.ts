import { test, expect, type Page } from '@playwright/test';

// GA4 event payloads, recorded in the browser.
//
// GA only loads on production builds at milpaytools.com (guard in layout.tsx),
// so these tests install a recording window.gtag before any page script runs.
// src/lib/analytics.ts calls window.gtag when it exists, so the recorder sees
// exactly what GA4 would receive.
//
// Side effects are blocked: /api/subscribe (Beehiiv) and /api/track-calculation
// (Redis /admin/stats counters) are answered in the browser and never reach a
// server, and nothing is sent to Google.

type GaCall = [string, string, Record<string, string>];

async function recordGa(page: Page, opts: { optedOut?: boolean; subscribe?: 'ok' | 'fail' } = {}) {
  const calls: GaCall[] = [];
  await page.exposeFunction('__recordGa', (args: GaCall) => {
    calls.push(args);
  });
  await page.addInitScript((optedOut: boolean) => {
    if (optedOut) localStorage.setItem('milpaytools_disable_analytics', 'true');
    const w = window as unknown as { gtag: (...a: unknown[]) => void; __recordGa: (a: unknown[]) => void };
    w.gtag = (...a: unknown[]) => {
      w.__recordGa(a);
    };
  }, !!opts.optedOut);

  const subscribeBodies: string[] = [];
  await page.route('**/api/subscribe', (route) => {
    subscribeBodies.push(route.request().postData() ?? '');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(opts.subscribe === 'fail' ? { success: false, error: 'Test failure' } : { success: true }),
    });
  });
  await page.route('**/api/track-calculation', (route) => route.fulfill({ status: 200, body: '' }));
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());

  const events = (name: string) =>
    calls.filter((c) => c[0] === 'event' && c[1] === name).map((c) => c[2]);
  return { calls, events, subscribeBodies };
}

/** No personal data in any GA call: no email, no 5-digit ZIP. */
function expectNoPersonalData(calls: GaCall[]) {
  const json = JSON.stringify(calls);
  expect(json).not.toContain('@');
  expect(json).not.toMatch(/\b\d{5}\b/);
}

const settle = (page: Page) => page.waitForTimeout(1200);

test.describe('newsletter_signup', () => {
  test('station alert: fires once on success with source, variant and station', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/bah/fort-bragg');
    const card = page.getByTestId('bah-station-alert');
    await card.getByRole('textbox').fill('test@example.com');
    await card.getByRole('button', { name: 'Notify me' }).click();
    await expect(card.getByText(/on the list/)).toBeVisible();
    await settle(page);
    expect(ga.events('newsletter_signup')).toEqual([
      { source: 'bah-alert-fort-bragg', variant: 'card', station: 'fort-bragg' },
    ]);
    expect(ga.subscribeBodies).toHaveLength(1); // answered in the browser, never sent to Beehiiv
    expectNoPersonalData(ga.calls);
  });

  test('footer: source and variant only, no station', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/pay/e5');
    const footer = page.locator('footer');
    await footer.getByRole('textbox').fill('test@example.com');
    await footer.getByRole('button', { name: 'Notify me' }).click();
    await expect(footer.getByText(/on the list/)).toBeVisible();
    await settle(page);
    expect(ga.events('newsletter_signup')).toEqual([{ source: 'footer', variant: 'inline' }]);
    expectNoPersonalData(ga.calls);
  });

  test('failed subscribe sends nothing', async ({ page }) => {
    const ga = await recordGa(page, { subscribe: 'fail' });
    await page.goto('/bah/fort-bragg');
    const card = page.getByTestId('bah-station-alert');
    await card.getByRole('textbox').fill('test@example.com');
    await card.getByRole('button', { name: 'Notify me' }).click();
    await expect(card.getByText('Test failure')).toBeVisible();
    await settle(page);
    expect(ga.events('newsletter_signup')).toEqual([]);
  });
});

test.describe('station_rate_lookup', () => {
  test('first change only: one event, later changes send nothing', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/bah/fort-bragg');
    // Re-clicking the active option ("With" is the default) is not a change.
    await page.getByRole('button', { name: 'With', exact: true }).click();
    await settle(page);
    expect(ga.events('station_rate_lookup')).toEqual([]);

    await page.getByRole('combobox').selectOption('E-7');
    await page.getByRole('combobox').selectOption('O-3');
    await page.getByRole('button', { name: 'Without', exact: true }).click();
    await settle(page);
    expect(ga.events('station_rate_lookup')).toEqual([{ station: 'fort-bragg', grade: 'e7', dependents: 'yes' }]);
  });

  test('a dependents change can be the first change', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/bah/fort-bragg');
    await page.getByRole('button', { name: 'Without', exact: true }).click();
    await settle(page);
    expect(ga.events('station_rate_lookup')).toEqual([{ station: 'fort-bragg', grade: 'e5', dependents: 'no' }]);
  });

  test('URL prefill (?rank=e7&dep=no) does not count as a lookup', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/bah/fort-bragg?rank=e7&dep=no');
    await expect(page.getByRole('combobox')).toHaveValue('E-7');
    await settle(page);
    expect(ga.events('station_rate_lookup')).toEqual([]);
  });
});

test.describe('calc_deeplink_click', () => {
  test('station page → total compensation', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/bah/fort-bragg');
    await page.getByRole('combobox').selectOption('E-7');
    await page.getByRole('link', { name: /Calculate your total compensation/ }).click();
    await expect(page).toHaveURL(/\/calculators\/total-compensation\?rank=e7/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'bah-station', to_calculator: 'total-compensation', grade: 'e7', station: 'fort-bragg' },
    ]);
    expectNoPersonalData(ga.calls); // the link carries the ZIP; the event must not
  });

  test('/pay Quick Lookup → total compensation', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/pay');
    await page.locator('select').first().selectOption('E-7');
    await page.getByRole('link', { name: /Calculate Full Compensation/ }).click();
    await expect(page).toHaveURL(/\/calculators\/total-compensation\?rank=e7/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'pay-hub', to_calculator: 'total-compensation', grade: 'e7' },
    ]);
  });

  test('/pay/e5 hero link → /pay/raise', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/pay/e5');
    await page.getByTestId('pay-raise-link').click();
    await expect(page).toHaveURL(/\/pay\/raise\?grade=e5/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'pay-rank', to_calculator: 'pay-raise', grade: 'e5' },
    ]);
  });

  test('/pay/e5 raise-section link → /pay/raise', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/pay/e5');
    await page.getByRole('link', { name: /Compare every grade and year on the 2027 pay raise calculator/ }).click();
    await expect(page).toHaveURL(/\/pay\/raise\?grade=e5/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'pay-rank', to_calculator: 'pay-raise', grade: 'e5' },
    ]);
  });

  test('starting-service guide → total compensation', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/guides/starting-service');
    await page.getByRole('link', { name: /Calculate My Total Compensation/ }).click();
    await expect(page).toHaveURL(/\/calculators\/total-compensation\?rank=e3/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'guide', to_calculator: 'total-compensation', grade: 'e3' },
    ]);
    expectNoPersonalData(ga.calls);
  });
});

// ─── calculation_run: user action only (Build 02b-1) ──────────────────────────
//
// calculation_run must mean "a person used the calculator". Page loads, defaults
// and values filled in from a shared link never count. One change sends exactly
// one event (800 ms debounce); a quick burst of changes sends one more.

/** Select whichever of two option values isn't selected now, so every call is a real change. */
function toggleSelect(locate: (page: Page) => ReturnType<Page['locator']>, a: string, b: string) {
  return async (page: Page) => {
    const sel = locate(page);
    await sel.selectOption((await sel.inputValue()) === a ? b : a);
  };
}

type CalcCase = {
  name: string;
  path: string;
  /** Shared-link query string with non-default values (fills the calculator in). */
  deep?: string;
  /** One user change that alters the result. Called repeatedly; each call must change it again. */
  change: (page: Page) => Promise<void>;
  /** Fires once per page view (first change only). */
  once?: boolean;
};

const mainSelect = (n: number) => (page: Page) => page.locator('main select').nth(n);

const CALCS: CalcCase[] = [
  { name: 'bah', path: '/bah', deep: '?zip=28310&rank=e5&dependents=yes', change: toggleSelect((p) => p.locator('select#pay-grade'), 'O-3', 'E-7') },
  {
    name: 'cola', path: '/calculators/cola', deep: '?zip=99505',
    change: async (page) => {
      const zip = page.locator('#zip');
      await zip.fill((await zip.inputValue()) === '96813' ? '99701' : '96813');
    },
  },
  { name: 'compare', path: '/calculators/compare', deep: '?zip1=28310&zip2=76544&rank=e5&dependents=yes', change: toggleSelect(mainSelect(0), 'O-3', 'E-7') },
  { name: 'deployment', path: '/calculators/deployment', deep: '?rank=e5&yos=6&zip=28310&dependents=yes&months=6', change: toggleSelect((p) => p.locator('select#pay-grade'), 'O-3', 'E-7') },
  { name: 'dual-military-bah', path: '/calculators/dual-military-bah', deep: '?rank1=e5&rank2=e4&zip=28310&dependents=yes', change: toggleSelect(mainSelect(0), 'O-3', 'E-7') },
  { name: 'education', path: '/calculators/education', deep: '?zip=28310&years=4', change: toggleSelect(mainSelect(0), '6mo', '12mo') },
  { name: 'guard-reserve', path: '/calculators/guard-reserve', deep: '?rank=o3&yos=10&weekends=12&tsp=5', change: toggleSelect((p) => p.locator('#gr-rank'), 'E-9', 'W-4') },
  {
    name: 'healthcare-comparison', path: '/calculators/healthcare-comparison', deep: '?path=aca-subsidy&family=married-1-child&income=50000',
    change: toggleSelect((p) => p.locator('#family-select'), 'married-3plus', 'married-no-kids'), once: true,
  },
  { name: 'pay-charts', path: '/pay', change: toggleSelect(mainSelect(0), 'O-3', 'E-7') },
  { name: 'pay-raise', path: '/pay/raise', deep: '?grade=e5&yos=6', change: toggleSelect((p) => p.locator('#raise-grade'), 'O-3', 'E-7') },
  { name: 'pcs', path: '/calculators/pcs', deep: '?rank=o3&dep=yes&from=28310&to=76544&movetype=full-ppm', change: toggleSelect((p) => p.locator('#rank'), 'O-5', 'E-5') },
  { name: 'retirement', path: '/calculators/retirement', deep: '?rank=e7&yos=20&bal=100000', change: toggleSelect(mainSelect(0), 'E-9', 'E-8') },
  {
    name: 'separation-timeline', path: '/calculators/separation-timeline', deep: '?date=2027-06-01&type=separating',
    change: toggleSelect((p) => p.locator('#tamp-select'), 'yes', 'no'), once: true,
  },
  { name: 'total-compensation', path: '/calculators/total-compensation', deep: '?rank=e5&yos=6&zip=28310&dependents=yes', change: toggleSelect((p) => p.getByLabel('Rank / Pay Grade'), 'O-3', 'E-7') },
  { name: 'transition-readiness', path: '/calculators/transition-readiness', deep: '?rank=e5&yos=6&zip=28310&sal=60000&exp=4000', change: toggleSelect(mainSelect(0), 'O-3', 'E-7') },
  { name: 'tsp', path: '/calculators/tsp', deep: '?balance=10000&rank=e5&yos=6', change: toggleSelect((p) => p.locator('select#pay-grade'), 'O-3', 'E-7') },
  {
    // One click per change (the picked rating, 10% by default, stays selected after an add),
    // so a burst of three stays inside the 800 ms debounce on slower browsers.
    name: 'va-disability', path: '/calculators/va-disability', deep: '?r=50,30',
    change: (page) => page.getByRole('button', { name: '+ Add Rating' }).click(),
  },
  { name: 'va-loan', path: '/calculators/va-loan', deep: '?price=300000&zip=28310&rank=e5', change: toggleSelect((p) => p.locator('#loan-term'), '15', '20') },
  { name: 'va-refinance', path: '/calculators/va-refinance', deep: '?balance=200000&currRate=7&newRate=6', change: toggleSelect((p) => p.locator('#new-loan-term'), '15', '20') },
];

test.describe('calculation_run: user action only', () => {
  const quiet = (page: Page) => page.waitForTimeout(3000);
  const runs = (ga: Awaited<ReturnType<typeof recordGa>>, name: string) =>
    ga.events('calculation_run').filter((p) => p.calculator_name === name).length;

  for (const c of CALCS) {
    test(`${c.name}: none on load or shared link; one per change or burst`, async ({ page }) => {
      const ga = await recordGa(page);

      // Plain load, no action.
      await page.goto(c.path, { waitUntil: 'networkidle' }); // hydrated before any change
      await quiet(page);
      expect(ga.events('calculation_run'), 'plain load').toEqual([]);

      // Shared link that fills the calculator in.
      if (c.deep) {
        await page.goto(c.path + c.deep, { waitUntil: 'networkidle' });
        await quiet(page);
        expect(ga.events('calculation_run'), 'shared-link load').toEqual([]);
      }

      // One change → exactly one event, with the right name.
      await c.change(page);
      await expect.poll(() => runs(ga, c.name), { timeout: 5000 }).toBe(1);
      expect(ga.events('calculation_run')).toEqual([{ calculator_name: c.name, event_category: 'calculator' }]);

      // A burst of three quick changes → one more (none for once-per-page calculators).
      for (let i = 0; i < 3; i++) await c.change(page);
      await page.waitForTimeout(2000);
      expect(runs(ga, c.name), 'after burst').toBe(c.once ? 1 : 2);
      expectNoPersonalData(ga.calls);
    });
  }

  test('a click that does not change the result sends nothing', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/calculators/total-compensation?rank=e5&yos=6&zip=28310&dependents=yes');
    await quiet(page);
    await page.locator('label', { hasText: 'Rank / Pay Grade' }).click(); // inside the calculator, result unchanged
    await quiet(page);
    expect(ga.events('calculation_run')).toEqual([]);
  });
});

test.describe('opt-out (/internal/disable-analytics)', () => {
  test('flag set: no GA events at all', async ({ page }) => {
    const ga = await recordGa(page, { optedOut: true });
    await page.goto('/bah/fort-bragg');
    await page.getByRole('combobox').selectOption('E-7');
    const card = page.getByTestId('bah-station-alert');
    await card.getByRole('textbox').fill('test@example.com');
    await card.getByRole('button', { name: 'Notify me' }).click();
    await expect(card.getByText(/on the list/)).toBeVisible();
    await page.getByRole('link', { name: /Calculate your total compensation/ }).click();
    await expect(page).toHaveURL(/total-compensation/);
    await settle(page);
    expect(ga.calls).toEqual([]);
  });

  test('disable and enable pages set and clear the shared flag', async ({ page }) => {
    await page.goto('/internal/disable-analytics');
    await expect(page.getByText('Google Analytics and Vercel Analytics disabled for this browser.')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('milpaytools_disable_analytics'))).toBe('true');
    await page.evaluate(() => localStorage.setItem('milpaytools_internal', 'true')); // legacy key
    await page.goto('/internal/enable-analytics');
    await expect(page.getByText('Google Analytics and Vercel Analytics enabled for this browser.')).toBeVisible();
    expect(
      await page.evaluate(() => [localStorage.getItem('milpaytools_disable_analytics'), localStorage.getItem('milpaytools_internal')]),
    ).toEqual([null, null]);
  });
});
