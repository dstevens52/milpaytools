/**
 * S7b blog cleanup (FIX_QUEUE row 9, S7b): the kept pages after three more merges,
 * the new inbound links and the TSP for Beginners trim. The redirects, the
 * zero-reference check and the sitemap are in redirects.spec.ts; the missing-space
 * check runs on every post and calculator in missing-spaces.spec.ts.
 *
 * Carried-over figures are recomputed here from the libraries the calculators use
 * (not through the post components), so a component that drifts from its library fails.
 */
import { test, expect, type Page } from '@playwright/test';
import { calculateDeployment, defaultDeploymentFilingStatus } from '@/lib/calculations/deployment';
import { combinedBahForZip, getLocationDisplayName } from '@/lib/calculations/bah';
import { giBillBahAtZip, giBillBahAllMhas } from '@/lib/calculations/educationBah';
import { EDUCATION_RATES } from '@/data/education/2026/constants';
import { formatCurrency } from '@/lib/utils';

const usd = (n: number) => formatCurrency(Math.round(n));

async function faqCounts(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(raw.length).toBeGreaterThan(0); // control
  const schemas = raw.map((r) => JSON.parse(r) as { '@type': string }).filter((b) => b['@type'] === 'FAQPage');
  return { schema: schemas.length, visible: await page.locator('[data-faq-question]').count() };
}

async function articleText(page: Page) {
  const text = (await page.locator('article').textContent()) ?? '';
  expect(text.length).toBeGreaterThan(2000); // non-empty control
  expect(text).not.toMatch(/DeploymentTour|GiBillMha|NaN|undefined/);
  return text;
}

test.describe('S7b: deployment-pay-explained (merged deployment savings post)', () => {
  // The walkthrough's inputs: E-6, 10 years, with dependents, 9 combat-zone months, IDP, FSA, $10,000 SDP.
  const r = calculateDeployment({
    payGrade: 'E-6',
    yearsOfService: 10,
    hasDependents: true,
    filingStatus: defaultDeploymentFilingStatus(true),
    zipCode: '28310',
    monthlyBAH: combinedBahForZip('28310', 'E-6', true),
    bahFound: true,
    deploymentMonths: 9,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 0,
    hasFSA: true,
    tspContributionPct: 0,
    usingSDP: true,
    sdpDeposit: 10000,
  });

  test('lib controls: base pay, IDP, FSA, no federal tax, SDP interest', () => {
    expect(r.during.monthlyBasePay).toBeGreaterThan(4000);
    expect(r.during.monthlyBAH).toBeGreaterThan(0);
    expect(r.during.monthlyIDP).toBe(275);
    expect(r.during.monthlyFSA).toBe(300);
    expect(r.during.monthlyFederalTax).toBe(0);
    expect(usd(r.tour.sdpInterestEarned)).toBe('$750');
  });

  test('walkthrough table and figures match the deployment lib; dropped figures stay out', async ({ page }) => {
    await page.goto('/blog/deployment-pay-explained');
    const text = await articleText(page);
    const table = page.getByTestId('deployment-tour-table');
    const row = (label: string) => table.locator('tr', { hasText: label });
    await expect(row('Base pay (E-6, 10 years)')).toContainText(usd(r.during.monthlyBasePay));
    await expect(row('BAH with dependents')).toContainText(usd(r.during.monthlyBAH));
    await expect(row('BAH with dependents')).toContainText(`${getLocationDisplayName('28310')}, ZIP 28310`);
    await expect(row('BAS (enlisted)')).toContainText(usd(r.during.monthlyBAS));
    await expect(row('Imminent Danger Pay')).toContainText(usd(r.during.monthlyIDP));
    await expect(row('Family Separation Allowance')).toContainText(usd(r.during.monthlyFSA));
    await expect(row('Total monthly pay')).toContainText(usd(r.during.grossMonthly));
    await expect(row('Social Security + Medicare')).toContainText(`−${usd(r.during.monthlyFICA)}`);
    await expect(row('Monthly pay after taxes')).toContainText(usd(r.during.monthlyTakeHome));
    expect(text).toContain(`Over 9 months that's ${usd(r.during.monthlyTakeHome * 9)} of pay after taxes.`);
    expect(text).toContain(`adds ${usd(r.tour.sdpInterestEarned)} in interest over the 9 months`);
    await expect(page.getByRole('heading', { name: 'Expenses that drop while you\'re deployed' })).toBeVisible();
    // The merged post's unsourced ranges and projections.
    for (const s of ['$35,000–$50,000', '$35,000–$45,000', '$58,000', '$6,450', '$1,500–$2,000', '$300–$600', '$15,000–$30,000', '$450,000', '$40,000']) {
      expect(text, s).not.toContain(s);
    }
  });

  test('links to the HFP/IDP rate-change post; FAQ schema = visible (none)', async ({ page }) => {
    await page.goto('/blog/deployment-pay-explained');
    await expect(page.locator('article a[href="/blog/hfp-idp-hdpl-rate-changes-october-2026"]')).toHaveCount(1);
    expect(await faqCounts(page)).toEqual({ schema: 0, visible: 0 });
  });
});

