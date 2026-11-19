/**
 * P1 performance, Step 1 items 3 and 5: what each route's browser JS is made of, from the
 * Turbopack analyzer (`next experimental-analyze -o` writes .next/diagnostics/analyze/data/<route>/analyze.data).
 * Tooling only.
 *
 *   npx tsx scripts/perf/analyze-modules.ts --dir .next/diagnostics/analyze/data --out perf-out/modules.json
 *
 * analyze.data = 4-byte big-endian header length + JSON header + binary tail. The header has
 * `sources` (a path tree: each entry is a path segment with parent_source_index),
 * `output_files` and `chunk_parts` ({source_index, output_file_index, size, compressed_size}).
 * Only client JS counts here: output files under /_next/static/ ending in .js. The nomodule
 * polyfill is reported apart (modern browsers don't download it). Sizes are the analyzer's
 * own (minified output bytes, and its compressed estimate); they cover every client chunk of the
 * route, so they can exceed the measured first-load JS when a route has lazy chunks.
 *
 * Why not source maps: Turbopack 16.2 ignores productionBrowserSourceMaps (CI run 44612766179:
 * 51 of 52 chunks had no map).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TOP_TRAFFIC, TRACE_PAGES } from './pages';

function arg(name: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) throw new Error(`missing --${name}`);
  return process.argv[i + 1];
}
const DIR = arg('dir');
const OUT = arg('out');

type Header = {
  sources: { parent_source_index: number | null; path: string }[];
  output_files: { filename: string }[];
  chunk_parts: { source_index: number; output_file_index: number; size: number; compressed_size: number }[];
};

function readHeader(file: string): Header {
  const b = readFileSync(file);
  const n = b.readUInt32BE(0);
  return JSON.parse(b.subarray(4, 4 + n).toString('utf8'));
}

function group(path: string): string {
  const s = path.replace(/^\[project\]\//, '');
  const nm = s.lastIndexOf('node_modules/');
  if (nm !== -1) {
    const rest = s.slice(nm + 13).split('/');
    const pkg = rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0];
    if (pkg === 'next') {
      const sub = rest.slice(1).join('/');
      if (sub.includes('compiled/react-dom')) return 'npm:react-dom (via next)';
      if (sub.includes('compiled/react-server-dom')) return 'npm:react-server-dom (via next)';
      if (sub.includes('compiled/react/') || sub.includes('compiled/react-jsx')) return 'npm:react (via next)';
      return 'npm:next (router/runtime)';
    }
    return `npm:${pkg}`;
  }
  return s;
}

function analyze(file: string) {
  const h = readHeader(file);
  const memo = new Map<number, string>();
  const full = (i: number): string => {
    if (memo.has(i)) return memo.get(i)!;
    const s = h.sources[i];
    const p = s ? (s.parent_source_index != null && s.parent_source_index >= 0 ? full(s.parent_source_index) : '') + s.path : '';
    memo.set(i, p);
    return p;
  };
  const isClientJs = h.output_files.map((f) => f.filename.includes('/_next/static/') && f.filename.endsWith('.js'));
  const files: Record<string, { size: number; gz: number }> = {};
  const groups: Record<string, { size: number; gz: number }> = {};
  let size = 0;
  let gz = 0;
  let nomodule = 0;
  for (const p of h.chunk_parts) {
    if (!isClientJs[p.output_file_index]) continue;
    const path = full(p.source_index);
    if (path.includes('polyfill-nomodule')) {
      nomodule += p.size;
      continue;
    }
    size += p.size;
    gz += p.compressed_size;
    const g = group(path);
    groups[g] ??= { size: 0, gz: 0 };
    groups[g].size += p.size;
    groups[g].gz += p.compressed_size;
    if (!g.startsWith('npm:')) {
      files[g] ??= { size: 0, gz: 0 };
      files[g].size += p.size;
      files[g].gz += p.compressed_size;
    }
  }
  const sorted = (o: Record<string, { size: number; gz: number }>) =>
    Object.entries(o)
      .map(([k, v]) => ({ module: k, ...v }))
      .sort((a, b) => b.size - a.size);
  return { clientJs: size, clientJsCompressed: gz, nomodulePolyfill: nomodule, groups: sorted(groups), appFiles: sorted(files) };
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e === 'analyze.data') out.push(p);
  }
  return out;
}

const all = walk(DIR).map((f) => {
  const route = '/' + relative(DIR, f).replace(/\\/g, '/').replace(/\/?analyze\.data$/, '');
  return { route: route === '/' ? '/' : route, ...analyze(f) };
});
if (all.length === 0) throw new Error(`no analyze.data under ${DIR}`);

// The pages this report names, mapped to their route patterns.
const routeFor = (path: string) =>
  all.find((r) => r.route === path)?.route ??
  all.find((r) => new RegExp('^' + r.route.replace(/\[[^\]]+\]/g, '[^/]+') + '$').test(path))?.route;
const named = [...new Set([...TRACE_PAGES.map((t) => t.path), ...TOP_TRAFFIC])].map((p) => ({ page: p, route: routeFor(p) }));

// Item 5: data/lib modules in client JS, and how many routes ship each.
const dataModules: Record<string, { size: number; routes: string[] }> = {};
for (const r of all)
  for (const f of r.appFiles)
    if (f.module.startsWith('src/data/') || f.module.startsWith('src/lib/')) {
      dataModules[f.module] ??= { size: f.size, routes: [] };
      dataModules[f.module].routes.push(r.route);
    }

const pageRoutes = all.filter((r) => !r.route.startsWith('/api/') && r.clientJs > 0);
writeFileSync(
  OUT,
  JSON.stringify(
    {
      routes: all.map(({ route, clientJs, clientJsCompressed, nomodulePolyfill, groups, appFiles }) => ({
        route, clientJs, clientJsCompressed, nomodulePolyfill, groups: groups.slice(0, 30), appFiles: appFiles.slice(0, 40),
      })),
      named,
      dataModules: Object.entries(dataModules)
        .map(([module, v]) => ({ module, size: v.size, routeCount: v.routes.length, routes: v.routes }))
        .sort((a, b) => b.size - a.size),
    },
    null,
    2,
  ),
);
console.log(`routes analyzed: ${all.length} (${pageRoutes.length} with client JS)`);
for (const r of [...pageRoutes].sort((a, b) => b.clientJs - a.clientJs).slice(0, 15))
  console.log(`${r.route.padEnd(45)} ${(r.clientJs / 1024).toFixed(1).padStart(7)} KB  compressed ${(r.clientJsCompressed / 1024).toFixed(1)} KB`);
