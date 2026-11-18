/**
 * /bah/changes — BAH year-over-year changes by Military Housing Area.
 *
 * Every figure comes from the BAH registry (DTMO's published rate files):
 * BAH_YEAR vs BAH_PRIOR_YEAR, E-5 with dependents. Nothing is hand-typed and
 * nothing is estimated. On release day (BAH_YEAR = '2027') the page shows
 * 2026 → 2027 with no edits here.
 *
 * `buildBahChanges()` is pure: it takes the two years' rate tables, names,
 * station pages and mid-year changes, so tests can run it on fixture data
 * (the flip test). `currentBahChanges()` in bahChangesData.ts (server only)
 * wires it to the registry.
 *
 * Client-safe: no data imports (types only), so the client table can use the
 * formatters. The page passes the client table only the slim rows below.
 */

import type { MhaRateTable } from '@/data/bah/registry';
import type { BahMidYearChange, BahMidYearChanges } from '@/data/bah/midYear';
import { formatBahDate } from '@/data/bah/midYear';
import { bahRelease, BAH_RELEASE_HISTORY, type BahRelease } from '@/data/bah/releaseHistory';
import {
  RATE_PROTECTION_PROMOTION,
  RATE_PROTECTION_RULE,
  TEMPORARY_INCREASE_EXCEPTION,
} from '@/data/bah/rateProtection';
import { formatMhaName } from '@/lib/mhaDisplay';

export const BAH_CHANGES_PATH = '/bah/changes';
export const BAH_CHANGES_GRADE = 'E-5';
export const DTMO_BAH_LOOKUP_URL = 'https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/';
const SITE = 'https://www.milpaytools.com';

/** Why a row carries a footnote: a DTMO mid-year change in either year. */
export type BahChangeNoteKind = 'midyear-current' | 'temporary-current' | 'temporary-prior';

export interface BahChangeRow {
  mha: string;
  /** DTMO name, display-cased (formatMhaName). */
  name: string;
  /** Prior-year rate; null when the MHA is new this year. */
  prior: number | null;
  current: number;
  /** current − prior (null without a prior rate). */
  abs: number | null;
  /** Percent of the prior rate (unrounded; null without a prior rate). */
  pct: number | null;
  /** First /bah/[slug] page for the MHA, if any. */
  station: { slug: string; name: string } | null;
  note: { kind: BahChangeNoteKind; text: string } | null;
}

export interface BahChangesInput {
  year: string;
  priorYear: string;
  current: MhaRateTable;
  prior: MhaRateTable;
  names: Readonly<Record<string, string>>;
  stationPages: Readonly<Record<string, { slug: string; name: string }[]>>;
  midYearCurrent?: BahMidYearChanges;
  midYearPrior?: BahMidYearChanges;
}

export interface BahChanges {
  year: string;
  priorYear: string;
  /** Every MHA with a current-year rate, default order: % change, descending. */
  rows: BahChangeRow[];
  count: number;
  up: number;
  same: number;
  down: number;
  /** MHAs with no prior-year rate (new areas); not in up/same/down. */
  noPrior: number;
  topIncreases: BahChangeRow[];
  topDecreases: BahChangeRow[];
  largestIncrease: BahChangeRow | null;
  largestDecrease: BahChangeRow | null;
  /** DoD's release for `year` (national average increase), if recorded. */
  release: BahRelease | undefined;
}

function noteFor(
  mha: string,
  input: BahChangesInput,
): BahChangeRow['note'] {
  const cur: BahMidYearChange | undefined = input.midYearCurrent?.[mha];
  if (cur?.temporary) {
    return {
      kind: 'temporary-current',
      text: `The ${input.year} rate includes DTMO's temporary increase effective ${formatBahDate(cur.effective)}, which expires ${formatBahDate(cur.temporary.expires)}.`,
    };
  }
  if (cur) {
    return {
      kind: 'midyear-current',
      text: `DTMO changed this area's ${input.year} rate effective ${formatBahDate(cur.effective)}; the table shows the current rate.`,
    };
  }
  const prev = input.midYearPrior?.[mha];
  if (prev?.temporary) {
    return {
      kind: 'temporary-prior',
      text: `The ${input.priorYear} rate was DTMO's temporary increase effective ${formatBahDate(prev.effective)}, which expired ${formatBahDate(prev.temporary.expires)}. Rate protection doesn't cover temporary increases.`,
    };
  }
  return null;
}

