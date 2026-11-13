#!/usr/bin/env node
/**
 * bah-import.mjs: import one year of DTMO BAH ASCII data.
 *
 *   npm run bah:import -- --year 2027 --src data/sources/dtmo/2027 [--prior 2026]
 *                         [--out src/data/bah/2027] [--report <path>] [--dry-run] [--force]
 *                         [--zip-tolerance 2] [--mha-tolerance 5]
 *
 * --src is a directory holding the four files, or DTMO's BAH-ASCII-{YYYY}.zip.
 * File names come from the year: bahw{YY}.txt, bahwo{YY}.txt,
 * sorted_zipmha{YY}.txt, mhanames{YY}.txt (matched case-insensitively, at any
 * depth inside a zip).
 *
 * Writes src/data/bah/{year}/zipToMha.ts, mhaRates.ts, mhaNames.ts in the same
 * byte format the 2026 files were generated with, plus a change report vs
 * --prior (default: year − 1, read from src/data/bah/{prior}/, i.e. the data
 * actually shipped, including any mid-year changes) at
 * docs/sources/bah-{year}-import-report.md. --dry-run writes only the report.
 *
 * Hard validation: any failure prints every problem and exits 1 without
 * writing data files. If DTMO changes the file format, this is where it stops.
 * Runbook: docs/RELEASE_DAY_BAH_2027.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ─── Args ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const a = { dryRun: false, force: false, zipTolerance: 2, mhaTolerance: 5 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const val = () => {
      const v = argv[++i];
      if (v === undefined) die(`missing value for ${k}`);
      return v;
    };
    if (k === '--year') a.year = val();
    else if (k === '--src') a.src = val();
    else if (k === '--prior') a.prior = val();
    else if (k === '--out') a.out = val();
    else if (k === '--report') a.report = val();
    else if (k === '--dry-run') a.dryRun = true;
    else if (k === '--force') a.force = true;
    else if (k === '--zip-tolerance') a.zipTolerance = Number(val());
    else if (k === '--mha-tolerance') a.mhaTolerance = Number(val());
    else die(`unknown argument ${k}`);
  }
  if (!/^\d{4}$/.test(a.year ?? '')) die('--year YYYY is required');
  if (!a.src) die('--src <dir|zip> is required');
  a.prior ??= String(Number(a.year) - 1);
  a.out ??= path.join('src', 'data', 'bah', a.year);
  a.report ??= path.join('docs', 'sources', `bah-${a.year}-import-report.md`);
  if (!(a.zipTolerance >= 0) || !(a.mhaTolerance >= 0)) die('tolerances must be non-negative numbers');
  return a;
}

function die(msg) {
  console.error(`\n✗ bah-import: ${msg}`);
  process.exit(1);
}

const abs = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// ─── Minimal ZIP reader (stored + deflate; DTMO's package is a plain zip) ────

function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) die('not a zip file (no end-of-central-directory record)');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  if (p === 0xffffffff) die('ZIP64 archives are not supported');
  const entries = new Map();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) die('corrupt zip central directory');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (/[\\/]$/.test(name)) continue;
    if (buf.readUInt32LE(local) !== 0x04034b50) die(`corrupt zip local header for ${name}`);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + csize);
    let data;
    if (method === 0) data = Buffer.from(raw);
    else if (method === 8) data = zlib.inflateRawSync(raw);
    else die(`zip entry ${name} uses unsupported compression method ${method}`);
    entries.set(name, data);
  }
  return entries;
}

/** The four input files as Buffers, keyed by their expected names. */
function loadSources(src, names) {
  const srcPath = abs(src);
  if (!fs.existsSync(srcPath)) die(`--src not found: ${src}`);
  const out = { files: {}, zipSha: null, origin: rel(srcPath) };
  let lookup;
  if (fs.statSync(srcPath).isDirectory()) {
    const dirFiles = fs.readdirSync(srcPath);
    const zips = dirFiles.filter((f) => f.toLowerCase().endsWith('.zip'));
    const hasTxt = names.every((n) => dirFiles.some((f) => f.toLowerCase() === n));
    if (!hasTxt && zips.length === 1) return loadSources(path.join(src, zips[0]), names);
    lookup = (n) => {
      const f = dirFiles.find((x) => x.toLowerCase() === n);
      return f ? fs.readFileSync(path.join(srcPath, f)) : null;
    };
  } else {
    const buf = fs.readFileSync(srcPath);
    out.zipSha = sha256(buf);
    const entries = readZip(buf);
    lookup = (n) => {
      // Entry names may use either separator (zips made on Windows use a backslash).
      const hits = [...entries.keys()].filter((k) => k.split(/[\\/]/).pop().toLowerCase() === n);
      if (hits.length > 1) die(`zip has more than one ${n}: ${hits.join(', ')}`);
      return hits.length ? entries.get(hits[0]) : null;
    };
    out.zipEntries = [...entries.keys()];
  }
  const missing = [];
  for (const n of names) {
    const b = lookup(n);
    if (!b) missing.push(n);
    else out.files[n] = b;
  }
  if (missing.length) die(`missing input file(s) in ${src}: ${missing.join(', ')}`);
  return out;
}

