/**
 * VA Disability Compensation calculation logic.
 * Pure functions — no React, no side effects.
 *
 * Legal references:
 *   38 CFR § 4.25 — Combined ratings table
 *   38 CFR § 4.26 — Bilateral factor (incl. the (d) exception)
 *   38 U.S.C. § 1115 — Additional compensation for dependents
 *
 * Combined rating algorithm ("whole person" method):
 *   1. Sort ratings highest to lowest.
 *   2. Apply each rating to the REMAINING healthy percentage. Each pairwise
 *      step is a whole-number § 4.25 table value.
 *   3. Round the final result ONCE to the nearest 10% (never to a 10% step
 *      in between).
 *
 * Bilateral factor (§ 4.26):
 *   Applies when BOTH sides of a paired extremity (arms or legs) have
 *   compensable (>0%) ratings. § 4.26 also covers paired skeletal muscles;
 *   this calculator does not model those. Eyes are NOT a § 4.26 pair — vision
 *   is rated under §§ 4.75–4.79.
 *   1. Combine the bilateral ratings using VA math.
 *   2. Add 10% of that combined value (capped at 100).
 *   3. Use the adjusted value as a single input to the overall calculation.
 *   4. § 4.26(d): if leaving one or more bilateral ratings out of the factor
 *      gives a higher combined evaluation, use that instead.
 *
 * Rates: the current-year table from src/data/va-rates/registry.ts.
 */

import { CURRENT_VA_RATES, type VaRatesYear } from '@/data/va-rates/registry';
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
  /** Spouse receives Aid & Attendance (38 U.S.C. § 1115(1)(E)). Counts only with a spouse at 30%+. */
  spouseAidAttendance?: boolean;
}

export interface CalculationStep {
  type: 'init' | 'apply' | 'bilateral-header' | 'bilateral-apply' | 'bilateral-factor' | 'bilateral-exception' | 'sort' | 'result' | 'round';
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
  /** combinedBeforeFactor + factor, rounded to the nearest whole number per § 4.26, capped at 100. */
  combinedAfterFactor: number;
}

/** Set when § 4.26(d) took one or more bilateral ratings out of the factor. */
export interface BilateralException {
  /** The ratings combined separately instead of inside the bilateral factor. */
  excluded: Omit<DisabilityEntry, 'id'>[];
  /** Combined value and rating with every bilateral rating inside the factor. */
  withFactorExact: number;
  withFactorRounded: number;
}

