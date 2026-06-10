/**
 * VA Disability Compensation calculation logic.
 * Pure functions — no React, no side effects.
 *
 * Legal references:
 *   38 CFR § 4.25 — Combined ratings table
 *   38 CFR § 4.26 — Bilateral factor
 *
 * Combined rating algorithm ("whole person" method):
 *   1. Sort ratings highest to lowest.
 *   2. Apply each rating to the REMAINING healthy percentage.
 *   3. Round the final result ONCE to nearest 10% (never between steps).
 *
 * Bilateral factor (§ 4.26):
 *   Applies when BOTH sides of a paired body part (arms, legs, or
 *   paired skeletal muscles) have compensable (>0%) ratings. Eyes are
 *   NOT a § 4.26 pair — vision is rated under §§ 4.75–4.79.
 *   1. Combine the bilateral pair using VA math.
 *   2. Add 10% of that combined value.
 *   3. Use the adjusted value as a single input to the overall calculation.
 */

import { vaRates, DATA_YEAR } from '@/data/va-rates/2026';
import { combinePair } from './va-combined-table';

// ─── Public Types ──────────────────────────────────────────────────────────

export interface DisabilityEntry {
  id: string;
  rating: number;    // 0, 10, 20 … 100
  label: string;     // user's note ("PTSD", "Left knee", etc.)
  side: 'left' | 'right' | 'none';
  pairKey: string | null; // 'arm' | 'leg' — null for non-bilateral
}

/** @deprecated Use DependentConfig instead */
export type DependentStatus = 'alone' | 'with-spouse';

export interface DependentConfig {
  hasSpouse: boolean;
  childrenUnder18: number;   // 0–10
  schoolChildren: number;    // ages 18-23 attending an approved school program, 0–5
  dependentParents: number;  // 0–2
}

export interface CalculationStep {
  type: 'init' | 'apply' | 'bilateral-header' | 'bilateral-apply' | 'bilateral-factor' | 'sort' | 'result' | 'round';
  label: string;
  detail: string;
  value?: number;
  remaining?: number;
}

export interface BilateralPairResult {
  /** Paired body parts that contributed to this bilateral computation (e.g. ['arm','leg']). */
  pairKeys: string[];
  /** Every rating folded into the bilateral computation, highest-first. */
  members: number[];
  /** § 4.25 combined value of the bilateral members, before the factor (integer). */
  combinedBeforeFactor: number;
  /** 10% of combinedBeforeFactor, carried to one decimal. */
  factorAddition: number;
  /** combinedBeforeFactor + factor, rounded to the nearest whole number per § 4.26. */
  combinedAfterFactor: number;
}

export interface CombinedRatingResult {
  exact: number;
  rounded: number;
  steps: CalculationStep[];
  bilateralApplied: boolean;
  bilateralPairs: BilateralPairResult[];
}

export interface CompensationBreakdownLine {
  label: string;
  amount: number;
}

export interface CompensationResult {
  monthly: number;
  annual: number;
  dataYear: string;
  breakdown: CompensationBreakdownLine[];
  hasDependents: boolean;
}

// ─── Core Math ─────────────────────────────────────────────────────────────

/**
 * Round a combined rating to the nearest 10% per VA rules.
 * Values ≥ 95 round to 100%.
 */
export function roundVARating(exact: number): number {
  if (exact >= 95) return 100;
  return Math.round(exact / 10) * 10;
}

// ─── Bilateral Processing ──────────────────────────────────────────────────

interface BilateralGroup {
  pairKey: string;
  members: DisabilityEntry[];
  hasLeft: boolean;   // at least one compensable (>0%) left-side member
  hasRight: boolean;  // at least one compensable (>0%) right-side member
}

/**
 * Group disabilities by their paired body part (pairKey). The pairing rules
 * themselves (which locations share a pairKey) are owned by the calculator's
 * BODY_LOCATIONS table and are intentionally unchanged here. A group holds
 * ALL members of that pairKey, on either side — a bilateral group is not
 * limited to one rating per side.
 */
