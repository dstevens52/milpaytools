/**
 * 2027 military basic pay raise — the single control file for /pay/raise.
 *
 * Release day means editing THIS FILE ONLY (runbook: docs/RELEASE_DAY_2027_PAY.md):
 *   - Law signed, DFAS table not out yet → status: 'enacted', fill `enacted`.
 *   - DFAS publishes the 2027 table → add src/data/pay-tables/2027.ts, import it
 *     below, set `officialTable`, status: 'official-table'.
 * The page title, status box, FAQ, /pay hub FAQ, rank-page links and the blog
 * callout all read their wording from here through src/lib/calculations/payRaise.ts.
 *
 * Facts verified Nov 11, 2026:
 *   - Alternative pay plan, 37 U.S.C. 1009(e), sent Aug 26, 2026 (H. Doc. 119-189):
 *     7.0% E-1–E-5, 6.0% E-6–O-3, 5.0% O-4 and above, "subject to the caps
 *     established by 37 U.S.C. 203", effective Jan 1, 2027. Takes effect unless
 *     Congress enacts a different raise.
 *   - SASC FY2027 NDAA: 3.6% for all grades (= the 37 U.S.C. 1009(c) ECI figure).
 *     House committee version supports 7-6-5. Source: CRS Insight IN12706 (Jul 14, 2026).
 *   - Final FY2027 NDAA not enacted.
 *   - Caps (37 U.S.C. 203): O-7–O-10 at Executive Schedule Level II, all other
 *     grades at Level V. 2026 values from the DFAS officer table notes; 2027
 *     Executive Schedule rates not yet published.
 */

import type { PayGrade } from '@/types/military';
import type { PayTable } from '@/data/types';

export type RaiseTier = 'E1-E5' | 'E6-O3' | 'O4-up';
export type PercentByTier = Record<RaiseTier, number>;
export type PayRaiseStatus = 'pending' | 'enacted' | 'official-table';

export interface RaiseScenario {
  id: string;
  label: string;
  percentByTier: PercentByTier;
  sourceName: string;
  sourceUrl: string;
}

export interface EnactedRaise {
  percentByTier: PercentByTier;
  lawName: string;
  /** ISO date the law was signed, e.g. '2026-12-18'. */
  signedDate: string;
  sourceUrl: string;
}

export interface PayCaps {
  /** Executive Schedule Level II — caps O-7 to O-10. */
  levelII: number;
  /** Executive Schedule Level V — caps every other grade. */
  levelV: number;
  capYear: number;
  /** True while the cap values are carried over from an earlier year. */
  pending: boolean;
}

export interface PayRaiseConfig {
  status: PayRaiseStatus;
  /** ISO date Dan last checked the law's status. Shown on the page. */
  lastChecked: string;
  /** Used while status is 'pending'. */
  scenarios: RaiseScenario[];
  enacted: EnactedRaise | null;
  caps: PayCaps;
  /** DFAS 2027 table (src/data/pay-tables/2027.ts). Required for 'official-table'. */
  officialTable: PayTable | null;
}

/** Which tier of the raise each grade falls in. */
export const GRADE_TIERS: Record<PayGrade, RaiseTier> = {
  'E-1': 'E1-E5', 'E-2': 'E1-E5', 'E-3': 'E1-E5', 'E-4': 'E1-E5', 'E-5': 'E1-E5',
  'E-6': 'E6-O3', 'E-7': 'E6-O3', 'E-8': 'E6-O3', 'E-9': 'E6-O3',
  'W-1': 'E6-O3', 'W-2': 'E6-O3', 'W-3': 'E6-O3', 'W-4': 'E6-O3', 'W-5': 'E6-O3',
  'O-1': 'E6-O3', 'O-2': 'E6-O3', 'O-3': 'E6-O3',
  'O-1E': 'E6-O3', 'O-2E': 'E6-O3', 'O-3E': 'E6-O3',
  'O-4': 'O4-up', 'O-5': 'O4-up', 'O-6': 'O4-up', 'O-7': 'O4-up', 'O-8': 'O4-up',
  'O-9': 'O4-up', 'O-10': 'O4-up',
};

/**
 * Grades the plan does not name ("E6 to O3" only). Placed in the 6% tier as an
 * assumption; the page shows TIER_ASSUMPTION_NOTE on these grades.
 */
export const ASSUMED_TIER_GRADES: readonly PayGrade[] = [
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5', 'O-1E', 'O-2E', 'O-3E',
];

export const TIER_ASSUMPTION_NOTE =
  'The plan names grades E-6 to O-3 and does not list warrant officer grades; this assumes the 6% tier.';

/** Grades capped at Executive Schedule Level II; all others use Level V. */
export const LEVEL_II_GRADES: readonly PayGrade[] = ['O-7', 'O-8', 'O-9', 'O-10'];

export const SOURCES = {
  plan: {
    name: 'H. Doc. 119-189, alternative pay plan (Aug 26, 2026)',
    url: 'https://www.govinfo.gov/content/pkg/CDOC-119hdoc189/html/CDOC-119hdoc189.htm',
  },
  crs: {
    name: 'CRS Insight IN12706 (Jul 14, 2026)',
    url: 'https://www.everycrsreport.com/reports/IN12706.html',
  },
  usc1009: {
    name: '37 U.S.C. 1009',
    url: 'https://www.law.cornell.edu/uscode/text/37/1009',
  },
  usc203: {
    name: '37 U.S.C. 203',
    url: 'https://www.law.cornell.edu/uscode/text/37/203',
  },
  dfas: {
    name: 'DFAS basic pay tables',
    url: 'https://www.dfas.mil/Military-Members/payentitlements/Pay-Tables/Basic-Pay/',
  },
} as const;

export const PAY_RAISE_2027: PayRaiseConfig = {
  status: 'pending',
  lastChecked: '2026-11-11',
  scenarios: [
    {
      id: 'current-plan',
      label: 'Current plan (7-6-5)',
      percentByTier: { 'E1-E5': 7.0, 'E6-O3': 6.0, 'O4-up': 5.0 },
      sourceName: SOURCES.plan.name,
      sourceUrl: SOURCES.plan.url,
    },
    {
      id: 'senate-3-6',
      label: 'Senate version (3.6%)',
      percentByTier: { 'E1-E5': 3.6, 'E6-O3': 3.6, 'O4-up': 3.6 },
      sourceName: SOURCES.crs.name,
      sourceUrl: SOURCES.crs.url,
    },
  ],
  enacted: null,
  caps: { levelII: 18999.90, levelV: 15408.30, capYear: 2026, pending: true },
  officialTable: null,
};
