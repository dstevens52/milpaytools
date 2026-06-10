import { test, expect } from '@playwright/test';
import {
  calculateCombinedRating,
  type DisabilityEntry,
} from '../../src/lib/calculations/va-disability';

/**
 * Engine-level unit tests for the § 4.25 / § 4.26 combined-rating math (direct
 * import, no browser). Expected values are the task-spec anchors only.
 */

let _id = 0;
function d(
  rating: number,
  side: DisabilityEntry['side'] = 'none',
  pairKey: string | null = null
): DisabilityEntry {
  return { id: `e${_id++}`, rating, label: '', side, pairKey };
}

test.describe('VA combined rating — § 4.26 bilateral factor', () => {
  test('§ 4.26 worked example: both arms 30 & 10 → 37 → 40.7 → 41 → 40%', () => {
    const r = calculateCombinedRating([d(30, 'left', 'arm'), d(10, 'right', 'arm')]);
    expect(r.bilateralApplied).toBe(true);
    expect(r.bilateralPairs[0].combinedBeforeFactor).toBe(37);
    expect(r.bilateralPairs[0].factorAddition).toBeCloseTo(3.7, 5);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(41);
    expect(r.exact).toBe(41);
    expect(r.rounded).toBe(40);
  });

  test('prior production example: 10% LUE + 10% RUE + 60% → 21 → combine 60 → 68 → 70%', () => {
    const r = calculateCombinedRating([
      d(10, 'left', 'arm'),
      d(10, 'right', 'arm'),
      d(60),
    ]);
    expect(r.bilateralPairs[0].combinedBeforeFactor).toBe(19);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(21);
    expect(r.exact).toBe(68);
    expect(r.rounded).toBe(70);
  });

  test('§ 4.26(c) multi-group: arms 40/30 + legs 20/10 merge → 69 → 75.9 → 76 → 80%', () => {
    const r = calculateCombinedRating([
      d(40, 'left', 'arm'),
      d(30, 'right', 'arm'),
      d(20, 'left', 'leg'),
      d(10, 'right', 'leg'),
    ]);
    expect(r.bilateralApplied).toBe(true);
    expect(r.bilateralPairs).toHaveLength(1); // ONE merged computation, not per-group
    expect(r.bilateralPairs[0].combinedBeforeFactor).toBe(69);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(76);
    expect(r.exact).toBe(76);
    expect(r.rounded).toBe(80);
  });
});

test.describe('VA combined rating — Reddit failure case', () => {
  // 50, 30, 30, 20, 10, 10 non-bilateral + bilateral lower group 20,20,10,10,10,10,0
  const nonBilateral = [d(50), d(30), d(30), d(20), d(10), d(10)];
  const legGroup = (zeroOrTen: number) => [
    d(20, 'left', 'leg'),
    d(20, 'right', 'leg'),
    d(10, 'left', 'leg'),
    d(10, 'right', 'leg'),
    d(10, 'left', 'leg'),
    d(10, 'right', 'leg'),
    d(zeroOrTen, 'left', 'leg'),
  ];

  test('full case → bilateral 58 → 64 → chain ends 95 → 100%', () => {
    const r = calculateCombinedRating([...nonBilateral, ...legGroup(0)]);
    expect(r.bilateralPairs[0].combinedBeforeFactor).toBe(58);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(64);
    expect(r.exact).toBe(95);
    expect(r.rounded).toBe(100);
  });

  test('0% member replaced by 10% → bilateral 62 → 68 → chain ends 96 → 100%', () => {
    const r = calculateCombinedRating([...nonBilateral, ...legGroup(10)]);
    expect(r.bilateralPairs[0].combinedBeforeFactor).toBe(62);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(68);
    expect(r.exact).toBe(96);
    expect(r.rounded).toBe(100);
  });
});

test.describe('VA combined rating — non-bilateral and edge behavior', () => {
  test('50 + 30 → 65 → 70%', () => {
    const r = calculateCombinedRating([d(50), d(30)]);
    expect(r.bilateralApplied).toBe(false);
    expect(r.exact).toBe(65);
    expect(r.rounded).toBe(70);
  });

  test('single 10% → 10%', () => {
    const r = calculateCombinedRating([d(10)]);
    expect(r.exact).toBe(10);
    expect(r.rounded).toBe(10);
  });

  test('empty → 0%', () => {
    const r = calculateCombinedRating([]);
    expect(r.exact).toBe(0);
    expect(r.rounded).toBe(0);
  });

  test('0% members never change the result', () => {
    const base = calculateCombinedRating([d(50), d(30)]);
    const withZeros = calculateCombinedRating([d(50), d(30), d(0), d(0)]);
    expect(withZeros.exact).toBe(base.exact);
    expect(withZeros.rounded).toBe(base.rounded);
  });

  test('same-side conditions do NOT trigger the factor (three left legs → ordinary combine)', () => {
    const r = calculateCombinedRating([
      d(30, 'left', 'leg'),
      d(30, 'left', 'leg'),
      d(30, 'left', 'leg'),
    ]);
    expect(r.bilateralApplied).toBe(false);
    expect(r.exact).toBe(66); // 30 & 30 → 51, 51 & 30 → 66
    expect(r.rounded).toBe(70);
  });

  test('one-sided 0% does not qualify a group (left 30 + right 0 → no factor)', () => {
    const r = calculateCombinedRating([d(30, 'left', 'leg'), d(0, 'right', 'leg')]);
    expect(r.bilateralApplied).toBe(false);
    expect(r.exact).toBe(30);
    expect(r.rounded).toBe(30);
  });
});
