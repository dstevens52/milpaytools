/**
 * Edge-case regression tests from the calculator math audit.
 *
 * These exercise boundary conditions and unusual inputs identified during the
 * audit (bilateral factor, rounding boundaries, BRS match tiering, funding-fee
 * base amounts, IRRRL recoupment/seasoning, and VA-claim status logic).
 *
 * Where possible, expected values are computed from the same src/ functions the
 * calculators use, and inputs are set via URL params to keep the tests
 * deterministic and independent of the type-ahead autocomplete.
 */

import { test, expect } from '@playwright/test';
import { vaCompensation, combinedRating, getBasePay } from './helpers/data';
import { vaAmount, formatCurrency } from './helpers/format';
import { calculateTotalCompensation } from '../../src/lib/calculations/total-compensation';

// ─── VA Disability ─────────────────────────────────────────────────────────────

test.describe('VA Disability — edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/va-disability');
  });

  // §4.26: both sides of a paired part. 30% + 30% bilateral combine to 51 (§4.25
  // table), then +10% factor (5.1) = 56.1 → rounds to 56 → 60%. Without the factor,
  // 30 & 30 = 51 → 50%.
  test('bilateral factor applies for left + right leg (30% + 30% → 60%)', async ({ page }) => {
    await page.getByRole('button', { name: '30%', exact: true }).click();
    await page.getByLabel('Body Location').selectOption('left-leg');
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    await page.getByRole('button', { name: '30%', exact: true }).click();
    await page.getByLabel('Body Location').selectOption('right-leg');
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    // Combined value 56 only arises when the +10% factor is applied (51 → 56.1 → 56); proves §4.26 ran.
    await expect(page.locator('p.text-6xl')).toContainText('60');
    await expect(page.getByText(/56% → rounds to 60%/)).toBeVisible();
  });

  // Two conditions on the SAME side are not a bilateral pair (§4.26 needs both sides).
  // Both left arm at 30% combine to 51 → rounds to 50%, with no bilateral factor.
  test('two conditions on the same side do not trigger the bilateral factor (→ 50%)', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: '30%', exact: true }).click();
      await page.getByLabel('Body Location').selectOption('left-arm');
      await page.getByRole('button', { name: '+ Add Rating' }).click();
    }
    // Combined stays 51 (no +10% factor); with a bilateral pair it would be 56 → 60%.
    await expect(page.locator('p.text-6xl')).toContainText('50');
    await expect(page.getByText(/51% → rounds to 50%/)).toBeVisible();
  });

  // A lone 18–23 school child with no under-18 children is paid at the Table B
  // "1 child" base (no additional school-child line). Output must match the lib.
  test('single school-age-only child (18–23) at 50% matches the with-1-child rate', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: /Increase Children 18.23 in school/ }).click();

    const comp = vaCompensation(50, {
      hasSpouse: false, childrenUnder18: 0, schoolChildren: 1, dependentParents: 0,
    });
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(comp.monthly) })).toBeVisible();
  });

  // 50 & 10 combine to exactly 55 on the §4.25 table — the boundary rounds UP to 60%.
  test('combined exactly on a rounding boundary (55 → 60%)', async ({ page }) => {
    const r = combinedRating([50, 10]);
    expect(r.exact).toBe(55);
    expect(r.rounded).toBe(60);

    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: '10%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    await expect(page.locator('p.text-6xl')).toContainText('60');
    await expect(page.getByText(/55% → rounds to 60%/)).toBeVisible();
  });

  // 90 & 50 combine to exactly 95 — VA rounds 95+ up to 100%.
  test('combined 95%+ rounds to 100% (90 & 50 → 95 → 100%)', async ({ page }) => {
    const r = combinedRating([90, 50]);
    expect(r.exact).toBe(95);
    expect(r.rounded).toBe(100);

    await page.getByRole('button', { name: '90%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();

    await expect(page.locator('p.text-6xl')).toContainText('100');
    await expect(page.getByText(/95% → rounds to 100%/)).toBeVisible();
  });

  // No conditions → empty-state prompt, no combined-rating result rendered.
  test('zero conditions shows the empty-state prompt and no result card', async ({ page }) => {
    await expect(page.getByText(/Add at least one disability rating/i)).toBeVisible();
    await expect(page.locator('p.text-6xl')).toHaveCount(0);
  });

  // A single 0% rating establishes service connection: 0% combined, $0.00 compensation.
  test('single 0% condition shows 0% combined and $0.00', async ({ page }) => {
    await page.getByRole('button', { name: '0%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.locator('p.text-6xl')).toContainText('0');
    await expect(page.getByText('$0.00').first()).toBeVisible();
  });

  // "What Your Rating Unlocks" thresholds.
  test('Unlocks at 10%: funding-fee waiver shown; 30%/50% sections hidden', async ({ page }) => {
    await page.getByRole('button', { name: '10%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText('What Your 10% Rating Means Beyond Monthly Pay')).toBeVisible();
    await expect(page.getByText('VA Loan Funding Fee Waiver')).toBeVisible();
    await expect(page.getByText('Dependent Allowances (30%+)')).toHaveCount(0);
    await expect(page.getByText('State Benefits (50%+)')).toHaveCount(0);
  });

  test('Unlocks at 30%: dependent-allowances section appears; 50% section hidden', async ({ page }) => {
    await page.getByRole('button', { name: '30%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText('Dependent Allowances (30%+)')).toBeVisible();
    await expect(page.getByText('State Benefits (50%+)')).toHaveCount(0);
  });

  test('Unlocks at 50%: state-benefits section appears; P&T section hidden', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText('State Benefits (50%+)')).toBeVisible();
    await expect(page.getByText(/Designated Permanent & Total/i)).toHaveCount(0);
  });

  test('Unlocks at 100%: Permanent & Total section appears', async ({ page }) => {
    await page.getByRole('button', { name: '100%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.getByText(/Designated Permanent & Total/i)).toBeVisible();
  });
});

// ─── Total Compensation — BRS match tiering ─────────────────────────────────────

test.describe('Total Compensation — BRS match tiering', () => {
  // E-5 at 6 YOS is the calculator default.
  const baseInput = {
    payGrade: 'E-5' as const,
    yearsOfService: 6,
    zipCode: '',
    hasDependents: false,
    retirementSystem: 'brs' as const,
    govHousing: false,
    mealCard: false,
  };
  const annualBase = getBasePay('E-5', 6) * 12;

  // 1% auto + dollar-for-dollar on the first 3% = 4% of base pay.
  test('3% contribution → 4% government total (not 3%)', async ({ page }) => {
    const out = calculateTotalCompensation({ ...baseInput, tspContributionPct: 3 }, 0);
    expect(out.tspAgencyContribution).toBeCloseTo(annualBase * 0.04, 2);
    await page.goto('/calculators/total-compensation?tsp=3');
    await expect(page.getByText(formatCurrency(out.tspAgencyContribution)).first()).toBeVisible();
  });

  // 1% auto + 3% dollar-for-dollar + 50¢ on the 4th percent = 4.5% of base pay.
  test('4% contribution → 4.5% government total', async ({ page }) => {
    const out = calculateTotalCompensation({ ...baseInput, tspContributionPct: 4 }, 0);
    expect(out.tspAgencyContribution).toBeCloseTo(annualBase * 0.045, 2);
    await page.goto('/calculators/total-compensation?tsp=4');
    await expect(page.getByText(formatCurrency(out.tspAgencyContribution)).first()).toBeVisible();
  });

  // 1% auto + 3% + 50¢ on the 4th and 5th percent = 5% of base pay (full match).
  test('5% contribution → 5% government total', async ({ page }) => {
    const out = calculateTotalCompensation({ ...baseInput, tspContributionPct: 5 }, 0);
    expect(out.tspAgencyContribution).toBeCloseTo(annualBase * 0.05, 2);
    await page.goto('/calculators/total-compensation?tsp=5');
    await expect(page.getByText(formatCurrency(out.tspAgencyContribution)).first()).toBeVisible();
  });

  // No member contribution → 1% automatic only.
  test('0% contribution → 1% automatic only', async ({ page }) => {
    const out = calculateTotalCompensation({ ...baseInput, tspContributionPct: 0 }, 0);
    expect(out.tspAgencyContribution).toBeCloseTo(annualBase * 0.01, 2);
    await page.goto('/calculators/total-compensation?tsp=0');
    await expect(page.getByText(formatCurrency(out.tspAgencyContribution)).first()).toBeVisible();
  });

  test('Legacy/High-3 selected → no BRS match section', async ({ page }) => {
    await page.goto('/calculators/total-compensation?retirement=legacy');
    await expect(page.getByText('TSP / BRS Details')).toHaveCount(0);
    await expect(page.getByText('DoD TSP agency match')).toHaveCount(0);
  });
});

// ─── VA Loan — funding fee edge cases ───────────────────────────────────────────

test.describe('VA Loan — funding fee edge cases', () => {
  // Default state: $350,000 home, $0 down, first use → 2.15% × $350,000 = $7,525.
  test('$0 down, first use → 2.15% fee ($7,525)', async ({ page }) => {
    await page.goto('/calculators/va-loan');
    await expect(page.getByText('2.15%').first()).toBeVisible();
    await expect(page.getByText('$7,525').first()).toBeVisible();
  });

  // $0 down, subsequent use → 3.30% × $350,000 = $11,550.
  test('$0 down, subsequent use → 3.30% fee ($11,550)', async ({ page }) => {
    await page.goto('/calculators/va-loan?firstUse=no');
    await expect(page.getByText('3.30%').first()).toBeVisible();
    await expect(page.getByText('$11,550').first()).toBeVisible();
  });

  // 5% down → $17,500 down, loan $332,500. Fee = 1.5% × $332,500 = $4,988 (the loan,
  // NOT the $350,000 purchase price, which would wrongly give $5,250).
  test('5% down → 1.50% fee on the loan amount, not the purchase price', async ({ page }) => {
    await page.goto('/calculators/va-loan?down=5&downType=percent');
    await expect(page.getByText('1.50%').first()).toBeVisible();
    await expect(page.getByText('$4,988').first()).toBeVisible();
    await expect(page.getByText('$5,250')).toHaveCount(0);
  });

  // Disability exemption waives the fee and hides the down-payment tier display.
  test('disability exempt → funding fee $0 and tier display hidden', async ({ page }) => {
    await page.goto('/calculators/va-loan?exempt=yes');
    await expect(page.getByText(/\$0.*Waived/).first()).toBeVisible();
    await expect(page.getByText('Funding fee rate:')).toHaveCount(0);
  });

  test('BAH comparison appears when toggled on with a ZIP', async ({ page }) => {
    await page.goto('/calculators/va-loan?bah=yes&zip=28310');
    await expect(page.getByText(/BAH vs\. Estimated Payment/i)).toBeVisible();
  });

  test('BAH comparison hidden by default (toggle off)', async ({ page }) => {
    await page.goto('/calculators/va-loan');
    await expect(page.getByText(/BAH vs\. Estimated Payment/i)).toHaveCount(0);
  });
});

// ─── VA Refinance — edge cases ──────────────────────────────────────────────────

test.describe('VA Refinance — edge cases', () => {
  test('IRRRL with < 0.5% rate reduction fails the net tangible benefit check', async ({ page }) => {
    await page.goto('/calculators/va-refinance?type=irrrl&currRate=6.4&newRate=6.0');
    await expect(page.getByText(/may not meet the VA's 0\.5% minimum reduction/i).first()).toBeVisible();
  });

  test('IRRRL with exactly 0.5% rate reduction passes the net tangible benefit check', async ({ page }) => {
    await page.goto('/calculators/va-refinance?type=irrrl&currRate=6.5&newRate=6.0');
    await expect(page.getByText(/meets the VA's 0\.5% minimum reduction requirement/i).first()).toBeVisible();
  });

  // Consumer break-even includes the funding fee; VA recoupment excludes it — so the
  // two month counts differ. Values are recomputed with the component's PI formula.
  test('consumer break-even and VA recoupment show different month counts', async ({ page }) => {
    const pi = (loan: number, ratePct: number, termYears: number) => {
      if (loan <= 0 || termYears <= 0) return 0;
      const r = ratePct / 100 / 12;
      const n = termYears * 12;
      if (r === 0) return loan / n;
      return (loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    };
    const fee = Math.round(300000 * 0.005); // IRRRL 0.5%
    const savings = pi(300000, 7, 25) - pi(300000 + fee, 6, 30);
    const consumer = Math.ceil((fee + 2500) / savings);
    const vaRecoup = Math.ceil(2500 / savings);
    expect(consumer).not.toBe(vaRecoup);

    await page.goto('/calculators/va-refinance');
    await expect(page.getByText(`${consumer} mo`, { exact: true })).toBeVisible();
    await expect(page.getByText(`${vaRecoup} mo`, { exact: true })).toBeVisible();
  });

  test('IRRRL seasoning fails when first payment was under 210 days ago', async ({ page }) => {
    const d = new Date();
    d.setDate(d.getDate() - 100);
    const iso = d.toISOString().slice(0, 10);
    await page.goto(`/calculators/va-refinance?type=irrrl&firstPmt=${iso}`);
    await expect(page.getByText(/210 required/i).first()).toBeVisible();
  });

  test('disability exempt → funding fee $0 (waived)', async ({ page }) => {
    await page.goto('/calculators/va-refinance?exempt=yes');
    await expect(page.getByText(/Waived \(disability exemption\)/i)).toBeVisible();
  });
});

// ─── Transition Readiness — VA claim status ─────────────────────────────────────

test.describe('Transition Readiness — VA claim status', () => {
  // vaRating 0 (not retirement-eligible) → "Not yet filed" + the file-your-claim step.
  // sal+exp engage the calculator so the verdict/indicators/action steps render.
  test('vaRating = 0 shows the "file your claim" action step', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?va=0&yos=10&sal=80000&exp=4000');
    await expect(page.getByText('Not yet filed')).toBeVisible();
    await expect(page.getByText(/File your VA disability claim/i)).toBeVisible();
  });

  // vaRating 10 → "Filed" → no file-your-claim step.
  test('vaRating = 10 does NOT show the "file your claim" action step', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?va=10&yos=10&sal=80000&exp=4000');
    await expect(page.getByText('Filed', { exact: true })).toBeVisible();
    await expect(page.getByText(/File your VA disability claim/i)).toHaveCount(0);
  });

  // Retirement-eligible (20 YOS + planned separation) → vaClaimStatus 'na' ("TRICARE retiree").
  test('retirement-eligible (20 YOS) sets VA claim status to N/A', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?va=0&yos=20&sal=80000&exp=4000');
    await expect(page.getByText('TRICARE retiree')).toBeVisible();
    await expect(page.getByText(/File your VA disability claim/i)).toHaveCount(0);
  });
});
