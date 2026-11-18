import { test, expect, type Page } from '@playwright/test';
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
