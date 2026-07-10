/**
 * Shared fixtures for TSP tests.
 *
 * SAMPLE_BAR_SCENARIO must stay in sync with the projectTSP() call inside
 * src/app/calculators/tsp/page.tsx (the sample output bar computation).
 *
 * sampleFmt must stay in sync with the sampleFmt() function in that same file.
 *
 * These are extracted here so the engine unit tests and the E2E assertion in
 * tsp.spec.ts both derive the expected value from a single source of truth
 * rather than hardcoding dollar literals.
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
  yearsToProject: 39,       // 65 − 26
  moreYearsToServe: 14,     // max(20 − 6, 1)
  annualPayRaisePct: 4.5,
};

export function sampleFmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return '$' + Math.round(n).toLocaleString('en-US');
}
