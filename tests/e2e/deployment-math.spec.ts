/**
 * Deployment math (build #8, DEP-02 → DEP-09) — lib checks + UI checks.
 *
 * Expected values are computed from the data files and the shared federal tax function, not
 * hand-keyed. The only literal dollar figure is the DFAS senior enlisted rate data lock.
 * Sources: docs/sources/czte-officer-cap-2026.md; docs/audits/math-audit-round-1.md §2.3.
 */
import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import {
  calculateDeployment,
  defaultDeploymentFilingStatus,
  officerCZTEMonthlyCap,
  type DeploymentInput,
} from '@/lib/calculations/deployment';
import { estimateAnnualFederalTax, FILING_STATUS_LABEL } from '@/lib/calculations/federalTax';
import * as TR from '@/lib/calculations/transition-readiness';
import { TR_EXAMPLE_INPUT, getTransitionReadinessExample } from '@/lib/calculations/transition-readiness-example';
import { lookupBasePay } from '@/lib/calculations/total-compensation';
import { getMHACode, getMHARates } from '@/lib/calculations/bah';
import { formatCurrency } from '@/lib/utils';
import { DEPLOYMENT_RATES_2026 } from '@/data/deployment/2026/constants';
import { SENIOR_ENLISTED_BASIC_PAY } from '@/data/pay-tables/2026';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import { EMPLOYEE_FICA_RATE, FED_TAX_BRACKETS_SINGLE, STANDARD_DEDUCTION_SINGLE } from '@/data/constants';
import type { FilingStatus, TransitionReadinessInput } from '@/types/calculator';
import type { PayGrade } from '@/types/military';

const R = DEPLOYMENT_RATES_2026;
const cents = (n: number) => Math.round(n * 100);

function input(overrides: Partial<DeploymentInput> = {}): DeploymentInput {
  return {
    payGrade: 'E-5',
    yearsOfService: 6,
    hasDependents: false,
    zipCode: '28310',
    monthlyBAH: 0,
    bahFound: true,
    deploymentMonths: 6,
    isCombatZone: true,
    receivingIDP: false,
    hdpLevel: 0,
    hasFSA: false,
    tspContributionPct: 0,
    usingSDP: false,
    sdpDeposit: 0,
    ...overrides,
  };
}

// Mirrors DeploymentCalculator's fmt() / fmtDec()
const usd0 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

// ─── Data lock ───────────────────────────────────────────────────────────────

test.describe('Deployment math — data', () => {
  test('senior enlisted basic pay matches DFAS Basic Pay – Enlisted 2026, Note 3', () => {
    expect(SENIOR_ENLISTED_BASIC_PAY).toBe(11166.9);
  });

  test('TSP limits come from the TSP year file (no deployment duplicates)', () => {
    expect('tspNormalLimit' in R).toBe(false);
    expect('tspCombatZoneLimit' in R).toBe(false);
    expect('officerCZTECap' in R).toBe(false);
    const cz = calculateDeployment(input({ tspContributionPct: 10 }));
    const home = calculateDeployment(input({ tspContributionPct: 10, isCombatZone: false }));
    expect(cz.tour.effectiveTSPLimit).toBe(TSP_CONSTANTS_2026.annualAdditionsLimit);
    expect(home.tour.effectiveTSPLimit).toBe(TSP_CONSTANTS_2026.electiveDeferralLimit);
  });
});

// ─── DEP-05 / DEP-06: officer cap ────────────────────────────────────────────

