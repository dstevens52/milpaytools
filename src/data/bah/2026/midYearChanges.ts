/**
 * Mid-year BAH rate changes DTMO issued after the January 1, 2026 tables.
 *
 * mhaRates.ts already holds the CURRENT rates for these MHAs; this file only
 * records that (and when) they changed, so pages can say so instead of
 * claiming every rate is effective January 1.
 *
 * Source records: docs/sources/. Process: docs/ANNUAL_DATA_UPDATE.md →
 * "Mid-year BAH changes".
 */

export interface BahMidYearChange {
  mhaCode: string;
  /** Area name for copy, e.g. "Abilene/Dyess AFB". */
  areaName: string;
  /** ISO effective date of the change. */
  effective: string;
  /** Label as shown in DTMO's BAH year selector. */
  dtmoLabel: string;
  /** Repo path of the official source record. */
  sourceDoc: string;
}

export const BAH_MID_YEAR_CHANGES: Readonly<Record<string, BahMidYearChange>> = {
  TX270: {
    mhaCode: 'TX270',
    areaName: 'Abilene/Dyess AFB',
    effective: '2026-05-16',
    dtmoLabel: '2026 Abilene Temporary Increase (Effective 05/16/2026)',
    sourceDoc: 'docs/sources/bah-2026-abilene-temporary-increase.md',
  },
};

export function getBahMidYearChange(mhaCode: string | null | undefined): BahMidYearChange | null {
  if (!mhaCode) return null;
  return BAH_MID_YEAR_CHANGES[mhaCode] ?? null;
}

/** "May 16, 2026" from an ISO date, without timezone drift. */
export function formatBahDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
