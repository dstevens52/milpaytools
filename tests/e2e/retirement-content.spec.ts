/**
 * C1 (FIX_QUEUE row 6): retirement worked examples in posts and the
 * retirement-tsp guide are computed from the lib, never hand-typed, plus the
 * CRSC / VA / allowance tax wording and the BRS vesting rule.
 *
 * Expected High-3 values are rebuilt here from the raw pay table (10 U.S.C.
 * § 1407(c)(1): the last 36 months ÷ 36; at exactly 20 years that is 12 months
 * at Over 16 and 24 months at Over 18), not from the component's lib.
 */
import { test, expect } from '@playwright/test';
import { payTable } from '../../src/data/pay-tables/2026';
import { vaRates } from '../../src/data/va-rates/2026';
import { BAS_RATES } from '../../src/data/constants';
import { formatCurrency } from '../../src/lib/utils';

const pay = (g: string, col: number) => (payTable as Record<string, Record<number, number>>)[g][col];
const r2 = (n: number) => Math.round(n * 100 + 1e-7) / 100;
const usd = (n: number) => formatCurrency(r2(n), true);
const usd0 = (n: number) => formatCurrency(n);

function high3At20(grade: string) {
  const avg = (12 * pay(grade, 16) + 24 * pay(grade, 18)) / 36;
  return { avg, high3: 0.5 * avg, brs: 0.4 * avg };
}
const E7 = high3At20('E-7');
const O5 = high3At20('O-5');

const STALE = ['$6,141', '$3,070.65', '$2,456.52', '$3,071/', '$5,910', '$11,820', '$3,100/month', '$36,848', '$29,478'];

