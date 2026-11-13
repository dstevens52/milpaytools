/**
 * Expected BAH values for BAH_YEAR 2026, TYPED FROM THE SOURCE: never copied from
 * lib output. Current-year rates come from the DTMO ASCII rows in
 * data/sources/dtmo/2026/ (bahw26.txt / bahwo26.txt / sorted_zipmha26.txt;
 * column 5 = E-5, 6 = E-6, 1 = E-1). Prior-year (2025) rates come from the 2025
 * DTMO table as loaded in src/data/bah/2025/mhaRates.ts. Derived statistics
 * (national median, rank) were set when the figures were first verified and
 * are typed here as fixed numbers.
 *
 * Release day: copy this file to bah-expected-2027.ts and replace every value
 * from the 2027 ASCII rows (Claude Chat supplies them), then register it in
 * bah-expected.ts. docs/RELEASE_DAY_BAH_2027.md, step 4.
 */

import type { BahExpected } from './bah-expected';

export const BAH_EXPECTED_2026: BahExpected = {
  year: '2026',
  priorYear: '2025',
  zipCount: 40959, // lines in sorted_zipmha26.txt
  mhaCount: 338, // lines in bahw26.txt

  // NC182 FORT BRAGG/POPE, NC: ZIP 28310 (station ZIP 28301)
  bragg: {
    zip: '28310',
    mha: 'NC182',
    locationName: 'Fort Bragg/Pope, NC',
    e5W: 1806,
    e5WO: 1527,
    priorE5W: 1785, // → +$21 (+1.2%), $252/yr
    hasDecrease: true, // some other grade fell 2025 → 2026
    // Nearby E-5 w/dep (station ZIP → MHA): Seymour Johnson NC183 1521, Camp Lejeune NC178 1584,
    // Cherry Point NC177 1851 → deltas vs 1806
    nearbyE5WDelta: {
      'seymour-johnson-afb': -285,
      'camp-lejeune': -222,
      'marine-corps-air-station-cherry-point': 45,
    },
    nationalRankE5W: 222, // of mhaCount; TX270's May 16 increase passed Fort Bragg (was 221)
    nationalTopPercentE5W: 66,
  },

  // CA038 SAN DIEGO, CA: ZIP 92134
  sanDiego: { zip: '92134', mha: 'CA038', e5W: 3975 },

  // WA311: ZIP 98433 (JBLM)
  jblm: { zip: '98433', mha: 'WA311', e6W: 2919 },

  // TX285 SAN ANTONIO, TX: ZIP 78234 (station ZIP 78201)
  sanAntonio: {
    zip: '78234',
    mha: 'TX285',
    locationName: 'San Antonio, TX',
    e5W: 1869,
    e5WO: 1500,
    e1WO: 1359,
    priorE5W: 1935, // → −$66, $792/yr less
    hasDecrease: true,
  },

  // VA298 NORFOLK/PORTSMOUTH, VA: Naval Station Norfolk (ZIP 23503)
  norfolk: {
    mha: 'VA298',
    e5W: 2430,
    priorE5W: 2325, // → +$105 (+4.5%), $1,260/yr
    hasDecrease: false,
  },

  // National medians across all MHAs (E-5)
  nationalMedianE5W: 2061,
  nationalMedianE5WO: 1670,

  // Official DoD national-average BAH increase for the year (from DoD's release).
  nationalAvgIncreasePct: 4.2,
};
