/**
 * "What this calculator does" blocks (src/components/calculators/shared/CalculatorSummary.tsx).
 *
 * For each calculator page:
 *   1. The block is in the server HTML (no JavaScript) exactly once, with its
 *      sentences, and its example figure equals the lib's output for the example
 *      inputs (getCalculatorSummary computes it with the calculator's lib functions)
 *      and its link is the shared example link.
 *   2. Opening the example link shows the same figure in the calculator itself
 *      (a separate code path: the client reads the URL settings and computes).
 */

import { test, expect } from '@playwright/test';
import { getCalculatorSummary, SUMMARY_KEYS, summaryPath, NO_ACCOUNT_LINE, type SummaryKey } from '@/lib/calculatorSummaries';
import { exampleHref } from '@/data/calculatorUrlParams';

/** The element each calculator shows its headline figure in. */
const RESULT_TESTID: Record<Exclude<SummaryKey, 'separation-timeline'>, string> = {
  'total-compensation': 'tc-monthly-total',
  bah: 'bah-monthly-rate',
  'va-disability': 'va-monthly-comp',
  tsp: 'tsp-final-balance',
  retirement: 'ret-monthly-pension',
  pcs: 'pcs-total',
  'guard-reserve': 'gr-total-value',
  education: 'housing-gi-bill',
  cola: 'cola-result-index',
  compare: 'compare-headline-diff',
  deployment: 'deployment-tour-total',
  'dual-military-bah': 'dual-household-bah',
  'transition-readiness': 'tr-grossed-up-salary',
  'healthcare-comparison': 'hc-annual-gap',
  'va-loan': 'vl-funding-fee',
  'va-refinance': 'vr-funding-fee',
  // The first (current-year) result column.
  'va-entitlement': 've-max-loan',
};

/** Calculators whose block deliberately has no worked example. */
const NO_EXAMPLE: SummaryKey[] = ['separation-timeline'];

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Visible text of an HTML fragment (React's <!-- --> text separators and tags removed). */
function textOf(html: string): string {
  return decode(html.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

/** "$1,893/month" → "$1,893"; "$1.23M" and "4%" unchanged. */
function figureValue(figure: string): string {
  return figure.replace(/\/(month|year)$/, '');
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('calculator summary blocks', () => {
  test('every calculator without an example is listed as such', () => {
    for (const key of SUMMARY_KEYS) {
      const s = getCalculatorSummary(key);
      expect(s.example === null, `${key} example`).toBe(NO_EXAMPLE.includes(key));
    }
  });

  for (const key of SUMMARY_KEYS) {
    test(`${key}: block is in the server HTML with the lib's figure`, async ({ request }) => {
      const res = await request.get(summaryPath(key));
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html.split('data-testid="calc-summary"').length - 1, 'exactly one block').toBe(1);

      const start = html.indexOf(`data-calc="${key}"`);
      expect(start, 'block for this calculator').toBeGreaterThan(-1);
      const block = html.slice(start, html.indexOf('</section>', start));
      const text = textOf(block);
      const s = getCalculatorSummary(key);

      expect(text).toContain('What this calculator does');
      expect(text).toContain(s.what);
      expect(text).toContain(`What you enter: ${s.inputs}.`);
      expect(text).toContain(`${s.basis} ${NO_ACCOUNT_LINE}`);
      expect(text).not.toMatch(/tax-free/i);

      if (!s.example) {
        expect(block).not.toContain('calc-summary-figure');
        return;
      }
      const fig = block.match(/data-testid="calc-summary-figure"[^>]*>([^<]*)</);
      expect(fig, 'figure element').not.toBeNull();
      expect(decode(fig![1])).toBe(s.example.figure);
      expect(s.example.figure).not.toMatch(/^\$0(\D|$)/);
      expect(text).toContain(`Example: ${s.example.lead} → ${s.example.figure}${s.example.tail}.`);

      const link = block.match(/<a href="([^"]+)" data-testid="calc-summary-link"/);
      expect(link, 'example link').not.toBeNull();
      expect(decode(link![1])).toBe(s.example.href);
      expect(s.example.href).toBe(exampleHref(key));
    });
  }

  for (const key of SUMMARY_KEYS.filter((k) => !NO_EXAMPLE.includes(k))) {
    test(`${key}: the example link shows the same figure in the calculator`, async ({ page }) => {
      const s = getCalculatorSummary(key);
      await page.goto(s.example!.href);
      const value = figureValue(s.example!.figure);
      // Left boundary: not part of a longer number (e.g. "4%" inside "14%").
      const re = new RegExp(`(^|[^\\d.,])${escapeRe(value)}(?![\\d,])`);
      await expect(page.getByTestId(RESULT_TESTID[key as keyof typeof RESULT_TESTID]).first()).toContainText(re, {
        timeout: 20_000,
      });
    });
  }
});
