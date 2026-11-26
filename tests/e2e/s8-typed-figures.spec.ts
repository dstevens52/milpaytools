/**
 * S8 (FIX_QUEUE row 10): the rendered pages show the computed figures (equal to the
 * lib/data values), the year words next to them, and none of the removed typed strings.
 * Data values and the year-flip tests: s8-typed-figures-unit.spec.ts.
 */
import { test, expect, type Page } from '@playwright/test';
import { PCS_RATES_2026 } from '@/data/pcs/2026/constants';
import { EDUCATION_RATES } from '@/data/education/2026/constants';
import { OFFICIAL_COMPARISON_2027 } from '@/data/tricare/2027/openSeason';
import { TRICARE_COST_YEAR } from '@/data/tricare/current';
import { TAMP_DAYS } from '@/data/separation/rules';
import { getLocationDisplayName } from '@/lib/calculations/bah';
import {
  CURRENT_PAY_POST_DATA,
  bas,
  basicPay,
  brsMaxGovernmentMonthly,
  czteBasePayExample,
  czteYearsLabel,
  sgliBenchmark,
  sgliEnoughFaqAnswer,
  usd0,
  usdCents,
} from '@/lib/payPost';
import { dlaPostTable, maltPerMileText } from '@/lib/pcsPost';
import { giBillTotalAtZip } from '@/lib/giBillPost';
import { retireeFamilyFees } from '@/lib/tricareRetireeFees';
import { usdAuto, usdWhole } from '@/lib/tricarePost';
import { GUIDE_EXAMPLES, bahRangeForGrade, payBahExample } from '@/lib/militaryPayGuide';
import { retirementExample } from '@/lib/calculations/retirementExample';

const Y = CURRENT_PAY_POST_DATA.year;
const RAW_TAGS = /PayFigure|PayYear|SgliBenchmarkFigure|CzteBasePayFigure|PcsDlaTable|PcsFigure|GiBillTotalFigure|TricareRetireeFeeTable|TricareCostYear|RetirementFigure|High3Breakdown|NaN|undefined/;

async function articleText(page: Page, path: string): Promise<string> {
  const res = await page.goto(path);
  expect(res?.status(), path).toBe(200);
  const text = (await page.locator('article').textContent()) ?? '';
  expect(text.length, path).toBeGreaterThan(2000); // non-empty control
  expect(text, path).not.toMatch(RAW_TAGS);
  return text;
}

