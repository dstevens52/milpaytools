/**
 * P1 performance, Step 1 items 3 and 5: what the first-load JS of a page is made of.
 *
 * Needs a build made with browser source maps (CI patches `productionBrowserSourceMaps: true`
 * into a throwaway copy of next.config.ts; the repo's config is unchanged) and the output of
 * route-weights.ts (which chunks each page loaded).
 *
 *   npx tsx scripts/perf/attribute-chunks.ts --weights perf-out/route-weights.json --out perf-out/attribution.json
 *
 * Every byte of each chunk is attributed to the source file its source-map segment points at,
 * then grouped: npm package (`node_modules/<pkg>`), app source file (`src/...`), or unmapped
 * (runtime glue and code with no mapping). Counts are characters of minified output, which for
 * this ASCII output equal bytes; gzip shares are the file's gzip size split pro rata (an estimate).
 *
 * Also lists every `src/data/**` and `src/lib/**` module found in ANY browser chunk, with the
 * pages that load that chunk: the "data shipped to the browser" check (item 5).
 */
import { SourceMapConsumer, type RawSourceMap } from 'source-map-js';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOP_TRAFFIC, TRACE_PAGES } from './pages';

function arg(name: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) throw new Error(`missing --${name}`);
  return process.argv[i + 1];
}
const WEIGHTS = arg('weights');
const OUT = arg('out');
const NEXT_DIR = '.next';

type Weights = { pages: { path: string; js: { files: { file: string; raw: number; gz: number }[] } }[] };
const weights: Weights = JSON.parse(readFileSync(WEIGHTS, 'utf8'));

function group(source: string | null): string {
  if (!source) return '(unmapped)';
  const s = decodeURIComponent(source).replace(/\\/g, '/');
  const nm = s.lastIndexOf('node_modules/');
  if (nm !== -1) {
    const rest = s.slice(nm + 'node_modules/'.length).split('/');
    return `npm:${rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0]}`;
  }
  const src = s.indexOf('/src/');
  if (src !== -1) return s.slice(src + 1);
  if (s.startsWith('src/')) return s;
  return `other:${s.replace(/^turbopack:\/\/\/?/, '').slice(0, 120)}`;
}

/** chars per group for one chunk file */
const cache = new Map<string, { total: number; groups: Record<string, number>; mapped: boolean }>();
function attribute(file: string) {
  const hit = cache.get(file);
  if (hit) return hit;
  const code = readFileSync(file, 'utf8');
  const lines = code.split('\n');
  const total = code.length;
  const groups: Record<string, number> = {};
  const add = (g: string, n: number) => {
    if (n > 0) groups[g] = (groups[g] ?? 0) + n;
  };
  const mapFile = `${file}.map`;
  let mapped = false;
  if (existsSync(mapFile)) {
    mapped = true;
    const raw = JSON.parse(readFileSync(mapFile, 'utf8')) as RawSourceMap;
    const consumer = new SourceMapConsumer(raw);
    const segs: { line: number; col: number; source: string | null }[] = [];
    consumer.eachMapping((m) => segs.push({ line: m.generatedLine, col: m.generatedColumn, source: m.source ?? null }));
    segs.sort((a, b) => a.line - b.line || a.col - b.col);
    let i = 0;
    for (let ln = 1; ln <= lines.length; ln++) {
      const len = lines[ln - 1].length;
      let pos = 0;
      let cur: string | null = null;
      while (i < segs.length && segs[i].line < ln) i++;
      while (i < segs.length && segs[i].line === ln) {
        const col = Math.min(segs[i].col, len);
        add(cur === null && pos === 0 ? '(unmapped)' : group(cur), col - pos);
        pos = col;
        cur = segs[i].source;
        i++;
      }
      add(cur === null ? '(unmapped)' : group(cur), len - pos);
      add('(unmapped)', ln < lines.length ? 1 : 0); // the newline
    }
  } else {
    add('(no source map)', total);
  }
  const res = { total, groups, mapped };
  cache.set(file, res);
  return res;
}

