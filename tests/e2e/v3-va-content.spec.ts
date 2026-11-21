/**
 * Build V3 (FIX_QUEUE row 12): VA loan content accuracy and inbound links.
 *
 * 1. Content guard over the V3 files (source text): no "10%+ waives", no eBenefits,
 *    no 2031 date, no "superior" / "favorable" verdicts, no PMI dollar figures, and
 *    no hand-typed funding fee dollar amounts (they come from <VaFundingFee>).
 * 2. The same guard on the rendered pages, plus the computed figures appearing.
 * 3. The calculator items (a), (b), (d) and the guide's sample card, FAQs and links.
 * 4. The inbound links added in step 4.
 *
 * Sources: docs/sources/va-funding-fee-2026.md, va-refinance-rules-2026.md,
 * va-irrrl-coe-2026.md. Expected fee amounts are rebuilt from VA's table here.
 * how-bah-builds-wealth is left out on purpose (Dan's call: keep the post as it is).
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { formatCurrency } from '@/lib/utils';
import { calcVaLoan, VA_LOAN_DEFAULTS } from '@/lib/calculations/vaLoan';

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const usd = (n: number) => formatCurrency(Math.round(n));
const COE_URL = 'https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/';
const IRRRL_SENTENCE = "VA generally doesn't require an appraisal or credit underwriting for an IRRRL. Lenders can still require them under their own rules.";

// VA's table (docs/sources/va-funding-fee-2026.md).
const FEE_FIRST_0 = usd(350000 * 0.0215); // $7,525
const FEE_SUB_0 = usd(350000 * 0.033); // $11,550

/** Step-3 posts with a full sweep. */
const FULL_POSTS = [
  'va-loan-funding-fee-explained',
  'va-home-loan-basics',
  'va-loan-vs-fha-vs-conventional',
  'va-appraisal-what-to-expect',
  'using-bah-to-buy-a-home',
];
/** V2 posts: only exemption / eBenefits / 2031 wording (and fee figures) in V3; PMI table and entitlement wait for V2. */
const V2_POSTS = ['va-loan-assumptions-explained', 'can-i-use-va-loan-again'];

const FILES: { file: string; pmi: boolean }[] = [
  ...FULL_POSTS.map((s) => ({ file: `src/content/blog/${s}.mdx`, pmi: true })),
  ...V2_POSTS.map((s) => ({ file: `src/content/blog/${s}.mdx`, pmi: false })),
  { file: 'src/app/guides/va-home-loans/page.tsx', pmi: true },
  { file: 'src/app/calculators/va-loan/page.tsx', pmi: true },
  { file: 'src/app/calculators/va-refinance/page.tsx', pmi: true },
  { file: 'src/components/calculators/va-refinance/VARefinanceCalculator.tsx', pmi: true },
];

const BANNED: [string, RegExp][] = [
  ['"10% or higher waives" / "10%+ waives"', /10% or higher waives|10%\+ waives/i],
  ['eBenefits', /ebenefits/i],
  ['2031', /2031/],
  ['superior', /superior/i],
  ['favorable', /favorable/i],
];
// The build prompt's pattern, PMI[^.]{0,60}\$\d, minus a bare "$0": VA's own "PMI $0"
// is a rule, not an estimate (the va-loan hero strip and the basics post say it).
const PMI_DOLLARS = /PMI[^.]{0,60}\$(?!0(?![\d,.]))\d/;
/** Funding fee dollar amounts the posts used to type by hand. */
const TYPED_FEES = /\$(7,525|11,550|4,988|3,938|8,600|13,200)\b/;

test.describe('V3 content guard (source files)', () => {
  for (const { file, pmi } of FILES) {
    test(file, () => {
      const src = read(file);
      expect(src.length, 'non-empty control').toBeGreaterThan(2000);
      for (const [name, re] of BANNED) expect(src, name).not.toMatch(re);
      if (pmi) expect(src, 'PMI dollar figure').not.toMatch(PMI_DOLLARS);
      expect(src, 'hand-typed funding fee amount').not.toMatch(TYPED_FEES);
    });
  }

  test('the posts with funding fee figures render them through <VaFundingFee>', () => {
    for (const s of ['va-loan-funding-fee-explained', 'va-home-loan-basics', 'va-loan-vs-fha-vs-conventional', 'using-bah-to-buy-a-home', ...V2_POSTS]) {
      expect(read(`src/content/blog/${s}.mdx`), s).toContain('<VaFundingFee');
    }
  });
});

