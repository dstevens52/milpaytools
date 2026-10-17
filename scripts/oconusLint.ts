// OCONUS v2 lint rules (spec Section 6). Pure functions so the CLI
// (scripts/lint-oconus.ts) and the test suite (tests/e2e/oconus-v2-unit.spec.ts)
// run identical checks. Relative imports only — this runs under tsx, not Next.

import type { OconusStation, SourcedFact, SharedLink } from '../src/data/oconus/types';

export type LintIssue = {
  rule: 'currency' | 'voice' | 'verification' | 'staleness';
  severity: 'error' | 'warn';
  station: string; // slug, or "shared"
  field: string;
  text: string;
  match?: string;
};

// 1. Currency / number. The spec's second pattern ends in `\b`, which can't
// follow a bare "€" (no word boundary between "€" and a space), so "150 €"
// would slip through; the symbol alternative is pulled out of the \b group.
// Strictly broader than the spec pattern — nothing it catches is missed.
export const CURRENCY_PATTERNS: RegExp[] = [
  /[€£¥₩$]\s?\d/,
  /\d[\d,.]*\s?(?:[€£¥₩]|(?:EUR|GBP|USD|JPY|KRW|euros?|pounds?|dollars?|yen|won)\b)/i,
  /\d+(\.\d+)?\s?%/,
];

// 2. Voice. Errors everywhere; "always"/"never" are checked in station data
// only and logged as warnings for Dan to review.
export const VOICE_ERROR_PHRASES = [
  'you should',
  'you must',
  'immediately',
  'invest in',
  'the best way',
  'make sure to',
  "don't forget to",
  'tax-free',
];
export const VOICE_REVIEW_PHRASES = ['always ', 'never '];

const TODO = 'TODO-DAN';
const STALE_MONTHS = 13;

/** Straighten curly apostrophes/quotes so "don’t" matches "don't". */
function norm(text: string): string {
  return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

export function lintText(
  text: string,
  ctx: { station: string; field: string; isStationData: boolean },
): LintIssue[] {
  const { station, field } = ctx;
  const issues: LintIssue[] = [];
  const t = norm(text);
  for (const re of CURRENCY_PATTERNS) {
    const m = re.exec(t);
    if (m) issues.push({ rule: 'currency', severity: 'error', station, field, text, match: m[0] });
  }
  const lower = t.toLowerCase();
  for (const p of VOICE_ERROR_PHRASES) {
    if (lower.includes(p)) issues.push({ rule: 'voice', severity: 'error', station, field, text, match: p });
  }
  if (ctx.isStationData) {
    for (const p of VOICE_REVIEW_PHRASES) {
      if (new RegExp(`\\b${p}`, 'i').test(t)) issues.push({ rule: 'voice', severity: 'warn', station, field, text, match: p.trim() });
    }
  }
  return issues;
}

type NamedFact = { field: string; fact: SourcedFact<string | string[]> };

export function stationFacts(s: OconusStation): NamedFact[] {
  const out: NamedFact[] = [
    { field: 'hostCountry', fact: s.hostCountry },
    { field: 'cityRegion', fact: s.cityRegion },
    { field: 'branches', fact: s.branches },
    { field: 'ohaLocalityCode', fact: s.ohaLocalityCode },
    { field: 'colaLocality', fact: s.colaLocality },
    { field: 'localContext', fact: s.localContext },
  ];
  if (s.coLocated) out.push({ field: 'coLocated', fact: s.coLocated });
  s.leaseQuestions.forEach((f, i) => out.push({ field: `leaseQuestions[${i}]`, fact: f }));
  s.beforeYouMove.forEach((f, i) => out.push({ field: `beforeYouMove[${i}]`, fact: f }));
  return out;
}

/** Every text field of a station, for the currency and voice lints. */
export function stationTexts(s: OconusStation): { field: string; text: string }[] {
  const out = [
    { field: 'name', text: s.name },
    { field: 'shortName', text: s.shortName },
  ];
  for (const { field, fact } of stationFacts(s)) {
    const vals = Array.isArray(fact.value) ? fact.value : [fact.value];
    vals.forEach((v, i) => out.push({ field: Array.isArray(fact.value) ? `${field}[${i}]` : field, text: v }));
  }
  s.officialLinks.forEach((l, i) => out.push({ field: `officialLinks[${i}].label`, text: l.label }));
  return out;
}

export function lintStation(s: OconusStation, now: Date = new Date()): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const { field, text } of stationTexts(s)) {
    issues.push(...lintText(text, { station: s.slug, field, isStationData: true }));
  }

  // 3. Verification — published stations only.
  if (s.published) {
    const err = (field: string, text: string) =>
      issues.push({ rule: 'verification', severity: 'error', station: s.slug, field, text });
    for (const { field, fact } of stationFacts(s)) {
      if (fact.verifiedOn === null) err(`${field}.verifiedOn`, 'null');
      if (fact.sourceUrl.includes(TODO)) err(`${field}.sourceUrl`, fact.sourceUrl);
      const vals = Array.isArray(fact.value) ? fact.value : [fact.value];
      if (vals.some((v) => v.includes(TODO))) err(`${field}.value`, vals.join(' | '));
    }
    s.officialLinks.forEach((l, i) => {
      if (l.url.includes(TODO)) err(`officialLinks[${i}].url`, l.url);
    });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.lastReviewed)) err('lastReviewed', s.lastReviewed);
  }

  // 4. Staleness — warn only.
  if (s.published && /^\d{4}-\d{2}-\d{2}$/.test(s.lastReviewed)) {
    const reviewed = new Date(`${s.lastReviewed}T00:00:00Z`);
    const cutoff = new Date(now);
    cutoff.setUTCMonth(cutoff.getUTCMonth() - STALE_MONTHS);
    if (reviewed < cutoff) {
      issues.push({ rule: 'staleness', severity: 'warn', station: s.slug, field: 'lastReviewed', text: s.lastReviewed });
    }
  }
  return issues;
}

export function lintShared(
  copy: { field: string; text: string }[],
  links: SharedLink[],
  anyPublished: boolean,
): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const { field, text } of copy) {
    issues.push(...lintText(text, { station: 'shared', field, isStationData: false }));
  }
  // Shared links ship on every v2 page, so they must be verified before the
  // first station publishes.
  if (anyPublished) {
    links.forEach((l) => {
      if (l.url.includes(TODO) || l.verifiedOn === null) {
        issues.push({ rule: 'verification', severity: 'error', station: 'shared', field: `link "${l.label}"`, text: l.url });
      }
    });
  }
  return issues;
}

export function formatIssue(i: LintIssue): string {
  const m = i.match ? ` [matched: "${i.match}"]` : '';
  return `${i.severity.toUpperCase()} ${i.rule} — ${i.station} › ${i.field}${m}: ${i.text}`;
}
