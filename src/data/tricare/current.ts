/**
 * The TRICARE cost year the calculators and "current cost" pages show.
 *
 * Stays 2026 until Jan. 1, 2027, when the January rollover flips it to 2027
 * (FIX_QUEUE dated item; docs/ANNUAL_DATA_UPDATE.md). Only the TRICARE costs
 * post shows the 2027 figures before then, reading the 2027 file directly.
 */

import type { TricareCosts } from './types';
import { TRICARE_COSTS_2026 } from './2026/costs';
import { TRICARE_COSTS_2027 } from './2027/costs';

export const TRICARE_COSTS_BY_YEAR: Record<number, TricareCosts> = {
  2026: TRICARE_COSTS_2026,
  2027: TRICARE_COSTS_2027,
};

export const TRICARE_COST_YEAR = 2026;

export const currentTricareCosts: TricareCosts = TRICARE_COSTS_BY_YEAR[TRICARE_COST_YEAR];

/** The next year's published costs, or null when none are published yet. */
export const upcomingTricareCosts: TricareCosts | null = TRICARE_COSTS_BY_YEAR[TRICARE_COST_YEAR + 1] ?? null;
