/**
 * DoD's annual BAH releases: national average increase and release date.
 *
 * Source record: docs/sources/bah-release-history.md (verified by Claude Chat,
 * Nov 13, 2026). This file mirrors its table row for row, most recent first;
 * tests/e2e/bah-release-history.spec.ts checks it. Official figures only: no
 * estimates or projections. "Released" is the dateline of DoD's release; rates
 * take effect January 1 of the rates year.
 *
 * Release day: add the 2027 row to the source doc first, then here
 * (docs/RELEASE_DAY_BAH_2027.md, step 3).
 *
 * Client-safe: no imports.
 */

export interface BahRelease {
  ratesYear: number;
  /** DoD's national average increase, percent (e.g. 4.2). */
  avgIncreasePct: number;
  /** ISO date of DoD's release (its dateline). */
  releasedDate: string;
  sourceUrl: string;
  sourceLabel: string;
}

export const BAH_RELEASE_HISTORY: readonly BahRelease[] = [
  {
    ratesYear: 2026,
    avgIncreasePct: 4.2,
    releasedDate: '2025-12-11',
    sourceUrl: 'https://myairforcebenefits.us.af.mil/Department-of-War-Releases-2026-Basic-Allowance-for-Housing-Rates',
    sourceLabel: 'Department of War release, December 11, 2025',
  },
  {
    ratesYear: 2025,
    avgIncreasePct: 5.4,
    releasedDate: '2024-12-13',
    sourceUrl: 'https://www.army.mil/article/282083',
    sourceLabel: 'DoD release, December 13, 2024',
  },
  {
    ratesYear: 2024,
    avgIncreasePct: 5.4,
    releasedDate: '2023-12-14',
    sourceUrl: 'https://www.myairforcebenefits.us.af.mil/News/DOD-Releases-2024-Basic-Allowance-for-Housing-Rates',
    sourceLabel: 'DoD release, December 14, 2023',
  },
  {
    ratesYear: 2023,
    avgIncreasePct: 12.1,
    releasedDate: '2022-12-14',
    sourceUrl: 'https://www.army.mil/article/262868/dod_releases_2023_basic_allowance_for_housing_rates',
    sourceLabel: 'DoD release, December 14, 2022',
  },
  {
    ratesYear: 2022,
    avgIncreasePct: 5.1,
    releasedDate: '2021-12-15',
    sourceUrl: 'https://www.mycg.uscg.mil/News/Article/2875710/dod-releases-2022-basic-allowance-for-housing-rates/',
    sourceLabel: 'DoD release, December 15, 2021',
  },
  {
    ratesYear: 2021,
    avgIncreasePct: 2.9,
    releasedDate: '2020-12-15',
    sourceUrl: 'https://www.army.mil/article/241796/dod_releases_2021_basic_allowance_for_housing_rates',
    sourceLabel: 'DoD release, December 15, 2020',
  },
];

/** The release for a rates year, or undefined if it isn't recorded. */
export function bahRelease(ratesYear: number | string): BahRelease | undefined {
  return BAH_RELEASE_HISTORY.find((r) => r.ratesYear === Number(ratesYear));
}

/** DoD's national average increase by rates year, e.g. { '2026': 4.2, … }. */
export const NATIONAL_AVG_BAH_INCREASE_BY_YEAR: Readonly<Record<string, number>> = Object.fromEntries(
  BAH_RELEASE_HISTORY.map((r) => [String(r.ratesYear), r.avgIncreasePct]),
);
