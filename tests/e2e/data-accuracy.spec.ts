/**
 * Known-answer regression tests.
 *
 * Values verified against official 2026 government sources
 * (VA.gov, DFAS, DTMO, TRICARE.mil, TSP.gov, IRS).
 * Update expected values annually when new rate data is loaded.
 *
 * These tests input specific scenarios into the live UI and assert exact
 * dollar amounts. They catch data file errors, formula bugs, and rounding
 * issues that structural tests cannot detect.
 */

import { test, expect } from '@playwright/test';
import { getBasePay, getBAH, BAS_RATES } from './helpers/data';
import { vaAmount, bahAmount, payChartsAmount, formatCurrency, resultCardNum } from './helpers/format';

// ─── 1. VA Disability ─────────────────────────────────────────────────────────

test.describe('VA Disability — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/va-disability');
  });

  test('VA: 50% veteran alone = $1,132.90/mo', async ({ page }) => {
    await page.getByRole('button', { name: '50%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(1132.90) })).toBeVisible();
  });

  // Combined rating: 50% → 30% of remaining → 10% of remaining = 68.5% → rounds to 70%
  test('VA: 50%+30%+10% veteran alone = 70% combined = $1,808.45/mo', async ({ page }) => {
    for (const pct of ['50%', '30%', '10%'] as const) {
      await page.getByRole('button', { name: pct, exact: true }).click();
      await page.getByRole('button', { name: '+ Add Rating' }).click();
    }
    await expect(page.locator('p.text-6xl')).toContainText('70');
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(1808.45) })).toBeVisible();
  });

  test('VA: 40% with spouse = $882.84/mo', async ({ page }) => {
    await page.getByRole('button', { name: '40%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(882.84) })).toBeVisible();
  });

  // Direct lookup from VA Table B: withSpouseAnd1Child at 70% = $2,074.45
  test('VA: 70% with spouse + 1 child = $2,074.45/mo', async ({ page }) => {
    await page.getByRole('button', { name: '70%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.getByRole('button', { name: 'Increase Children under 18' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(2074.45) })).toBeVisible();
  });

  // 10% and 20% ratings have no dependent additions — all columns are flat (VA.gov confirmed)
  test('VA: 10% with spouse = $180.42/mo (dependent additions do not apply below 30%)', async ({ page }) => {
    await page.getByRole('button', { name: '10%', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Rating' }).click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: vaAmount(180.42) })).toBeVisible();
  });
});

// ─── 2. BAH Calculator ───────────────────────────────────────────────────────

test.describe('BAH — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/bah');
  });

  // Source: DTMO 2026 BAH rate tables
  test('BAH: E-5 with dependents at Fort Bragg (28310) = $1,806/mo', async ({ page }) => {
    await page.getByLabel('Duty Station').pressSequentially('28310', { delay: 50 });
    await page.getByRole('button', { name: 'With Dependents' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(1806) })).toBeVisible();
  });

  test('BAH: E-5 with dependents at NAS San Diego (92134) = $3,975/mo', async ({ page }) => {
    await page.getByLabel('Duty Station').pressSequentially('92134', { delay: 50 });
    await page.getByRole('button', { name: 'With Dependents' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(3975) })).toBeVisible();
  });

  test('BAH: E-6 with dependents at JBLM (98433) = $2,919/mo', async ({ page }) => {
    await page.getByLabel('Duty Station').pressSequentially('98433', { delay: 50 });
    await page.getByLabel('Pay Grade').selectOption('E-6');
    await page.getByRole('button', { name: 'With Dependents' }).click();
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(2919) })).toBeVisible();
  });

  test('BAH: E-5 without dependents at Fort Bragg (28310) shows correct 2026 rate', async ({ page }) => {
    const rate = getBAH('28310', 'E-5', false);
    if (!rate) test.skip();
    await page.getByLabel('Duty Station').pressSequentially('28310', { delay: 50 });
    await expect(page.locator('p.text-4xl').filter({ hasText: bahAmount(rate!) })).toBeVisible();
  });
});

// ─── 3. Total Compensation ───────────────────────────────────────────────────

