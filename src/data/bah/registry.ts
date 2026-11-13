/**
 * BAH year registry — the ONLY file that imports the year folders
 * (src/data/bah/{YYYY}/). Everything else reads BAH data through
 * src/lib/calculations/bah.ts, which picks the current year from
 * src/data/bah/current.ts.
 *
 * SERVER / BUILD ONLY. Never import this from a client component.
 *
 * Adding a year (release day, docs/RELEASE_DAY_BAH_2027.md):
 *   1. `npm run bah:import -- --year 2027 …` writes src/data/bah/2027/.
 *   2. Import its mhaRates into BAH_RATES_BY_YEAR.
 *   3. MOVE the zipToMha + mhaNames entry in BAH_LOOKUP_TABLES to the new year
 *      (only BAH_YEAR registers them: the ZIP map is ~650 KB, and a prior year
 *      only needs its rates for year-over-year figures).
 *   4. Add an (empty) BAH_MID_YEAR_CHANGES_BY_YEAR entry for the new year.
 *   5. Set BAH_YEAR / BAH_PRIOR_YEAR in current.ts.
 * tests/e2e/bah-release-day.spec.ts checks that the registry and current.ts agree.
 */

import { mhaRates as rates2025 } from './2025/mhaRates';
import { mhaRates as rates2026 } from './2026/mhaRates';
import { zipToMha as zipToMha2026 } from './2026/zipToMha';
import { mhaNames as mhaNames2026 } from './2026/mhaNames';
import { BAH_MID_YEAR_CHANGES as midYear2026 } from './2026/midYearChanges';
import type { BahMidYearChanges } from './midYear';

export interface MHARateSet {
  w: Record<string, number>; // withDependents
  wo: Record<string, number>; // withoutDependents
}
export type MhaRateTable = Record<string, MHARateSet>;

/** Monthly rates by MHA, for every registered year (build-time only). */
export const BAH_RATES_BY_YEAR = {
  '2025': rates2025,
  '2026': rates2026,
} satisfies Record<string, MhaRateTable>;

export type BahYear = keyof typeof BAH_RATES_BY_YEAR;

export interface BahLookupTables {
  zipToMha: Record<string, string>;
  mhaNames: Record<string, string>;
}

/** ZIP → MHA map and MHA names. Registered for BAH_YEAR only. */
export const BAH_LOOKUP_TABLES: Partial<Record<BahYear, BahLookupTables>> = {
  '2026': { zipToMha: zipToMha2026, mhaNames: mhaNames2026 },
};

/** DTMO mid-year changes, by year. A new year starts empty. */
export const BAH_MID_YEAR_CHANGES_BY_YEAR: Partial<Record<BahYear, BahMidYearChanges>> = {
  '2026': midYear2026,
};
