#!/usr/bin/env node
/**
 * bah-urls.mjs: every URL whose rendered content depends on BAH data, for
 * IndexNow after a BAH data or year change (docs/RELEASE_DAY_BAH_2027.md).
 *
 *   npm run bah:urls                       → writes bah-urls.json (repo root, gitignored)
 *   npm run bah:urls -- --out <file>       → writes there instead
 *   npm run bah:urls -- --print            → JSON to stdout only
 *
 * Output: { "urls": [...] }, the body POST /api/indexnow/submit expects.
 *
 * What counts (each reads BAH rates, the ZIP→MHA map, BAH counts or BAH_YEAR at
 * build time):
 *  - /bah and every CONUS /bah/[slug] (OCONUS station pages show OHA, not BAH)
 *  - calculators with server-rendered BAH figures or BAH-year copy, and the
 *    /calculators grid (BAH counts + year)
 *  - /pay/[rank] (national median BAH, BAH counts) and the guides, /transition
 *    and homepage worked examples that compute BAH
 *  - blog posts rendering a BAH-derived component (default-text BAH callout,
 *    TransitionReadinessExample)
 * Not included: /calculators/pcs (BAH only via client lookups for links),
 * /pay and /pay/raise (no BAH data), /guides/military-pay (typed legacy table
 * src/data/bah-rates/2026.ts; see the runbook's backlog line).
 * tests/e2e/bah-release-day.spec.ts fails if a page importing BAH code is
 * missing from STATIC_PATHS below.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = 'https://www.milpaytools.com';

export const STATIC_PATHS = [
  '/',
  '/bah',
  '/calculators',
  '/calculators/cola',
  '/calculators/compare',
  '/calculators/deployment',
  '/calculators/dual-military-bah',
  '/calculators/education',
  '/calculators/total-compensation',
  '/calculators/transition-readiness',
  '/guides/education-benefits',
  '/guides/pcs',
  '/guides/starting-service',
  '/transition',
];

/** Blog posts whose MDX renders a BAH-derived component. */
function blogPaths() {
  const dir = path.join(ROOT, 'src', 'content', 'blog');
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx')).sort()) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const bahCalloutDefault = [...src.matchAll(/<CalculatorCallout\b[^>]*?\/>/gs)].some(
      (m) => m[0].includes('calculator="bah"') && !m[0].includes('text='),
    );
    if (bahCalloutDefault || src.includes('<TransitionReadinessExample')) {
      out.push(`/blog/${f.replace(/\.mdx$/, '')}`);
    }
  }
  return out;
}

export async function bahPaths() {
  const { DUTY_STATIONS } = await tsImport('../src/data/duty-stations/stations.ts', import.meta.url);
  const { PAY_PAGE_RANKS } = await tsImport('../src/data/pay-pages/ranks.ts', import.meta.url);
  const stations = DUTY_STATIONS.filter((s) => !s.oconus).map((s) => `/bah/${s.slug}`);
  const ranks = PAY_PAGE_RANKS.map((r) => `/pay/${r.slug}`);
  return [...new Set([...STATIC_PATHS, ...stations, ...ranks, ...blogPaths()])];
}

async function main() {
  const argv = process.argv.slice(2);
  const print = argv.includes('--print');
  const outIdx = argv.indexOf('--out');
  const out = outIdx >= 0 ? argv[outIdx + 1] : 'bah-urls.json';
  const paths = await bahPaths();
  const body = JSON.stringify({ urls: paths.map((p) => `${BASE_URL}${p}`) }, null, 2) + '\n';
  if (print) {
    process.stdout.write(body);
    return;
  }
  const file = path.isAbsolute(out) ? out : path.join(ROOT, out);
  fs.writeFileSync(file, body);
  const conus = paths.filter((p) => p.startsWith('/bah/')).length;
  console.log(`bah-urls: ${paths.length} URLs → ${path.relative(ROOT, file)}`);
  console.log(`  /bah/[slug] CONUS: ${conus} · /pay/[rank]: ${paths.filter((p) => p.startsWith('/pay/')).length} · blog: ${paths.filter((p) => p.startsWith('/blog/')).length} · other: ${STATIC_PATHS.length}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
