/**
 * P1 performance, Step 1 items 4 and 6: main-thread cost during load and on the first input,
 * on a phone-sized Chromium with 4× CPU throttling (Chrome DevTools Protocol).
 *
 *   npx tsx scripts/perf/trace-interactions.ts --base http://localhost:3000 --mode local --out perf-out/trace-local.json
 *   npx tsx scripts/perf/trace-interactions.ts --base https://www.milpaytools.com --mode prod --out perf-out/trace-prod.json
 *   npx tsx scripts/perf/trace-interactions.ts --base http://localhost:3000 --mode local --browser webkit --out perf-out/trace-webkit.json
 *
 * Per page: `--runs` timed runs (no profiler) + one profiled run (CDP CPU profile, mapped
 * through the build's source maps when they exist) + a Chrome trace of the first run saved
 * under --trace-dir. Records Long Tasks, Long Animation Frames (with script attribution),
 * Event Timing (the INP measure) and resource timing for scripts.
 *
 * WebKit has no CPU throttling, Long Tasks, LoAF or Event Timing; there the script records
 * input → next frame (event.timeStamp to rAF+setTimeout) for each input, unthrottled.
 *
 * --mode prod (third-party cost, item 6): GA4, Clarity and Vercel Analytics are allowed to
 * load and run, but every collection request is aborted, so nothing reaches GA4, Clarity or
 * Vercel Analytics (no sessions, no page views) and no /api/ request reaches the site. Clarity's
 * loader skips automated browsers (navigator.webdriver), so prod mode launches Chromium with
 * AutomationControlled disabled to see the cost a real visitor pays.
 */
import { chromium, webkit, devices, type Browser, type Page, type CDPSession } from '@playwright/test';
import { SourceMapConsumer, type RawSourceMap } from 'source-map-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { TRACE_PAGES, type Interaction } from './pages';
import { blockAnalyticsCollection } from './policy';

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`missing --${name}`);
}
const BASE = arg('base').replace(/\/$/, '');
const MODE = arg('mode', 'local') as 'local' | 'prod';
const OUT = arg('out');
const RUNS = Number(arg('runs', '3'));
const TRACE_DIR = arg('trace-dir', '');
const BROWSER = arg('browser', 'chromium') as 'chromium' | 'webkit';
const CPU_RATE = BROWSER === 'chromium' ? Number(arg('cpu', '4')) : 1;

// ─── in-page collectors ──────────────────────────────────────────────────────
const INIT = `(() => {
  const P = (window.__perf = { lt: [], loaf: [], ev: [], lcp: [], manual: [], fcp: null });
  const obs = (type, fn, extra) => { try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe(Object.assign({ type, buffered: true }, extra || {})); } catch (e) {} };
  obs('longtask', (e) => P.lt.push({ start: e.startTime, duration: e.duration }));
  obs('long-animation-frame', (e) => P.loaf.push({
    start: e.startTime, duration: e.duration, blocking: e.blockingDuration, renderStart: e.renderStart,
    styleAndLayoutStart: e.styleAndLayoutStart,
    scripts: (e.scripts || []).map((s) => ({ src: s.sourceURL, fn: s.sourceFunctionName, pos: s.sourceCharPosition,
      invoker: s.invoker, invokerType: s.invokerType, start: s.startTime, duration: s.duration,
      forcedLayout: s.forcedStyleAndLayoutDuration, pause: s.pauseDuration })),
  }));
  obs('event', (e) => P.ev.push({ name: e.name, start: e.startTime, duration: e.duration,
    processingStart: e.processingStart, processingEnd: e.processingEnd, interactionId: e.interactionId || 0,
    target: e.target ? (e.target.tagName + (e.target.id ? '#' + e.target.id : '')) : null }), { durationThreshold: 16 });
  obs('largest-contentful-paint', (e) => P.lcp.push({ start: e.startTime, size: e.size, el: e.element ? e.element.tagName : null }));
  obs('paint', (e) => { if (e.name === 'first-contentful-paint') P.fcp = e.startTime; });
  // Browser-neutral input → next frame (used for WebKit, recorded everywhere).
  ['pointerdown', 'keydown', 'click'].forEach((t) => addEventListener(t, (ev) => {
    const ts = ev.timeStamp;
    requestAnimationFrame(() => setTimeout(() => P.manual.push({ type: t, inputToNextFrame: performance.now() - ts, at: ts }), 0));
  }, { capture: true }));
})();`;

