import { test, expect } from '@playwright/test';
import { GI_BILL_TIERS, EDUCATION_RATES } from '@/data/education/2026/constants';
import {
  compareAllBenefits,
  calculatePostGIBill,
  calculateVRE,
  calculateMGIB,
  rateOfPursuitFromCredits,
  type EducationInput,
} from '@/lib/calculations/education';

// Expected values are typed from docs/sources/education-rates-2026-27.md
// (VA.gov pages retrieved 2026-11-12), NOT read from the data file.

// School BAH injected as $3,000 (as in the audit runs).
const BASE: EducationInput = {
  status: 'veteran',
  serviceTier: '36mo+',
  vaRating: 0,
  schoolType: 'public',
  schoolZip: '12345',
  schoolBAH: 3000,
  schoolLocationName: 'Test, ST',
  annualTuition: 12000,
  programYears: 4,
  enrollment: 'full',
};
const gi = (o: Partial<EducationInput>) => calculatePostGIBill({ ...BASE, ...o });

// ─── Data + lib (no page) ─────────────────────────────────────────────────────

test.describe('Education — data and lib (EDU-01–08)', () => {
  test('EDU-01 tier table: 90d→50, 6mo→60, 18mo→70, 24mo→80, 30mo→90, 36mo→100; no 40% tier', () => {
    expect(GI_BILL_TIERS['90d']).toBe(50);
    expect(GI_BILL_TIERS['6mo']).toBe(60);
    expect(GI_BILL_TIERS['18mo']).toBe(70);
    expect(GI_BILL_TIERS['24mo']).toBe(80);
    expect(GI_BILL_TIERS['30mo']).toBe(90);
    expect(GI_BILL_TIERS['36mo+']).toBe(100);
    expect(GI_BILL_TIERS['lt-90']).toBe(0);
    expect(Object.values(GI_BILL_TIERS)).not.toContain(40);
  });

  test('EDU-02 tier applies to housing: 60% → $1,800; 80% → $2,400 (BAH $3,000, full time)', () => {
    expect(gi({ serviceTier: '12mo' }).monthlyMHA).toBe(1800);
    expect(gi({ serviceTier: '6mo' }).monthlyMHA).toBe(1800);
    expect(gi({ serviceTier: '24mo' }).monthlyMHA).toBe(2400);
  });

  test('EDU-03 rate of pursuit: half time → $0; ¾ time → 80% of the tiered MHA; 9/12 credits = 80%', () => {
    expect(gi({ enrollment: 'half' }).monthlyMHA).toBe(0);
    expect(gi({ enrollment: 'half' }).housingBasis).toBe('pursuit-too-low');
    expect(gi({ enrollment: 'three-quarter' }).monthlyMHA).toBe(2400); // 100% × 0.8 × 3000
    expect(gi({ enrollment: 'three-quarter', serviceTier: '24mo' }).monthlyMHA).toBeCloseTo(1920, 6); // 80% tier × 0.8
    expect(rateOfPursuitFromCredits(9, 12)).toBe(0.8);
    expect(rateOfPursuitFromCredits(6, 12)).toBe(0.5);
  });

  test('online only, 100% tier, full time → $1,198', () => {
    expect(gi({ schoolType: 'online', schoolBAH: null }).monthlyMHA).toBe(1198);
  });

  test('EDU-04 VR&E without GI Bill eligibility, full time, no dependents → $837.23', () => {
    const v = calculateVRE({ ...BASE, serviceTier: 'lt-90', vaRating: 30 });
    expect(v.monthlyMHA).toBe(837.23);
    expect(v.housingBasis).toBe('vre-standard');
  });

  test('EDU-04 VR&E with GI Bill tier > 0 → the BAH-based rate', () => {
    const v = calculateVRE({ ...BASE, serviceTier: '12mo', vaRating: 30 });
    expect(v.monthlyMHA).toBe(3000);
    expect(v.housingBasis).toBe('vre-p911');
  });

  test('VR&E at half time → standard ½-time rate $420.92 (not $0)', () => {
    expect(calculateVRE({ ...BASE, serviceTier: 'lt-90', vaRating: 30, enrollment: 'half' }).monthlyMHA).toBe(420.92);
  });

  test('EDU-04 badge follows corrected numbers (VR&E no longer auto-highest without GI Bill)', () => {
    // <90 days, 30% rating, public $12k: VR&E = 12,000 + 837.23×9 + 1,200 per year.
    const r = compareAllBenefits({ ...BASE, serviceTier: 'lt-90', vaRating: 30 });
    const vre = r.benefits.find((b) => b.id === 'vre')!;
    expect(vre.totalAnnualValue).toBeCloseTo(12000 + 837.23 * 9 + 1200, 6);
    const best = r.benefits.filter((b) => b.eligible && b.valued).sort((a, b) => b.totalProgramValue - a.totalProgramValue)[0];
    expect(r.bestBenefitId).toBe(best.id);
  });

  test('EDU-05 active duty → MHA $0 and the insight shows a non-zero forfeited amount', () => {
    const r = compareAllBenefits({ ...BASE, status: 'active-duty' });
    expect(r.benefits.find((b) => b.id === 'gi-bill')!.monthlyMHA).toBe(0);
    const insight = r.insights.find((i) => i.startsWith('Strategy:'))!;
    expect(insight).toContain('~$3,000/month');
    expect(insight).toMatch(/worth ~\$[1-9][\d,]* over 4 years/);
    expect(insight).not.toContain('~$0');
  });

  test('EDU-05 MGIB on active duty is not valued as a full stipend and never takes the badge', () => {
    const r = compareAllBenefits({ ...BASE, status: 'active-duty' });
    const mgib = r.benefits.find((b) => b.id === 'mgib')!;
    expect(mgib.valued).toBe(false);
    expect(mgib.totalProgramValue).toBe(0);
    expect(mgib.notes[0]).toBe('While on active duty, generally limited to tuition and fees');
    expect(r.bestBenefitId).not.toBe('mgib');
  });

  test('EDU-06 veteran with an unresolved ZIP → housing pending, no badge, no active-duty basis', () => {
    const r = compareAllBenefits({ ...BASE, schoolBAH: null, schoolLocationName: null });
    const g = r.benefits.find((b) => b.id === 'gi-bill')!;
    expect(g.housingBasis).toBe('zip-needed');
    expect(r.housingPending).toBe(true);
    expect(r.bestBenefitId).toBeNull();
  });

  test('private $50,000 tuition at 100% → $30,908.34; public online → no private cap', () => {
    expect(gi({ schoolType: 'private', annualTuition: 50000 }).annualTuitionCoverage).toBe(30908.34);
    expect(gi({ schoolType: 'online', onlineInstitution: 'public', schoolBAH: null, annualTuition: 50000 }).annualTuitionCoverage).toBe(50000);
    expect(gi({ schoolType: 'online', onlineInstitution: 'private', schoolBAH: null, annualTuition: 50000 }).annualTuitionCoverage).toBe(30908.34);
  });

  test('EDU-07 data: MGIB $2,601.00 / $1,950.75 / $1,300.50; online $1,198; cap $30,908.34; books $1,000', () => {
    expect(calculateMGIB(BASE).monthlyMHA).toBe(2601);
    expect(calculateMGIB({ ...BASE, enrollment: 'three-quarter' }).monthlyMHA).toBe(1950.75);
    expect(calculateMGIB({ ...BASE, enrollment: 'half' }).monthlyMHA).toBe(1300.5);
    expect(EDUCATION_RATES.giBill.onlineMHAMonthly).toBe(1198);
    expect(EDUCATION_RATES.giBill.privateCapAnnual).toBe(30908.34);
    expect(EDUCATION_RATES.giBill.bookStipendAnnualMax).toBe(1000);
  });

  test('MGIB service length: under 90 days + 30% rating → MGIB not eligible, badge is NOT MGIB', () => {
    const r = compareAllBenefits({ ...BASE, serviceTier: 'lt-90', vaRating: 30 });
    const mgib = r.benefits.find((b) => b.id === 'mgib')!;
    expect(mgib.eligible).toBe(false);
    expect(mgib.ineligibleReason).toBe('Not eligible based on service length');
    expect(mgib.notes).toEqual(['Some early separations have exceptions — check with VA.']);
    expect(r.bestBenefitId).not.toBe('mgib');
    expect(r.bestBenefitId).toBe('vre');
  });

  test('MGIB service length: every option under 24 months is not eligible', () => {
    for (const tier of ['lt-90', '90d', '6mo', '12mo', '18mo']) {
      expect(calculateMGIB({ ...BASE, serviceTier: tier }).eligible, tier).toBe(false);
    }
  });

  test('MGIB service length: 24+ months → eligible as before ($2,601.00 full time)', () => {
    for (const tier of ['24mo', '30mo', '36mo+']) {
      const m = calculateMGIB({ ...BASE, serviceTier: tier });
      expect(m.eligible, tier).toBe(true);
      expect(m.valued, tier).toBe(true);
      expect(m.monthlyMHA, tier).toBe(2601);
    }
  });

  test('EDU-08 notes: Yellow Ribbon only at 100%; Guard/Reserve 1606 note; no 2018 claim; TA wording', () => {
    const at100 = gi({ schoolType: 'private', annualTuition: 50000 }).notes.join(' ');
    const at60 = gi({ schoolType: 'private', annualTuition: 50000, serviceTier: '12mo' }).notes.join(' ');
    expect(at100).toContain('Yellow Ribbon');
    expect(at60).not.toContain('Yellow Ribbon');
    const gr = calculateMGIB({ ...BASE, status: 'guard-reserve' }).notes.join(' ');
    expect(gr).toContain('Selected Reserve (Chapter 1606) rates differ and aren\'t modeled');
    expect(calculateMGIB(BASE).notes.join(' ')).not.toMatch(/2018/);
    const ta = compareAllBenefits(BASE).benefits.find((b) => b.id === 'ta')!;
    expect(ta.ineligibleReason).toBe('Tuition Assistance is for active-duty members; Guard and Reserve eligibility varies by service');
  });
});