test.describe('Deployment math — officer CZTE cap (DEP-05/06)', () => {
  test('cap = senior enlisted basic pay + IDP when IDP is received, senior enlisted alone otherwise', () => {
    expect(officerCZTEMonthlyCap(true)).toBe(SENIOR_ENLISTED_BASIC_PAY + R.idp);
    expect(officerCZTEMonthlyCap(false)).toBe(SENIOR_ENLISTED_BASIC_PAY);
  });

  test('O-6, 20 YOS, IDP, combat zone → taxable = (basic pay + IDP) − cap', () => {
    const base = lookupBasePay('O-6', 20);
    const r = calculateDeployment(input({ payGrade: 'O-6', yearsOfService: 20, receivingIDP: true }));
    expect(r.isOfficer).toBe(true);
    expect(r.during.officerCZTECap).toBe(SENIOR_ENLISTED_BASIC_PAY + R.idp);
    expect(cents(r.during.monthlyTaxablePay)).toBe(cents(base + R.idp - (SENIOR_ENLISTED_BASIC_PAY + R.idp)));
    expect(cents(r.during.monthlyExcludedPay)).toBe(cents(SENIOR_ENLISTED_BASIC_PAY + R.idp));
  });

  test('O-6, 20 YOS, no IDP → cap is the senior enlisted rate alone', () => {
    const base = lookupBasePay('O-6', 20);
    const r = calculateDeployment(input({ payGrade: 'O-6', yearsOfService: 20, receivingIDP: false }));
    expect(r.during.officerCZTECap).toBe(SENIOR_ENLISTED_BASIC_PAY);
    expect(cents(r.during.monthlyTaxablePay)).toBe(cents(base - SENIOR_ENLISTED_BASIC_PAY));
  });

  test('the officer’s own IDP and HDP-L count as compensation tested against the cap', () => {
    const base = lookupBasePay('O-6', 20);
    const r = calculateDeployment(input({ payGrade: 'O-6', yearsOfService: 20, receivingIDP: true, hdpLevel: 100 }));
    expect(cents(r.during.monthlyMilitaryPay)).toBe(cents(base + R.idp + 100));
    expect(cents(r.during.monthlyTaxablePay)).toBe(cents(base + R.idp + 100 - officerCZTEMonthlyCap(true)));
  });

  test('O-6 MFJ, 20 YOS, IDP, 9 months: monthly tax uses the tour total’s full-year method', () => {
    const base = lookupBasePay('O-6', 20);
    const r = calculateDeployment(input({
      payGrade: 'O-6', yearsOfService: 20, receivingIDP: true, hasDependents: true, filingStatus: 'mfj', deploymentMonths: 9,
    }));
    const taxable = base + R.idp - officerCZTEMonthlyCap(true);
    const home = 3 * base;
    const tax = (n: number) => estimateAnnualFederalTax(n, 'mfj');
    const deployedTax = tax(home + 9 * taxable) - tax(home);
    expect(deployedTax).toBeGreaterThan(0);
    expect(cents(r.tour.deploymentFederalTax)).toBe(cents(deployedTax));
    expect(cents(r.during.monthlyFederalTax)).toBe(cents(deployedTax / 9));
    // Monthly and tour agree: tax without the exclusion on the deployed months − CZTE savings = deployed tax.
    const noExclusion = tax(home + 9 * (base + R.idp)) - tax(home);
    expect(cents(noExclusion - r.tour.totalCZTESavings)).toBe(cents(deployedTax));
  });

  test('officer deployment over 12 months: full year + remainder, monthly × months = tour tax', () => {
    const base = lookupBasePay('O-6', 20);
    const r = calculateDeployment(input({ payGrade: 'O-6', yearsOfService: 20, receivingIDP: true, filingStatus: 'single', deploymentMonths: 15 }));
    const taxable = base + R.idp - officerCZTEMonthlyCap(true);
    const tax = (n: number) => estimateAnnualFederalTax(n, 'single');
    const expected = tax(12 * taxable) + tax(9 * base + 3 * taxable) - tax(9 * base);
    expect(cents(r.tour.deploymentFederalTax)).toBe(cents(expected));
    expect(cents(r.during.monthlyFederalTax * 15)).toBe(cents(expected));
  });

  test('outside a combat zone, officer monthly tax stays annualized', () => {
    const base = lookupBasePay('O-6', 20);
    const r = calculateDeployment(input({ payGrade: 'O-6', yearsOfService: 20, receivingIDP: true, isCombatZone: false, filingStatus: 'mfj', hasDependents: true }));
    expect(cents(r.during.monthlyFederalTax)).toBe(cents(estimateAnnualFederalTax(12 * (base + R.idp), 'mfj') / 12));
  });

  test('officer below the cap is fully excluded', () => {
    const r = calculateDeployment(input({ payGrade: 'O-3', yearsOfService: 4, receivingIDP: true }));
    expect(r.during.monthlyTaxablePay).toBe(0);
    expect(r.during.monthlyFederalTax).toBe(0);
  });

  test('warrant officers are uncapped (W-5, 30 YOS, IDP + HDP-L)', () => {
    const r = calculateDeployment(input({ payGrade: 'W-5', yearsOfService: 30, receivingIDP: true, hdpLevel: 100 }));
    expect(r.isOfficer).toBe(false);
    expect(r.during.officerCZTECap).toBeNull();
    expect(r.during.monthlyTaxablePay).toBe(0);
    expect(r.during.monthlyFederalTax).toBe(0);
  });
});

