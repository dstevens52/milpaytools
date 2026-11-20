/**
 * T1 (FIX_QUEUE row 8c): the TRICARE costs post shows 2027 next to 2026 from
 * the TRICARE year files, with no hand-typed dollar figures; the healthcare
 * comparison page shows the HC-03 TRS figures.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');
const POST = '/blog/tricare-costs-2026-vs-civilian';
const MDX = join(ROOT, 'src/content/blog/tricare-costs-2026-vs-civilian.mdx');

/** Phrases the old post carried (unsourced ranges and claims); none may come back. */
const REMOVED = [
  '$15,000–$25,000',
  '$10,000–$18,000',
  '$10,700–$17,600',
  '$600–$2,000',
  '$3,000–$6,000',
  '$400–$600',
  '$1,500–$2,000+',
  '$18,000–$24,000',
  '$14,560–$20,560',
  '$8,000–$20,000',
  'approximately 4–8%',
  '$150/individual ($300/family)',
  'the same catastrophic protection as active-duty TRICARE',
  'may be the best health insurance option available in the United States, full stop',
  'possibly the most cost-effective comprehensive health insurance available to Americans',
  'arguably the most valuable post-65 health benefit',
  '$1,000/year per family',
  'What changed in TRICARE for 2026?',
  // Claude Chat review (PR #65): unsourced active-duty coverage section and old TFL wording.
  'What does active-duty TRICARE Prime cover?',
  'no network to "go out of"',
  "What active-duty members don't pay for",
  "covers most of what Medicare doesn't",
  'which most people over 65 pay anyway',
];

test.describe('TRICARE post source (data-only)', () => {
  test('no hand-typed $ in the MDX outside component props', () => {
    const src = readFileSync(MDX, 'utf8');
    expect(src.length).toBeGreaterThan(3000); // non-empty control
    expect(src).toContain('<TricareFigure'); // control: the components are in use
    const body = src.replace(/^---[\s\S]*?---/, '');
    // Drop every JSX tag (with its props), then look for any dollar sign left in the prose.
    const prose = body.replace(/<[A-Z][^>]*\/?>/g, '').replace(/<\/[A-Z][A-Za-z]*>/g, '');
    const hits = prose.split('\n').filter((l) => l.includes('$'));
    expect(hits).toEqual([]);
    for (const p of REMOVED) expect(src, p).not.toContain(p);
  });

  test('slug and date kept; title, description and updated set', () => {
    const src = readFileSync(MDX, 'utf8');
    expect(src).toContain('slug: tricare-costs-2026-vs-civilian');
    expect(src).toContain('date: "2026-04-12"');
    expect(src).toContain('title: "TRICARE 2027 Costs vs 2026: Every Fee, Premium and Copay"');
    expect(src).toMatch(/updated: "2026-11-\d\d"/);
    expect(src).toMatch(/^ {2}- healthcare-comparison\r?$/m);
  });
});

