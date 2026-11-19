/**
 * P1 performance: turn the measurement JSON into the Markdown tables for the report and the CI
 * job summary. Tooling only.
 *
 *   npx tsx scripts/perf/summarize.ts perf-out > perf-out/summary.md
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOP_TRAFFIC } from './pages';

const dir = process.argv[2] ?? 'perf-out';
const read = (f: string) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null);
const kb = (n: number) => (n / 1024).toFixed(1);
const out: string[] = [];
const p = (s = '') => out.push(s);

type W = { path: string; status: number; html: { raw: number; gz: number; rscInline: number; jsonLd: number; rscTopRows: { bytes: number; preview: string }[] }; js: { count: number; firstPartyRaw: number; firstPartyGz: number; thirdPartyRaw: number }; css: { raw: number; gz: number } };
const rw = read('route-weights.json') as { pages: W[] } | null;
if (rw) {
  const pages = rw.pages.filter((x) => x.status === 200);
  p(`## 1. First-load JS per page (local production build, ${pages.length} sitemap pages)`);
  p('First-party = `/_next/static` chunks fetched before the page went quiet. Sorted by gzip.');
  p();
  const row = (x: W) => `| ${x.path} | ${x.js.count} | ${kb(x.js.firstPartyRaw)} | ${kb(x.js.firstPartyGz)} | ${kb(x.css.raw)} |`;
  const head = ['| Page | JS files | JS raw KB | JS gzip KB | CSS raw KB |', '|---|---:|---:|---:|---:|'];
  p('**15 heaviest**');
  p(head.join('\n'));
  [...pages].sort((a, b) => b.js.firstPartyGz - a.js.firstPartyGz).slice(0, 15).forEach((x) => p(row(x)));
  p();
  p('**Top-traffic pages**');
  p(head.join('\n'));
  TOP_TRAFFIC.forEach((t) => {
    const x = pages.find((y) => y.path === t);
    p(x ? row(x) : `| ${t} | missing | | | |`);
  });
  const fp = pages.map((x) => x.js.firstPartyGz).sort((a, b) => a - b);
  p();
  p(`Median first-party JS (gzip) across all pages: ${kb(fp[Math.floor(fp.length / 2)])} KB; min ${kb(fp[0])} KB; max ${kb(fp[fp.length - 1])} KB.`);
  p();
  p('## 2b/5. HTML composition (local build): RSC payload = data serialized for hydration');
  p('| Page | HTML raw KB | HTML gzip KB | RSC payload KB | JSON-LD KB | Largest RSC row KB | Largest row starts with |');
  p('|---|---:|---:|---:|---:|---:|---|');
  const htmlRows = [...new Set([...TOP_TRAFFIC, ...[...pages].sort((a, b) => b.html.raw - a.html.raw).slice(0, 8).map((x) => x.path)])];
  htmlRows.forEach((t) => {
    const x = pages.find((y) => y.path === t);
    if (!x) return;
    const top = x.html.rscTopRows[0];
    p(`| ${x.path} | ${kb(x.html.raw)} | ${kb(x.html.gz)} | ${kb(x.html.rscInline)} | ${kb(x.html.jsonLd)} | ${top ? kb(top.bytes) : '-'} | \`${top ? top.preview.slice(0, 70).replace(/\|/g, '\\|').replace(/`/g, "'") : ''}\` |`);
  });
  p();
}

const mod = read('modules.json') as {
  routes: { route: string; clientJs: number; clientJsCompressed: number; nomodulePolyfill: number; groups: { module: string; size: number; gz: number }[] }[];
  named: { page: string; route?: string }[];
  dataModules: { module: string; size: number; routeCount: number; routes: string[] }[];
} | null;
if (mod) {
  p('## 3. What each route’s client JS is made of (Turbopack analyzer; all client chunks of the route; nomodule polyfill excluded)');
  for (const route of [...new Set(mod.named.map((n) => n.route).filter(Boolean))] as string[]) {
    const r = mod.routes.find((x) => x.route === route);
    if (!r) continue;
    p(`**${route}** — ${kb(r.clientJs)} KB minified / ${kb(r.clientJsCompressed)} KB compressed`);
    p('| Module or package | KB | compressed KB |');
    p('|---|---:|---:|');
    r.groups.slice(0, 10).forEach((g) => p(`| ${g.module} | ${kb(g.size)} | ${kb(g.gz)} |`));
    p();
  }
  p('## 5. `src/data` and `src/lib` modules in client JS (top 20)');
  p('| Module | KB (minified) | routes shipping it |');
  p('|---|---:|---|');
  mod.dataModules.slice(0, 20).forEach((d) => p(`| ${d.module} | ${kb(d.size)} | ${d.routeCount}: ${d.routes.slice(0, 8).join(', ')}${d.routeCount > 8 ? ', …' : ''} |`));
  p();
}

type Metrics = { longTasks: number; longTaskMs: number; blockingMs: number; topLongTasks: { start: number; ms: number }[]; topScripts: { src: string; fn: string; invoker: string; type: string; ms: number; forcedLayout: number }[]; interactions: { name: string; target: string; duration: number; inputDelay: number; processing: number; presentation: number }[]; worstInteractionMs: number; manual: { type: string; ms: number }[]; error?: string };
type Run = { status: number; title: string; fcp: number | null; lcp: number | null; nav: { domNodes: number; load: number | null; scripts: { url: string; start: number; end: number; transfer: number; decoded: number }[] }; load: Metrics; loadProfile: { bySource: { k: string; ms: number }[]; byFunction: { k: string; ms: number }[] } | null; interactions: { name: string; label: string; changed: boolean; before: string; after: string; profile: { bySource: { k: string; ms: number }[]; byFunction: { k: string; ms: number }[] } | null; metrics: Metrics }[]; blockedCount: number; blockedRequests: string[] };
const median = (xs: number[]) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : NaN;
};
for (const [file, label] of [
  ['trace-local.json', 'local build, Chromium Pixel 7, 4× CPU'],
  ['trace-webkit.json', 'local build, WebKit iPhone 14, no throttling (input → next frame only)'],
  ['trace-prod.json', 'production with analytics running (collection blocked), Chromium Pixel 7, 4× CPU'],
] as const) {
  const t = read(file) as { runs: number; pages: { path: string; runs: Run[]; profiled: Run | null }[] } | null;
  if (!t) continue;
  p(`## 4/6. Main thread — ${label} (${t.runs} runs, median)`);
  p('| Page | status | DOM nodes | FCP ms | LCP ms | load long tasks | long-task ms | blocking ms (TBT-like) | interaction | worst interaction ms (Event Timing) | input→next frame ms | value changed |');
  p('|---|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---|');
  for (const pg of t.pages) {
    const r0 = pg.runs[0];
    const names = r0.interactions.map((i) => i.name);
    names.forEach((n, idx) => {
      const ms = pg.runs.map((r) => r.interactions[idx]?.metrics.worstInteractionMs ?? NaN);
      const man = pg.runs.map((r) => Math.max(0, ...(r.interactions[idx]?.metrics.manual ?? []).map((m) => m.ms)));
      const changed = pg.runs.every((r) => r.interactions[idx]?.changed);
      p(`| ${idx === 0 ? pg.path : ''} | ${idx === 0 ? r0.status : ''} | ${idx === 0 ? median(pg.runs.map((r) => r.nav.domNodes)) : ''} | ${idx === 0 ? median(pg.runs.map((r) => r.fcp ?? NaN)) : ''} | ${idx === 0 ? median(pg.runs.map((r) => r.lcp ?? NaN)) : ''} | ${idx === 0 ? median(pg.runs.map((r) => r.load.longTasks)) : ''} | ${idx === 0 ? median(pg.runs.map((r) => r.load.longTaskMs)) : ''} | ${idx === 0 ? median(pg.runs.map((r) => r.load.blockingMs)) : ''} | ${n} | ${median(ms)} | ${median(man)} | ${changed ? 'yes' : 'NO'} |`);
    });
  }
  p();
  for (const pg of t.pages) {
    const r = pg.runs[0];
    p(`**${pg.path}** — run 1 top long tasks during load: ${r.load.topLongTasks.map((x) => `${x.ms} ms @${x.start}`).join(', ') || 'none'}`);
    p('Top LoAF scripts during load (run 1): ' + (r.load.topScripts.slice(0, 6).map((s) => `${s.ms} ms ${s.type} \`${(s.src || '').slice(0, 60)}\` ${s.fn ? `fn ${s.fn}` : ''} ${s.invoker ? `(${s.invoker.slice(0, 50)})` : ''}`).join('; ') || 'none'));
    r.interactions.forEach((i) => {
      const m = i.metrics;
      p(`- ${i.name} on \`${i.label}\` (${i.before} → ${i.after}): ${m.interactions.map((x) => `${x.name} ${x.duration} ms [delay ${x.inputDelay} / processing ${x.processing} / presentation ${x.presentation}]`).join(', ') || 'no Event Timing entry ≥16 ms'}${m.error ? ` ERROR ${m.error}` : ''}`);
      if (m.topScripts.length) p(`  - LoAF scripts: ${m.topScripts.slice(0, 4).map((s) => `${s.ms} ms ${s.type} ${s.invoker?.slice(0, 50) ?? ''} \`${(s.src || '').slice(0, 50)}\``).join('; ')}`);
    });
    if (pg.profiled?.loadProfile) p(`- CPU profile, load (self time by source): ${pg.profiled.loadProfile.bySource.slice(0, 12).map((x) => `${x.k} ${x.ms}`).join(', ')}`);
    pg.profiled?.interactions.forEach((i) => {
      if (i.profile) p(`- CPU profile, ${i.name}: ${i.profile.bySource.slice(0, 10).map((x) => `${x.k} ${x.ms}`).join(', ')}`);
    });
    if (file === 'trace-prod.json') {
      p(`- Scripts (load order, ms from navigation start, transfer bytes): ${r.nav.scripts.filter((s) => !s.url.includes('/_next/')).map((s) => `${new URL(s.url).host}${new URL(s.url).pathname.slice(0, 30)} ${s.start}–${s.end} ${s.transfer}B`).join('; ')}`);
      p(`- Collection requests aborted in run 1: ${r.blockedCount} (${r.blockedRequests.slice(0, 6).map((b) => b.slice(0, 80)).join('; ')})`);
    }
    p();
  }
}
console.log(out.join('\n'));