export interface CombinedRatingResult {
  exact: number;
  rounded: number;
  steps: CalculationStep[];
  bilateralApplied: boolean;
  bilateralPairs: BilateralPairResult[];
  bilateralException: BilateralException | null;
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
 * (not combine), then round to the nearest whole number, as with every § 4.25
 * table value (e.g. 30 & 10 → 37 + 3.7 = 40.7 → 41). The regulation's own
 * example is 60, 20, 10, 10 with the 10s bilateral: 19 + 1.9 → 21, then
 * 60 & 21 → 68, 68 & 20 → 74 → 70%. Integer arithmetic avoids float drift on
 * half-point subtotals.
 *
 * Returns the uncapped value; callers cap at 100 (§ 4.25: a combined value
 * can't exceed 100).
 */
function applyBilateralFactor(combined: number): number {
  // round half up of combined × 1.1  =  ⌊(combined×11 + 5) / 10⌋
  return Math.floor((combined * 11 + 5) / 10);
}

/** "left leg 10%" — how an excluded bilateral rating is named in the steps. */
function describeMember(d: Omit<DisabilityEntry, 'id'>): string {
  const limb = d.pairKey === 'arm' ? 'arm' : d.pairKey === 'leg' ? 'leg' : 'condition';
  const where = d.side === 'none' ? limb : `${d.side} ${limb}`;
  return d.label ? `${d.label} (${where}) ${d.rating}%` : `${where} ${d.rating}%`;
}

/** Most bilateral ratings for which every subset is tried (2^12 = 4,096 passes). */
const MAX_EXHAUSTIVE_BILATERAL = 12;

// ─── Main Calculation ──────────────────────────────────────────────────────

/**
 * Calculate the combined VA disability rating for a list of disability entries,
 * following the 38 CFR § 4.25 Combined Ratings Table and the § 4.26 bilateral
 * factor. Every pairwise combination is an integer table value.
 *
 * 38 CFR § 4.26 (eCFR, checked 2026-11-18): "...the ratings for the
 * disabilities of the right and left sides will be combined as usual, and 10
 * percent of this value will be added (i.e., not combined) before proceeding
 * with further combinations... the rating for such disabilities including the
 * bilateral factor in this section will be treated as one disability for the
 * purpose of arranging in order of severity and for all further combinations."
 * Per § 4.26(a)–(b) — "arms" and "legs" meaning the upper and lower extremities
 * as a whole — when MORE THAN ONE paired group qualifies (e.g. both arms AND
 * both legs), all qualifying bilateral members are combined together into ONE
 * computation with a single 10% factor, not a separate factor per group.
 *
 * § 4.26(d) (added by 88 FR 22917, Apr. 14, 2023; text checked against eCFR
 * 2026-11-18): "In cases where the combined evaluation is lower than what could
 * be achieved by not including one or more bilateral disabilities in the
 * bilateral factor calculation, those bilateral disabilities will be removed
 * from the bilateral factor calculation and combined separately, to achieve the
 * combined evaluation most favorable to the veteran." Every subset of the
 * compensable bilateral ratings is tried out of the factor; the highest ROUNDED
 * rating wins. The factor stays as applied unless leaving ratings out gives a
 * strictly higher rating.
 */
export function calculateCombinedRating(disabilities: DisabilityEntry[]): CombinedRatingResult {
  const withFactor = combineOnce(disabilities);
  if (!withFactor.bilateralApplied) return withFactor;

  // Compensable members of the qualifying bilateral groups. 0% members change
  // nothing wherever they sit, so they are never moved.
  const qualifying = new Set(withFactor.bilateralPairs.flatMap((p) => p.pairKeys));
  const candidates = disabilities.filter((d) => d.pairKey && qualifying.has(d.pairKey) && d.rating > 0);

  const subsets: DisabilityEntry[][] = [];
  if (candidates.length <= MAX_EXHAUSTIVE_BILATERAL) {
    for (let mask = 1; mask < 1 << candidates.length; mask++) {
      subsets.push(candidates.filter((_, i) => mask & (1 << i)));
    }
  } else {
    // Very long lists: each rating alone, then all of them.
    subsets.push(...candidates.map((c) => [c]), candidates);
  }

  let best: { result: CombinedRatingResult; excluded: DisabilityEntry[] } | null = null;
  for (const removed of subsets) {
    const ids = new Set(removed.map((d) => d.id));
    const r = combineOnce(disabilities.map((d) => (ids.has(d.id) ? { ...d, pairKey: null } : d)));
    if (r.rounded <= withFactor.rounded) continue;
    // Everything now outside the factor: the removed ratings plus any partner
    // left without a compensable rating on the other side.
    const stillPaired = new Set(r.bilateralPairs.flatMap((p) => p.pairKeys));
    const excluded = candidates.filter((d) => ids.has(d.id) || !d.pairKey || !stillPaired.has(d.pairKey));
    if (
      !best ||
      r.rounded > best.result.rounded ||
      (r.rounded === best.result.rounded &&
        (excluded.length < best.excluded.length ||
          (excluded.length === best.excluded.length && r.exact > best.result.exact)))
    ) {
      best = { result: r, excluded };
    }
  }
  if (!best) return withFactor;

  const excludedText = best.excluded.map(describeMember).join(', ');
  const exceptionStep: CalculationStep = {
    type: 'bilateral-exception',
    label: `Bilateral factor exception (38 CFR § 4.26(d)): ${excludedText} combined separately.`,
    detail: `With every bilateral rating inside the factor, the combined value is ${withFactor.exact}%, which rounds to ${withFactor.rounded}%. Leaving ${best.excluded.length === 1 ? 'this rating' : 'these ratings'} out of the factor gives ${best.result.rounded}%, so VA uses the higher rating.`,
  };

  return {
    ...best.result,
    steps: [exceptionStep, ...best.result.steps],
    bilateralException: {
      excluded: best.excluded.map((d) => ({ rating: d.rating, label: d.label, side: d.side, pairKey: d.pairKey })),
      withFactorExact: withFactor.exact,
      withFactorRounded: withFactor.rounded,
    },
  };
}

/** One pass of § 4.25 / § 4.26 with every qualifying bilateral rating inside the factor. */
function combineOnce(disabilities: DisabilityEntry[]): CombinedRatingResult {
  const steps: CalculationStep[] = [];
  const bilateralPairs: BilateralPairResult[] = [];

  if (disabilities.length === 0) {
    return { exact: 0, rounded: 0, steps: [], bilateralApplied: false, bilateralPairs: [], bilateralException: null };
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
    const uncapped = applyBilateralFactor(combined);
    const combinedAfterFactor = Math.min(100, uncapped);
    const sum = `${combined} + ${factorAddition.toFixed(1)} = ${(combined + factorAddition).toFixed(1)}`;

    steps.push({
      type: 'bilateral-factor',
      label: `Bilateral factor: 10% of ${combined} = ${factorAddition.toFixed(1)}`,
      detail:
        uncapped > 100
          ? `${sum} → capped at 100 (a combined value can't exceed 100%)`
          : `${sum} → rounds to ${combinedAfterFactor}`,
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
    bilateralException: null,
  };
}

// ─── Compensation Lookup ───────────────────────────────────────────────────

/**
 * Monthly compensation for a rounded rating and dependents, from the
 * current-year table (or `rates`, for tests pinned to one year).
 *
 * Children (38 U.S.C. § 1115(1)(F); VA rate-table footnote: "Rates for each
 * school child are shown separately. They are not included with any other
 * compensation rates. All other entries on this chart reflecting a rate for
 * children show the rate payable for children under 18 or helpless."):
 *   - the Table B "with 1 child" base is chosen from UNDER-18 children only;
 *   - each further under-18 child adds `additionalChild`;
 *   - EVERY child 18–23 in school adds `additionalSchoolChild`.
 */
export function getCompensation(
  roundedRating: number,
  deps: DependentConfig,
  rates: VaRatesYear = CURRENT_VA_RATES,
): CompensationResult {
  const entry = rates.table[roundedRating];
  const empty: CompensationResult = {
    monthly: 0, annual: 0, dataYear: rates.year, breakdown: [], hasDependents: false,
  };
  if (!entry) return empty;

  const breakdown: CompensationBreakdownLine[] = [];
  const dependentsApply = roundedRating >= 30;

  const under18Count = Math.max(0, Math.floor(deps.childrenUnder18));
  const schoolCount = Math.max(0, Math.min(5, Math.floor(deps.schoolChildren)));
  // Table B (the "with 1 child" columns) is for children under 18 only.
  const hasUnder18Child = under18Count > 0;
  const parents = Math.max(0, Math.min(2, Math.floor(deps.dependentParents)));

  // Direct lookup from Table A (no children) or Table B (with 1 child).
  // VA publishes these combination rates — do NOT compute by addition.
  let baseRate: number;
  let baseLabel: string;

  if (!dependentsApply || (!deps.hasSpouse && !hasUnder18Child && parents === 0)) {
    baseRate = entry.veteranAlone;
    baseLabel = 'Veteran alone';
  } else if (deps.hasSpouse && hasUnder18Child) {
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
  } else if (hasUnder18Child) {
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
    const additionalUnder18 = hasUnder18Child ? Math.max(0, under18Count - 1) : 0;
    if (additionalUnder18 > 0) {
      const amt = additionalUnder18 * entry.additionalChild;
      breakdown.push({
        label: `${additionalUnder18} additional child${additionalUnder18 > 1 ? 'ren' : ''} under 18`,
        amount: amt,
      });
      monthly += amt;
    }

    // School children (18–23): every one is paid the separate school-child
    // amount; none is ever the Table B base.
    if (schoolCount > 0) {
      const amt = schoolCount * entry.additionalSchoolChild;
      breakdown.push({
        label: `${schoolCount} school child${schoolCount > 1 ? 'ren' : ''} (18–23)`,
        amount: amt,
      });
      monthly += amt;
    }

    // Spouse Aid & Attendance (38 U.S.C. § 1115(1)(E)): a spouse is required.
    if (deps.hasSpouse && deps.spouseAidAttendance && entry.spouseAA > 0) {
      breakdown.push({ label: 'Spouse receives Aid & Attendance', amount: entry.spouseAA });
      monthly += entry.spouseAA;
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
    dataYear: rates.year,
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
