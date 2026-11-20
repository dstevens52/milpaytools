/**
 * REHEARSAL ONLY (branch rehearsal/bah-2027-r2, never merged).
 *
 * Writes a SYNTHETIC "2027" DTMO BAH ASCII package to
 * data/sources/dtmo/2027-rehearsal/ from the real 2026 files in
 * data/sources/dtmo/2026/, in the identical format and file names DTMO uses
 * (bahw27.txt, bahwo27.txt, sorted_zipmha27.txt, mhanames27.txt), so the
 * release-day importer and every page can be exercised with increases,
 * decreases, unchanged rates, the end of TX270's temporary increase and
 * remapped ZIPs. These are NOT DTMO rates.
 *
 *   npx tsx scripts/rehearsal/make-fake-dtmo-2027.ts
 *
 * Deterministic: every choice comes from sha256(SEED + ':' + purpose + ':' + key).
 * Line endings are copied per line from the source files.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SEED = 'milpaytools-bah-r2-2026-11-20';
const ROOT = process.cwd();
const SRC = path.join(ROOT, 'data', 'sources', 'dtmo', '2026');
const OUT = path.join(ROOT, 'data', 'sources', 'dtmo', '2027-rehearsal');

/** TX270's 2026 rates as shipped (May 16, 2026 temporary increase), from src/data/bah/2026/mhaRates.ts. */
const TX270 = 'TX270';
/** Stations the specs and runbook lean on; never remapped. */
const REFERENCE_ZIPS = new Set(['28301', '28310', '76544', '92134', '98433', '79607', '23511', '78234', '76549']);

const h = (purpose: string, key: string) =>
  createHash('sha256').update(`${SEED}:${purpose}:${key}`).digest();
const hnum = (purpose: string, key: string) => h(purpose, key).readUInt32BE(0);

/** Split into [content, eol] pairs, keeping each line's own terminator. */
function lines(buf: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /([^\r\n]*)(\r\n|\n|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(buf)) && m[0] !== '') {
    out.push([m[1], m[2]]);
  }
  return out;
}
const join = (ls: [string, string][]) => ls.map(([c, e]) => c + e).join('');

const read = (f: string) => readFileSync(path.join(SRC, f), 'latin1');
const w26 = lines(read('bahw26.txt'));
const wo26 = lines(read('bahwo26.txt'));
const names26 = read('mhanames26.txt');
const zip26 = lines(read('sorted_zipmha26.txt'));

const mhas = w26.map(([c]) => c.split(',')[0]);
if (mhas.length !== 338) throw new Error(`expected 338 MHAs, got ${mhas.length}`);

// ── Rate classes ─────────────────────────────────────────────────────────────
const byHash = (purpose: string, list: string[]) =>
  [...list].sort((a, b) => hnum(purpose, a) - hnum(purpose, b) || a.localeCompare(b));
const pool = mhas.filter((m) => m !== TX270);
const DECREASE = byHash('decrease', pool).slice(0, 40).sort();
const UNCHANGED = byHash('unchanged', pool.filter((m) => !DECREASE.includes(m))).slice(0, 10).sort();

type Rule = { kind: 'increase' | 'decrease' | 'unchanged' | 'tx270'; pct: number };
function rule(m: string): Rule {
  if (m === TX270) return { kind: 'tx270', pct: 4 };
  if (DECREASE.includes(m)) return { kind: 'decrease', pct: -(1 + (hnum('dec-pct', m) % 5)) };
  if (UNCHANGED.includes(m)) return { kind: 'unchanged', pct: 0 };
  return { kind: 'increase', pct: 1 + (hnum('inc-pct', m) % 9) };
}

function transform(ls: [string, string][]): [string, string][] {
  return ls.map(([c, e]) => {
    const [m, ...vals] = c.split(',');
    const r = rule(m);
    const out = vals.map((v) => {
      const n = Number(v);
      if (!Number.isFinite(n) || !/^\d+\.00$/.test(v)) throw new Error(`${m}: unexpected value ${v}`);
      return `${Math.round(n * (1 + r.pct / 100))}.00`;
    });
    return [[m, ...out].join(','), e];
  });
}

const w27 = transform(w26);
const wo27 = transform(wo26);