// ─── Parsing (same semantics as the original 2026 parser) ─────────────────────

// Columns 1–27 after the MHA code. Columns 24–27 are all the O-7 rate
// (O-7, O-8, O-9, O-10 get the same BAH).
const GRADE_COLS = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  'O-1E', 'O-2E', 'O-3E',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6',
  'O-7', 'O-7', 'O-7', 'O-7',
];
const MHA_RE = /^[A-Z]{2}\d{3}$/;
const TERRITORY = 'XX499';
const STATE_ABBR = ['AK','AL','AR','AZ','CA','CO','CT','DC','DE','FL','GA','GU','HI','IA','ID',
  'IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND',
  'NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','PR','RI','SC','SD','TN',
  'TX','UT','VA','VI','VT','WA','WI','WV','WY','NA'];

const lines = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r/g, '').trim()).filter(Boolean);

function parseZips(buf, file, errors) {
  const map = {};
  for (const [i, line] of lines(buf).entries()) {
    const parts = line.split(/\s+/);
    if (parts.length !== 2 || !/^\d{5}$/.test(parts[0]) || !MHA_RE.test(parts[1])) {
      errors.push(`${file}:${i + 1}: expected "NNNNN XX000", got ${JSON.stringify(line)}`);
      continue;
    }
    const [zip, mha] = parts;
    if (zip in map) errors.push(`${file}:${i + 1}: duplicate ZIP ${zip}`);
    map[zip] = mha;
  }
  return map;
}

