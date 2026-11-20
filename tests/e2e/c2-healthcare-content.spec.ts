/**
 * C2 (FIX_QUEUE row 8d): TRICARE / civilian-healthcare figures in the career
 * posts and the transition, military-pay and retirement-tsp pages come from
 * src/data/tricare/ (source docs/sources/tricare-costs-2027.md), never typed.
 * The old unsourced ranges and the "TRICARE Retired Reserve" error stay gone.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { payTable } from '../../src/data/pay-tables/2026';
import { BAS_RATES } from '../../src/data/constants';
import { TRICARE_COSTS_2027 } from '../../src/data/tricare/2027/costs';
import { OFFICIAL_COMPARISON_2027 } from '../../src/data/tricare/2027/openSeason';
import { currentTricareCosts, TRICARE_COST_YEAR } from '../../src/data/tricare/current';
import { formatCurrency } from '../../src/lib/utils';

const ROOT = join(__dirname, '..', '..');
const WALK = 'what-walking-away-at-12-years-costs';
const STAY = 'should-i-stay-to-20-years-military';
const mdx = (slug: string) => readFileSync(join(ROOT, 'src/content/blog', `${slug}.mdx`), 'utf8');

const r2 = (n: number) => Math.round(n * 100 + 1e-7) / 100;
const usd = (n: number) => formatCurrency(r2(n), true);
const usd0 = (n: number) => formatCurrency(n);

const PREMIUM = OFFICIAL_COMPARISON_2027.employerAvgEmployeePremium;
const DEDUCTIBLE = OFFICIAL_COMPARISON_2027.employerAvgFamilyDeductible;
const R27 = TRICARE_COSTS_2027.retiree;

/** Strings the old copy carried (unsourced ranges, wrong plan names, "tax-free"). */
const REMOVED = [
  '15,000–$25,000',
  '15,000-$25,000',
  '$15,000/year avoided cost',
  '$62/month',
  'TRICARE value:',
  'TRICARE Retired Reserve or TRICARE Select',
  '$110,000–$135,000',
  'exceeds $110,000',
  '$375,000–$600,000',
  '$15,000–$24,000',
  '~$0–$650',
  'can exceed $1 million in present-value terms',
  'effectively covered for life',
  '$500–$2,000+',
  '$1,500–$2,200',
  'exceed $10,000 per year',
  '$600–$2,000/month',
  '$7,200–$20,400',
  'Est. TRICARE savings',
  '~$12,000/yr',
  '$10,000–$15,000',
];

// 20th-year total in the walking-away post: final-year pay + $2,000 BAH + BAS + healthcare + $25,000 accrual.
const E7_OVER_18 = (payTable as Record<string, Record<number, number>>)['E-7'][18];
const BASE_TOTAL = E7_OVER_18 * 12 + 2000 * 12 + BAS_RATES.enlisted * 12 + 25000;
const OLD_TOTAL = BASE_TOTAL + 15000;
const NEW_TOTAL = BASE_TOTAL + PREMIUM;
const k = (n: number) => usd0(Math.round(n / 1000) * 1000);

test.describe('C2 data (no server)', () => {
  test('OS27 employer averages and the 2027 retiree Group A figures (controls)', () => {
    expect(PREMIUM).toBe(7471);
    expect(DEDUCTIBLE).toBe(3320);
    // The official comparison table still shows the deductible as before.
    expect(OFFICIAL_COMPARISON_2027.rows[1].cells[4]).toBe('$3,320 network');
    expect(usd(R27.primeA.enrollmentFee.family)).toBe('$792.96');
    expect(usd(R27.selectA.enrollmentFee.family)).toBe('$388.92');
    expect(usd0(R27.selectA.deductible.family)).toBe('$300');
    expect(usd0(R27.selectA.catastrophicCap)).toBe('$4,538');
    expect(usd(PREMIUM - R27.primeA.enrollmentFee.family)).toBe('$6,678.04');
  });

  test('20th-year total: new = old − $7,529', () => {
    expect(r2(OLD_TOTAL - NEW_TOTAL)).toBe(7529);
    expect(k(OLD_TOTAL)).toBe('$144,000');
    expect(k(NEW_TOTAL)).toBe('$136,000');
  });

  test('MDX sources: removed strings absent; figures come from components', () => {
    for (const slug of [WALK, STAY]) {
      const src = mdx(slug);
      expect(src.length, slug).toBeGreaterThan(3000); // non-empty control
      expect(src, slug).toContain('<TricareFigure path="comparison.employerAvgEmployeePremium"');
      for (const s of REMOVED) expect(src, `${slug}: ${s}`).not.toContain(s);
      expect(src, slug).not.toMatch(/tax-free/i);
      expect(src, slug).not.toContain('7,471');
      expect(src, slug).not.toContain('3,320');
    }
    expect(mdx(WALK)).toContain('tricare="comparison.employerAvgEmployeePremium"');
    expect(mdx(WALK)).not.toContain('tricare="15000"');
  });
});

