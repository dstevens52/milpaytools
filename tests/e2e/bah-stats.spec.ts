import { test, expect } from '@playwright/test';
// In-process unit tests for the build-time BAH stats layer (no server needed).
import {
  nationalMedianBAH,
  mhaPercentile,
  yoyForGrade,
  siblingInstallations,
  nearbyDeltas,
} from '../../src/lib/calculations/bahStats';
import { getNationalAverages, getMHARatesForYear, getMHACode } from '../../src/lib/calculations/bah';
import { STATION_BY_SLUG } from '../../src/data/duty-stations/stations';
import { BAH_EXPECTED as X, yoy } from './fixtures/bah-expected';

const NC182 = getMHACode(STATION_BY_SLUG['fort-bragg'].zip)!; // Fort Bragg
const CA038 = getMHACode(STATION_BY_SLUG['naval-station-san-diego'].zip)!; // San Diego
const VA298 = getMHACode(STATION_BY_SLUG['naval-station-norfolk'].zip)!; // Norfolk

test.describe('bahStats — nationalMedianBAH', () => {
  test('matches getNationalAverages() (true median) across grades + dependency', () => {
    const avgs = getNationalAverages();
    for (const grade of ['E-1', 'E-5', 'E-7', 'O-3', 'O-5', 'W-3']) {
      expect(nationalMedianBAH(grade, true)).toBe(avgs.w[grade]);
      expect(nationalMedianBAH(grade, false)).toBe(avgs.wo[grade]);
    }
  });

  test(`known anchor (${X.year}): E-5 national median with/without dependents`, () => {
    expect(nationalMedianBAH('E-5', true)).toBe(X.nationalMedianE5W);
    expect(nationalMedianBAH('E-5', false)).toBe(X.nationalMedianE5WO);
  });
});

test.describe('bahStats — mhaPercentile', () => {
  // 2026: was 221 / 65% on the January tables. TX270 (Abilene) E-5 w/dep rose $1,554 → $1,872
  // on 2026-05-16, passing Fort Bragg's $1,806, so 221 MHAs are now above Fort Bragg.
  test(`Fort Bragg E-5 w/dep national rank (${X.year} fixture)`, () => {
    expect(NC182).toBe(X.bragg.mha);
    const p = mhaPercentile(NC182, 'E-5', true);
    expect(p).not.toBeNull();
    expect(p!.rankFromTop).toBe(X.bragg.nationalRankE5W);
    expect(p!.total).toBe(X.mhaCount);
    expect(p!.topPercent).toBe(X.bragg.nationalTopPercentE5W);
  });

  test('San Diego (CA038) is near the very top (top ≤ 5%)', () => {
    const p = mhaPercentile(CA038, 'E-5', true)!;
    expect(p.rankFromTop).toBeLessThanOrEqual(20);
    expect(p.topPercent).toBeLessThanOrEqual(5);
  });

  test('invariants: rank in [1,total], topPercent in [1,100]', () => {
    for (const mha of [NC182, CA038, VA298]) {
      const p = mhaPercentile(mha, 'O-3', false)!;
      expect(p.rankFromTop).toBeGreaterThanOrEqual(1);
      expect(p.rankFromTop).toBeLessThanOrEqual(p.total);
      expect(p.topPercent).toBeGreaterThanOrEqual(1);
      expect(p.topPercent).toBeLessThanOrEqual(100);
    }
  });

  test('unknown MHA → null (graceful)', () => {
    expect(mhaPercentile('ZZ999', 'E-5', true)).toBeNull();
  });
});

test.describe('bahStats — yoyForGrade', () => {
  test(`Fort Bragg E-5 w/dep YoY ${X.priorYear} → ${X.year}`, () => {
    const y = yoyForGrade(NC182, 'E-5', true)!;
    const e = yoy(X.bragg.e5W, X.bragg.priorE5W);
    expect(y.prior).toBe(X.bragg.priorE5W);
    expect(y.current).toBe(X.bragg.e5W);
    expect(y.abs).toBe(e.abs);
    expect(y.pct).toBeCloseTo(e.pct, 2);
  });

  test('unknown MHA → null (graceful)', () => {
    expect(yoyForGrade('ZZ999', 'E-5', true)).toBeNull();
  });
});

test.describe('bahStats — siblingInstallations', () => {
  test('Norfolk (VA298) shares its MHA with Little Creek + Oceana', () => {
    const slugs = siblingInstallations(VA298, 'naval-station-norfolk').map((s) => s.slug);
    expect(slugs).toContain('joint-base-little-creek-fort-story');
    expect(slugs).toContain('naval-air-station-oceana');
    expect(slugs).not.toContain('naval-station-norfolk'); // self excluded
  });

  test('siblings genuinely receive identical BAH (same MHA rate)', () => {
    const norfolkE5 = getMHARatesForYear(VA298, true)!['E-5'];
    for (const sib of siblingInstallations(VA298, 'naval-station-norfolk')) {
      const sibMha = getMHACode(STATION_BY_SLUG[sib.slug].zip)!;
      expect(getMHARatesForYear(sibMha, true)!['E-5']).toBe(norfolkE5);
    }
  });
});

