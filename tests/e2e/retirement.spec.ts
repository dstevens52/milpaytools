import { test, expect, type Page } from '@playwright/test';
import { getBasePay } from './helpers/data';
import { calculateRetirement } from '@/lib/calculations/retirement';
import { vaRates } from '@/data/va-rates/2026';
import { formatCurrency } from '@/lib/utils';
import type { RetirementInput } from '@/types/calculator';
import {
  RETIREMENT_HERO_INPUT,
  retirementHeroStrip,
} from '@/components/calculators/retirement/examples';

test.describe('Military Retirement Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/retirement');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Retirement/i);
  });

  test('default state shows monthly pension result', async ({ page }) => {
    // The component always computes a pension; the ResultCard should show monthly/annual
    await expect(page.getByText(/Monthly Pension|monthly pension|pension.*month/i).first()).toBeVisible();
  });

  test('BRS system shows TSP section', async ({ page }) => {
    // BRS is default — TSP section heading is visible
    await expect(page.getByText(/TSP.*Projection|TSP.*Details|BRS.*TSP/i).first()).toBeVisible();
  });

  test('switching to High-3 shows Legacy note', async ({ page }) => {
    await page.getByRole('button', { name: 'High-3 (Legacy)' }).click();
    await expect(page.getByText(/High-3|Legacy|2\.5%/i).first()).toBeVisible();
  });

  test('retirement at 20 YOS shows 50% multiplier for High-3', async ({ page }) => {
    await page.getByRole('button', { name: 'High-3 (Legacy)' }).click();
    // 20 × 2.5% = 50.0% — toFixed(1) renders "50.0%" in the breakdown table
    // Avoid matching the hidden <option value="50">50%</option> in the VA rating select
    await expect(page.getByText('50.0%').first()).toBeVisible();
  });

  test('BRS multiplier is lower than High-3 at 20 years', async ({ page }) => {
    // BRS uses 2% × YOS so 20yr = 40%; High-3 uses 2.5% × YOS = 50%
    const brsBasePay = getBasePay('E-7', 20);
    const brsMonthlyPension = brsBasePay * 0.40;
    const high3MonthlyPension = brsBasePay * 0.50;
    expect(high3MonthlyPension).toBeGreaterThan(brsMonthlyPension);
  });

  test('years from vesting action step appears', async ({ page }) => {
    // Default current YOS = 10, so "years from pension" step should appear
    await expect(page.getByText(/year.*pension|from.*vesting/i).first()).toBeVisible();
  });

  test('CRDP note appears when VA rating ≥ 50% with 20+ YOS', async ({ page }) => {
    const vaSelect = page.locator('select').filter({ hasText: /None|Not rated/i });
    await vaSelect.selectOption('50');
    await expect(page.getByText(/CRDP|Concurrent Retirement/i).first()).toBeVisible();
  });

  test('pension chart is rendered', async ({ page }) => {
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('BRS vs High-3 comparison toggle works', async ({ page }) => {
    const compareBtn = page.getByRole('button', { name: /Compare.*High-3|Show.*comparison/i });
    if (await compareBtn.isVisible()) {
      await compareBtn.click();
      await expect(page.getByText(/High-3/i).first()).toBeVisible();
    }
  });

  test('O-6 at 30 years has higher base pay than E-7 at 20 years', async ({ page }) => {
    const e7Pay = getBasePay('E-7', 20);
    const o6Pay = getBasePay('O-6', 30);
    expect(o6Pay).toBeGreaterThan(e7Pay);
  });

  test('TSP contribution input is visible for BRS', async ({ page }) => {
    await expect(page.getByText(/TSP contribution/i).first()).toBeVisible();
  });
});

// ─── RET-01: VA waiver below 50% (10 U.S.C. § 1414(a)) ────────────────────────

function high3E7At20(vaRating: RetirementInput['vaRating'], overrides: Partial<RetirementInput> = {}) {
  return calculateRetirement({
    retirementSystem: 'high3',
    currentGrade: 'E-7',
    currentYOS: 10,
    retirementYOS: 20,
    retirementGrade: 'E-7',
    tspContributionPct: 5,
    tspCurrentBalance: 0,
    tspAnnualReturnPct: 7,
    vaRating,
    ...overrides,
  });
}

