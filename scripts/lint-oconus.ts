// OCONUS v2 build-time lints (spec Section 6). Runs in `prebuild` and in the
// test suite. Exits 1 on any error; warnings are printed for Dan to review.
//
//   npx tsx scripts/lint-oconus.ts

import { OCONUS_V2_STATIONS } from '../src/data/oconus/index';
import { allSharedCopy, ALL_SHARED_LINKS } from '../src/data/oconus/sharedCopy';
import { lintStation, lintShared, formatIssue, type LintIssue } from './oconusLint';

const stations = OCONUS_V2_STATIONS.filter((s) => s.templateVersion === 2);
const sharedCopy = allSharedCopy();
const anyPublished = stations.some((s) => s.published);

// An empty input proves nothing — refuse to report "clean" on nothing.
if (stations.length === 0 || sharedCopy.length === 0) {
  console.error(`lint-oconus: no input (stations: ${stations.length}, shared strings: ${sharedCopy.length})`);
  process.exit(1);
}

const issues: LintIssue[] = [
  ...stations.flatMap((s) => lintStation(s)),
  ...lintShared(sharedCopy, ALL_SHARED_LINKS, anyPublished),
];

const errors = issues.filter((i) => i.severity === 'error');
const warnings = issues.filter((i) => i.severity === 'warn');

console.log(
  `lint-oconus: ${stations.length} v2 station(s) [${stations
    .map((s) => `${s.slug}${s.published ? '' : ' (unpublished)'}`)
    .join(', ')}], ${sharedCopy.length} shared strings`,
);
const stale = warnings.filter((w) => w.rule === 'staleness');
if (stale.length) console.log(`Stale (lastReviewed > 13 months): ${stale.map((w) => w.station).join(', ')}`);
for (const w of warnings) console.log(formatIssue(w));
for (const e of errors) console.error(formatIssue(e));
console.log(`lint-oconus: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