test.describe('V3 rendered posts', () => {
  for (const slug of [...FULL_POSTS, ...V2_POSTS]) {
    test(`/blog/${slug}: no banned wording, no raw component tags`, async ({ page }) => {
      await page.goto(`/blog/${slug}`);
      const text = (await page.locator('article').textContent()) ?? '';
      expect(text.length).toBeGreaterThan(2000);
      for (const [name, re] of BANNED) expect(text, name).not.toMatch(re);
      if (!V2_POSTS.includes(slug)) expect(text, 'PMI dollar figure').not.toMatch(PMI_DOLLARS);
      expect(text).not.toMatch(/VaFundingFee|NaN|undefined/);
    });
  }

  test('/blog/va-loan-funding-fee-explained: computed table, VA exemption list, refund rule, IRRRL wording', async ({ page }) => {
    await page.goto('/blog/va-loan-funding-fee-explained');
    const article = page.locator('article');
    await expect(article.locator('tr', { hasText: 'First use, $0 down' })).toHaveText(
      `First use, $0 down$350,000$0$350,0002.15%${FEE_FIRST_0}`,
    );
    await expect(article.locator('tr', { hasText: 'Subsequent use, $0 down' })).toHaveText(
      `Subsequent use, $0 down$350,000$0$350,0003.30%${FEE_SUB_0}`,
    );
    await expect(article.locator('tr', { hasText: 'First use, 5% down' })).toHaveText(
      `First use, 5% down$350,000$17,500$332,5001.50%${usd(332500 * 0.015)}`,
    );
    await expect(article.locator('tr', { hasText: 'First use, 10% down' })).toHaveText(
      `First use, 10% down$350,000$35,000$315,0001.25%${usd(315000 * 0.0125)}`,
    );
    await expect(article.locator('tr', { hasText: 'IRRRL' }).first()).toHaveText(`IRRRL——$300,0000.50%${usd(300000 * 0.005)}`);
    await expect(article).toContainText('VA\'s current rates took effect April 7, 2023.');
    await expect(article).toContainText('You\'re eligible to receive VA compensation for a service-connected disability, but you\'re receiving retirement or active-duty pay instead');
    await expect(article).toContainText('on or before your loan closing date you provide evidence that you received a Purple Heart');
    await expect(article).toContainText('The effective date of your VA compensation must be retroactive to before the date of your loan closing.');
    await expect(article).toContainText('VA generally doesn\'t require an appraisal or credit underwriting for an IRRRL. Lenders can still require them under their own rules.');
    await expect(article).not.toContainText('Native American Direct Loan');
    // Financed-fee example: computed from the payment formula ($47 → $48; $16,920 → $17,123).
    const r = 0.065 / 12;
    const m = (7525 * r * (1 + r) ** 360) / ((1 + r) ** 360 - 1);
    await expect(article).toContainText(`the financed fee adds about ${usd(m)}/month in principal and interest`);
    await expect(article).toContainText(`those payments total about ${usd(m * 360)} for that ${FEE_FIRST_0} fee`);
  });

  test('/blog/va-home-loan-basics: VA\'s three COE options with the VA.gov link; computed fee', async ({ page }) => {
    await page.goto('/blog/va-home-loan-basics');
    const article = page.locator('article');
    await expect(article).toContainText(`= ${FEE_FIRST_0} funding fee`);
    await expect(article).toContainText('By mail with VA Form 26-1880');
    await expect(article.getByRole('link', { name: 'How to request a COE' })).toHaveAttribute('href', COE_URL);
  });

  test('/blog/using-bah-to-buy-a-home: example payment computed ($1,518 → $1,517)', async ({ page }) => {
    await page.goto('/blog/using-bah-to-buy-a-home');
    const r = 0.065 / 12;
    const pi = (240000 * r * (1 + r) ** 360) / ((1 + r) ** 360 - 1);
    const article = page.locator('article');
    await expect(article).toContainText(`PI = ${usd(pi)}/month`);
    await expect(article).toContainText(`Total housing cost: ~${usd(pi + 300)}/month`);
    await expect(article).toContainText(`leaving roughly ${usd(2050 - pi - 300)}/month`);
  });
});