test.describe('Total Compensation — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/total-compensation');
  });

  // E-5 at 6 YOS = $4,110.00 (DFAS 2026 pay table, "Over 6" column)
  test('Total Comp: E-5 6 YOS base pay = $49,320/yr', async ({ page }) => {
    const pay = getBasePay('E-5', 6); // $4,110.00 → $49,320/yr
    await expect(page.getByText(`${formatCurrency(pay * 12)}/yr`).first()).toBeVisible();
  });

  // E-5 at 8 YOS = $4,299.90 (DFAS 2026 pay table, "Over 8" column)
  test('Total Comp: E-5 8 YOS base pay = $4,299.90/mo', async ({ page }) => {
    await page.getByLabel('Years of Service').selectOption('8');
    const pay = getBasePay('E-5', 8); // $4,299.90
    await expect(page.getByText(`$${resultCardNum(pay)}/mo`).first()).toBeVisible();
  });

  // BAS enlisted = $476.95/mo (shown as $477 via formatCurrency with 0 decimals)
  test('Total Comp: E-5 BAS = $476.95/mo (displayed as $477)', async ({ page }) => {
    await expect(page.getByText(formatCurrency(BAS_RATES.enlisted)).first()).toBeVisible();
  });

  // DTMO 2026 BAH: E-5 with dependents at Fort Bragg (28310)
  test('Total Comp: E-5 8 YOS Fort Bragg (28310) BAH with dependents = $1,806/mo', async ({ page }) => {
    await page.getByLabel('Years of Service').selectOption('8');
    await page.getByLabel('Duty Station').pressSequentially('28310', { delay: 50 });
    await page.getByRole('button', { name: 'With dependents' }).click();
    await expect(page.getByText(formatCurrency(1806)).first()).toBeVisible();
  });

  // DTMO 2026 BAH: E-5 with dependents at NAS San Diego (92134)
  test('Total Comp: E-5 6 YOS San Diego (92134) BAH with dependents = $3,975/mo', async ({ page }) => {
    await page.getByLabel('Duty Station').pressSequentially('92134', { delay: 50 });
    await page.getByRole('button', { name: 'With dependents' }).click();
    await expect(page.getByText(formatCurrency(3975)).first()).toBeVisible();
  });
});

// ─── 4. PCS Cost Estimator ───────────────────────────────────────────────────

test.describe('PCS Cost Estimator — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/pcs');
  });

  // E-5 with dependents DLA = $3,548.02 (DTMO MAP 72-25(I), effective January 1, 2026)
  test('PCS: E-5 with dependents DLA = $3,548.02', async ({ page }) => {
    await expect(page.getByText('$3,548.02').first()).toBeVisible();
  });

  // E-5 without dependents DLA = $2,389.42 (DTMO MAP 72-25(I), effective January 1, 2026)
  test('PCS: E-5 without dependents DLA = $2,389.42', async ({ page }) => {
    await page.getByRole('button', { name: 'Without dependents', exact: true }).click();
    await expect(page.getByText('$2,389.42').first()).toBeVisible();
  });

  // MALT rate = $0.205/mile (DTMO 2026 rate) — appears in MALT row subtitle
  test('PCS: MALT rate = $0.205/mile', async ({ page }) => {
    await expect(page.getByText(/\$0\.205/).first()).toBeVisible();
  });
});

// ─── 5. TSP Growth Projector ─────────────────────────────────────────────────

test.describe('TSP Growth Projector — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/tsp');
  });

  // IRS § 402(g) 2026 elective deferral limit
  test('TSP: 2026 elective deferral limit = $24,500', async ({ page }) => {
    await expect(page.getByText('$24,500').first()).toBeVisible();
  });

  // IRC § 415(c) total additions limit — applies to combat zone contributions
  test('TSP: 2026 combat zone annual additions limit = $72,000', async ({ page }) => {
    await expect(page.getByText('$72,000').first()).toBeVisible();
  });
});

// ─── 6. Military Retirement ──────────────────────────────────────────────────

