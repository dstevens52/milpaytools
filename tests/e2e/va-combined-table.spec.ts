import { test, expect } from '@playwright/test';
import { combinePair, combineRatings } from '../../src/lib/calculations/va-combined-table';

/**
 * § 4.25 Combined Ratings Table — pure unit tests (direct import, no browser),
 * matching the data-accuracy pattern in tests/e2e/helpers/data.ts.
 *
 * The anchor values below are supplied by the task spec and are the verification
 * surface; they are NOT sourced from memory or the web.
 */

test.describe('combinePair — § 4.25 anchor cells', () => {
  const anchors: Array<[number, number, number]> = [
    [20, 20, 36],
    [36, 10, 42],
    [42, 10, 48],
    [48, 10, 53],
    [53, 10, 58],
    [30, 10, 37],
    [50, 30, 65],
    [70, 60, 88],
    [40, 20, 52],
    [64, 50, 82],
    [82, 30, 87],
    [87, 30, 91],
    [91, 20, 93],
    [93, 10, 94],
    [94, 10, 95],
  ];

  for (const [a, b, expected] of anchors) {
    test(`${a} & ${b} → ${expected}`, () => {
      expect(combinePair(a, b)).toBe(expected);
    });
  }

  test('combining with 0 returns the existing value unchanged', () => {
    for (let a = 0; a <= 100; a += 10) expect(combinePair(a, 0)).toBe(a);
  });

  test('combinePair is order-independent for the fold (commutative result)', () => {
    expect(combinePair(20, 30)).toBe(combinePair(30, 20));
  });
});

test.describe('combineRatings — fold through the table', () => {
  test('Reddit bilateral lower group 20,20,10,10,10,10,0 → 58', () => {
    expect(combineRatings([20, 20, 10, 10, 10, 10, 0])).toBe(58);
  });

  test('multi-group merge 40,30,20,10 → 69', () => {
    expect(combineRatings([40, 30, 20, 10])).toBe(69);
  });

  test('empty list → 0', () => {
    expect(combineRatings([])).toBe(0);
  });
});

/**
 * Half-point audit. The only cells where the round-half-up convention could
 * disagree with the published eCFR table are those whose exact value ends in
 * exactly .5. Enumerate them and confirm each rounds UP. The printed list is
 * included in the change report for manual eCFR verification.
 */
test('half-point audit — every .5 cell rounds half up', () => {
  const ratings = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const cells: string[] = [];

  for (let a = 0; a <= 100; a++) {
    for (const b of ratings) {
      const scaledExact = 100 * a + b * (100 - a); // exact value × 100
      if (((scaledExact % 100) + 100) % 100 === 50) {
        const rounded = combinePair(a, b);
        cells.push(`${a} & ${b} = ${(scaledExact / 100).toFixed(1)} → ${rounded}`);
        expect(rounded).toBe((scaledExact + 50) / 100); // round half UP
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\n=== § 4.25 HALF-POINT CELLS (${cells.length}) ===\n${cells.join('\n')}\n`);
  expect(cells.length).toBeGreaterThan(0);
});
