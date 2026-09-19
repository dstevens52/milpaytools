import { test, expect, type Page } from '@playwright/test';
import { getBasePay, getBAS, getBAH } from './helpers/data';
import { payChartsAmount as usd } from './helpers/format';
import { E1_UNDER_4_MONTHS } from '../../src/data/pay-tables/2026';
import {
  E1_UNDER_4_MONTHS_YOS,
  expectedBasePay,
  isPendingVerificationGrade,
  CHECKABLE_PAY_GRADES,
  PENDING_VERIFICATION_GRADES,
} from '../../src/lib/calculations/lesCheck';
import {
  LES_PENDING_VERIFICATION_GRADES,
  LES_TEST_SCENARIOS,
  LES_EDGE_SCENARIOS,
  LES_EXAMPLE,
  LES_OCONUS_ZIPS,
  LES_OCONUS_STATION_QUERY,
  type LesScenario,
} from '../../src/data/les/scenarios';

// LES Pay Checker. Every expected figure is computed from the same data
// libraries the tool uses (via tests/e2e/helpers/data.ts); scenario inputs come
// from the shared constants in src/data/les/scenarios.ts.

function expectedBase(s: LesScenario): number {
  return s.yos === E1_UNDER_4_MONTHS_YOS ? E1_UNDER_4_MONTHS : getBasePay(s.grade, Number(s.yos));
}

function expectedBah(s: LesScenario, withDeps = s.hasDependents): number {
  const r = getBAH(s.zip, s.grade, withDeps);
  if (r === null) throw new Error(`No BAH for scenario ${s.id}`);
  return r;
}

/** Fixed-decimal string as typed from an LES (no $ or commas). */
const typed = (n: number) => n.toFixed(2);

async function fillService(page: Page, s: LesScenario) {
  await page.locator('#les-grade').selectOption(s.grade);
  await page.locator('#les-yos').selectOption(s.yos);
  await page.locator('#les-station').pressSequentially(s.zip, { delay: 30 });
  await page.locator('#les-deps').selectOption(s.hasDependents ? 'with' : 'without');
}

async function fillLes(page: Page, v: { base?: number; bah?: number; bas?: number }) {
  if (v.base !== undefined) await page.locator('#les-base').fill(typed(v.base));
  if (v.bah !== undefined) await page.locator('#les-bah').fill(typed(v.bah));
  if (v.bas !== undefined) await page.locator('#les-bas').fill(typed(v.bas));
}

const widget = (page: Page) => page.getByTestId('les-checker');
const row = (page: Page, line: 'basePay' | 'bah' | 'bas') => widget(page).getByTestId(`les-row-${line}`);