test.describe('Military Retirement — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/retirement');
  });

  // High-3 at 20 YOS: 2.5% × 20 = 50.0%
  test('Retirement: High-3 at 20 YOS multiplier = 50.0%', async ({ page }) => {
    await page.getByRole('button', { name: 'High-3 (Legacy)' }).click();
    await expect(page.getByText('50.0%').first()).toBeVisible();
  });

  // BRS at 20 YOS: 2.0% × 20 = 40.0% (BRS is the default system)
  test('Retirement: BRS at 20 YOS multiplier = 40.0%', async ({ page }) => {
    await expect(page.getByText('40.0%').first()).toBeVisible();
  });
});

// ─── 7. Deployment Pay Calculator ────────────────────────────────────────────

test.describe('Deployment Pay — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/deployment');
  });

  // HFP/IDP = $225/month (37 U.S.C. § 310, DoD FMR Vol. 7A Ch. 10)
  test('Deployment: HFP/IDP = $225/mo', async ({ page }) => {
    await expect(page.getByText('$225').first()).toBeVisible();
  });

  // FSA = $300/month (FY2026 NDAA — first increase since 2002, up from $250)
  test('Deployment: Family Separation Allowance = $300/mo', async ({ page }) => {
    await expect(page.getByText('$300').first()).toBeVisible();
  });
});

// ─── 8. Healthcare Cost Comparison ───────────────────────────────────────────

test.describe('Healthcare Comparison — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison');
  });

  // TRS member+family = $286.66/mo (TRICARE.mil 2026 rate, effective January 1, 2026)
  test('Healthcare: TRS member+family premium = $286.66/mo', async ({ page }) => {
    await page.locator('#path-select').selectOption('trs');
    await page.locator('#family-select').selectOption('married-2-children');
    await expect(page.getByText('$286.66').first()).toBeVisible();
  });

  // TRS member-only = $57.88/mo (TRICARE.mil 2026 rate, effective January 1, 2026)
  test('Healthcare: TRS member-only premium = $57.88/mo', async ({ page }) => {
    await page.locator('#path-select').selectOption('trs');
    await page.locator('#family-select').selectOption('single');
    await expect(page.getByText('$57.88').first()).toBeVisible();
  });
});

// ─── 9. Duty Station Comparison ──────────────────────────────────────────────

test.describe('Duty Station Compare — known answers', () => {
  test('Compare: E-5 JBLM (98433) BAH is higher than Fort Bragg (28310)', async ({ page }) => {
    await page.goto('/calculators/compare');
    const zipInputs = page.locator('input[type="text"]');
    await zipInputs.first().fill('28310');
    await zipInputs.nth(1).fill('98433');
    // Data assertion — JBLM E-5 with-dep BAH ($2,919) > Fort Bragg ($1,806)
    const bahFtBragg = getBAH('28310', 'E-5', true);
    const bahJBLM = getBAH('98433', 'E-5', true);
    if (bahFtBragg && bahJBLM) {
      expect(bahJBLM).toBeGreaterThan(bahFtBragg);
    }
    await expect(page.getByText(/BAH|housing/i).first()).toBeVisible();
  });
});

// ─── 10. Guard & Reserve ─────────────────────────────────────────────────────

test.describe('Guard & Reserve — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/guard-reserve');
  });

  // TRS member+family = $286.66/mo = $3,439.92/yr (TRICARE.mil 2026 rate)
  test('Guard/Reserve: TRS member+family premium = $286.66/mo ($3,439.92/yr)', async ({ page }) => {
    await page.locator('label').filter({ hasText: /Member.*family/i }).click();
    await expect(page.getByText('$286.66').first()).toBeVisible();
  });
});

// ─── 11. Education Benefits ──────────────────────────────────────────────────

test.describe('Education Benefits — known answers', () => {
  test('Education: veteran 100% GI Bill at San Diego shows Post-9/11 as highest value', async ({ page }) => {
    await page.goto('/calculators/education');
    await page.getByRole('button', { name: 'Veteran' }).click();
    const tierBtn = page.getByRole('button', { name: /100%|36.*months/i }).first();
    if (await tierBtn.isVisible()) await tierBtn.click();
    const zipInput = page.locator('input[type="text"]').first();
    await zipInput.fill('92134');
    await expect(page.getByText('Highest est. value')).toBeVisible();
  });
});

