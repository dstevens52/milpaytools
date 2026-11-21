import { test, expect, type Page } from '@playwright/test';
import { waitForHydration } from './helpers/hydration';
import { formatCurrency } from './helpers/format';
import { LABEL, SPACING, gluedText } from './helpers/glued-text';
import {
  VA_PURCHASE_FUNDING_FEE as FEE,
  fundingFeeAmount,
} from '../../src/lib/calculations/vaLoanFees';
import { calcVaLoan, VA_LOAN_DEFAULTS } from '../../src/lib/calculations/vaLoan';

// VA loan calculator + VA disability → VA loan link (build V1). Expected figures
// come from the same src/lib functions the page and calculator use.

const EX = calcVaLoan(VA_LOAN_DEFAULTS);
const EX_EXEMPT = calcVaLoan({ ...VA_LOAN_DEFAULTS, feeStatus: 'comp' });
const usd = (n: number) => formatCurrency(n);

const radio = (page: Page, label: string) => page.getByRole('radio', { name: label, exact: true });

test.describe('VA loan: funding fee status', () => {
  test('fee=comp → exempt result line with the computed fee', async ({ page }) => {
    await page.goto('/calculators/va-loan?fee=comp');
    await expect(radio(page, 'I receive VA disability compensation')).toBeChecked();
    const line = page.getByTestId('vl-exempt-result');
    await expect(line).toContainText('No funding fee.');
    await expect(line).toContainText(
      `On a ${usd(EX.baseLoan)} first-use loan with no down payment, that's ${usd(EX.standardFeeAmount)} you don't pay.`,
    );
    await expect(page.getByTestId('vl-funding-fee')).toContainText('$0 — Waived');
  });

  test('older exempt=yes link → compensation status', async ({ page }) => {
    await page.goto('/calculators/va-loan?exempt=yes');
    await expect(radio(page, 'I receive VA disability compensation')).toBeChecked();
    await expect(page.getByTestId('vl-funding-fee')).toContainText('$0 — Waived');
  });

  test('fee=pending → fee charged, VA refund rule shown', async ({ page }) => {
    await page.goto('/calculators/va-loan?fee=pending');
    await expect(radio(page, 'My disability claim is still pending')).toBeChecked();
    await expect(page.getByTestId('vl-funding-fee')).toHaveText(usd(EX.fundingFeeAmount));
    const note = page.getByTestId('vl-pending-note');
    await expect(note).toContainText('the fee is due at closing');
    await expect(note).toContainText('effective date before your closing date');
    await expect(note).toContainText("received after closing doesn't qualify for a refund");
    await expect(page.getByTestId('vl-exempt-result')).toHaveCount(0);
  });

  test('fee=garbage → "None of these apply", fee charged', async ({ page }) => {
    await page.goto('/calculators/va-loan?fee=garbage');
    await expect(radio(page, 'None of these apply')).toBeChecked();
    await expect(page.getByTestId('vl-funding-fee')).toHaveText(usd(EX.fundingFeeAmount));
  });

  test('picking an exempt status after load waives the fee', async ({ page }) => {
    await page.goto('/calculators/va-loan');
    const purpleHeart = radio(
      page,
      'I’m on active duty and have received a Purple Heart (evidence provided on or before closing)',
    );
    await waitForHydration(purpleHeart);
    await purpleHeart.check();
    await expect(page.getByTestId('vl-funding-fee')).toContainText('$0 — Waived');
    await expect(page.getByTestId('vl-exempt-result')).toContainText(usd(EX.standardFeeAmount));
  });

  test('VAL-02: 5% typed on $389,905 → 1.50% band, $5,556 fee', async ({ page }) => {
    await page.goto('/calculators/va-loan?price=389905&down=5&downType=percent');
    await expect(page.getByText('Funding fee rate:')).toContainText('1.50%');
    await expect(page.getByTestId('vl-funding-fee')).toHaveText('$5,556');
  });

  test('VAL-04: ARM label is the first-5-years rate', async ({ page }) => {
    await page.goto('/calculators/va-loan?term=arm5');
    await expect(page.getByText(`5/1 ARM · first 5 years · ${VA_LOAN_DEFAULTS.rate}%`)).toBeVisible();
    await expect(page.getByText(/30-yr amort/)).toHaveCount(0);
  });
});