function chunkPath(url: string): string | null {
  const m = url.match(/\/_next\/(static\/[^?#]+\.js)/);
  return m ? join(NEXT_DIR, m[1]) : null;
}

type Row = { group: string; raw: number; gzEst: number };
function pageBreakdown(path: string) {
  const p = weights.pages.find((x) => x.path === path);
  if (!p) return null;
  const totals: Record<string, { raw: number; gz: number }> = {};
  let thirdPartyOrInline = 0;
  for (const f of p.js.files) {
    const cp = chunkPath(f.file);
    if (!cp || !existsSync(cp)) {
      thirdPartyOrInline += f.raw;
      continue;
    }
    const a = attribute(cp);
    for (const [g, n] of Object.entries(a.groups)) {
      const share = n / a.total;
      totals[g] ??= { raw: 0, gz: 0 };
      totals[g].raw += share * f.raw;
      totals[g].gz += share * f.gz;
    }
  }
  const rows: Row[] = Object.entries(totals)
    .map(([g, v]) => ({ group: g, raw: Math.round(v.raw), gzEst: Math.round(v.gz) }))
    .sort((a, b) => b.raw - a.raw);
  // Roll npm packages and app folders up for a readable top list.
  const rollup: Record<string, { raw: number; gzEst: number }> = {};
  for (const r of rows) {
    const key = r.group.startsWith('npm:')
      ? r.group
      : r.group.startsWith('src/')
        ? r.group.split('/').slice(0, r.group.startsWith('src/components/') || r.group.startsWith('src/data/') ? 3 : 2).join('/')
        : r.group;
    rollup[key] ??= { raw: 0, gzEst: 0 };
    rollup[key].raw += r.raw;
    rollup[key].gzEst += r.gzEst;
  }
  return {
    path,
    jsRaw: p.js.files.reduce((s, f) => s + f.raw, 0),
    jsGz: p.js.files.reduce((s, f) => s + f.gz, 0),
    notFromBuild: thirdPartyOrInline,
    rollup: Object.entries(rollup)
      .map(([group, v]) => ({ group, ...v }))
      .sort((a, b) => b.raw - a.raw),
    files: rows.filter((r) => r.group.startsWith('src/')),
  };
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

const pages = [...new Set<string>([...TRACE_PAGES.map((t) => t.path), ...TOP_TRAFFIC])];
const breakdowns = pages.map(pageBreakdown).filter(Boolean);

// Item 5: src/data and src/lib modules in any browser chunk, and which pages load that chunk.
const chunkToPages = new Map<string, string[]>();
for (const p of weights.pages)
  for (const f of p.js.files) {
    const cp = chunkPath(f.file);
    if (cp) chunkToPages.set(cp, [...(chunkToPages.get(cp) ?? []), p.path]);
  }
const allChunks = walk(join(NEXT_DIR, 'static'));
const shipped: Record<string, { chars: number; chunks: string[]; pages: Set<string> }> = {};
let unmappedChunks = 0;
for (const c of allChunks) {
  const a = attribute(c);
  if (!a.mapped) unmappedChunks++;
  for (const [g, n] of Object.entries(a.groups)) {
    if (!g.startsWith('src/data/') && !g.startsWith('src/lib/')) continue;
    shipped[g] ??= { chars: 0, chunks: [], pages: new Set() };
    shipped[g].chars += n;
    shipped[g].chunks.push(c.replace(/\\/g, '/'));
    for (const pg of chunkToPages.get(c) ?? []) shipped[g].pages.add(pg);
  }
}
const dataInBrowser = Object.entries(shipped)
  .map(([module, v]) => ({
    module,
    chars: v.chars,
    chunks: v.chunks.length,
    pagesLoadingIt: v.pages.size,
    examplePages: [...v.pages].slice(0, 8),
  }))
  .sort((a, b) => b.chars - a.chars);

writeFileSync(
  OUT,
  JSON.stringify({ chunksScanned: allChunks.length, chunksWithoutMap: unmappedChunks, pages: breakdowns, dataInBrowser }, null, 2),
);
console.log(`chunks scanned ${allChunks.length}, without source map ${unmappedChunks}`);
for (const b of breakdowns) {
  if (!b) continue;
  console.log(`\n${b.path}: ${(b.jsRaw / 1024).toFixed(1)} KB raw / ${(b.jsGz / 1024).toFixed(1)} KB gz`);
  for (const r of b.rollup.slice(0, 15)) console.log(`  ${r.group.padEnd(55)} ${(r.raw / 1024).toFixed(1).padStart(7)} KB  gz~${(r.gzEst / 1024).toFixed(1)} KB`);
}
console.log('\nsrc/data + src/lib modules in browser chunks (top 25):');
for (const d of dataInBrowser.slice(0, 25))
  console.log(`  ${d.module.padEnd(60)} ${(d.chars / 1024).toFixed(1).padStart(7)} KB  pages ${d.pagesLoadingIt}`);
