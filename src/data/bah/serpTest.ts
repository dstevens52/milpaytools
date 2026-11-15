/**
 * Station search-result test (Build 03): title + meta description on CONUS
 * station pages (/bah/[slug]). Overseas pages are not part of it.
 *
 * - Start: the production deploy of Build 03 (date recorded in
 *   docs/seo/2026-11-station-serp-test.md).
 * - Read-out: Dec 9, 2026, after three weeks. Rules and arm baselines are in
 *   docs/seo/2026-11-station-serp-test.md.
 * - Arms: CONUS station URLs with a row in the GSC 3-month pages export
 *   (Aug 12 – Nov 12, 2026) sorted by impressions and assigned A-B-B-A down
 *   the list. Pages with no row are in B and excluded from the read-out.
 * - Variant A: today's title and description, byte-identical.
 *   Variant B: absolute title and a rate-range description
 *   (src/lib/stationSerp.ts).
 *
 * Turning the test off is this one line: 'all-b' puts every CONUS station page
 * on variant B (the plan for BAH release day unless the read-out says
 * otherwise), 'all-a' puts every page back on today's output.
 */
export type SerpTestMode = 'split' | 'all-a' | 'all-b';

export const SERP_TEST_MODE: SerpTestMode = 'split';

/** Arm B, in the read-out: 68 pages, in impression order. */
export const SERP_TEST_B_SLUGS: readonly string[] = [
  'fort-bragg',
  'fort-hood',
  'fort-benning',
  'naval-air-station-whidbey-island',
  'mcb-hawaii',
  'davis-monthan-afb',
  'eglin-afb',
  'naval-station-san-diego',
  'marine-corps-air-ground-combat-center',
  'fort-meade',
  'hurlburt-field',
  'joint-base-langley-eustis',
  'us-naval-academy',
  'naval-station-everett',
  'joint-base-san-antonio',
  'luke-afb',
  'fort-carson',
  'fort-sill',
  'little-rock-afb',
  'scott-afb',
  'joint-base-myer-henderson-hall',
  'fairchild-afb',
  'barksdale-afb',
  'fort-bliss',
  'los-angeles-afb',
  'base-kodiak',
  'nas-lemoore',
  'nellis-afb',
  'beale-afb',
  'holloman-afb',
  'edwards-afb',
  'fort-drum',
  'joint-base-little-creek-fort-story',
  'fort-campbell',
  'shaw-afb',
  'mcas-new-river',
  'mountain-home-afb',
  'usaf-academy',
  'nas-fallon',
  'nas-key-west',
  'fort-leavenworth',
  'naval-station-mayport',
  'buckley-sfb',
  'nas-north-island',
  'naval-medical-center-portsmouth',
  'fort-huachuca',
  'sheppard-afb',
  'aberdeen-proving-ground',
  'fort-riley',
  'joint-base-anacostia-bolling',
  'maxwell-afb',
  'tracen-cape-may',
  'carlisle-barracks',
  'columbus-afb',
  'kirtland-afb',
  'grand-forks-afb',
  'ellsworth-afb',
  'fort-mcnair',
  'mcrd-san-diego',
  'naval-postgraduate-school',
  'joint-base-cape-cod',
  'laughlin-afb',
  'fort-mccoy',
  'fort-shafter',
  'redstone-arsenal',
  'naval-submarine-base-kings-bay',
  'nas-corpus-christi',
  'mcconnell-afb',
];

/** Arm B, excluded from the read-out (no row in the GSC export). */
export const SERP_TEST_B_EXCLUDED_SLUGS: readonly string[] = [
  'camp-pendleton',
  'fort-irwin',
  'marine-corps-base-quantico',
  'minot-afb',
  'schriever-sfb',
];

const B = new Set([...SERP_TEST_B_SLUGS, ...SERP_TEST_B_EXCLUDED_SLUGS]);

/** Which variant a CONUS station page renders. Pages not listed (and any added later) are A. */
export function stationSerpArm(slug: string, mode: SerpTestMode = SERP_TEST_MODE): 'A' | 'B' {
  if (mode === 'all-a') return 'A';
  if (mode === 'all-b') return 'B';
  return B.has(slug) ? 'B' : 'A';
}
