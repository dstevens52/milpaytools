/**
 * /bah/changes wired to the BAH registry: BAH_YEAR vs BAH_PRIOR_YEAR.
 * SERVER / BUILD ONLY — it reads every MHA's rates and the full ZIP map
 * (through the station-page map). Never import this from a client component.
 */

import { BAH_RATES_BY_YEAR, BAH_MID_YEAR_CHANGES_BY_YEAR } from '@/data/bah/registry';
import { MHA_TO_STATION_PAGES } from '@/data/bah/mhaToStationPage';
import { CURRENT_BAH_YEAR, PRIOR_BAH_YEAR, currentMhaNames } from '@/lib/calculations/bah';
import { buildBahChanges, type BahChanges } from '@/lib/calculations/bahChanges';

export function currentBahChanges(): BahChanges {
  return buildBahChanges({
    year: CURRENT_BAH_YEAR,
    priorYear: PRIOR_BAH_YEAR,
    current: BAH_RATES_BY_YEAR[CURRENT_BAH_YEAR],
    prior: BAH_RATES_BY_YEAR[PRIOR_BAH_YEAR],
    names: currentMhaNames(),
    stationPages: MHA_TO_STATION_PAGES,
    midYearCurrent: BAH_MID_YEAR_CHANGES_BY_YEAR[CURRENT_BAH_YEAR],
    midYearPrior: BAH_MID_YEAR_CHANGES_BY_YEAR[PRIOR_BAH_YEAR],
  });
}
