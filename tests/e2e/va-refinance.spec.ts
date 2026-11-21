import { test, expect, type Page } from '@playwright/test';
import { waitForHydration } from './helpers/hydration';
import { formatCurrency } from './helpers/format';
import { gluedText } from './helpers/glued-text';
import { calcVaRefinance, VA_REFINANCE_DEFAULTS as D } from '../../src/lib/calculations/vaRefinance';

// VA refinance calculator + page (build 10b: VRF-01–06, fee status). Expected
// figures come from the same lib the page and calculator use
// (src/lib/calculations/vaRefinance.ts); lib-level checks are in va-refinance-unit.spec.ts.

const EX = calcVaRefinance(D);
const CASH = calcVaRefinance({ ...D, type: 'cashout', cashOut: 50000 });
const usd = (n: number) => formatCurrency(n);
const radio = (page: Page, label: string) => page.getByRole('radio', { name: label, exact: true });

async function open(page: Page, query = '') {
  await page.goto(`/calculators/va-refinance${query}`);
  await waitForHydration(radio(page, 'None of these apply'));
}

test.describe('VA refinance: results', () => {
  test('defaults: one months-to-recover figure (8), payment drop, full-term difference', async ({ page }) => {
    await open(page);
    await expect(page.getByTestId('vr-payment-card')).toContainText(`+${usd(Math.round(EX.monthlySavings))}`);
    await expect(page.getByTestId('vr-months-to-recover')).toContainText('8 mo');
    await expect(page.getByTestId('vr-months-to-recover')).toContainText("Within VA's 36-month limit");
    await expect(page.getByTestId('vr-recover-note')).toContainText(
      "VA's 36-month test uses this method: the funding fee is left out of the costs (38 U.S.C. § 3709(a)). If you finance the fee, it's already in your new payment.",
    );
    await expect(page.getByText(/break-even/i)).toHaveCount(0);
    await expect(page.getByText('13 mo', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('vr-full-term-diff')).toHaveText(`${usd(EX.fullTermDifference)} more`);
    await expect(page.getByTestId('vr-current-total')).toHaveText(usd(EX.currentRemainingTotal));
    await expect(page.getByTestId('vr-new-total')).toHaveText(usd(EX.newLoanTotal));
    await expect(page.getByTestId('vr-longer-term')).toHaveText(
      'Part of the lower payment comes from the longer term: 5 more years of payments.',
    );
    await expect(page.getByTestId('vr-funding-fee')).toHaveText(usd(EX.fundingFeeAmount));
  });

  test('cash out > $0 hides the break-even and VA tests, shows the cost lines', async ({ page }) => {
    await open(page, '?type=cashout&cash=50000');
    await expect(page.getByTestId('vr-payment-card')).toContainText('Payment change');
    await expect(page.getByTestId('vr-payment-card')).not.toContainText('Monthly Savings');
    await expect(page.getByTestId('vr-months-to-recover')).toHaveCount(0);
    await expect(page.getByTestId('vr-recover-note')).toHaveCount(0);
    await expect(page.getByTestId('vr-va-checks')).toHaveCount(0);
    // (The page's hero, example and FAQ mention months to recover; the result doesn't.)
    await expect(page.getByTestId('vr-bottom-line')).not.toContainText('recovered through the lower payment');
    await expect(page.getByTestId('vr-new-loan-card')).toContainText(usd(CASH.newLoan));
    await expect(page.getByTestId('vr-funding-fee')).toHaveText(usd(7525));
    await expect(page.getByTestId('vr-new-loan')).toHaveText(usd(357525));
    await expect(page.getByTestId('vr-full-term')).toContainText("The new loan's total includes repaying the $50,000 cash out.");
    await expect(page.getByTestId('vr-full-term-diff')).toHaveText(`${usd(CASH.fullTermDifference)} more`);
    await expect(page.getByTestId('vr-bottom-line')).toContainText('38 U.S.C. § 3709(d)');
    // exact: the FAQ repeats the sentence inside a longer answer.
    await expect(
      page.getByText("VA limits the new loan, including a financed funding fee, to 100% of the home's VA-appraised value.", { exact: true }),
    ).toBeVisible();
  });

  test('cash out where the payment rises: card, summary and full-term lines agree', async ({ page }) => {
    // Repro from the PR #81 review.
    await open(page, '?type=cashout&cash=50000&fee=none&firstUse=yes');
    const rise = usd(-Math.round(CASH.monthlySavings)); // $23 (unrounded difference $23.20)
    await expect(page.getByTestId('vr-payment-card')).toContainText(`${rise} more a month`);
    await expect(page.getByTestId('vr-payment-card')).not.toContainText('+$');
    await expect(page.getByTestId('vr-bottom-line')).toContainText(`rises by ${rise},`);
    await expect(page.getByTestId('vr-longer-term')).toHaveText('The new loan also adds 5 years of payments.');
    await expect(page.getByText(/Part of the lower payment/)).toHaveCount(0);
    await expect(page.getByTestId('vr-same-term')).toContainText('At the same remaining term: paid off over 25 years,');
    await expect(page.getByTestId('vr-same-term')).toContainText(
      `${usd(Math.round(-CASH.sameTermSavings))} more than your current payment.`,
    );
    await expect(page.getByText(/Saving at the same/)).toHaveCount(0);
  });

  test('cash-out with $0 cash keeps the months figure, no VA checks', async ({ page }) => {
    await open(page, '?type=cashout&cash=0');
    await expect(page.getByTestId('vr-months-to-recover')).toBeVisible();
    await expect(page.getByTestId('vr-va-checks')).toHaveCount(0);
  });

  test('typing a cash-out amount switches the result to the cost lines', async ({ page }) => {
    await open(page, '?type=cashout');
    await page.getByLabel('Cash out').fill('50000');
    await expect(page.getByTestId('vr-new-loan')).toHaveText(usd(357525));
    await expect(page.getByTestId('vr-months-to-recover')).toHaveCount(0);
  });

  test('VRF-04: 8.2% → 7.7% passes the rate test (50 basis points)', async ({ page }) => {
    await open(page, '?currRate=8.2&newRate=7.7');
    await expect(page.getByText('Your rate drops 50 basis points (0.50 percentage points).', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/0\.4999/)).toHaveCount(0);
    await expect(page.getByTestId('vr-bottom-line')).toContainText("so this meets VA's fixed-to-fixed rate test");
  });
});

test.describe('VA refinance: seasoning date (VRF-05)', () => {
  for (const timezoneId of ['America/Los_Angeles', 'Pacific/Kiritimati']) {
    test.describe(timezoneId, () => {
      test.use({ timezoneId });
      test('IRRRL: first payment due 2026-04-16 → earliest closing November 12, 2026', async ({ page }) => {
        await open(page, '?firstPmt=2026-04-16');
        const line = page.getByTestId('vr-seasoning');
        await expect(line).toContainText('Earliest IRRRL closing date: November 12, 2026.');
        await expect(line).toContainText('With on-time payments, the sixth comes before day 210');
        await expect(line).not.toContainText('payments likely made');
      });
    });
  }

  test('cash-out with a date: same date, applies when the current loan is a VA loan', async ({ page }) => {
    await open(page, '?type=cashout&cash=20000&firstPmt=2026-04-16');
    const block = page.getByTestId('vr-seasoning');
    await expect(block).toContainText('Earliest closing date: November 12, 2026');
    await expect(block).toContainText('This applies when your current loan is a VA loan (38 CFR § 36.4306(c)(2)).');
  });
});

test.describe('VA refinance: funding fee status', () => {
  test('fee=comp → exempt line and $0 — Waived', async ({ page }) => {
    await open(page, '?fee=comp');
    await expect(radio(page, 'I receive VA disability compensation')).toBeChecked();
    await expect(page.getByTestId('vr-exempt-result')).toContainText(
      `No funding fee. On this IRRRL, that's ${usd(EX.standardFeeAmount)} you don't pay.`,
    );
    await expect(page.getByTestId('vr-funding-fee')).toHaveText('$0 — Waived');
  });

  test('older exempt=yes link → compensation status', async ({ page }) => {
    await open(page, '?exempt=yes');
    await expect(radio(page, 'I receive VA disability compensation')).toBeChecked();
    await expect(page.getByTestId('vr-funding-fee')).toHaveText('$0 — Waived');
  });

  test('fee=pending → fee charged, VA refund rule', async ({ page }) => {
    await open(page, '?fee=pending');
    await expect(page.getByTestId('vr-funding-fee')).toHaveText(usd(EX.fundingFeeAmount));
    await expect(page.getByTestId('vr-pending-note')).toContainText('effective date before your closing date');
  });

  test('cash-out link with fee=dic → no fee on balance + cash out', async ({ page }) => {
    await open(page, '?type=cashout&cash=25000&fee=dic');
    await expect(radio(page, 'I receive DIC as the surviving spouse of a Veteran')).toBeChecked();
    await expect(page.getByTestId('vr-funding-fee')).toHaveText('$0 — Waived');
    await expect(page.getByTestId('vr-new-loan')).toHaveText(usd(325000));
    const std = calcVaRefinance({ ...D, type: 'cashout', cashOut: 25000, feeStatus: 'dic' }).standardFeeAmount;
    await expect(page.getByTestId('vr-exempt-result')).toContainText(`On this cash-out refinance, that's ${usd(std)} you don't pay.`);
  });
});

test.describe('VA refinance: page copy (server HTML)', () => {
  let html = '';
  test.beforeAll(async ({ request }) => {
    const res = await request.get('/calculators/va-refinance');
    expect(res.ok()).toBe(true);
    html = (await res.text()).replace(/<!-- -->/g, '');
    expect(html.length).toBeGreaterThan(10_000);
  });

  test('hero strip and example use the computed figures (VRF-02)', () => {
    expect(usd(Math.round(EX.monthlySavings))).toBe('$313');
    expect(html).toContain(`data-testid="vr-hero-savings">${usd(Math.round(EX.monthlySavings))}<`);
    expect(html).toContain('data-testid="vr-hero-months">8 months<');
    expect(html).toContain(`data-testid="vr-hero-full-term">${usd(EX.fullTermDifference)} more<`);
    expect(html).toContain(`${usd(Math.round(EX.monthlySavings))}/mo`);
    expect(html).toContain(usd(EX.currentRemainingTotal));
    expect(html).toContain(usd(EX.newLoanTotal));
    expect(html).not.toContain('$312/mo');
    expect(html).not.toContain('9 months');
    expect(html).not.toContain('13 months');
  });

  test('no verdicts, no rating-number exemption, no two break-evens', () => {
    expect(html).not.toMatch(/favorable/i);
    expect(html).not.toMatch(/consumer break-even/i);
    expect(html).not.toMatch(/10%\+/);
    expect(html).not.toMatch(/Disability-rated veterans are exempt/i);
    expect(html).not.toMatch(/November 14, 2031/);
    expect(html).not.toMatch(/typical range/i);
  });
});

test.describe('VA refinance: no "favorable" and no missing spaces in any state', () => {
  for (const q of ['', '?fee=comp', '?fee=pending', '?type=cashout&cash=50000&firstPmt=2026-04-16', '?currRate=6.2&closing=9000&firstPmt=2026-10-01']) {
    test(`/calculators/va-refinance${q}`, async ({ page }) => {
      await open(page, q);
      await expect(page.getByTestId('vr-bottom-line')).toBeVisible();
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/favorable/i);
      expect(await gluedText(page)).toEqual([]);
    });
  }
});
