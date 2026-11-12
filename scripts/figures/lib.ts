/**
 * Dollar-figure staleness report: extraction, data index, classification,
 * and year-change diffing. Pure functions only — no CLI, no module loading
 * by path (see scripts/check-figures.ts for that), so the Tier 1 test
 * (tests/e2e/figure-check.spec.ts) can drive every piece with static imports
 * and fixtures.
 *
 * This is a REPORT, never a gate: nothing here throws on an unmatched figure.
 * See docs/figures/README.md for the three classes and the `weak` marking.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// ─── Extraction ──────────────────────────────────────────────────────────────

export interface FigureFlags {
  /** `~`, "about", "approximately" or "roughly" just before the figure. */
  approximate: boolean;
  /** Followed by `/year`, `/yr`, "a year", "per year" or "annually". */
  annual: boolean;
  /** Inside a markdown table row. */
  tableCell: boolean;
  /** One end of a dash range (`$1,000–$2,000`; "from $X to $Y" is a change, not a range). */
  range: boolean;
}

export interface Figure {
  /** Repo-relative path with forward slashes. */
  file: string;
  line: number;
  /** The figure as written, e.g. `$4,110.00`. */
  raw: string;
  /** Dollar value, e.g. 4110. */
  value: number;
  /** Integer cents, for exact comparison. */
  cents: number;
  /** True when written without cents (`$4,110`). */
  whole: boolean;
  before: string;
  after: string;
  flags: FigureFlags;
}

/** Default scan targets: blog posts and guide pages. Override with `--scan`. */
export const DEFAULT_SCAN_DIRS = ['src/content/blog', 'src/app/guides'];

/** A file is scanned when it is MDX/Markdown content or a route page. */
const SCANNED_FILE = /(\.mdx?|[\\/]page\.tsx)$/;

const toPosix = (p: string) => p.split(sep).join('/');

/** Recursively list scannable files under each dir (repo-relative, sorted). */
export function collectFiles(root: string, dirs: string[] = DEFAULT_SCAN_DIRS): string[] {
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const p = join(abs, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (SCANNED_FILE.test(p)) out.push(toPosix(relative(root, p)));
    }
  };
  for (const d of dirs) walk(join(root, d));
  return out.sort();
}

/**
 * `$1,234`, `$1,234.56`, `$12` — digits must be properly comma-grouped or
 * ungrouped, and not run on into more digits.
 */
