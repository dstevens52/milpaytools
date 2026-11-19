import { test, expect, type Locator, type Page } from '@playwright/test';
import { holdClientJs, expectNotHydrated, waitForHydration } from './helpers/hydration';
import { getBAH } from './helpers/data';
import { formatCurrency } from '../../src/lib/utils';

// Build 1b: input made BEFORE React hydrates must survive. Each test holds back the
// client JS, acts on the prerendered HTML (asserting React doesn't own the control
// yet), releases the JS, waits for hydration, and checks the result.

type SubscribeBody = { email?: string; source?: string };

async function interceptSubscribe(page: Page) {
  const bodies: SubscribeBody[] = [];
  await page.route('**/api/subscribe', async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
  return bodies;
}

/** Records window.gtag calls (GA itself only loads on production at milpaytools.com). */
async function recordGtag(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { gtag: (...a: unknown[]) => void; __gtagCalls: unknown[][] };
    w.__gtagCalls = [];
    w.gtag = (...a: unknown[]) => {
      w.__gtagCalls.push(a);
    };
  });
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
  return async (name: string) =>
    page.evaluate(
      (n) =>
        (window as unknown as { __gtagCalls: unknown[][] }).__gtagCalls
          .filter((c) => c[0] === 'event' && c[1] === n)
          .map((c) => c[2]),
      name,
    );
}

test.describe('EmailSignup — address typed before hydration', () => {
  test('station alert signup: typed before hydration, submitted after → address sent', async ({ page }) => {
    const bodies = await interceptSubscribe(page);
    const release = await holdClientJs(page);
    await page.goto('/bah/naval-station-norfolk', { waitUntil: 'commit' });

    const alert = page.getByTestId('bah-station-alert');
    const input = alert.getByPlaceholder('you@example.com');
    const button = alert.getByRole('button', { name: 'Notify me' });
    await expect(input).toBeVisible();
    await expectNotHydrated(input);
    await input.fill('early@example.com');
    await expect(button).toBeDisabled();

    release();
    await waitForHydration(button);
    await expect(input).toHaveValue('early@example.com');
    await expect(button).toBeEnabled();
    await button.click();
    await expect(alert).toContainText("You're on the list.");
    expect(bodies).toEqual([{ email: 'early@example.com', source: 'bah-alert-naval-station-norfolk' }]);
  });

  test('footer signup: typed before hydration survives hydration and is sent', async ({ page }) => {
    const bodies = await interceptSubscribe(page);
    const release = await holdClientJs(page);
    await page.goto('/calculators/cola', { waitUntil: 'commit' });

    const footer = page.locator('footer');
    const input = footer.getByPlaceholder('you@example.com');
    const button = footer.getByRole('button', { name: 'Notify me' });
    await expect(input).toBeVisible();
    await expectNotHydrated(input);
    await input.fill('footer@example.com');

    release();
    await waitForHydration(button);
    await expect(input).toHaveValue('footer@example.com');
    await button.click();
    await expect(footer).toContainText("You're on the list.");
    expect(bodies).toHaveLength(1);
    expect(bodies[0].email).toBe('footer@example.com');
  });

  test('submit before JS loads does nothing: no reload, address kept, sent once hydrated', async ({ page }) => {
    const bodies = await interceptSubscribe(page);
    const release = await holdClientJs(page);
    await page.goto('/bah/naval-station-norfolk', { waitUntil: 'commit' });

    const alert = page.getByTestId('bah-station-alert');
    const input = alert.getByPlaceholder('you@example.com');
    const button = alert.getByRole('button', { name: 'Notify me' });
    await expect(input).toBeVisible();
    await expectNotHydrated(button);
    await expect(button).toBeDisabled();

    let navigations = 0;
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) navigations++;
    });
    await input.fill('early@example.com');
    await input.press('Enter'); // implicit submission: blocked while the only submit button is disabled
    await button.click({ force: true }); // a click on a disabled button does nothing
    await page.waitForTimeout(500);
    expect(navigations, 'no page reload from a pre-JS submit').toBe(0);
    await expect(input).toHaveValue('early@example.com');
    expect(bodies).toEqual([]);

    release();
    await waitForHydration(button);
    await button.click();
    await expect(alert).toContainText("You're on the list.");
    expect(bodies).toEqual([{ email: 'early@example.com', source: 'bah-alert-naval-station-norfolk' }]);
  });
});

