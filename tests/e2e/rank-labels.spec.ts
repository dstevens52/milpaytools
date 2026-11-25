import { test, expect, type Locator, type Page } from '@playwright/test';
import { rankLabel, rankHelperText } from '../../src/data/ranks/rankTitles';
import type { PayGrade } from '../../src/types/military';
import { waitForHydration } from './helpers/hydration';
import { gluedTextAt } from './helpers/glued-text';

// Build RL: grade selects show the five-service labels from src/data/ranks/rankTitles.ts,
// and the helper line under the select follows the selected grade. One calculator per
// family. Expected text comes from the module (its values are locked to the source
// table by rank-titles-unit.spec.ts).

interface Family {
  name: string;
  path: string;
  select: (page: Page) => Locator;
  /** The option text for a grade, when the select adds to the label (pay raise). */
  optionText?: (g: PayGrade) => string;
}

const raiseOption = (g: PayGrade) => `${g} — ${rankLabel(g).replace(/^[A-Z0-9-]+ /, '')}`;

const FAMILIES: Family[] = [
  { name: 'BAH', path: '/bah', select: (p) => p.getByLabel('Pay Grade') },
  { name: 'pay raise', path: '/pay/raise', select: (p) => p.locator('#raise-grade'), optionText: raiseOption },
  { name: 'total compensation', path: '/calculators/total-compensation', select: (p) => p.getByLabel('Rank / Pay Grade') },
  { name: 'PCS', path: '/calculators/pcs', select: (p) => p.locator('#rank') },
  {
    name: 'retirement',
    path: '/calculators/retirement',
    select: (p) => p.locator('label:has-text("Current Rank") + select'),
  },
  { name: 'TSP', path: '/calculators/tsp', select: (p) => p.getByLabel('Pay Grade') },
];

/** The helper line that belongs to a select: in the nearest wrapper that holds one. */
const helperFor = (select: Locator) =>
  select.locator('xpath=ancestor::div[.//*[@data-testid="rank-helper"]][1]').getByTestId('rank-helper');

test.describe('Grade select labels and helper line (build RL)', () => {
  for (const f of FAMILIES) {
    test(`${f.name}: five-service labels; helper follows the grade`, async ({ page }) => {
      await page.goto(f.path);
      const select = f.select(page);
      await expect(select).toHaveCount(1);
      await waitForHydration(select);
      const text = f.optionText ?? rankLabel;

      // Every option of the four example grades carries the new label.
      for (const g of ['E-1', 'E-4', 'E-9', 'O-7'] as PayGrade[]) {
        await expect(select.locator(`option[value="${g}"]`), g).toHaveText(text(g));
      }

      const helper = helperFor(select);
      await expect(helper).toHaveCount(1);
      const initial = (await select.inputValue()) as PayGrade;
      await expect(helper).toHaveText(rankHelperText(initial));

      const next: PayGrade = initial === 'E-9' ? 'E-4' : 'E-9';
      await select.selectOption(next);
      await expect(helper).toHaveText(rankHelperText(next));
      await expect(select.locator('option:checked')).toHaveText(text(next));
    });

    test(`${f.name}: no missing spaces`, async ({ page }) => {
      expect(await gluedTextAt(page, f.path)).toEqual([]);
    });
  }
});