/** % change descending; ties: larger $ change, then name. Rows without a prior rate last. */
export function comparePctDesc(a: BahChangeRow, b: BahChangeRow): number {
  if (a.pct === null || b.pct === null) {
    if (a.pct === b.pct) return a.name.localeCompare(b.name);
    return a.pct === null ? 1 : -1;
  }
  return b.pct - a.pct || (b.abs ?? 0) - (a.abs ?? 0) || a.name.localeCompare(b.name);
}

export function buildBahChanges(input: BahChangesInput): BahChanges {
  const rows: BahChangeRow[] = [];
  for (const mha of Object.keys(input.current)) {
    const current = input.current[mha]?.w?.[BAH_CHANGES_GRADE];
    if (current === undefined) continue;
    const priorRaw = input.prior[mha]?.w?.[BAH_CHANGES_GRADE];
    const prior = priorRaw !== undefined && priorRaw > 0 ? priorRaw : null;
    const abs = prior === null ? null : current - prior;
    const pct = prior === null ? null : ((current - prior) / prior) * 100;
    rows.push({
      mha,
      name: formatMhaName(input.names[mha] ?? mha),
      prior,
      current,
      abs,
      pct,
      station: input.stationPages[mha]?.[0] ?? null,
      note: noteFor(mha, input),
    });
  }
  rows.sort(comparePctDesc);

  const withPrior = rows.filter((r) => r.abs !== null);
  const increases = withPrior.filter((r) => r.abs! > 0); // already % desc
  const decreases = withPrior.filter((r) => r.abs! < 0).reverse(); // % asc: largest fall first
  return {
    year: input.year,
    priorYear: input.priorYear,
    rows,
    count: rows.length,
    up: increases.length,
    same: withPrior.filter((r) => r.abs === 0).length,
    down: decreases.length,
    noPrior: rows.length - withPrior.length,
    topIncreases: increases.slice(0, 10),
    topDecreases: decreases.slice(0, 10),
    largestIncrease: increases[0] ?? null,
    largestDecrease: decreases[0] ?? null,
    release: bahRelease(input.year),
  };
}

// ─── Formatting ──────────────────────────────────────────────────────────────

const usd = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

/** "+$387" / "−$120" / "$0". */
export function formatChangeDollars(abs: number): string {
  if (abs === 0) return '$0';
  return `${abs > 0 ? '+' : '−'}${usd(abs)}`;
}

/** "+26.1%" / "−7.4%" / "0.0%" (one decimal). */
export function formatChangePct(pct: number): string {
  const r = Math.round(pct * 10) / 10;
  if (r === 0) return '0.0%';
  return `${r > 0 ? '+' : '−'}${Math.abs(r).toFixed(1)}%`;
}

export function formatRate(n: number): string {
  return usd(n);
}

// ─── Page text (all from the data) ───────────────────────────────────────────

export function bahChangesTitle(year: string): string {
  return `${year} BAH Changes: Biggest Increases and Decreases by Area`;
}

export function bahChangesH1(year: string): string {
  return `${year} BAH Changes by Military Housing Area`;
}

export function bahChangesDescription(c: Pick<BahChanges, 'year' | 'priorYear' | 'count'>): string {
  return `How ${c.year} BAH changed from ${c.priorYear} in all ${c.count} military housing areas: E-5 with dependents, biggest increases and decreases. Official DTMO rates.`;
}

export function bahChangesScopeLine(c: Pick<BahChanges, 'year' | 'priorYear' | 'count'>): string {
  return `${c.count} housing areas · E-5 with dependents · ${c.priorYear} → ${c.year} · source DTMO`;
}

/** Rate-protection callout beside the decreases (approved text only). */
export function bahChangesProtectionText(c: BahChanges): string[] {
  const out = [RATE_PROTECTION_RULE, RATE_PROTECTION_PROMOTION];
  if (c.rows.some((r) => r.abs !== null && r.abs < 0 && r.note?.kind === 'temporary-prior')) {
    out.push(TEMPORARY_INCREASE_EXCEPTION);
  }
  return out;
}

