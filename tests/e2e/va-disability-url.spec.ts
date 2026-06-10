import { test, expect } from '@playwright/test';
import {
  serializeVADisabilityState,
  parseVADisabilityState,
  DEFAULT_DEPS,
  type VADisabilityShareState,
} from '../../src/lib/calculations/va-disability-url';
import { calculateCombinedRating } from '../../src/lib/calculations/va-disability';

/**
 * Pure serialize/parse unit tests for the VA disability share URL.
 *
 * These import the logic directly (no browser/page) — the same pattern the
 * data-accuracy specs use via tests/e2e/helpers/data.ts. They run under the
 * existing Playwright runner so no extra test tooling is needed.
 */

function state(
  disabilities: VADisabilityShareState['disabilities'],
  deps: Partial<VADisabilityShareState['deps']> = {}
): VADisabilityShareState {
  return { disabilities, deps: { ...DEFAULT_DEPS, ...deps } };
}

test.describe('VA disability URL — round-trip', () => {
  test('full state with bilateral pair, labels, and dependents', () => {
    const s = state(
      [
        { rating: 10, label: 'left knee', side: 'left', pairKey: 'leg' },
        { rating: 10, label: 'right knee', side: 'right', pairKey: 'leg' },
        { rating: 60, label: 'ptsd', side: 'none', pairKey: null },
      ],
      { hasSpouse: true, childrenUnder18: 2, schoolChildren: 1, dependentParents: 0 }
    );

    const url = serializeVADisabilityState(s);
    const parsed = parseVADisabilityState('?' + url);

    expect(parsed).not.toBeNull();
    expect(parsed!.disabilities).toEqual(s.disabilities);
    expect(parsed!.deps).toEqual(s.deps);
  });

  test('all body locations round-trip', () => {
    const s = state([
      { rating: 10, label: '', side: 'left', pairKey: 'arm' },
      { rating: 20, label: '', side: 'right', pairKey: 'arm' },
      { rating: 30, label: '', side: 'left', pairKey: 'leg' },
      { rating: 40, label: '', side: 'right', pairKey: 'leg' },
      { rating: 70, label: '', side: 'none', pairKey: null },
    ]);

    const parsed = parseVADisabilityState('?' + serializeVADisabilityState(s));
    expect(parsed!.disabilities).toEqual(s.disabilities);
  });

  test('labels with embedded commas survive (encoded)', () => {
    const s = state([
      { rating: 50, label: 'back, lower', side: 'none', pairKey: null },
      { rating: 30, label: 'knee', side: 'none', pairKey: null },
    ]);

    const url = serializeVADisabilityState(s);
    // Comma inside a label must be encoded so positional splitting is safe.
    expect(url).toContain('back%2C%20lower');

    const parsed = parseVADisabilityState('?' + url);
    expect(parsed!.disabilities).toEqual(s.disabilities);
  });

  test('empty interior label positions are preserved', () => {
    const s = state([
      { rating: 10, label: 'knee', side: 'none', pairKey: null },
      { rating: 10, label: '', side: 'none', pairKey: null },
      { rating: 60, label: 'ptsd', side: 'none', pairKey: null },
    ]);

    const url = serializeVADisabilityState(s);
    expect(url).toContain('l=knee,,ptsd');

    const parsed = parseVADisabilityState('?' + url);
    expect(parsed!.disabilities).toEqual(s.disabilities);
  });
});

test.describe('VA disability URL — serialization rules', () => {
  test('default dependents and non-bilateral ratings produce a short URL', () => {
    const s = state([
      { rating: 10, label: '', side: 'none', pairKey: null },
      { rating: 60, label: '', side: 'none', pairKey: null },
    ]);
    expect(serializeVADisabilityState(s)).toBe('r=10,60');
  });

  test('omits dependent params at default values, keeps non-defaults', () => {
    const s = state(
      [{ rating: 40, label: '', side: 'none', pairKey: null }],
      { hasSpouse: true, childrenUnder18: 0, schoolChildren: 2, dependentParents: 0 }
    );
    expect(serializeVADisabilityState(s)).toBe('r=40&sp=1&cs=2');
  });

  test('re-serialization is stable', () => {
    const s = state(
      [
        { rating: 10, label: 'a', side: 'left', pairKey: 'arm' },
        { rating: 10, label: '', side: 'right', pairKey: 'arm' },
        { rating: 60, label: 'b', side: 'none', pairKey: null },
      ],
      { hasSpouse: true, childrenUnder18: 1 }
    );
    const once = serializeVADisabilityState(s);
    const twice = serializeVADisabilityState(parseVADisabilityState('?' + once)!);
    expect(twice).toBe(once);
  });

  test('truncates labels to 30 characters', () => {
    const long = 'x'.repeat(50);
    const s = state([{ rating: 50, label: long, side: 'none', pairKey: null }]);
    const parsed = parseVADisabilityState('?' + serializeVADisabilityState(s));
    expect(parsed!.disabilities[0].label).toBe('x'.repeat(30));
  });
});

