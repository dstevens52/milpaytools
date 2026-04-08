/**
 * parse-bah-data.js
 * Run once: node scripts/parse-bah-data.js
 *
 * Reads the four official DTMO 2026 BAH ASCII files from the project root
 * and generates three TypeScript data files under src/data/bah/2026/.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'src', 'data', 'bah', '2026');

// ─── Grade column order in bahw26.txt / bahwo26.txt ───────────────────────
// Indices 1–27 after the leading MHA code column (index 0).
// Columns 24–27 are all O-7 rate (O-7, O-8, O-9, O-10 get the same BAH).
const GRADE_COLS = [
  'E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9',   // 1–9
  'W-1','W-2','W-3','W-4','W-5',                             // 10–14
  'O-1E','O-2E','O-3E',                                      // 15–17
  'O-1','O-2','O-3','O-4','O-5','O-6',                      // 18–23
  'O-7','O-7','O-7','O-7',                                   // 24–27 (duplicate)
];

// ─── 1. Parse zip-to-MHA mapping ─────────────────────────────────────────
console.log('Parsing sorted_zipmha26.txt...');
const zipLines = fs.readFileSync(path.join(ROOT, 'sorted_zipmha26.txt'), 'utf8')
  .split('\n')
  .map(l => l.replace(/\r/g, '').trim())
  .filter(Boolean);

const zipToMha = {};
for (const line of zipLines) {
  const [zip, mha] = line.split(' ');
  if (zip && mha) zipToMha[zip] = mha;
}
console.log(`  → ${Object.keys(zipToMha).length} ZIP codes`);

// ─── 2. Parse MHA names ───────────────────────────────────────────────────
console.log('Parsing mhanames26.txt...');
const nameLines = fs.readFileSync(path.join(ROOT, 'mhanames26.txt'), 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

const mhaNames = {};
for (const line of nameLines) {
  const idx = line.indexOf(';');
  if (idx === -1) continue;
  const code = line.slice(0, idx).trim();
  const name = line.slice(idx + 1).trim();
  // Title-case the name: "KETCHIKAN, AK" → "Ketchikan, AK"
  mhaNames[code] = name.replace(/\b\w+/g, w =>
    ['AK','AL','AR','AZ','CA','CO','CT','DC','DE','FL','GA','GU','HI','IA','ID',
     'IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND',
     'NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','PR','RI','SC','SD','TN',
     'TX','UT','VA','VI','VT','WA','WI','WV','WY','NA'].includes(w)
      ? w  // keep state/territory abbreviations uppercase
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}
console.log(`  → ${Object.keys(mhaNames).length} MHA names`);

// ─── 3. Parse rate files ──────────────────────────────────────────────────
function parseRateFile(filename) {
  const lines = fs.readFileSync(path.join(ROOT, filename), 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const result = {};
  for (const line of lines) {
    const cols = line.split(',');
    const mha  = cols[0].trim();
    const rates = {};
    // Track which grade keys we've already seen (to skip duplicate O-7 cols)
    const seen = new Set();
    for (let i = 1; i < cols.length && i - 1 < GRADE_COLS.length; i++) {
      const grade = GRADE_COLS[i - 1];
      if (seen.has(grade)) continue;
      seen.add(grade);
      rates[grade] = Math.round(parseFloat(cols[i]));
    }
    result[mha] = rates;
  }
  return result;
}

console.log('Parsing bahw26.txt (with dependents)...');
const withDep = parseRateFile('bahw26.txt');
console.log(`  → ${Object.keys(withDep).length} MHAs`);

console.log('Parsing bahwo26.txt (without dependents)...');
const withoutDep = parseRateFile('bahwo26.txt');
console.log(`  → ${Object.keys(withoutDep).length} MHAs`);

// ─── 4. Validate ─────────────────────────────────────────────────────────
console.log('\nValidating...');
const mhaCodesInRates = new Set(Object.keys(withDep));
const mhaCodesInNames = new Set(Object.keys(mhaNames));
const mhaCodesInZips  = new Set(Object.values(zipToMha));

// Every MHA in rate files should have a name
let errors = 0;
for (const code of mhaCodesInRates) {
  if (!mhaCodesInNames.has(code)) {
    console.warn(`  WARN: Rate MHA ${code} has no name entry`);
    errors++;
  }
}
// Every MHA referenced by ZIPs (except XX499) should have rate data
for (const code of mhaCodesInZips) {
  if (code === 'XX499') continue; // territories — no rate data expected
  if (!mhaCodesInRates.has(code)) {
    console.warn(`  WARN: ZIP-referenced MHA ${code} has no rate data`);
    errors++;
  }
}
// withDep and withoutDep should have same keys
for (const code of Object.keys(withDep)) {
  if (!withoutDep[code]) {
    console.warn(`  WARN: ${code} missing from withoutDep file`);
    errors++;
  }
}

const xxCount = Object.values(zipToMha).filter(m => m === 'XX499').length;
console.log(`  XX499 (territory) ZIPs: ${xxCount} — these return null on lookup`);
console.log(errors === 0 ? '  ✓ No validation errors' : `  ✗ ${errors} validation error(s)`);

// ─── 5. Generate zipToMha.ts ──────────────────────────────────────────────
console.log('\nGenerating zipToMha.ts...');
// Build a compact single-line object (sorted by ZIP for deterministic output)
const sortedZips = Object.keys(zipToMha).sort();
const zipEntries = sortedZips.map(zip => `"${zip}":"${zipToMha[zip]}"`).join(',');

const zipToMhaContent = `\
/**
 * FY2026 ZIP code → Military Housing Area (MHA) code mapping.
 * Source: DTMO sorted_zipmha26.txt (official 2026 BAH ASCII data)
 *
 * XX499 entries are U.S. territories (Puerto Rico, etc.) that receive
 * Overseas Housing Allowance (OHA), not BAH. The BAH lookup returns
 * null for these ZIP codes.
 *
 * This file is code-split per page — only loads for BAH calculator routes.
 */

