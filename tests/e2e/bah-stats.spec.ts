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
