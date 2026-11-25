import { test, expect, type Page } from '@playwright/test';
import { waitForHydration } from './helpers/hydration';
import { LOAN_LIMITS_2026 } from '../../src/data/va-loan/loanLimits2026';
import { LOAN_LIMITS_2027 } from '../../src/data/va-loan/loanLimits2027';
import { LOAN_LIMIT_SUMMARIES } from '../../src/data/va-loan/loanLimitYear';
import { VA_PURCHASE_FUNDING_FEE } from '../../src/lib/calculations/vaLoanFees';

// VA entitlement calculator (build V2), in the browser. Expected figures are written
// from VA's rule (25% of the county limit minus used; 4 ×; 25% of the loan minus
// remaining) and read from the FHFA data files, not from the calculator's lib.

const PATH = '/calculators/va-entitlement';
const usd = (n: number, cents = false) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

const limit = (rows: typeof LOAN_LIMITS_2027, fips: string) => rows.find((r) => r[0] === fips)![3];

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

test.describe('VA entitlement calculator', () => {
  test('full entitlement: no county limit message, link to the VA loan calculator', async ({ page }) => {
    await page.goto(PATH);
    const yes = page.getByRole('group', { name: 'Do you have full VA entitlement?' }).getByRole('button', { name: 'Yes' });
    await waitForHydration(yes);
    await yes.click();
    const note = page.getByTestId('ve-full-note');
    await expect(note).toContainText('No county loan limit applies with full entitlement. Your lender still approves the loan amount.');
    await expect(page.getByTestId('ve-full-cta')).toHaveAttribute('href', /^\/calculators\/va-loan\?/);
    await expect(page.getByTestId('ve-results')).toHaveCount(0);
  });

  test('typing $50,000 used at the baseline: both years, 2026 with cents', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.getByTestId('ve-prompt')).toBeVisible();
    const used = page.getByLabel('Entitlement already used');
    await waitForHydration(used);
    await used.fill('50000');
    await expect(used).toHaveValue('50,000');

    const r26 = page.getByTestId('ve-result-2026');
    const r27 = page.getByTestId('ve-result-2027');
    await expect(r26).toContainText('Closing in 2026');
    await expect(r27).toContainText('Closing in 2027 (from Jan. 1)');
    await expect(r26).toContainText('Limit in most U.S. counties (one unit): $832,750');
    await expect(r26.getByTestId('ve-remaining-2026')).toContainText('remaining entitlement $158,187.50');
    await expect(r26.getByTestId('ve-max-loan')).toContainText('up to $632,750.');
    await expect(r27.getByTestId('ve-remaining-2027')).toContainText("VA's 25%: $213,850 − entitlement used $50,000 = remaining entitlement $163,850");
    await expect(r27.getByTestId('ve-max-loan')).toContainText('Most lenders lend up to 4 × your remaining entitlement with no down payment: up to $655,400.');
    await expect(page.getByTestId('ve-baseline-note')).toBeVisible();
  });

  test('high-cost county (Los Angeles County, CA, at the ceiling) from the URL', async ({ page }) => {
    const fips = '06037';
    const l27 = limit(LOAN_LIMITS_2027, fips);
    const l26 = limit(LOAN_LIMITS_2026, fips);
    expect(l27).toBe(LOAN_LIMIT_SUMMARIES[2027].ceiling); // control: the county is at the ceiling
    await page.goto(`${PATH}?full=no&used=50000&fips=${fips}`);
    await expect(page.getByTestId('ve-county-limit-2027')).toContainText(`Los Angeles County, CA limit (one unit): ${usd(l27)}`);
    await expect(page.getByTestId('ve-county-limit-2026')).toContainText(usd(l26));
    const rem27 = 0.25 * l27 - 50_000;
    await expect(page.getByTestId('ve-remaining-2027')).toContainText(`remaining entitlement ${usd(rem27, rem27 % 1 !== 0)}`);
    await expect(page.getByTestId('ve-result-2027').getByTestId('ve-max-loan')).toContainText(usd(4 * rem27));
    await expect(page.getByLabel('State or territory')).toHaveValue('CA');
    await expect(page.getByTestId('ve-county')).toHaveValue(fips);
  });

  test('Hawaii county picked in the selects (Honolulu County)', async ({ page }) => {
    await page.goto(`${PATH}?used=50000`);
    const state = page.getByLabel('State or territory');
    await waitForHydration(state);
    await state.selectOption('HI');
    const county = page.getByTestId('ve-county');
    await expect(county).toBeEnabled();
    await county.selectOption({ label: 'Honolulu County' });
    const l27 = limit(LOAN_LIMITS_2027, '15003');
    expect(l27).toBeGreaterThanOrEqual(1_283_100);
    expect(l27).toBeLessThanOrEqual(1_924_650);
    await expect(page.getByTestId('ve-county-limit-2027')).toContainText(`Honolulu County, HI limit (one unit): ${usd(l27)}`);
    await expect(page.getByTestId('ve-result-2027').getByTestId('ve-max-loan')).toContainText(usd(4 * (0.25 * l27 - 50_000)));
  });

  test('price above the $0-down maximum: the down payment line', async ({ page }) => {
    await page.goto(`${PATH}?used=50000&price=700000`);
    // 2027: 25% of 700,000 = 175,000 − 163,850 = 11,150. 2026: 175,000 − 158,187.50 = 16,812.50.
    await expect(page.getByTestId('ve-down-2027')).toContainText(
      'Most lenders want your remaining entitlement and a down payment together to cover at least 25% of the loan: about $11,150 down.',
    );
    await expect(page.getByTestId('ve-down-2026')).toContainText('about $16,812.50 down.');
    const fee = Math.round(700_000 * VA_PURCHASE_FUNDING_FEE.subsequent.lt5);
    await expect(page.getByTestId('ve-fee-2027')).toContainText(`Funding fee on a $700,000 loan at the subsequent-use rate (3.30%, less than 5% down): ${usd(fee)}.`);
  });

  test('a price within the maximum has no down payment line', async ({ page }) => {
    await page.goto(`${PATH}?used=50000&price=400000`);
    await expect(page.getByTestId('ve-result-2027')).toBeVisible();
    await expect(page.getByTestId('ve-down-2027')).toHaveCount(0);
  });

  test('no remaining entitlement: the restoration line', async ({ page }) => {
    await page.goto(`${PATH}?used=300000`);
    await expect(page.getByTestId('ve-zero-2027')).toContainText(
      'No remaining entitlement in this county. Restoring entitlement (sell and pay off, assumption with substitution, or the one-time restoration) would change this.',
    );
    await expect(page.getByTestId('ve-max-loan')).toHaveCount(0);
  });

  test('prior loan: above $144,000 estimates 25%; $144,000 or less says check your COE', async ({ page }) => {
    await page.goto(`${PATH}?prior=300000`);
    await expect(page.getByTestId('ve-prior-estimate')).toContainText('about $75,000 (25% of the loan). Estimate. Your COE shows the exact amount.');
    await expect(page.getByTestId('ve-remaining-2027')).toContainText('entitlement used $75,000 = remaining entitlement $138,850');
    await page.goto(`${PATH}?prior=120000`);
    await expect(page.getByTestId('ve-prior-coe')).toBeVisible();
    await expect(page.getByTestId('ve-prompt')).toBeVisible();
  });

  test('CTA opens the VA loan calculator with price, down, subsequent use and fee status', async ({ page }) => {
    await page.goto(`${PATH}?used=50000&price=700000&down=20000&fee=comp`);
    const cta = page.getByTestId('ve-cta');
    await expect(cta).toHaveAttribute('href', '/calculators/va-loan?price=700000&down=20000&firstUse=no&fee=comp');
    await waitForHydration(cta);
    await cta.click();
    await expect(page).toHaveURL(/\/calculators\/va-loan\?price=700000&down=20000&firstUse=no&fee=comp$/);
    const use = page.getByRole('group', { name: 'VA loan use' });
    await expect(use.getByRole('button', { name: 'Subsequent use' })).toHaveClass(/bg-red-700/);
    await expect(page.getByTestId('vl-funding-fee')).toContainText('$0 — Waived');
  });

  test('without a price, the CTA uses the $0-down maximum of the current year', async ({ page }) => {
    await page.goto(`${PATH}?used=50000`);
    await expect(page.getByTestId('ve-cta')).toHaveAttribute('href', '/calculators/va-loan?price=632750&down=0&firstUse=no&fee=none');
  });

  test('URL settings round-trip through the share link', async ({ page }) => {
    await stubClipboard(page);
    const q = 'full=unsure&used=50000&fips=06037&price=700000&down=20000&fee=pending';
    await page.goto(`${PATH}?${q}`);
    await expect(page.getByLabel('Entitlement already used')).toHaveValue('50,000');
    await expect(page.getByTestId('ve-county')).toHaveValue('06037');
    await expect(page.getByLabel('Home price (optional)')).toHaveValue('700,000');
    await expect(page.getByLabel('Down payment (optional)')).toHaveValue('20,000');
    await expect(page.getByTestId('ve-fee-status').locator('input[value="pending"]')).toBeChecked();
    await expect(page.getByRole('group', { name: 'Do you have full VA entitlement?' }).getByRole('button', { name: 'Not sure' })).toHaveAttribute('aria-pressed', 'true');
    const copy = page.getByRole('button', { name: 'Copy result link' });
    await waitForHydration(copy);
    await copy.click();
    const handle = await page.waitForFunction(() => {
      const c = (window as unknown as { __copied: string[] }).__copied;
      return c.length > 0 ? c[c.length - 1] : null;
    });
    const url = new URL((await handle.jsonValue()) as string);
    expect(url.pathname).toBe(PATH);
    expect(Object.fromEntries(url.searchParams)).toEqual(Object.fromEntries(new URLSearchParams(q)));
  });
});