test.describe('S8 rendered posts', () => {
  test('how-military-retirement-works: retiree fee table for TRICARE_COST_YEAR + employer average', async ({ page }) => {
    const text = await articleText(page, '/blog/how-military-retirement-works');
    const t = retireeFamilyFees();
    const table = page.getByTestId('tricare-retiree-fee-table');
    await expect(table.locator('thead')).toContainText(`Coverage (${TRICARE_COST_YEAR})`);
    for (const r of t.rows) await expect(table.locator('tr', { hasText: r.plan })).toContainText(`${usdAuto(r.groupA)}${usdAuto(r.groupB)}`);
    expect(text).toContain(`Annual enrollment fees for a retiree family (${TRICARE_COST_YEAR}):`);
    expect(text).toContain(`See tricare.mil for complete ${TRICARE_COST_YEAR} cost details.`);
    expect(text).toContain(`costs an employee ${usdWhole(OFFICIAL_COMPARISON_2027.employerAvgEmployeePremium)} a year in premiums (Kaiser Family Foundation 2026 survey, as TRICARE reports it)`);
    for (const s of ['$375–$1,191', '$765–$927', '$15,000–$25,000', 'Approximate annual']) expect(text, s).not.toContain(s);
  });

  test('how-to-read-your-les: PEBD example and BAS from the pay table, year from DATA_YEAR', async ({ page }) => {
    const text = await articleText(page, '/blog/how-to-read-your-les');
    const a = basicPay('E-5', 4);
    const b = basicPay('E-5', 6);
    expect(text).toContain(
      `in ${Y} an E-5 with 4 years (under 6) earns ${usdCents(a)}/month but ${usdCents(b)}/month at 6+ years — so a wrong PEBD can cost ${usdCents(b - a)} per month.`,
    );
    expect(text).toContain(`See the ${Y} Military Pay Charts for your exact rate.`);
    expect(text).toContain(`In ${Y}, enlisted members receive ${usdCents(bas('enlisted'))}/month and officers receive ${usdCents(bas('officer'))}/month.`);
    expect(text).toContain(`Basic pay and BAS figures in this post reflect ${Y} DFAS rates.`);
    expect(text).not.toContain('$150+');
  });

  test('pcs-financial-planning-guide: DLA table and MALT from the PCS rate file', async ({ page }) => {
    const text = await articleText(page, '/blog/pcs-financial-planning-guide');
    const t = dlaPostTable();
    expect(text).toContain(`${t.year} DLA rates (DTMO):`);
    const table = page.getByTestId('pcs-dla-table');
    await expect(table.locator('tbody tr')).toHaveCount(4);
    for (const r of t.rows) await expect(table.locator('tr', { hasText: r.label })).toContainText(`${r.label}${r.without}${r.with}`);
    expect(text).toContain(`at ${maltPerMileText()}/mile (${PCS_RATES_2026.year} rate)`);
    for (const s of ['(approximate)', '$1,871', '$4,150', '$5,750']) expect(text, s).not.toContain(s);
  });

  test('is-sgli-enough-life-insurance: benchmark from the pay table; FAQ schema = visible = lib', async ({ page }) => {
    const text = await articleText(page, '/blog/is-sgli-enough-life-insurance');
    const s = sgliBenchmark();
    expect(text).toContain(
      `An E-6 with 10 years of service earns ${usd0(s.annual)} a year in ${s.year} basic pay (${usdCents(s.monthly)} a month × 12), so that benchmark comes to ${usd0(s.low)}–${usd0(s.high)}, ${s.vsMax} the $500,000 SGLI maximum before counting allowances.`,
    );
    expect(text).toContain('VA publishes the current monthly premium for each age band and coverage amount on its VGLI premium rates page');
    for (const x of ['$57,000', '$570,000', '$684,000', '$145/month', '$25–$40']) expect(text, x).not.toContain(x);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((r) => JSON.parse(r));
    const faq = ld.find((b) => b['@type'] === 'FAQPage');
    const q = faq.mainEntity.find((e: { name: string }) => e.name === 'Is $500,000 of SGLI enough life insurance?');
    expect(q.acceptedAnswer.text).toBe(sgliEnoughFaqAnswer());
    await expect(page.locator('[data-faq-question="Is $500,000 of SGLI enough life insurance?"]')).toContainText(sgliEnoughFaqAnswer());
  });

  test('post-911-gi-bill-explained-2026: totals = MHA × 33 + books × 4, labeled by academic year', async ({ page }) => {
    const text = await articleText(page, '/blog/post-911-gi-bill-explained-2026');
    const ay = EDUCATION_RATES.academicYear;
    const sf = giBillTotalAtZip('94132', 33, 4);
    expect(text).toContain(`the ${ay} MHA is ${usd0(sf.mhaMonthly)}/month, which comes to ${usd0(sf.mhaTotal)} for a full 33-month run at that rate.`);
    for (const zip of ['78712', '02215']) {
      const t = giBillTotalAtZip(zip, 33, 4);
      expect(text, zip).toContain(`(ZIP ${zip}, ${getLocationDisplayName(zip)})`);
      expect(text, zip).toContain(`MHA at ${usd0(t.mhaMonthly)}/month × 33 months: ${usd0(t.mhaTotal)}`);
      expect(text, zip).toContain(`Books stipend × 4 years: ${usd0(t.books)}`);
      expect(text, zip).toContain(`Total benefit: ${usd0(t.total)} — all tax-free`);
    }
    expect(text).toContain(`at the ${ay} rates, full time`);
    for (const s of ['$72,600', '$148,500', '$165,000', '$76,600', '$152,500']) expect(text, s).not.toContain(s);
  });

  test('deployment-pay-explained: CZTE figures from the deployment tax method, years labeled', async ({ page }) => {
    const text = await articleText(page, '/blog/deployment-pay-explained');
    const s = czteBasePayExample('E-6', 10, 'single');
    const j = czteBasePayExample('E-6', 10, 'mfj');
    const e7 = czteBasePayExample('E-7', 12, 'mfj');
    const label = czteYearsLabel(s.payYear, s.taxYear);
    expect(text).toContain(
      `federal income tax on base pay alone is about ${usd0(s.monthlyTax)}/month filing single, or about ${usd0(j.monthlyTax)}/month married filing jointly on one income (${label}; an estimate, by the deployment calculator's method).`,
    );
    expect(text).toContain(`so you keep about ${usd0(s.savings12)} (single) or ${usd0(j.savings12)} (joint)`);
    expect(text).toContain(`Example — E-7 with 12 years, filing jointly on one income (${czteYearsLabel(e7.payYear, e7.taxYear)}):`);
    expect(text).toContain(`Base pay: ${usdCents(e7.monthlyBasePay)}/month`);
    expect(text).toContain(`in normal months: about ${usd0(e7.monthlyTax)}/month (estimate)`);
    expect(text).toContain(`CZTE savings over 12 months: about ${usd0(e7.savings12)}`);
    // $389 is also the computed single-filer figure today, so only the figures that changed are checked.
    for (const x of ['$4,670', '$2,490', '~$5,592', '~$308', '$3,690']) expect(text, x).not.toContain(x);
  });

  test('should-i-stay-to-20-years-military: High-3 figures computed, lifetime projections cut', async ({ page }) => {
    const text = await articleText(page, '/blog/should-i-stay-to-20-years-military');
    const ex = retirementExample('E-7', 20);
    const c = (n: number) => usdCents(n);
    expect(text).toContain(`for an E-7 under High-3 retiring at 20 years, ${c(ex.high3Pension)}/month beginning at retirement`);
    expect(text).toContain(`using ${Y} pay tables`);
    expect(text).toContain(`Pension: 50% × ${c(ex.high3Average)} = ${c(ex.high3Pension)}/month (${usd0(ex.high3Pension * 12)}/year)`);
    expect(text).toContain(`Pension: 40% × ${c(ex.high3Average)} = ${c(ex.brsPension)}/month (${usd0(ex.brsPension * 12)}/year)`);
    expect(text).toContain(`2.5% × ${c(ex.high3Average)} = ${c(ex.high3PerExtraYear)}/month in pension`);
    expect(text).toContain(`To replace ${c(ex.high3Pension)}/month in pension income`);
    await expect(page.locator('article a[href="/calculators/retirement"]').first()).toBeVisible();
    for (const s of ['$3,059/', '$918,000', '$2M+', '$1M+', '$71,000', '$93,600', 'worth millions']) expect(text, s).not.toContain(s);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain("you're close enough to a lifetime pension that the math matters enormously");
    expect(desc).not.toContain('$1M+');
  });

  test('what-walking-away-at-12-years-costs: TSP projections cut; current BRS contributions computed', async ({ page }) => {
    const text = await articleText(page, '/blog/what-walking-away-at-12-years-costs');
    expect(text).toContain(`At 12 years: ${usdCents(basicPay('E-7', 12))}/month basic pay (${Y}) → ${usdCents(brsMaxGovernmentMonthly('E-7', 12))}/month from the government`);
    expect(text).toContain(`At the Over 18 rate: ${usdCents(basicPay('E-7', 18))}/month basic pay → ${usdCents(brsMaxGovernmentMonthly('E-7', 18))}/month from the government`);
    await expect(page.locator('article a[href="/calculators/tsp"]').first()).toBeVisible();
    await expect(page.locator('article a[href="/calculators/retirement"]').first()).toBeVisible();
    for (const s of ['$5,900', '$295', '$28,320', '$38,000', '$165,000', '$150,000+']) expect(text, s).not.toContain(s);
  });
});

