import { test, expect, type Page } from '@playwright/test';
import { getBasePay, getBAS, getBAH } from './helpers/data';
import { resultCardNum, formatCurrency } from './helpers/format';

// Total Compensation calculator uses:
//   - ResultCard rows: formatCurrency(monthly * 12) + '/yr' (annual only, 0 decimals)
//   - Headline / tax-free breakdown: formatCurrency (0 decimals)
// We use formatCurrency for all result card assertions.
//
// Duty station is now a REQUIRED input: results are gated on a matched CONUS
// station (valid ZIP that isn't a territory). Most tests therefore enter a
// known-good station (Fort Bragg, 28307) before asserting on results.

const STATION_ZIP = '28307'; // Fort Bragg — matched CONUS station
// Unique results marker — only renders once a CONUS station is matched.
const RESULTS_MARKER = 'Pay & Allowances Breakdown';

async function enterStation(page: Page, zip: string = STATION_ZIP) {
  await page.getByLabel('Duty Station').pressSequentially(zip, { delay: 50 });
}

test.describe('Total Compensation Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/total-compensation');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Total Military Compensation/i);
  });

  // ── Station gate states ───────────────────────────────────────────────────

  test('no duty station shows the prompt, not results', async ({ page }) => {
    await expect(
      page.getByText('Enter your duty station to see your full compensation'),
    ).toBeVisible();
    // Results must not render without a station.
    await expect(page.getByText(RESULTS_MARKER)).not.toBeVisible();
  });

  test('unmatched ZIP shows the could-not-match message (not results)', async ({ page }) => {
    await enterStation(page, '00000'); // valid 5-digit format, not in BAH dataset
    await expect(page.getByText("We couldn't match that location")).toBeVisible();
    await expect(page.getByText(RESULTS_MARKER)).not.toBeVisible();
  });

  test('U.S. territory ZIP shows the OHA message (not results)', async ({ page }) => {
    await enterStation(page, '00601'); // Puerto Rico — territory (OHA, no BAH)
    await expect(
      page.getByText("We couldn't determine CONUS BAH for this location"),
    ).toBeVisible();
    await expect(page.getByText(RESULTS_MARKER)).not.toBeVisible();
  });

  // ── Results (require a matched station) ────────────────────────────────────

  test('default values produce correct base pay (E-5, 6 YOS)', async ({ page }) => {
    await enterStation(page);
    const basePay = getBasePay('E-5', 6);
    await expect(page.getByText(`${formatCurrency(basePay * 12)}/yr`).first()).toBeVisible();
  });

  test('default values produce correct BAS', async ({ page }) => {
    await enterStation(page);
    // BAS is shown via formatCurrency (0 decimals) in the tax-free breakdown card
    const bas = getBAS('E-5');
    // $476.95 → formatCurrency → $477
    await expect(page.getByText(formatCurrency(bas)).first()).toBeVisible();
  });

  test('changing grade to O-3 updates base pay', async ({ page }) => {
    await enterStation(page);
    await page.getByLabel('Rank / Pay Grade').selectOption('O-3');
    const basePay = getBasePay('O-3', 6);
    await expect(page.getByText(`${formatCurrency(basePay * 12)}/yr`).first()).toBeVisible();
  });

  test('changing grade to O-3 shows officer BAS', async ({ page }) => {
    await enterStation(page);
    await page.getByLabel('Rank / Pay Grade').selectOption('O-3');
    const bas = getBAS('O-3');
    await expect(page.getByText(formatCurrency(bas)).first()).toBeVisible();
  });

  test('entering valid ZIP shows BAH', async ({ page }) => {
    const bah = getBAH('28307', 'E-5', false);
    if (!bah) test.skip();
    await enterStation(page);
    await expect(page.getByText(formatCurrency(bah!)).first()).toBeVisible();
  });

  test('dependent toggle changes BAH value', async ({ page }) => {
    await enterStation(page);
    const bahNoDep = getBAH('28307', 'E-5', false);
    const bahWithDep = getBAH('28307', 'E-5', true);
    if (!bahNoDep || !bahWithDep) test.skip();

    // Initially without dependents
    await expect(page.getByText(formatCurrency(bahNoDep!)).first()).toBeVisible();

    // Toggle to with dependents
    await page.getByRole('button', { name: 'With dependents' }).click();
    await expect(page.getByText(formatCurrency(bahWithDep!)).first()).toBeVisible();
  });

  test('civilian equivalent exceeds basic pay', async ({ page }) => {
    await enterStation(page);
    await expect(page.getByText(/civilian.*earn|would need to earn/i).first()).toBeVisible();
  });

  test('BRS section shows TSP match fields', async ({ page }) => {
    await enterStation(page);
    await expect(page.getByText(/full BRS match|capture.*match/i).first()).toBeVisible();
  });

  test('switching to Legacy hides BRS match', async ({ page }) => {
    await enterStation(page);
    // With a matched station and BRS (default), the TSP/BRS Details card is shown…
    await expect(page.getByText('TSP / BRS Details')).toBeVisible();
    // …and switching to Legacy hides it.
    await page.getByRole('button', { name: 'Legacy (High-3)' }).click();
    await expect(page.getByText('TSP / BRS Details')).not.toBeVisible();
  });

  test('O-1E prior enlisted grade is selectable', async ({ page }) => {
    await enterStation(page);
    await page.getByLabel('Rank / Pay Grade').selectOption('O-1E');
    const basePay = getBasePay('O-1E', 6);
    await expect(page.getByText(`${formatCurrency(basePay * 12)}/yr`).first()).toBeVisible();
  });

  test('changing YOS updates base pay', async ({ page }) => {
    await enterStation(page);
    await page.getByLabel('Years of Service').selectOption('10');
    const basePay = getBasePay('E-5', 10);
    await expect(page.getByText(`${formatCurrency(basePay * 12)}/yr`).first()).toBeVisible();
  });
});
