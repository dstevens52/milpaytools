/**
 * Dollar-figure staleness report for blog posts and guide pages.
 *
 *   npm run check:figures                         → docs/figures/report.{md,json}
 *   npm run check:figures -- --baseline           → also writes docs/figures/<year>-baseline.{md,json}
 *   npm run check:figures -- --next-year 2027     → docs/figures/year-change-2027.{md,json}
 *       [--traffic path/to/gsc-pages.csv]          sort the worklist by Search Console clicks
 *   --scan dir1,dir2                              override the scanned directories
 *   --base-year 2026                              override the base data year
 *
 * Never fails on content: an unmatched figure is `unbound`, not an error. It
 * exits non-zero only when the tool itself breaks (bad flag, unreadable file).
 * Classes and the `weak` marking: docs/figures/README.md.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import {
  DEFAULT_SCAN_DIRS,
  SOURCE_GROUPS,
  buildIndex,
  classify,
  collectFiles,
  diffYears,
  extractFigures,
  formatSource,
  groupFile,
  indexFromEntries,
  labelGroup,
  makeClassifier,
  money,
  type ClassifiedFigure,
  type DataIndex,
  type SourceGroup,
  type StaleFigure,
} from './figures/lib';

const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs', 'figures');

// ─── Args ────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const args: { nextYear?: string; baseYear?: string; traffic?: string; scan?: string[]; baseline: boolean } = {
    baseline: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => {
      const v = argv[++i];
      if (!v || v.startsWith('--')) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === '--next-year') args.nextYear = val();
    else if (a === '--base-year') args.baseYear = val();
    else if (a === '--traffic') args.traffic = val();
    else if (a === '--scan') args.scan = val().split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--baseline') args.baseline = true;
    else throw new Error(`Unknown flag: ${a}`);
  }
  for (const y of [args.nextYear, args.baseYear]) {
    if (y !== undefined && !/^\d{4}$/.test(y)) throw new Error(`Year must be four digits, got "${y}"`);
  }
  return args;
}

/** Latest year with a pay table on disk — the default base year. */
function latestPayYear(): string {
  const years = readdirSync(join(ROOT, 'src', 'data', 'pay-tables'))
    .map((f) => /^(\d{4})\.ts$/.exec(f)?.[1])
    .filter((y): y is string => !!y)
    .sort();
  if (!years.length) throw new Error('No pay table found under src/data/pay-tables/');
  return years[years.length - 1];
}

// ─── Loading data by year ────────────────────────────────────────────────────

interface Skipped {
  group: string;
  file: string;
  reason: string;
}

async function loadIndex(year: string): Promise<{ index: DataIndex; skipped: Skipped[] }> {
  const loaded: { group: SourceGroup; mod: Record<string, unknown> }[] = [];
  const skipped: Skipped[] = [];
  for (const group of SOURCE_GROUPS) {
    const file = groupFile(group, year);
    const abs = join(ROOT, file);
    if (!existsSync(abs)) {
      skipped.push({ group: group.id, file, reason: 'file does not exist yet' });
      continue;
    }
    const mod = (await import(pathToFileURL(abs).href)) as Record<string, unknown>;
    if (group.inPlace && String(mod.DATA_YEAR) !== year) {
      skipped.push({ group: group.id, file, reason: `edited in place; it holds DATA_YEAR ${String(mod.DATA_YEAR)}` });
      continue;
    }
    loaded.push({ group, mod });
  }
  return { index: buildIndex(year, loaded), skipped };
}

/**
 * When an in-place module (constants.ts: BAS, TSP limits, tax) has already
 * moved to the next year, recover its base-year values from the committed
 * baseline JSON — only the labels that some figure matched, which is all the
 * diff needs.
 */
function withBaselineFallback(base: DataIndex, skipped: Skipped[]): { index: DataIndex; note?: string } {
  const missing = new Set(skipped.map((s) => s.group));
  const snapshotPath = join(OUT_DIR, `${base.year}-baseline.json`);
  if (!missing.size || !existsSync(snapshotPath)) return { index: base };
  const snap = JSON.parse(readFileSync(snapshotPath, 'utf8')) as { figures: ClassifiedFigure[] };
  const extra = new Map<string, number>();
  for (const f of snap.figures) {
    for (const s of f.sources) if (missing.has(labelGroup(s.label))) extra.set(s.label, s.value);
  }
  if (!extra.size) return { index: base };
  const entries: [string, number][] = [...base.byLabel].map(([l, c]) => [l, c / 100]);
  entries.push(...extra);
  const groups = [...new Set([...base.groups, ...[...extra.keys()].map(labelGroup)])];
  return {
    index: indexFromEntries(base.year, entries, groups),
    note: `${extra.size} ${base.year} values for ${[...missing].join(', ')} came from docs/figures/${base.year}-baseline.json (module already updated in place).`,
  };
}

