import { test, expect } from '@playwright/test';
import { compareLocations, type CompareInput } from '@/lib/calculations/compare';
import { getStateFromZip } from '@/data/compare/stateTax';

// PCS Compare — state income tax under SCRA (50 U.S.C. § 4001), CMP-01/03/04.
// BAH values are typed from the audit (docs/audits/math-audit-round-2.md §2.7,
// repo 2026 data), not read from the dataset.

const loc = (monthlyBAH: number, name: string, mha: string) => ({ monthlyBAH, locationName: name, bahFound: true, mha });

const BRAGG_BENNING: CompareInput = {
  payGrade: 'E-6', yearsOfService: 10, hasDependents: true,
  zipA: '28310', zipB: '31905',
  bahA: loc(2049, 'Fort Bragg/Pope, NC', 'NC182'), bahB: loc(1977, 'Fort Benning, GA', 'GA075'),
};
const NORFOLK_JAX: CompareInput = {
  payGrade: 'E-7', yearsOfService: 14, hasDependents: true,
  zipA: '23511', zipB: '32212',
  bahA: loc(2604, 'Norfolk/Portsmouth, VA', 'VA298'), bahB: loc(2283, 'Jacksonville, FL', 'FL058'),
};
const TACOMA_NORFOLK: CompareInput = {
  payGrade: 'O-3', yearsOfService: 6, hasDependents: false,
  zipA: '98433', zipB: '23511',
  bahA: loc(2784, 'Tacoma, WA', 'WA311'), bahB: loc(2505, 'Norfolk/Portsmouth, VA', 'VA298'),
};

// ─── Lib ──────────────────────────────────────────────────────────────────────

test.describe('Compare — SCRA state tax (lib)', () => {
  test('default (same legal residence): state tax difference $0 in all three audit scenarios', () => {
    for (const s of [BRAGG_BENNING, NORFOLK_JAX, TACOMA_NORFOLK]) {
      const r = compareLocations(s)!;
      expect(r.stateTaxDiffAnnual).toBe(0);
      expect(r.stateTaxIncluded).toBe(false);
      expect(r.afterTaxDiffMonthly).toBe(r.bahDiffMonthly); // verdict follows BAH
    }
  });

  test('Bragg vs Benning: BAH −$72 → "financially similar"', () => {
    const r = compareLocations(BRAGG_BENNING)!;
    expect(r.bahDiffMonthly).toBe(-72);
    expect(r.verdict).toBe('similar');
  });

  test('Norfolk vs Jacksonville: Norfolk favored by $321', () => {
    const r = compareLocations(NORFOLK_JAX)!;
    expect(r.afterTaxDiffMonthly).toBe(-321);
    expect(r.verdict).toBe('A_better');
  });

  test('Tacoma vs Norfolk: Tacoma favored by $279', () => {
    const r = compareLocations(TACOMA_NORFOLK)!;
    expect(r.afterTaxDiffMonthly).toBe(-279);
    expect(r.verdict).toBe('A_better');
  });

  test('residence = Virginia, not changing → both stations taxed at VA rate; difference unchanged', () => {
    const base = compareLocations(NORFOLK_JAX)!;
    const r = compareLocations({ ...NORFOLK_JAX, residenceState: 'VA' })!;
    expect(r.locA.taxState).toBe('VA');
    expect(r.locB.taxState).toBe('VA');
    expect(r.locA.monthlyStateTax).toBeGreaterThan(0);
    expect(r.locB.monthlyStateTax).toBe(r.locA.monthlyStateTax);
    expect(r.stateTaxDiffAnnual).toBe(0);
    expect(r.afterTaxDiffMonthly).toBeCloseTo(base.afterTaxDiffMonthly, 9);
    expect(r.locA.monthlyAfterIncomeTax).toBeLessThan(base.locA.monthlyAfterIncomeTax); // absolute figures change
  });

  test('residence = Virginia + change residence, Norfolk → Jacksonville → B taxed at FL rate (0)', () => {
    const r = compareLocations({ ...NORFOLK_JAX, residenceState: 'VA', changeResidenceToB: true })!;
    expect(r.residenceChangeApplied).toBe(true);
    expect(r.locA.taxState).toBe('VA');
    expect(r.locB.taxState).toBe('FL');
    expect(r.locB.monthlyStateTax).toBe(0);
    expect(r.stateTaxDiffAnnual).toBeLessThan(0);
  });

  test('change-residence box is ignored without a state of legal residence', () => {
    const r = compareLocations({ ...NORFOLK_JAX, changeResidenceToB: true })!;
    expect(r.residenceChangeApplied).toBe(false);
    expect(r.stateTaxDiffAnnual).toBe(0);
  });

  test('CMP-03 station state: 20171 → VA (not DC), 39901 → GA, 88510 → TX', () => {
    expect(getStateFromZip('20171')).toBe('VA');
    expect(getStateFromZip('39901')).toBe('GA');
    expect(getStateFromZip('88510')).toBe('TX');
    const r = compareLocations({ ...NORFOLK_JAX, zipB: '20171', bahB: loc(3000, 'Washington, DC Metro Area', 'DC053') })!;
    expect(r.locB.stationState).toBe('VA');
  });

  test('same ZIP twice → every difference $0, verdict similar', () => {
    const r = compareLocations({ ...NORFOLK_JAX, zipB: NORFOLK_JAX.zipA, bahB: NORFOLK_JAX.bahA, residenceState: 'VA' })!;
    expect(r.bahDiffMonthly).toBe(0);
    expect(r.grossDiffMonthly).toBe(0);
    expect(r.stateTaxDiffAnnual).toBe(0);
    expect(r.federalTaxDiffAnnual).toBe(0);
    expect(r.afterTaxDiffMonthly).toBe(0);
    expect(r.verdict).toBe('similar');
  });

  test('threshold: $100.00 difference → not similar; $99.99 → similar', () => {
    const at = (b: number) => compareLocations({ ...BRAGG_BENNING, bahA: loc(2000, 'A', 'NC182'), bahB: loc(b, 'B', 'GA075') })!;
    expect(at(2100).afterTaxDiffMonthly).toBe(100);
    expect(at(2100).verdict).toBe('B_better');
    expect(at(2099.99).verdict).toBe('similar');
  });

  test('CMP-04: single-filer assumption is exposed; no take-home fields remain', () => {
    const r = compareLocations(BRAGG_BENNING)!;
    expect(r.federalFilingStatus).toBe('single');
    expect(r).not.toHaveProperty('takeHomeDiffMonthly');
    expect(r.locA).not.toHaveProperty('monthlyTakeHome');
  });
});

