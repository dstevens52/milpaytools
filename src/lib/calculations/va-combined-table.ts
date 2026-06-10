/**
 * 38 CFR § 4.25 Combined Ratings Table — exact table arithmetic.
 *
 * VA raters do NOT use continuous decimal ("remaining efficiency") math. They
 * step through the published § 4.25 table, where **every** pairwise combination
 * is an integer. This module reproduces that table by formula so the combined
 * rating matches VA's awarded value exactly, including edge cases where the
 * decimal method and the table method diverge.
 *
 * Pure functions — no React, no side effects.
 */

/**
 * Combine an existing combined value `a` (0–100) with a single rating `b`
 * (0, 10, 20 … 100) per the § 4.25 table.
 *
 * The table cell is the exact whole-person value `a + b · (100 − a) / 100`
 * rounded to the nearest whole number (round half up). Combining with 0 leaves
 * `a` unchanged.
 *
 * Computed with integer arithmetic to avoid floating-point drift on the
 * half-point cells:
 *   exact × 100 = 100·a + b·(100 − a)   — an integer for integer a, b
 *   round half up = ⌊(exact×100 + 50) / 100⌋
 */
export function combinePair(a: number, b: number): number {
  if (b === 0) return a;
  const scaledExact = 100 * a + b * (100 - a); // exact combined value × 100
  return Math.floor((scaledExact + 50) / 100); // round half up
}

/**
 * Combine a list of ratings through the § 4.25 table: sort highest-first and
 * fold with {@link combinePair}. Returns an integer combined value (0 when the
 * list is empty). 0% members fold in and contribute nothing.
 */
export function combineRatings(ratings: number[]): number {
  const sorted = [...ratings].sort((x, y) => y - x);
  if (sorted.length === 0) return 0;
  let combined = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    combined = combinePair(combined, sorted[i]);
  }
  return combined;
}