test.describe('S7b: post-911-gi-bill-explained-2026 (merged GI Bill ZIP post)', () => {
  const ZIPS = ['94132', '02215', '92093', '78712', '28301'];
  const all = giBillBahAllMhas();

  test('lib controls: every example ZIP resolves; 338 housing areas', () => {
    for (const z of ZIPS) expect(giBillBahAtZip(z), z).toBeGreaterThan(0);
    expect(all).toHaveLength(338);
  });

  test('ZIP examples and range match the education data; $2,522 / $83,226 gone', async ({ page }) => {
    await page.goto('/blog/post-911-gi-bill-explained-2026');
    const text = await articleText(page);
    const table = page.getByTestId('gi-bill-mha-table');
    await expect(table.locator('thead')).toContainText(EDUCATION_RATES.academicYear);
    for (const z of ZIPS) {
      const row = table.locator('tr', { hasText: z });
      await expect(row).toContainText(getLocationDisplayName(z)!);
      await expect(row).toContainText(`${usd(giBillBahAtZip(z)!)}/month`);
    }
    await expect(table.locator('tr', { hasText: 'Online only' })).toContainText(`up to ${usd(EDUCATION_RATES.giBill.onlineMHAMonthly)}/month`);
    expect(text).toContain(`Across all ${all.length} housing areas, the full-time rate runs from ${usd(Math.min(...all))} to ${usd(Math.max(...all))} a month.`);
    await expect(page.locator('article a[href="/calculators/education"]').first()).toBeVisible();
    for (const s of ['$2,522', '$83,226', '2025–2026', '$1,100/month in rural']) expect(text, s).not.toContain(s);
    expect(await faqCounts(page)).toEqual({ schema: 0, visible: 0 });
  });
});

test.describe('S7b: /calculators/transition-readiness (merged readiness post)', () => {
  test('title, H1 and meta unchanged; factors card; dropped ranges and plan name absent', async ({ page }) => {
    await page.goto('/calculators/transition-readiness');
    await expect(page).toHaveTitle('Transition Readiness Calculator 2026: Am I Financially Ready to Leave the Military?');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Find out if you can afford to leave the military. Enter your rank, duty station, VA rating, target salary, and expenses — get a readiness verdict with action steps.',
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Transition Readiness Calculator');
    const factors = page.locator('.tr-factors');
    // Thresholds as in calculateTransitionReadiness (surplus 500/0, runway 6/3, timeline 12/6).
    await expect(factors).toContainText('green at $500+ a month, yellow from $0 to $499, red when expenses exceed income');
    await expect(factors).toContainText('green at 6+ months of expenses, yellow from 3 to under 6, red under 3');
    await expect(factors).toContainText('green at 12+ months, yellow at 6 to 11, red under 6');
    const body = (await page.locator('main').textContent()) ?? '';
    expect(body.length).toBeGreaterThan(2000);
    for (const s of ['$525–$1,700', '$10,000–$15,000', 'TRICARE Retired Reserve', 'TRICARE for Life or']) expect(body, s).not.toContain(s);
    await expect(page.locator('a[href="/blog/skillbridge-program-guide"]')).toHaveCount(1);
    expect(await faqCounts(page)).toEqual({ schema: 0, visible: 0 });
  });
});

test.describe('S7b: inbound links and the TSP for Beginners trim', () => {
  test('how-to-read-your-les links the HFP/IDP rate-change post', async ({ page }) => {
    await page.goto('/blog/how-to-read-your-les');
    await expect(page.locator('article a[href="/blog/hfp-idp-hdpl-rate-changes-october-2026"]')).toHaveCount(1);
  });

  test('/guides/retirement-tsp and /calculators/retirement link how-military-retirement-works', async ({ page }) => {
    await page.goto('/guides/retirement-tsp');
    await expect(page.locator('a[href="/blog/how-military-retirement-works"]', { hasText: 'How Military Retirement Works: The Basics' })).toHaveCount(1);
    await page.goto('/calculators/retirement');
    await expect(page.locator('a[href="/blog/how-military-retirement-works"]', { hasText: 'How Military Retirement Works: The Basics' })).toHaveCount(1);
  });

  test('tsp-for-beginners: fund section is a summary + link, no fund figures; dateModified', async ({ page }) => {
    await page.goto('/blog/tsp-for-beginners-what-happens-if-you-do-nothing');
    const text = await articleText(page);
    await expect(page.getByRole('heading', { name: 'The five TSP funds — 30-second version' })).toBeVisible();
    const summary = page.locator('article p', { hasText: 'TSP has five individual funds' });
    await expect(summary).toHaveCount(1);
    await expect(summary.locator('a[href="/blog/tsp-fund-options-explained"]')).toHaveCount(1);
    await expect(summary).not.toContainText(/\d/); // no figures in the summary
    // The cut fund bullets (the post still mentions L 2070 in an earlier, untouched section).
    for (const s of ['10–11%', 'roughly 38%', 'roughly 18%', 'L Income is most conservative', 'Bloomberg Barclays']) expect(text, s).not.toContain(s);
    const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
    const article = raw.map((x) => JSON.parse(x)).find((b) => b['@type'] === 'Article');
    expect(article.dateModified).toBe('2026-11-23T00:00:00-05:00');
  });
});