// TX270 must land below its 2026 temporary rate in every cell (end of the temporary increase).
const TX270_TEMP_2026 = (() => {
  const src = readFileSync(path.join(ROOT, 'src', 'data', 'bah', '2026', 'mhaRates.ts'), 'utf8');
  const row = src.match(/"TX270":\{w:\{([^}]*)\},wo:\{([^}]*)\}\}/);
  if (!row) throw new Error('TX270 row not found in src/data/bah/2026/mhaRates.ts');
  const parse = (s: string) => Object.fromEntries([...s.matchAll(/"([^"]+)":(\d+)/g)].map((x) => [x[1], Number(x[2])]));
  return { w: parse(row[1]), wo: parse(row[2]) };
})();
const GRADES = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'W-1', 'W-2', 'W-3', 'W-4', 'W-5', 'O-1E', 'O-2E', 'O-3E', 'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'];
for (const [set, temp] of [[w27, TX270_TEMP_2026.w], [wo27, TX270_TEMP_2026.wo]] as const) {
  const vals = set.find(([c]) => c.startsWith(`${TX270},`))![0].split(',').slice(1).map(Number);
  GRADES.forEach((g, i) => {
    if (!(vals[i] < temp[g])) throw new Error(`TX270 ${g}: fake 2027 ${vals[i]} is not below the 2026 temporary ${temp[g]}`);
  });
}

// ── ZIP remaps: 2 ordinary ZIPs + 1 station-page ZIP, each to another MHA in its state ──
const zipRows = zip26.map(([c, e]) => {
  const [zip, mha] = c.trim().split(/\s+/);
  return { zip, mha, e, raw: c };
});
const zipsPerMha = new Map<string, number>();
for (const r of zipRows) zipsPerMha.set(r.mha, (zipsPerMha.get(r.mha) ?? 0) + 1);
const stateMhas = (st: string) => mhas.filter((m) => m.startsWith(st));
const stationsSrc = readFileSync(path.join(ROOT, 'src', 'data', 'duty-stations', 'stations.ts'), 'utf8');
const stationZips = new Set([...stationsSrc.matchAll(/zip: '(\d{5})'/g)].map((m) => m[1]));
const movable = (r: { zip: string; mha: string }) =>
  /^[A-Z]{2}\d{3}$/.test(r.mha) && !r.mha.startsWith('XX') && !REFERENCE_ZIPS.has(r.zip) &&
  (zipsPerMha.get(r.mha) ?? 0) > 1 && stateMhas(r.mha.slice(0, 2)).length > 1;

const ordinary = byHash('zip', zipRows.filter((r) => movable(r) && !stationZips.has(r.zip)).map((r) => r.zip)).slice(0, 2);
const station = byHash('station-zip', zipRows.filter((r) => movable(r) && stationZips.has(r.zip)).map((r) => r.zip)).slice(0, 1);
const REMAPS: { zip: string; from: string; to: string; stationZip: boolean }[] = [];
for (const zip of [...ordinary, ...station]) {
  const r = zipRows.find((x) => x.zip === zip)!;
  const others = stateMhas(r.mha.slice(0, 2)).filter((m) => m !== r.mha);
  const to = others[hnum('zip-to', zip) % others.length];
  REMAPS.push({ zip, from: r.mha, to, stationZip: stationZips.has(zip) });
  r.raw = r.raw.replace(r.mha, to);
  r.mha = to;
}
const zip27: [string, string][] = zipRows.map((r) => [r.raw, r.e]);

// ── Write ────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, 'bahw27.txt'), join(w27), 'latin1');
writeFileSync(path.join(OUT, 'bahwo27.txt'), join(wo27), 'latin1');
writeFileSync(path.join(OUT, 'mhanames27.txt'), names26, 'latin1');
writeFileSync(path.join(OUT, 'sorted_zipmha27.txt'), join(zip27), 'latin1');

const manifest = {
  seed: SEED,
  note: 'Synthetic data generated for a rehearsal. Not DTMO rates.',
  increases: mhas.filter((m) => rule(m).kind === 'increase').length,
  decreases: DECREASE.map((m) => ({ mha: m, pct: rule(m).pct })),
  unchanged: UNCHANGED,
  tx270: 'January 2026 DTMO ASCII rates +4%: below the 2026 temporary increase in every cell',
  remaps: REMAPS,
  increasePctByMha: Object.fromEntries(mhas.filter((m) => rule(m).kind === 'increase').map((m) => [m, rule(m).pct])),
};
writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ ...manifest, increasePctByMha: undefined }, null, 2));
