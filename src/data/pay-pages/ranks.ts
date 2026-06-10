/**
 * Curated rank entries for the /pay/[rank] static pages.
 *
 * Mirrors the DUTY_STATIONS / STATION_BY_SLUG pattern from
 * src/data/duty-stations/stations.ts: the array drives generateStaticParams,
 * the /pay index grid, and the sitemap, so they can never drift apart.
 *
 * Phase 1 populates ONLY the E-5 entry. Rollout adds E-1–E-9 and O-1–O-6
 * (O-6 values verified against DFAS June 2026 — no rollout gate remains).
 *
 * All dollar figures on the rendered pages are computed from the pay-table
 * and BAH libs at build time — no dollar amounts belong in this file.
 */

import type { PayGrade } from '@/types/military';

export interface PayPageRank {
  /** URL slug — lowercase, no hyphen: 'e5', 'o3'. */
  slug: string;
  /** Pay-table grade key: 'E-5', 'O-3'. */
  grade: PayGrade;
  /** Display title for headings and breadcrumbs: 'E-5'. */
  title: string;
  /** Rank title by branch, used in intro copy and the index grid. */
  branchTitles: {
    army: string;
    marines: string;
    airForce: string;
    navy: string;
    spaceForce: string;
  };
  /** Years of service used for the worked total-comp example. */
  exampleYos: number;
  /** Dependency status used for the worked total-comp example. */
  exampleDependents: boolean;
  /**
   * 2–3 short paragraphs of rank context: what the grade means across
   * branches, typical promotion window, what changes financially.
   * Educational voice — no advice, no first-person military service,
   * "excluded from federal taxable income" (never "tax-free").
   */
  contextCopy: string[];
  /**
   * Optional rank-specific FAQ entries (e.g. promotion timeline). Rendered
   * between the computed total-comp question and the taxability question.
   * Answers here are copy only — any dollar amount must instead be computed
   * in the page from the libs.
   */
  faqExtras?: { question: string; answer: string }[];
  /**
   * Optional visible footnote under the pay table. Needed for grades whose
   * DFAS table carries a footnote rate (E-1 under 4 months — that rate lives
   * only as a comment in src/data/pay-tables/2026.ts and must be promoted to
   * an exported constant before the E-1 entry is added; do not hand-key it).
   */
  tableFootnote?: string;
  /** BAH station pages to cross-link ("see what an E-5 receives at …"). */
  exampleStations: { slug: string; name: string }[];
  /** Optional rank-specific deep-dive blog post to cross-link. */
  deepDivePost?: { slug: string; title: string };
}

/** Visible "Last updated" date shared by all /pay pages. */
export const PAY_PAGES_LAST_UPDATED = 'June 10, 2026';
/** ISO date for Article schema datePublished on /pay pages. */
export const PAY_PAGES_PUBLISHED_ISO = '2026-06-10';

export const PAY_PAGE_RANKS: PayPageRank[] = [
  {
    slug: 'e5',
    grade: 'E-5',
    title: 'E-5',
    branchTitles: {
      army: 'Sergeant',
      marines: 'Sergeant',
      airForce: 'Staff Sergeant',
      navy: 'Petty Officer Second Class',
      spaceForce: 'Sergeant',
    },
    exampleYos: 6,
    exampleDependents: true,
    contextCopy: [
      'E-5 is the fifth enlisted pay grade and, in most branches, the first noncommissioned officer rank — Sergeant in the Army, Marine Corps, and Space Force, Staff Sergeant in the Air Force, and Petty Officer Second Class in the Navy. The move from E-4 to E-5 usually marks the shift from junior enlisted to NCO: leading a small team, signing for equipment, and being directly responsible for other service members’ training and development.',
      'Most service members who stay in reach E-5 somewhere between 3 and 6 years of service, though the timeline varies widely by branch and career field. Undermanned specialties promote faster; competitive ones can take longer. Each branch uses its own mix of time-in-service and time-in-grade minimums, promotion points, boards, or cutting scores.',
      'Financially, E-5 is often the grade where the full compensation picture starts to matter. Many members move out of the barracks around this point, which converts BAH from an on-paper rate into actual monthly cash — and BAH rises with both pay grade and duty station. Base pay also keeps climbing within the grade: E-5 has longevity increases through 12 years of service, so two E-5s with the same stripes can earn meaningfully different amounts. Because BAH and BAS are excluded from federal taxable income, the gap between an E-5’s base pay and the real value of the package is larger than the pay chart alone suggests.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make E-5?',
        answer:
          'It varies by branch and career field. Most service members who stay in reach E-5 between 3 and 6 years of service — faster in undermanned specialties, slower in competitive ones. Each branch uses its own combination of time-in-service and time-in-grade minimums plus promotion points, boards, or cutting scores, so two service members who joined the same day can pin on E-5 years apart.',
      },
    ],
    exampleStations: [
      { slug: 'fort-bragg', name: 'Fort Bragg' },
      { slug: 'fort-hood', name: 'Fort Hood' },
      { slug: 'naval-station-san-diego', name: 'Naval Station San Diego' },
    ],
    deepDivePost: {
      slug: 'how-much-does-an-e5-really-make-2026',
      title: 'How Much Does an E-5 Really Make in 2026?',
    },
  },
];

export const RANK_BY_SLUG: Record<string, PayPageRank> = Object.fromEntries(
  PAY_PAGE_RANKS.map((r) => [r.slug, r])
);