test.describe('S8 rendered pages', () => {
  test('/calculators/transition-readiness: healthcare card from OS27 + TAMP_DAYS', async ({ page }) => {
    await page.goto('/calculators/transition-readiness');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    await expect(main).toContainText(
      `When you separate, that coverage ends unless you qualify for TAMP (${TAMP_DAYS} days of continued TRICARE starting on your separation date). Even with an employer plan, the average family plan costs an employee ${usdWhole(OFFICIAL_COMPARISON_2027.employerAvgEmployeePremium)} a year in premiums, with a ${usdWhole(OFFICIAL_COMPARISON_2027.employerAvgFamilyDeductible)} average family deductible (KFF 2026, as TRICARE reports it), before copays and coinsurance.`,
    );
    await expect(main).toContainText(`if you qualify, ${TAMP_DAYS} days of continued TRICARE starting on your separation date; verify eligibility`);
    for (const s of ['$1,400–$2,000', '$10,000/year', 'KFF 2025']) expect(text, s).not.toContain(s);
  });

  test('/guides/military-pay: BAS, BAH ranges and examples computed; TC-02 figures cut', async ({ page }) => {
    await page.goto('/guides/military-pay');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    const e5 = bahRangeForGrade('E-5');
    const o3 = bahRangeForGrade('O-3');
    const o5 = bahRangeForGrade('O-5');
    await expect(main).toContainText(`E-5 with dependents (${e5.year}): ${usd0(e5.min)} to ${usd0(e5.max)}/mo by location`);
    await expect(main).toContainText('Tax advantage: BAH and BAS excluded from federal taxable income');
    // Accordion panels are in the DOM (closed): read text, not visibility.
    expect(text).toContain(`${e5.year} BAH range with dependents:`);
    expect(text).toContain(`E-5: ${usd0(e5.min)}/mo (low-cost) to ${usd0(e5.max)}/mo (${e5.maxArea} area)`);
    expect(text).toContain(`O-3: ${usd0(o3.min)}/mo to ${usd0(o3.max)}/mo`);
    expect(text).toContain(`O-5: ${usd0(o5.min)}/mo to ${usd0(o5.max)}/mo`);
    expect(text).toContain(`${Y} rates: ${usdCents(bas('enlisted'))}/month enlisted, ${usdCents(bas('officer'))}/month officers.`);
    const j = GUIDE_EXAMPLES.jblm;
    const jblm = payBahExample(j.zip, j.grade, j.yos, { withTspMatch: true });
    expect(text).toContain(`E-5 with 6 years, Joint Base Lewis-McChord, with dependents (${jblm.year} rates):`);
    expect(text).toContain(`BRS TSP matching (5% contribution): ${usdCents(jblm.tspMatch)}/month`);
    expect(text).toContain(`Total: ${usd0(jblm.total)}/month — ${usd0(jblm.total * 12)}/year`);
    const c = GUIDE_EXAMPLES.fortCarson;
    const carson = payBahExample(c.zip, c.grade, c.yos, { withTspMatch: false });
    expect(text).toContain(`${carson.year} rates`);
    expect(text).toContain(`Total Monthly${usd0(carson.total)}`);
    expect(text).toContain(`Per year${usd0(carson.total * 12)}`);
    for (const s of ['$110,000', '$120,000', '$5K–$15K', '$97,000', 'Civilian equivalent', '~$1,200/mo', '$5,100+', '40–60%']) expect(text, s).not.toContain(s);

    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((r) => JSON.parse(r));
    const faq = ld.find((b) => b['@type'] === 'FAQPage');
    const answers = faq.mainEntity.map((e: { acceptedAnswer: { text: string } }) => e.acceptedAnswer.text).join('\n');
    expect(answers).toContain(`In ${e5.year}, an E-5 with dependents can receive from ${usd0(e5.min)}/month in a low-cost area to ${usd0(e5.max)}/month in high-cost markets.`);
    expect(answers).toContain(`${usdCents(bas('enlisted'))} for enlisted, ${usdCents(bas('officer'))} for officers in ${Y}.`);
    expect(answers).toContain('The Military Pay Calculator works out the civilian salary equivalent for your grade, years of service and duty station.');
    for (const s of ['$110,000', '$7,348', '40–60%']) expect(answers, s).not.toContain(s);
  });

  test('/transition: civilian-salary card says "excluded from federal taxable income"', async ({ page }) => {
    await page.goto('/transition');
    const main = page.locator('main');
    await expect(main).toContainText('side-by-side comparison of taxable compensation, allowances excluded from federal taxable income, and benefits.');
    await expect(main).not.toContainText('taxable vs. tax-free compensation');
  });
});
