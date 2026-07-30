/**
 * Curated rank entries for the /pay/[rank] static pages.
 *
 * Mirrors the DUTY_STATIONS / STATION_BY_SLUG pattern from
 * src/data/duty-stations/stations.ts: the array drives generateStaticParams,
 * the /pay index grid, and the sitemap, so they can never drift apart.
 * Array order is page order on the /pay index: E-1 → E-9, then O-1 → O-6.
 *
 * All dollar figures on the rendered pages are computed from the pay-table
 * and BAH libs at build time — no dollar amounts belong in this file. The one
 * exception is E-1's tableFootnote, which is composed here from the exported
 * E1_UNDER_4_MONTHS constant in the pay-table data file (still not hand-keyed
 * in this file).
 */

import type { PayGrade } from '@/types/military';
import { E1_UNDER_4_MONTHS } from '@/data/pay-tables/2026';
import { formatCurrency } from '@/lib/utils';

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
   *
   * Supports [text](/path) markdown-style links — the only markup allowed —
   * rendered by renderCopyLinks in the page template. Link grade mentions
   * only to /pay pages that exist (never -E grades), at most one link per
   * target page across the whole contextCopy body.
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
   * Optional visible footnote under the pay table. Any dollar amount must be
   * composed from an exported data constant (see E-1), never typed here.
   */
  tableFootnote?: string;
  /**
   * Optional copy sentence rendered under the worked-example table — used for
   * the junior-enlisted (E-1–E-4) government-quarters framing. Copy only.
   */
  exampleNote?: string;
  /**
   * When set (O-1/O-2/O-3 pages), the page renders a short prior-enlisted
   * section comparing this -E grade against the standard grade, with figures
   * computed from payTable at build time.
   */
  priorEnlistedGrade?: 'O-1E' | 'O-2E' | 'O-3E';
  /** BAH station pages to cross-link ("see what an E-5 receives at …"). */
  exampleStations: { slug: string; name: string }[];
  /** Optional rank-specific deep-dive blog post to cross-link. */
  deepDivePost?: { slug: string; title: string };
}

/** Visible "Last updated" date shared by all /pay pages. */
export const PAY_PAGES_LAST_UPDATED = 'July 30, 2026';
/** ISO date for Article schema datePublished on /pay pages. */
export const PAY_PAGES_PUBLISHED_ISO = '2026-06-10';