test.describe('Station page — rank picked before hydration (follow-up 3)', () => {
  test('O-3 picked before hydration shows O-3 numbers, never E-5; URL + station_rate_lookup', async ({ page }) => {
    const o3 = getBAH('28310', 'O-3', true);
    expect(o3).not.toBeNull();
    const events = await recordGtag(page);
    const release = await holdClientJs(page);
    await page.goto('/bah/fort-bragg', { waitUntil: 'commit' });

    const select = page.getByLabel('Pay grade');
    await expect(select).toBeVisible();
    await expectNotHydrated(select);
    await select.selectOption('O-3');

    release();
    await waitForHydration(select);
    await expect(select).toHaveValue('O-3');
    await expect(page.getByTestId('bah-rate-card-amount')).toHaveText(`${formatCurrency(o3!)}/month`);
    await expect(page.getByTestId('bah-rate-card')).toContainText('O-3 with dependents');
    await expect(page).toHaveURL(/[?&]rank=O-3(&|$)/);
    await expect(page).toHaveURL(/[?&]dep=yes(&|$)/);
    await expect.poll(() => events('station_rate_lookup')).toEqual([
      { station: 'fort-bragg', grade: 'o3', dependents: 'yes' },
    ]);
  });

  test('a pre-hydration pick wins over ?rank=; ?dep= still applies', async ({ page }) => {
    const o3wo = getBAH('28310', 'O-3', false);
    expect(o3wo).not.toBeNull();
    const events = await recordGtag(page);
    const release = await holdClientJs(page);
    await page.goto('/bah/fort-bragg?rank=e7&dep=no', { waitUntil: 'commit' });

    const select = page.getByLabel('Pay grade');
    await expect(select).toBeVisible();
    await expectNotHydrated(select);
    await select.selectOption('O-3');

    release();
    await waitForHydration(select);
    await expect(select).toHaveValue('O-3');
    await expect(page.getByTestId('bah-rate-card-amount')).toHaveText(`${formatCurrency(o3wo!)}/month`);
    await expect(page.getByTestId('bah-rate-card')).toContainText('O-3 without dependents');
    await expect(page).toHaveURL(/[?&]rank=O-3(&|$)/);
    await expect.poll(() => events('station_rate_lookup')).toEqual([
      { station: 'fort-bragg', grade: 'o3', dependents: 'no' },
    ]);
  });

  test('no pre-hydration pick: ?rank= applies, URL untouched, no event', async ({ page }) => {
    const e7 = getBAH('28310', 'E-7', true);
    const events = await recordGtag(page);
    await page.goto('/bah/fort-bragg?rank=e7');
    const select = page.getByLabel('Pay grade');
    await waitForHydration(select);
    await expect(select).toHaveValue('E-7');
    await expect(page.getByTestId('bah-rate-card-amount')).toHaveText(`${formatCurrency(e7!)}/month`);
    await page.waitForTimeout(500);
    expect(new URL(page.url()).search).toBe('?rank=e7');
    expect(await events('station_rate_lookup')).toEqual([]);
  });
});

// ─── Build 1c: every calculator ─────────────────────────────────────────────
// A value picked or typed before hydration must drive the results. The oracle is the
// calculator itself: the same change made AFTER hydration on a fresh page gives the
// expected results, and they must differ from the defaults (so the change mattered).