// ─── CPU profile → source files ────────────────────────────────────────────────
const maps = new Map<string, SourceMapConsumer | null>();
function consumerFor(url: string): SourceMapConsumer | null {
  const m = url.match(/\/_next\/(static\/[^?#]+\.js)/);
  if (!m) return null;
  const file = join('.next', m[1]) + '.map';
  if (!maps.has(file)) maps.set(file, existsSync(file) ? new SourceMapConsumer(JSON.parse(readFileSync(file, 'utf8')) as RawSourceMap) : null);
  return maps.get(file) ?? null;
}
function sourceGroup(source: string): string {
  const s = decodeURIComponent(source).replace(/\\/g, '/');
  const nm = s.lastIndexOf('node_modules/');
  if (nm !== -1) {
    const rest = s.slice(nm + 13).split('/');
    return `npm:${rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0]}`;
  }
  const src = s.indexOf('/src/');
  return src !== -1 ? s.slice(src + 1) : s.replace(/^turbopack:\/\/\/?/, '');
}
type CpuProfile = { nodes: { id: number; callFrame: { functionName: string; url: string; lineNumber: number; columnNumber: number } }[]; samples: number[]; timeDeltas: number[]; startTime: number; endTime: number };
function summarizeProfile(p: CpuProfile) {
  const self = new Map<number, number>();
  p.samples.forEach((id, i) => self.set(id, (self.get(id) ?? 0) + (p.timeDeltas[i] ?? 0) / 1000));
  const bySource: Record<string, number> = {};
  const byFn: Record<string, number> = {};
  for (const n of p.nodes) {
    const ms = self.get(n.id) ?? 0;
    if (!ms) continue;
    const cf = n.callFrame;
    let key: string;
    let fnKey: string;
    if (!cf.url) {
      key = `(${cf.functionName || 'native'})`; // (program), (garbage collector), (idle), native
      fnKey = key;
    } else {
      const c = consumerFor(cf.url);
      const orig = c ? c.originalPositionFor({ line: cf.lineNumber + 1, column: cf.columnNumber }) : null;
      if (orig?.source) {
        key = sourceGroup(orig.source);
        fnKey = `${key} ${orig.name ?? cf.functionName ?? ''}:${orig.line}`;
      } else {
        const u = new URL(cf.url, BASE);
        key = u.origin === new URL(BASE).origin ? u.pathname.replace(/^\/_next\/static\/chunks\//, 'chunk:') : u.host;
        fnKey = `${key} ${cf.functionName}`;
      }
    }
    bySource[key] = (bySource[key] ?? 0) + ms;
    byFn[fnKey] = (byFn[fnKey] ?? 0) + ms;
  }
  const top = (o: Record<string, number>, n: number) =>
    Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, ms]) => ({ k, ms: Math.round(ms) }));
  return { totalMs: Math.round((p.endTime - p.startTime) / 1000), bySource: top(bySource, 25), byFunction: top(byFn, 25) };
}

// ─── one page visit ────────────────────────────────────────────────────────────
async function interact(page: Page, it: Interaction) {
  const el = page.locator(it.selector).first();
  await el.waitFor({ state: 'visible', timeout: 15_000 });
  await el.scrollIntoViewIfNeeded();
  const before = await el.evaluate((e: HTMLInputElement | HTMLSelectElement) => ('value' in e ? e.value : ''));
  if (it.kind === 'select-next') {
    await el.focus();
    await page.keyboard.press('ArrowDown');
  } else if (it.kind === 'type') {
    await el.click();
    await page.keyboard.type(it.text, { delay: 150 });
  } else {
    await el.click();
  }
  await page.waitForTimeout(2_500);
  const after = await el.evaluate((e: HTMLInputElement | HTMLSelectElement) => ('value' in e ? e.value : ''));
  const label = await el.evaluate((e) => `${e.tagName}${e.id ? '#' + e.id : ''}${e.getAttribute('aria-label') ? `[${e.getAttribute('aria-label')}]` : ''}`);
  return { before, after, label };
}

type Perf = {
  lt: { start: number; duration: number }[];
  loaf: { start: number; duration: number; blocking: number; scripts: { src: string; fn: string; pos: number; invoker: string; invokerType: string; duration: number; forcedLayout: number }[] }[];
  ev: { name: string; start: number; duration: number; processingStart: number; processingEnd: number; interactionId: number; target: string | null }[];
  lcp: { start: number; size: number; el: string | null }[];
  manual: { type: string; inputToNextFrame: number; at: number }[];
  fcp: number | null;
};

function window_(p: Perf, from: number, to: number) {
  const inW = (s: number) => s >= from && s < to;
  const lt = p.lt.filter((t) => inW(t.start));
  const loaf = p.loaf.filter((f) => inW(f.start));
  const ev = p.ev.filter((e) => inW(e.start) && e.interactionId);
  const byInteraction = new Map<number, (typeof ev)[number]>();
  for (const e of ev) if (!byInteraction.has(e.interactionId) || byInteraction.get(e.interactionId)!.duration < e.duration) byInteraction.set(e.interactionId, e);
  const interactions = [...byInteraction.values()].map((e) => ({
    name: e.name, target: e.target, duration: e.duration,
    inputDelay: Math.round(e.processingStart - e.start),
    processing: Math.round(e.processingEnd - e.processingStart),
    presentation: Math.round(e.start + e.duration - e.processingEnd),
  }));
  const scripts = loaf.flatMap((f) => f.scripts).sort((a, b) => b.duration - a.duration).slice(0, 10)
    .map((s) => ({ src: s.src?.replace(BASE, ''), fn: s.fn, pos: s.pos, invoker: s.invoker, type: s.invokerType, ms: Math.round(s.duration), forcedLayout: Math.round(s.forcedLayout ?? 0) }));
  return {
    longTasks: lt.length,
    longTaskMs: Math.round(lt.reduce((s, t) => s + t.duration, 0)),
    blockingMs: Math.round(lt.reduce((s, t) => s + Math.max(0, t.duration - 50), 0)),
    topLongTasks: lt.sort((a, b) => b.duration - a.duration).slice(0, 5).map((t) => ({ start: Math.round(t.start), ms: Math.round(t.duration) })),
    loafCount: loaf.length,
    topScripts: scripts,
    interactions,
    worstInteractionMs: interactions.reduce((m, i) => Math.max(m, i.duration), 0),
    manual: p.manual.filter((m) => inW(m.at)).map((m) => ({ type: m.type, ms: Math.round(m.inputToNextFrame) })),
  };
}

async function visit(browser: Browser, path: string, interactions: Interaction[], opts: { profile: boolean; trace: string | null }) {
  const device = BROWSER === 'chromium' ? devices['Pixel 7'] : devices['iPhone 14'];
  const context = await browser.newContext({ ...device });
  const blocked: string[] = [];
  if (MODE === 'prod') await blockAnalyticsCollection(context, BASE, blocked);
  await context.addInitScript(INIT);
  const page = await context.newPage();
  let cdp: CDPSession | null = null;
  if (BROWSER === 'chromium') {
    cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });
    if (opts.profile) {
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
      await cdp.send('Profiler.start');
    }
  }
  if (opts.trace && BROWSER === 'chromium') await browser.startTracing(page, { path: opts.trace, screenshots: false, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8.execute', 'blink.user_timing', 'loading', 'latencyInfo'] });

  const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 90_000 });
  const status = resp?.status() ?? 0;
  const title = await page.title();
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(2_000);
  let loadProfile = null;
  if (cdp && opts.profile) {
    const { profile } = await cdp.send('Profiler.stop');
    loadProfile = summarizeProfile(profile as CpuProfile);
  }
  const tLoaded = await page.evaluate(() => performance.now());
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const scripts = (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
      .filter((r) => r.initiatorType === 'script' || /\.js(\?|$)/.test(r.name))
      .map((r) => ({ url: r.name, start: Math.round(r.startTime), end: Math.round(r.responseEnd), transfer: r.transferSize, decoded: r.decodedBodySize }));
    return {
      ttfb: n ? Math.round(n.responseStart) : null,
      domContentLoaded: n ? Math.round(n.domContentLoadedEventEnd) : null,
      load: n ? Math.round(n.loadEventEnd) : null,
      domNodes: document.getElementsByTagName('*').length,
      scripts,
    };
  });

  const results: { name: string; label: string; changed: boolean; before: string; after: string; profile: unknown; metrics: unknown }[] = [];
  for (const it of interactions) {
    const t0 = await page.evaluate(() => performance.now());
    if (cdp && opts.profile) await cdp.send('Profiler.start');
    let r: { before: string; after: string; label: string } = { before: '', after: '', label: '' };
    let error: string | undefined;
    try {
      r = await interact(page, it);
    } catch (e) {
      error = String(e).slice(0, 300);
    }
    let prof = null;
    if (cdp && opts.profile) prof = summarizeProfile((await cdp.send('Profiler.stop')).profile as CpuProfile);
    const t1 = await page.evaluate(() => performance.now());
    const perf = (await page.evaluate(() => (window as unknown as { __perf: unknown }).__perf)) as Perf;
    results.push({ name: it.name, label: r.label, changed: r.before !== r.after || it.kind === 'click', before: r.before, after: r.after, profile: prof, metrics: { ...window_(perf, t0, t1), error } });
  }
  if (opts.trace && BROWSER === 'chromium') await browser.stopTracing();
  const perf = (await page.evaluate(() => (window as unknown as { __perf: unknown }).__perf)) as Perf;
  const load = window_(perf, 0, tLoaded);
  await context.close();
  return {
    path, status, title, nav,
    fcp: perf.fcp ? Math.round(perf.fcp) : null,
    lcp: perf.lcp.length ? Math.round(perf.lcp[perf.lcp.length - 1].start) : null,
    lcpElement: perf.lcp.length ? perf.lcp[perf.lcp.length - 1].el : null,
    load, loadProfile, interactions: results, blockedRequests: [...new Set(blocked)].slice(0, 40), blockedCount: blocked.length,
  };
}