const FIGURE_RE = /\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(?![\d,]\d)/g;
/** Magnitude suffixes: `$1.5 million`, `$200K`, `$2B` are not data figures. */
const MAGNITUDE_AFTER = /^\s*(?:[kKmMbB]\b|million\b|billion\b|trillion\b)/i;
const APPROX_BEFORE = /(?:~|\babout|\bapproximately|\broughly)\s*[+\-−]?\s*$/i;
const RANGE_BEFORE = /\$[\d,.]+\+?\s*[–—-]\s*~?$/;
const RANGE_AFTER = /^\+?\s*[–—-]\s*~?\$?\d/;
const ANNUAL_AFTER = /^(?:\s*\/\s*(?:year|yr)\b|\s+(?:a|per)\s+year\b|\s+annually\b|\s*\(?annual\b)/i;

const CONTEXT = 60;
const squash = (s: string) => s.replace(/\s+/g, ' ');

/** Extract every dollar figure from one file's text. */
export function extractFromText(file: string, text: string): Figure[] {
  const figures: Figure[] = [];
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1);
  const lineOf = (idx: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  for (const m of text.matchAll(FIGURE_RE)) {
    const start = m.index!;
    const end = start + m[0].length;
    const tail = text.slice(end, end + 20);
    // A trailing `.5` (as in `$1.5 million`) was not consumed when it has 1–2
    // digits, so check the magnitude after any leftover decimal digits too.
    if (MAGNITUDE_AFTER.test(tail) || MAGNITUDE_AFTER.test(tail.replace(/^\.\d+/, ''))) continue;

    const dollars = Number(m[1].replace(/,/g, ''));
    const centsPart = m[2] ? Number(m[2].padEnd(2, '0')) : 0;
    const cents = dollars * 100 + centsPart;
    const li = lineOf(start);
    const lineText = text.slice(lineStarts[li], (lineStarts[li + 1] ?? text.length + 1) - 1);
    const trimmed = lineText.trim();

    figures.push({
      file,
      line: li + 1,
      raw: m[0],
      value: cents / 100,
      cents,
      whole: !m[2],
      before: squash(text.slice(Math.max(0, start - CONTEXT), start)),
      after: squash(text.slice(end, end + CONTEXT)),
      flags: {
        approximate: APPROX_BEFORE.test(text.slice(Math.max(0, start - 20), start)),
        annual: ANNUAL_AFTER.test(tail),
        tableCell: trimmed.startsWith('|') && trimmed.indexOf('|', 1) > 0,
        range: RANGE_BEFORE.test(text.slice(Math.max(0, start - 20), start)) || RANGE_AFTER.test(tail),
      },
    });
  }
  return figures;
}

export function extractFigures(root: string, files: string[]): Figure[] {
  return files.flatMap((f) => extractFromText(f, readFileSync(join(root, f), 'utf8')));
}

// ─── Data index ──────────────────────────────────────────────────────────────

/**
 * Source groups. `file` is the module path for a given year; `{Y}` is the
 * year. `inPlace` modules are not year-versioned — they are edited in place
 * each January and declare their year in `DATA_YEAR`.
 */
export interface SourceGroup {
  id: string;
  file: string;
  inPlace?: boolean;
  /** Turn the loaded module into labelled numeric entries. */
  entries: (mod: Record<string, unknown>) => [label: string, value: number][];
}

/**
 * Keys that hold counts, years, durations, weights or ratios — never dollar
 * amounts. Matched against every object key on the way down, so excluding
 * `weightAllowance` (pounds) drops its whole subtree.
 */
const NON_MONEY_KEY =
  /^(?:year|dataYear|DATA_YEAR|academicYear|maxPct|weightAllowance|defaultFundReturns|brsMatchingTiers)$|Months$|monthsPerYear$|Days$|^miles|Rate$|^rate$|Pct$|Percent$|MULTIPLIER|_PCT$/;

/** Walk an object/array, yielding [path, number] for every money-like leaf. */
export function walkNumbers(value: unknown, path = ''): [string, number][] {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? [[path, value]] : [];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => walkNumbers(v, `${path}[${i}]`));
  if (value && typeof value === 'object' && !(value instanceof Map) && !(value instanceof Set)) {
    return Object.entries(value).flatMap(([k, v]) =>
      NON_MONEY_KEY.test(k) ? [] : walkNumbers(v, path ? `${path}.${k}` : k),
    );
  }
  return [];
}

/** Every money-like numeric leaf under the exports whose names match `names`, labelled without the export name. */
const walkExports = (prefix: string, names: RegExp) =>
  (mod: Record<string, unknown>): [string, number][] =>
    Object.entries(mod)
      .filter(([k]) => names.test(k))
      .flatMap(([, v]) => walkNumbers(v).map(([p, n]) => [`${prefix}:${p}`, n] as [string, number]));