test.describe('VA loan: page copy (server HTML)', () => {
  let html = '';
  test.beforeAll(async ({ request }) => {
    const res = await request.get('/calculators/va-loan');
    expect(res.ok()).toBe(true);
    html = (await res.text()).replace(/<!-- -->/g, '');
    expect(html.length).toBeGreaterThan(10_000);
  });

  test('no rating-number exemption wording, no VA-vs-conventional claim, no PMI dollar figures', () => {
    expect(html).not.toMatch(/10% or higher waives/i);
    expect(html).not.toMatch(/10%\+ disability rating/i);
    expect(html).not.toMatch(/VA vs\.? Conventional/);
    expect(html).not.toMatch(/compare VA to conventional/i);
    expect(html).not.toMatch(/PMI math/);
    expect(html).not.toMatch(/\$1[45]\d(?:[–-]\$?\d+)?\/month/);
    expect(html).not.toMatch(/November 14, 2031/);
    expect(html).toContain('VA loans have no monthly mortgage insurance.');
  });

  test('example and hero strip use the computed figures', () => {
    expect(html).toContain(`${usd(EX.totalPITI)}/mo`);
    expect(usd(EX.totalPITI)).toBe('$2,610');
    expect(html).not.toContain('$2,611');
    expect(html).toContain(usd(EX.fundingFeeAmount));
    expect(html).toContain(usd(EX.financedLoan));
    expect(html).toContain(`adding roughly ${usd(EX.feeFinancedExtra)}/month`);
    expect(html).toContain(`approximately ${usd(EX_EXEMPT.monthlyPI)}`);
    expect(html).toContain(`a monthly payment ${usd(EX.totalPITI - EX_EXEMPT.totalPITI)} lower for the life of the loan`);
    expect(html).not.toContain('saving $46/month');
    // Waiver examples: $400,000 first and subsequent use, $0 down.
    expect(html).toContain(usd(fundingFeeAmount(400000, FEE.first.lt5)));
    expect(html).toContain(usd(fundingFeeAmount(400000, FEE.subsequent.lt5)));
  });

  test('hero figures match the calculator opened with its defaults', async ({ page }) => {
    await page.goto('/calculators/va-loan');
    await expect(page.getByTestId('vl-hero-fee')).toHaveText(usd(EX.fundingFeeAmount));
    await expect(page.getByTestId('vl-hero-piti')).toHaveText(`${usd(EX.totalPITI)}/mo`);
    await expect(page.getByTestId('vl-funding-fee')).toHaveText(usd(EX.fundingFeeAmount));
  });
});

test.describe('VA disability → VA loan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/va-disability');
  });

  test('0% combined: short funding fee note, no unlocks panel', async ({ page }) => {
    const zero = page.getByRole('button', { name: '0%', exact: true });
    await waitForHydration(zero);
    await zero.click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    const note = page.getByTestId('va-zero-fee-note');
    await expect(note).toContainText('on its own it doesn');
    await expect(note.getByRole('link', { name: 'Funding fee rates and exemptions →' })).toHaveAttribute(
      'href',
      '/blog/va-loan-funding-fee-explained',
    );
    await expect(page.getByText('VA Loan Funding Fee Waiver')).toHaveCount(0);
  });

  test('10%+: waiver card with computed figures and the ?fee=comp link', async ({ page }) => {
    const ten = page.getByRole('button', { name: '10%', exact: true });
    await waitForHydration(ten);
    await ten.click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText('VA Loan Funding Fee Waiver')).toBeVisible();
    await expect(page.getByText(`${usd(fundingFeeAmount(350000, FEE.first.lt5))} saved`)).toBeVisible();
    await expect(page.getByText(`${usd(fundingFeeAmount(400000, FEE.subsequent.lt5))} saved`)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Estimate your VA loan payment →' })).toHaveAttribute(
      'href',
      '/calculators/va-loan?fee=comp',
    );
    await expect(page.getByTestId('va-zero-fee-note')).toHaveCount(0);
  });
});

// Missing spaces (PR #79 review): the regexes and the reader live in
// ./helpers/glued-text.ts, shared with missing-spaces.spec.ts (build 10b).

test.describe('Rendered text has no missing spaces', () => {
  for (const path of ['/calculators/va-loan', '/calculators/va-loan?fee=comp']) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await waitForHydration(page.getByRole('radio', { name: 'None of these apply', exact: true }));
      if (path.includes('fee=comp')) await expect(page.getByTestId('vl-exempt-result')).toBeVisible();
      expect(await gluedText(page)).toEqual([]);
    });
  }

  test('/calculators/va-disability (default, then a 10% rating)', async ({ page }) => {
    await page.goto('/calculators/va-disability');
    const ten = page.getByRole('button', { name: '10%', exact: true });
    await waitForHydration(ten);
    expect(await gluedText(page)).toEqual([]);
    await ten.click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText('VA Loan Funding Fee Waiver')).toBeVisible();
    expect(await gluedText(page)).toEqual([]);
  });

  test('the check catches the broken forms and skips a § citation', () => {
    const hits = (s: string) => [...s.matchAll(SPACING), ...s.matchAll(LABEL)].length;
    for (const bad of ['or 3.30%at subsequent', 'April 7, 2023(VA.gov', "that's $7,525you", "Refunds:VA's rule", 'more sense:If you', "that's $7,520so", 'costs $121kept', 'in 2026(see']) {
      expect(hits(bad), bad).toBeGreaterThan(0);
    }
    for (const ok of ['or 3.30% at subsequent', 'April 7, 2023 (VA.gov', "that's $7,525 you", "Refunds: VA's rule", '38 U.S.C. § 5120(e)', '38 U.S.C. §5120(e)', '38 CFR § 36.4306(c)(2)', '37 U.S.C. 1009(e)', '≈$121k /yr', 'mid-$20s to mid-$30s']) {
      expect(hits(ok), ok).toBe(0);
    }
  });
});