export const zipToMha: Record<string, string> = {${zipEntries}};
`;
fs.writeFileSync(path.join(OUT, 'zipToMha.ts'), zipToMhaContent);
console.log(`  → ${sortedZips.length} entries written`);

// ─── 6. Generate mhaRates.ts ──────────────────────────────────────────────
console.log('Generating mhaRates.ts...');
const sortedMhaCodes = Object.keys(withDep).sort();

// Build compact entries
const mhaRateEntries = sortedMhaCodes.map(mha => {
  const wGrades  = Object.entries(withDep[mha])
    .map(([g, r]) => `"${g}":${r}`).join(',');
  const woGrades = Object.entries(withoutDep[mha])
    .map(([g, r]) => `"${g}":${r}`).join(',');
  return `"${mha}":{w:{${wGrades}},wo:{${woGrades}}}`;
}).join(',\n  ');

const mhaRatesContent = `\
/**
 * FY2026 BAH monthly rates by Military Housing Area (MHA) code.
 * Source: DTMO bahw26.txt (with dependents) and bahwo26.txt (without dependents)
 * Effective: January 1, 2026
 *
 * w  = withDependents rates
 * wo = withoutDependents rates
 * Rates are whole-dollar integers (BAH is always a whole-dollar amount).
 *
 * O-8, O-9, O-10 use O-7 rate — map them before lookup.
 */

export const DATA_YEAR = '2026';

export interface MHARateSet {
  w:  Record<string, number>; // withDependents
  wo: Record<string, number>; // withoutDependents
}

export const mhaRates: Record<string, MHARateSet> = {
  ${mhaRateEntries}
};
`;
fs.writeFileSync(path.join(OUT, 'mhaRates.ts'), mhaRatesContent);
console.log(`  → ${sortedMhaCodes.length} MHAs written`);

// ─── 7. Generate mhaNames.ts ──────────────────────────────────────────────
console.log('Generating mhaNames.ts...');
const nameEntries = Object.keys(mhaNames).sort()
  .map(code => `"${code}":${JSON.stringify(mhaNames[code])}`).join(',\n  ');

const mhaNamesContent = `\
/**
 * FY2026 Military Housing Area (MHA) code → display name mapping.
 * Source: DTMO mhanames26.txt
 */

export const mhaNames: Record<string, string> = {
  ${nameEntries}
};
`;
fs.writeFileSync(path.join(OUT, 'mhaNames.ts'), mhaNamesContent);
console.log(`  → ${Object.keys(mhaNames).length} names written`);

console.log('\n✅ Done. Generated files in src/data/bah/2026/');
console.log('   - zipToMha.ts');
console.log('   - mhaRates.ts');
console.log('   - mhaNames.ts');