function listDates(releases: readonly BahRelease[]): string {
  const parts = releases.map((r) => `${formatBahDate(r.releasedDate)} (${r.ratesYear} rates)`);
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * FAQ: one array for the visible list and the FAQPage schema.
 * Release timing comes only from past release dates (releaseHistory.ts);
 * rate protection only from rateProtection.ts.
 */
export function bahChangesFaqs(
  c: BahChanges,
  history: readonly BahRelease[] = BAH_RELEASE_HISTORY,
): { question: string; answer: string }[] {
  const next = String(Number(c.year) + 1);
  const nextRelease = history.find((r) => r.ratesYear === Number(next));
  const past = history.filter((r) => r.ratesYear <= Number(c.year)).slice(0, 3);
  const allDecember = past.length > 0 && past.every((r) => r.releasedDate.slice(5, 7) === '12');

  const whenAnswer = nextRelease
    ? `DoD released the ${next} BAH rates on ${formatBahDate(nextRelease.releasedDate)}. They take effect January 1, ${next}. This page compares ${c.priorYear} with ${c.year} until the ${next} rates are loaded into the [BAH calculator](/bah).`
    : `${next} rates take effect January 1, ${next}. ${
        allDecember ? `The last ${past.length} releases all came out in December: ` : 'The last releases came out on '
      }${listDates(past)}. When DTMO publishes the ${next} rates, this page will compare ${c.year} with ${next}, and the [BAH calculator](/bah) will show them.`;

  return [
    {
      question: `When do ${next} BAH rates come out?`,
      answer: whenAnswer,
    },
    {
      question: 'Why did BAH go down in some areas?',
      answer: `For an E-5 with dependents, ${c.down} of the ${c.count} housing areas have a lower ${c.year} rate than in ${c.priorYear}. DTMO sets each area's rate from its yearly survey of local rents and utilities, so a published rate can fall as well as rise. ${RATE_PROTECTION_RULE} ${RATE_PROTECTION_PROMOTION}`,
    },
    {
      question: "Does BAH change if I'm already stationed there?",
      answer: `A higher rate applies from January 1 to everyone receiving BAH in that area. When a rate goes down, rate protection decides who keeps the old one. ${RATE_PROTECTION_RULE} ${RATE_PROTECTION_PROMOTION} ${TEMPORARY_INCREASE_EXCEPTION}`,
    },
    {
      question: 'Where do these numbers come from?',
      answer: `Every rate is DTMO's published monthly BAH for an E-5 with dependents in each Military Housing Area, from its ${c.priorYear} and ${c.year} rate files ([DTMO BAH rate lookup](${DTMO_BAH_LOOKUP_URL})). The change is the ${c.year} rate minus the ${c.priorYear} rate; the percent is that change divided by the ${c.priorYear} rate. Where DTMO changed a rate during the year, the table shows the current rate and marks it.${
        c.release ? ` The national average increase (${c.release.avgIncreasePct}%) is DoD's own figure for all pay grades, from its ${c.year} release.` : ''
      }`,
    },
  ];
}

/** Dataset JSON-LD: only fields we can fill truthfully. */
export function bahChangesDatasetSchema(c: BahChanges) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${c.year} BAH changes by Military Housing Area`,
    description: `Monthly Basic Allowance for Housing (BAH) for an E-5 with dependents in each of the ${c.count} Military Housing Areas, ${c.priorYear} and ${c.year}, with the dollar and percent change. Rates are DTMO's published figures.`,
    url: `${SITE}${BAH_CHANGES_PATH}`,
    temporalCoverage: `${c.priorYear}-01-01/${c.year}-12-31`,
    spatialCoverage: { '@type': 'Place', name: 'United States' },
    variableMeasured: 'Monthly BAH, E-5 with dependents (U.S. dollars)',
    creator: {
      '@type': 'Organization',
      name: 'Defense Travel Management Office',
      url: 'https://www.travel.dod.mil/',
    },
    isBasedOn: DTMO_BAH_LOOKUP_URL,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: `${SITE}${BAH_CHANGES_PATH}`,
    },
  };
}

/** Slim row for the client table: no rate tables, nothing beyond what it shows. */
export interface BahChangeTableRow {
  mha: string;
  name: string;
  prior: number | null;
  current: number;
  abs: number | null;
  pct: number | null;
  href: string | null;
  marked: boolean;
}

export function toTableRows(rows: BahChangeRow[]): BahChangeTableRow[] {
  return rows.map((r) => ({
    mha: r.mha,
    name: r.name,
    prior: r.prior,
    current: r.current,
    abs: r.abs,
    pct: r.pct,
    href: r.station ? `/bah/${r.station.slug}` : null,
    marked: r.note !== null,
  }));
}
