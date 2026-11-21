/**
 * V3b VA funnel — no browser or server. Run with:
 *   npm run test:va-funnel
 *
 * - fireDeepLinkEvent sends calc_deeplink_click with the V3b sources, targets and
 *   placements (window.gtag replaced by a recorder, as ga-events.spec.ts does in
 *   the browser).
 * - The result-card link (vaLoanBahHref) and its CONUS test (isConusMha).
 */

import { test, expect } from '@playwright/test';
import { fireDeepLinkEvent } from '../../src/lib/analytics';
import { isConusMha, vaLoanBahHref } from '../../src/lib/vaFunnel';

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

  test('isConusMha: CONUS yes; Alaska, Hawaii, none no', () => {
    expect(isConusMha('TX279')).toBe(true);
    expect(isConusMha('NC178')).toBe(true);
    expect(isConusMha('AK404')).toBe(false);
    expect(isConusMha('HI408')).toBe(false);
    expect(isConusMha(null)).toBe(false);
    expect(isConusMha(undefined)).toBe(false);
    expect(isConusMha('')).toBe(false);
  });
});