// ─── DEP-02 / DEP-03: marginal savings + filing status ───────────────────────

test.describe('Deployment math — CZTE savings at marginal rates (DEP-02/03)', () => {
  test('E-5, 6 YOS, 6 months, single → tax(full year) − tax(half year)', () => {
    const b = lookupBasePay('E-5', 6);
    const r = calculateDeployment(input({ filingStatus: 'single' }));
    const expected = estimateAnnualFederalTax(12 * b, 'single') - estimateAnnualFederalTax(6 * b, 'single');
    expect(cents(r.tour.totalCZTESavings)).toBe(cents(expected));
    // The old average-rate method (monthly tax × months) understated it.
    expect(r.tour.totalCZTESavings).toBeGreaterThan(r.pre.monthlyFederalTax * 6);
  });

  test('excluded IDP and HDP-L are part of the savings (taxable without the exclusion)', () => {
    const b = lookupBasePay('E-5', 6);
    const r = calculateDeployment(input({ filingStatus: 'single', receivingIDP: true, hdpLevel: 100 }));
    const expected =
      estimateAnnualFederalTax(6 * b + 6 * (b + R.idp + 100), 'single') - estimateAnnualFederalTax(6 * b, 'single');
    expect(cents(r.tour.totalCZTESavings)).toBe(cents(expected));
  });

  test('over 12 months: each full 12 months is its own fully excluded year', () => {
    const b = lookupBasePay('E-5', 6);
    const r = calculateDeployment(input({ filingStatus: 'single', deploymentMonths: 18 }));
    const fullYear = estimateAnnualFederalTax(12 * b, 'single');
    const remainder = estimateAnnualFederalTax(12 * b, 'single') - estimateAnnualFederalTax(6 * b, 'single');
    expect(cents(r.tour.totalCZTESavings)).toBe(cents(fullYear + remainder));
  });

  test('default filing status: with dependents → MFJ, without → single; an explicit choice wins', () => {
    expect(defaultDeploymentFilingStatus(true)).toBe('mfj');
    expect(defaultDeploymentFilingStatus(false)).toBe('single');
    expect(calculateDeployment(input({ hasDependents: true })).filingStatus).toBe('mfj');
    expect(calculateDeployment(input({ hasDependents: false })).filingStatus).toBe('single');
    expect(calculateDeployment(input({ hasDependents: true, filingStatus: 'hoh' })).filingStatus).toBe('hoh');
  });

  test('filing status changes the tax: MFJ < HOH < single for the same pay', () => {
    const s = (fs: FilingStatus) => calculateDeployment(input({ filingStatus: fs })).tour.totalCZTESavings;
    expect(s('mfj')).toBeLessThan(s('hoh'));
    expect(s('hoh')).toBeLessThan(s('single'));
  });
});

// ─── DEP-04: FICA ────────────────────────────────────────────────────────────

