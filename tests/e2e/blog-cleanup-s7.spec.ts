/**
 * S7 blog cleanup (FIX_QUEUE row 9, Part A): the seven kept posts after the merges.
 * The redirects, the zero-reference check and the sitemap's redirected URLs are in
 * redirects.spec.ts (the allowlisted home of the old slugs); the missing-space check
 * runs on every post in missing-spaces.spec.ts.
 *
 * Here, for each kept post: it renders with its own title; the FAQPage schema and the
 * visible FAQ are the same questions (both empty where the post has no FAQ); no raw
 * component names leak; the hand-typed figures left out of the merge stay out; and the
 * figures carried over come from the data modules.
 */
import { test, expect, type Page } from '@playwright/test';
import { EDUCATION_RATES } from '@/data/education/2026/constants';
import { SGLI_MAX_COVERAGE, SGLI_PREMIUM_PER_1000, SGLI_TSGLI_PREMIUM } from '@/data/constants';
import { formatCurrency } from '@/lib/utils';

const KEPT: { slug: string; title: string; faqCount: number; dropped: string[] }[] = [
  {
    slug: 'how-to-read-your-les',
    title: 'How to Read Your Army or Military LES: Every Line Explained',
    faqCount: 0,
    // FICA rate and "CR FWD" from the abbreviations post: no source / conflicts with the leave labels.
    dropped: ['7.65%', 'CR FWD'],
  },
  {
    slug: 'deployment-pay-explained',
    title: 'Deployment Pay Explained: Every Dollar You Earn Downrange',
    faqCount: 0,
    dropped: ['total contributions can go up to the $72,000'],
  },
  {
    slug: 'brs-vs-high-3-difference',
    title: 'What Is the Difference Between BRS and High-3 Military Retirement?',
    faqCount: 3,
    // Old typed E-7 figures, the E-5 match table, the continuation pay example and projections.
    dropped: ['$6,100', '$3,050', '$2,440', '$610/month', '$3,775.80', '$188.79', '$188/month', '$5,300.40', '$13,251', '$100,000', '13×', '83%'],
  },
  {
    slug: 'tuition-assistance-and-gi-bill-together',
    title: 'Can You Use Tuition Assistance and the GI Bill at the Same Time?',
    faqCount: 3,
    // Unsourced national MHA figure and the totals built on it; the 16-credit-hour claim.
    dropped: ['$2,522', '$83,000', '$91,000', '$30,264', '16 credit hours'],
  },
  {
    slug: 'is-sgli-enough-life-insurance',
    title: 'Is SGLI Enough Life Insurance for Military Members?',
    faqCount: 3,
    // VGLI rate table, private-term estimates, TSGLI/FSGLI/child amounts: no source in docs/sources.
    dropped: ['$425', '$690', '$1,075', '$2,200.00', '$18–22', '$28/month', '$25,000–$100,000', '$4.00/month', '$4.70', '$6.20', 'at $10,000', '$1,000,000', '$22.50'],
  },
  {
    slug: 'scra-mla-protections-new-service-members',
    title: 'SCRA and MLA Protections Every New Service Member Should Know',
    faqCount: 0,
    dropped: ['50 miles', 'Chase', 'American Express'],
  },
  {
    slug: 'pcs-financial-planning-guide',
    title: 'PCS Financial Planning: Month-by-Month Guide',
    faqCount: 0,
    // DLA E-6 figure, the out-of-pocket and buffer ranges, and the PPM dollar figure (build 07 rule).
    dropped: ['$3,548.02', '$1,000–$5,000', '$2,000–$3,000', '$2,000–$5,000'],
  },
];

type FaqSchema = { '@type': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };

async function faqSchemas(page: Page): Promise<FaqSchema[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(raw.length).toBeGreaterThan(0); // the Article block is always there
  return raw.map((r) => JSON.parse(r) as FaqSchema).filter((b) => b['@type'] === 'FAQPage');
}

test.describe('S7 kept posts', () => {
  for (const { slug, title, faqCount, dropped } of KEPT) {
    test(`/blog/${slug}: renders, FAQ schema = visible FAQ (${faqCount}), dropped figures absent`, async ({ page }) => {
      const res = await page.goto(`/blog/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

      const text = (await page.locator('article').textContent()) ?? '';
      expect(text.length).toBeGreaterThan(2000); // non-empty control
      expect(text).not.toMatch(/PostFaq|RetirementFigure|High3Breakdown|CalculatorCallout|NaN|undefined/);
      for (const s of dropped) expect(text, s).not.toContain(s);

      const schemas = await faqSchemas(page);
      const visible = page.locator('[data-faq-question]');
      await expect(visible).toHaveCount(faqCount);
      if (faqCount === 0) {
        expect(schemas).toHaveLength(0);
        return;
      }
      expect(schemas).toHaveLength(1);
      const schemaNames = schemas[0].mainEntity.map((q) => q.name);
      const visibleNames: string[] = [];
      for (let i = 0; i < faqCount; i++) {
        const el = visible.nth(i);
        await expect(el).toBeVisible();
        const q = (await el.getAttribute('data-faq-question')) ?? '';
        await expect(el).toContainText(q);
        // The visible answer is the schema answer.
        const answer = schemas[0].mainEntity.find((e) => e.name === q)?.acceptedAnswer.text;
        expect(answer, q).toBeTruthy();
        await expect(el).toContainText(answer!);
        visibleNames.push(q);
      }
      expect([...schemaNames].sort()).toEqual([...visibleNames].sort());
      for (const q of schemas[0].mainEntity) expect(q.acceptedAnswer.text).not.toMatch(/\]\(\//);
    });
  }

  test('carried-over figures come from the data modules', async ({ page }) => {
    // GI Bill private-school cap: EDUCATION_RATES (docs/sources/education-rates-2026-27.md).
    const cap = formatCurrency(EDUCATION_RATES.giBill.privateCapAnnual, true);
    expect(cap).toBe('$30,908.34'); // control
    await page.goto('/blog/tuition-assistance-and-gi-bill-together');
    await expect(page.locator('article')).toContainText(`up to ${cap} a year at private schools for 2026–2027`);

    // SGLI premium: src/data/constants.ts.
    const perThousand = formatCurrency(SGLI_PREMIUM_PER_1000, true);
    const tsgli = formatCurrency(SGLI_TSGLI_PREMIUM, true);
    const max = formatCurrency((SGLI_MAX_COVERAGE / 1000) * SGLI_PREMIUM_PER_1000 + SGLI_TSGLI_PREMIUM, true);
    expect(max).toBe('$26.00'); // control
    await page.goto('/blog/is-sgli-enough-life-insurance');
    await expect(page.locator('article')).toContainText(
      `The premium is ${perThousand} per $1,000 of coverage per month, plus a flat ${tsgli}/month for TSGLI (Traumatic Injury Protection) — ${max}/month at the $500,000 maximum.`,
    );
  });

  test('kept posts carry the merge date in their Article schema', async ({ page }) => {
    for (const { slug } of KEPT) {
      await page.goto(`/blog/${slug}`);
      const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
      const article = raw.map((r) => JSON.parse(r)).find((b) => b['@type'] === 'Article');
      expect(article, slug).toBeTruthy();
      expect(article.dateModified, slug).toBe('2026-11-23T00:00:00-05:00');
    }
  });
});
