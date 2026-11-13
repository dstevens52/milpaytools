import { test, expect, type Page } from '@playwright/test';
import { E1_UNDER_4_MONTHS } from '@/data/pay-tables/2026';

// Branch-term pass (Nov 2026): titles, meta descriptions and FAQ sections on
// the pages earning branch-modified search impressions.
//
// Core rule: FAQPage JSON-LD may only carry questions that are visible on the
// page. Every visible FAQ entry carries data-faq-question; the schema's
// question names must match that set exactly.

const PAGES: { path: string; faqCount: number }[] = [
  { path: '/calculators/total-compensation', faqCount: 3 },
  { path: '/calculators/pcs', faqCount: 2 },
  { path: '/bah', faqCount: 3 },
  { path: '/calculators/guard-reserve', faqCount: 2 },
  { path: '/calculators/dual-military-bah', faqCount: 5 },
  // Pay rank pages: flat grade, compound Army title, E-9, officer.
  { path: '/pay/e1', faqCount: 5 },
  { path: '/pay/e4', faqCount: 5 },
  { path: '/pay/e9', faqCount: 5 },
  { path: '/pay/o6', faqCount: 5 },
];

type FaqSchema = {
  '@type': string;
  mainEntity: { '@type': string; name: string; acceptedAnswer: { text: string } }[];
};

async function jsonLdBlocks(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(raw.length).toBeGreaterThan(0);
  // JSON.parse throws on malformed JSON-LD, failing the test.
  return raw.map((r) => JSON.parse(r) as Record<string, unknown>);
}

async function faqSchema(page: Page): Promise<FaqSchema> {
  const blocks = await jsonLdBlocks(page);
  const faqs = blocks.filter((b) => b['@type'] === 'FAQPage') as unknown as FaqSchema[];
  expect(faqs, 'exactly one FAQPage block').toHaveLength(1);
  return faqs[0];
}

const metaDescription = (page: Page) =>
  page.locator('meta[name="description"]').getAttribute('content');

test.describe('FAQ schema matches visible FAQ', () => {
  for (const { path, faqCount } of PAGES) {
    test(`${path}: ${faqCount} visible questions = ${faqCount} schema questions`, async ({ page }) => {
      await page.goto(path);
      const schema = await faqSchema(page);
      const schemaNames = schema.mainEntity.map((q) => q.name);

      const visible = page.locator('[data-faq-question]');
      await expect(visible).toHaveCount(faqCount);
      const visibleNames: string[] = [];
      for (let i = 0; i < faqCount; i++) {
        const el = visible.nth(i);
        await expect(el).toBeVisible();
        const q = (await el.getAttribute('data-faq-question')) ?? '';
        await expect(el).toContainText(q);
        visibleNames.push(q);
      }

      expect(schemaNames).toHaveLength(faqCount);
      expect([...schemaNames].sort()).toEqual([...visibleNames].sort());
      // Schema answers are plain text: no markdown link syntax leaks through.
      for (const q of schema.mainEntity) {
        expect(q.acceptedAnswer.text).not.toMatch(/\]\(\//);
      }
    });
  }
});

test.describe('Branch-term titles and descriptions', () => {
  const CALC_META: { path: string; title: string; desc: string }[] = [
    {
      path: '/calculators/total-compensation',
      title: 'Military Pay Calculator 2026: Army, Navy, Air Force, USMC',
      desc: '2026 military pay calculator for Army, Navy, Air Force, Marines, Space Force and Coast Guard: base pay, BAH, BAS, TSP match and civilian salary equivalent.',
    },
    {
      path: '/calculators/pcs',
      title: 'PCS & PPM Calculator 2026: Army, Navy, Air Force, USMC',
      desc: '2026 PCS calculator: DLA, MALT, per diem, TLE and PPM (DITY) proceeds at official DTMO rates. Army, Navy, Air Force, Marines, Space Force and Coast Guard.',
    },
    {
      path: '/bah',
      title: 'BAH Calculator 2026: Rates by Duty Station | MilPayTools',
      desc: 'Look up your 2026 BAH rate for any branch by ZIP code, pay grade and dependency status, or browse by duty station. Official DTMO data for all 40,959 ZIP codes.',
    },
    {
      path: '/calculators/guard-reserve',
      title: 'Guard & Reserve Drill Pay Calculator 2026 (All Branches)',
      desc: 'Estimate 2026 drill pay (MUTA), AT pay, BAS and BRS TSP: Army Reserve & National Guard, Navy Reserve, Air Force Reserve, Air National Guard, Marine Reserve.',
    },
    {
      path: '/calculators/dual-military-bah',
      title: 'Dual Military BAH Calculator 2026 + Double BAH Rules',
      desc: '2026 dual military (mil-to-mil) BAH calculator: see what both members draw, who should claim dependents, and how "double BAH" really works. Official DoD rates.',
    },
  ];

  for (const { path, title, desc } of CALC_META) {
    test(`${path}: title and description`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      const t = await page.title();
      expect(t.length).toBeLessThanOrEqual(60);
      expect(t.split('MilPayTools').length - 1).toBeLessThanOrEqual(1);
      const d = await metaDescription(page);
      expect(d).toBe(desc);
      expect(d!.length).toBeLessThanOrEqual(160);
    });
  }

  test('total-compensation: Guard & Reserve FAQ link is a rendered link', async ({ page }) => {
    await page.goto('/calculators/total-compensation');
    const item = page.locator('[data-faq-question="Does it work for Guard and Reserve members?"]');
    await expect(item.locator('a[href="/calculators/guard-reserve"]')).toHaveText(
      'Guard & Reserve Pay Calculator'
    );
    const schema = await faqSchema(page);
    const answer = schema.mainEntity.find((q) => q.name === 'Does it work for Guard and Reserve members?');
    expect(answer?.acceptedAnswer.text).toContain('use the Guard & Reserve Pay Calculator.');
  });
});

