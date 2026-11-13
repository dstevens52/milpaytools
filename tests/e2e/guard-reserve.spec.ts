import { test, expect } from '@playwright/test';
import { getBasePay } from './helpers/data';
import { calculateGuardReserve, type GuardReserveInput } from '@/lib/calculations/guardReserve';

// Expected values are typed from the build #4 rules and the 2026 DFAS/BAS tables
// (E-5 @ 6 YOS = $4,110.00/mo → $137.00/day; enlisted BAS $476.95/mo;
// TRS member+family $286.66/mo), not read from lib output.

const BASE: GuardReserveInput = {
  rank: 'E-5', yearsOfService: 6, weekendsPerYear: 12, periodsPerWeekend: 4,
  atDays: 15, additionalDays: 0, trsPlan: 'none', brsEnrolled: false, tspContribPct: 5,
};

// ─── Lib (GR-01–05) ───────────────────────────────────────────────────────────

test.describe('Guard & Reserve — lib', () => {
  test('GR-01 E-5/6 YOS/12×MUTA-4/15 AT/BRS 5% → contributions on $8,631 = $431.55', () => {
    const r = calculateGuardReserve({ ...BASE, brsEnrolled: true });
    expect(r.brs.payBase).toBeCloseTo(8631, 6); // drill $6,576 + AT $2,055
    expect(r.brs.govAutoContrib).toBeCloseTo(86.31, 6);
    expect(r.brs.govMatchContrib).toBeCloseTo(345.24, 6);
    expect(r.brs.totalGovContrib).toBeCloseTo(431.55, 6);
  });

  test('GR-01 YOS 1, BRS 5% → 1% automatic only (matching after 2 years)', () => {
    const r = calculateGuardReserve({ ...BASE, yearsOfService: 1, brsEnrolled: true });
    expect(r.brs.matchingEligible).toBe(false);
    expect(r.brs.govMatchContrib).toBe(0);
    expect(r.brs.totalGovContrib).toBeCloseTo(r.brs.payBase * 0.01, 9);
  });

  test('GR-02 hours: MUTA-6 → 408; MUTA-8 → 504 (4 hours per period + 8 per AT day)', () => {
    expect(calculateGuardReserve({ ...BASE, periodsPerWeekend: 6 }).totalHours).toBe(408);
    expect(calculateGuardReserve({ ...BASE, periodsPerWeekend: 8 }).totalHours).toBe(504);
    expect(calculateGuardReserve(BASE).totalHours).toBe(312);
  });

  test('GR-03 family TRS → not in the total; premium $3,439.92/yr', () => {
    const none = calculateGuardReserve(BASE);
    const fam = calculateGuardReserve({ ...BASE, trsPlan: 'family' });
    expect(fam.totalValue).toBe(none.totalValue);
    expect(fam.effectiveHourlyRate).toBe(none.effectiveHourlyRate);
    expect(fam.trsAnnualPremium).toBeCloseTo(3439.92, 6);
    expect(fam).not.toHaveProperty('trsSavings');
  });

  test('GR-04 AT 15 days, enlisted → BAS = 15 × $476.95 ÷ 30 ($238.48)', () => {
    const r = calculateGuardReserve(BASE);
    expect(r.atBAS).toBeCloseTo((15 * 476.95) / 30, 9);
    expect(r.totalMilitaryPay).toBeCloseTo(6576 + 2055 + (15 * 476.95) / 30, 6);
  });

  test('GR-04 officer AT BAS uses the officer rate ($328.48)', () => {
    const r = calculateGuardReserve({ ...BASE, rank: 'O-3' });
    expect(r.atBAS).toBeCloseTo((15 * 328.48) / 30, 9);
  });

  test('GR-05 per drill weekend = drill pay ÷ weekends ($548 by default)', () => {
    const r = calculateGuardReserve(BASE);
    expect(r.drillPayPerWeekend).toBeCloseTo(548, 6);
    expect(r).not.toHaveProperty('perWeekendValue');
  });

  test('GR-05 E-9 at 6 YOS → no 2026 rate flagged; no pay figures', () => {
    const r = calculateGuardReserve({ ...BASE, rank: 'E-9' });
    expect(r.payRateAvailable).toBe(false);
    expect(r.totalMilitaryPay).toBe(0);
  });

  test('GR-05 days check: 52 weekends + 15 AT + 250 additional > 365', () => {
    expect(calculateGuardReserve({ ...BASE, weekendsPerYear: 52, additionalDays: 250 }).daysExceedYear).toBe(true);
    expect(calculateGuardReserve(BASE).daysExceedYear).toBe(false);
  });
});

// ─── Page ─────────────────────────────────────────────────────────────────────