function titleCase(name) {
  // "KETCHIKAN, AK" → "Ketchikan, AK" (state/territory abbreviations stay upper case)
  return name.replace(/\b\w+/g, (w) =>
    STATE_ABBR.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}

function parseNames(buf, file, errors) {
  const map = {};
  for (const [i, line] of lines(buf).entries()) {
    const idx = line.indexOf(';');
    const code = idx === -1 ? '' : line.slice(0, idx).trim();
    const name = idx === -1 ? '' : line.slice(idx + 1).trim();
    if (!MHA_RE.test(code) || !name) {
      errors.push(`${file}:${i + 1}: expected "XX000;NAME", got ${JSON.stringify(line)}`);
      continue;
    }
    if (code in map) errors.push(`${file}:${i + 1}: duplicate MHA ${code}`);
    map[code] = titleCase(name);
  }
  return map;
}

function parseRates(buf, file, errors) {
  const result = {};
  for (const [i, line] of lines(buf).entries()) {
    const at = `${file}:${i + 1}`;
    const cols = line.split(',').map((c) => c.trim());
    if (cols.length !== 28) {
      errors.push(`${at}: expected 28 columns (MHA + 27 grades), got ${cols.length}`);
      continue;
    }
    const mha = cols[0];
    if (!MHA_RE.test(mha)) errors.push(`${at}: bad MHA code ${JSON.stringify(mha)}`);
    if (mha in result) errors.push(`${at}: duplicate MHA ${mha}`);
    const nums = [];
    for (let c = 1; c < 28; c++) {
      const raw = cols[c];
      if (!/^\d+(\.\d+)?$/.test(raw)) {
        errors.push(`${at}: column ${c} (${GRADE_COLS[c - 1]}) is not a non-negative number: ${JSON.stringify(raw)}`);
        nums.push(NaN);
        continue;
      }
      const v = Number(raw);
      if (!Number.isInteger(v)) {
        errors.push(`${at}: column ${c} (${GRADE_COLS[c - 1]}) has cents: ${raw} (not rounding silently)`);
      }
      nums.push(v);
    }
    if (!(nums[23] === nums[24] && nums[24] === nums[25] && nums[25] === nums[26])) {
      errors.push(`${at}: O-7..O-10 columns 24–27 differ: ${cols.slice(24).join(',')}`);
    }
    const rates = {};
    const seen = new Set();
    GRADE_COLS.forEach((g, k) => {
      if (seen.has(g)) return;
      seen.add(g);
      rates[g] = Math.round(nums[k]);
    });
    result[mha] = rates;
  }
  return result;
}

// ─── Prior year (as shipped in src/data/bah/{prior}/) ────────────────────────

function readPrior(prior) {
  const dir = path.join(ROOT, 'src', 'data', 'bah', prior);
  const ratesFile = path.join(dir, 'mhaRates.ts');
  if (!fs.existsSync(ratesFile)) return null;
  const rates = {};
  const rowRe = /^\s*"([A-Z]{2}\d{3})":\{w:\{([^}]*)\},wo:\{([^}]*)\}\}/;
  for (const line of fs.readFileSync(ratesFile, 'utf8').split(/\r?\n/)) {
    const m = rowRe.exec(line);
    if (m) rates[m[1]] = { w: JSON.parse(`{${m[2]}}`), wo: JSON.parse(`{${m[3]}}`) };
  }
  let zipToMha = null;
  const zipFile = path.join(dir, 'zipToMha.ts');
  if (fs.existsSync(zipFile)) {
    const m = /=\s*(\{.*\});/s.exec(fs.readFileSync(zipFile, 'utf8'));
    if (m) zipToMha = JSON.parse(m[1]);
  }
  let midYear = [];
  const midFile = path.join(dir, 'midYearChanges.ts');
  if (fs.existsSync(midFile)) {
    const src = fs.readFileSync(midFile, 'utf8');
    // One block per record (from one `mhaCode:` to the next), so a record's
    // optional `temporary.expires` is never read from its neighbour.
    for (const block of src.split(/(?=mhaCode:\s*')/).slice(1)) {
      const m = /mhaCode:\s*'([A-Z]{2}\d{3})'[\s\S]*?effective:\s*'([\d-]+)'[\s\S]*?dtmoLabel:\s*'([^']*)'/.exec(block);
      if (!m) continue;
      const expires = /expires:\s*'([\d-]+)'/.exec(block)?.[1] ?? null;
      midYear.push({ mha: m[1], effective: m[2], label: m[3], expires });
    }
  }
  return { year: prior, rates, zipToMha, midYear };
}

async function loadStations() {
  try {
    const { tsImport } = await import('tsx/esm/api');
    const mod = await tsImport('../src/data/duty-stations/stations.ts', import.meta.url);
    return mod.DUTY_STATIONS.filter((s) => !s.oconus).map((s) => ({ slug: s.slug, name: s.name, zip: s.zip }));
  } catch (e) {
    console.warn(`  ⚠ could not load DUTY_STATIONS (${e.message}); station sections omitted`);
    return null;
  }
}

// ─── Generated files (byte format of the 2026 generation) ────────────────────

