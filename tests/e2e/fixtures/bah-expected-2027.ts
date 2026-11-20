/**
 * REHEARSAL FIXTURE (rehearsal/bah-2027-r2): expected values for the SYNTHETIC
 * 2027 package in data/sources/dtmo/2027-rehearsal/. Not DTMO rates; never
 * merge. Typed from those ASCII rows (scripts/rehearsal/ascii.ts reads them
 * without any src/ code), never from lib output. Prior-year values are the 2026
 * rates as shipped (src/data/bah/2026/mhaRates.ts).
 */

import type { BahExpected } from './bah-expected';

export const BAH_EXPECTED_2027: BahExpected = {
  year: '2027',
  priorYear: '2026',
  zipCount: 40959, // lines in sorted_zipmha27.txt
  mhaCount: 338, // lines in bahw27.txt

  // NC182 FORT BRAGG/POPE, NC: ZIP 28310 (station ZIP 28301); fake +5%
  bragg: {
    zip: '28310',
    mha: 'NC182',
    locationName: 'Fort Bragg/Pope, NC',
    e5W: 1896,
    e5WO: 1603,
    e7W: 2199,
    priorE5W: 1806, // → +$90 (+5.0%), $1,080/yr
    hasDecrease: false, // every NC182 cell rose
    // Nearby E-5 w/dep: Seymour Johnson NC183 1536, Camp Lejeune NC178 1679, Cherry Point NC177 2018 → deltas vs 1896
    nearbyE5WDelta: {
      'seymour-johnson-afb': -360,
      'camp-lejeune': -217,
      'marine-corps-air-station-cherry-point': 122,
    },
    nationalRankE5W: 217,
    nationalTopPercentE5W: 64,
  },

  // CA038 SAN DIEGO, CA: unchanged in the fake package
  sanDiego: { zip: '92134', mha: 'CA038', e5W: 3975, e7W: 4446 },

  jblm: { zip: '98433', mha: 'WA311', e6W: 3182 },

  // TX285 SAN ANTONIO, TX: fake +1% (an increase this time)
  sanAntonio: {
    zip: '78234',
    mha: 'TX285',
    locationName: 'San Antonio, TX',
    e5W: 1888,
    e5WO: 1515,
    e1WO: 1373,
    priorE5W: 1869,
    hasDecrease: false,
  },

  // VA298 NORFOLK/PORTSMOUTH, VA: fake +9%
  norfolk: {
    mha: 'VA298',
    e5W: 2649,
    priorE5W: 2430,
    hasDecrease: false,
  },

  nationalMedianE5W: 2105,
  nationalMedianE5WO: 1716,

  // REHEARSAL: the fake DoD figure in releaseHistory.ts.
  nationalAvgIncreasePct: 4.8,
};
