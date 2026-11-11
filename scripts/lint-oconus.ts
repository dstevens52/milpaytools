// OCONUS v2 build-time lints (spec Section 6). Runs in `prebuild` and in the
// test suite. Exits 1 on any error; warnings are printed for Dan to review.
//
//   npx tsx scripts/lint-oconus.ts

import { OCONUS_V2_STATIONS, publishedOconusV2ForName } from '../src/data/oconus/index';
import { allSharedCopy, ALL_SHARED_LINKS } from '../src/data/oconus/sharedCopy';
import { stationSearchLintCopy, type OverseasMatch } from '../src/data/oconus/stationSearchCopy';
import { INSTALLATIONS_LOOKUP } from '../src/data/installations-lookup';
import { pcsOverseasPanelCopy } from '../src/data/pcs/oconusPanel';
import { lintStation, lintShared, lintText, formatIssue, type LintIssue } from './oconusLint';

const stations = OCONUS_V2_STATIONS.filter((s) => s.templateVersion === 2);
const sharedCopy = allSharedCopy();
const pcsPanelCopy = pcsOverseasPanelCopy();
const anyPublished = stations.some((s) => s.published);

// Station-input overseas note: every message it can render — each published
// v2 station, each overseas installation without a v2 guide, and both
// military-mail forms — in the housing and COLA variants, plus the COLA line.
const searchMatches: OverseasMatch[] = [
  ...stations
    .filter((s) => s.published)
    .map((s): OverseasMatch => ({ kind: 'station', name: s.name, shortName: s.shortName, slug: s.slug })),
  ...INSTALLATIONS_LOOKUP.filter((i) => i.oconus && !publishedOconusV2ForName(i.name)).map(
    (i): OverseasMatch => ({ kind: 'installation', name: i.name }),
  ),
  { kind: 'mail-zip' },
  { kind: 'mail-text' },
];
const searchCopy = stationSearchLintCopy(searchMatches);

// An empty input proves nothing — refuse to report "clean" on nothing.
if (stations.length === 0 || sharedCopy.length === 0 || pcsPanelCopy.length === 0 || searchCopy.length === 0) {
  console.error(
    `lint-oconus: no input (stations: ${stations.length}, shared strings: ${sharedCopy.length}, PCS panel strings: ${pcsPanelCopy.length}, station-search strings: ${searchCopy.length})`,
  );
  process.exit(1);
}

const issues: LintIssue[] = [
  ...stations.flatMap((s) => lintStation(s)),
  ...lintShared(sharedCopy, ALL_SHARED_LINKS, anyPublished),
  // PCS estimator overseas panel — currency and voice only.
  ...pcsPanelCopy.flatMap(({ field, text }) => lintText(text, { station: 'pcs-overseas', field, isStationData: false })),
  // Calculator station-input overseas note + COLA line — currency and voice only.
  ...searchCopy.flatMap(({ field, text }) => lintText(text, { station: 'station-search', field, isStationData: false })),
];

const errors = issues.filter((i) => i.severity === 'error');
const warnings = issues.filter((i) => i.severity === 'warn');

console.log(
  `lint-oconus: ${stations.length} v2 station(s) [${stations
    .map((s) => `${s.slug}${s.published ? '' : ' (unpublished)'}`)
    .join(', ')}], ${sharedCopy.length} shared strings, ${pcsPanelCopy.length} PCS overseas panel strings, ${searchCopy.length} station-search strings (${searchMatches.length} matches)`,
);
const stale = warnings.filter((w) => w.rule === 'staleness');
if (stale.length) console.log(`Stale (lastReviewed > 13 months): ${stale.map((w) => w.station).join(', ')}`);
for (const w of warnings) console.log(formatIssue(w));
for (const e of errors) console.error(formatIssue(e));
console.log(`lint-oconus: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
