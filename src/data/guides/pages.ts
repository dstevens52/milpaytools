/**
 * The guide pages that actually exist as routes under src/app/guides/.
 *
 * This is the single source of truth for the guides index and the sitemap.
 * It replaced a filename scan of src/content/guides/*.mdx, which had drifted
 * from reality: every MDX slug was shadowed by a static route, so the MDX was
 * never rendered, and /guides/navigating-service — a route with no MDX
 * counterpart — was silently missing from the sitemap entirely.
 *
 * Adding a guide means adding a directory under src/app/guides/ AND an entry
 * here. Keep `title` in sync with the page's own TITLE const: this is what the
 * /guides index cards render, and a mismatch shows up as a card that does not
 * match the page it links to.
 */

export interface GuidePage {
  slug: string;
  /** Matches the page's TITLE const (no " | MilPayTools" suffix). */
  title: string;
  /** Card blurb on /guides. Intentionally distinct from the page meta description. */
  description: string;
  category: string;
  /** ISO date, used as sitemap lastModified. */
  date: string;
  readTime: number;
  /** Calculator slugs the guide links to — drives the card's "N calculators" note. */
  calculators: string[];
}

export const GUIDE_PAGES: GuidePage[] = [
  {
    slug: 'starting-service',
    title: 'New to the Military: First-Year Pay Guide',
    description:
      'Your first year in the military, explained: base pay, BAH, BAS, the TSP match, and how to read your LES before you spend your first paycheck.',
    category: 'Compensation & Pay',
    date: '2026-05-27',
    readTime: 10,
    calculators: ['total-compensation', 'bah', 'tsp'],
  },
  {
    slug: 'navigating-service',
    title: 'Mid-Career Military Money: PCS & Deployment',
    description:
      'Mid-career money decisions: comparing duty stations before orders drop, estimating PCS move costs, and what changes financially when you deploy.',
    category: 'Career Transition',
    date: '2026-05-27',
    readTime: 8,
    calculators: ['compare', 'pcs', 'deployment', 'total-compensation', 'retirement'],
  },
  {
    slug: 'military-pay',
    title: 'Military Pay Guide 2026: Base Pay, BAH & BAS',
    description:
      'Base pay tables, BAH by ZIP code, BAS, tax advantages, COLA, and how the pieces add up to total compensation — with the calculators for each.',
    category: 'Compensation & Pay',
    date: '2026-04-12',
    readTime: 18,
    calculators: ['total-compensation', 'bah', 'pay-charts', 'cola', 'deployment', 'guard-reserve'],
  },
  {
    slug: 'pcs',
    title: 'Military PCS Guide: Entitlements & Move Costs',
    description:
      'DLA, MALT mileage, per diem, TLE, and PPM net proceeds, plus how BAH and state income tax change when you move between duty stations.',
    category: 'Career Transition',
    date: '2026-04-12',
    readTime: 17,
    calculators: ['pcs', 'bah', 'compare', 'cola'],
  },
  {
    slug: 'retirement-tsp',
    title: 'Military Retirement & TSP Guide: BRS vs High-3',
    description:
      'How High-3 and BRS differ, what a pension is actually worth, Roth vs Traditional TSP, and how the government match compounds over a career.',
    category: 'TSP & Retirement',
    date: '2026-04-12',
    readTime: 20,
    calculators: ['retirement', 'tsp', 'total-compensation', 'va-disability'],
  },
  {
    slug: 'va-disability',
    title: 'VA Disability Guide: Ratings, VA Math & Rates',
    description:
      'How VA disability ratings are assigned, how "VA math" combines multiple ratings, what the bilateral factor does, and how ratings map to compensation.',
    category: 'Veterans Benefits',
    date: '2026-04-12',
    readTime: 16,
    calculators: ['va-disability', 'retirement'],
  },
  {
    slug: 'va-home-loans',
    title: 'VA Home Loan Guide: Eligibility & Funding Fee',
    description:
      'VA loan eligibility, the funding fee and its disability exemption, entitlement and reuse, and how BAH factors into what you can afford.',
    category: 'Veterans Benefits',
    date: '2026-05-27',
    readTime: 12,
    calculators: ['va-loan', 'va-disability', 'bah'],
  },
  {
    slug: 'education-benefits',
    title: 'Military Education Benefits: GI Bill, TA, VR&E',
    description:
      'Post-9/11 GI Bill, VR&E Chapter 31, Tuition Assistance, and Montgomery GI Bill compared — what each covers and the order to use them in.',
    category: 'Education Benefits',
    date: '2026-04-12',
    readTime: 16,
    calculators: ['education'],
  },
];

export const GUIDE_SLUGS: string[] = GUIDE_PAGES.map((g) => g.slug);