async function main() {
  const launcher = BROWSER === 'chromium' ? chromium : webkit;
  const browser = await launcher.launch(MODE === 'prod' && BROWSER === 'chromium' ? { args: ['--disable-blink-features=AutomationControlled'] } : {});
  if (TRACE_DIR) mkdirSync(TRACE_DIR, { recursive: true });
  const out: unknown[] = [];
  for (const tp of TRACE_PAGES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const trace = i === 0 && TRACE_DIR ? join(TRACE_DIR, `${MODE}-${BROWSER}-${tp.path.replace(/\W+/g, '_')}.json`) : null;
      const r = await visit(browser, tp.path, tp.interactions, { profile: false, trace });
      runs.push(r);
      console.log(`${MODE} ${BROWSER} ${tp.path} run ${i + 1}: status ${r.status} lcp ${r.lcp} longtasks ${r.load.longTasks} (${r.load.longTaskMs} ms, blocking ${r.load.blockingMs}) | ` +
        r.interactions.map((x) => `${x.name}: ${(x.metrics as { worstInteractionMs: number }).worstInteractionMs} ms${x.changed ? '' : ' (NO CHANGE)'}`).join(' | '));
    }
    const profiled = BROWSER === 'chromium' ? await visit(browser, tp.path, tp.interactions, { profile: true, trace: null }) : null;
    out.push({ path: tp.path, runs, profiled });
  }
  await browser.close();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ base: BASE, mode: MODE, browser: BROWSER, cpuThrottle: CPU_RATE, runs: RUNS, measuredAt: new Date().toISOString(), pages: out }, null, 2));
  console.log(`wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