test.describe('Deployment math — FICA on basic pay (DEP-04)', () => {
  test('E-6 over 10, single, no deployment → FICA = EMPLOYEE_FICA_RATE × basic pay, deducted from take-home', () => {
    const b = lookupBasePay('E-6', 10);
    const r = calculateDeployment(input({ payGrade: 'E-6', yearsOfService: 10, filingStatus: 'single', isCombatZone: false }));
    expect(cents(r.pre.monthlyFICA)).toBe(cents(EMPLOYEE_FICA_RATE * b));
    expect(cents(r.pre.monthlyTakeHome)).toBe(cents(r.pre.grossMonthly - r.pre.monthlyFederalTax - EMPLOYEE_FICA_RATE * b));
  });

  test('FICA is still withheld on basic pay in a combat zone, and only on basic pay', () => {
    const b = lookupBasePay('E-6', 10);
    const r = calculateDeployment(input({ payGrade: 'E-6', yearsOfService: 10, receivingIDP: true, hdpLevel: 100, hasDependents: true, hasFSA: true }));
    expect(cents(r.during.monthlyFICA)).toBe(cents(EMPLOYEE_FICA_RATE * b));
    expect(r.during.monthlyFederalTax).toBe(0);
    expect(cents(r.during.monthlyTakeHome)).toBe(cents(r.during.grossMonthly - EMPLOYEE_FICA_RATE * b));
  });
});

// ─── DEP-08: special pays taxable outside a combat zone ──────────────────────

test.describe('Deployment math — IDP and HDP-L taxable outside a combat zone (DEP-08)', () => {
  test('E-5, no combat zone, IDP + HDP-L $100 → monthly tax rises by the bracket rate × the added pay', () => {
    const b = lookupBasePay('E-5', 6);
    const added = R.idp + 100;
    const plain = calculateDeployment(input({ filingStatus: 'single', isCombatZone: false }));
    const withPays = calculateDeployment(input({ filingStatus: 'single', isCombatZone: false, receivingIDP: true, hdpLevel: 100 }));
    // Bracket the year's taxable income falls in (no crossing for this scenario)
    const taxableLow = 12 * b - STANDARD_DEDUCTION_SINGLE;
    const taxableHigh = 12 * (b + added) - STANDARD_DEDUCTION_SINGLE;
    const bracket = FED_TAX_BRACKETS_SINGLE.find((br) => taxableLow <= br.upTo)!;
    expect(taxableHigh).toBeLessThanOrEqual(bracket.upTo);
    expect(cents(withPays.during.monthlyFederalTax - plain.during.monthlyFederalTax)).toBe(cents(bracket.rate * added));
    expect(withPays.tour.totalCZTESavings).toBe(0);
  });
});

// ─── DEP-07: SDP ─────────────────────────────────────────────────────────────

test.describe('Deployment math — SDP simple interest (DEP-07)', () => {
  test('$10,000 × 12 months = deposit × rate; 1 month = 1/12 of that; deposit clamps; none outside a combat zone', () => {
    const at = (o: Partial<DeploymentInput>) => calculateDeployment(input({ usingSDP: true, ...o })).tour.sdpInterestEarned;
    expect(cents(at({ sdpDeposit: R.sdpMaxDeposit, deploymentMonths: 12 }))).toBe(cents(R.sdpMaxDeposit * R.sdpInterestRate));
    expect(cents(at({ sdpDeposit: R.sdpMaxDeposit, deploymentMonths: 1 }))).toBe(cents((R.sdpMaxDeposit * R.sdpInterestRate) / 12));
    expect(at({ sdpDeposit: R.sdpMaxDeposit * 3, deploymentMonths: 12 })).toBe(at({ sdpDeposit: R.sdpMaxDeposit, deploymentMonths: 12 }));
    expect(at({ sdpDeposit: R.sdpMaxDeposit, deploymentMonths: 12, isCombatZone: false })).toBe(0);
  });
});

// ─── Transition readiness unchanged by the federalTax.ts extraction ──────────

// SHA-256 of the outputs below, computed from main's transition-readiness.ts (617f4d9) before the
// federalTax.ts extraction; the branch reproduces it, and a 5,040-case grid was also byte-identical.
// Any drift in transition readiness changes the hash.
// Updated in build 06 (VA): the only change is the BDD action-step copy ("— tax-free for life." →
// ", excluded from federal taxable income."). With the old sentence restored, the branch reproduced
// the previous golden (8f5230f8…), so every number is unchanged by the VA rate registry.
const TR_GOLDEN_SHA256 = 'ecdfd438c15b2f799685af769725053bee29d82e52cafb4665191d8d00536605';