test.describe('TRICARE post page', () => {
  test('title, H1, computed 2027 figures, no stale or raw tags', async ({ page }) => {
    await page.goto(POST);
    await expect(page).toHaveTitle('TRICARE 2027 Costs vs 2026: Every Fee, Premium and Copay');
    await expect(page.locator('h1')).toHaveText('TRICARE 2027 Costs vs 2026: Every Fee, Premium and Copay');
    const article = page.locator('article');
    const text = (await article.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(4000); // non-empty control
    for (const s of [
      '$792.96', // retiree Prime A family 2027
      '$765.00', // 2026
      '$1,233.96', // Select B family 2027
      '$60.54',
      '$307.48',
      '$893.00',
      '+12.5%',
      '$1,372',
      '$4,802',
      '3.6–3.7%',
      '$6,237.04', // employer average − Select B family fee
      '$6,678.04', // employer average − Prime A family fee
      'Nov. 9–Dec. 8, 2026',
      'Dec. 31, 2027',
    ]) {
      expect(text, s).toContain(s);
    }
    for (const p of REMOVED) expect(text, p).not.toContain(p);
    expect(text).not.toMatch(/TricareFigure|TricareCostTable|TricareDate|NaN|undefined/);
    // TFL paragraph (sources TFL, TFLNR in docs/sources/tricare-costs-2027.md).
    expect(text).toContain('must have Medicare Part A and Part B to keep TRICARE coverage through TRICARE For Life');
    expect(text).toContain('When both Medicare and TRICARE cover the care, TRICARE says you have no out-of-pocket expenses.');
    await expect(page.getByRole('heading', { level: 2, name: 'What do active duty members and families pay in 2027?' })).toBeVisible();
    // Employer figure labeled the same way everywhere (comparison, example, key fact).
    expect(text.split('($7,471, Kaiser Family Foundation 2026 survey, as TRICARE reports it)').length - 1).toBe(3);
  });

  test('tables: six named tables render with rows', async ({ page }) => {
    await page.goto(POST);
    for (const name of ['retireeFees', 'retireeDeductiblesCaps', 'retireeCopays', 'adfmSelect', 'premiumPlans', 'officialComparison2027']) {
      const rows = page.locator(`[data-tricare-table="${name}"] tbody tr`);
      expect(await rows.count(), name).toBeGreaterThan(4);
    }
    const trs = page.locator('[data-tricare-table="premiumPlans"] tbody tr').nth(1);
    await expect(trs).toContainText('$286.66');
    await expect(trs).toContainText('$307.48');
    await expect(trs).toContainText('+$20.82 (+7.3%)');
    const cmp = page.locator('[data-tricare-table="officialComparison2027"]');
    await expect(cmp).toContainText('TRICARE Open Season');
    await expect(cmp.locator('a[href="https://tricare.mil/openseason"]')).toHaveCount(1);
  });

  test('Open Season section shows the open wording', async ({ page }) => {
    await page.goto(POST);
    const section = page.locator('[data-open-season-status]');
    await expect(section).toHaveAttribute('data-open-season-status', 'open');
    await expect(section).toContainText('TRICARE Open Season runs Nov. 9–Dec. 8, 2026.');
    await expect(section.locator('a[href="https://tricare.mil/openseason"]')).toBeVisible();
  });
});

test.describe('healthcare comparison page: TRS (HC-03)', () => {
  test('TRS family: $1,324 cap, $397 deductible, notes', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison?family=married-2-children&path=trs');
    await expect(page.locator('#path-select')).toHaveValue('trs');
    await expect(page.getByText('$286.66').first()).toBeVisible();
    const oop = page.locator('dt', { hasText: 'OOP max' }).locator('xpath=following-sibling::dd');
    await expect(oop.last()).toHaveText('$1,324');
    await expect(page.getByText('Sponsors in pay grades E-1–E-4 have a lower deductible ($66 individual / $132 family).').first()).toBeVisible();
    await expect(page.getByText('2027 premiums (from Jan. 1, 2027): $60.54 member only / $307.48 member and family.').first()).toBeVisible();
  });

  test('page example and TRS explainer computed from the 2026 year file', async ({ page }) => {
    await page.goto('/calculators/healthcare-comparison');
    await expect(page.getByText('$286.66/mo — $3,440/yr')).toBeVisible();
    // Inside a closed <details>: read text content, not visibility.
    const trs = (await page.locator('details', { hasText: 'What is TRICARE Reserve Select?' }).textContent()) ?? '';
    expect(trs).toContain('In 2026, premiums are $57.88/month for the member only and $286.66/month for member plus family.');
    expect(trs).toContain('$198 individual / $397 family for sponsors in pay grade E-5 and above ($66 / $132 for E-1–E-4)');
    expect(trs).toContain('the catastrophic cap is $1,324 per family');
    expect(trs).not.toContain('$150 for individuals and $300 for families');
  });
});