export const SOURCE_GROUPS: SourceGroup[] = [
  {
    id: 'pay',
    file: 'src/data/pay-tables/{Y}.ts',
    entries: (mod) => {
      const out: [string, number][] = [];
      const table = mod.payTable as Record<string, Record<string, number | undefined>>;
      for (const [grade, cols] of Object.entries(table)) {
        for (const [yos, v] of Object.entries(cols)) if (v) out.push([`pay:${grade}@${yos}`, v]);
      }
      if (typeof mod.E1_UNDER_4_MONTHS === 'number') out.push(['pay:E-1@<4mo', mod.E1_UNDER_4_MONTHS]);
      return out;
    },
  },
  {
    id: 'va',
    file: 'src/data/va-rates/{Y}.ts',
    entries: (mod) => {
      const out: [string, number][] = [];
      const table = mod.vaRates as Record<string, Record<string, number>>;
      for (const [rating, cols] of Object.entries(table)) {
        for (const [col, v] of Object.entries(cols)) if (v > 0) out.push([`va:${rating}%/${col}`, v]);
      }
      return out;
    },
  },
  {
    id: 'bah',
    file: 'src/data/bah/{Y}/mhaRates.ts',
    entries: (mod) => {
      const out: [string, number][] = [];
      const table = mod.mhaRates as Record<string, { w: Record<string, number>; wo: Record<string, number> }>;
      for (const [mha, set] of Object.entries(table)) {
        for (const dep of ['w', 'wo'] as const) {
          for (const [grade, v] of Object.entries(set[dep])) if (v > 0) out.push([`bah:${mha}/${grade}/${dep}`, v]);
        }
      }
      return out;
    },
  },
  {
    // BAS, TSP limits, SGLI, tax brackets, standard deductions. Edited in place.
    id: 'const',
    file: 'src/data/constants.ts',
    inPlace: true,
    entries: (mod) => [
      ...walkNumbers(mod.BAS_RATES).map(([p, n]) => [`bas:${p}`, n] as [string, number]),
      ...Object.entries(mod)
        .filter(([k]) => /^[A-Z][A-Z0-9_]+$/.test(k) && !/^(?:DATA_YEAR|DATA_AS_OF|BAS_RATES)$|_PCT$|MULTIPLIER/.test(k))
        .flatMap(([k, v]) => walkNumbers(v, k).map(([p, n]) => [`const:${p}`, n] as [string, number])),
    ],
  },
  // No 'cola' group: CONUS COLA data is eligibility + index only (no dollar values) since 2026-11-12.
  { id: 'deployment', file: 'src/data/deployment/{Y}/constants.ts', entries: walkExports('deployment', /^DEPLOYMENT_RATES/) },
  { id: 'education', file: 'src/data/education/{Y}/constants.ts', entries: walkExports('education', /^EDUCATION_RATES$/) },
  { id: 'healthcare', file: 'src/data/healthcare/{Y}/constants.ts', entries: walkExports('healthcare', /^HEALTHCARE_/) },
  { id: 'pcs', file: 'src/data/pcs/{Y}/constants.ts', entries: walkExports('pcs', /^PCS_RATES_/) },
  { id: 'tricare', file: 'src/data/tricare/{Y}/constants.ts', entries: walkExports('tricare', /^TRICARE_RATES_/) },
  { id: 'tsp', file: 'src/data/tsp/{Y}/constants.ts', entries: walkExports('tsp', /^TSP_CONSTANTS_/) },
];

export const groupFile = (g: SourceGroup, year: string) => g.file.replace('{Y}', year);

/** Source group of a label: `pay:E-5@6` → `pay`; BAS lives in the `const` group. */
export const labelGroup = (label: string) => {
  const prefix = label.slice(0, label.indexOf(':'));
  return prefix === 'bas' ? 'const' : prefix;
};

export interface DataIndex {
  year: string;
  /** label → cents */
  byLabel: Map<string, number>;
  /** cents → labels */
  byCents: Map<number, string[]>;
  /** Group ids that contributed entries. */
  groups: string[];
}

const toCents = (v: number) => Math.round(v * 100);

export function buildIndex(year: string, loaded: { group: SourceGroup; mod: Record<string, unknown> }[]): DataIndex {
  const entries: [string, number][] = [];
  for (const { group, mod } of loaded) entries.push(...group.entries(mod));
  return indexFromEntries(year, entries, loaded.map((l) => l.group.id));
}

