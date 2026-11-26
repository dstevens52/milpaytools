/**
 * When each page's content last changed: the sitemap's <lastmod>, never the build
 * time (S8, 2026-11-18).
 *
 * Rule: when a build changes what a page says or calculates, set its date here to
 * the merge date. Analytics, OG images, link refactors and changes with no visible
 * effect don't count.
 *
 * Seeded 2026-11-18 from git history (the last commit that changed what the page
 * shows or calculates). Deployment reuses the "Last reviewed" date the page
 * already showed.
 *
 * Dates for other page groups (src/app/sitemap.ts):
 * - BAH station pages: DoD's release date for the current BAH year
 *   (BAH_RELEASE_HISTORY), or that MHA's mid-year change if later; OCONUS v2
 *   stations: their own `lastReviewed`.
 * - /pay/[rank]: PAY_PAGES_LAST_UPDATED (src/data/pay-pages/ranks.ts).
 * - Blog posts: frontmatter `updated`, else `date`. Guides: GUIDE_PAGES `date`.
 * - Hubs (/, /calculators, /bah, /pay, /blog, /guides): the newest date among
 *   their children.
 *
 * ISO dates (YYYY-MM-DD). Client-safe: no imports.
 */

/** Keyed by the /calculators/<slug> path segment. */
export const CALCULATOR_LAST_REVIEWED = {
  'total-compensation': '2026-11-18', // C1: "excluded from federal taxable income"
  'va-disability': '2026-11-21',
  tsp: '2026-11-18', // S8: title, H1, meta
  retirement: '2026-11-18', // C1: BRS "on or after January 1, 2018"
  pcs: '2026-11-18',
  'guard-reserve': '2026-11-19', // GR-26: BRS contributions stop after 26 years
  education: '2026-11-13',
  cola: '2026-11-12',
  'dual-military-bah': '2026-11-18',
  compare: '2026-11-12',
  'transition-readiness': '2026-11-23', // S7b: example action steps + readiness factors from the merged "financially ready" post
  'separation-timeline': '2026-11-21', // 10b: final-move line (separation pay → 3-year window)
  'healthcare-comparison': '2026-11-20', // 10a: TAMP list, no ACA subsidy model, retiree TRICARE path
  'va-loan': '2026-11-21',
  deployment: '2026-11-14', // = the "Last reviewed" date shown on the page
  'va-refinance': '2026-11-21', // 10b: VRF-01–06, fee status, computed example, visible FAQs
  'va-entitlement': '2026-11-25', // V2: new calculator (FHFA county loan limits)
} as const satisfies Record<string, string>;

export type CalculatorSlug = keyof typeof CALCULATOR_LAST_REVIEWED;

/** Non-hub pages outside the calculator, station, rank, blog and guide groups. Keyed by path. */
export const PAGE_LAST_REVIEWED = {
  '/transition': '2026-11-20', // C2: TRICARE post card description (KFF employer average)
  '/about': '2026-05-30',
  '/privacy': '2026-05-31',
  '/terms': '2026-05-30',
  '/partners': '2026-11-18',
  '/pay/raise': '2026-11-18', // S8: retiree COLA section
  '/pay/dates': '2026-11-13',
  '/va-disability-rates': '2026-11-18',
  '/bah/changes': '2026-11-18',
} as const satisfies Record<string, string>;

/** "November 14, 2026" for an ISO date (UTC, so the day never shifts). */
export function formatReviewedDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