function groupBilateral(disabilities: DisabilityEntry[]): BilateralGroup[] {
  const map = new Map<string, BilateralGroup>();
  for (const d of disabilities) {
    if (!d.pairKey) continue;
    if (!map.has(d.pairKey)) {
      map.set(d.pairKey, { pairKey: d.pairKey, members: [], hasLeft: false, hasRight: false });
    }
    const g = map.get(d.pairKey)!;
    g.members.push(d);
    if (d.side === 'left' && d.rating > 0) g.hasLeft = true;
    if (d.side === 'right' && d.rating > 0) g.hasRight = true;
  }
  return [...map.values()];
}

function pairLabel(pairKeys: string[]): string {
  const labels: Record<string, string> = {
    arm: 'arms',
    leg: 'legs',
  };
  return pairKeys.map((k) => labels[k] ?? k).join(' + ');
}

/**
 * Apply the § 4.26 bilateral factor: add 10% of the combined bilateral value
 * (not combine), then round to the nearest whole number. § 4.26's own worked
 * example mandates this rounding (30 & 10 → 37 + 3.7 = 40.7 → 41). Integer
 * arithmetic avoids float drift on half-point subtotals.
 */
function applyBilateralFactor(combined: number): number {
  // round half up of combined × 1.1  =  ⌊(combined×11 + 5) / 10⌋
  return Math.floor((combined * 11 + 5) / 10);
}

// ─── Main Calculation ──────────────────────────────────────────────────────

/**
 * Calculate the combined VA disability rating for a list of disability entries,
 * following the 38 CFR § 4.25 Combined Ratings Table and the § 4.26 bilateral
 * factor. Every pairwise combination is an integer table value.
 *
 * 38 CFR § 4.26 (quoted from memory — verify verbatim against eCFR before
 * relying on the text): "...the ratings for the disabilities of the right and
 * left sides will be combined as usual, and 10 percent of this value will be
 * added (i.e., not combined) before proceeding with further combinations...
 * the rating for such disabilities including the bilateral factor... will be
 * treated as one disability for the purpose of arranging in order of severity
 * and for all further combinations." Per § 4.26(c) / (a) — "arms" and "legs"
 * meaning the upper and lower extremities as a whole — when MORE THAN ONE
 * paired group qualifies (e.g. both arms AND both legs), all qualifying
 * bilateral members are combined together into ONE computation with a single
 * 10% factor, not a separate factor per group.
 */