test.describe('V3 calculator items (FIX_QUEUE row 12)', () => {
  test('(a) /calculators/va-loan: COE card names VA\'s three ways and links to VA.gov', async ({ page }) => {
    await page.goto('/calculators/va-loan');
    const card = page.getByTestId('vl-coe-card');
    await expect(card).toHaveAttribute('href', COE_URL);
    await expect(card).toContainText('online, through your lender, or by mail with VA Form 26-1880');
    await expect(page.locator('a[href*="ebenefits"]')).toHaveCount(0);
  });

  test('(b) /calculators/va-loan: education wording in the FAQ and its schema', async ({ page }) => {
    await page.goto('/calculators/va-loan');
    const want = 'VA loans can cost less when you have a small down payment, because there’s no monthly mortgage insurance';
    await expect(page.locator('main')).toContainText(want);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).toContain('"FAQPage"');
    expect(ld).toContain(want);
    expect(ld).not.toMatch(/superior/i);
    expect(await page.locator('main').textContent()).not.toMatch(/superior|1–2% of loan amount/i);
  });

  test('(d) /calculators/va-refinance: source wording for appraisal/underwriting and ARM to fixed', async ({ page }) => {
    await page.goto('/calculators/va-refinance');
    const main = page.locator('main');
    await expect(main).toContainText(`IRRRL: Only for existing VA loans. ${IRRRL_SENTENCE}`);
    await expect(main).toContainText('This calculator models fixed-rate loans only. An IRRRL can also move you from an adjustable rate to a fixed rate, which can make payments more stable.');
    await expect(main).not.toContainText('net tangible benefit by VA');
    await expect(main).not.toContainText('No appraisal or income verification');
    await expect(main).not.toContainText('full appraisal or income underwriting');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    expect(ld).toContain(IRRRL_SENTENCE);
  });
});

test.describe('V3 guide /guides/va-home-loans', () => {
  test('sample card computed from the VA loan calculator\'s defaults', async ({ page }) => {
    const ex = calcVaLoan(VA_LOAN_DEFAULTS);
    expect(usd(ex.totalPITI)).toBe('$2,610'); // control: the card used to say $2,611
    await page.goto('/guides/va-home-loans');
    await expect(page.getByTestId('guide-sample-fee')).toContainText(FEE_FIRST_0);
    await expect(page.getByTestId('guide-sample-piti')).toHaveText(usd(ex.totalPITI));
    await expect(page.locator('main')).toContainText(`covers ${Math.round((1806 / ex.totalPITI) * 100)}%`);
  });

  test('FAQ schema: computed rates, VA exemption list, IRRRL source wording; no banned wording', async ({ page }) => {
    await page.goto('/guides/va-home-loans');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).find((t) => t.includes('"FAQPage"'))!;
    expect(ld).toBeTruthy();
    expect(ld).toContain('First use with no down payment: 2.15%. Subsequent use with no down payment: 3.30%.');
    expect(ld).toContain('VA\'s current rates took effect April 7, 2023.');
    expect(ld).toContain('provide evidence that you received a Purple Heart');
    expect(ld).toContain(IRRRL_SENTENCE);
    for (const [name, re] of BANNED) expect(ld, name).not.toMatch(re);
    // The same IRRRL sentence is visible on the page (accordion).
    const text = (await page.locator('main').textContent()) ?? '';
    expect(text).toContain(IRRRL_SENTENCE);
    for (const [name, re] of BANNED) expect(text, name).not.toMatch(re);
    expect(text).not.toMatch(PMI_DOLLARS);
  });

  test('links: COE page, VA refinance and VA disability calculators, BAH prefill', async ({ page }) => {
    await page.goto('/guides/va-home-loans');
    const main = page.locator('main');
    await expect(main.locator(`a[href="${COE_URL}"]`)).toHaveCount(1);
    // Accordion content is in the DOM while closed (not in the accessibility tree), so match by href + text.
    await expect(main.locator('a[href="/calculators/va-refinance"]', { hasText: 'Estimate an IRRRL with the VA refinance calculator' })).toHaveCount(1);
    await expect(main.locator('a[href="/calculators/va-disability"]', { hasText: 'Calculate your combined VA disability rating' })).toHaveCount(1);
    await expect(main.locator('a[href="/calculators/va-loan?bah=yes"]', { hasText: 'Compare BAH to your estimated payment' })).toHaveCount(1);
  });
});

test.describe('V3 inbound links (step 4)', () => {
  for (const p of ['/bah', '/guides/pcs']) {
    test(`${p} links to the VA loan calculator with the BAH comparison on`, async ({ page }) => {
      await page.goto(p);
      await expect(page.locator('main a[href="/calculators/va-loan?bah=yes"]')).toHaveCount(1);
    });
  }
});
