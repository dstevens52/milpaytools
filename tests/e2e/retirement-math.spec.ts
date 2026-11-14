/**
 * Retirement math (build #5): High-3 by month, months input, civilian equivalent,
 * TSP deferral cap, BRS timing (60 days / 2 years / 26 years), share link.
 *
 * Check values are the rule values from docs/audits/math-audit-round-1.md (RET-02–07,
 * TC-01) and the build #5 spec, derived from the repo's 2026 pay table.
 */

import { test, expect } from '@playwright/test';
import {
  calculateRetirement,
  calculateHigh3Average,
  calculatePension,
  calculateTSPGrowth,
} from '@/lib/calculations/retirement';
import { lookupBasePay } from '@/lib/calculations/basePay';
import {
  brsTierContribution,
  brsGovContribution,
  BRS_GOV_LAST_SERVICE_MONTH,
} from '@/lib/calculations/brs';
import { projectTSP } from '@/lib/calculations/tspGrowth';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import type { RetirementInput } from '@/types/calculator';

const FICA = 0.0765;

// Mirrors RetirementCalculator's fmt()
function fmtWhole(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function ret(overrides: Partial<RetirementInput> = {}) {
  return calculateRetirement({
    retirementSystem: 'high3',
    currentGrade: 'E-7',
    currentYOS: 20,
    retirementYOS: 20,
    retirementGrade: 'E-7',
    tspContributionPct: 5,
    tspCurrentBalance: 0,
    tspAnnualReturnPct: 7,
    vaRating: 0,
    ...overrides,
  });
}

test.describe('Retirement — High-3 by month (RET-03, RET-07)', () => {
  test('E-7, 20y0m, High-3 → avg $6,118.50, pension $3,059.25', () => {
    const r = ret();
    expect(r.high3Average).toBeCloseTo(6118.5, 2);
    expect(r.monthlyPension).toBeCloseTo(3059.25, 2);
    // Years 18, 19, 20 of service = Over 16 × 12 months, Over 18 × 24 months
    expect(r.high3Breakdown).toEqual([
      { column: 'Over 16', months: 12, monthlyPay: lookupBasePay('E-7', 16), firstPublishedColumn: false },
      { column: 'Over 18', months: 24, monthlyPay: lookupBasePay('E-7', 18), firstPublishedColumn: false },
    ]);
  });

  test('E-7, 20y0m, BRS → pension $2,447.40 (exactly 80% of High-3)', () => {
    const r = ret({ retirementSystem: 'brs' });
    expect(r.monthlyPension).toBeCloseTo(2447.4, 2);
    expect(r.monthlyPension).toBeCloseTo(r.high3MonthlyPension * 0.8, 6);
  });

  test('E-7, 20y6m, High-3 → avg $6,159.30, multiplier 51.25%, pension $3,156.64', () => {
    const r = ret({ retirementMonths: 6 });
    expect(r.high3Average).toBeCloseTo(6159.3, 2);
    expect(r.pensionMultiplierPct).toBeCloseTo(51.25, 9);
    expect(r.monthlyPension).toBeCloseTo(3156.64, 2);
    expect(r.high3Breakdown.map((g) => [g.column, g.months])).toEqual([
      ['Over 16', 6], ['Over 18', 24], ['Over 20', 6],
    ]);
  });

  test('O-5, 20y0m → avg $11,606.30', () => {
    expect(calculateHigh3Average('O-5', 20).average).toBeCloseTo(11606.3, 2);
  });

  test('40 years → 100% High-3 / 80% BRS multiplier (no 75% cap)', () => {
    expect(ret({ retirementYOS: 40 }).pensionMultiplierPct).toBeCloseTo(100, 9);
    expect(ret({ retirementYOS: 40, retirementSystem: 'brs' }).pensionMultiplierPct).toBeCloseTo(80, 9);
  });

  test('months are clamped to 0–11', () => {
    expect(calculatePension('high3', 20, 1000, 0)).toBeCloseTo(500, 9);
    expect(calculatePension('high3', 20, 1000, 12)).toBeCloseTo(calculatePension('high3', 20, 1000, 11), 9);
    expect(calculatePension('high3', 20, 1000, -3)).toBeCloseTo(500, 9);
  });

  test('UI: months select changes the multiplier to 51.25%', async ({ page }) => {
    await page.goto('/calculators/retirement?system=high3&rank=e7&yos=20&currank=e7&curyos=20');
    await page.getByTestId('retirement-months').selectOption('6');
    await expect(page.getByText('51.25% multiplier')).toBeVisible();
    await expect(page.getByText(`${fmtWhole(ret({ retirementMonths: 6 }).monthlyPension)}`).first()).toBeVisible();
  });
});

test.describe('Retirement — no $0 High-3 months (RET-04)', () => {
  for (const [grade, yos] of [['W-5', 20], ['O-9', 20], ['O-10', 21]] as const) {
    test(`${grade} at ${yos}: no $0 month, first published column flagged`, () => {
      const h = calculateHigh3Average(grade, yos);
      expect(h.usedFirstPublishedColumn).toBe(true);
      expect(h.breakdown.every((g) => g.monthlyPay > 0)).toBe(true);
      expect(h.breakdown.reduce((s, g) => s + g.months, 0)).toBe(36);
      expect(h.average).toBeCloseTo(lookupBasePay(grade, 20), 6); // first published = Over 20
    });
  }

  test('UI: W-5 at 20 shows the first-published-rate note and no $0', async ({ page }) => {
    await page.goto('/calculators/retirement?system=high3&rank=w5&yos=20&currank=w5&curyos=20');
    const card = page.getByTestId('high3-card');
    await expect(card).toContainText('first published rate');
    await expect(card).not.toContainText('$0/mo');
    await expect(page.getByTestId('high3-first-column-note')).toHaveText(
      'No published W-5 rate below 20 years; the first published rate is used for earlier months.',
    );
  });
});

test.describe('Retirement — civilian equivalent (RET-02)', () => {
  test('E-7, 20y0m, High-3, no VA → $40,206 (retired pay × (1 − t) ÷ (1 − t − FICA), t = 12%)', () => {
    const r = ret();
    const t = r.civilianMarginalRatePct / 100;
    expect(t).toBeCloseTo(0.12, 9);
    expect(r.civilianEquivalent).toBeCloseTo((r.monthlyPension * 12 * (1 - t)) / (1 - t - FICA), 6);
    expect(Math.round(r.civilianEquivalent)).toBe(40206);
  });

  test('50% VA (CRDP): VA grossed up by income tax + FICA at the marginal bracket', () => {
    const r = ret({ vaRating: 50 });
    const t = r.civilianMarginalRatePct / 100;
    expect(r.civilianEquivalent).toBeCloseTo(
      (r.taxableRetiredPay * 12 * (1 - t)) / (1 - t - FICA) + (r.vaTaxFree * 12) / (1 - t - FICA),
      6,
    );
  });

  test('UI: no VA → no "tax-free" wording; method stated beside the number', async ({ page }) => {
    await page.goto('/calculators/retirement?system=high3&rank=e7&yos=20&currank=e7&curyos=20');
    const r = ret();
    const callout = page.getByTestId('civilian-callout');
    await expect(callout).not.toContainText(/tax-free/i);
    await expect(callout).toContainText(
      `Federal only, single filer, at a ${Math.round(r.civilianMarginalRatePct)}% marginal bracket. State taxes vary.`,
    );
    await expect(page.getByTestId('civilian-method')).not.toContainText(/tax-free/i);
  });
});

test.describe('Retirement — TSP cap and BRS timing (RET-06, RET-09, TC-01)', () => {
  test('BRS tiers: 0% → 1%, 3% → 4%, 4% → 4.5%, 5% and 50% → 5%', () => {
    const pay = 5000;
    for (const [pct, gov] of [[0, 0.01], [3, 0.04], [4, 0.045], [5, 0.05], [50, 0.05]] as const) {
      expect(brsTierContribution(pay, (pay * pct) / 100).total).toBeCloseTo(pay * gov, 6);
    }
  });

  test('current YOS 0 / 1 / 2 → match begins projection month 25 / 13 / 1', () => {
    const pay = 4000;
    const member = pay * 0.05;
    for (const [yos, firstMatchMonth] of [[0, 25], [1, 13], [2, 1]] as const) {
      const months = Array.from({ length: 30 }, (_, i) => i + 1);
      const first = months.find((m) => brsGovContribution(pay, member, yos * 12 + m).match > 0);
      expect(first).toBe(firstMatchMonth);
    }
    // Automatic 1% after 60 days: none in service months 1–2
    expect(brsGovContribution(pay, member, 2).total).toBe(0);
    expect(brsGovContribution(pay, member, 3).total).toBeCloseTo(pay * 0.01, 6);
  });

  test('government contributions end after 26 years (service month 312)', () => {
    expect(BRS_GOV_LAST_SERVICE_MONTH).toBe(312);
    expect(brsGovContribution(4000, 200, 312).total).toBeGreaterThan(0);
    expect(brsGovContribution(4000, 200, 313).total).toBe(0);
  });

  test('projectTSP 20 → 30 YOS: no government money after year 26; member continues', () => {
    const p = projectTSP({
      startingBalance: 0,
      monthlyContribution: lookupBasePay('E-7', 20) * 0.05,
      retirementSystem: 'brs',
      payGrade: 'E-7',
      yearsOfService: 20,
      allocation: { G: 100, F: 0, C: 0, S: 0, I: 0 },
      yearsToProject: 10,
      annualPayRaisePct: 0,
      moreYearsToServe: 10,
    });
    for (let y = 1; y <= 6; y++) expect(p.snapshots[y].annualGovContrib).toBeGreaterThan(0);
    for (let y = 7; y <= 10; y++) {
      expect(p.snapshots[y].annualGovContrib).toBe(0);
      expect(p.snapshots[y].annualMemberContrib).toBeGreaterThan(0);
    }
  });

  test('retirement TSP: same 26-year stop (projection to 30 YOS at 0% return)', () => {
    const pay = lookupBasePay('E-7', 20);
    const base = { currentBalance: 0, basePayMonthly: pay, contributionPct: 5, currentYOS: 20, annualReturnPct: 0 };
    const to26 = calculateTSPGrowth({ ...base, monthsToRetire: 72 });
    const to30 = calculateTSPGrowth({ ...base, monthsToRetire: 120 });
    // Months 73–120 add only the member's own 5%
    expect(to30.balance - to26.balance).toBeCloseTo(48 * pay * 0.05, 6);
  });

  test('O-5, 10 YOS, 50% → member contributions capped at the deferral limit', () => {
    const pay = lookupBasePay('O-5', 10);
    const limit = TSP_CONSTANTS_2026.electiveDeferralLimit;
    const oneYear = calculateTSPGrowth({
      currentBalance: 0, basePayMonthly: pay, contributionPct: 50, monthsToRetire: 12, currentYOS: 10, annualReturnPct: 0,
    });
    expect(oneYear.memberCapped).toBe(true);
    // The limit is reached in month 5; matching is paid on months 1–5 only, the 1% all year
    const monthsWithMatch = Math.ceil(limit / (pay * 0.5));
    const gov = 12 * pay * 0.01 + monthsWithMatch * pay * 0.04;
    expect(oneYear.balance).toBeCloseTo(limit + gov, 6);
    expect(
      ret({ retirementSystem: 'brs', currentGrade: 'O-5', retirementGrade: 'O-5', currentYOS: 10, tspContributionPct: 50 })
        .tspMemberCapped,
    ).toBe(true);
  });

  test('RET-08: E-9 with current YOS 5 (no published rate) → flagged, message shown', async ({ page }) => {
    expect(
      ret({ retirementSystem: 'brs', currentGrade: 'E-9', retirementGrade: 'E-9', currentYOS: 5 }).tspPayUnavailable,
    ).toBe(true);
    await page.goto('/calculators/retirement?system=brs&rank=e9&yos=20&currank=e9&curyos=5');
    await expect(page.getByTestId('tsp-pay-unavailable')).toBeVisible();
  });
});

test.describe('Retirement — share link (RET-05)', () => {
  test('default BRS state → copy link → reload → identical total income', async ({ page }) => {
    await page.addInitScript(() => {
      // Capture the copied URL without relying on per-browser clipboard permissions
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (t: string) => {
            (window as unknown as { __copied: string }).__copied = t;
          },
        },
      });
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/calculators/retirement');

    const expected = ret({ retirementSystem: 'brs', currentYOS: 10 });
    // "Total BRS monthly income" row shows the monthly figure
    const expectedMonthly = `${fmtWhole(expected.totalBRSMonthlyIncome)}/mo`;
    const card = page.getByTestId('tsp-card');
    await expect(card).toContainText(expectedMonthly);
    const before = await card.innerText();

    await page.getByRole('button', { name: 'Copy result link' }).click();
    const handle = await page.waitForFunction(() => (window as unknown as { __copied?: string }).__copied);
    const url = (await handle.jsonValue()) as string;
    expect(url).toContain('curyos=10');
    expect(url).toContain('tsp=5');

    await page.goto(url);
    await expect(page.getByTestId('tsp-card')).toContainText(expectedMonthly);
    expect(await page.getByTestId('tsp-card').innerText()).toBe(before);
  });

  test('monthly labels show monthly figures (/mo, not /yr)', async ({ page }) => {
    await page.goto('/calculators/retirement');
    const r = ret({ retirementSystem: 'brs', currentYOS: 10 });
    const tsp = page.getByTestId('tsp-card');
    await expect(tsp).toContainText(`${fmtWhole(r.tspMonthlyIncome)}/mo`);
    await expect(tsp).toContainText(`${fmtWhole(r.totalBRSMonthlyIncome)}/mo`);
    await expect(tsp).not.toContainText('/yr');
    const pensionRow = page.getByText('Monthly Pension', { exact: true }).locator('..');
    await expect(pensionRow).toContainText(`${fmtWhole(r.monthlyPension)}/mo`);
  });

  test('old link (rank + yos only) still loads; bad params clamp or fall back', async ({ page }) => {
    await page.goto('/calculators/retirement?rank=e7&yos=20&system=high3&varating=0');
    await expect(page.getByText(`${fmtWhole(ret().monthlyPension)}/mo`).first()).toBeVisible();

    // Unknown grade → default E-7; yos 99 → 40; months ignored at 40 years
    await page.goto('/calculators/retirement?system=high3&rank=X-99&yos=99&months=40&currank=e7&curyos=20');
    await expect(page.getByText(`${fmtWhole(ret({ retirementYOS: 40 }).monthlyPension)}/mo`).first()).toBeVisible();
    await expect(page.getByTestId('retirement-months')).toBeDisabled();
  });
});