export function indexFromEntries(year: string, entries: [string, number][], groups: string[]): DataIndex {
  const byLabel = new Map<string, number>();
  const byCents = new Map<number, string[]>();
  for (const [label, v] of entries) {
    const c = toCents(v);
    byLabel.set(label, c);
    const list = byCents.get(c);
    if (list) list.push(label);
    else byCents.set(c, [label]);
  }
  return { year, byLabel, byCents, groups };
}

// ─── Classification ──────────────────────────────────────────────────────────

export type FigureClass = 'data' | 'data-derived' | 'unbound';

/**
 * A source match. `op` says how the figure relates to the source value:
 * `=` exact, `round` whole-dollar rounding, `x12` twelve months of it.
 */
export interface SourceMatch {
  label: string;
  op: '=' | 'round' | 'x12';
  /** Source value in dollars. */
  value: number;
}

export interface ClassifiedFigure extends Figure {
  class: FigureClass;
  /**
   * Lower confidence — the match may be a coincidence. See WEAK_GROUPS and
   * isWeak() for the rule.
   */
  weak: boolean;
  sources: SourceMatch[];
}

/**
 * Monthly values whose ×12 counts as `data-derived`: pay, BAS, VA, and the
 * monthly-rate constants. Not BAH (too many coincidences) and not annual
 * values (deductibles, TSP limits, caps) — twelve of those means nothing.
 */
const MONTHLY_LABEL =
  /^(?:pay|bas|va):|^deployment:(?:hfp|idp|fsa|hdpLevels\[\d+\]|hdpLTopRatePrior)$|^(?:tricare:reserveSelect\.|healthcare:tricareReserveSelect\.\w+\.premium$|healthcare:\w+\.\w+\.\w+\.premium$)|^education:(?:giBill\.onlineMHAMonthly|mgib\.fullTimeMonthly)$/;

export interface Classifier {
  index: DataIndex;
  /** whole dollars → labels whose value has cents and rounds to it */
  rounded: Map<number, string[]>;
  /** cents of v×12 → labels */
  annualExact: Map<number, string[]>;
  /** whole dollars of round(v×12) → labels */
  annualRounded: Map<number, string[]>;
}

const push = (m: Map<number, string[]>, k: number, v: string) => {
  const l = m.get(k);
  if (l) l.push(v);
  else m.set(k, [v]);
};

export function makeClassifier(index: DataIndex): Classifier {
  const rounded = new Map<number, string[]>();
  const annualExact = new Map<number, string[]>();
  const annualRounded = new Map<number, string[]>();
  for (const [label, c] of index.byLabel) {
    // Rounding to $0 (e.g. the $0.05 SGLI rate) says nothing — skip it.
    if (c % 100 !== 0 && Math.round(c / 100) > 0) push(rounded, Math.round(c / 100), label);
    if (MONTHLY_LABEL.test(label)) {
      push(annualExact, c * 12, label);
      push(annualRounded, Math.round((c * 12) / 100), label);
    }
  }
  return { index, rounded, annualExact, annualRounded };
}

/**
 * Groups large or round enough that a match on them alone is often a
 * coincidence: BAH (16,000+ values) and the healthcare illustration tables
 * (round numbers like $500 and $2,000).
 */
const WEAK_GROUPS = new Set(['bah', 'healthcare']);

/**
 * `weak` when every source is in a WEAK_GROUP, the figure is a whole number
 * under $100, or the figure is approximate or one end of a range (those are
 * illustrations, rarely a quoted data value).
 */
export function isWeak(fig: Figure, sources: SourceMatch[]): boolean {
  return (
    (fig.whole && fig.value < 100) ||
    fig.flags.approximate ||
    fig.flags.range ||
    sources.every((s) => WEAK_GROUPS.has(labelGroup(s.label)))
  );
}

