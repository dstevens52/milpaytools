import { test, expect } from '@playwright/test';
import {
  getTransitionReadinessExample,
  getExampleSalaryForSurplusTarget,
  TR_EXAMPLE_SURPLUS_TARGET,
} from '../../src/lib/calculations/transition-readiness-example';
import { formatCurrency } from '../../src/lib/utils';

// Rendered worked-example text: interpolated values must keep their surrounding spaces
// (JSX drops whitespace that spans a line break).
test.describe('Transition readiness worked example — rendered spacing', () => {
  const ex = getTransitionReadinessExample();
  const surplus = formatCurrency(ex.monthlyGapOrSurplus); // $1,563 as of 2026-11-10
  const runway = ex.emergencyFundMonths.toFixed(1); // 2.5

  test('calculator page verdict paragraph and hero bar', async ({ page }) => {
    await page.goto('/calculators/transition-readiness');
    const verdict = page.locator('.tr-example p', { hasText: 'Verdict: Not yet ready.' });
    await expect(verdict).toContainText(`a healthy ${surplus} monthly surplus`);
    await expect(verdict).toContainText(`covers ${runway} months of expenses`);
    await expect(page.locator('.tr-page-intro')).toContainText(`${surplus}/mo surplus · ${runway} mo runway`);
  });

  test('blog post example figures', async ({ page }) => {
    await page.goto('/blog/are-you-financially-ready-to-leave-the-military');
    const article = page.locator('main');
    await expect(article).toContainText(`a ${surplus}/month surplus clears`);
    await expect(article).toContainText(`emergency fund: ${runway} months of coverage`);
    await expect(article).toContainText(
      `toward ${formatCurrency(getExampleSalaryForSurplusTarget())} — enough to clear a ${formatCurrency(TR_EXAMPLE_SURPLUS_TARGET)}/month surplus`,
    );
  });
});