test.describe('Guard & Reserve Pay Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/guard-reserve');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Guard|Reserve/i);
  });

  test('default state shows drill pay section heading', async ({ page }) => {
    await expect(page.getByText(/Drill pay|Weekend drill|drill period/i).first()).toBeVisible();
  });

  test('annual training pay section is visible', async ({ page }) => {
    await expect(page.getByText(/Annual Training|annual training/i).first()).toBeVisible();
  });

  test('changing rank to O-3 updates drill pay', async ({ page }) => {
    const rankSelect = page.locator('select').first();
    await rankSelect.selectOption('O-3');
    await expect(page.getByText(/Drill pay|drill period/i).first()).toBeVisible();
  });

  test('E-5 at 6 YOS produces a positive drill pay', async () => {
    const basePay = getBasePay('E-5', 6);
    expect(basePay / 30).toBeGreaterThan(100);
  });

  test('BRS enrollment toggle affects TSP section', async ({ page }) => {
    const brsBtn = page.getByRole('button', { name: /BRS|Enrolled/i }).first();
    if (await brsBtn.isVisible()) {
      await brsBtn.click();
      await expect(page.getByText(/TSP|match/i).first()).toBeVisible();
    }
  });

  test('TRICARE section is visible', async ({ page }) => {
    await expect(page.getByText(/TRICARE|TRS|Tricare/i).first()).toBeVisible();
  });

  test('total annual military pay row is displayed', async ({ page }) => {
    await expect(page.locator('main').getByText(/Total.*military|military.*pay|total.*annual/i).first()).toBeVisible();
  });

  test('action step section is rendered', async ({ page }) => {
    await expect(page.getByText(/total compensation|full active duty/i).first()).toBeVisible();
  });

  test('proportion bar (income breakdown) is rendered', async ({ page }) => {
    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();
  });

  test('W-4 at 20 YOS is selectable and produces result', async ({ page }) => {
    await page.locator('#gr-rank').selectOption('W-4');
    await page.locator('#gr-yos').fill('20');
    await expect(page.getByText(/Drill pay|drill period/i).first()).toBeVisible();
  });

  test('pay is higher for O-3 than E-5', async () => {
    expect(getBasePay('O-3', 6)).toBeGreaterThan(getBasePay('E-5', 6));
  });

  test('default: "$548 drill pay per weekend"', async ({ page }) => {
    await expect(page.getByTestId('gr-per-weekend')).toHaveText('$548 drill pay per weekend');
  });

  test('family TRS: card shows member premium only; no TRS value in the total', async ({ page }) => {
    await page.locator('label').filter({ hasText: /Member \+ family/ }).click();
    const card = page.getByTestId('gr-trs-card');
    await expect(card).toContainText('$3,439.92');
    await expect(card).toContainText('Healthcare Cost Comparison');
    await expect(card).not.toContainText('KFF');
    await expect(page.getByText(/TRS premium value/)).toHaveCount(0);
  });

  test('BRS copy: contributions apply to drill pay; no "not during IDT" claim', async ({ page }) => {
    await page.goto('/calculators/guard-reserve?brs=yes&tsp=5');
    await expect(page.getByText('BRS / TSP Government Contributions')).toBeVisible();
    await expect(page.getByText(/Basic pay for BRS contributions \(drill \+ AT \+ additional duty\)/)).toBeVisible();
    await expect(page.getByText(/not during IDT|does not apply during Inactive Duty|Matching does not apply/i)).toHaveCount(0);
  });

  test('O-3 Annual Training guidance has no "E-5" text and states BAH-RC/T', async ({ page }) => {
    await page.locator('#gr-rank').selectOption('O-3');
    const note = page.getByTestId('gr-at-note');
    await expect(note).toContainText('BAH Reserve Component/Transit (BAH-RC/T)');
    await expect(note).not.toContainText('E-5');
    await expect(page.getByText(/E-5 with\/without dependents BAH/)).toHaveCount(0);
  });

  test('E-9 at 6 YOS → "No 2026 basic pay rate" message and no $0 totals', async ({ page }) => {
    await page.locator('#gr-rank').selectOption('E-9');
    await expect(page.getByTestId('gr-no-rate')).toContainText('No 2026 basic pay rate for');
    await expect(page.getByTestId('gr-per-weekend')).toHaveCount(0);
    await expect(page.getByText('Total annual Guard/Reserve value')).toHaveCount(0);
  });

  test('days warning when entries exceed a year', async ({ page }) => {
    // WebKit can fill before hydration, which drops the change events — wait first.
    await page.waitForLoadState('networkidle');
    await page.locator('#gr-weekends').fill('52');
    await page.locator('#gr-addl').fill('300');
    await expect(page.getByText(/Annual drill \(52 weekends/)).toBeVisible();
    await expect(page.getByTestId('gr-days-warning')).toBeVisible();
  });
});

test.describe('Guard & Reserve — URL params', () => {
  test('bad ?rank= → default E-5', async ({ page }) => {
    await page.goto('/calculators/guard-reserve?rank=E-99&weekends=999');
    await expect(page.locator('#gr-rank')).toHaveValue('E-5');
    await expect(page.locator('#gr-weekends')).toHaveValue('12');
  });

  test('valid ?rank=O-3 is applied', async ({ page }) => {
    await page.goto('/calculators/guard-reserve?rank=O-3');
    await expect(page.locator('#gr-rank')).toHaveValue('O-3');
  });
});