export function classify(fig: Figure, cl: Classifier): ClassifiedFigure {
  const val = (l: string) => cl.index.byLabel.get(l)! / 100;
  const exact = cl.index.byCents.get(fig.cents);
  let sources: SourceMatch[] = [];
  let klass: FigureClass = 'unbound';

  const derived: SourceMatch[] = [];
  if (fig.whole) {
    for (const label of cl.rounded.get(fig.cents / 100) ?? []) derived.push({ label, op: 'round', value: val(label) });
  }
  const annual = fig.whole
    ? new Set([...(cl.annualExact.get(fig.cents) ?? []), ...(cl.annualRounded.get(fig.cents / 100) ?? [])])
    : new Set(cl.annualExact.get(fig.cents) ?? []);
  for (const label of annual) derived.push({ label, op: 'x12', value: val(label) });

  const exactSources = (exact ?? []).map((label) => ({ label, op: '=' as const, value: val(label) }));
  const bahOnly = exactSources.length > 0 && exactSources.every((s) => labelGroup(s.label) === 'bah');

  if (exactSources.length && !(bahOnly && derived.length)) {
    klass = 'data';
    sources = exactSources;
  } else if (derived.length) {
    // A BAH-only exact hit is usually a coincidence when the figure is also a
    // clean derivation of a non-BAH value ($5,400 = 12 × $450 HFP). Prefer the
    // derivation, but keep the BAH labels so the year-change diff checks both.
    klass = 'data-derived';
    sources = [...derived, ...exactSources];
  }

  const weak = klass !== 'unbound' && isWeak(fig, sources);
  return { ...fig, class: klass, weak, sources };
}

export const formatSource = (s: SourceMatch) =>
  s.op === '=' ? s.label : s.op === 'round' ? `round(${s.label})` : `12×${s.label}`;

// ─── Year-change diff ────────────────────────────────────────────────────────

export interface SourceChange {
  label: string;
  op: SourceMatch['op'];
  oldValue: number;
  /** null when the label no longer exists in the next-year data. */
  newValue: number | null;
  /** What the figure would read with the new value (same op applied). */
  newFigure: number | null;
}

export interface StaleFigure {
  figure: ClassifiedFigure;
  changes: SourceChange[];
  /** Sources that were checked and did not change. */
  unchanged: string[];
}

export interface YearChangeResult {
  nextYear: string;
  stale: StaleFigure[];
  /** Figures whose sources are all in groups with no next-year data yet. */
  notChecked: number;
}

const applyOp = (op: SourceMatch['op'], dollars: number, whole: boolean) => {
  const v = op === 'x12' ? dollars * 12 : dollars;
  return op === 'round' || (op === 'x12' && whole) ? Math.round(v) : Math.round(v * 100) / 100;
};

/** Every bound figure whose source value changed (or vanished) in `next`. */
export function diffYears(figures: ClassifiedFigure[], next: DataIndex): YearChangeResult {
  const nextGroups = new Set(next.groups);
  const stale: StaleFigure[] = [];
  let notChecked = 0;
  for (const figure of figures) {
    if (figure.class === 'unbound') continue;
    const checkable = figure.sources.filter((s) => nextGroups.has(labelGroup(s.label)));
    if (!checkable.length) {
      notChecked++;
      continue;
    }
    const changes: SourceChange[] = [];
    const unchanged: string[] = [];
    for (const s of checkable) {
      const nc = next.byLabel.get(s.label);
      if (nc !== undefined && nc === toCents(s.value)) {
        unchanged.push(formatSource(s));
        continue;
      }
      const newValue = nc === undefined ? null : nc / 100;
      changes.push({
        label: s.label,
        op: s.op,
        oldValue: s.value,
        newValue,
        newFigure: newValue === null ? null : applyOp(s.op, newValue, figure.whole),
      });
    }
    if (changes.length) stale.push({ figure, changes, unchanged });
  }
  return { nextYear: next.year, stale, notChecked };
}

// ─── Small formatting helpers shared by the CLI ──────────────────────────────

export const money = (v: number, whole = false) =>
  v.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
