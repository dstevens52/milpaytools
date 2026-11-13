/**
 * Mid-year BAH rate changes DTMO issued after the January 1, 2026 tables.
 *
 * mhaRates.ts already holds the CURRENT rates for these MHAs; this file only
 * records that (and when) they changed, so pages can say so instead of
 * claiming every rate is effective January 1.
 *
 * Registered by year in src/data/bah/registry.ts; read it through
 * getBahMidYearChange() in src/lib/calculations/bah.ts.
 *
 * Source records: docs/sources/. Process: docs/ANNUAL_DATA_UPDATE.md →
 * "Mid-year BAH changes".
 */

import type { BahMidYearChanges } from '../midYear';

export const BAH_MID_YEAR_CHANGES: BahMidYearChanges = {
  TX270: {
    mhaCode: 'TX270',
    areaName: 'Abilene/Dyess AFB',
    effective: '2026-05-16',
    dtmoLabel: '2026 Abilene Temporary Increase (Effective 05/16/2026)',
    sourceDoc: 'docs/sources/bah-2026-abilene-temporary-increase.md',
  },
};
