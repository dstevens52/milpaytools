/**
 * Default scenario for the TSP calculator's sample output bar.
 *
 * Imported by both src/app/calculators/tsp/page.tsx (server render) and
 * tests/e2e/tspTestFixtures.ts (E2E assertion) so the page and the test
 * share a single source of truth. If the sample scenario parameters change,
 * update them here — both consumers update automatically.
 */

import { getBasePayMonthly, type TSPProjectionInput } from '@/lib/calculations/tspGrowth';
import { ALLOCATION_PRESETS } from '@/data/tsp/2026/constants';

export const SAMPLE_BAR_SCENARIO: TSPProjectionInput = {
  startingBalance: 0,
  monthlyContribution: getBasePayMonthly('E-5', 6) * 0.05,
  retirementSystem: 'brs',
  payGrade: 'E-5',
  yearsOfService: 6,
  allocation: { ...ALLOCATION_PRESETS.aggressive },
  yearsToProject: 39,    // 65 − 26
  moreYearsToServe: 14,  // max(20 − 6, 1)
  annualPayRaisePct: 4.5,
};

// Compact formatter for the sample bar display — "$X.XXM" / "$XK".
export function sampleFmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return '$' + Math.round(n).toLocaleString('en-US');
}