// ─── UI ───────────────────────────────────────────────────────────────────────

const URL_NORFOLK_JAX = '/calculators/compare?zip1=23511&zip2=32212&rank=E7&dependents=yes&yos=14';

test.describe('Compare — SCRA state tax (UI)', () => {
  test('default: SCRA sentence, no state tax included, no take-home wording, single-filer note', async ({ page }) => {
    await page.goto(URL_NORFOLK_JAX);
    const results = page.getByTestId('compare-results');
    await expect(results).toBeVisible();
    await expect(page.getByTestId('compare-tax-narrative')).toHaveText(
      "Your state income tax doesn't change with a PCS move. Military pay is taxed by your state of legal residence (SCRA).",
    );
    await expect(results.getByText('Federal tax estimated as a single filer')).toBeVisible();
    await expect(results.getByText('Before Social Security and Medicare')).toBeVisible();
    const text = (await results.innerText()).toLowerCase();
    expect(text).not.toContain('take-home');
    expect(text).not.toContain('has no state income tax');
    await expect(page.locator('#residence-state')).toHaveValue('');
  });

  test('residence VA + change residence: savings sentence framed as "if you change your legal residence"', async ({ page }) => {
    await page.goto(URL_NORFOLK_JAX + '&residence=VA&change=yes');
    await expect(page.locator('#residence-state')).toHaveValue('VA');
    await expect(page.locator('#change-residence')).toBeChecked();
    await expect(page.getByTestId('compare-tax-narrative')).toContainText('If you change your legal residence to Florida');
    await expect(page.getByTestId('compare-state-exemption-note')).toBeVisible();
  });

  test('residence VA, not changing: SCRA sentence, state tax shown for both stations', async ({ page }) => {
    await page.goto(URL_NORFOLK_JAX + '&residence=VA');
    await expect(page.locator('#change-residence')).not.toBeChecked();
    await expect(page.getByTestId('compare-tax-narrative')).toContainText("doesn't change with a PCS move");
    await expect(page.getByTestId('compare-results').getByText(/\(VA \d\.\d%\)/)).toHaveCount(2);
  });

  test('bad URL params for the new inputs → defaults', async ({ page }) => {
    await page.goto(URL_NORFOLK_JAX + '&residence=ZZ&change=maybe');
    await expect(page.getByTestId('compare-results')).toBeVisible();
    await expect(page.locator('#residence-state')).toHaveValue('');
    await expect(page.locator('#change-residence')).toHaveCount(0);
    await expect(page.getByTestId('compare-tax-narrative')).toContainText("doesn't change with a PCS move");
  });

  test('hero sample is computed: state tax "same (SCRA)", after-tax equals BAH difference', async ({ page }) => {
    await page.goto('/calculators/compare');
    const hero = page.locator('.calc-example').first();
    await expect(hero).toContainText('same (SCRA)');
    await expect(hero).not.toContainText('State tax savings');
    await expect(page.getByTestId('compare-hero-after-tax')).toBeVisible();
  });
});