function transitionSnapshot(): string {
  const out: unknown[] = [TR.FILING_STATUS_LABEL];
  const statuses: FilingStatus[] = ['single', 'mfj', 'hoh'];
  for (const fs of statuses) for (let inc = 0; inc <= 900_000; inc += 7919) out.push([fs, inc, TR.estimateAnnualFederalTax(inc, fs)]);
  out.push(getTransitionReadinessExample());
  const grades: PayGrade[] = ['E-4', 'E-6', 'O-5'];
  for (const g of grades) for (const yos of [10, 20]) for (const fs of statuses) for (const va of [-1, 30, 100])
    for (const sys of ['legacy', 'brs'] as const) for (const st of [null, 'CA']) for (const spouse of [0, 40000]) {
      const i: TransitionReadinessInput = {
        ...TR_EXAMPLE_INPUT, payGrade: g, yearsOfService: yos, filingStatus: fs, vaRating: va,
        retirementSystem: sys, retirementState: st, spouseIncome: spouse, targetCivilianSalary: 90000,
      };
      out.push(TR.calculateTransitionReadiness(i, 1800));
    }
  return createHash('sha256').update(JSON.stringify(out)).digest('hex');
}

test.describe('Transition readiness — unchanged by the shared federal tax module', () => {
  test('re-exported tax function is the shared one', () => {
    expect(TR.estimateAnnualFederalTax).toBe(estimateAnnualFederalTax);
    expect(TR.FILING_STATUS_LABEL).toBe(FILING_STATUS_LABEL);
  });

  test('outputs hash matches the main-branch golden', () => {
    if (process.env.PRINT_TR_HASH) console.log('TR hash', transitionSnapshot());
    expect(transitionSnapshot()).toBe(TR_GOLDEN_SHA256);
  });
});

// ─── UI: worked example, hero strip, results, officer note ───────────────────

const bragBah = () => {
  const mha = getMHACode('28310');
  return (mha && getMHARates(mha, true)?.['E-5']) || 0;
};