test.describe('LES Pay Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/les');
    // Selections made before hydration are dropped by React — wait for it.
    await expect(page.getByTestId('les-checker')).toHaveAttribute('data-hydrated', 'true');
  });

  test('page loads with task-first H1 and title', async ({ page }) => {
    await expect(page).toHaveTitle(/LES Pay Checker 2026/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Check Your LES');
    await expect(page.getByTestId('les-privacy')).toContainText('never leave this page');
    await expect(page.getByTestId('les-cant-check')).toContainText('BAH rate protection');
  });

  // ── Known values: base pay, BAH, BAS across grade/YOS/station combos ────────

  for (const s of LES_TEST_SCENARIOS) {
    test(`known values match — ${s.id}`, async ({ page }) => {
      const base = expectedBase(s);
      const bah = expectedBah(s);
      const bas = getBAS(s.grade);

      await fillService(page, s);
      await fillLes(page, { base, bah, bas });

      await expect(widget(page).getByTestId('les-expected-basePay')).toHaveText(usd(base));
      await expect(widget(page).getByTestId('les-expected-bah')).toHaveText(usd(bah));
      await expect(widget(page).getByTestId('les-expected-bas')).toHaveText(usd(bas));

      for (const line of ['basePay', 'bah', 'bas'] as const) {
        await expect(row(page, line)).toHaveAttribute('data-status', 'match');
      }
      await expect(page.getByTestId('les-all-match')).toContainText('All three lines match');
      await expect(page.getByTestId('les-all-match').getByRole('link')).toHaveAttribute('href', '/calculators/total-compensation');
    });
  }

  // ── Mismatch flow ──────────────────────────────────────────────────────────

  test('BAH mismatch: partial-month question first, then gap + annualized + next steps', async ({ page }) => {
    const s = LES_TEST_SCENARIOS[0]; // E-5 with dependents
    const should = expectedBah(s);
    const onLes = expectedBah(s, !s.hasDependents); // LES paid at the other dependency rate
    const gap = Math.abs(Math.round((onLes - should) * 100) / 100);

    await fillService(page, s);
    await fillLes(page, { base: expectedBase(s), bah: onLes, bas: getBAS(s.grade) });

    // Question comes before a mismatch verdict.
    await expect(page.getByTestId('les-partial-question')).toBeVisible();
    await expect(row(page, 'bah')).toHaveAttribute('data-status', 'mismatch');
    await expect(widget(page).getByTestId('les-status-bah')).toHaveText(/Differs/);
    await expect(page.getByTestId('les-next-steps')).toHaveCount(0);

    // Rate protection + partial month called out by name on any BAH mismatch.
    await expect(page.getByTestId('les-rate-protection')).toContainText('BAH rate protection');
    await expect(page.getByTestId('les-bah-notices')).toContainText('Partial month');
    await expect(page.getByTestId('les-bah-other-dep')).toBeVisible();

    await page.getByRole('button', { name: /full month/i }).click();

    await expect(widget(page).getByTestId('les-status-bah')).toHaveText(/Doesn.t match/);
    await expect(widget(page).getByTestId('les-annual-bah')).toContainText(usd(gap));
    await expect(widget(page).getByTestId('les-annual-bah')).toContainText(usd(Math.round(gap * 12 * 100) / 100));
    await expect(page.getByTestId('les-next-steps')).toContainText('Finance Office');
    await expect(page.getByTestId('les-next-steps')).toContainText('31 U.S.C. § 3702');
    await expect(page.getByTestId('les-all-match')).toHaveCount(0);

    // Matching rows still read as matches.
    await expect(row(page, 'basePay')).toHaveAttribute('data-status', 'match');
    await expect(row(page, 'bas')).toHaveAttribute('data-status', 'match');
  });

  test('partial month answered yes: no mismatch verdict, proration notice', async ({ page }) => {
    const s = LES_TEST_SCENARIOS[0];
    await fillService(page, s);
    await fillLes(page, { bah: expectedBah(s, !s.hasDependents) });

    await page.getByRole('button', { name: /something changed/i }).click();
    await expect(page.getByTestId('les-partial-notice')).toBeVisible();
    await expect(widget(page).getByTestId('les-status-bah')).toHaveText('Partial month');
    await expect(page.getByTestId('les-next-steps')).toHaveCount(0);
  });

  test('base pay mismatch shows PEBD guidance', async ({ page }) => {
    const s = LES_TEST_SCENARIOS[0];
    await fillService(page, s);
    // LES shows the prior step's rate (over 4) against an over-6 selection.
    await fillLes(page, { base: getBasePay(s.grade, 4) });
    await expect(row(page, 'basePay')).toHaveAttribute('data-status', 'mismatch');
    await expect(page.getByTestId('les-base-notices')).toContainText('Pay Entry Base Date');
  });

  // ── Blank fields skip ──────────────────────────────────────────────────────

  test('blank LES fields skip their rows instead of reporting a mismatch', async ({ page }) => {
    const s = LES_TEST_SCENARIOS[1];
    await fillService(page, s);
    await fillLes(page, { base: expectedBase(s) });

    await expect(row(page, 'basePay')).toHaveAttribute('data-status', 'match');
    await expect(row(page, 'bah')).toHaveAttribute('data-status', 'notEntered');
    await expect(row(page, 'bas')).toHaveAttribute('data-status', 'notEntered');
    await expect(page.getByTestId('les-partial-question')).toHaveCount(0);
    await expect(page.getByTestId('les-all-match')).toContainText('The line you entered matches');
  });

  // ── OCONUS / territory → can't check, never a number ───────────────────────

  test('U.S. territory ZIP returns the can\'t-check state for BAH', async ({ page }) => {
    const s = { ...LES_TEST_SCENARIOS[0], zip: LES_OCONUS_ZIPS.territory };
    await fillService(page, s);
    await fillLes(page, { bah: expectedBah(LES_TEST_SCENARIOS[0]) });
    await expect(row(page, 'bah')).toHaveAttribute('data-status', 'oconus');
    await expect(widget(page).getByTestId('les-expected-bah')).toHaveText('OHA');
    await expect(page.getByTestId('les-partial-question')).toHaveCount(0);
  });

  test('APO ZIP returns the can\'t-check state for BAH', async ({ page }) => {
    const s = { ...LES_TEST_SCENARIOS[0], zip: LES_OCONUS_ZIPS.apo };
    await fillService(page, s);
    await fillLes(page, { bah: expectedBah(LES_TEST_SCENARIOS[0]) });
    await expect(row(page, 'bah')).toHaveAttribute('data-status', 'oconus');
    await expect(widget(page).getByTestId('les-expected-bah')).toHaveText('OHA');
  });

  test('OCONUS installation picked by name returns the can\'t-check state', async ({ page }) => {
    const s = LES_TEST_SCENARIOS[0];
    await page.locator('#les-grade').selectOption(s.grade);
    await page.locator('#les-yos').selectOption(s.yos);
    await page.locator('#les-deps').selectOption('with');
    await page.locator('#les-station').pressSequentially(LES_OCONUS_STATION_QUERY, { delay: 30 });
    await page.getByRole('option').filter({ hasText: LES_OCONUS_STATION_QUERY }).first().click();
    await fillLes(page, { bah: expectedBah(s) });
    await expect(row(page, 'bah')).toHaveAttribute('data-status', 'oconus');
    // Base pay and BAS still check normally overseas.
    await fillLes(page, { bas: getBAS(s.grade) });
    await expect(row(page, 'bas')).toHaveAttribute('data-status', 'match');
  });

  test('station picked by base name resolves the BAH rate', async ({ page }) => {
    await page.locator('#les-grade').selectOption('E-5');
    await page.locator('#les-yos').selectOption('6');
    await page.locator('#les-deps').selectOption('with');
    await page.locator('#les-station').pressSequentially('Fort Bragg', { delay: 30 });
    await page.getByRole('option').filter({ hasText: 'Fort Bragg' }).first().click();
    // Station-page ZIP for Fort Bragg (28301) is the same MHA (NC182) as 28310.
    const bah = getBAH('28301', 'E-5', true)!;
    await fillLes(page, { bah });
    await expect(widget(page).getByTestId('les-expected-bah')).toHaveText(usd(bah));
    await expect(row(page, 'bah')).toHaveAttribute('data-status', 'match');
  });

  // ── Pay-table edge rows ────────────────────────────────────────────────────

  for (const s of LES_EDGE_SCENARIOS) {
    test(`pay table row resolves — ${s.id}`, async ({ page }) => {
      const base = expectedBase(s);
      await fillService(page, s);
      await fillLes(page, { base });
      await expect(widget(page).getByTestId('les-expected-basePay')).toHaveText(usd(base));
      await expect(row(page, 'basePay')).toHaveAttribute('data-status', 'match');
    });
  }

  test('E-1 under 4 months differs from E-1 over 4 months', async ({ page }) => {
    const under = LES_EDGE_SCENARIOS.find((s) => s.id === 'e1-under4mo')!;
    await fillService(page, under);
    await fillLes(page, { base: getBasePay('E-1', 0) });
    await expect(row(page, 'basePay')).toHaveAttribute('data-status', 'mismatch');
  });

  test('years-of-service list follows the pay table (E-8 starts at Over 8, O-1E at Over 4)', async ({ page }) => {
    await page.locator('#les-grade').selectOption('E-8');
    const e8 = await page.locator('#les-yos option').allTextContents();
    expect(e8[1]).toBe('Over 8 years');
    expect(e8).not.toContain('Under 2 years');

    await page.locator('#les-grade').selectOption('O-1E');
    const o1e = await page.locator('#les-yos option').allTextContents();
    expect(o1e[1]).toBe('Over 4 years');
  });

  // ── Grades pending verification: can't-check, never a figure ───────────────

  test('grades with unverified pay rows are absent from the picker', async ({ page }) => {
    const values = await page.locator('#les-grade option').evaluateAll((o) =>
      o.map((el) => (el as HTMLOptionElement).value),
    );
    expect(values.length).toBeGreaterThan(1); // control: the picker is populated
    for (const grade of LES_PENDING_VERIFICATION_GRADES) {
      expect(values, `${grade} must not be selectable`).not.toContain(grade);
    }
    // Verified neighbours are still offered.
    for (const grade of ['W-4', 'O-6', 'O-3E', 'E-9']) {
      expect(values).toContain(grade);
    }
    await expect(page.getByTestId('les-pending-grades')).toContainText('W-5 and O-7 through O-10');
  });

  test('pay lookup returns no figure for a grade pending verification', async () => {
    // Control: a verified grade still resolves at the same YOS columns.
    expect(expectedBasePay('W-4', '24')).toBeGreaterThan(0);
    expect(expectedBasePay('O-6', '22')).toBeGreaterThan(0);

    for (const grade of PENDING_VERIFICATION_GRADES) {
      expect(isPendingVerificationGrade(grade)).toBe(true);
      for (const yos of ['20', '24', '30', '40']) {
        expect(expectedBasePay(grade, yos), `${grade} at ${yos}`).toBeNull();
      }
      expect(CHECKABLE_PAY_GRADES).not.toContain(grade);
    }
    expect(CHECKABLE_PAY_GRADES.length).toBeGreaterThan(0); // control
  });

  // ── Static example + privacy + mobile ──────────────────────────────────────

  test('pre-rendered example uses library figures with one deliberate BAH mismatch', async ({ page }) => {
    const ex = page.getByTestId('les-example');
    const should = getBAH(LES_EXAMPLE.zip, LES_EXAMPLE.grade, true)!;
    const onLes = getBAH(LES_EXAMPLE.zip, LES_EXAMPLE.grade, false)!;
    await expect(ex.getByTestId('les-expected-bah')).toHaveText(usd(should));
    await expect(ex.getByTestId('les-entered-bah')).toHaveText(usd(onLes));
    await expect(ex.getByTestId('les-row-bah')).toHaveAttribute('data-status', 'mismatch');
    await expect(ex.getByTestId('les-row-basePay')).toHaveAttribute('data-status', 'match');
    await expect(ex.getByTestId('les-expected-basePay')).toHaveText(usd(getBasePay(LES_EXAMPLE.grade, Number(LES_EXAMPLE.yos))));
  });

  test('no network request carries the LES figures typed in', async ({ page }) => {
    const s = LES_TEST_SCENARIOS[2];
    const values = [expectedBase(s), expectedBah(s), getBAS(s.grade)].map(typed);
    const seen: string[] = [];
    page.on('request', (req) => seen.push(`${req.url()} ${req.postData() ?? ''}`));

    await fillService(page, s);
    await fillLes(page, { base: expectedBase(s), bah: expectedBah(s), bas: getBAS(s.grade) });
    await expect(page.getByTestId('les-all-match')).toBeVisible();

    for (const v of values) {
      const leaked = seen.filter((r) => r.includes(v) || r.includes(String(Number(v))));
      expect(leaked, `request carrying ${v}`).toEqual([]);
    }
    expect(seen.length).toBeGreaterThan(0); // control: requests were captured

    // Session replay (Clarity) must not capture the widget.
    await expect(widget(page)).toHaveAttribute('data-clarity-mask', 'True');
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });

  test('no horizontal scroll at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const s = LES_TEST_SCENARIOS[0];
    await fillService(page, s);
    await fillLes(page, { base: expectedBase(s), bah: expectedBah(s, false), bas: getBAS(s.grade) });
    await page.getByRole('button', { name: /full month/i }).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
