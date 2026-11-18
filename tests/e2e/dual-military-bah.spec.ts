import { test, expect } from '@playwright/test';
import { getBAH } from './helpers/data';
import { bahAmount } from './helpers/format';

// DM-01 (math-audit-round-1): the explanation of the recommendation must come from the two
// actual with-dependents premiums, never from "the higher grade has the larger premium".
// All figures are computed from the BAH lib, not hand-typed.

function premium(zip: string, grade: Parameters<typeof getBAH>[1]): number {
  const w = getBAH(zip, grade, true);
  const wo = getBAH(zip, grade, false);
  if (w === null || wo === null) throw new Error(`No BAH for ${grade} at ${zip}`);
  return w - wo;
}

test.describe('Dual Military BAH — recommendation explanation (DM-01)', () => {
  test('O-3 + E-5 at Fort Bragg: explanation names the junior member\'s larger premium', async ({ page }) => {
    const o3 = premium('28310', 'O-3');
    const e5 = premium('28310', 'E-5');
    // The audit scenario: the E-5's premium is larger here. Guard so the test means what it says.
    expect(e5).toBeGreaterThan(o3);
    const gain = e5 - o3;

    // Member 1 (O-3) claims — the lower total — so the "consider switching" step shows too.
    await page.goto('/calculators/dual-military-bah?rank1=o3&rank2=e5&zip=28310&dependents=yes&claims=1');

    const note = page.getByTestId('dual-premium-explanation');
    await expect(note).toContainText(`${bahAmount(e5)}/month for Member 2 (E-5)`);
    await expect(note).toContainText(`${bahAmount(o3)}/month for Member 1 (O-3)`);
    await expect(note).toContainText('highest when Member 2 (E-5) claims');
    await expect(note).toContainText(`Difference: ${bahAmount(gain)}/mo`);

    await expect(page.getByText('Consider switching who claims dependents')).toBeVisible();
    await expect(
      page.getByText(`Having Member 2 claim the dependents results in ${bahAmount(gain)}/month more`),
    ).toContainText(`${bahAmount(e5)}/month for Member 2 (E-5)`);

    await expect(page.getByText(/larger at higher pay grades/)).toHaveCount(0);
    await expect(page.getByText(/assigning dependents to the\s+higher-ranking member/)).toHaveCount(0);
  });

  test('same grade: tie note states the shared premium', async ({ page }) => {
    const e5 = premium('28310', 'E-5');
    await page.goto('/calculators/dual-military-bah?rank1=e5&rank2=e5&zip=28310&dependents=yes');
    await expect(page.getByTestId('dual-premium-explanation')).toContainText(
      `${bahAmount(e5)}/month for both members`,
    );
  });

  test('E-2 + E-3 at Fort Bragg: equal totals show the tie badge, not "Same rank"', async ({ page }) => {
    // Different grades that share rates in NC182 — a tie that is not "same rank".
    expect(getBAH('28310', 'E-2', true)).toBe(getBAH('28310', 'E-3', true));
    expect(getBAH('28310', 'E-2', false)).toBe(getBAH('28310', 'E-3', false));
    const e2 = premium('28310', 'E-2');

    await page.goto('/calculators/dual-military-bah?rank1=e2&rank2=e3&zip=28310&dependents=yes');
    await expect(page.getByTestId('dual-tie-badge')).toHaveText('Same total either way');
    await expect(page.getByText('Same rank')).toHaveCount(0);
    await expect(page.getByTestId('dual-premium-explanation')).toContainText(
      `${bahAmount(e2)}/month for both members`,
    );
  });

  test('result footnote: excluded from federal taxable income, never "tax-free"', async ({ page }) => {
    await page.goto('/calculators/dual-military-bah?rank1=o3&rank2=e5&zip=28310&dependents=yes');
    await expect(page.getByText(/Both amounts are excluded\s+from federal taxable income/)).toBeVisible();
    await expect(page.getByText(/tax-free/i)).toHaveCount(0);
  });

  test('page copy no longer says the higher-ranking member should claim', async ({ page }) => {
    await page.goto('/calculators/dual-military-bah');
    await expect(page.getByRole('heading', { name: 'Which member should claim dependents' })).toBeVisible();
    await expect(page.getByText('Why the higher-ranking member should claim dependents')).toHaveCount(0);
  });
});
