import { test, expect, type Page } from '@playwright/test';
import { waitForHydration } from './helpers/hydration';

// V3b VA funnel: the prefilled placements that open the VA loan / refinance
// calculators, and the calc_deeplink_click event each one sends. Test plan and
// read-out: docs/seo/2026-11-va-funnel-test.md.
//
// GA is recorded in the browser the same way as ga-events.spec.ts: a recording
// window.gtag installed before any page script, nothing sent to Google.

type GaCall = [string, string, Record<string, string>];

async function recordGa(page: Page) {
  const calls: GaCall[] = [];
  await page.exposeFunction('__recordGa', (args: GaCall) => {
    calls.push(args);
  });
  await page.addInitScript(() => {
    const w = window as unknown as { gtag: (...a: unknown[]) => void; __recordGa: (a: unknown[]) => void };
    w.gtag = (...a: unknown[]) => {
      w.__recordGa(a);
    };
  });
  await page.route('**/api/track-calculation', (route) => route.fulfill({ status: 200, body: '' }));
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => route.abort());
  const events = (name: string) => calls.filter((c) => c[0] === 'event' && c[1] === name).map((c) => c[2]);
  return { calls, events };
}

/** The link's ZIP must never reach GA (event params or cleaned page URLs). */
function expectNoZip(calls: GaCall[]) {
  expect(JSON.stringify(calls)).not.toMatch(/\b\d{5}\b/);
}

const settle = (page: Page) => page.waitForTimeout(1200);

const CARD = 'va-loan-bah-card';

/** The VA loan calculator opened with the BAH comparison on and these values filled in. */
async function expectVaLoanPrefilled(page: Page, zip: string, grade: string, withDeps: boolean) {
  await expect(page.getByText(/BAH vs\. Estimated Payment/i)).toBeVisible();
  const bahGroup = page.getByRole('group', { name: 'Are you currently receiving BAH?' });
  await expect(bahGroup.getByRole('button', { name: 'Yes' })).toHaveClass(/bg-red-700/);
  await expect(page.getByLabel('Duty Station')).toHaveValue(zip);
  await expect(page.getByLabel('Pay Grade')).toHaveValue(grade);
  await expect(page.getByRole('button', { name: withDeps ? 'With Dependents' : 'Without', exact: true })).toHaveClass(/bg-red-700/);
}

test.describe('BAH calculator result card', () => {
  test('78234, E-5, with dependents: card → prefilled VA loan calculator, event sent', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/bah?zip=78234&rank=e5&dependents=yes');
    const card = page.getByTestId(CARD);
    await expect(card).toHaveAttribute('href', '/calculators/va-loan?bah=yes&zip=78234&rank=e5&dep=yes');
    await expect(card).toContainText('Thinking about buying near');
    await expect(card).toContainText('? See how a VA loan payment compares with this BAH');
    await waitForHydration(card);
    await card.click();
    await expect(page).toHaveURL(/\/calculators\/va-loan\?bah=yes&zip=78234&rank=e5&dep=yes$/);
    await expectVaLoanPrefilled(page, '78234', 'E-5', true);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'bah-calculator', to_calculator: 'va-loan', grade: 'e5', placement: 'result-card' },
    ]);
    expectNoZip(ga.calls);
  });

  test('card follows rank and dependents changes', async ({ page }) => {
    await page.goto('/bah?zip=78234&rank=e5&dependents=yes');
    const card = page.getByTestId(CARD);
    await waitForHydration(card);
    await page.getByLabel('Pay Grade').selectOption('O-3');
    await page.getByRole('button', { name: 'Without', exact: true }).click();
    await expect(card).toHaveAttribute('href', '/calculators/va-loan?bah=yes&zip=78234&rank=o3&dep=no');
  });

  for (const [label, zip, shown] of [
    ['Guam (territory, OHA)', '96910', /U\.S\. territory/],
    ['Honolulu (Hawaii, OCONUS)', '96818', /\/mo/],
    ['Anchorage (Alaska, OCONUS)', '99506', /\/mo/],
    ['ZIP not in the BAH dataset', '00000', /not found|not available/i],
  ] as const) {
    test(`no card: ${label}`, async ({ page }) => {
      await page.goto(`/bah?zip=${zip}&rank=e5&dependents=yes`);
      await expect(page.getByText(shown).first()).toBeVisible();
      await expect(page.getByTestId(CARD)).toHaveCount(0);
    });
  }
});

test.describe('PCS calculator result card (destination)', () => {
  test('to=78234: card → prefilled VA loan calculator, event sent', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/calculators/pcs?rank=e6&dep=yes&from=28310&to=78234');
    const card = page.getByTestId(CARD);
    await expect(card).toHaveAttribute('href', '/calculators/va-loan?bah=yes&zip=78234&rank=e6&dep=yes');
    await waitForHydration(card);
    await card.click();
    await expect(page).toHaveURL(/\/calculators\/va-loan\?bah=yes&zip=78234&rank=e6&dep=yes$/);
    await expectVaLoanPrefilled(page, '78234', 'E-6', true);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'pcs-calculator', to_calculator: 'va-loan', grade: 'e6', placement: 'result-card' },
    ]);
    expectNoZip(ga.calls);
  });

  test('no card without a destination, or with a Hawaii destination', async ({ page }) => {
    await page.goto('/calculators/pcs?rank=e6&dep=yes&from=28310');
    await expect(page.getByTestId('pcs-cross-links')).toBeVisible();
    await expect(page.getByTestId(CARD)).toHaveCount(0);
    await page.goto('/calculators/pcs?rank=e6&dep=yes&from=28310&to=96818');
    await expect(page.getByText(/Moving to/).first()).toBeVisible();
    await expect(page.getByTestId(CARD)).toHaveCount(0);
  });
});

