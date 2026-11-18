import { test, expect } from '@playwright/test';
import {
  calculateCombinedRating,
  type DisabilityEntry,
} from '../../src/lib/calculations/va-disability';
import { combinePair, combineRatings } from '../../src/lib/calculations/va-combined-table';

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
  test('factor is rounded to a whole number: both arms 30 & 10 → 37 → 40.7 → 41 → 40%', () => {
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

test.describe('VA combined rating — the regulation\'s own example (VA-05)', () => {
  // 38 CFR § 4.26 (eCFR, checked 2026-11-18): "with disabilities evaluated at 60
  // percent, 20 percent, 10 percent and 10 percent (with the two 10 percent
  // evaluations being bilateral disabilities), the order of severity would be
  // 60, 21 and 20. The 60 and 21 combine to 68 percent and the 68 and 20
  // combine to 74 percent, converted to 70 percent".
  test('§ 4.26 example: 60, 20 + bilateral 10/10 → 21 → 68 → 74 → 70%', () => {
    const r = calculateCombinedRating([d(60), d(20), d(10, 'left', 'leg'), d(10, 'right', 'leg')]);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(21);
    expect(r.steps.find((s) => s.type === 'sort')?.detail).toBe('60%, 21%, 20%');
    expect(r.steps.filter((s) => s.type === 'apply').map((s) => s.value)).toEqual([68, 74]);
    expect(r.exact).toBe(74);
    expect(r.rounded).toBe(70);
    expect(r.bilateralException).toBeNull();
  });
});

test.describe('VA combined rating — § 4.26(d) exception (VA-02)', () => {
  test('audit scenario: L knee 10 + R knee 10 + 90 + 30 → 100%, not 90%', () => {
    const r = calculateCombinedRating([d(10, 'left', 'leg'), d(10, 'right', 'leg'), d(90), d(30)]);
    expect(r.rounded).toBe(100);
    expect(r.exact).toBe(95);
    expect(r.bilateralApplied).toBe(false);
    expect(r.bilateralException).not.toBeNull();
    expect(r.bilateralException!.withFactorExact).toBe(94);
    expect(r.bilateralException!.withFactorRounded).toBe(90);
    expect(r.bilateralException!.excluded.map((e) => e.rating)).toEqual([10, 10]);
    // The first step explains why the factor was dropped.
    expect(r.steps[0].type).toBe('bilateral-exception');
    expect(r.steps[0].label).toContain('§ 4.26(d)');
    expect(r.steps[0].detail).toContain('90%');
    expect(r.steps[0].detail).toContain('100%');
  });

  test('the factor stays when it gives the same or a better rating', () => {
    const r = calculateCombinedRating([d(10, 'left', 'arm'), d(10, 'right', 'arm'), d(60)]);
    expect(r.bilateralApplied).toBe(true);
    expect(r.bilateralException).toBeNull();
    expect(r.rounded).toBe(70);
  });

  // Property test: one left + one right rating (left ≥ right) plus up to three
  // other ratings — 15,730 combinations. The result must equal the better of
  // "with the factor" and "without it", computed here independently from the
  // § 4.25 table function.
  test('brute force: never lower than with or without the factor; 15 combinations change', () => {
    const R = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const roundVA = (x: number) => (x >= 95 ? 100 : Math.round(x / 10) * 10);
    const others: number[][] = [[]];
    for (let a = 0; a < R.length; a++) {
      others.push([R[a]]);
      for (let b = a; b < R.length; b++) {
        others.push([R[a], R[b]]);
        for (let c = b; c < R.length; c++) others.push([R[a], R[b], R[c]]);
      }
    }
    let total = 0;
    const lower: string[] = []; // result below the better of with/without the factor
    const changed: string[] = []; // result differs from "factor always applied"
    for (let l = 0; l < R.length; l++) {
      for (let rr = 0; rr <= l; rr++) {
        for (const o of others) {
          total++;
          const bilateral = Math.min(100, Math.floor((combinePair(R[l], R[rr]) * 11 + 5) / 10));
          const withFactor = roundVA(combineRatings([bilateral, ...o]));
          const withoutFactor = roundVA(combineRatings([R[l], R[rr], ...o]));
          const r = calculateCombinedRating([d(R[l], 'left', 'leg'), d(R[rr], 'right', 'leg'), ...o.map((x) => d(x))]);
          const name = `L${R[l]} R${R[rr]} + [${o.join(',')}]`;
          if (r.rounded !== Math.max(withFactor, withoutFactor)) lower.push(`${name}: ${r.rounded} vs ${withFactor}/${withoutFactor}`);
          if (r.rounded !== withFactor) changed.push(`${withFactor}→${r.rounded}`);
        }
      }
    }
    expect(total).toBe(15730);
    expect(lower).toEqual([]);
    // Audit finding: 15 combinations change, every one 94 → 90% becoming 95 → 100%.
    expect(changed).toEqual(Array(15).fill('90→100'));
  });

  test('audit examples: 10/10 + 70/50/50, 20/10 + 80/60, 40/10 + 80/30/20 → 100%', () => {
    const cases: [number, number, number[]][] = [[10, 10, [70, 50, 50]], [20, 10, [80, 60]], [40, 10, [80, 30, 20]]];
    for (const [l, r, o] of cases) {
      const res = calculateCombinedRating([d(l, 'left', 'leg'), d(r, 'right', 'leg'), ...o.map((x) => d(x))]);
      expect(res.rounded, `${l}/${r} + ${o.join(',')}`).toBe(100);
      expect(res.bilateralException?.withFactorRounded).toBe(90);
    }
  });
});

test.describe('VA combined rating — bilateral value capped at 100 (VA-03)', () => {
  test('L arm 100 + R arm 10 → combined value 100, never 110', () => {
    const r = calculateCombinedRating([d(100, 'left', 'arm'), d(10, 'right', 'arm')]);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(100);
    expect(r.exact).toBe(100);
    expect(r.rounded).toBe(100);
    const factor = r.steps.find((s) => s.type === 'bilateral-factor')!;
    expect(factor.value).toBe(100);
    expect(factor.detail).toContain('capped at 100');
    for (const s of r.steps) expect(`${s.label} ${s.detail}`).not.toMatch(/\b(10[1-9]|1[1-9]\d)(\.\d)?%|→ (10[1-9]|1[1-9]\d)\b/);
  });

  test('L leg 90 + R leg 60 + 50 → steps never show a value above 100', () => {
    const r = calculateCombinedRating([d(90, 'left', 'leg'), d(60, 'right', 'leg'), d(50)]);
    expect(r.bilateralPairs[0].combinedAfterFactor).toBe(100);
    expect(r.steps.filter((s) => s.value !== undefined).every((s) => s.value! <= 100)).toBe(true);
    expect(r.exact).toBe(100);
  });
});