function genZipToMha(year, yy, zipToMha) {
  const entries = Object.keys(zipToMha).sort().map((z) => `"${z}":"${zipToMha[z]}"`).join(',');
  return `/**
 * FY${year} ZIP code → Military Housing Area (MHA) code mapping.
 * Source: DTMO sorted_zipmha${yy}.txt (official ${year} BAH ASCII data)
 *
 * XX499 entries are U.S. territories (Puerto Rico, etc.) that receive
 * Overseas Housing Allowance (OHA), not BAH. The BAH lookup returns
 * null for these ZIP codes.
 *
 * This file is code-split per page — only loads for BAH calculator routes.
 */

export const zipToMha: Record<string, string> = {${entries}};
`;
}

function genRates(year, yy, w, wo) {
  const rows = Object.keys(w).sort().map((mha) => {
    const g = (set) => Object.entries(set).map(([k, v]) => `"${k}":${v}`).join(',');
    return `"${mha}":{w:{${g(w[mha])}},wo:{${g(wo[mha])}}}`;
  }).join(',\n  ');
  return `/**
 * FY${year} BAH monthly rates by Military Housing Area (MHA) code.
 * Source: DTMO bahw${yy}.txt (with dependents) and bahwo${yy}.txt (without dependents)
 * Effective: January 1, ${year}
 *
 * w  = withDependents rates
 * wo = withoutDependents rates
 * Rates are whole-dollar integers (BAH is always a whole-dollar amount).
 *
 * O-8, O-9, O-10 use O-7 rate — map them before lookup.
 */

export const DATA_YEAR = '${year}';

export interface MHARateSet {
  w:  Record<string, number>; // withDependents
  wo: Record<string, number>; // withoutDependents
}

export const mhaRates: Record<string, MHARateSet> = {
  ${rows}
};
`;
}

function genNames(year, yy, names) {
  const rows = Object.keys(names).sort().map((c) => `"${c}":${JSON.stringify(names[c])}`).join(',\n  ');
  return `/**
 * FY${year} Military Housing Area (MHA) code → display name mapping.
 * Source: DTMO mhanames${yy}.txt
 */

export const mhaNames: Record<string, string> = {
  ${rows}
};
`;
}

// ─── Report helpers ──────────────────────────────────────────────────────────