test.describe('blog: pre-discharge funding fee sentence', () => {
  test('links to ?fee=predischarge; the calculator opens with that status; event sent', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/blog/file-va-disability-before-separation');
    const link = page.getByRole('link', { name: 'See how that changes a VA loan estimate' });
    await expect(link).toHaveAttribute('href', '/calculators/va-loan?fee=predischarge');
    await expect(page.locator('main')).toContainText(
      /if you receive a proposed or memorandum rating from a pre-discharge claim that says you['’]re eligible for compensation, and it['’]s dated before your loan closes, you don['’]t pay the VA funding fee\./,
    );
    await waitForHydration(link);
    await link.click();
    await expect(page).toHaveURL(/\/calculators\/va-loan\?fee=predischarge$/);
    await expect(page.getByTestId('vl-fee-status').locator('input[value="predischarge"]')).toBeChecked();
    await expect(page.getByTestId('vl-exempt-result')).toBeVisible();
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'blog', to_calculator: 'va-loan', placement: 'contextual' },
    ]);
  });
});

test.describe('existing links now tracked (no copy change)', () => {
  test('VA disability funding-fee card (?fee=comp)', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/calculators/va-disability');
    const ten = page.getByRole('button', { name: '10%', exact: true });
    await waitForHydration(ten);
    await ten.click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('link', { name: 'Estimate your VA loan payment →' }).click();
    await expect(page).toHaveURL(/\/calculators\/va-loan\?fee=comp$/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([
      { from_page_type: 'va-disability-calculator', to_calculator: 'va-loan', placement: 'result-card' },
    ]);
  });

  for (const { path, name, href, expected } of [
    {
      path: '/bah',
      name: 'VA loan calculator',
      href: '/calculators/va-loan?bah=yes',
      expected: { from_page_type: 'bah-hub', to_calculator: 'va-loan', placement: 'contextual' },
    },
    {
      path: '/guides/pcs',
      name: 'VA loan calculator',
      href: '/calculators/va-loan?bah=yes',
      expected: { from_page_type: 'guide', to_calculator: 'va-loan', placement: 'contextual' },
    },
    {
      path: '/guides/va-home-loans',
      name: 'Compare BAH to your estimated payment →',
      href: '/calculators/va-loan?bah=yes',
      expected: { from_page_type: 'guide', to_calculator: 'va-loan', placement: 'hub' },
    },
    {
      path: '/guides/va-home-loans',
      name: 'Estimate an IRRRL with the VA refinance calculator →',
      href: '/calculators/va-refinance',
      expected: { from_page_type: 'guide', to_calculator: 'va-refinance', placement: 'hub' },
    },
  ]) {
    test(`${path}: "${name}"`, async ({ page }) => {
      const ga = await recordGa(page);
      await page.goto(path);
      // By href + text: links inside a closed <details> are hidden from role queries.
      const link = page.locator(`main a[href="${href}"]`, { hasText: name });
      await expect(link).toHaveCount(1);
      // Accordion content (the hub's) sits in a closed <details>; open it first.
      await link.evaluate((el) => {
        for (let d = el.closest('details'); d; d = d.parentElement?.closest('details') ?? null) d.open = true;
      });
      await waitForHydration(link);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${href.replace(/[?]/g, '\\?')}$`));
      await settle(page);
      expect(ga.events('calc_deeplink_click')).toEqual([expected]);
    });
  }

  test('VA hub: a non-VA-calculator link in the same lists sends nothing', async ({ page }) => {
    const ga = await recordGa(page);
    await page.goto('/guides/va-home-loans');
    const link = page.locator('main').getByRole('link', { name: 'Check your disability rating →' }).first();
    await waitForHydration(link);
    await link.click();
    await expect(page).toHaveURL(/\/calculators\/va-disability$/);
    await settle(page);
    expect(ga.events('calc_deeplink_click')).toEqual([]);
  });
});

test.describe('restored eligibility wording (sourced: docs/sources/va-home-loan-eligibility-2026.md)', () => {
  test('VA hub: 90 continuous days, Guard/Reserve paths, VA.gov eligibility link', async ({ page }) => {
    await page.goto('/guides/va-home-loans');
    const main = page.locator('main');
    await expect(main).toContainText('can be eligible after at least 90 continuous days of service.');
    await expect(main).toContainText('paths that include at least 90 days of non-training active-duty service or 6 creditable years of service.');
    await expect(main.locator('a[href="https://www.va.gov/housing-assistance/home-loans/eligibility/"]')).toHaveCount(1);
  });

  test('VA home loan basics post: 90 continuous days, Guard/Reserve paths, VA.gov eligibility link', async ({ page }) => {
    await page.goto('/blog/va-home-loan-basics');
    const main = page.locator('main');
    await expect(main).toContainText('at least 90 continuous days of service; the COE confirms it');
    await expect(main).toContainText('the paths include at least 90 days of non-training active-duty service or 6 creditable years of service');
    await expect(main.locator('a[href="https://www.va.gov/housing-assistance/home-loans/eligibility/"]')).toHaveCount(1);
  });
});