type PreCase = {
  name: string;
  path: string;
  /** A control that exists in the server HTML (asserted not hydrated, then awaited). */
  control: (p: Page) => Locator;
  /** The changes: one select and one text input where the calculator has them. */
  act: (p: Page) => Promise<void>;
  /** Optional step after hydration, in both runs (e.g. a button that commits the inputs). */
  then?: (p: Page) => Promise<void>;
  /** Text that reflects the result (`main` when the calculator has no single result element). */
  result: (p: Page) => Locator;
};

async function resultText(loc: Locator): Promise<string> {
  return (await loc.count()) ? (await loc.first().innerText()).trim() : '';
}

async function expectedAfterHydration(page: Page, c: PreCase): Promise<{ before: string; after: string }> {
  const p2 = await page.context().newPage();
  await p2.goto(c.path);
  await waitForHydration(c.control(p2));
  await p2.waitForTimeout(500);
  const before = await resultText(c.result(p2));
  await c.act(p2);
  if (c.then) await c.then(p2);
  let after = before;
  await expect
    .poll(async () => (after = await resultText(c.result(p2))), { message: `${c.name}: the change moves the result`, timeout: 10_000 })
    .not.toBe(before);
  // Settled: no lookup in flight and two reads 750 ms apart agree.
  await expect
    .poll(
      async () => {
        const a = await resultText(c.result(p2));
        await p2.waitForTimeout(750);
        after = await resultText(c.result(p2));
        return a === after && !/Looking up…|Checking the/.test(after);
      },
      { message: `${c.name}: reference result settles`, timeout: 15_000 },
    )
    .toBe(true);
  await p2.close();
  return { before, after };
}

async function expectPreHydrationChangeApplied(page: Page, c: PreCase) {
  const { after } = await expectedAfterHydration(page, c);
  const release = await holdClientJs(page);
  await page.goto(c.path, { waitUntil: 'commit' });
  const control = c.control(page);
  await expect(control).toBeVisible();
  await expectNotHydrated(control);
  await c.act(page);
  release();
  await waitForHydration(control);
  if (c.then) await c.then(page);
  await expect(c.result(page).first()).toHaveText(after, { timeout: 10_000, useInnerText: true });
}

/** A control by its associated label. */
const byLabel = (label: string) => (p: Page) => p.getByLabel(label, { exact: true }).first();
/** A control by the visible label right before it (for labels without htmlFor). */
const afterLabel = (text: string) => (p: Page) =>
  p.locator(`xpath=//label[contains(normalize-space(.), "${text}")]/following::*[self::input or self::select][1]`).first();
const byId = (id: string) => (p: Page) => p.locator(`#${id}`).first();
const main = (p: Page) => p.locator('main');