test.describe('VA disability URL — legacy compatibility', () => {
  test('legacy ?ratings=10,10,60 parses to three non-bilateral ratings', () => {
    const parsed = parseVADisabilityState('?ratings=10,10,60');
    expect(parsed!.disabilities).toEqual([
      { rating: 10, label: '', side: 'none', pairKey: null },
      { rating: 10, label: '', side: 'none', pairKey: null },
      { rating: 60, label: '', side: 'none', pairKey: null },
    ]);
    expect(parsed!.deps).toEqual(DEFAULT_DEPS);
  });

  test('legacy encoded commas (%2C) parse correctly', () => {
    const parsed = parseVADisabilityState('?ratings=10%2C10%2C60');
    expect(parsed!.disabilities.map((d) => d.rating)).toEqual([10, 10, 60]);
  });

  test('new r= takes precedence over a stray legacy ratings=', () => {
    const parsed = parseVADisabilityState('?r=50.lue&ratings=10,20');
    expect(parsed!.disabilities).toEqual([
      { rating: 50, label: '', side: 'left', pairKey: 'arm' },
    ]);
  });
});

test.describe('VA disability URL — malformed input degrades gracefully', () => {
  test('returns null for an unrelated query string', () => {
    expect(parseVADisabilityState('?foo=bar')).toBeNull();
    expect(parseVADisabilityState('')).toBeNull();
  });

  test('invalid rating values are skipped', () => {
    const parsed = parseVADisabilityState('?r=15,abc,60,200');
    expect(parsed!.disabilities.map((d) => d.rating)).toEqual([60]);
  });

  test('unknown location code falls back to Other / Non-bilateral', () => {
    const parsed = parseVADisabilityState('?r=50.zzz');
    expect(parsed!.disabilities).toEqual([
      { rating: 50, label: '', side: 'none', pairKey: null },
    ]);
  });

  test('negative and oversized dependent counts clamp to range', () => {
    const parsed = parseVADisabilityState('?r=50&c=-3&cs=99&dp=7');
    expect(parsed!.deps).toEqual({
      hasSpouse: false,
      childrenUnder18: 0, // -3 clamps up to 0
      schoolChildren: 5, // 99 clamps down to 5
      dependentParents: 2, // 7 clamps down to 2
    });
  });

  test('does not throw on a malformed percent-encoded label', () => {
    const parsed = parseVADisabilityState('?r=50&l=%E0%A4%A');
    expect(parsed!.disabilities).toHaveLength(1);
  });
});

test.describe('VA disability URL — retired eye locations (backward compat)', () => {
  test('legacy ?r=30.le,20.re loads two non-bilateral conditions', () => {
    const parsed = parseVADisabilityState('?r=30.le,20.re');
    expect(parsed!.disabilities).toEqual([
      { rating: 30, label: '', side: 'none', pairKey: null },
      { rating: 20, label: '', side: 'none', pairKey: null },
    ]);
  });

  test('le/re conditions receive NO bilateral factor', () => {
    const parsed = parseVADisabilityState('?r=30.le,20.re');
    const entries = parsed!.disabilities.map((dis, i) => ({ id: `eye${i}`, ...dis }));
    const r = calculateCombinedRating(entries);
    expect(r.bilateralApplied).toBe(false);
    // Ordinary combine: 30 & 20 → 44. With the (removed) eye factor it would be ~48.
    expect(r.exact).toBe(44);
  });
});