test.describe('C1: computed retirement figures', () => {
  test('rule values (control): E-7 $6,118.50 / $3,059.25 / $2,447.40; O-5 $11,606.30 / $5,803.15', () => {
    expect(usd(E7.avg)).toBe('$6,118.50');
    expect(usd(E7.high3)).toBe('$3,059.25');
    expect(usd(E7.brs)).toBe('$2,447.40');
    expect(usd(O5.avg)).toBe('$11,606.30');
    expect(usd(O5.high3)).toBe('$5,803.15');
  });

  for (const slug of ['brs-vs-high-3-difference', 'how-military-retirement-works', 'what-walking-away-at-12-years-costs', 'crdp-vs-crsc-military-retirement']) {
    test(`/blog/${slug}: computed High-3 figures, no stale ones, no raw component tags`, async ({ page }) => {
      await page.goto(`/blog/${slug}`);
      const article = page.locator('article');
      const text = (await article.textContent()) ?? '';
      expect(text.length).toBeGreaterThan(2000); // non-empty control
      expect(text).toContain(usd(E7.avg));
      expect(text).toContain(usd(E7.high3));
      if (slug !== 'crdp-vs-crsc-military-retirement') expect(text).toContain(usd(E7.brs));
      expect(text).toContain(`12 months at the Over 16 rate (${usd(pay('E-7', 16))}) and 24 months at the Over 18 rate (${usd(pay('E-7', 18))})`);
      for (const s of STALE) expect(text, s).not.toContain(s);
      expect(text).not.toMatch(/RetirementFigure|CrdpCrscFigure|High3Breakdown|NaN|undefined/);
    });
  }

  test('/blog/brs-vs-high-3-difference: gap row and 30-year total', async ({ page }) => {
    await page.goto('/blog/brs-vs-high-3-difference');
    const gap = E7.high3 - E7.brs;
    const article = page.locator('article');
    await expect(article).toContainText(`${usd0(gap)}/month pension gap — ${usd0(gap * 12)}/year`);
    await expect(article).toContainText(`that gap alone is ${usd0(gap * 12 * 30)} in additional pension income`);
  });

  test('COLA projection and lifetime totals use the calculator method (2.5% COLA, 44 years)', async ({ page }) => {
    const annual = (m: number, year: number) => m * 12 * Math.pow(1.025, year - 1);
    const life = (m: number) => Array.from({ length: 44 }, (_, t) => m * 12 * Math.pow(1.025, t)).reduce((a, b) => a + b, 0);
    const mill = (n: number) => `$${(n / 1e6).toFixed(1)} million`;
    expect(mill(life(E7.high3))).toBe('$2.9 million'); // control
    await page.goto('/blog/what-walking-away-at-12-years-costs');
    const article = page.locator('article');
    for (const y of [1, 10, 20, 30, 44]) {
      await expect(article.locator('tr', { hasText: `Year ${y} (` })).toContainText(usd0(annual(E7.high3, y)));
    }
    await expect(article).toContainText(`Total nominal payments over 44 years: approximately ${mill(life(E7.high3))}`);
    await expect(article).toContainText(`the same 44-year nominal total is approximately ${mill(life(E7.brs))}`);
    await expect(article).toContainText('entered service on or after January 1, 2018');
    // Row 6 item B: the 20th year is paid at Over 18; allowances "excluded from federal taxable income".
    await expect(article).not.toContainText(/tax-free/i);
    await expect(article).not.toContainText('$6,245.70/month = ');
    await expect(article).toContainText(`Base pay (final year, paid at the Over 18 rate): ${usd(pay('E-7', 18))}/month = ${usd0(pay('E-7', 18) * 12)}/year (taxable)`);
    await expect(article).toContainText(`BAS: ${usd(BAS_RATES.enlisted)}/month = ${usd0(BAS_RATES.enlisted * 12)}/year (excluded from federal taxable income)`);
    // C2: healthcare is the employer average employee premium (KFF 2026 via OS27, $7,471), not the old $15,000.
    const total = pay('E-7', 18) * 12 + 2000 * 12 + BAS_RATES.enlisted * 12 + 7471 + 25000;
    await expect(article).toContainText(`in the 20th year: approximately ${usd0(Math.round(total / 1000) * 1000)}`);
    for (const y of [12, 14, 16, 18, 20]) await expect(article).toContainText(`At ${y} years: ${usd(pay('E-7', y))}/month`);
    await page.goto('/blog/how-military-retirement-works');
    await expect(page.locator('article')).toContainText(`total nominal payments over 44 years come to about ${mill(life(E7.high3))}`);
    const k = (n: number) => usd0(Math.round(n / 1000) * 1000);
    await expect(page.locator('article')).toContainText(
      `to about ${k(annual(E7.high3, 28))}/year by age 65 if it starts at 38 (about ${k(annual(E7.high3, 26))} if it starts at 40)`,
    );
  });

  test('/blog/crdp-vs-crsc-military-retirement: table columns add up; CRSC is non-taxable with the DFAS source', async ({ page }) => {
    await page.goto('/blog/crdp-vs-crsc-military-retirement');
    const article = page.locator('article');
    const va = vaRates[70].veteranAlone;
    const pension = r2(E7.high3);
    const net = r2(pension - va);
    const gross = r2(pension + va);
    const taxCrdp = r2(0.22 * pension);
    const taxCrsc = r2(0.22 * net);
    const rows = await article.locator('table').first().locator('tr').allTextContents();
    expect(rows.join('|')).toContain(`Retirement pay (taxable)${usd(pension)}${usd(net)}`);
    expect(rows.join('|')).toContain(`Total gross monthly${usd(gross)}${usd(gross)}`);
    expect(rows.join('|')).toContain(`−${usd(taxCrdp)}−${usd(taxCrsc)}`);
    expect(rows.join('|')).toContain(`Net monthly take-home${usd(gross - taxCrdp)}${usd(r2(net + 2 * va) - taxCrsc)}`);
    // The stated advantage still matches the table.
    expect(usd(r2(net + 2 * va) - taxCrsc - (gross - taxCrdp))).toBe('$397.86');
    await expect(article).toContainText(`a difference of ${usd(r2(0.32 * pension) - r2(0.32 * net))}/month`);

    // Bracket table: every row = tax on the CRDP pension − tax on the CRSC retirement pay.
    const adv = (rate: number) => r2(rate * pension) - r2(rate * net);
    expect(usd0(adv(0.12))).toBe('$217'); // control: the old hand-typed row said $214
    for (const pct of [12, 22, 24, 32]) {
      const a = adv(pct / 100);
      await expect(article.locator('tr', { hasText: `${pct}%` }).last()).toHaveText(`${pct}%+${usd0(a)}/month (${usd0(a * 12)}/year)`);
    }
    await expect(article).toContainText(`CRSC advantage: ${usd(adv(0.22))}/month — ${usd0(adv(0.22) * 12)}/year.`);
    const vaCombat = vaRates[40].veteranAlone;
    const crdpAdv = r2(gross - taxCrdp) - r2(net + va + vaCombat - taxCrsc);
    await expect(article).toContainText(`CRDP advantage: ${usd(crdpAdv)}/month — ${usd0(crdpAdv * 12)}/year.`);
    await expect(article).toContainText(`CRSC only fills in ${usd(vaCombat)} of the ${usd(va)} offset. The remaining ${usd(va - vaCombat)} is simply gone`);
    expect(rows.join('|')).not.toContain('NaN');

    await expect(article).not.toContainText(/tax-free/i);
    await expect(article).toContainText('non-taxable (not subject to federal income tax)');
    await expect(article.getByRole('link', { name: 'DFAS, CRSC payment' })).toHaveAttribute('href', 'https://www.dfas.mil/RetiredMilitary/disability/payment');
  });

  test('/guides/retirement-tsp: E-7 and O-5 examples computed, FAQ answer included', async ({ page }) => {
    await page.goto('/guides/retirement-tsp');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    expect(text.length).toBeGreaterThan(2000);
    for (const s of STALE) expect(text, s).not.toContain(s);
    expect(text).not.toContain('~$2.4M');
    await expect(main).toContainText(`An E-7 retiring at age 38 with a ${usd0(E7.high3)}/month pension who lives to 82`);
    await expect(main).toContainText(`Pension: 50% × ${usd(O5.avg)} = ${usd(O5.high3)}/month (${usd0(O5.high3 * 12)}/year)`);
    // FAQ answer (FAQPage schema) carries the computed pension too.
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = ld.find((t) => t.includes('"FAQPage"'))!;
    expect(faq).toContain(`with a ${usd0(E7.high3)}/month pension who lives to 82`);
    expect(faq).not.toContain('$3,100');
  });
});

test.describe('C1: TSP vesting and tax wording', () => {
  test('BRS vesting: match and own contributions vest immediately; automatic 1% after 2 years', async ({ page }) => {
    for (const slug of ['brs-vs-high-3-difference', 'tsp-fund-options-explained']) {
      await page.goto(`/blog/${slug}`);
      const article = page.locator('article');
      await expect(article, slug).toContainText('matching contributions vest immediately');
      await expect(article, slug).toContainText('The automatic 1% vests after 2 years of service');
      await expect(article, slug).not.toContainText('The automatic 1% and matching contributions vest after 2 years');
      await expect(article, slug).not.toContainText('you forfeit the matching contributions');
    }
  });
  // The "are you financially ready" post this file also checked was merged into
  // /calculators/transition-readiness in S7b; blog-cleanup-s7b.spec.ts checks the
  // carried-over sections there.
});
