import { test, expect } from '@playwright/test';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { STATION_SEARCH_INDEX } from '../../src/data/duty-stations/searchIndex.generated';
import { buildStationSearchIndex } from '../../src/data/duty-stations/buildSearchIndex';
import { searchStations } from '../../src/lib/stationSearch';

// P1 #2 (docs/perf/p1-step1-report.md): client code searches a slim generated index instead of
// the full DUTY_STATIONS records. These checks need no page or server.

test('searchIndex.generated.ts is up to date with stations.ts (run npm run gen:station-index)', () => {
  expect(STATION_SEARCH_INDEX.length).toBeGreaterThan(0);
  expect(STATION_SEARCH_INDEX).toEqual(buildStationSearchIndex());
  // Same stations, same order (search ties and ZIP lookups keep the first match).
  expect(STATION_SEARCH_INDEX.map((s) => s.slug)).toEqual(DUTY_STATIONS.map((s) => s.slug));
});

test('every field the search and the PCS calculator read matches the full record', () => {
  expect(STATION_SEARCH_INDEX.length).toBe(DUTY_STATIONS.length);
  DUTY_STATIONS.forEach((full, i) => {
    const slim = STATION_SEARCH_INDEX[i];
    expect(slim, full.slug).toEqual({
      name: full.name,
      slug: full.slug,
      zip: full.zip,
      city: full.city,
      state: full.state,
      stateName: full.stateName,
      branches: full.branches,
      ...(full.formerName !== undefined ? { formerName: full.formerName } : {}),
      ...(full.oconus !== undefined ? { oconus: full.oconus } : {}),
    });
  });
});

test('search results still come from the station list', () => {
  expect(searchStations('bragg')[0]).toMatchObject({ name: 'Fort Bragg', zip: '28301', state: 'NC', branch: 'Army' });
  // Former name (Fort Liberty) still finds Fort Bragg.
  expect(searchStations('liberty').map((r) => r.name)).toContain('Fort Bragg');
  // Abbreviation expansion + station results ahead of the installations lookup.
  const jblm = searchStations('jblm');
  expect(jblm.length).toBeGreaterThan(0);
  expect(jblm[0].name).toMatch(/Lewis/);
  // Overseas stations are excluded by default and included on request.
  const oconus = DUTY_STATIONS.find((s) => s.oconus);
  if (oconus) {
    expect(searchStations(oconus.name).some((r) => r.name === oconus.name)).toBe(false);
    expect(searchStations(oconus.name, false).some((r) => r.name === oconus.name)).toBe(true);
  }
});
