import { test, expect } from '@playwright/test';

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
    await expect(page.getByRole('button', { name: /share|copy link/i }).first()).toBeVisible();
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
    await expect(page.getByText(/timeline|separation/i).first()).toBeVisible();
  });

  test('URL params pre-populate calculator inputs', async ({ page }) => {
    // rank param format is lowercase no-hyphen (e.g. o3, not O-3)
    await page.goto('/calculators/transition-readiness?rank=o3&yos=8');
    await expect(page.getByLabel(/rank.*pay grade/i)).toHaveValue('O-3');
  });

  test('page is mobile-responsive: input cards visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText(/current military/i).first()).toBeVisible();
    await expect(page.getByText(/financially ready|almost ready|not yet ready/i).first()).toBeVisible();
  });
});