export function calculateCombinedRating(disabilities: DisabilityEntry[]): CombinedRatingResult {
  const steps: CalculationStep[] = [];
  const bilateralPairs: BilateralPairResult[] = [];

  if (disabilities.length === 0) {
    return { exact: 0, rounded: 0, steps: [], bilateralApplied: false, bilateralPairs: [] };
  }

  // ── Identify qualifying bilateral groups ─────────────────────────────────
  // A group qualifies when it has at least one compensable member on the LEFT
  // and one on the RIGHT. Non-qualifying paired members (e.g. three left legs,
  // nothing on the right) combine as ordinary ratings.
  const groups = groupBilateral(disabilities);
  const qualifyingGroups = groups.filter((g) => g.hasLeft && g.hasRight);
  const qualifyingPairKeys = new Set(qualifyingGroups.map((g) => g.pairKey));

  const bilateralIds = new Set<string>();
  for (const d of disabilities) {
    if (d.pairKey && qualifyingPairKeys.has(d.pairKey)) bilateralIds.add(d.id);
  }

  // ── Bilateral computation (§ 4.26(c): all qualifying groups merged into one) ─
  const effectiveRatings: number[] = [];

  if (qualifyingGroups.length > 0) {
    const bilateralMembers = disabilities
      .filter((d) => bilateralIds.has(d.id))
      .map((d) => d.rating)
      .sort((a, b) => b - a);

    const pairKeys = qualifyingGroups.map((g) => g.pairKey);

    steps.push({
      type: 'bilateral-header',
      label: `Bilateral disabilities — ${pairLabel(pairKeys)} (${bilateralMembers.map((r) => `${r}%`).join(', ')})`,
      detail: 'Both sides compensable — combine all bilateral ratings, then add the 10% factor (38 CFR § 4.26)',
    });

    let combined = bilateralMembers[0];
    for (let i = 1; i < bilateralMembers.length; i++) {
      const next = bilateralMembers[i];
      const result = combinePair(combined, next);
      steps.push({
        type: 'bilateral-apply',
        label: `${combined} & ${next} → ${result}`,
        detail: `Combine ${combined}% with ${next}% (§ 4.25 table)`,
        value: result,
      });
      combined = result;
    }

    const factorAddition = combined / 10;
    const combinedAfterFactor = applyBilateralFactor(combined);

    steps.push({
      type: 'bilateral-factor',
      label: `Bilateral factor: 10% of ${combined} = ${factorAddition.toFixed(1)}`,
      detail: `${combined} + ${factorAddition.toFixed(1)} = ${(combined + factorAddition).toFixed(1)} → rounds to ${combinedAfterFactor}`,
      value: combinedAfterFactor,
    });

    bilateralPairs.push({
      pairKeys,
      members: bilateralMembers,
      combinedBeforeFactor: combined,
      factorAddition: parseFloat(factorAddition.toFixed(1)),
      combinedAfterFactor,
    });

    effectiveRatings.push(combinedAfterFactor);
  }

  // ── Add non-bilateral ratings ────────────────────────────────────────────
  for (const d of disabilities) {
    if (!bilateralIds.has(d.id)) effectiveRatings.push(d.rating);
  }

  // ── Final combination through the § 4.25 table ───────────────────────────
  const sorted = [...effectiveRatings].sort((a, b) => b - a);

  if (sorted.length > 1) {
    steps.push({
      type: 'sort',
      label: 'Sorted (highest first)',
      detail: sorted.map((r) => `${r}%`).join(', '),
    });
  }

  let exact = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    const result = combinePair(exact, next);
    steps.push({
      type: 'apply',
      label: `${exact} & ${next} → ${result}`,
      detail: `Combine ${exact}% with ${next}% (§ 4.25 table)`,
      value: result,
    });
    exact = result;
  }

  const rounded = roundVARating(exact);

  steps.push({
    type: 'result',
    label: 'Combined value',
    detail: `${exact}% combined before final rounding`,
    value: exact,
  });

  steps.push({
    type: 'round',
    label: 'Round to nearest 10%',
    detail:
      rounded === 100 && exact < 100
        ? `${exact}% (≥ 95%) → 100%`
        : `${exact}% → ${rounded}%`,
    value: rounded,
  });

  return {
    exact,
    rounded,
    steps,
    bilateralApplied: qualifyingGroups.length > 0,
    bilateralPairs,
  };
}

// ─── Compensation Lookup ───────────────────────────────────────────────────

