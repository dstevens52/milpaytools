#!/usr/bin/env node
/**
 * bah-llms.mjs: bring public/llms.txt's BAH lines in line with the BAH year
 * switch (src/data/bah/current.ts) and the current ZIP count.
 *
 *   npm run bah:llms            → rewrites public/llms.txt, prints what changed
 *   npm run bah:llms -- --check → exit 1 if anything is out of date (used by
 *                                 tests/e2e/bah-release-day.spec.ts)
 *
 * Touches only BAH-data lines:
 *  - "{YYYY} BAH rates for …" (the /bah hub line and every station line)
 *  - the hub line's "all {N} ZIP codes"
 *  - the sources line "- {YYYY} BAH Rates: Defense Travel Management Office …"
 * Blog-post titles and descriptions are left alone (their figures belong to the
 * posts; see `check:figures --next-year`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'public', 'llms.txt');

const { BAH_YEAR } = await tsImport('../src/data/bah/current.ts', import.meta.url);
const { BAH_ZIP_COUNT } = await tsImport('../src/lib/calculations/bah.ts', import.meta.url);
const zips = BAH_ZIP_COUNT.toLocaleString('en-US');

const before = fs.readFileSync(FILE, 'utf8');
let changes = 0;
const lines = before.split('\n').map((line) => {
  let out = line.replace(/\b20\d\d BAH rates for\b/g, `${BAH_YEAR} BAH rates for`);
  if (line.startsWith('- [BAH Calculator](/bah)')) out = out.replace(/\ball [\d,]+ ZIP codes\b/, `all ${zips} ZIP codes`);
  out = out.replace(/^- 20\d\d BAH Rates: Defense Travel Management Office/, `- ${BAH_YEAR} BAH Rates: Defense Travel Management Office`);
  if (out !== line) changes++;
  return out;
});
const after = lines.join('\n');
const yearLines = lines.filter((l) => l.includes(`${BAH_YEAR} BAH rates for`) || l.includes(`${BAH_YEAR} BAH Rates: Defense`)).length;

if (process.argv.includes('--check')) {
  if (changes) {
    console.error(`llms.txt: ${changes} BAH line(s) don't match BAH_YEAR ${BAH_YEAR} / ${zips} ZIP codes. Run: npm run bah:llms`);
    process.exit(1);
  }
  console.log(`llms.txt: up to date (${yearLines} BAH-year lines, BAH_YEAR ${BAH_YEAR}, ${zips} ZIP codes)`);
} else {
  if (changes) fs.writeFileSync(FILE, after);
  console.log(`llms.txt: ${changes} line(s) updated → BAH_YEAR ${BAH_YEAR}, ${zips} ZIP codes (${yearLines} BAH-year lines)`);
}