test.describe('Deployment page — figures come from the lib', () => {
  test('worked example: CZTE alone saves the marginal MFJ figure', async ({ page }) => {
    const dep = calculateDeployment({
      payGrade: 'E-5', yearsOfService: 8, hasDependents: true, zipCode: '28310', monthlyBAH: bragBah(), bahFound: true,
      deploymentMonths: 9, isCombatZone: true, receivingIDP: true, hdpLevel: 0, hasFSA: true,
      tspContributionPct: 0, usingSDP: false, sdpDeposit: 0,
    });
    expect(dep.filingStatus).toBe('mfj');
    await page.goto('/calculators/deployment');
    const body = page.locator('body');
    await expect(body).toContainText(
      `Over 9 months the CZTE alone saves ${formatCurrency(dep.tour.totalCZTESavings)} in federal income tax (married filing jointly; assumes the deployment falls in one tax year)`,
    );
    await expect(body).toContainText(`${formatCurrency(dep.during.monthlyTakeHome)}/mo`);
    await expect(body).toContainText(formatCurrency(dep.tour.totalTourBenefit));
  });

  test('hero strip: tax savings, SDP and total from the lib (MFJ)', async ({ page }) => {
    const s = calculateDeployment({
      payGrade: 'E-5', yearsOfService: 6, hasDependents: true, zipCode: '28310', monthlyBAH: bragBah(), bahFound: true,
      deploymentMonths: 6, isCombatZone: true, receivingIDP: true, hdpLevel: 0, hasFSA: true,
      tspContributionPct: 0, usingSDP: true, sdpDeposit: R.sdpMaxDeposit,
    });
    await page.goto('/calculators/deployment');
    const strip = page.locator('.calc-example').first();
    await expect(strip).toContainText(`Tax savings ${formatCurrency(s.tour.totalCZTESavings)}`);
    await expect(strip).toContainText(`SDP ${formatCurrency(s.tour.sdpInterestEarned)}`);
    await expect(strip).toContainText(`Total impact: ${formatCurrency(s.tour.totalTourBenefit)}`);
    await expect(strip).toContainText('MFJ');
  });

  test('page copy: spaces around JSX line breaks, October banner gives the memo’s reason', async ({ page }) => {
    await page.goto('/calculators/deployment');
    const body = page.locator('body');
    await expect(body).toContainText('during a combat zone deployment');
    await expect(body).toContainText('IRS Publication 3');
    await expect(body).not.toContainText('zonedeployment');
    await expect(body).not.toContainText('IRSPublication');
    // Memo wording (docs/sources/hostile-pay-memo.pdf): the HDP-L cut is consistent with the
    // maximum for combined HDP-L + HFP/IDP payments. The old "To keep … within its maximum" phrasing stays gone.
    await expect(body).not.toContainText('within its maximum');
    await expect(body).toContainText(
      `Consistent with the maximum allowed for combined HDP-L and HFP or IDP payments, the top Hardship Duty Pay–Location rate dropped from ${formatCurrency(R.hdpLTopRatePrior)} to ${formatCurrency(Math.max(...R.hdpLevels))}/month.`,
    );
  });

  test('tour total explains why tax savings exceed the monthly difference × months (combat zone only)', async ({ page }) => {
    const note = 'Tax savings is larger than the monthly tax difference × months because the excluded pay comes off the top of your tax brackets.';
    await page.goto('/calculators/deployment');
    await expect(page.getByTestId('czte-savings-note')).toHaveText(note);
    await page.goto('/calculators/deployment?cz=no');
    await expect(page.getByTestId('deployment-results')).toBeVisible();
    await expect(page.getByTestId('czte-savings-note')).toHaveCount(0);
  });
});

const results = (page: Page) => page.getByTestId('deployment-results');

test.describe('Deployment calculator — UI', () => {
  test('E-6 over 10, single, no combat zone: FICA row and take-home after FICA', async ({ page }) => {
    const mha = getMHACode('28310');
    const bah = (mha && getMHARates(mha, true)?.['E-6']) || 0;
    const r = calculateDeployment(input({
      payGrade: 'E-6', yearsOfService: 10, hasDependents: true, hasFSA: true, filingStatus: 'single', isCombatZone: false, monthlyBAH: bah,
      deploymentMonths: 9, receivingIDP: true, hdpLevel: 100, tspContributionPct: 10,
    }));
    await page.goto('/calculators/deployment?rank=e6&yos=10&fs=single&cz=no');
    await expect(page.locator('#filing-status')).toHaveValue('single');
    await expect(results(page)).toContainText(`−${usd0(r.pre.monthlyFICA)}`);
    await expect(results(page)).toContainText('Est. take-home after federal income tax and FICA');
    await expect(results(page)).toContainText(usd0(r.pre.monthlyTakeHome));
  });

  test('filing status defaults from dependents until chosen', async ({ page }) => {
    await page.goto('/calculators/deployment');
    await expect(page.locator('#filing-status')).toHaveValue('mfj');
    await page.getByRole('button', { name: 'Without', exact: true }).click();
    await expect(page.locator('#filing-status')).toHaveValue('single');
    await page.locator('#filing-status').selectOption('hoh');
    await page.getByRole('button', { name: 'With deps', exact: true }).click();
    await expect(page.locator('#filing-status')).toHaveValue('hoh');
  });

  test('officer note shows the computed cap and taxable pay (O-6, 20 YOS, IDP)', async ({ page }) => {
    const r = calculateDeployment(input({ payGrade: 'O-6', yearsOfService: 20, receivingIDP: true, hdpLevel: 100, hasDependents: true, hasFSA: true }));
    await page.goto('/calculators/deployment?rank=o6&yos=20');
    const note = page.getByTestId('officer-czte-note');
    await expect(note).toContainText(usd2(r.during.officerCZTECap!));
    await expect(note).toContainText(usd2(r.during.monthlyTaxablePay));
    await expect(note).not.toContainText('re-verified');
  });

  test('warrant officer: no officer cap note', async ({ page }) => {
    await page.goto('/calculators/deployment?rank=w5&yos=30');
    await expect(results(page)).toBeVisible();
    await expect(page.getByTestId('officer-czte-note')).toHaveCount(0);
  });
});