test.describe('Pay rank branch FAQ', () => {
  const branchQuestion = (grade: string) =>
    `How much does an ${grade} make in the Army, Navy, Air Force or Marine Corps?`;

  async function branchAnswer(page: Page, grade: string): Promise<string> {
    const schema = await faqSchema(page);
    const q = schema.mainEntity.find((e) => e.name === branchQuestion(grade));
    expect(q, `branch FAQ present for ${grade}`).toBeTruthy();
    return q!.acceptedAnswer.text;
  }

  test('E-5: range matches the title; all five branch titles', async ({ page }) => {
    await page.goto('/pay/e5');
    const range = (await page.title()).match(/: (\$[\d,]+–\$[\d,]+)\/Month/)?.[1];
    expect(range).toBeTruthy();
    const answer = await branchAnswer(page, 'E-5');
    expect(answer).toContain(`${range} per month in 2026, depending on years of service`);
    expect(answer).toContain(
      'Army Sergeant, Navy Petty Officer Second Class, Air Force Staff Sergeant, Marine Sergeant and Space Force Sergeant.'
    );
  });

  test('E-1: title amount plus the DFAS under-4-months rate from the data library', async ({ page }) => {
    await page.goto('/pay/e1');
    const amount = (await page.title()).match(/: (\$[\d,]+)\/Month/)?.[1];
    expect(amount).toBeTruthy();
    const under4 = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(E1_UNDER_4_MONTHS);
    const answer = await branchAnswer(page, 'E-1');
    expect(answer).toContain(
      `The same basic pay in every branch: ${amount} per month in 2026 (members with less than 4 months of service receive a lower DFAS rate of ${under4} for those first months).`
    );
    // Same figure as the page's table footnote.
    await expect(page.getByText(`receives ${under4}/month`)).toBeVisible();
    expect(answer).not.toContain('a flat');
  });

  test('E-2: flat-pay wording, whole dollars from the title', async ({ page }) => {
    await page.goto('/pay/e2');
    const amount = (await page.title()).match(/: (\$[\d,]+)\/Month/)?.[1];
    expect(amount).toBeTruthy();
    const answer = await branchAnswer(page, 'E-2');
    expect(answer).toContain(`a flat ${amount} per month in 2026 — the grade has no longevity steps`);
    expect(answer).not.toContain('depending on years of service');
    expect(answer).not.toContain('less than 4 months');
  });

  test('E-4: compound Army title kept whole', async ({ page }) => {
    await page.goto('/pay/e4');
    const answer = await branchAnswer(page, 'E-4');
    expect(answer).toContain('Army Specialist or Corporal');
    expect(answer).not.toContain('Coast Guard');
  });
});