// ─── File metadata: title, slug, URL ─────────────────────────────────────────

interface FileMeta {
  title: string;
  slug: string;
  url: string;
}

function fileMeta(file: string): FileMeta {
  const text = readFileSync(join(ROOT, file), 'utf8');
  if (/\.mdx?$/.test(file)) {
    const fm = matter(text).data as { title?: string; slug?: string };
    const slug = fm.slug ?? file.replace(/^.*\//, '').replace(/\.mdx?$/, '');
    const section = file.startsWith('src/content/blog/') ? 'blog' : file.split('/').slice(-2, -1)[0];
    return { title: fm.title ?? slug, slug, url: `/${section}/${slug}` };
  }
  // Route page: src/app/<route>/page.tsx
  const route = file.replace(/^src\/app/, '').replace(/\/page\.tsx$/, '') || '/';
  const title = /title:\s*(['"`])(.+?)\1/.exec(text)?.[2] ?? route;
  return { title, slug: route.replace(/^.*\//, ''), url: route };
}

// ─── Traffic (Search Console Pages export) ───────────────────────────────────

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') cur += line[++i];
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function loadTraffic(path: string): Map<string, number> {
  const lines = readFileSync(path, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const pageCol = header.findIndex((h) => /page|url/.test(h));
  const clickCol = header.findIndex((h) => h === 'clicks');
  if (pageCol < 0 || clickCol < 0) throw new Error(`--traffic: need a page/URL column and a "Clicks" column; got: ${header.join(', ')}`);
  const clicks = new Map<string, number>();
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    let p = cells[pageCol]?.trim() ?? '';
    try {
      p = new URL(p).pathname;
    } catch {
      /* already a path */
    }
    p = p.replace(/\/+$/, '') || '/';
    clicks.set(p, (clicks.get(p) ?? 0) + Number(cells[clickCol]?.replace(/,/g, '') || 0));
  }
  return clicks;
}

// ─── Markdown helpers ────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '\\|');
const MAX_SOURCES_SHOWN = 5;
const showSources = (f: ClassifiedFigure) => {
  const all = f.sources.map(formatSource);
  const shown = all.slice(0, MAX_SOURCES_SHOWN).map((s) => `\`${s}\``).join(', ');
  return all.length > MAX_SOURCES_SHOWN ? `${shown} (+${all.length - MAX_SOURCES_SHOWN} more)` : shown;
};
const flagText = (f: ClassifiedFigure) =>
  [f.flags.approximate && 'approx', f.flags.range && 'range', f.flags.annual && 'annual', f.flags.tableCell && 'table'].filter(Boolean).join(', ');
const ctx = (f: ClassifiedFigure) => `…${esc(f.before)}**${esc(f.raw)}**${esc(f.after)}…`;

interface Counts {
  data: number;
  dataWeak: number;
  derived: number;
  derivedWeak: number;
  unbound: number;
  total: number;
}

function count(figs: ClassifiedFigure[]): Counts {
  const c: Counts = { data: 0, dataWeak: 0, derived: 0, derivedWeak: 0, unbound: 0, total: figs.length };
  for (const f of figs) {
    if (f.class === 'data') {
      c.data++;
      if (f.weak) c.dataWeak++;
    } else if (f.class === 'data-derived') {
      c.derived++;
      if (f.weak) c.derivedWeak++;
    } else c.unbound++;
  }
  return c;
}

function groupByFile(figs: ClassifiedFigure[]) {
  const byFile = new Map<string, ClassifiedFigure[]>();
  for (const f of figs) {
    const l = byFile.get(f.file);
    if (l) l.push(f);
    else byFile.set(f.file, [f]);
  }
  return [...byFile.entries()]
    .map(([file, list]) => ({ file, figs: list, counts: count(list) }))
    .sort((a, b) => b.counts.data + b.counts.derived - (a.counts.data + a.counts.derived) || a.file.localeCompare(b.file));
}

// ─── Report (base year) ──────────────────────────────────────────────────────

function renderReport(year: string, figs: ClassifiedFigure[], files: string[], skipped: Skipped[], generated: string): string {
  const c = count(figs);
  const perFile = groupByFile(figs);
  const out: string[] = [];
  out.push(`# Dollar-figure report — ${year} data`, '');
  out.push(
    `Generated ${generated} by \`npm run check:figures\`. ${c.total} dollar figures in ${perFile.length} of ${files.length} scanned files.`,
    'This is a worklist, not a test: `unbound` is not an error. Classes and `weak`: [README](./README.md).',
    '',
  );
  if (skipped.length) {
    out.push('**Sources not loaded:** ' + skipped.map((s) => `\`${s.group}\` (${s.file}: ${s.reason})`).join('; '), '');
  }
  out.push('## Summary', '', '| Class | Figures | of which `weak` |', '|---|---:|---:|');
  out.push(`| \`data\` | ${c.data} | ${c.dataWeak} |`);
  out.push(`| \`data-derived\` | ${c.derived} | ${c.derivedWeak} |`);
  out.push(`| \`unbound\` | ${c.unbound} | — |`);
  out.push(`| **Total** | **${c.total}** | ${c.dataWeak + c.derivedWeak} |`, '');
  const bound = perFile.filter((p) => p.counts.data + p.counts.derived > 0);
  out.push(`Files with at least one \`data\` or \`data-derived\` figure: **${bound.length}**.`, '');

  out.push('## Files', '', '| File | data | derived | unbound | total |', '|---|---:|---:|---:|---:|');
  for (const p of perFile) {
    const anchor = p.file.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    out.push(`| [${p.file}](#${anchor}) | ${p.counts.data} | ${p.counts.derived} | ${p.counts.unbound} | ${p.counts.total} |`);
  }
  out.push('');

  for (const p of perFile) {
    out.push(`### ${p.file}`, '');
    out.push(`data ${p.counts.data} (${p.counts.dataWeak} weak) · derived ${p.counts.derived} (${p.counts.derivedWeak} weak) · unbound ${p.counts.unbound}`, '');
    const boundFigs = p.figs.filter((f) => f.class !== 'unbound');
    if (boundFigs.length) {
      out.push('| Line | Figure | Class | Sources | Flags | Context |', '|---:|---|---|---|---|---|');
      for (const f of boundFigs) {
        out.push(`| ${f.line} | ${esc(f.raw)} | ${f.class}${f.weak ? ' (weak)' : ''} | ${showSources(f)} | ${flagText(f)} | ${ctx(f)} |`);
      }
      out.push('');
    }
    const unbound = p.figs.filter((f) => f.class === 'unbound');
    if (unbound.length) {
      out.push(`<details><summary>${unbound.length} unbound</summary>`, '');
      out.push('| Line | Figure | Flags | Context |', '|---:|---|---|---|');
      for (const f of unbound) out.push(`| ${f.line} | ${esc(f.raw)} | ${flagText(f)} | ${ctx(f)} |`);
      out.push('', '</details>', '');
    }
  }
  return out.join('\n');
}

// ─── Report (year change) ────────────────────────────────────────────────────

interface WorklistRow {
  file: string;
  meta: FileMeta;
  changed: number;
  yearInTitle: boolean;
  clicks?: number;
}

function renderYearChange(
  baseYear: string,
  nextYear: string,
  result: ReturnType<typeof diffYears>,
  worklist: WorklistRow[],
  skippedNext: Skipped[],
  notes: string[],
  traffic: boolean,
  generated: string,
): string {
  const out: string[] = [];
  out.push(`# Year-change worklist — ${baseYear} → ${nextYear}`, '');
  out.push(`Generated ${generated} by \`npm run check:figures -- --next-year ${nextYear}\`.`, '');
  if (skippedNext.length) {
    out.push(`## Sources skipped (no ${nextYear} data yet)`, '');
    for (const s of skippedNext) out.push(`- \`${s.group}\` — ${s.file}: ${s.reason}`);
    out.push('', `Figures that match only these sources were not checked: **${result.notChecked}**. Re-run as each dataset lands.`, '');
  }
  for (const n of notes) out.push(`> ${n}`, '');

  out.push('## Worklist', '');
  out.push(
    `Every file with at least one changed figure, plus every file with "${baseYear}" in its title or slug.` +
      (traffic ? ' Sorted by Search Console clicks.' : ' Sorted by changed-figure count.'),
    '',
  );
  out.push(`| File | Changed figures | "${baseYear}" in title/slug |${traffic ? ' Clicks |' : ''}`);
  out.push(`|---|---:|:---:|${traffic ? '---:|' : ''}`);
  for (const w of worklist) {
    out.push(`| ${w.file} | ${w.changed} | ${w.yearInTitle ? 'yes' : ''} |${traffic ? ` ${w.clicks ?? 0} |` : ''}`);
  }
  out.push('');

  out.push(`## Changed figures (${result.stale.length})`, '');
  const byFile = new Map<string, StaleFigure[]>();
  for (const s of result.stale) {
    const l = byFile.get(s.figure.file);
    if (l) l.push(s);
    else byFile.set(s.figure.file, [s]);
  }
  for (const w of worklist) {
    const list = byFile.get(w.file);
    if (!list) continue;
    out.push(`### ${w.file}`, '', '| Line | Figure | Change | Context |', '|---:|---|---|---|');
    for (const s of list) {
      const change = s.changes
        .map((c) => {
          const src = formatSource({ label: c.label, op: c.op, value: c.oldValue });
          if (c.newValue === null) return `\`${src}\` removed in ${nextYear}`;
          const fig = c.op === '=' ? '' : ` (figure → ${money(c.newFigure!, s.figure.whole)})`;
          return `\`${src}\` ${money(c.oldValue)} → ${money(c.newValue)}${fig}`;
        })
        .join('<br>');
      const tail = s.unchanged.length ? `<br>unchanged: ${s.unchanged.map((u) => `\`${u}\``).join(', ')}` : '';
      out.push(`| ${s.figure.line} | ${esc(s.figure.raw)}${s.figure.weak ? ' (weak)' : ''} | ${change}${tail} | ${ctx(s.figure)} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseYear = args.baseYear ?? (args.nextYear ? String(Number(args.nextYear) - 1) : latestPayYear());
  const generated = new Date().toISOString().slice(0, 10);

  const files = collectFiles(ROOT, args.scan ?? DEFAULT_SCAN_DIRS);
  const figures = extractFigures(ROOT, files);

  const base = await loadIndex(baseYear);
  const notes: string[] = [];
  let baseIndex = base.index;
  let baseSkipped = base.skipped;
  if (args.nextYear) {
    const fb = withBaselineFallback(base.index, base.skipped);
    baseIndex = fb.index;
    if (fb.note) {
      notes.push(fb.note);
      baseSkipped = base.skipped.filter((s) => !fb.index.groups.includes(s.group));
    }
  }
  const classifier = makeClassifier(baseIndex);
  const classified = figures.map((f) => classify(f, classifier));
  const c = count(classified);

  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Scanned ${files.length} files: ${c.total} figures in ${new Set(figures.map((f) => f.file)).size} files.`);
  console.log(`  data ${c.data} (weak ${c.dataWeak}) · data-derived ${c.derived} (weak ${c.derivedWeak}) · unbound ${c.unbound}`);
  for (const s of baseSkipped) console.log(`  base ${baseYear}: skipped ${s.group} (${s.file}: ${s.reason})`);

  if (!args.nextYear) {
    const md = renderReport(baseYear, classified, files, baseSkipped, generated);
    const json = JSON.stringify({ year: baseYear, generated, files, counts: c, figures: classified });
    writeFileSync(join(OUT_DIR, 'report.md'), md);
    writeFileSync(join(OUT_DIR, 'report.json'), json);
    console.log('Wrote docs/figures/report.md and docs/figures/report.json');
    if (args.baseline) {
      writeFileSync(join(OUT_DIR, `${baseYear}-baseline.md`), md);
      writeFileSync(join(OUT_DIR, `${baseYear}-baseline.json`), json);
      console.log(`Wrote docs/figures/${baseYear}-baseline.md and .json`);
    }
    return;
  }

  // Year-change mode.
  const next = await loadIndex(args.nextYear);
  const result = diffYears(classified, next.index);
  const changedByFile = new Map<string, number>();
  for (const s of result.stale) changedByFile.set(s.figure.file, (changedByFile.get(s.figure.file) ?? 0) + 1);

  const traffic = args.traffic ? loadTraffic(args.traffic) : undefined;
  const worklist: WorklistRow[] = [];
  for (const file of files) {
    const meta = fileMeta(file);
    const yearInTitle = meta.title.includes(baseYear) || meta.slug.includes(baseYear);
    const changed = changedByFile.get(file) ?? 0;
    if (changed || yearInTitle) worklist.push({ file, meta, changed, yearInTitle, clicks: traffic?.get(meta.url) });
  }
  worklist.sort((a, b) =>
    traffic
      ? (b.clicks ?? 0) - (a.clicks ?? 0) || b.changed - a.changed || a.file.localeCompare(b.file)
      : b.changed - a.changed || a.file.localeCompare(b.file),
  );

  const md = renderYearChange(baseYear, args.nextYear, result, worklist, next.skipped, notes, !!traffic, generated);
  const json = JSON.stringify(
    { baseYear, nextYear: args.nextYear, generated, skipped: next.skipped, notes, notChecked: result.notChecked, worklist, stale: result.stale },
  );
  writeFileSync(join(OUT_DIR, `year-change-${args.nextYear}.md`), md);
  writeFileSync(join(OUT_DIR, `year-change-${args.nextYear}.json`), json);
  for (const s of next.skipped) console.log(`  ${args.nextYear}: skipped ${s.group} (${s.file}: ${s.reason})`);
  for (const n of notes) console.log(`  note: ${n}`);
  console.log(`${result.stale.length} changed figures; ${result.notChecked} not checked; worklist ${worklist.length} files.`);
  console.log(`Wrote docs/figures/year-change-${args.nextYear}.md and .json`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
