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
 *   Applies when BOTH sides of a paired body part (arms, legs, eyes,
 *   paired skeletal muscles) have compensable (>0%) ratings.
 *   1. Combine the bilateral pair using VA math.
 *   2. Add 10% of that combined value.
 *   3. Use the adjusted value as a single input to the overall calculation.
 */

import { vaRates, DATA_YEAR } from '@/data/va-rates/2026';

// ─── Public Types ──────────────────────────────────────────────────────────

export interface DisabilityEntry {
  id: string;
  rating: number;    // 0, 10, 20 … 100
  label: string;     // user's note ("PTSD", "Left knee", etc.)
  side: 'left' | 'right' | 'none';
  pairKey: string | null; // 'arm' | 'leg' | 'eye' — null for non-bilateral
}

export type DependentStatus = 'alone' | 'with-spouse';

export interface CalculationStep {
  type: 'init' | 'apply' | 'bilateral-header' | 'bilateral-apply' | 'bilateral-factor' | 'sort' | 'result' | 'round';
  label: string;
  detail: string;
  value?: number;
  remaining?: number;
}

export interface BilateralPairResult {
  pairKey: string;
  leftRating: number;
  rightRating: number;
  combinedBeforeFactor: number;
  factorAddition: number;
  combinedAfterFactor: number;
}

export interface CombinedRatingResult {
  exact: number;
  rounded: number;
  steps: CalculationStep[];
  bilateralApplied: boolean;
  bilateralPairs: BilateralPairResult[];
}

export interface CompensationResult {
  monthly: number;
  annual: number;
  dataYear: string;
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
  left: number | null;
  right: number | null;
}

function groupBilateral(disabilities: DisabilityEntry[]): BilateralGroup[] {
  const map = new Map<string, BilateralGroup>();
  for (const d of disabilities) {
    if (!d.pairKey) continue;
    if (!map.has(d.pairKey)) map.set(d.pairKey, { pairKey: d.pairKey, left: null, right: null });
    const g = map.get(d.pairKey)!;
    if (d.side === 'left') g.left = d.rating;
    if (d.side === 'right') g.right = d.rating;
  }
  return [...map.values()];
}

function pairLabel(pairKey: string): string {
  const labels: Record<string, string> = {
    arm: 'left/right arm',
    leg: 'left/right leg',
    eye: 'left/right eye',
  };
  return labels[pairKey] ?? pairKey;
}

// ─── Main Calculation ──────────────────────────────────────────────────────

/**
 * Calculate the combined VA disability rating given a list of disability
 * entries. Handles the bilateral factor automatically.
 */
