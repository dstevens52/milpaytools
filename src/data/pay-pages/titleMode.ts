/**
 * Which years the 15 /pay/[rank] <title>s name. Built for the Dec 10 flip
 * (docs/RELEASE_DAY_2027_PAY.md); OFF until then.
 *
 *   '2026'      — "E-5 Pay 2026: $3,343–$4,422/Month, All Branches" (live; byte-identical to before)
 *   '2026-2027' — "E-5 Pay 2026 & 2027: $3,343–$4,422/Month, All Branches" (still the 2026 range;
 *                 description and OG unchanged)
 *   '2027'      — throws until PAY_RAISE_2027.status === 'official-table' (January work)
 *
 * Titles come from rankTitle() in src/lib/pay-pages/rankTitle.ts.
 */
export type RankTitleYears = '2026' | '2026-2027' | '2027';

export const RANK_TITLE_YEARS: RankTitleYears = '2026';
