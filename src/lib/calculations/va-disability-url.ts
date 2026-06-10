/**
 * VA Disability calculator URL serialization.
 *
 * Round-trips the COMPLETE calculator state through the query string so a
 * shared link reproduces exactly what the sharer saw — including body
 * locations (which drive the bilateral factor), dependents, and condition
 * labels. Pure functions: no React, no window access.
 *
 * New schema:
 *   ?r=10.lue,10.rue,60&sp=1&c=2&cs=1&dp=0&l=knee,knee,ptsd
 *
 *   r  — ratings (required). Comma-separated `rating[.locationCode]` pairs,
 *        positional. A bare `rating` (no suffix) means Other / Non-bilateral.
 *   sp — spouse: `1` = yes, omitted = no
 *   c  — children under 18 (integer count, omitted when 0)
 *   cs — children 18–23 in an approved school program (omitted when 0)
 *   dp — dependent parents (omitted when 0)
 *   l  — labels (optional). Comma-separated, URL-encoded, positionally matched
 *        to `r`. Empty positions allowed (`l=knee,,ptsd`). Omitted entirely
 *        when no labels are set.
 *
 * The URL carries body LOCATIONS only — never a bilateral flag or any computed
 * value. The bilateral factor is always re-derived by the calculation layer
 * (38 CFR §4.26) on load.
 *
 * Backward compatibility: a legacy `?ratings=10,10,60` link (no `r=`) parses as
 * three non-bilateral ratings, no dependents, no labels. Existing shared links
 * must not break.
 */

