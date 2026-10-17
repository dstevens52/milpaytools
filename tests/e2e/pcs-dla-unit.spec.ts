import { test, expect } from '@playwright/test';
import { PCS_RATES_2026 } from '../../src/data/pcs/2026/constants';

// DLA primary rates effective January 1, 2026 — PDTATAC, "UTD for MAP 72-25(I),
// CY2026 Dislocation Allowance (DLA) Rates". Table supplied by Dan, verified
// against the official PDF on 2026-10-17. Unit test: no page is opened.

const OFFICIAL: Record<string, { without: number; with: number }> = {
  'O-10': { without: 5187.33, with: 6385.58 },
  'O-9': { without: 5187.33, with: 6385.58 },
  'O-8': { without: 5187.33, with: 6385.58 },
  'O-7': { without: 5187.33, with: 6385.58 },
  'O-6': { without: 4758.96, with: 5749.63 },
  'O-5': { without: 4583.51, with: 5542.06 },
  'O-4': { without: 4247.61, with: 4885.43 },
  'O-3': { without: 3404.11, with: 4041.88 },
  'O-2': { without: 2700.31, with: 3451.28 },
  'O-1': { without: 2273.82, with: 3085.23 },
  'O-3E': { without: 3675.83, with: 4343.8 },
  'O-2E': { without: 3124.87, with: 3919.27 },
  'O-1E': { without: 2687.09, with: 3621.1 },
  'W-5': { without: 4315.51, with: 4715.58 },
  'W-4': { without: 3832.45, with: 4323.11 },
  'W-3': { without: 3221.08, with: 3960.78 },
  'W-2': { without: 2860.7, with: 3643.75 },
  'W-1': { without: 2394.55, with: 3151.31 },
  'E-9': { without: 3147.54, with: 4149.51 },
  'E-8': { without: 2888.97, with: 3824.94 },
  'E-7': { without: 2468.19, with: 3551.31 },
  'E-6': { without: 2389.42, with: 3548.02 },
  'E-5': { without: 2389.42, with: 3548.02 },
  'E-4': { without: 2389.42, with: 3548.02 },
  'E-3': { without: 2355.48, with: 3548.02 },
  'E-2': { without: 2025.26, with: 3548.02 },
  'E-1': { without: 1870.58, with: 3548.02 },
};

const { withDependents, withoutDependents } = PCS_RATES_2026.dla;

test.describe('DLA 2026 rates match the official table', () => {
  test('every grade in the code matches the official table exactly', () => {
    const codeGrades = [...new Set([...Object.keys(withDependents), ...Object.keys(withoutDependents)])];
    expect(codeGrades.length).toBeGreaterThan(0); // an empty table would pass the loop below
    const mismatches: string[] = [];
    for (const g of codeGrades) {
      const o = OFFICIAL[g];
      if (!o) {
        mismatches.push(`${g}: in code, not in the official table`);
        continue;
      }
      if (withDependents[g] !== o.with) mismatches.push(`${g} with: code ${withDependents[g]} ≠ official ${o.with}`);
      if (withoutDependents[g] !== o.without) mismatches.push(`${g} without: code ${withoutDependents[g]} ≠ official ${o.without}`);
    }
    expect(mismatches).toEqual([]);
  });

  test('grades in the official table but not in the code are exactly O-1E, O-2E, O-3E', () => {
    // Known gap, reported to Dan 2026-10-17 — the estimator has no prior-enlisted
    // officer grades. If this list changes, the code or the table changed.
    const missing = Object.keys(OFFICIAL).filter((g) => !(g in withDependents) || !(g in withoutDependents));
    expect(missing.sort()).toEqual(['O-1E', 'O-2E', 'O-3E']);
  });
});
