import { test, expect } from '@playwright/test';
// In-process unit tests for the HUD SAFMR rent data layer (no server needed).
import { getFMR, getFMRRange, getFMRDetail, FMR_DATA_YEAR } from '../../src/lib/calculations/fmr';
import { MHA_FMR_2026 } from '../../src/data/bah/fmr/fmr2026';

// Verified against an independent recompute from the HUD SAFMR xlsx (0 drift on
// p25/median/p75 across all 338 MHAs; medians byte-identical to the prior median-
// only generation — see scripts/build-fmr-data.py). These lock the data file to
// the verified source — any future regeneration that drifts will fail here.
const SPOT_2BR_MEDIAN: Record<string, { median: number; zipsCovered: number }> = {
  VA298: { median: 1770, zipsCovered: 63 },  // Norfolk/Portsmouth, VA
  TX285: { median: 1410, zipsCovered: 111 }, // San Antonio, TX
  CA038: { median: 3000, zipsCovered: 154 }, // San Diego, CA
  WA311: { median: 1970, zipsCovered: 87 },  // Tacoma, WA
  NC182: { median: 1140, zipsCovered: 65 },  // Fort Bragg/Pope, NC
  HI408: { median: 2640, zipsCovered: 60 },  // Honolulu County, HI
  OK237: { median: 1000, zipsCovered: 15 },  // Fort Sill/Lawton, OK (rural)
  ND191: { median: 1120, zipsCovered: 21 },  // Minot AFB, ND (rural)
  MO163: { median: 925, zipsCovered: 32 },   // Fort Leonard Wood, MO (rural)
};

test.describe('FMR data layer — getFMR / getFMRRange / data integrity', () => {
  test('2BR median + zipsCovered match the verified SAFMR values', () => {
    for (const [mha, exp] of Object.entries(SPOT_2BR_MEDIAN)) {
      expect(getFMR(mha, 2)).toBe(exp.median);
      expect(getFMRDetail(mha)!.zipsCovered).toBe(exp.zipsCovered);
    }
  });

  test('getFMR returns the median; getFMRRange returns the full p25/median/p75', () => {
    // Norfolk is SAFMR-designated → a real spread.
    expect(getFMRRange('VA298', 2)).toEqual({ p25: 1590, median: 1770, p75: 1990 });
    expect(getFMR('VA298', 2)).toBe(1770);
    // Fort Sill (rural).
    expect(getFMRRange('OK237', 2)).toEqual({ p25: 985, median: 1000, p75: 1120 });
  });

  test('default bedrooms is 2BR for both accessors', () => {
    expect(getFMR('VA298')).toBe(getFMR('VA298', 2));
    expect(getFMRRange('VA298')).toEqual(getFMRRange('VA298', 2));
  });

  test('each bedroom size resolves correctly (San Diego CA038)', () => {
    const e = getFMRDetail('CA038')!;
    for (const b of [0, 1, 2, 3, 4] as const) {
      expect(getFMRRange('CA038', b)).toEqual(e[`br${b}` as const]);
      expect(getFMR('CA038', b)).toBe(e[`br${b}` as const].median);
    }
    expect(getFMRRange('CA038', 4)).toEqual({ p25: 4840, median: 4840, p75: 5390 });
  });

  test('omit path: unknown MHA → null (graceful, all accessors + bedrooms)', () => {
    expect(getFMR('ZZ999')).toBeNull();
    expect(getFMR('ZZ999', 0)).toBeNull();
    expect(getFMRRange('ZZ999')).toBeNull();
    expect(getFMRDetail('ZZ999')).toBeNull();
    // XX499 (territory) is never an FMR entry — OHA, not BAH.
    expect(getFMR('XX499')).toBeNull();
  });

  test('every entry is structurally sound (p25 ≤ median ≤ p75, positive integers, tag)', () => {
    const codes = Object.keys(MHA_FMR_2026);
    expect(codes.length).toBe(338);
    for (const code of codes) {
      const e = MHA_FMR_2026[code];
      for (const k of ['br0', 'br1', 'br2', 'br3', 'br4'] as const) {
        const r = e[k];
        for (const p of [r.p25, r.median, r.p75]) {
          expect(Number.isInteger(p)).toBe(true);
          expect(p).toBeGreaterThan(0);
        }
        expect(r.p25).toBeLessThanOrEqual(r.median);
        expect(r.median).toBeLessThanOrEqual(r.p75);
      }
      expect(e.zipsCovered).toBeGreaterThan(0);
      expect(e.method).toBe('safmr-zip-pctile');
    }
  });

  test('data year tag', () => {
    expect(FMR_DATA_YEAR).toBe('2026');
  });
});