test.describe('C2 rendered pages', () => {
  test(`/blog/${WALK}: retiree TRICARE table, computed gap, TFL wording, new 20th-year total`, async ({ page }) => {
    await page.goto(`/blog/${WALK}`);
    const article = page.locator('article');
    const text = (await article.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000); // non-empty control
    for (const s of REMOVED) expect(text, s).not.toContain(s);
    expect(text).not.toMatch(/TricareFigure|FinalYearCompTotal|NaN|undefined/);

    await expect(article).toContainText('Military retirees and their families can use TRICARE Prime or TRICARE Select.');
    await expect(article).toContainText('entered service before Jan. 1, 2018, so the retiree Group A costs apply');
    await expect(article.locator('tr', { hasText: 'TRICARE Prime, retiree Group A' })).toHaveText(
      `TRICARE Prime, retiree Group A (2027)${usd(R27.primeA.enrollmentFee.family)}${usd0(R27.primeA.deductible.family)}${usd0(R27.primeA.catastrophicCap)}`,
    );
    await expect(article.locator('tr', { hasText: 'TRICARE Select, retiree Group A' })).toHaveText(
      'TRICARE Select, retiree Group A (2027)$388.92$300$4,538',
    );
    await expect(article.locator('tr', { hasText: 'Employer-sponsored average' })).toHaveText(
      'Employer-sponsored average (2026)$7,471$3,320Not available',
    );
    await expect(article).toContainText(
      'The average employer employee premium for family coverage is $6,678.04 more a year than the retiree TRICARE Prime Group A family enrollment fee, before deductibles and copays.',
    );
    await expect(article).toContainText(
      "There's no TRICARE For Life enrollment fee; the cost is the Medicare Part B premium, which Medicare sets based on income.",
    );
    await expect(article.locator('a[href="https://tricare.mil/openseason"]')).toHaveCount(1);
    await expect(article.locator('a[href="/blog/tricare-costs-2026-vs-civilian"]')).toHaveCount(1);

    await expect(article).toContainText(
      'Healthcare: an active duty family in TRICARE Prime pays $0; the average employer family plan costs an employee $7,471 a year in premiums (KFF 2026, as TRICARE reports it)',
    );
    await expect(article).toContainText('the employer average is $7,471 in employee premiums plus a $3,320 family deductible');
    await expect(article).toContainText(`in the 20th year: approximately ${k(NEW_TOTAL)}`);
    expect(text).not.toContain(k(OLD_TOTAL));
    // Intro and Quick Answer carry the same computed total.
    expect(text.split(`healthcare and retirement accrual, about ${k(NEW_TOTAL)})`).length - 1).toBe(2);
    await expect(article).toContainText('Very few employers offer a pension that begins paying immediately at age 38.');
  });

  test(`/blog/${STAY}: allowances wording, BAS computed, KFF employer averages`, async ({ page }) => {
    await page.goto(`/blog/${STAY}`);
    const article = page.locator('article');
    const text = (await article.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    for (const s of REMOVED) expect(text, s).not.toContain(s);
    expect(text).not.toMatch(/tax-free/i);
    expect(text).not.toMatch(/TricareFigure|RetirementFigure|NaN|undefined/);
    await expect(article).toContainText('BAH and BAS are excluded from federal taxable income.');
    await expect(article).toContainText(`plus ${usd(BAS_RATES.enlisted)}/month in BAS`);
    await expect(article.locator('a[href="/bah"]', { hasText: "your station's rates" })).toHaveCount(1);
    await expect(article).toContainText('Active duty families in TRICARE Prime pay no enrollment fee and no network copays.');
    await expect(article).toContainText(
      'The average employer family plan costs an employee $7,471 a year in premiums, with a $3,320 average family deductible (Kaiser Family Foundation 2026 survey, as TRICARE reports it), before copays and coinsurance.',
    );
    await expect(article).toContainText('costs an employee $7,471 a year in premiums plus a $3,320 average family deductible');
  });

  test('/transition: card and direct answer use the KFF employer averages', async ({ page }) => {
    await page.goto('/transition');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    for (const s of REMOVED) expect(text, s).not.toContain(s);
    await expect(main).toContainText(
      'the average employer family plan costs an employee $7,471 a year in premiums plus a $3,320 deductible (KFF 2026, as TRICARE reports it).',
    );
    await expect(main).toContainText('For healthcare alone, the average employer family plan costs an employee $7,471 a year in premiums');
  });

  test('/guides/military-pay: BAS and TRICARE bullets computed', async ({ page }) => {
    await page.goto('/guides/military-pay');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    for (const s of REMOVED) expect(text, s).not.toContain(s);
    await expect(main).toContainText(`BAS: ${usd(BAS_RATES.enlisted)}/mo (enlisted)`);
    await expect(main).toContainText('TRICARE: $0 premiums for active duty (employer family plans average $7,471/yr in employee premiums)');
  });

  test('/guides/retirement-tsp: card shows the current retiree Prime Group A family fee', async ({ page }) => {
    await page.goto('/guides/retirement-tsp');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    for (const s of REMOVED) expect(text, s).not.toContain(s);
    const fee = usd(currentTricareCosts.retiree.primeA.enrollmentFee.family);
    if (TRICARE_COST_YEAR === 2026) expect(fee).toBe('$765.00'); // control until the Jan. 1 flip
    await expect(main.locator('div', { hasText: /^Retiree TRICARE Prime family fee/ })).toHaveText(`Retiree TRICARE Prime family fee${fee}/yr`);
    await expect(main).toContainText(`pays a ${fee} enrollment fee for ${TRICARE_COST_YEAR}`);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = ld.find((t) => t.includes('"FAQPage"'))!;
    expect(faq).toContain(`pays a ${fee} enrollment fee for ${TRICARE_COST_YEAR}`);
    expect(faq).toContain('costs an employee $7,471 a year in premiums');
    expect(faq).not.toContain('$10,000–$15,000');
  });
});
