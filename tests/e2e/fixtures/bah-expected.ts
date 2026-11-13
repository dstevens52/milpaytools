/**
 * Year-keyed expected BAH values. Specs import BAH_EXPECTED, which is the
 * fixture for the current BAH_YEAR (src/data/bah/current.ts). If no fixture is
 * registered for that year, every spec importing this module fails at load with
 * "no expected fixture for {year}", by design: release day adds the new year's
 * fixture (typed from the DTMO ASCII rows) before the gate runs.
 */

import { BAH_YEAR } from '../../../src/data/bah/current';
import { BAH_EXPECTED_2026 } from './bah-expected-2026';

export interface BahExpected {
  year: string;
  priorYear: string;
  zipCount: number;
  mhaCount: number;
  bragg: {
    zip: string;
    mha: string;
    locationName: string;
    e5W: number;
    e5WO: number;
    priorE5W: number;
    hasDecrease: boolean;
    nearbyE5WDelta: Record<string, number>;
    nationalRankE5W: number;
    nationalTopPercentE5W: number;
  };
  sanDiego: { zip: string; mha: string; e5W: number };
  jblm: { zip: string; mha: string; e6W: number };
  sanAntonio: {
    zip: string;
    mha: string;
    locationName: string;
    e5W: number;
    e5WO: number;
    e1WO: number;
    priorE5W: number;
    hasDecrease: boolean;
  };
  norfolk: { mha: string; e5W: number; priorE5W: number; hasDecrease: boolean };
  nationalMedianE5W: number;
  nationalMedianE5WO: number;
  nationalAvgIncreasePct: number;
}

const FIXTURES: Record<string, BahExpected> = {
  '2026': BAH_EXPECTED_2026,
};

function load(year: string): BahExpected {
  const f = FIXTURES[year];
  if (!f) {
    throw new Error(
      `no expected fixture for ${year}: add tests/e2e/fixtures/bah-expected-${year}.ts (typed from the DTMO ASCII rows) and register it in bah-expected.ts`,
    );
  }
  if (f.year !== year) throw new Error(`fixture registered for ${year} says year ${f.year}`);
  return f;
}

export const BAH_EXPECTED: BahExpected = load(BAH_YEAR);

/** Change helpers for YoY assertions, computed from typed values only. */
export function yoy(current: number, prior: number) {
  const abs = current - prior;
  return { abs, pct: (abs / prior) * 100, annual: Math.abs(abs) * 12 };
}

/** "$1,806": typed-value formatter for text assertions. */
export function usd(n: number): string {
  return '$' + n.toLocaleString('en-US');
}