const PRE_CASES: PreCase[] = [
  {
    name: 'total-compensation',
    path: '/calculators/total-compensation',
    control: byLabel('Rank / Pay Grade'),
    act: async (p) => {
      await p.getByLabel('Rank / Pay Grade').selectOption('E-7');
      await p.getByLabel('Duty Station').fill('28310');
    },
    result: (p) => p.getByTestId('tc-monthly-total'),
  },
  {
    name: 'bah',
    path: '/bah',
    control: byLabel('Pay Grade'),
    act: async (p) => {
      await byLabel('Pay Grade')(p).selectOption('E-7');
      await byLabel('Duty Station')(p).fill('28310');
    },
    result: (p) => p.getByTestId('bah-monthly-rate'),
  },
  {
    name: 'cola (ZIP only)',
    path: '/calculators/cola',
    control: byId('zip'),
    act: async (p) => {
      await byId('zip')(p).fill('28310');
    },
    result: (p) => p.getByTestId('cola-result-area'),
  },
  {
    name: 'compare',
    path: '/calculators/compare',
    control: afterLabel('Pay grade'),
    act: async (p) => {
      await afterLabel('Pay grade')(p).selectOption('E-7');
      await afterLabel('Years of service')(p).fill('12');
    },
    result: main,
  },
  {
    name: 'deployment',
    path: '/calculators/deployment',
    control: byId('pay-grade'),
    act: async (p) => {
      await byId('pay-grade')(p).selectOption('E-7');
      await byId('zip')(p).fill('28310');
    },
    result: (p) => p.getByTestId('deployment-results'),
  },
  {
    name: 'dual-military-bah',
    path: '/calculators/dual-military-bah',
    control: byLabel('Pay Grade'),
    act: async (p) => {
      await byLabel('Pay Grade')(p).selectOption('E-7');
      await byLabel('Shared Duty Station')(p).fill('28310');
    },
    result: main,
  },
  {
    name: 'education',
    path: '/calculators/education',
    control: afterLabel('Active duty time since'),
    act: async (p) => {
      await afterLabel('Active duty time since')(p).selectOption({ index: 2 });
      await p.getByPlaceholder('e.g. 92101, 78234, 28310').fill('92101');
    },
    result: main,
  },
  {
    name: 'guard-reserve',
    path: '/calculators/guard-reserve',
    control: byId('gr-rank'),
    act: async (p) => {
      await byId('gr-rank')(p).selectOption({ index: 6 });
      await byId('gr-weekends')(p).fill('10');
    },
    result: (p) => p.getByTestId('gr-total-value'),
  },
  {
    name: 'healthcare-comparison (selects only by default)',
    path: '/calculators/healthcare-comparison',
    control: byId('family-select'),
    act: async (p) => {
      await byId('family-select')(p).selectOption({ index: 1 });
      await byId('path-select')(p).selectOption({ index: 1 }); // income field only shows on some paths
    },
    result: main,
  },
  {
    name: 'pay charts (/pay, selects only)',
    path: '/pay',
    control: afterLabel('Pay Grade'),
    act: async (p) => {
      await afterLabel('Pay Grade')(p).selectOption('E-7');
      await afterLabel('Years of Service')(p).selectOption('10');
    },
    result: main,
  },
  {
    name: 'pay raise (/pay/raise, selects only)',
    path: '/pay/raise',
    control: byId('raise-grade'),
    act: async (p) => {
      await byId('raise-grade')(p).selectOption('E-7');
      await byId('raise-yos')(p).selectOption('10');
    },
    result: (p) => p.getByTestId('raise-calculator'),
  },
  {
    name: 'pcs',
    path: '/calculators/pcs',
    control: byId('rank'),
    act: async (p) => {
      await byId('rank')(p).selectOption({ index: 8 });
      await byLabel('Moving from (optional)')(p).fill('28310');
      await byLabel('Moving to (optional)')(p).fill('98433');
    },
    result: main,
  },
  {
    name: 'retirement',
    path: '/calculators/retirement',
    control: afterLabel('Current Rank'),
    act: async (p) => {
      await afterLabel('Current Rank')(p).selectOption({ index: 6 });
      await afterLabel('Current TSP Balance')(p).fill('80000');
    },
    result: main,
  },
  {
    name: 'separation-timeline',
    path: '/calculators/separation-timeline',
    control: byId('tamp-select'),
    act: async (p) => {
      await byId('tamp-select')(p).selectOption({ index: 1 });
      await byId('sep-date')(p).fill('2027-09-30');
    },
    result: main,
  },
  {
    name: 'transition-readiness',
    path: '/calculators/transition-readiness',
    control: byLabel('Rank / Pay Grade'),
    act: async (p) => {
      await byLabel('Rank / Pay Grade')(p).selectOption('E-7');
      await byLabel('Target Civilian Salary (annual gross)')(p).fill('90000');
    },
    result: main,
  },
  {
    name: 'tsp',
    path: '/calculators/tsp',
    control: byLabel('Pay Grade'),
    act: async (p) => {
      await byLabel('Pay Grade')(p).selectOption('E-7');
      await byLabel('Current TSP Balance')(p).fill('50000');
    },
    result: main,
  },
  {
    name: 'va-disability (select + text, then + Add Rating)',
    path: '/calculators/va-disability',
    control: byLabel('Body Location'),
    act: async (p) => {
      await byLabel('Body Location')(p).selectOption({ index: 1 });
      await byLabel('Condition Label (optional)')(p).fill('Knee test');
    },
    then: async (p) => {
      await p.getByRole('button', { name: '+ Add Rating' }).click();
    },
    result: main,
  },
  {
    name: 'va-loan',
    path: '/calculators/va-loan',
    control: byLabel('Loan term'),
    act: async (p) => {
      await byLabel('Loan term')(p).selectOption({ index: 1 });
      await afterLabel('Home price')(p).fill('400000');
    },
    result: main,
  },
  {
    name: 'va-refinance',
    path: '/calculators/va-refinance',
    control: byLabel('New loan term'),
    act: async (p) => {
      await byLabel('New loan term')(p).selectOption({ index: 1 });
      await afterLabel('Current loan balance')(p).fill('250000');
    },
    result: main,
  },
];

