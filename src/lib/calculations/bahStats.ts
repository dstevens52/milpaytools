/**
 * BAH statistics — build-time, pure functions computed entirely from the existing
 * DoD/DTMO MHA rate dataset (no external data). Powers the universal enrichment
 * on the /bah/[slug] station pages: national-median comparison, percentile rank,
 * year-over-year change, same-MHA siblings, and nearby-installation deltas.
 *
 * Server/build only — these import the full dataset and must never be pulled into
 * a client component.
 */

import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import {
  getMHARatesForYear,
  getMHACode,
  listMHACodes,
  CURRENT_BAH_YEAR,
  PRIOR_BAH_YEAR,
  type BahYear,
} from '@/lib/calculations/bah';

/**
 * Official DTMO national-average BAH increase, by year. This is the
 * authoritative, recognizable figure DTMO publishes with each annual release —
 * NOT a computed median change (which would not match it). Update annually.
 * Source: DTMO 2026 BAH release.
 */
export const NATIONAL_AVG_BAH_INCREASE: Record<string, number> = {
  '2026': 4.2,
};

/** Treat a base's % change within this band of the national figure as "in line". */
const NATIONAL_INCREASE_TOLERANCE = 0.3;

export type IncreaseRelation = 'above' | 'below' | 'in line with';

/**
 * Compare a base's percent change to the official national-average increase for
 * the year. Returns null when there's no published national figure for the year.
 */
export function nationalIncreaseComparison(
  pct: number,
  year: string = CURRENT_BAH_YEAR,
): { nationalPct: number; relation: IncreaseRelation } | null {
  const nationalPct = NATIONAL_AVG_BAH_INCREASE[year];
  if (nationalPct === undefined) return null;
  const diff = pct - nationalPct;
  // "Within ±0.3 pts" is inclusive; the epsilon keeps the boundary FP-safe.
  const relation: IncreaseRelation =
    Math.abs(diff) <= NATIONAL_INCREASE_TOLERANCE + 1e-9
      ? 'in line with'
      : diff > 0
        ? 'above'
        : 'below';
  return { nationalPct, relation };
}

/**
 * True if any pay grade (with OR without dependents) decreased from the prior
 * year to `year` at this MHA. Returns false when prior-year data is missing.
 */
export function hasRateDecrease(mhaCode: string, year: BahYear = CURRENT_BAH_YEAR): boolean {
  // Only the current year has a defined prior year in the registry.
  if (year !== CURRENT_BAH_YEAR) return false;
  const priorYear = PRIOR_BAH_YEAR;
  for (const hasDependents of [true, false]) {
    const current = getMHARatesForYear(mhaCode, hasDependents, year);
    const prior = getMHARatesForYear(mhaCode, hasDependents, priorYear);
    if (!current || !prior) continue;
    for (const grade of Object.keys(current)) {
      const p = prior[grade];
      if (p !== undefined && current[grade] < p) return true;
    }
  }
  return false;
}

/** True median (not mean) of a numeric list. Rounds the even-length midpoint. */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

/** Every MHA's rate for a grade + dependency status in a year (skips missing). */
function ratesForGrade(rank: string, hasDependents: boolean, year: BahYear): number[] {
  const out: number[] = [];
  for (const mha of listMHACodes(year)) {
    const r = getMHARatesForYear(mha, hasDependents, year)?.[rank];
    if (r !== undefined) out.push(r);
  }
  return out;
}

/**
 * 1. National median BAH across all MHAs for a grade + dependency status.
 * Identical to getNationalAverages()[w/wo][rank] — both use the true median.
 */
export function nationalMedianBAH(
  rank: string,
  hasDependents: boolean,
  year: BahYear = CURRENT_BAH_YEAR,
): number {
  return median(ratesForGrade(rank, hasDependents, year));
}

export interface MhaPercentile {
  /** 1-based rank from the top (1 = highest). Ties take the best/highest rank. */
  rankFromTop: number;
  /** Number of MHAs compared. */
  total: number;
  /** "top X%" — rankFromTop / total, rounded (1–100). */
  topPercent: number;
}

/**
 * 2. This MHA's standing among all MHAs for a grade + dependency status.
 * Returns null when the MHA has no rate for that grade.
 */
export function mhaPercentile(
  mhaCode: string,
  rank: string,
  hasDependents: boolean,
  year: BahYear = CURRENT_BAH_YEAR,
): MhaPercentile | null {
  const target = getMHARatesForYear(mhaCode, hasDependents, year)?.[rank];
  if (target === undefined) return null;
  const rates = ratesForGrade(rank, hasDependents, year);
  const total = rates.length;
  if (total === 0) return null;
  const higher = rates.filter((r) => r > target).length;
  const rankFromTop = higher + 1;
  const topPercent = Math.max(1, Math.round((rankFromTop / total) * 100));
  return { rankFromTop, total, topPercent };
}

export interface YoYChange {
  abs: number; // current − prior
  pct: number; // percent change
  prior: number;
  current: number;
}

/**
 * 3. Year-over-year change for a grade at an MHA (current vs prior year).
 * Returns null when either year lacks the rate (graceful for future years).
 */
export function yoyForGrade(
  mhaCode: string,
  rank: string,
  hasDependents: boolean,
): YoYChange | null {
  const current = getMHARatesForYear(mhaCode, hasDependents, CURRENT_BAH_YEAR)?.[rank];
  const prior = getMHARatesForYear(mhaCode, hasDependents, PRIOR_BAH_YEAR)?.[rank];
  if (current === undefined || prior === undefined || prior <= 0) return null;
  return { abs: current - prior, pct: ((current - prior) / prior) * 100, prior, current };
}

export interface SiblingInstallation {
  slug: string;
  name: string;
}

/**
 * 4. Other CONUS installations sharing the same MHA (identical BAH rate).
 * Excludes the current station; excludes OCONUS.
 */
export function siblingInstallations(mhaCode: string, excludeSlug?: string): SiblingInstallation[] {
  return DUTY_STATIONS.filter(
    (s) => !s.oconus && s.slug !== excludeSlug && getMHACode(s.zip) === mhaCode,
  ).map((s) => ({ slug: s.slug, name: s.name }));
}

export interface NearbyDelta {
  slug: string;
  name: string;
  city: string;
  state: string;
  oconus?: true;
  e5Rate?: number;
  /** E-5 with-dependents difference vs the base station (current − this would be wrong; this − base). */
  e5Delta?: number;
}

/**
 * 5. The base station's "nearby/comparable" installations with each one's
 * E-5 with-dependents BAH and its $ difference vs the base station.
 */
export function nearbyDeltas(slug: string, year: BahYear = CURRENT_BAH_YEAR): NearbyDelta[] {
  const base = DUTY_STATIONS.find((s) => s.slug === slug);
  if (!base) return [];
  const baseMha = base.oconus ? null : getMHACode(base.zip);
  const baseE5 = baseMha ? getMHARatesForYear(baseMha, true, year)?.['E-5'] : undefined;

  return DUTY_STATIONS.filter((s) => base.nearby.includes(s.slug)).map((s) => {
    const mha = s.oconus ? null : getMHACode(s.zip);
    const e5Rate = mha ? getMHARatesForYear(mha, true, year)?.['E-5'] : undefined;
    const e5Delta =
      e5Rate !== undefined && baseE5 !== undefined ? e5Rate - baseE5 : undefined;
    return {
      slug: s.slug,
      name: s.name,
      city: s.city,
      state: s.state,
      oconus: s.oconus,
      e5Rate,
      e5Delta,
    };
  });
}