export const PAY_PAGE_RANKS: PayPageRank[] = [
  // ─── Enlisted ───────────────────────────────────────────────────────────
  {
    slug: 'e1',
    grade: 'E-1',
    title: 'E-1',
    branchTitles: {
      army: 'Private (PV1)',
      marines: 'Private',
      airForce: 'Airman Basic',
      navy: 'Seaman Recruit',
      spaceForce: 'Specialist 1',
    },
    exampleYos: 0,
    exampleDependents: false,
    contextCopy: [
      'E-1 is the entry pay grade. Nearly everyone starts here, in basic training or just out of it, and nearly nobody stays long: advancement to [E-2](/pay/e2) typically comes within the first six months to a year, depending on branch and enlistment contract.',
      'E-1 pay is flat — there is no longevity progression, because the grade is designed to be temporary. The one wrinkle is the first four months: DFAS publishes a separate, lower E-1 rate for members with less than four months of service (noted under the table above), so the very first paychecks are calculated on a smaller base than the standard E-1 rate.',
      'The first paycheck itself is where most new service members get surprised. Military pay arrives twice a month, so a mid-month start date means the first deposit covers only part of a pay period — and it lands after deductions for taxes, SGLI life insurance, and the TSP contribution most new members are automatically enrolled in. A first check that looks smaller than the pay chart suggested is usually correct, just prorated. Reading the LES line by line is the fastest way to confirm.',
    ],
    faqExtras: [
      {
        question: 'How long does someone stay an E-1?',
        answer:
          'Usually six months to a year. Advancement to E-2 is largely automatic with satisfactory service, and some enlistment contracts (referrals, college credits, JROTC) grant E-2 or E-3 on day one. Timelines vary by branch and contract.',
      },
    ],
    tableFootnote: `An E-1 with less than 4 months of active-duty service receives ${formatCurrency(E1_UNDER_4_MONTHS, true)}/month — a separate DFAS footnote rate that applies only to those first four months.`,
    exampleNote:
      'Most E-1s live in government quarters and eat at the dining facility, receiving housing and meals in kind rather than as cash — the BAH line above applies to members authorized to live off-installation, including those with dependents. The allowance becomes monthly cash when that authorization comes later in a career.',
    exampleStations: [
      { slug: 'fort-jackson', name: 'Fort Jackson' },
      { slug: 'naval-station-great-lakes', name: 'Naval Station Great Lakes' },
      { slug: 'joint-base-san-antonio', name: 'Joint Base San Antonio' },
    ],
    deepDivePost: {
      slug: 'your-first-military-paycheck-what-to-know',
      title: 'Your First Military Paycheck: What to Know Before You Spend It',
    },
  },
  {
    slug: 'e2',
    grade: 'E-2',
    title: 'E-2',
    branchTitles: {
      army: 'Private (PV2)',
      marines: 'Private First Class',
      airForce: 'Airman',
      navy: 'Seaman Apprentice',
      spaceForce: 'Specialist 2',
    },
    exampleYos: 0,
    exampleDependents: false,
    contextCopy: [
      'E-2 is the second enlisted pay grade. Like [E-1](/pay/e1), it is a passing-through grade: advancement from E-2 to [E-3](/pay/e3) is also largely automatic with satisfactory service, typically within another six months to a year.',
      'E-2 pay is a single flat rate with no longevity steps — the table above is one row because that is genuinely the whole table. Raises at this stage come from advancing in grade, not from time in service.',
      'The under-2-years window is also when the TSP habit forms. Members who joined under the Blended Retirement System are automatically enrolled at 5% of basic pay into an age-appropriate Lifecycle fund, with the automatic government contribution on top. Because contributions scale with pay automatically as a career progresses, the settings chosen (or left alone) in these first months tend to follow a member for years — which is why the early habit matters more than the early dollar amounts.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to advance from E-2 to E-3?',
        answer:
          'Typically six months to a year of satisfactory service, varying by branch. Combined with the E-1 to E-2 step, most members reach E-3 within their first one to two years.',
      },
    ],
    exampleNote:
      'Most E-2s live in government quarters and use the dining facility — housing and meals arrive in kind, not as cash. The BAH line above applies to members authorized to live off-installation.',
    exampleStations: [
      { slug: 'fort-benning', name: 'Fort Benning' },
      { slug: 'fort-sill', name: 'Fort Sill' },
      { slug: 'luke-afb', name: 'Luke AFB' },
    ],
    deepDivePost: {
      slug: 'roth-tsp-advantage-junior-enlisted',
      title: 'The Roth TSP Advantage Nobody Explains to Junior Enlisted',
    },
  },
  {
    slug: 'e3',
    grade: 'E-3',
    title: 'E-3',
    branchTitles: {
      army: 'Private First Class',
      marines: 'Lance Corporal',
      airForce: 'Airman First Class',
      navy: 'Seaman',
      spaceForce: 'Specialist 3',
    },
    exampleYos: 2,
    exampleDependents: false,
    contextCopy: [
      'E-3 is where many junior enlisted members spend the longest stretch of their first enlistment. Most members reach it within their first one to two years.',
      'E-3 is also the first grade with longevity steps: the rate rises at over 2 and again at over 3 years of service. From [E-4](/pay/e4) up, the pay table deepens further — but at E-3, advancing to the next grade still moves pay more than time does.',
      'Two financial mechanics tend to land during the E-3 window. First, under the Blended Retirement System two things happen at the two-year mark: government matching contributions begin, and the automatic 1% contribution the government has been making since the first months of service becomes fully the member’s money. Second, fund allocation starts to matter as the balance grows; the default Lifecycle fund, the G fund, and the stock-index funds behave very differently over a 20-year horizon, and the difference compounds from whatever is set in these early years.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make E-3?',
        answer:
          'Most members reach E-3 within one to two years of service — advancement from E-2 is largely automatic with satisfactory service, and some enlistment contracts grant E-3 at entry. Timelines vary by branch and contract.',
      },
    ],
    exampleNote:
      'Many E-3s still live in the barracks — for them, the BAH line above is in-kind value rather than cash. The allowance converts to monthly cash when a member is authorized to live off-installation.',
    exampleStations: [
      { slug: 'fort-campbell', name: 'Fort Campbell' },
      { slug: 'camp-lejeune', name: 'Marine Corps Base Camp Lejeune' },
      { slug: 'naval-station-norfolk', name: 'Naval Station Norfolk' },
    ],
    deepDivePost: {
      slug: 'tsp-fund-options-explained',
      title: 'TSP Fund Options Explained',
    },
  },
  {
    slug: 'e4',
    grade: 'E-4',
    title: 'E-4',
    branchTitles: {
      army: 'Specialist or Corporal',
      marines: 'Corporal',
      airForce: 'Senior Airman',
      navy: 'Petty Officer Third Class',
      spaceForce: 'Specialist 4',
    },
    exampleYos: 3,
    exampleDependents: false,
    contextCopy: [
      'E-4 is the cusp grade. In the Marine Corps and for Army Corporals it already carries NCO authority; everywhere else it is the last stop before the NCO track that begins at [E-5](/pay/e5), with promotion boards, points, or cutting scores ahead.',
      'Most members pin on E-4 somewhere between two and four years of service, varying by branch and career field. The E-4 pay table runs five longevity steps, topping out at over 6 years — members who stay at E-4 past that point see no further increases until promotion.',
      'Financially, E-4 is often the first grade where BAH turns from an on-paper figure into actual cash: single members increasingly become eligible to move out of government quarters, and at that point the housing allowance — excluded from federal taxable income — starts arriving in the bank account every month. How far that allowance stretches depends entirely on duty station, which is why the same grade can feel very different at different installations.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make E-4?',
        answer:
          'Typically two to four years of service, varying by branch and career field. In the Army, advancement to Specialist is semi-automatic on time in service and time in grade; in other branches E-4 is the last largely time-based advancement before competitive NCO promotion begins.',
      },
    ],
    exampleNote:
      'E-4 is often the first grade where living off-installation is authorized for single members — the point where BAH stops being an on-paper figure and starts arriving as monthly cash. Members still in government quarters receive housing and meals in kind instead.',
    exampleStations: [
      { slug: 'fort-carson', name: 'Fort Carson' },
      { slug: 'fort-bliss', name: 'Fort Bliss' },
      { slug: 'naval-station-san-diego', name: 'Naval Station San Diego' },
    ],
    deepDivePost: {
      slug: 'what-is-bah-military-housing-allowance',
      title: 'What Is BAH? Military Housing Allowance Explained',
    },
  },
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
      'E-5 is the fifth enlisted pay grade and, in most branches, the first noncommissioned officer rank. The move from [E-4](/pay/e4) to E-5 usually marks the shift from junior enlisted to NCO: leading a small team, signing for equipment, and being directly responsible for other service members’ training and development.',
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
  {
    slug: 'e6',
    grade: 'E-6',
    title: 'E-6',
    branchTitles: {
      army: 'Staff Sergeant',
      marines: 'Staff Sergeant',
      airForce: 'Technical Sergeant',
      navy: 'Petty Officer First Class',
      spaceForce: 'Technical Sergeant',
    },
    exampleYos: 10,
    exampleDependents: true,
    contextCopy: [
      'E-6 is the mid-career NCO grade. E-6s typically run a squad, section, or shop: the layer of leadership most responsible for day-to-day execution.',
      'Most members who reach E-6 do so somewhere between 7 and 12 years of service, varying widely by branch and career field. The E-6 pay table runs eleven longevity steps and tops out at over 18 years — one of the deeper tables in the enlisted chart.',
      'E-6 is the compounding decade. Longevity raises keep arriving every two years while a decade or more of TSP contribution years still remain — the combination where automatic-contribution settings chosen years earlier quietly do their largest work. It is also where assignment choices start carrying real dollar weight: the same E-6 package varies by hundreds of dollars per month between duty stations purely through BAH.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make E-6?',
        answer:
          'Commonly between 7 and 12 years of service, though it varies widely by branch and career field — cutting scores, promotion boards, and manning levels all move the timeline. Time-in-grade and time-in-service minimums set the floor, not the typical case.',
      },
    ],
    exampleStations: [
      { slug: 'fort-bragg', name: 'Fort Bragg' },
      { slug: 'joint-base-lewis-mcchord', name: 'Joint Base Lewis-McChord' },
      { slug: 'tinker-afb', name: 'Tinker AFB' },
    ],
    deepDivePost: {
      slug: 'tsp-for-beginners-what-happens-if-you-do-nothing',
      title: 'TSP for Beginners: What Happens If You Never Change Your Settings',
    },
  },
  {
    slug: 'e7',
    grade: 'E-7',
    title: 'E-7',
    branchTitles: {
      army: 'Sergeant First Class',
      marines: 'Gunnery Sergeant',
      airForce: 'Master Sergeant',
      navy: 'Chief Petty Officer',
      spaceForce: 'Master Sergeant',
    },
    exampleYos: 14,
    exampleDependents: true,
    contextCopy: [
      'E-7 is the senior NCO threshold. In the Navy, where it is Chief Petty Officer, the grade carries its own induction tradition and a distinct uniform. E-7s typically serve as platoon sergeants, flight chiefs, or leading chiefs: the experience layer commanders lean on.',
      'Reaching E-7 most often happens somewhere in the 10-to-15-year window, varying by branch and career field. The pay table is one of the longest in the enlisted chart — fifteen longevity steps running all the way to over 26 years.',
      'E-7 is where the 20-year math stops being abstract. A pension under either retirement system is calculated from the highest 36 months of basic pay, and for most enlisted careers those months happen at E-7 or above — so each E-7 longevity step raises not just current pay but the base the pension formula will use. The stay-or-go decision that dominates years 12 through 20 turns almost entirely on numbers that are now visible on this page.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make E-7?',
        answer:
          'Most members who reach E-7 do so in the 10-to-15-year window, though branch, career field, and manning levels move the timeline substantially in both directions. Selection is by centralized board or cutting score in every branch — time alone does not produce E-7.',
      },
    ],
    exampleStations: [
      { slug: 'fort-hood', name: 'Fort Hood' },
      { slug: 'fort-stewart', name: 'Fort Stewart' },
      { slug: 'macdill-afb', name: 'MacDill AFB' },
    ],
    deepDivePost: {
      slug: 'should-i-stay-to-20-years-military',
      title: 'Should I Stay to 20 Years? The Financial Math Behind the Biggest Military Career Decision',
    },
  },
  {
    slug: 'e8',
    grade: 'E-8',
    title: 'E-8',
    branchTitles: {
      army: 'Master Sergeant or First Sergeant',
      marines: 'Master Sergeant or First Sergeant',
      airForce: 'Senior Master Sergeant',
      navy: 'Senior Chief Petty Officer',
      spaceForce: 'Senior Master Sergeant',
    },
    exampleYos: 16,
    exampleDependents: true,
    contextCopy: [
      'E-8 splits into two roles in the Army and Marine Corps — Master Sergeant (technical track) or First Sergeant (the unit’s senior enlisted advisor). Selection rates are small; E-8s are a thin layer of the force.',
      'The E-8 pay table starts at over 8 years of service — DFAS publishes no E-8 rate below that point, which is why the early columns above show dashes rather than dollar figures. In practice almost no one pins on E-8 anywhere near the floor; mid-to-late teens is the common window.',
      'At E-8 the longevity table keeps producing raises late into a career — steps continue through over 30 years. That matters mechanically: a pension is computed from the highest 36 months of basic pay, so raises earned in the final years at E-8 flow directly into the High-3 average the formula uses. The same longevity steps that look small as monthly deltas compound into the retirement calculation.',
    ],
    faqExtras: [
      {
        question: 'What years of service does E-8 pay start at?',
        answer:
          'The DFAS pay table publishes E-8 rates beginning at the "over 8 years" column — there is no E-8 rate below that point, because promotion to E-8 effectively never occurs that early. Most members who reach E-8 do so in their mid-to-late teens of service.',
      },
    ],
    exampleStations: [
      { slug: 'fort-bragg', name: 'Fort Bragg' },
      { slug: 'joint-base-san-antonio', name: 'Joint Base San Antonio' },
      { slug: 'naval-station-norfolk', name: 'Naval Station Norfolk' },
    ],
    deepDivePost: {
      slug: 'how-military-retirement-works',
      title: 'How Military Retirement Works: The Basics',
    },
  },
  {
    slug: 'e9',
    grade: 'E-9',
    title: 'E-9',
    branchTitles: {
      army: 'Sergeant Major or Command Sergeant Major',
      marines: 'Master Gunnery Sergeant or Sergeant Major',
      airForce: 'Chief Master Sergeant',
      navy: 'Master Chief Petty Officer',
      spaceForce: 'Chief Master Sergeant',
    },
    exampleYos: 20,
    exampleDependents: true,
    contextCopy: [
      'E-9 is the top of the enlisted pay scale. By statute only a small fraction of each branch may hold the grade at any time.',
      'The E-9 pay table starts at over 10 years of service — DFAS publishes no E-9 rate below that, which is why the early columns above show dashes. In practice E-9 arrives near or past the 20-year mark for nearly everyone who reaches it.',
      'E-9 has the longest enlisted longevity run in the chart, with steps continuing through over 38 years of service. Because a pension is computed from the highest 36 months of basic pay, members who serve at E-9 in their final years lock the grade’s top steps into the High-3 average — the mechanical reason senior-enlisted careers that run past 20 years produce noticeably larger pensions than the same career stopped at 20.',
    ],
    faqExtras: [
      {
        question: 'What years of service does E-9 pay start at?',
        answer:
          'The DFAS pay table publishes E-9 rates beginning at the "over 10 years" column — no E-9 rate exists below that point. Nearly everyone who reaches E-9 does so around or after 20 years of service.',
      },
    ],
    exampleStations: [
      { slug: 'fort-hood', name: 'Fort Hood' },
      { slug: 'joint-base-pearl-harbor-hickam', name: 'Joint Base Pearl Harbor-Hickam' },
      { slug: 'joint-base-andrews', name: 'Joint Base Andrews' },
    ],
  },

  // ─── Officers ───────────────────────────────────────────────────────────
  {
    slug: 'o1',
    grade: 'O-1',
    title: 'O-1',
    branchTitles: {
      army: 'Second Lieutenant',
      marines: 'Second Lieutenant',
      airForce: 'Second Lieutenant',
      navy: 'Ensign',
      spaceForce: 'Second Lieutenant',
    },
    exampleYos: 2,
    exampleDependents: false,
    contextCopy: [
      'O-1 is the entry commissioned-officer grade. New O-1s arrive from a service academy, ROTC, or Officer Candidate/Training School, usually straight into branch-specific technical training before their first unit.',
      'Time at O-1 is short: promotion to [O-2](/pay/o2) typically comes around 18 to 24 months and is near-automatic with satisfactory performance. The pay table reflects that — three steps, with a sharp jump at the over-3 column that most officers reach only after pinning on O-2.',
      'Financially, the officer start differs from the enlisted one in two ways worth knowing. Officers receive the lower BAS rate and generally pay for their own meals rather than using a meal card, and most are authorized to live off-installation from the start — so BAH typically arrives as cash from the first duty station, excluded from federal taxable income. The same TSP auto-enrollment mechanics that apply to enlisted members apply at commissioning.',
    ],
    faqExtras: [
      {
        question: 'How long does an officer stay at O-1?',
        answer:
          'Usually about 18 to 24 months. Promotion to O-2 is near-automatic with satisfactory performance, on a timeline set by each branch. Officers with prior enlisted service follow the same timeline but are paid on the O-1E scale (see above).',
      },
    ],
    priorEnlistedGrade: 'O-1E',
    exampleStations: [
      { slug: 'fort-benning', name: 'Fort Benning' },
      { slug: 'fort-sill', name: 'Fort Sill' },
      { slug: 'naval-air-station-pensacola', name: 'Naval Air Station Pensacola' },
    ],
    deepDivePost: {
      slug: 'military-tax-advantages',
      title: 'Military Tax Advantages Most Service Members Miss',
    },
  },
  {
    slug: 'o2',
    grade: 'O-2',
    title: 'O-2',
    branchTitles: {
      army: 'First Lieutenant',
      marines: 'First Lieutenant',
      airForce: 'First Lieutenant',
      navy: 'Lieutenant (Junior Grade)',
      spaceForce: 'First Lieutenant',
    },
    exampleYos: 3,
    exampleDependents: true,
    contextCopy: [
      'O-2 is the second company-grade officer rank. O-2s typically serve as experienced platoon leaders, division officers, or flight commanders-in-training while their year group moves toward O-3.',
      'Promotion to [O-3](/pay/o3) generally arrives around four years of total service, near-automatic with satisfactory performance. The O-2 pay table is short but steep — the over-2 and over-3 steps are among the largest percentage jumps anywhere in the officer chart, so pay moves quickly even before the next promotion.',
      'The O-2 years are usually when officer finances settle into a pattern: BAH as cash at a first or second duty station, the lower officer BAS rate, and — for those weighing a service academy or ROTC payback against a longer career — the first realistic look at how officer longevity raises stack against civilian offers. The total-compensation framing matters here, because the taxable base-pay number understates the package by the full value of the untaxed allowances.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make O-2?',
        answer:
          'Typically about 18 to 24 months after commissioning, with promotion to O-3 following around the four-year mark — both near-automatic with satisfactory performance, on timelines set by each branch.',
      },
    ],
    priorEnlistedGrade: 'O-2E',
    exampleStations: [
      { slug: 'fort-campbell', name: 'Fort Campbell' },
      { slug: 'fort-drum', name: 'Fort Drum' },
      { slug: 'camp-pendleton', name: 'Marine Corps Base Camp Pendleton' },
    ],
  },
  {
    slug: 'o3',
    grade: 'O-3',
    title: 'O-3',
    branchTitles: {
      army: 'Captain',
      marines: 'Captain',
      airForce: 'Captain',
      navy: 'Lieutenant',
      spaceForce: 'Captain',
    },
    exampleYos: 6,
    exampleDependents: true,
    contextCopy: [
      'O-3 is the workhorse company-grade rank. Company command, flight command, and department-head tours mostly happen here, and officers typically hold the grade longer than [O-1](/pay/o1) and [O-2](/pay/o2) combined.',
      'Promotion to O-3 usually arrives around four years of service; the grade then runs for roughly six more. The pay table matches that span — nine longevity steps reaching to over 14 years, so an O-3’s pay keeps climbing well after the promotion itself.',
      'O-3 is also where the biggest officer career-math moment lands: initial service commitments expire during these years, and the stay-or-go comparison against civilian offers gets made for the first time with real numbers. That comparison only works on total compensation — base pay plus BAH and BAS, plus the value of their exclusion from federal taxable income — not on the base-pay figure alone, which understates the package against a civilian salary.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make O-3?',
        answer:
          'Typically around four years of commissioned service, near-automatic with satisfactory performance. Officers then commonly hold O-3 for six or more years — promotion to O-4 is competitive and happens around the 10-to-12-year mark.',
      },
    ],
    priorEnlistedGrade: 'O-3E',
    exampleStations: [
      { slug: 'fort-bragg', name: 'Fort Bragg' },
      { slug: 'fort-carson', name: 'Fort Carson' },
      { slug: 'naval-station-san-diego', name: 'Naval Station San Diego' },
    ],
    deepDivePost: {
      slug: 'what-civilian-salary-do-i-need',
      title: 'What Civilian Salary Do I Need After the Military?',
    },
  },
  {
    slug: 'o4',
    grade: 'O-4',
    title: 'O-4',
    branchTitles: {
      army: 'Major',
      marines: 'Major',
      airForce: 'Major',
      navy: 'Lieutenant Commander',
      spaceForce: 'Major',
    },
    exampleYos: 12,
    exampleDependents: true,
    contextCopy: [
      'O-4 is the start of the field grades. The work shifts from leading at the line to running staffs, plans, and programs, usually alongside intermediate professional military education.',
      'Promotion to O-4 is the first genuinely competitive officer board for most year groups, typically arriving around 10 to 12 years of service. The pay table runs to over 18 years, but by O-4 the pattern inverts from the junior grades: the promotion raise itself is the big move, and the remaining longevity steps within the grade are comparatively modest.',
      'O-4 is also where retirement eligibility enters planning range. The years between O-4 and 20 are when the highest-36-months pension base starts forming, and where the difference between the legacy High-3 and BRS systems — multiplier versus TSP matching — shows up most clearly in projections rather than abstractions.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make O-4?',
        answer:
          'Typically around 10 to 12 years of commissioned service, by competitive selection board. It is the first promotion most officers face where selection is genuinely uncertain — timing and rates vary by branch, year group, and competitive category.',
      },
    ],
    exampleStations: [
      { slug: 'fort-leavenworth', name: 'Fort Leavenworth' },
      { slug: 'macdill-afb', name: 'MacDill AFB' },
      { slug: 'naval-station-norfolk', name: 'Naval Station Norfolk' },
    ],
  },
  {
    slug: 'o5',
    grade: 'O-5',
    title: 'O-5',
    branchTitles: {
      army: 'Lieutenant Colonel',
      marines: 'Lieutenant Colonel',
      airForce: 'Lieutenant Colonel',
      navy: 'Commander',
      spaceForce: 'Lieutenant Colonel',
    },
    exampleYos: 16,
    exampleDependents: true,
    contextCopy: [
      'O-5 is the command grade. Battalion and squadron command, ship command, and senior staff leadership sit at this level, and selection for command is a separate competition beyond the promotion itself.',
      'Promotion to O-5 typically arrives around 15 to 17 years of service, by competitive board. The pay table runs thirteen longevity steps to over 22 years — long enough that pay keeps climbing through a full command tour and beyond.',
      'Most officers cross the 20-year retirement-eligibility line while wearing O-5, which makes it the grade where the High-3 average usually forms: the pension formula takes the highest 36 months of basic pay, and for an officer retiring in the early twenties of service those months are O-5 months. Each additional year served at the grade swaps a lower-paid year out of that average and a higher longevity step in.',
    ],
    faqExtras: [
      {
        question: 'How long does it take to make O-5?',
        answer:
          'Typically around 15 to 17 years of commissioned service, by competitive selection board, with rates varying by branch, year group, and competitive category. Command selection at O-5 is a separate board from the promotion itself.',
      },
    ],
    exampleStations: [
      { slug: 'joint-base-andrews', name: 'Joint Base Andrews' },
      { slug: 'fort-meade', name: 'Fort George G. Meade' },
      { slug: 'scott-afb', name: 'Scott AFB' },
    ],
    deepDivePost: {
      slug: 'dual-military-financial-strategies',
      title: 'Dual Military Financial Strategies: Making Two Incomes Work',
    },
  },
  {
    slug: 'o6',
    grade: 'O-6',
    title: 'O-6',
    branchTitles: {
      army: 'Colonel',
      marines: 'Colonel',
      airForce: 'Colonel',
      navy: 'Captain',
      spaceForce: 'Colonel',
    },
    exampleYos: 22,
    exampleDependents: true,
    contextCopy: [
      'O-6 is the senior field grade. Brigade, wing, and major-ship command happen here, and for the large majority of officers who reach it, O-6 is the terminal grade: promotion to the general and flag ranks above it is rare and tightly capped.',
      'Selection typically comes around 21 to 23 years of service, by competitive board. The O-6 pay table is the longest in the officer chart — running all the way to over 30 years — so pay continues climbing for a decade or more after pinning on.',
      'Two mechanics define O-6 pay. First, the long longevity run means the final-years steps land directly in the highest-36-months average the pension formula uses, which is why O-6 retirements at 26 to 30 years produce markedly larger pensions than the same grade at 23. Second, O-6 is the last grade paid entirely from the longevity table — the general and flag grades above it run into the Executive Schedule pay cap, as covered on the pay charts page.',
    ],
    faqExtras: [
      {
        question: 'When do officers typically reach O-6?',
        answer:
          'Usually around 21 to 23 years of commissioned service, by competitive selection board, and only a minority of each year group is selected. For most officers who reach it, O-6 is the final grade of a career.',
      },
    ],
    exampleStations: [
      { slug: 'joint-base-san-antonio', name: 'Joint Base San Antonio' },
      { slug: 'joint-base-myer-henderson-hall', name: 'Joint Base Myer-Henderson Hall' },
      { slug: 'wright-patterson-afb', name: 'Wright-Patterson AFB' },
    ],
  },
];

export const RANK_BY_SLUG: Record<string, PayPageRank> = Object.fromEntries(
  PAY_PAGE_RANKS.map((r) => [r.slug, r])
);