test.describe('bahStats — nearbyDeltas', () => {
  test('Fort Bragg nearby deltas vs base (E-5 w/dep)', () => {
    const map = Object.fromEntries(nearbyDeltas('fort-bragg').map((d) => [d.slug, d]));
    for (const [slug, delta] of Object.entries(X.bragg.nearbyE5WDelta)) {
      expect(map[slug].e5Delta).toBe(delta);
      // delta = nearby − base
      expect(map[slug].e5Rate! - X.bragg.e5W).toBe(delta);
    }
  });

  test('unknown slug → [] (graceful)', () => {
    expect(nearbyDeltas('not-a-real-station')).toEqual([]);
  });
});

// ─── Phase 1.5: YoY framing additions ───────────────────────────────────────
import {
  hasRateDecrease,
  nationalIncreaseComparison,
  NATIONAL_AVG_BAH_INCREASE,
} from '../../src/lib/calculations/bahStats';

const TX285 = getMHACode(STATION_BY_SLUG['joint-base-san-antonio'].zip)!; // E-5 w/dep fell

test.describe('bahStats — hasRateDecrease', () => {
  test(`matches the ${X.year} fixture (Fort Bragg, San Antonio, Norfolk)`, () => {
    expect(hasRateDecrease(NC182)).toBe(X.bragg.hasDecrease);
    expect(hasRateDecrease(TX285)).toBe(X.sanAntonio.hasDecrease);
    expect(hasRateDecrease(VA298)).toBe(X.norfolk.hasDecrease);
  });
  test('graceful: unknown MHA and prior year → false', () => {
    expect(hasRateDecrease('ZZ999')).toBe(false);
    expect(hasRateDecrease(NC182, X.priorYear as Parameters<typeof hasRateDecrease>[1])).toBe(false);
  });
});

test.describe('bahStats — annualized YoY impact (abs × 12)', () => {
  test('Fort Bragg E-5 w/dep annualized change', () => {
    const y = yoyForGrade(NC182, 'E-5', true)!;
    expect(Math.abs(y.abs) * 12).toBe(yoy(X.bragg.e5W, X.bragg.priorE5W).annual); // 2026: +$21/mo → $252
  });
  test('San Antonio E-5 w/dep annualized change', () => {
    const y = yoyForGrade(TX285, 'E-5', true)!;
    const e = yoy(X.sanAntonio.e5W, X.sanAntonio.priorE5W);
    expect(Math.sign(y.abs)).toBe(Math.sign(e.abs)); // 2026: it fell
    expect(Math.abs(y.abs) * 12).toBe(e.annual); // 2026: −$66/mo → $792
  });
});

test.describe('bahStats — nationalIncreaseComparison', () => {
  test(`constant is the official DoD figure for ${X.year}`, () => {
    expect(NATIONAL_AVG_BAH_INCREASE[X.year]).toBe(X.nationalAvgIncreasePct);
    // The 2026 figure stays registered after the flip.
    expect(NATIONAL_AVG_BAH_INCREASE['2026']).toBe(4.2);
  });
  // Tolerance logic, pinned to the 2026 figure (4.2%) so it holds after a BAH-year flip.
  test('above / below / in-line with ±0.3 tolerance', () => {
    expect(nationalIncreaseComparison(4.516, '2026')!.relation).toBe('above'); // Norfolk
    expect(nationalIncreaseComparison(1.176, '2026')!.relation).toBe('below'); // Fort Bragg
    expect(nationalIncreaseComparison(-3.41, '2026')!.relation).toBe('below'); // a decrease
    expect(nationalIncreaseComparison(4.3, '2026')!.relation).toBe('in line with'); // diff 0.1
    expect(nationalIncreaseComparison(4.5, '2026')!.relation).toBe('in line with'); // diff exactly 0.3
    expect(nationalIncreaseComparison(4.51, '2026')!.relation).toBe('above'); // diff 0.31
    expect(nationalIncreaseComparison(3.9, '2026')!.relation).toBe('in line with'); // diff −0.3
    expect(nationalIncreaseComparison(3.89, '2026')!.relation).toBe('below'); // diff −0.31
  });
  test('returns the national pct + null for years without a figure', () => {
    expect(nationalIncreaseComparison(5, '2026')!.nationalPct).toBe(4.2);
    expect(nationalIncreaseComparison(5, '2099')).toBeNull();
  });
});
