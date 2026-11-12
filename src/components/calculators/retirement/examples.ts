/**
 * Retirement page example scenarios — shared by the page (server-rendered) and the
 * e2e spec, so every dollar figure shown in the hero strip and the worked example is
 * computed from the retirement lib, never hand-keyed.
 */

import type { RetirementInput } from '@/types/calculator';
import { calculateRetirement } from '@/lib/calculations/retirement';
import { formatCurrency } from '@/lib/utils';

// Worked example: E-7 retiring at exactly 20 YOS in 2026, BRS, 5% TSP at 7%.
// The lib projects TSP contributions at a single grade's pay, so this holds E-7 base
// pay flat across all 20 years (currentGrade E-7, currentYOS 0) with a $0 balance.
export const RETIREMENT_EXAMPLE_INPUT: RetirementInput = {
  retirementSystem: 'brs',
  currentGrade: 'E-7',
  currentYOS: 0,
  retirementYOS: 20,
  retirementGrade: 'E-7',
  tspContributionPct: 5,
  tspCurrentBalance: 0,
  tspAnnualReturnPct: 7,
  vaRating: 0,
};

// Hero "Sample output" strip: the worked example plus a 50% VA rating, the lowest
// rating where concurrent receipt (CRDP) pays retired pay and VA compensation in full.
// Below 50% the VA waiver offsets retired pay, so pension + VA would not add up.
export const RETIREMENT_HERO_INPUT: RetirementInput = {
  ...RETIREMENT_EXAMPLE_INPUT,
  vaRating: 50,
};

/** "~$191K" style: nearest thousand, computed from the value passed in. */
function approxK(n: number): string {
  return `~$${Math.round(n / 1000).toLocaleString('en-US')}K`;
}

/** Display strings for the hero strip, computed from the lib. */
export function retirementHeroStrip() {
  const r = calculateRetirement(RETIREMENT_HERO_INPUT);
  return {
    pension: `${formatCurrency(r.monthlyPension)}/mo`,
    tsp: approxK(r.tspProjectedBalance),
    va: `${formatCurrency(r.monthlyVA)}/mo`,
    civilianEquivalent: `${approxK(r.civilianEquivalent)}/yr`,
  };
}
