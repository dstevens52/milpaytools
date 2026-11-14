// BAH station-page inbound-link analysis (npm run bah:inbound).
//
// Re-runs the docs/bah-internal-linking-findings.md §1/§3 analysis on the
// current repo: for every rendered /bah/[slug] page, count NON-HUB inbound
// links from the contextual sources:
//   nearby  — other stations whose `nearby:` array lists it (stations.ts)
//   pay     — /pay/[rank] pages whose `exampleStations` list it (ranks.ts)
//   content — blog MDX files with a `/bah/{slug}` link (distinct files)
//   tsx     — other src/app pages with a literal "/bah/{slug}" href (e.g. /about)
// Counts are distinct SOURCE PAGES per target (a post linking a base twice = 1).
// `siblings` (auto same-MHA block on station pages) is reported as an extra
// column but is NOT in the total, matching the June 2026 findings method.
//
// Usage: npx tsx scripts/bah-inbound.ts [--json out.json] [--quiet]
// Read-only. Never edits anything.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DUTY_STATIONS } from '../src/data/duty-stations/stations';
import { PAY_PAGE_RANKS } from '../src/data/pay-pages/ranks';
import { OCONUS_V2_STATIONS, getRenderableOconusV2 } from '../src/data/oconus';
import { getMHACode } from '../src/lib/calculations/bah';

const ROOT = join(__dirname, '..');
const args = process.argv.slice(2);
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : undefined;
const quiet = args.includes('--quiet');

// ── Rendered station set (mirrors generateStaticParams in src/app/bah/[slug]/page.tsx)
const conus = DUTY_STATIONS.filter((s) => !s.oconus);
const oconusV2 = OCONUS_V2_STATIONS.filter((s) => getRenderableOconusV2(s.slug));
const conusSlugs = new Set(conus.map((s) => s.slug));
const oconusSlugs = new Set(oconusV2.map((s) => s.slug));
const allSlugs = new Set([...conusSlugs, ...oconusSlugs]);
const allStationSlugs = new Set(DUTY_STATIONS.map((s) => s.slug)); // incl. legacy oconus records

type Src = { nearby: string[]; pay: string[]; content: string[]; tsx: string[]; siblings: string[] };
const inbound = new Map<string, Src>();
for (const slug of allSlugs) inbound.set(slug, { nearby: [], pay: [], content: [], tsx: [], siblings: [] });
const unknownTargets: string[] = [];
const add = (target: string, kind: keyof Src, from: string) => {
  const rec = inbound.get(target);
  if (!rec) {
    unknownTargets.push(`${kind}: ${from} → ${target}`);
    return;
  }
  if (!rec[kind].includes(from)) rec[kind].push(from);
};

// ── 1. nearby arrays (only rendered pages emit links; legacy oconus records don't render)
const edges: [string, string][] = [];
for (const s of conus) {
  for (const t of s.nearby) {
    edges.push([s.slug, t]);
    add(t, 'nearby', s.slug);
  }
}
const edgeSet = new Set(edges.map(([a, b]) => `${a}>${b}`));
const oneWay = edges.filter(([a, b]) => !edgeSet.has(`${b}>${a}`));
const neverReferenced = [...conusSlugs].filter((slug) => !edges.some(([, b]) => b === slug));

// ── 2. /pay/[rank] example stations
let payRefs = 0;
for (const r of PAY_PAGE_RANKS) {
  for (const ex of r.exampleStations) {
    payRefs++;
    add(ex.slug, 'pay', `/pay/${r.slug}`);
  }
}

// ── 3. blog / guide MDX
const mdxFiles: string[] = [];
const walk = (dir: string) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.mdx')) mdxFiles.push(p);
  }
};
walk(join(ROOT, 'src', 'content'));
// Markdown `](/bah/slug)` or JSX `href="/bah/slug"` — not bare paths in comments.
const linkRe = /(?:\]\(|href=["'{`]+)\/bah\/([a-z0-9][a-z0-9-]*)/g;
let contentLinks = 0;
const filesWithLinks = new Set<string>();
for (const f of mdxFiles) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(linkRe)) {
    contentLinks++;
    filesWithLinks.add(f);
    add(m[1], 'content', relative(ROOT, f).replace(/\\/g, '/'));
  }
}

// ── 4. literal station hrefs in app pages (outside the station template + hub)
const tsxFiles: string[] = [];
const walkTsx = (dir: string) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkTsx(p);
    else if (/\.tsx$/.test(e.name)) tsxFiles.push(p);
  }
};
walkTsx(join(ROOT, 'src', 'app'));
for (const f of tsxFiles) {
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  if (rel.startsWith('src/app/bah/') || rel.startsWith('src/app/api/')) continue;
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/["'`]\/bah\/([a-z0-9][a-z0-9-]*)/g)) {
    if (allStationSlugs.has(m[1]) || allSlugs.has(m[1])) add(m[1], 'tsx', rel);
  }
}