// ─── Calculator page ─────────────────────────────────────────────────────────

test.describe('Education Benefits Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/education');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Education|GI Bill/i);
  });

  test('Post-9/11 GI Bill card is shown', async ({ page }) => {
    await expect(page.getByText('Post-9/11 GI Bill').first()).toBeVisible();
  });

  test('MGIB card is shown', async ({ page }) => {
    await expect(page.getByText(/Montgomery GI Bill|MGIB/i).first()).toBeVisible();
  });

  test('Tuition Assistance card is visible', async ({ page }) => {
    await expect(page.getByText(/Tuition Assistance/i).first()).toBeVisible();
  });

  test('best value badge appears on the highest-value benefit', async ({ page }) => {
    await expect(page.getByText('Highest est. value')).toBeVisible();
  });

  test('total program value is displayed for eligible benefits', async ({ page }) => {
    await expect(page.getByText('Total program value').first()).toBeVisible();
  });

  test('service status toggle is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Active Duty|Veteran|Guard/i }).first()).toBeVisible();
  });

  test('veteran status shows the TA eligibility wording', async ({ page }) => {
    await page.getByRole('button', { name: 'Veteran' }).click();
    await expect(
      page.getByText('Tuition Assistance is for active-duty members; Guard and Reserve eligibility varies by service'),
    ).toBeVisible();
  });

  test('tier hint reads 50%–100%', async ({ page }) => {
    await expect(page.getByText('Determines Post-9/11 GI Bill eligibility tier (50%–100%)')).toBeVisible();
  });

  test('program length selector is visible', async ({ page }) => {
    await expect(page.getByText(/program length|years of school|4-year/i).first()).toBeVisible();
  });

  test('entering a valid ZIP updates MHA display', async ({ page }) => {
    const zipInput = page.locator('input[type="text"]').first();
    await zipInput.fill('28307');
    await expect(page.getByText(/MHA|Housing Allowance|housing/i).first()).toBeVisible();
  });

  test('online vs in-person enrollment toggle is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Online|In-Person|In Person/i }).first()).toBeVisible();
  });

  test('EDU-06 veteran with an unresolved ZIP → no active-duty notice, ZIP prompt instead', async ({ page }) => {
    await page.getByRole('button', { name: 'Veteran' }).click();
    const zipInput = page.locator('input[type="text"]').first();
    await zipInput.fill('00000');
    await expect(page.getByTestId('housing-gi-bill')).toHaveText('Enter a valid school ZIP to estimate housing');
    await expect(page.getByTestId('active-duty-mha-notice')).toHaveCount(0);
    await expect(page.getByText('Highest est. value')).toHaveCount(0);
  });

  test('active duty shows the active-duty notice and the MGIB tuition-and-fees note', async ({ page }) => {
    await page.getByRole('button', { name: 'Active duty' }).click();
    await expect(page.getByTestId('active-duty-mha-notice')).toBeVisible();
    await expect(page.getByTestId('mgib-active-duty-note')).toContainText('Generally limited to tuition and fees');
  });

  test('Yellow Ribbon note hidden below the 100% tier', async ({ page }) => {
    await page.getByRole('button', { name: 'Private' }).click();
    await expect(page.getByTestId('yellow-ribbon-note')).toBeVisible();
    await page.locator('select').first().selectOption('12mo');
    await expect(page.getByTestId('yellow-ribbon-note')).toHaveCount(0);
  });

  test('half time: GI Bill housing $0 with the half-time explanation', async ({ page }) => {
    await page.getByRole('combobox').filter({ hasText: 'Full-time' }).selectOption('half');
    await expect(page.getByTestId('housing-gi-bill')).toHaveText('Not paid at half time or less');
  });
});

test.describe('Education — MGIB service length (UI)', () => {
  test('under 90 days + 30% rating: MGIB card says not eligible, badge not on MGIB', async ({ page }) => {
    await page.goto('/calculators/education?tier=lt-90&va=30');
    await expect(page.getByTestId('ineligible-mgib')).toHaveText('Not eligible based on service length');
    await expect(page.getByText('Some early separations have exceptions — check with VA.')).toBeVisible();
    const badge = page.getByText('Highest est. value', { exact: true });
    await expect(badge).toBeVisible();
    await expect(badge.locator('xpath=..').locator('p.font-bold')).toHaveText('VR&E');
  });
});

test.describe('Education — URL params', () => {
  test('bad ?tier= and ?va= fall back to defaults', async ({ page }) => {
    await page.goto('/calculators/education?tier=bogus&va=55');
    await expect(page.locator('select').first()).toHaveValue('36mo+');
    await expect(page.locator('select').nth(1)).toHaveValue('0');
  });

  test('valid ?tier= and ?va= are applied', async ({ page }) => {
    await page.goto('/calculators/education?tier=24mo&va=30');
    await expect(page.locator('select').first()).toHaveValue('24mo');
    await expect(page.locator('select').nth(1)).toHaveValue('30');
  });
});