test.describe('links into the VA entitlement calculator', () => {
  test('VA loan calculator: the subsequent-use line', async ({ page }) => {
    await page.goto('/calculators/va-loan?fee=comp');
    await expect(page.getByTestId('vl-entitlement-link')).toHaveCount(0);
    const sub = page.getByRole('group', { name: 'VA loan use' }).getByRole('button', { name: 'Subsequent use' });
    await waitForHydration(sub);
    await sub.click();
    const link = page.getByTestId('vl-entitlement-link');
    await expect(link).toHaveText('Still have a VA loan on another home? Check your remaining entitlement →');
    await expect(link).toHaveAttribute('href', '/calculators/va-entitlement?fee=comp');
  });

  test('hubs: /calculators and the VA home loans guide link the calculator', async ({ page }) => {
    await page.goto('/calculators');
    await expect(page.locator(`main a[href="${PATH}"]`).first()).toBeVisible();
    await page.goto('/guides/va-home-loans');
    await expect(page.locator(`main a[href="${PATH}"]`, { hasText: 'Check your remaining entitlement by county' })).toHaveCount(1);
    await expect(page.locator(`main a[href="${PATH}"]`, { hasText: 'VA Loan Entitlement Calculator' })).toHaveCount(1);
  });

  test('posts link the calculator', async ({ page }) => {
    for (const slug of ['can-i-use-va-loan-again', 'va-loan-assumptions-explained']) {
      await page.goto(`/blog/${slug}`);
      expect(await page.locator(`main a[href="${PATH}"]`).count(), slug).toBeGreaterThan(0);
    }
  });

  test('sitemap lists the calculator', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml.length).toBeGreaterThan(1000);
    expect(xml).toContain('/calculators/va-entitlement</loc>');
  });
});