export function getCompensation(
  roundedRating: number,
  deps: DependentConfig
): CompensationResult {
  const entry = vaRates[roundedRating];
  const empty: CompensationResult = {
    monthly: 0, annual: 0, dataYear: DATA_YEAR, breakdown: [], hasDependents: false,
  };
  if (!entry) return empty;

  const breakdown: CompensationBreakdownLine[] = [];
  const dependentsApply = roundedRating >= 30;

  const under18Count = Math.max(0, Math.floor(deps.childrenUnder18));
  const schoolCount = Math.max(0, Math.min(5, Math.floor(deps.schoolChildren)));
  const hasAnyChild = (under18Count + schoolCount) > 0;
  const parents = Math.max(0, Math.min(2, Math.floor(deps.dependentParents)));

  // Direct lookup from Table A (no children) or Table B (with 1 child).
  // VA publishes these combination rates — do NOT compute by addition.
  let baseRate: number;
  let baseLabel: string;

  if (!dependentsApply || (!deps.hasSpouse && !hasAnyChild && parents === 0)) {
    baseRate = entry.veteranAlone;
    baseLabel = 'Veteran alone';
  } else if (deps.hasSpouse && hasAnyChild) {
    baseRate = parents === 2 ? entry.withSpouseAnd1ChildAnd2Parents
             : parents === 1 ? entry.withSpouseAnd1ChildAnd1Parent
             : entry.withSpouseAnd1Child;
    baseLabel = parents > 0
      ? `Veteran + spouse + 1 child + ${parents} parent${parents > 1 ? 's' : ''}`
      : 'Veteran + spouse + 1 child';
  } else if (deps.hasSpouse) {
    baseRate = parents === 2 ? entry.withSpouseAnd2Parents
             : parents === 1 ? entry.withSpouseAnd1Parent
             : entry.withSpouse;
    baseLabel = parents > 0
      ? `Veteran + spouse + ${parents} parent${parents > 1 ? 's' : ''}`
      : 'Veteran + spouse';
  } else if (hasAnyChild) {
    baseRate = parents === 2 ? entry.with1ChildAnd2Parents
             : parents === 1 ? entry.with1ChildAnd1Parent
             : entry.with1Child;
    baseLabel = parents > 0
      ? `Veteran + 1 child + ${parents} parent${parents > 1 ? 's' : ''}`
      : 'Veteran + 1 child';
  } else {
    // Parents only, no spouse, no children
    baseRate = parents === 2 ? entry.with2Parents : entry.with1Parent;
    baseLabel = `Veteran + ${parents} parent${parents > 1 ? 's' : ''}`;
  }

  breakdown.push({ label: baseLabel, amount: baseRate });
  let monthly = baseRate;

  if (dependentsApply) {
    // Under-18 children beyond the first (Table B already includes 1 child).
    const additionalUnder18 = hasAnyChild ? Math.max(0, under18Count - 1) : 0;
    if (additionalUnder18 > 0) {
      const amt = additionalUnder18 * entry.additionalChild;
      breakdown.push({
        label: `${additionalUnder18} additional child${additionalUnder18 > 1 ? 'ren' : ''} under 18`,
        amount: amt,
      });
      monthly += amt;
    }

    // School children (18-23): when under-18 children exist, the Table B base
    // used an under-18 child, so all school children are additional. When there
    // are no under-18 children, the first school child is the Table B base.
    const additionalSchool = under18Count > 0 ? schoolCount : Math.max(0, schoolCount - 1);
    if (additionalSchool > 0) {
      const amt = additionalSchool * entry.additionalSchoolChild;
      breakdown.push({
        label: `${additionalSchool} school child${additionalSchool > 1 ? 'ren' : ''} (18–23)`,
        amount: amt,
      });
      monthly += amt;
    }
  }

  const hasDependents =
    deps.hasSpouse ||
    deps.childrenUnder18 > 0 ||
    deps.schoolChildren > 0 ||
    deps.dependentParents > 0;

  monthly = parseFloat(monthly.toFixed(2));

  return {
    monthly,
    annual: parseFloat((monthly * 12).toFixed(2)),
    dataYear: DATA_YEAR,
    breakdown,
    hasDependents,
  };
}

// ─── Scenario Builder ──────────────────────────────────────────────────────

export function whatIfAddRating(
  currentDisabilities: DisabilityEntry[],
  additionalRating: number
): { newRounded: number; newExact: number } {
  const hypothetical: DisabilityEntry[] = [
    ...currentDisabilities,
    { id: '__what-if__', rating: additionalRating, label: '', side: 'none', pairKey: null },
  ];
  const result = calculateCombinedRating(hypothetical);
  return { newRounded: result.rounded, newExact: result.exact };
}
