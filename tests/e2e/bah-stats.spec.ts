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

  test('known anchor: E-5 with dependents = $2,061', () => {
    expect(nationalMedianBAH('E-5', true)).toBe(2061);
    expect(nationalMedianBAH('E-5', false)).toBe(1670);
  });
});

test.describe('bahStats — mhaPercentile', () => {
  test('Fort Bragg (NC182) E-5 w/dep ranks 221 of 338 (top 65%)', () => {
    const p = mhaPercentile(NC182, 'E-5', true);
    expect(p).not.toBeNull();
    expect(p!.rankFromTop).toBe(221);
    expect(p!.total).toBe(338);
    expect(p!.topPercent).toBe(65);
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
  test('Fort Bragg E-5 w/dep: $1,785 → $1,806 = +$21 (+1.2%)', () => {
    const y = yoyForGrade(NC182, 'E-5', true)!;
    expect(y.prior).toBe(1785);
    expect(y.current).toBe(1806);
    expect(y.abs).toBe(21);
    expect(y.pct).toBeCloseTo(1.176, 2);
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
  test('Fort Bragg nearby deltas vs base ($1,806 E-5 w/dep)', () => {
    const map = Object.fromEntries(nearbyDeltas('fort-bragg').map((d) => [d.slug, d]));
    expect(map['seymour-johnson-afb'].e5Delta).toBe(-285);
    expect(map['camp-lejeune'].e5Delta).toBe(-222);
    expect(map['marine-corps-air-station-cherry-point'].e5Delta).toBe(45);
    // delta = nearby − base, and base E-5 = 1806
    expect(map['seymour-johnson-afb'].e5Rate! - 1806).toBe(map['seymour-johnson-afb'].e5Delta);
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
  test('true where a grade fell (Fort Bragg NC182, San Antonio TX285)', () => {
    expect(hasRateDecrease(NC182)).toBe(true);
    expect(hasRateDecrease(TX285)).toBe(true);
  });
  test('false for a clean-increase MHA (Norfolk VA298)', () => {
    expect(hasRateDecrease(VA298)).toBe(false);
  });
  test('graceful: unknown MHA and prior year → false', () => {
    expect(hasRateDecrease('ZZ999')).toBe(false);
    expect(hasRateDecrease(NC182, '2025')).toBe(false);
  });
});

test.describe('bahStats — annualized YoY impact (abs × 12)', () => {
  test('Fort Bragg E-5 w/dep increase → $252/yr', () => {
    const y = yoyForGrade(NC182, 'E-5', true)!;
    expect(Math.abs(y.abs) * 12).toBe(252); // +$21/mo
  });
  test('San Antonio E-5 w/dep decrease → $792/yr', () => {
    const y = yoyForGrade(TX285, 'E-5', true)!;
    expect(y.abs).toBeLessThan(0); // it fell
    expect(Math.abs(y.abs) * 12).toBe(792); // −$66/mo
  });
});

test.describe('bahStats — nationalIncreaseComparison (official 4.2% for 2026)', () => {
  test('constant is the official DTMO figure', () => {
    expect(NATIONAL_AVG_BAH_INCREASE['2026']).toBe(4.2);
  });
  test('above / below / in-line with ±0.3 tolerance', () => {
    expect(nationalIncreaseComparison(4.516)!.relation).toBe('above'); // Norfolk
    expect(nationalIncreaseComparison(1.176)!.relation).toBe('below'); // Fort Bragg
    expect(nationalIncreaseComparison(-3.41)!.relation).toBe('below'); // a decrease
    expect(nationalIncreaseComparison(4.3)!.relation).toBe('in line with'); // diff 0.1
    expect(nationalIncreaseComparison(4.5)!.relation).toBe('in line with'); // diff exactly 0.3
    expect(nationalIncreaseComparison(4.51)!.relation).toBe('above'); // diff 0.31
    expect(nationalIncreaseComparison(3.9)!.relation).toBe('in line with'); // diff −0.3
    expect(nationalIncreaseComparison(3.89)!.relation).toBe('below'); // diff −0.31
  });
  test('returns the national pct + null for years without a figure', () => {
    expect(nationalIncreaseComparison(5, '2026')!.nationalPct).toBe(4.2);
    expect(nationalIncreaseComparison(5, '2099')).toBeNull();
  });
});