import type { DisabilityEntry, DependentConfig } from './va-disability';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Valid VA ratings: 0, 10, 20 … 100. */
const VALID_RATINGS = new Set([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

const MAX_LABEL_LEN = 30;

type Side = DisabilityEntry['side'];

/**
 * Location code ↔ (side, pairKey) mapping. Codes are short and human-readable.
 * Mirrors BODY_LOCATIONS in VADisabilityCalculator.tsx:
 *   o   — Other / Non-bilateral
 *   lue — Left upper extremity   (arm)
 *   rue — Right upper extremity  (arm)
 *   lle — Left lower extremity   (leg)
 *   rle — Right lower extremity  (leg)
 *   le  — Left eye               (eye)
 *   re  — Right eye              (eye)
 */
const LOCATION_BY_CODE: Record<string, { side: Side; pairKey: string | null }> = {
  o:   { side: 'none',  pairKey: null  },
  lue: { side: 'left',  pairKey: 'arm' },
  rue: { side: 'right', pairKey: 'arm' },
  lle: { side: 'left',  pairKey: 'leg' },
  rle: { side: 'right', pairKey: 'leg' },
  le:  { side: 'left',  pairKey: 'eye' },
  re:  { side: 'right', pairKey: 'eye' },
};

/** Per-field clamps for dependent counts (match the UI counters). */
const DEP_MAX = { c: 10, cs: 5, dp: 2 } as const;

export const DEFAULT_DEPS: DependentConfig = {
  hasSpouse: false,
  childrenUnder18: 0,
  schoolChildren: 0,
  dependentParents: 0,
};

// ─── Shared shape ─────────────────────────────────────────────────────────────

/** A disability without the runtime `id` (the URL never carries ids). */
export type ParsedDisability = Omit<DisabilityEntry, 'id'>;

export interface VADisabilityShareState {
  disabilities: ParsedDisability[];
  deps: DependentConfig;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function codeForLocation(side: Side, pairKey: string | null): string {
  for (const [code, loc] of Object.entries(LOCATION_BY_CODE)) {
    if (loc.side === side && loc.pairKey === pairKey) return code;
  }
  return 'o';
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * Read raw (still percent-encoded) query params, first occurrence wins.
 * We avoid URLSearchParams here so labels can be split on literal commas
 * BEFORE decoding — otherwise an encoded comma inside a label (`%2C`) would be
 * decoded too early and corrupt positional splitting.
 */
function rawParams(search: string): Record<string, string> {
  const s = search.startsWith('?') ? search.slice(1) : search;
  const out: Record<string, string> = {};
  for (const pair of s.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const val = eq === -1 ? '' : pair.slice(eq + 1);
    if (key && !(key in out)) out[key] = val;
  }
  return out;
}

function clampDep(raw: string | undefined, max: number): number {
  if (raw === undefined) return 0;
  const n = parseInt(safeDecode(raw), 10);
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(max, n));
}

// ─── Serialize ────────────────────────────────────────────────────────────────

/**
 * Serialize calculator state into a query string (no leading `?`). Omits params
 * at their default values to keep URLs short. Stable: serialize → parse →
 * serialize yields an identical string.
 */
export function serializeVADisabilityState(state: VADisabilityShareState): string {
  const { disabilities, deps } = state;
  const parts: string[] = [];

  if (disabilities.length > 0) {
    const r = disabilities
      .map((d) => {
        const code = codeForLocation(d.side, d.pairKey);
        // Omit the `.o` suffix for non-bilateral ratings — shorter, readable.
        return code === 'o' ? String(d.rating) : `${d.rating}.${code}`;
      })
      .join(',');
    parts.push(`r=${r}`);
  }

  if (deps.hasSpouse) parts.push('sp=1');
  if (deps.childrenUnder18 > 0) parts.push(`c=${deps.childrenUnder18}`);
  if (deps.schoolChildren > 0) parts.push(`cs=${deps.schoolChildren}`);
  if (deps.dependentParents > 0) parts.push(`dp=${deps.dependentParents}`);

  // Labels: positional, truncated, URL-encoded. Trim trailing empties (they are
  // re-padded on parse), so the param is omitted entirely when nothing is set.
  const labels = disabilities.map((d) => (d.label || '').slice(0, MAX_LABEL_LEN));
  let lastNonEmpty = labels.length;
  while (lastNonEmpty > 0 && labels[lastNonEmpty - 1] === '') lastNonEmpty--;
  if (lastNonEmpty > 0) {
    const l = labels
      .slice(0, lastNonEmpty)
      .map((s) => encodeURIComponent(s))
      .join(',');
    parts.push(`l=${l}`);
  }

  return parts.join('&');
}

// ─── Parse ────────────────────────────────────────────────────────────────────

/**
 * Parse a query string into calculator state. Returns `null` when the string
 * carries no recognizable calculator params (so the caller leaves its defaults).
 *
 * Robust by design — never throws on garbage:
 *   - ratings not in {0,10,…,100} are skipped
 *   - unknown location codes fall back to Other / Non-bilateral
 *   - dependent counts clamp to a sane per-field range
 *   - malformed rating entries are skipped silently
 */
export function parseVADisabilityState(search: string): VADisabilityShareState | null {
  const params = rawParams(search);
  const hasNew = 'r' in params;
  const hasLegacy = 'ratings' in params;
  const hasDeps = 'sp' in params || 'c' in params || 'cs' in params || 'dp' in params;

  if (!hasNew && !hasLegacy && !hasDeps) return null;

  const disabilities: ParsedDisability[] = [];

  if (hasNew) {
    // New schema: `rating[.locationCode]`, positional.
    const raw = safeDecode(params.r);
    const labels = parseLabels(params.l);
    raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .forEach((entry, i) => {
        const [ratingStr, codeStr] = entry.split('.');
        const rating = parseInt(ratingStr, 10);
        if (isNaN(rating) || !VALID_RATINGS.has(rating)) return;
        const loc = (codeStr && LOCATION_BY_CODE[codeStr]) || LOCATION_BY_CODE.o;
        disabilities.push({
          rating,
          label: labels[i] ?? '',
          side: loc.side,
          pairKey: loc.pairKey,
        });
      });
  } else if (hasLegacy) {
    // Legacy: `?ratings=10,10,60` — all non-bilateral, no labels, no deps.
    safeDecode(params.ratings)
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && VALID_RATINGS.has(n))
      .forEach((rating) => {
        disabilities.push({ rating, label: '', side: 'none', pairKey: null });
      });
  }

  // Legacy links never carry dependents; only honor deps with the new schema.
  const deps: DependentConfig = hasLegacy && !hasNew
    ? { ...DEFAULT_DEPS }
    : {
        hasSpouse: params.sp === '1',
        childrenUnder18: clampDep(params.c, DEP_MAX.c),
        schoolChildren: clampDep(params.cs, DEP_MAX.cs),
        dependentParents: clampDep(params.dp, DEP_MAX.dp),
      };

  return { disabilities, deps };
}

/** Split the raw `l` param on literal commas, then decode each position. */
function parseLabels(rawLabels: string | undefined): string[] {
  if (rawLabels === undefined) return [];
  return rawLabels.split(',').map((s) => safeDecode(s).slice(0, MAX_LABEL_LEN));
}