test.describe('Calculators — input made before hydration drives the results (build 1c)', () => {
  test.describe.configure({ timeout: 60_000 });
  for (const c of PRE_CASES) {
    test(`${c.name}: select + text changed before hydration → same results as after`, async ({ page }) => {
      await expectPreHydrationChangeApplied(page, c);
    });
  }
});

test.describe('Total compensation — URL precedence and analytics (build 1c)', () => {
  test('?rank=e5, E-7 picked before hydration → E-7 results and the URL says e7', async ({ page }) => {
    const p2 = await page.context().newPage();
    await p2.goto('/calculators/total-compensation?rank=e7&zip=28310');
    await waitForHydration(p2.getByLabel('Rank / Pay Grade'));
    await expect(p2.getByTestId('tc-monthly-total')).toBeVisible();
    const e7 = await p2.getByTestId('tc-monthly-total').innerText();
    await p2.close();

    const events = await recordGtag(page);
    const release = await holdClientJs(page);
    await page.goto('/calculators/total-compensation?rank=e5&zip=28310&utm_source=test', { waitUntil: 'commit' });
    const rank = page.getByLabel('Rank / Pay Grade');
    await expect(rank).toBeVisible();
    await expectNotHydrated(rank);
    await rank.selectOption('E-7');

    release();
    await waitForHydration(rank);
    await expect(rank).toHaveValue('E-7');
    await expect(page.getByTestId('tc-monthly-total')).toHaveText(e7);
    await expect(page).toHaveURL(/[?&]rank=e7(&|$)/);
    await expect(page).toHaveURL(/[?&]zip=28310(&|$)/);
    await expect(page).toHaveURL(/[?&]utm_source=test(&|$)/);
    await expect
      .poll(() => events('calculation_run'))
      .toEqual([{ calculator_name: 'total-compensation', event_category: 'calculator' }]);
    await page.waitForTimeout(1500);
    expect(await events('calculation_run'), 'exactly one').toHaveLength(1);
  });

  test('held JS, nothing changed: no calculation_run, URL untouched, buttons inert then live', async ({ page }) => {
    const events = await recordGtag(page);
    const release = await holdClientJs(page);
    await page.goto('/calculators/total-compensation?rank=e6', { waitUntil: 'commit' });
    const withDeps = page.getByRole('button', { name: 'With dependents' });
    await expect(withDeps).toBeVisible();
    await expectNotHydrated(withDeps);
    await expect(withDeps).toHaveAttribute('aria-disabled', 'true');
    await expect(withDeps).toBeDisabled(); // Playwright treats aria-disabled as disabled
    await withDeps.click({ force: true }); // lost: no JS yet, and inert

    release();
    await waitForHydration(withDeps);
    await expect(withDeps).not.toHaveAttribute('aria-disabled');
    await expect(page.getByLabel('Rank / Pay Grade')).toHaveValue('E-6');
    await page.waitForTimeout(2000);
    expect(new URL(page.url()).search).toBe('?rank=e6');
    expect(await events('calculation_run')).toEqual([]);

    await withDeps.click(); // works once hydrated
    await expect(withDeps).toHaveClass(/bg-red-700/);
  });
});