const fmt$ = (n) => '$' + n.toLocaleString('en-US');
const pct = (a, b) => ((b - a) / a) * 100;
const fmtPct = (p) => `${p >= 0 ? '+' : '−'}${Math.abs(p).toFixed(1)}%`;
function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
/** Deterministic PRNG (mulberry32) seeded from the input hashes. */
function rng(seedHex) {
  let a = parseInt(seedHex.slice(0, 8), 16) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { year, prior } = args;
  const yy = year.slice(2);
  const names = {
    w: `bahw${yy}.txt`,
    wo: `bahwo${yy}.txt`,
    zip: `sorted_zipmha${yy}.txt`,
    names: `mhanames${yy}.txt`,
  };
  console.log(`bah-import: ${year} from ${args.src} (prior ${prior})`);
  const src = loadSources(args.src, Object.values(names));

  const errors = [];
  const warnings = [];
  const zipToMha = parseZips(src.files[names.zip], names.zip, errors);
  const mhaNames = parseNames(src.files[names.names], names.names, errors);
  const w = parseRates(src.files[names.w], names.w, errors);
  const wo = parseRates(src.files[names.wo], names.wo, errors);

  // Cross-file validation
  const wSet = new Set(Object.keys(w));
  const woSet = new Set(Object.keys(wo));
  for (const m of wSet) if (!woSet.has(m)) errors.push(`MHA ${m} is in ${names.w} but not ${names.wo}`);
  for (const m of woSet) if (!wSet.has(m)) errors.push(`MHA ${m} is in ${names.wo} but not ${names.w}`);
  for (const m of wSet) if (!(m in mhaNames)) errors.push(`rate MHA ${m} has no name in ${names.names}`);
  const zipMhas = new Set(Object.values(zipToMha));
  for (const m of zipMhas) {
    if (m !== TERRITORY && !wSet.has(m)) errors.push(`ZIP-referenced MHA ${m} has no rates`);
  }
  for (const m of wSet) if (!zipMhas.has(m)) warnings.push(`rate MHA ${m} is not referenced by any ZIP`);
  for (const m of Object.keys(mhaNames)) {
    if (m !== TERRITORY && !wSet.has(m)) warnings.push(`named MHA ${m} has no rates`);
  }

  const zipCount = Object.keys(zipToMha).length;
  const mhaCount = wSet.size;
  const territoryZips = Object.values(zipToMha).filter((m) => m === TERRITORY).length;

  // Prior-year comparison + count tolerances
  const p = readPrior(prior);
  if (!p) warnings.push(`no prior data at src/data/bah/${prior}/mhaRates.ts; count checks and change report skipped`);
  const priorMhaCount = p ? Object.keys(p.rates).length : null;
  const priorZipCount = p?.zipToMha ? Object.keys(p.zipToMha).length : null;
  if (args.zipTolerance !== 2) warnings.push(`‼ ZIP-count tolerance overridden: ±${args.zipTolerance}% (default ±2%)`);
  if (args.mhaTolerance !== 5) warnings.push(`‼ MHA-count tolerance overridden: ±${args.mhaTolerance} (default ±5)`);
  if (priorZipCount !== null) {
    const d = pct(priorZipCount, zipCount);
    if (Math.abs(d) > args.zipTolerance) {
      errors.push(`ZIP count ${zipCount} is ${fmtPct(d)} vs ${prior} (${priorZipCount}); limit ±${args.zipTolerance}% (--zip-tolerance)`);
    }
  } else if (p) {
    warnings.push(`no src/data/bah/${prior}/zipToMha.ts; ZIP-count check and ZIP remaps skipped`);
  }
  if (priorMhaCount !== null && Math.abs(mhaCount - priorMhaCount) > args.mhaTolerance) {
    errors.push(`MHA count ${mhaCount} differs from ${prior} (${priorMhaCount}) by ${mhaCount - priorMhaCount}; limit ±${args.mhaTolerance} (--mha-tolerance)`);
  }

  for (const wmsg of warnings) console.warn(`  ⚠ ${wmsg}`);
  if (errors.length) {
    console.error(`\n✗ ${errors.length} validation error(s): nothing written.`);
    for (const e of errors.slice(0, 200)) console.error(`  - ${e}`);
    if (errors.length > 200) console.error(`  … and ${errors.length - 200} more`);
    process.exit(1);
  }
  console.log(`  ✓ validated: ${zipCount} ZIPs (${territoryZips} ${TERRITORY}), ${mhaCount} MHAs, ${Object.keys(mhaNames).length} names`);

  // ── Report ──
  const stations = await loadStations();
  const R = [];
  const h = (s) => R.push('', s, '');
  R.push(`# BAH ${year} import report`);
  R.push('');
  R.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`npm run bah:import -- --year ${year} --src ${args.src}${args.prior ? ` --prior ${prior}` : ''}\`${args.dryRun ? ' (dry run)' : ''}.`);
  R.push(`Compared against the ${prior} data as shipped in \`src/data/bah/${prior}/\` (including any mid-year changes).`);
  h('## Inputs');
  R.push(`Source: \`${src.origin}\`${src.zipSha ? ` (zip SHA-256 \`${src.zipSha}\`)` : ''}`);
  R.push('');
  R.push('| file | bytes | lines | SHA-256 |', '|---|---|---|---|');
  for (const n of Object.values(names)) {
    const b = src.files[n];
    R.push(`| ${n} | ${b.length.toLocaleString('en-US')} | ${lines(b).length.toLocaleString('en-US')} | \`${sha256(b)}\` |`);
  }
  h('## Counts');
  R.push(`| | ${year} | ${prior} | change |`, '|---|---|---|---|');
  R.push(`| ZIP codes | ${zipCount.toLocaleString('en-US')} | ${priorZipCount?.toLocaleString('en-US') ?? 'n/a'} | ${priorZipCount ? `${zipCount - priorZipCount} (${fmtPct(pct(priorZipCount, zipCount))})` : 'n/a'} |`);
  R.push(`| ${TERRITORY} territory ZIPs | ${territoryZips} | ${p?.zipToMha ? Object.values(p.zipToMha).filter((m) => m === TERRITORY).length : 'n/a'} | |`);
  R.push(`| MHAs with rates | ${mhaCount} | ${priorMhaCount ?? 'n/a'} | ${priorMhaCount !== null ? mhaCount - priorMhaCount : 'n/a'} |`);
  R.push(`| MHA names | ${Object.keys(mhaNames).length} | | |`);
  if (warnings.length) {
    h('## Warnings');
    for (const wmsg of warnings) R.push(`- ${wmsg}`);
  }

  const stationByMha = {};
  const stationZipByMha = {};
  if (stations) {
    for (const s of stations) {
      const m = zipToMha[s.zip];
      if (!m) continue;
      (stationByMha[m] ??= []).push(s.name);
      stationZipByMha[m] ??= s.zip;
    }
  }
  // DTMO's online lookup takes a ZIP, not an MHA code: give one ZIP per MHA
  // (a station ZIP where there is one, else the lowest ZIP in the MHA).
  const lookupZip = {};
  for (const z of Object.keys(zipToMha).sort()) lookupZip[zipToMha[z]] ??= z;
  Object.assign(lookupZip, stationZipByMha);
  const stationMhas = Object.keys(stationByMha).sort();

  if (p) {
    const priorSet = new Set(Object.keys(p.rates));
    const added = [...wSet].filter((m) => !priorSet.has(m)).sort();
    const removed = [...priorSet].filter((m) => !wSet.has(m)).sort();
    h('## MHAs added / removed');
    R.push(`Added (${added.length}): ${added.length ? added.map((m) => `${m} ${mhaNames[m]}`).join('; ') : 'none'}`);
    R.push('');
    R.push(`Removed (${removed.length}): ${removed.length ? removed.join(', ') : 'none'}`);

    if (p.zipToMha) {
      const remapped = Object.keys(zipToMha).filter((z) => z in p.zipToMha && p.zipToMha[z] !== zipToMha[z]).sort();
      const newZips = Object.keys(zipToMha).filter((z) => !(z in p.zipToMha));
      const goneZips = Object.keys(p.zipToMha).filter((z) => !(z in zipToMha));
      h('## ZIP changes');
      R.push(`Remapped to a different MHA: **${remapped.length}**. New ZIPs: ${newZips.length}. Dropped ZIPs: ${goneZips.length}.`);
      if (remapped.length) {
        R.push('', '| ZIP | was | now |', '|---|---|---|');
        for (const z of remapped.slice(0, 20)) R.push(`| ${z} | ${p.zipToMha[z]} | ${zipToMha[z]} |`);
        if (remapped.length > 20) R.push(`| … | ${remapped.length - 20} more | |`);
      }
      const stationRemaps = (stations ?? []).filter((s) => p.zipToMha[s.zip] && p.zipToMha[s.zip] !== zipToMha[s.zip]);
      R.push('', `Station-page ZIPs remapped: ${stationRemaps.length ? stationRemaps.map((s) => `${s.name} ${s.zip} ${p.zipToMha[s.zip]}→${zipToMha[s.zip] ?? 'missing'}`).join('; ') : 'none'}`);
    }

    if (p.midYear.length) {
      h(`## ${prior} mid-year changes in the comparison base`);
      R.push(`The ${prior} rates compared below include these DTMO mid-year changes, so a "decrease" there may be the end of a temporary increase rather than a cut to the January ${prior} rate:`);
      R.push('');
      for (const m of p.midYear) R.push(`- ${m.mha} (${mhaNames[m.mha] ?? '?'}): ${m.label}, effective ${m.effective}`);
    }

    // E-5 with-dependents distribution
    const e5 = [...wSet].filter((m) => p.rates[m]?.w?.['E-5'] > 0).map((m) => {
      const a = p.rates[m].w['E-5'];
      const b = w[m]['E-5'];
      return { m, a, b, d: b - a, p: pct(a, b) };
    });
    const sortedP = e5.map((x) => x.p).sort((x, y) => x - y);
    h('## E-5 with dependents: % change distribution');
    R.push(`${e5.length} MHAs present in both years. Median ${fmtPct(quantile(sortedP, 0.5))}, p10 ${fmtPct(quantile(sortedP, 0.1))}, p90 ${fmtPct(quantile(sortedP, 0.9))}. Unchanged: ${e5.filter((x) => x.d === 0).length}. (This is not DoD's national-average increase; that figure comes only from the DoD release.)`);
    const table = (rows) => {
      R.push('| MHA | name | stations | old | new | change |', '|---|---|---|---|---|---|');
      for (const x of rows) R.push(`| ${x.m} | ${mhaNames[x.m]} | ${(stationByMha[x.m] ?? []).join(', ')} | ${fmt$(x.a)} | ${fmt$(x.b)} | ${x.d >= 0 ? '+' : '−'}${fmt$(Math.abs(x.d))} (${fmtPct(x.p)}) |`);
    };
    const byP = [...e5].sort((x, y) => y.p - x.p || x.m.localeCompare(y.m));
    h('### Top 10 by % change');
    table(byP.slice(0, 10));
    h('### Bottom 10 by % change');
    table(byP.slice(-10).reverse());

    // Decreases, every MHA × grade × dependency status
    const decreases = [];
    for (const m of wSet) {
      for (const [dep, cur] of [['w', w[m]], ['wo', wo[m]]]) {
        const old = p.rates[m]?.[dep];
        if (!old) continue;
        for (const g of Object.keys(cur)) if (old[g] !== undefined && cur[g] < old[g]) decreases.push({ m, dep, g, a: old[g], b: cur[g] });
      }
    }
    // MHAs whose prior-year rates were a temporary increase (midYearChanges.ts
    // `temporary.expires`): a lower new rate there is the temporary increase
    // ending (rate protection doesn't apply), not an ordinary decrease. Listed
    // in their own section and kept out of "## Decreases".
    const tempMid = new Map(p.midYear.filter((x) => x.expires).map((x) => [x.mha, x]));
    const tempDec = decreases.filter((d) => tempMid.has(d.m));
    h('## Temporary increase ending');
    if (!tempMid.size) {
      R.push(`No ${prior} temporary increases in the comparison base.`);
    } else {
      R.push(`These ${prior} rates were temporary increases. Rate protection doesn't apply to them (DoD 2021, DTMO 2022), so where the new rate is lower, it replaces the temporary rate. Station pages show the "temporary rates ended" wording here, not the rate-protection paragraph. Not counted under Decreases below.`);
      R.push('', '| MHA | name | stations | temporary since | expires | cells lower than the temporary rate |', '|---|---|---|---|---|---|');
      for (const [m, x] of tempMid) {
        R.push(`| ${m} | ${mhaNames[m] ?? '?'} | ${(stationByMha[m] ?? []).join(', ') || '—'} | ${x.effective} | ${x.expires} | ${tempDec.filter((d) => d.m === m).length} |`);
      }
      const tempStationDec = tempDec.filter((d) => stationByMha[d.m]).sort((x, y) => x.m.localeCompare(y.m) || x.dep.localeCompare(y.dep));
      if (tempStationDec.length) {
        R.push('', '| MHA | grade | dep | temporary | new |', '|---|---|---|---|---|');
        for (const d of tempStationDec) R.push(`| ${d.m} | ${d.g} | ${d.dep === 'w' ? 'with' : 'without'} | ${fmt$(d.a)} | ${fmt$(d.b)} |`);
      }
    }
    const ordinaryDec = decreases.filter((d) => !tempMid.has(d.m));
    const decMhas = new Set(ordinaryDec.map((d) => d.m));
    h('## Decreases');
    R.push(`**${ordinaryDec.length}** MHA × grade × dependency cells decreased, across **${decMhas.size}** MHAs${tempDec.length ? ` (not counting ${tempDec.length} cells listed under "Temporary increase ending")` : ''}.`);
    const stationDec = ordinaryDec.filter((d) => stationByMha[d.m]).sort((x, y) => x.m.localeCompare(y.m) || x.dep.localeCompare(y.dep));
    R.push('', `Station-page MHAs with a decrease: ${[...new Set(stationDec.map((d) => d.m))].length}.`);
    if (stationDec.length) {
      R.push('', '| MHA | stations | grade | dep | old | new |', '|---|---|---|---|---|---|');
      for (const d of stationDec) R.push(`| ${d.m} | ${stationByMha[d.m].join(', ')} | ${d.g} | ${d.dep === 'w' ? 'with' : 'without'} | ${fmt$(d.a)} | ${fmt$(d.b)} |`);
    }

    if (stations) {
      h('## Station-page MHAs: E-5 old → new');
      R.push('| MHA | name | stations | lookup ZIP | E-5 w/dep | E-5 w/o dep |', '|---|---|---|---|---|---|');
      for (const m of stationMhas) {
        const o = p.rates[m];
        const cell = (dep) => (o ? `${fmt$(o[dep]['E-5'])} → ${fmt$((dep === 'w' ? w : wo)[m]['E-5'])}` : `new: ${fmt$((dep === 'w' ? w : wo)[m]['E-5'])}`);
        R.push(`| ${m} | ${mhaNames[m]} | ${stationByMha[m].join(', ')} | ${lookupZip[m]} | ${cell('w')} | ${cell('wo')} |`);
      }
    }
  }

  // Spot-check sample
  const seed = sha256(Buffer.concat([src.files[names.w], src.files[names.wo]]));
  const rand = rng(seed);
  const mhaList = [...wSet].sort();
  const grades = Object.keys(w[mhaList[0]]);
  const picked = new Set();
  const samples = [];
  while (samples.length < Math.min(10, mhaList.length * grades.length * 2)) {
    const m = mhaList[Math.floor(rand() * mhaList.length)];
    const g = grades[Math.floor(rand() * grades.length)];
    const dep = rand() < 0.5 ? 'w' : 'wo';
    const key = `${m}|${g}|${dep}`;
    if (picked.has(key)) continue;
    picked.add(key);
    samples.push({ m, g, dep, v: (dep === 'w' ? w : wo)[m][g] });
  }
  h('## Spot-check sample (verify against the DTMO online BAH lookup)');
  R.push(`10 cells chosen by a PRNG seeded from the rate files' SHA-256 (\`${seed.slice(0, 8)}\`), so a re-run picks the same cells. Enter the lookup ZIP in DTMO's BAH calculator (it takes a ZIP, not an MHA code).`);
  R.push('', '| # | MHA | name | lookup ZIP | grade | dependents | monthly | ✓ |', '|---|---|---|---|---|---|---|---|');
  samples.forEach((s, i) => R.push(`| ${i + 1} | ${s.m} | ${mhaNames[s.m]} | ${lookupZip[s.m]} | ${s.g} | ${s.dep === 'w' ? 'with' : 'without'} | ${fmt$(s.v)} | ☐ |`));
  R.push('');

  const reportPath = abs(args.report);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, R.join('\n'));
  console.log(`  → report: ${rel(reportPath)}`);

  if (args.dryRun) {
    console.log('  dry run: no data files written.');
    return;
  }
  const outDir = abs(args.out);
  if (fs.existsSync(path.join(outDir, 'mhaRates.ts')) && !args.force) {
    die(`${rel(outDir)}/mhaRates.ts already exists. Use --out <dir> for a scratch import, or --force to overwrite (that would also drop any hand-applied mid-year change).`);
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'zipToMha.ts'), genZipToMha(year, yy, zipToMha));
  fs.writeFileSync(path.join(outDir, 'mhaRates.ts'), genRates(year, yy, w, wo));
  fs.writeFileSync(path.join(outDir, 'mhaNames.ts'), genNames(year, yy, mhaNames));
  console.log(`  → wrote ${rel(outDir)}/zipToMha.ts, mhaRates.ts, mhaNames.ts`);
}

main().catch((e) => die(e.stack ?? String(e)));
