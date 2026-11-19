// Derives the slim station index that client code searches (BaseSearchInput → src/lib/stationSearch.ts)
// and that the PCS calculator uses for ZIP → station. Used by scripts/gen-station-search-index.ts
// (build time) and by the drift test — never imported by client code, which uses
// searchIndex.generated.ts instead. Importing DUTY_STATIONS client-side shipped every station's
// full record (housing tips, neighborhoods, market data): 229 KB minified on 8 routes (P1 #2,
// docs/perf/p1-step1-report.md). Relative imports only: this runs under tsx.

import { DUTY_STATIONS } from './stations';

/** Only the fields searchStations() and the PCS calculator read. Same order as DUTY_STATIONS. */
export type StationSearchEntry = {
  name: string;
  slug: string;
  zip: string;
  city: string;
  state: string;
  stateName: string;
  branches: string[];
  formerName?: string;
  oconus?: boolean;
};

export function buildStationSearchIndex(): StationSearchEntry[] {
  return DUTY_STATIONS.map((s) => {
    const e: StationSearchEntry = {
      name: s.name,
      slug: s.slug,
      zip: s.zip,
      city: s.city,
      state: s.state,
      stateName: s.stateName,
      branches: [...s.branches],
    };
    // Optional fields only when present, so the entry matches the source field for field.
    if (s.formerName !== undefined) e.formerName = s.formerName;
    if (s.oconus !== undefined) e.oconus = s.oconus;
    return e;
  });
}
