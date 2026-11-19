/**
 * P1 performance, Step 1 items 1, 2 (local build side) and 5: what each page makes the
 * browser download on first load, and how much of the HTML is the React Server
 * Components (RSC) payload — the props and server output that client components hydrate from.
 *
 * Usage (CI, against `next start`; tooling only, not part of the app or the test suite):
 *   npx tsx scripts/perf/route-weights.ts --base http://localhost:3000 --out perf-out/route-weights.json
 *
 * Each sitemap URL is opened once in a fresh Chromium context (empty cache), waits for the load
 * event plus network quiet, and records every response. JS is "first-load JS": every script the
 * page fetched before it went quiet (framework, shared and page chunks; lazy chunks loaded later on
 * interaction are not counted). Sizes: raw bytes and gzip (zlib level 9, computed here so the
 * figure doesn't depend on the server's compression).
 */
import { chromium, type Response } from '@playwright/test';
import { gzipSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { blockAnalyticsCollection } from './policy';

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`missing --${name}`);
}

const BASE = arg('base').replace(/\/$/, '');
const OUT = arg('out');
const ONLY = process.argv.includes('--only') ? arg('only').split(',') : null;
/** A deployed site gets the no-collection policy (policy.ts); a local `next start` renders no GA/Clarity. */
const REMOTE = !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(BASE);

type Asset = { url: string; type: string; raw: number; gz: number; status: number };
type PageResult = {
  path: string;
  status: number;
  html: { raw: number; gz: number; rscInline: number; jsonLd: number; rscTopRows: { bytes: number; preview: string }[] };
  /** first-party = /_next/static chunks; thirdParty = everything else (gtag.js, Clarity, Vercel Analytics). */
  js: { count: number; raw: number; gz: number; firstPartyRaw: number; firstPartyGz: number; thirdPartyRaw: number; thirdPartyGz: number; files: { file: string; raw: number; gz: number }[] };
  css: { raw: number; gz: number };
  fonts: { raw: number; gz: number };
  images: { raw: number; gz: number };
  other: { raw: number; gz: number };
  error?: string;
};

const gz = (b: Buffer) => gzipSync(b, { level: 9 }).length;

/**
 * The inline RSC payload is a series of `self.__next_f.push([1,"..."])` scripts whose string
 * arguments concatenate into the flight stream: rows of `<id>:<json>` separated by newlines.
 * Returns the total payload size and the largest rows (a large row is usually one big prop).
 */
function rscStats(html: string) {
  const re = /<script>self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g;
  let stream = '';
  let inlineBytes = 0;
  for (let m; (m = re.exec(html)); ) {
    inlineBytes += Buffer.byteLength(m[0]);
    try {
      const arr = JSON.parse(m[1]);
      if (arr[0] === 1 && typeof arr[1] === 'string') stream += arr[1];
    } catch {
      /* not a plain string chunk */
    }
  }
  const rows = stream.split(/\n(?=[0-9a-f]+:)/);
  const top = rows
    .map((r) => ({ bytes: Buffer.byteLength(r), preview: r.slice(0, 220) }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5);
  return { inlineBytes, top };
}

function jsonLdBytes(html: string) {
  let n = 0;
  const re = /<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g;
  for (let m; (m = re.exec(html)); ) n += Buffer.byteLength(m[0]);
  return n;
}

async function sitemapPaths(): Promise<string[]> {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (locs.length === 0) throw new Error('sitemap.xml returned no <loc> entries');
  return [...new Set(locs)];
}

async function main() {
  const paths = ONLY ?? (await sitemapPaths());
  console.log(`pages to measure: ${paths.length}`);
  const browser = await chromium.launch();
  const results: PageResult[] = [];

  for (const path of paths) {
    const context = await browser.newContext();
    if (REMOTE) await blockAnalyticsCollection(context, BASE);
    const page = await context.newPage();
    const pending: Promise<Asset | null>[] = [];
    page.on('response', (res: Response) => {
      pending.push(
        (async () => {
          try {
            const body = await res.body();
            return { url: res.url(), type: res.request().resourceType(), raw: body.length, gz: gz(body), status: res.status() };
          } catch {
            return null; // redirects and aborted requests have no body
          }
        })(),
      );
    });

    const r: PageResult = {
      path,
      status: 0,
      html: { raw: 0, gz: 0, rscInline: 0, jsonLd: 0, rscTopRows: [] },
      js: { count: 0, raw: 0, gz: 0, firstPartyRaw: 0, firstPartyGz: 0, thirdPartyRaw: 0, thirdPartyGz: 0, files: [] },
      css: { raw: 0, gz: 0 },
      fonts: { raw: 0, gz: 0 },
      images: { raw: 0, gz: 0 },
      other: { raw: 0, gz: 0 },
    };
    try {
      const main = await page.goto(BASE + path, { waitUntil: 'load', timeout: 60_000 });
      r.status = main?.status() ?? 0;
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      const html = main ? (await main.body()).toString('utf8') : '';
      const rsc = rscStats(html);
      r.html = {
        raw: Buffer.byteLength(html),
        gz: gz(Buffer.from(html)),
        rscInline: rsc.inlineBytes,
        jsonLd: jsonLdBytes(html),
        rscTopRows: rsc.top,
      };
      const assets = (await Promise.all(pending)).filter((a): a is Asset => a !== null);
      for (const a of assets) {
        if (a.url === main?.url()) continue;
        const bucket =
          a.type === 'script' ? 'js' : a.type === 'stylesheet' ? 'css' : a.type === 'font' ? 'fonts' : a.type === 'image' ? 'images' : 'other';
        if (bucket === 'js') {
          r.js.count++;
          r.js.raw += a.raw;
          r.js.gz += a.gz;
          if (a.url.includes('/_next/static/')) {
            r.js.firstPartyRaw += a.raw;
            r.js.firstPartyGz += a.gz;
          } else {
            r.js.thirdPartyRaw += a.raw;
            r.js.thirdPartyGz += a.gz;
          }
          r.js.files.push({ file: a.url.replace(BASE, ''), raw: a.raw, gz: a.gz });
        } else {
          r[bucket].raw += a.raw;
          r[bucket].gz += a.gz;
        }
      }
      r.js.files.sort((a, b) => b.raw - a.raw);
    } catch (e) {
      r.error = String(e);
    }
    results.push(r);
    console.log(
      `${path.padEnd(60)} ${String(r.status).padEnd(4)} html ${(r.html.raw / 1024).toFixed(1)} KB (rsc ${(r.html.rscInline / 1024).toFixed(1)}) first-party js ${(r.js.firstPartyRaw / 1024).toFixed(1)} KB / gz ${(r.js.firstPartyGz / 1024).toFixed(1)} KB, third-party ${(r.js.thirdPartyRaw / 1024).toFixed(1)} KB`,
    );
    await context.close();
  }
  await browser.close();

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ base: BASE, measuredAt: new Date().toISOString(), pages: results }, null, 2));
  const failed = results.filter((r) => r.error || r.status !== 200);
  console.log(`wrote ${OUT}: ${results.length} pages, ${failed.length} not 200/errored`);
  if (results.length === 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