test.describe('Deployment calculator — share link', () => {
  const fsaYes = (page: Page) => page.getByRole('button', { name: `Yes — ${usd0(R.fsa)}/mo` });
  const fsaNo = (page: Page) => fsaYes(page).locator('..').getByRole('button', { name: 'No' });

  test('dependents=yes&fsa=no loads with FSA off', async ({ page }) => {
    await page.goto('/calculators/deployment?dependents=yes&fsa=no');
    await expect(results(page)).toBeVisible();
    await expect(fsaYes(page)).toBeEnabled();
    await expect(fsaNo(page)).toHaveClass(/bg-red-700/);
    await expect(page.getByText('Family Separation', { exact: true })).toHaveCount(0);
  });

  test('dependents=no&fsa=yes still loads with FSA off', async ({ page }) => {
    await page.goto('/calculators/deployment?dependents=no&fsa=yes');
    await expect(fsaYes(page)).toBeDisabled();
    await expect(page.getByText('Family Separation', { exact: true })).toHaveCount(0);
  });

  test('old link (rank, yos, zip, dependents, months only) still loads', async ({ page }) => {
    const r = calculateDeployment(input({
      payGrade: 'E-5', yearsOfService: 6, hasDependents: true, hasFSA: true, deploymentMonths: 6,
      receivingIDP: true, hdpLevel: 100, tspContributionPct: 10, usingSDP: true, sdpDeposit: R.sdpMaxDeposit,
    }));
    await page.goto('/calculators/deployment?rank=e5&yos=6&zip=28310&dependents=yes&months=6');
    await expect(page.getByText('Total deployment financial benefit').locator('xpath=following-sibling::p[1]'))
      .toHaveText(usd0(r.tour.totalTourBenefit));
  });

  test('bad values are clamped or ignored', async ({ page }) => {
    await page.goto('/calculators/deployment?months=99&tsp=500&hdp=75&fs=bogus&sdpDeposit=-5&yos=abc&cz=maybe');
    await expect(page.locator('#deploy-months')).toHaveValue('18');
    await expect(page.locator('#tsp-pct')).toHaveValue('100');
    await expect(page.locator('#hdp')).toHaveValue('100');
    await expect(page.locator('#filing-status')).toHaveValue('mfj');
    await expect(page.locator('#yos')).toHaveValue('10');
    await expect(page.locator('#sdp-deposit')).toHaveValue('0');
  });

  test('round trip: every input survives copy link → reload', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (t: string) => { (window as unknown as { __copied: string }).__copied = t; } },
      });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    const start =
      '/calculators/deployment?rank=o4&yos=14&zip=23511&dependents=yes&fsa=no&fs=hoh&months=7&cz=yes&idp=no&hdp=50&tsp=25&sdp=yes&sdpDeposit=6500';
    await page.goto(start);
    await expect(results(page)).toBeVisible();
    const before = await results(page).innerText();

    await page.getByRole('button', { name: 'Copy result link' }).click();
    const handle = await page.waitForFunction(() => (window as unknown as { __copied?: string }).__copied);
    const url = new URL((await handle.jsonValue()) as string);
    const want = new URL(start, 'http://x').searchParams;
    for (const [k, v] of want) expect(url.searchParams.get(k), k).toBe(v);

    await page.goto(url.pathname + url.search);
    await expect(results(page)).toBeVisible();
    expect(await results(page).innerText()).toBe(before);
    await expect(page.locator('#filing-status')).toHaveValue('hoh');
    await expect(page.locator('#sdp-deposit')).toHaveValue('6500');
  });
});
