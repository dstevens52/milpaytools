/**
 * S8 (FIX_QUEUE row 10): the retiree family enrollment-fee table in
 * how-military-retirement-works, read from the TRICARE year files for
 * TRICARE_COST_YEAR (2026 until the Jan. 1, 2027 flip, then 2027). The year
 * label and the fees come from the same year file. Server/build only.
 */

import { TRICARE_COSTS_BY_YEAR, TRICARE_COST_YEAR } from '@/data/tricare/current';

export interface RetireeFamilyFees {
  year: number;
  rows: { plan: string; groupA: number; groupB: number }[];
}

export function retireeFamilyFees(year: number = TRICARE_COST_YEAR): RetireeFamilyFees {
  const c = TRICARE_COSTS_BY_YEAR[year];
  if (!c) throw new Error(`tricareRetireeFees: no TRICARE cost file for ${year}`);
  const r = c.retiree;
  return {
    year: c.year,
    rows: [
      { plan: 'TRICARE Select retiree (family)', groupA: r.selectA.enrollmentFee.family, groupB: r.selectB.enrollmentFee.family },
      { plan: 'TRICARE Prime retiree (family)', groupA: r.primeA.enrollmentFee.family, groupB: r.primeB.enrollmentFee.family },
    ],
  };
}