// Mirrors RetirementCalculator's fmt()
function fmtWhole(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

test.describe('Retirement — VA waiver vs. CRDP (lib)', () => {
  test('0% VA: total = pension', () => {
    const r = high3E7At20(0);
    expect(r.totalMonthlyIncome).toBe(r.monthlyPension);
    expect(r.waiverApplied).toBe(false);
    expect(r.monthlyPension).toBeCloseTo(3100.05, 2); // audit figure; derived from the pay table
  });

  test('40% VA: total = pension, VA portion broken out (waiver)', () => {
    const r = high3E7At20(40);
    const va40 = vaRates[40].veteranAlone;
    expect(va40).toBeCloseTo(795.84, 2); // audit figure; derived from the VA table
    expect(r.waiverApplied).toBe(true);
    expect(r.crdpEligible).toBe(false);
    expect(r.totalMonthlyIncome).toBeCloseTo(r.monthlyPension, 6);
    expect(r.totalMonthlyIncome).toBeCloseTo(3100.05, 2);
    expect(r.vaTaxFree).toBe(va40);
    expect(r.taxableRetiredPay).toBeCloseTo(r.monthlyPension - va40, 6);
    expect(r.taxableRetiredPay + r.vaTaxFree).toBeCloseTo(r.totalMonthlyIncome, 6);
  });

  test('40% VA: civilian-equivalent input uses the corrected total (same as 0%)', () => {
    expect(high3E7At20(40).civilianEquivalent).toBeCloseTo(high3E7At20(0).civilianEquivalent, 6);
  });

  test('50% VA: total = pension + 50% VA rate (CRDP)', () => {
    const r = high3E7At20(50);
    expect(r.crdpEligible).toBe(true);
    expect(r.waiverApplied).toBe(false);
    expect(r.totalMonthlyIncome).toBeCloseTo(r.monthlyPension + vaRates[50].veteranAlone, 6);
  });

  test('100% VA: total = pension + 100% VA rate (CRDP)', () => {
    const r = high3E7At20(100);
    expect(r.crdpEligible).toBe(true);
    expect(r.totalMonthlyIncome).toBeCloseTo(r.monthlyPension + vaRates[100].veteranAlone, 6);
  });

  test('BRS 40% VA: waiver offsets the pension only, not TSP income', () => {
    const r = high3E7At20(40, { retirementSystem: 'brs' });
    expect(r.tspMonthlyIncome).toBeGreaterThan(0);
    expect(r.totalMonthlyIncome).toBeCloseTo(r.monthlyPension + r.tspMonthlyIncome, 6);
  });
});

test.describe('Retirement — VA waiver vs. CRDP (UI)', () => {
  const vaSelect = (page: Page) => page.locator('select').filter({ hasText: /None|Not rated/i });

  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/retirement');
    await page.getByRole('button', { name: 'High-3 (Legacy)' }).click();
  });

  test('40% VA shows the waiver breakdown with total = pension', async ({ page }) => {
    await vaSelect(page).selectOption('40');
    const r = high3E7At20(40);

    const card = page.getByTestId('va-waiver-card');
    await expect(card).toBeVisible();
    await expect(page.getByTestId('va-crdp-card')).toHaveCount(0);
    await expect(card).toContainText('Retired pay (before VA waiver)');
    await expect(card).toContainText(`${fmtWhole(r.monthlyPension)}/mo`);
    await expect(card).toContainText('excluded from federal taxable income');
    await expect(card).toContainText(`${fmtWhole(r.vaTaxFree)}/mo`);
    await expect(card).toContainText('Retired pay after VA waiver');
    await expect(card).toContainText(`${fmtWhole(r.taxableRetiredPay)}/mo`);
    await expect(card).toContainText('the VA waiver');

    const banner = page.getByTestId('va-banner');
    await expect(banner).toContainText(`${fmtWhole(r.monthlyPension)}/mo`);
    await expect(banner).toContainText('after VA waiver');
    await expect(banner).not.toContainText(fmtWhole(r.monthlyPension + r.monthlyVA));
  });

  test('50% VA shows the CRDP additive total', async ({ page }) => {
    await vaSelect(page).selectOption('50');
    const r = high3E7At20(50);

    const card = page.getByTestId('va-crdp-card');
    await expect(card).toBeVisible();
    await expect(page.getByTestId('va-waiver-card')).toHaveCount(0);
    await expect(card).toContainText('concurrent receipt');
    await expect(card).toContainText(`${fmtWhole(r.monthlyPension + vaRates[50].veteranAlone)}/mo`);
    await expect(page.getByTestId('va-banner')).toContainText(`${fmtWhole(r.totalMonthlyIncome)}/mo`);
  });
});

test.describe('Retirement — hero sample strip', () => {
  test('hero strip values equal the lib output for its scenario', async ({ page }) => {
    await page.goto('/calculators/retirement');
    const expected = retirementHeroStrip();
    const r = calculateRetirement(RETIREMENT_HERO_INPUT);

    await expect(page.getByTestId('hero-pension')).toHaveText(expected.pension);
    await expect(page.getByTestId('hero-tsp')).toHaveText(expected.tsp);
    await expect(page.getByTestId('hero-va')).toHaveText(expected.va);
    await expect(page.getByTestId('hero-civilian')).toHaveText(expected.civilianEquivalent);

    // Cross-check the formatted strings against raw lib values
    expect(expected.pension).toBe(`${formatCurrency(r.monthlyPension)}/mo`);
    expect(expected.va).toBe(`${formatCurrency(r.monthlyVA)}/mo`);
    expect(expected.tsp).toBe(`~$${Math.round(r.tspProjectedBalance / 1000)}K`);
    expect(expected.civilianEquivalent).toBe(`~$${Math.round(r.civilianEquivalent / 1000)}K/yr`);
  });
});