export function calculateCombinedRating(disabilities: DisabilityEntry[]): CombinedRatingResult {
  const steps: CalculationStep[] = [];
  const bilateralPairs: BilateralPairResult[] = [];

  if (disabilities.length === 0) {
    return { exact: 0, rounded: 0, steps: [], bilateralApplied: false, bilateralPairs: [] };
  }

  // ── Identify qualifying bilateral pairs ──────────────────────────────────
  const groups = groupBilateral(disabilities);
  const qualifyingPairs = groups.filter(
    (g) => g.left !== null && g.right !== null && g.left > 0 && g.right > 0
  );

  const bilateralIds = new Set<string>();
  for (const d of disabilities) {
    if (d.pairKey && qualifyingPairs.some((p) => p.pairKey === d.pairKey)) {
      bilateralIds.add(d.id);
    }
  }

  // ── Compute adjusted bilateral values ────────────────────────────────────
  const effectiveRatings: number[] = [];

  for (const pair of qualifyingPairs) {
    const leftRating = pair.left!;
    const rightRating = pair.right!;
    const sortedPair = [leftRating, rightRating].sort((a, b) => b - a);

    steps.push({
      type: 'bilateral-header',
      label: `Bilateral pair: ${pairLabel(pair.pairKey)} (${leftRating}% left, ${rightRating}% right)`,
      detail: 'Both sides compensable — bilateral factor applies (38 CFR § 4.26)',
    });

    let remaining = 100;
    for (const r of sortedPair) {
      const prev = remaining;
      remaining = remaining * (1 - r / 100);
      steps.push({
        type: 'bilateral-apply',
        label: `Apply ${r}%`,
        detail: `${prev.toFixed(2)} × ${(1 - r / 100).toFixed(2)} = ${remaining.toFixed(2)} remaining`,
        remaining: parseFloat(remaining.toFixed(4)),
        value: parseFloat((100 - remaining).toFixed(4)),
      });
    }

    const combinedBeforeFactor = 100 - remaining;
    const factorAddition = combinedBeforeFactor * 0.10;
    const combinedAfterFactor = combinedBeforeFactor + factorAddition;

    steps.push({
      type: 'bilateral-factor',
      label: `Bilateral factor (+10%)`,
      detail: `${combinedBeforeFactor.toFixed(2)} + ${factorAddition.toFixed(2)} (10%) = ${combinedAfterFactor.toFixed(2)} — this value enters the final calculation`,
      value: parseFloat(combinedAfterFactor.toFixed(4)),
    });

    bilateralPairs.push({
      pairKey: pair.pairKey,
      leftRating,
      rightRating,
      combinedBeforeFactor: parseFloat(combinedBeforeFactor.toFixed(4)),
      factorAddition: parseFloat(factorAddition.toFixed(4)),
      combinedAfterFactor: parseFloat(combinedAfterFactor.toFixed(4)),
    });

    effectiveRatings.push(combinedAfterFactor);
  }

  // ── Add non-bilateral ratings ────────────────────────────────────────────
  const nonBilateral = disabilities.filter((d) => !bilateralIds.has(d.id));
  for (const d of nonBilateral) {
    effectiveRatings.push(d.rating);
  }

  // ── Apply whole-person formula ───────────────────────────────────────────
  const sorted = [...effectiveRatings].sort((a, b) => b - a);

  const sortDesc = sorted
    .map((r) => `${r % 1 === 0 ? r : r.toFixed(1)}%`)
    .join(', ');

  if (disabilities.length > 1 || qualifyingPairs.length > 0) {
    steps.push({
      type: 'sort',
      label: 'Sorted (highest first)',
      detail: sortDesc,
    });
  }

  steps.push({
    type: 'init',
    label: 'Start with 100% healthy',
    detail: '100% remaining ability',
    remaining: 100,
  });

  let remaining = 100;
  for (const r of sorted) {
    const prev = remaining;
    remaining = remaining * (1 - r / 100);
    const combined = 100 - remaining;
    const rLabel = r % 1 === 0 ? `${r}%` : `${r.toFixed(1)}%`;
    steps.push({
      type: 'apply',
      label: `Apply ${rLabel}`,
      detail: `${prev.toFixed(2)} × ${(1 - r / 100).toFixed(3)} = ${remaining.toFixed(2)} remaining`,
      remaining: parseFloat(remaining.toFixed(4)),
      value: parseFloat(combined.toFixed(4)),
    });
  }

  const exact = parseFloat((100 - remaining).toFixed(4));
  const rounded = roundVARating(exact);

  steps.push({
    type: 'result',
    label: 'Exact combined value',
    detail: `100 − ${remaining.toFixed(2)} = ${exact.toFixed(1)}%`,
    value: exact,
  });

  steps.push({
    type: 'round',
    label: 'Round to nearest 10%',
    detail:
      rounded === 100 && exact < 100
        ? `${exact.toFixed(1)}% ≥ 95% → rounds to 100%`
        : `${exact.toFixed(1)}% → ${rounded}%`,
    value: rounded,
  });

  return {
    exact,
    rounded,
    steps,
    bilateralApplied: qualifyingPairs.length > 0,
    bilateralPairs,
  };
}

// ─── Compensation Lookup ───────────────────────────────────────────────────

export function getCompensation(
  roundedRating: number,
  dependentStatus: DependentStatus
): CompensationResult {
  const entry = vaRates[roundedRating];
  if (!entry) return { monthly: 0, annual: 0, dataYear: DATA_YEAR };

  const monthly =
    dependentStatus === 'with-spouse' ? entry.withSpouse : entry.veteranAlone;

  return {
    monthly,
    annual: parseFloat((monthly * 12).toFixed(2)),
    dataYear: DATA_YEAR,
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
