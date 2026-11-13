/**
 * THE BAH year switch. Every BAH page, title, FAQ, calculator label and count
 * follows these three values. Release-day steps: docs/RELEASE_DAY_BAH_2027.md.
 *
 * Client-safe: no data imports. Components may import this file directly.
 *
 * - BAH_YEAR: the year whose rates are the headline everywhere. Its folder
 *   (src/data/bah/{BAH_YEAR}/) must be registered with full data in
 *   src/data/bah/registry.ts.
 * - BAH_PRIOR_YEAR: the comparison year for year-over-year figures (rates only).
 * - BAH_EFFECTIVE_NOTICE: true only between DoD's release and January 1, while
 *   BAH_YEAR's rates are published but the prior year's are still being paid.
 *   A static flag, flipped by hand in January — never derived from the clock
 *   (pages are prerendered).
 */

export const BAH_YEAR = '2026';
export const BAH_PRIOR_YEAR = '2025';
export const BAH_EFFECTIVE_NOTICE: boolean = false;

/** "January 1, 2026" — the date BAH_YEAR's rates take effect. */
export const BAH_EFFECTIVE_DATE_LABEL = `January 1, ${BAH_YEAR}`;