// ── 5. same-MHA siblings (info only)
const mhaOf = new Map(conus.map((s) => [s.slug, getMHACode(s.zip)]));
for (const s of conus) {
  for (const t of conus) {
    if (t.slug !== s.slug && mhaOf.get(t.slug) && mhaOf.get(t.slug) === mhaOf.get(s.slug)) add(t.slug, 'siblings', s.slug);
  }
}

// ── Report
const rows = [...inbound.entries()].map(([slug, r]) => ({
  slug,
  region: conusSlugs.has(slug) ? 'CONUS' : 'OCONUS',
  rich: conusSlugs.has(slug) ? Boolean(DUTY_STATIONS.find((s) => s.slug === slug)?.bahVsHousing) : undefined,
  nearby: r.nearby.length,
  pay: r.pay.length,
  content: r.content.length,
  tsx: r.tsx.length,
  total: r.nearby.length + r.pay.length + r.content.length + r.tsx.length,
  siblings: r.siblings.length,
  sources: r,
}));
const conusRows = rows.filter((r) => r.region === 'CONUS');
const zero = conusRows.filter((r) => r.total === 0).map((r) => r.slug);
const zeroWithSiblings = conusRows.filter((r) => r.total + r.siblings === 0).map((r) => r.slug);
const lte2 = conusRows.filter((r) => r.total <= 2);
const hist = new Map<number, number>();
for (const r of conusRows) hist.set(r.total, (hist.get(r.total) ?? 0) + 1);
const outCounts = new Map<number, number>();
for (const s of conus) outCounts.set(s.nearby.length, (outCounts.get(s.nearby.length) ?? 0) + 1);

const summary = {
  stations: { conus: conus.length, oconusRendered: oconusV2.length, legacyOconusRecords: DUTY_STATIONS.length - conus.length },
  conusZeroInbound: zero,
  conusZeroInboundEvenWithSiblings: zeroWithSiblings,
  conusLte2Inbound: lte2.length,
  histogram: Object.fromEntries([...hist.entries()].sort((a, b) => a[0] - b[0])),
  nearby: {
    edges: edges.length,
    oneWay: oneWay.length,
    outDegree: Object.fromEntries([...outCounts.entries()].sort((a, b) => a[0] - b[0])),
    neverReferenced,
  },
  pay: { refs: payRefs, distinct: conusRows.filter((r) => r.pay > 0).length },
  content: { mdxFiles: mdxFiles.length, filesWithLinks: filesWithLinks.size, links: contentLinks },
  unknownTargets,
};

if (!quiet) {
  console.log(`Stations: ${summary.stations.conus} CONUS + ${summary.stations.oconusRendered} OCONUS v2 rendered (${summary.stations.legacyOconusRecords} legacy oconus records in stations.ts, not rendered by the CONUS template)`);
  console.log(`Sources: nearby ${edges.length} edges | pay ${payRefs} refs | content ${contentLinks} links in ${filesWithLinks.size}/${mdxFiles.length} MDX | tsx ${conusRows.reduce((n, r) => n + r.tsx, 0)}`);
  console.log(`\nCONUS non-hub inbound histogram (distinct source pages):`);
  for (const [k, v] of Object.entries(summary.histogram)) console.log(`  ${String(k).padStart(2)} inbound : ${v}`);
  console.log(`\nCONUS with 0 non-hub inbound: ${zero.length}`);
  console.log(`  ${zero.join(', ') || '(none)'}`);
  console.log(`  …of which also 0 counting same-MHA siblings: ${zeroWithSiblings.length}${zeroWithSiblings.length ? ' — ' + zeroWithSiblings.join(', ') : ''}`);
  console.log(`CONUS with ≤2 non-hub inbound: ${lte2.length}`);
  console.log(`\nNearby: ${edges.length} edges, ${oneWay.length} one-way; out-degree ${JSON.stringify(summary.nearby.outDegree)}`);
  console.log(`Never referenced in any nearby list (CONUS): ${neverReferenced.length}`);
  console.log(`  ${neverReferenced.join(', ') || '(none)'}`);
  if (unknownTargets.length) console.log(`\n!! Links to non-rendered slugs: ${unknownTargets.join('; ')}`);
}
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({ summary, oneWay, rows }, null, 2));
  if (!quiet) console.log(`\nJSON written: ${jsonOut}`);
}