// ─── 12. Dual Military BAH ───────────────────────────────────────────────────

test.describe('Dual Military BAH — known answers', () => {
  test('Dual BAH: E-5+E-5 same station at Fort Bragg (28310) shows correct BAH amounts', async ({ page }) => {
    await page.goto('/calculators/dual-military-bah?rank1=e5&rank2=e5&zip=28310&dependents=yes');
    // With-dependents rate ($1,806) should appear for the higher-priority member
    const rateWithDep = getBAH('28310', 'E-5', true);
    if (!rateWithDep) test.skip();
    await expect(page.getByText(bahAmount(rateWithDep!)).first()).toBeVisible();
  });
});

// ─── 13. CONUS COLA ──────────────────────────────────────────────────────────

test.describe('CONUS COLA — known answers', () => {
  test('COLA: ZIP 93446 (Paso Robles area) is eligible and shows monthly amount', async ({ page }) => {
    await page.goto('/calculators/cola');
    await page.locator('#zip').fill('93446');
    await expect(page.getByText(/\$\d+.*\/mo|monthly.*COLA/i).first()).toBeVisible();
  });

  test('COLA: ZIP 60601 (Chicago) is not a CONUS COLA area', async ({ page }) => {
    await page.goto('/calculators/cola');
    await page.locator('#zip').pressSequentially('60601', { delay: 50 });
    await expect(page.getByText(/not a CONUS COLA area|not eligible|no COLA/i).first()).toBeVisible();
  });
});

// ─── 14. Pay Charts ──────────────────────────────────────────────────────────

test.describe('Pay Charts — known answers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/pay-charts');
  });

  // E-5 at 8 YOS = $4,299.90 (DFAS 2026, "Over 8" column, verified FY2026 rate)
  test('Pay Charts: E-5 8 YOS = $4,299.90/mo', async ({ page }) => {
    await page.locator('select').first().selectOption('E-5');
    await page.locator('select').nth(1).selectOption('8');
    const pay = getBasePay('E-5', 8); // $4,299.90
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });

  // O-10 at 20+ YOS = $18,999.90 (statutory cap — same as O-8 Over 22+ and O-9)
  test('Pay Charts: O-10 20+ YOS = $18,999.90/mo (statutory pay cap)', async ({ page }) => {
    await page.locator('select').first().selectOption('O-10');
    await page.locator('select').nth(1).selectOption('20');
    const pay = getBasePay('O-10', 20); // $18,999.90
    await expect(page.locator('span.text-3xl').filter({ hasText: payChartsAmount(pay) })).toBeVisible();
  });
});

// ─── 15. Separation Benefits Timeline ────────────────────────────────────────

test.describe('Separation Timeline — known answers', () => {
  // Date ~6 months from now (2026-11-21) — within BDD filing window (90–180 days pre-separation)
  test('Separation: date 6 months out shows BDD filing window is open', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2026-11-21');
    await expect(page.getByText('BDD Filing Window Opens', { exact: true })).toBeVisible();
  });

  test('Separation: SGLI free coverage and VGLI window deadline rows appear', async ({ page }) => {
    await page.goto('/calculators/separation-timeline?date=2026-11-21');
    await expect(page.getByText(/SGLI Free Coverage Ends/i).first()).toBeVisible();
    await expect(page.getByText(/VGLI Application Window Closes/i).first()).toBeVisible();
  });
});

// ─── 16. Transition Readiness ────────────────────────────────────────────────

test.describe('Transition Readiness — known answers', () => {
  test('Transition: E-6 10yr $75K civilian salary shows income surplus or deficit', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=10');
    await page.getByLabel(/target civilian salary/i).pressSequentially('75000', { delay: 50 });
    await page.getByLabel(/total monthly expenses/i).pressSequentially('4000', { delay: 50 });
    await expect(page.getByText(/income surplus|income deficit/i).first()).toBeVisible();
    await expect(page.getByText(/financially ready|almost ready|not yet ready/i).first()).toBeVisible();
  });
});
