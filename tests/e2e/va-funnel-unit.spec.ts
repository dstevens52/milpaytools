/**
 * V3b VA funnel — no browser or server. Run with:
 *   npm run test:va-funnel
 *
 * - fireDeepLinkEvent sends calc_deeplink_click with the V3b sources, targets and
 *   placements (window.gtag replaced by a recorder, as ga-events.spec.ts does in
 *   the browser).
 * - The result-card link (vaLoanBahHref).
 * - /bah reads dep= as an alias for dependents= (parseDependents).
 */

import { test, expect } from '@playwright/test';
import { fireDeepLinkEvent } from '../../src/lib/analytics';
import { vaLoanBahHref } from '../../src/lib/vaFunnel';
import { parseDependents } from '../../src/lib/urlParams';

type Call = unknown[];

/** A browser-like global with a recording gtag; returns the recorded calls. */
function recordGa(optedOut = false): Call[] {
  const calls: Call[] = [];
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = { gtag: (...a: unknown[]) => calls.push(a) };
  g.localStorage = { getItem: (k: string) => (optedOut && k === 'milpaytools_disable_analytics' ? 'true' : null) };
  return calls;
}

test.afterEach(() => {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.localStorage;
});

test.describe('fireDeepLinkEvent — V3b sources', () => {
  const CASES: [Parameters<typeof fireDeepLinkEvent>, Record<string, string>][] = [
    [
      ['bah-calculator', 'va-loan', { grade: 'E-5', placement: 'result-card' }],
      { from_page_type: 'bah-calculator', to_calculator: 'va-loan', grade: 'e5', placement: 'result-card' },
    ],
    [
      ['pcs-calculator', 'va-loan', { grade: 'O-1E', placement: 'result-card' }],
      { from_page_type: 'pcs-calculator', to_calculator: 'va-loan', grade: 'o1e', placement: 'result-card' },
    ],
    [
      ['va-disability-calculator', 'va-loan', { placement: 'result-card' }],
      { from_page_type: 'va-disability-calculator', to_calculator: 'va-loan', placement: 'result-card' },
    ],
    [['blog', 'va-loan', { placement: 'contextual' }], { from_page_type: 'blog', to_calculator: 'va-loan', placement: 'contextual' }],
    [['bah-hub', 'va-loan', { placement: 'contextual' }], { from_page_type: 'bah-hub', to_calculator: 'va-loan', placement: 'contextual' }],
    [['guide', 'va-refinance', { placement: 'hub' }], { from_page_type: 'guide', to_calculator: 'va-refinance', placement: 'hub' }],
  ];

  for (const [args, expected] of CASES) {
    test(`${args[0]} → ${args[1]} (${args[2]?.placement})`, () => {
      const calls = recordGa();
      fireDeepLinkEvent(...args);
      expect(calls).toEqual([['event', 'calc_deeplink_click', expected]]);
    });
  }

  test('opted out: nothing sent', () => {
    const calls = recordGa(true);
    fireDeepLinkEvent('bah-calculator', 'va-loan', { grade: 'E-5', placement: 'result-card' });
    expect(calls).toEqual([]);
  });
});

test.describe('result-card link', () => {
  test('vaLoanBahHref: bah on, ZIP, short grade, dep', () => {
    expect(vaLoanBahHref('78234', 'E-5', true)).toBe('/calculators/va-loan?bah=yes&zip=78234&rank=e5&dep=yes');
    expect(vaLoanBahHref('28310', 'O-3E', false)).toBe('/calculators/va-loan?bah=yes&zip=28310&rank=o3e&dep=no');
  });
});

test.describe('/bah dependents: dep= alias', () => {
  test('dependents alone, dep alone, neither', () => {
    expect(parseDependents('yes', null)).toBe(true);
    expect(parseDependents('no', null)).toBe(false);
    expect(parseDependents(null, 'yes')).toBe(true);
    expect(parseDependents(null, 'no')).toBe(false);
    expect(parseDependents(null, '1')).toBe(true);
    expect(parseDependents(null, null)).toBe(null);
    expect(parseDependents(null, 'maybe')).toBe(null);
  });

  test('dependents wins when both are set', () => {
    expect(parseDependents('no', 'yes')).toBe(false);
    expect(parseDependents('yes', 'no')).toBe(true);
    // An unreadable dependents value falls back to dep.
    expect(parseDependents('maybe', 'yes')).toBe(true);
  });
});