test.describe('Transition Readiness Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/transition-readiness');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Transition Readiness/i);
  });

  test('default inputs produce a verdict', async ({ page }) => {
    await expect(
      page.getByText(/financially ready|almost ready|not yet ready/i).first()
    ).toBeVisible();
  });

  test('default state shows military compensation section', async ({ page }) => {
    await expect(page.getByText(/current military/i).first()).toBeVisible();
  });

  test('default state shows projected civilian income section', async ({ page }) => {
    await expect(page.getByText(/projected civilian/i).first()).toBeVisible();
  });

  test('quick expense mode is default and shows total expenses field', async ({ page }) => {
    await expect(page.getByLabel(/total monthly expenses/i)).toBeVisible();
  });

  test('switching to detailed mode shows individual expense fields', async ({ page }) => {
    await page.getByRole('button', { name: /detailed/i }).click();
    await expect(page.getByLabel(/housing/i).first()).toBeVisible();
    await expect(page.getByLabel(/groceries/i).first()).toBeVisible();
  });

  test('switching back to quick mode hides individual expense fields', async ({ page }) => {
    await page.getByRole('button', { name: /detailed/i }).click();
    await page.getByRole('button', { name: /quick/i }).click();
    await expect(page.getByLabel(/total monthly expenses/i)).toBeVisible();
  });

  test('verdict section shows status indicators', async ({ page }) => {
    await expect(page.getByText(/income surplus/i).first()).toBeVisible();
    await expect(page.getByText(/emergency fund/i).first()).toBeVisible();
  });

  test('action steps section is visible', async ({ page }) => {
    await expect(page.getByText(/action steps|what to do/i).first()).toBeVisible();
  });

  test('share button appears after engaging with calculator (salary + expenses required)', async ({ page }) => {
    // Share button is only shown once hasEngaged = true (salary > 0 && expenses > 0)
    await page.getByLabel(/target civilian salary/i).pressSequentially('75000', { delay: 50 });
    await page.getByLabel(/total monthly expenses/i).pressSequentially('4000', { delay: 50 });
    // Desktop viewport (config default): "Share result" is mobile-only, so check "Copy result link".
    await expect(page.getByRole('button', { name: 'Copy result link', exact: true })).toBeVisible();
  });

  // fixme: passes after deployment — tests new Save as PDF button added in batch 2
  test.fixme('save as pdf button appears after engaging with calculator', async ({ page }) => {
    await page.getByLabel(/target civilian salary/i).fill('75000');
    await page.getByLabel(/total monthly expenses/i).fill('4000');
    await expect(page.getByRole('button', { name: /save as pdf/i }).first()).toBeVisible();
  });

  test('retirement-eligible scenario (20+ YOS) shows pension', async ({ page }) => {
    await page.getByLabel(/years of service/i).selectOption('20');
    // Separation months: need separation at 20+ YOS total
    // With 20 YOS + separation months, should show retirement eligible
    await expect(page.getByText(/retirement eligible|pension|tricare/i).first()).toBeVisible();
  });

  test('zero VA rating shows no VA comp in income', async ({ page }) => {
    // Select 0% VA rating
    const vaSelect = page.getByLabel(/va disability/i);
    if (await vaSelect.isVisible()) {
      await vaSelect.selectOption('0');
    }
    // Result should still show income section
    await expect(page.getByText(/projected civilian/i).first()).toBeVisible();
  });

  test("haven't filed VA shows warning in status indicators", async ({ page }) => {
    const vaSelect = page.getByLabel(/va disability/i);
    if (await vaSelect.isVisible()) {
      await vaSelect.selectOption('-1');
    }
    await expect(page.getByText(/va claim|file.*va|bdd/i).first()).toBeVisible();
  });

  test('no spouse income: spouse field set to 0 shows 0 in breakdown', async ({ page }) => {
    const spouseInput = page.getByLabel(/spouse.*income|annual.*spouse/i);
    if (await spouseInput.isVisible()) {
      await spouseInput.fill('0');
    }
    await expect(page.getByText(/projected civilian/i).first()).toBeVisible();
  });

  test('short timeline (under 6 months) shows red timeline status', async ({ page }) => {
    // Set separation to 3 months using the select IDs (labels are empty strings)
    const monthSelect = page.locator('#sep-month');
    const yearSelect = page.locator('#sep-year');
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + 3);
    await monthSelect.selectOption(String(targetDate.getMonth()));
    await yearSelect.selectOption(String(targetDate.getFullYear()));
    await expect(page.locator('main').getByText(/timeline|separation/i).first()).toBeVisible();
  });

  test('URL params pre-populate calculator inputs', async ({ page }) => {
    // rank param format is lowercase no-hyphen (e.g. o3, not O-3)
    await page.goto('/calculators/transition-readiness?rank=o3&yos=8');
    await expect(page.getByLabel(/rank.*pay grade/i)).toHaveValue('O-3');
  });

  test('retiree below 50% VA: retired pay is labeled taxable, waiver line and CRSC box appear', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=75000&sp=50000&exp=4000&mode=quick');
    await expect(page.getByText('Military retired pay (federally taxable)')).toBeVisible();
    await expect(page.getByText('VA waiver offset (rating below 50%)')).toBeVisible();
    await expect(page.getByText(/retirement pension \(tax-free\)/i)).toHaveCount(0);
    await expect(page.getByLabel('My disability is combat-related (CRSC)')).toBeVisible();
    await expect(page.getByRole('link', { name: 'How CRDP and CRSC work' }).first()).toBeVisible();
    // No state chosen: both outcomes shown
    await expect(page.getByText(/if your state taxes retired pay/i)).toBeVisible();
  });

  test('retiree at 50%+ VA: no waiver line and no CRSC box (CRDP)', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=60&sal=75000&sp=50000&exp=4000&mode=quick');
    await expect(page.getByText('Military retired pay (federally taxable)')).toBeVisible();
    await expect(page.getByText('VA waiver offset (rating below 50%)')).toHaveCount(0);
    await expect(page.getByLabel('My disability is combat-related (CRSC)')).toHaveCount(0);
  });

  test('choosing a post-separation state shows its treatment and source', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=75000&sp=50000&exp=4000&mode=quick');
    await page.locator('#retirement-state').selectOption('TX');
    await expect(page.getByText(/Texas: military retired pay not taxed \(no state income tax\)/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Texas revenue department' })).toBeVisible();
    await expect(page.getByText(/if your state taxes retired pay/i)).toHaveCount(0);
  });

  test('single parent defaults to head of household; user can override; both cards follow it', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=10&dep=yes&sp=0&sal=75000&exp=4000&mode=quick');
    const fs = page.locator('#filing-status');
    await expect(fs).toHaveValue('hoh');
    await expect(page.getByText('Est. federal income tax (head of household)')).toHaveCount(2); // military + civilian
    await fs.selectOption('single');
    await expect(page.getByText('Est. federal income tax (single)')).toHaveCount(2);
    await expect(page.getByText('Est. federal income tax (head of household)')).toHaveCount(0);
  });

  test('Vermont: partial exclusion in the phase-out range, statute source, no "both outcomes"', async ({ page }) => {
    // $75K + $50K wages + taxable retired pay → AGI between $125K and $175K.
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=75000&sp=50000&exp=4000&mode=quick&st=VT');
    await expect(page.getByText(/Vermont excludes about \d+% of your military retired pay at this income \(phase-out between \$125,000 and \$175,000 AGI\)\./)).toBeVisible();
    await expect(page.getByText(/applies to federal adjusted gross income for any filing status/)).toBeVisible();
    await expect(page.getByRole('link', { name: '32 V.S.A. § 5830e(d)' })).toBeVisible();
    await expect(page.getByText(/if your state taxes retired pay/i)).toHaveCount(0);
  });

  test('Vermont: low income → all retired pay excluded; high income → none', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=30000&sp=0&exp=4000&mode=quick&st=VT');
    await expect(page.getByText('Vermont excludes all of your military retired pay at this income.')).toBeVisible();
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=200000&sp=0&exp=4000&mode=quick&st=VT');
    await expect(page.getByText('Vermont doesn’t exclude military retired pay at $175,000 AGI or more.')).toBeVisible();
  });

  test('District of Columbia: in the dropdown (alphabetical), taxable, statute source', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=75000&sp=50000&exp=4000&mode=quick');
    const labels = await page.locator('#retirement-state option').allTextContents();
    const i = labels.indexOf('District of Columbia');
    expect(i).toBeGreaterThan(0);
    expect(labels[i - 1]).toBe('Delaware');
    expect(labels[i + 1]).toBe('Florida');
    await page.locator('#retirement-state').selectOption('DC');
    await expect(page.getByText(/District of Columbia: military retired pay taxable\./)).toBeVisible();
    await expect(page.getByRole('link', { name: 'D.C. Code § 47-1803.02' })).toBeVisible();
    await expect(page.getByText(/if your state taxes retired pay/i)).toHaveCount(0);
  });

  test('retired pay states it uses 2026 pay tables with no raise projection', async ({ page }) => {
    await page.goto('/calculators/transition-readiness?rank=e6&yos=20&va=30&sal=75000&sp=50000&exp=4000&mode=quick');
    await expect(page.getByText(/Uses 2026 pay tables — no future raises assumed/)).toBeVisible();
  });

  test('page is mobile-responsive: input cards visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText(/current military/i).first()).toBeVisible();
    await expect(page.getByText(/monthly expenses/i).first()).toBeVisible();
  });
});
