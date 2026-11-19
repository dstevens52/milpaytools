/**
 * Calculator URL settings — the ONE list of the query parameters each calculator reads.
 *
 * Three consumers, so they can't drift apart:
 *   1. The calculators read their URL through readUrlParams(key, search). Its get()
 *      only accepts names declared here, so reading an undeclared parameter is a
 *      type error (tsc / next build).
 *   2. public/llms.txt's "Calculator link settings" section is rendered from this
 *      list by renderLlmsUrlSettings() (write it with `npm run llms:params`).
 *   3. tests/e2e/llms-url-params.spec.ts checks llms.txt against this list and checks
 *      every declared name is actually read in the calculator's source.
 *
 * Client-safe: no data imports. Values and defaults are written from the code that
 * reads each parameter (the calculator's URL effect and its useState defaults).
 * Example links carry settings only, never dollar figures.
 */

export interface UrlParamDoc {
  /** Query parameter name, exactly as read. */
  name: string;
  /** Accepted values or format. */
  values: string;
  /** What the calculator uses when the parameter is missing or not accepted. */
  default: string;
}

export interface CalculatorUrlSpec {
  /** Name used in llms.txt. */
  title: string;
  /** Path of the page that reads the parameters. */
  path: string;
  /** Source files whose code reads the parameters (checked by the test). */
  sources: readonly string[];
  params: readonly UrlParamDoc[];
  /** One link that opens a filled-in result. */
  example: { label: string; params: Readonly<Record<string, string>> };
}

import { ALLOCATION_PRESETS } from '@/data/tsp/2026/constants';

export const SITE_ORIGIN = 'https://www.milpaytools.com';

/** "60% C, 25% S and 15% I Fund" from an allocation (funds at 0% left out). */
export function describeFundMix(allocation: Readonly<Record<string, number>>): string {
  const parts = Object.entries(allocation)
    .filter(([, pct]) => pct > 0)
    .map(([fund, pct]) => `${pct}% ${fund}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return `${list} Fund`;
}

/** The TSP calculator's default fund mix (the aggressive preset); no URL setting changes it. */
const TSP_DEFAULT_MIX = describeFundMix(ALLOCATION_PRESETS.aggressive);

const GRADE = 'pay grade e1–e9, w1–w5, o1–o10 or o1e–o3e; any case, hyphen optional (e5 and E-5 both work)';
const YES_NO = 'yes or no (1/0 and true/false also work)';
const ZIP = '5-digit ZIP code';

export const CALCULATOR_URL_PARAMS = {
  'total-compensation': {
    title: 'Military Pay Calculator',
    path: '/calculators/total-compensation',
    sources: ['src/components/calculators/total-compensation/TotalCompensationCalculator.tsx'],
    params: [
      { name: 'rank', values: GRADE, default: 'E-5' },
      { name: 'yos', values: 'years of service, whole number 0–40', default: '6' },
      { name: 'zip', values: `${ZIP} of the duty station (sets BAH)`, default: 'none (results appear once a ZIP is entered)' },
      { name: 'dependents', values: YES_NO, default: 'no' },
      { name: 'retirement', values: 'brs or legacy', default: 'brs' },
      { name: 'tsp', values: 'TSP contribution, percent of base pay, 0–92 (BRS only)', default: '5' },
      { name: 'housing', values: `${YES_NO}; yes = government housing (no BAH cash)`, default: 'no' },
      { name: 'meals', values: `${YES_NO}; yes = meal card (no BAS cash)`, default: 'no' },
    ],
    example: {
      label: 'E-5, 8 years of service, Fort Bragg (ZIP 28310), with dependents',
      params: { rank: 'e5', yos: '8', zip: '28310', dependents: 'yes' },
    },
  },
  bah: {
    title: 'BAH Calculator',
    path: '/bah',
    sources: ['src/components/calculators/bah/BAHCalculator.tsx'],
    params: [
      { name: 'zip', values: ZIP, default: 'none (results appear once a ZIP is entered)' },
      { name: 'rank', values: GRADE, default: 'E-5' },
      { name: 'dependents', values: YES_NO, default: 'no' },
      { name: 'mode', values: 'single or compare', default: 'single' },
      { name: 'zipb', values: `${ZIP} of the second location (compare mode)`, default: 'none' },
    ],
    example: {
      label: 'E-5 with dependents at Fort Bragg (ZIP 28310)',
      params: { zip: '28310', rank: 'e5', dependents: 'yes' },
    },
  },
  'va-disability': {
    title: 'VA Disability Calculator',
    path: '/calculators/va-disability',
    sources: ['src/lib/calculations/va-disability-url.ts'],
    params: [
      {
        name: 'r',
        values:
          'ratings, comma-separated, each 0–100 in steps of 10; add a body location for the bilateral factor: .lue / .rue (left / right arm), .lle / .rle (left / right leg), e.g. 50,30.lle,20.rle',
        default: 'none (no ratings entered)',
      },
      { name: 'sp', values: '1 = spouse', default: 'no spouse' },
      { name: 'aa', values: '1 = spouse receives Aid and Attendance (only with sp=1)', default: 'no' },
      { name: 'c', values: 'children under 18, 0–10', default: '0' },
      { name: 'cs', values: 'children 18–23 in school, 0–5', default: '0' },
      { name: 'dp', values: 'dependent parents, 0–2', default: '0' },
      { name: 'l', values: 'condition labels, comma-separated, in the same order as r (optional)', default: 'none' },
      { name: 'ratings', values: 'older links: ratings only, comma-separated, no locations or dependents (used when r is absent)', default: 'none' },
    ],
    example: {
      label: '50% back, 30% left knee and 20% right knee (bilateral factor), veteran alone',
      params: { r: '50,30.lle,20.rle' },
    },
  },
  tsp: {
    title: 'TSP Growth Projector',
    path: '/calculators/tsp',
    sources: ['src/components/calculators/tsp/TSPCalculator.tsx'],
    params: [
      { name: 'rank', values: GRADE, default: 'E-5' },
      { name: 'yos', values: 'years of service, 0–40', default: '6' },
      { name: 'balance', values: 'current TSP balance in dollars', default: '0' },
      { name: 'contribution', values: 'monthly contribution in dollars (switches the input to dollars)', default: '5% of base pay' },
      { name: 'years', values: 'years to project, 1–60 (target age = 26 + years; current age is not a URL setting)', default: '39 (age 26 to 65)' },
      { name: 'match', values: 'yes = BRS with government match, no = legacy (no match)', default: 'yes' },
      { name: 'roth', values: 'yes = Roth, no = Traditional', default: 'Roth' },
      { name: 'more_years', values: 'years left to serve (match stops after), 1–30', default: '20 minus yos, at least 1' },
    ],
    example: {
      label: `E-5, 6 years of service, no current balance, 5% of base pay under BRS, projected 39 years at the default ${TSP_DEFAULT_MIX} mix and its blended average annual return (an assumption, not a forecast); results are in future dollars`,
      params: { rank: 'e5', yos: '6', balance: '0', years: '39', match: 'yes' },
    },
  },
  retirement: {
    title: 'Military Retirement Calculator',
    path: '/calculators/retirement',
    sources: ['src/components/calculators/retirement/RetirementCalculator.tsx'],
    params: [
      { name: 'system', values: 'brs or high3', default: 'brs' },
      { name: 'rank', values: `${GRADE}; grade at retirement`, default: 'E-7' },
      { name: 'yos', values: 'years of service at retirement, 20–40 (older links: under 20 sets current years)', default: '20' },
      { name: 'months', values: 'extra months of service at retirement, 0–11', default: '0' },
      { name: 'currank', values: `${GRADE}; current grade`, default: 'same as rank (E-7)' },
      { name: 'curyos', values: 'current years of service, 0–39', default: '10' },
      { name: 'tsp', values: 'TSP contribution, percent of base pay, 0–50', default: '5' },
      { name: 'bal', values: 'current TSP balance in dollars', default: '0' },
      { name: 'ret', values: 'assumed TSP annual return: 5, 6, 7, 8 or 10', default: '7' },
      { name: 'varating', values: 'VA disability rating, 0–100 in steps of 10', default: '0' },
    ],
    example: {
      label: 'E-7 retiring at 20 years under BRS, currently at 10 years',
      params: { system: 'brs', rank: 'e7', yos: '20', currank: 'e7', curyos: '10' },
    },
  },
  pcs: {
    title: 'PCS Calculator',
    path: '/calculators/pcs',
    sources: ['src/components/calculators/pcs/PCSCalculator.tsx'],
    params: [
      { name: 'rank', values: GRADE, default: 'E-5' },
      { name: 'dep', values: YES_NO, default: 'yes' },
      { name: 'dep12', values: 'dependents age 12 or older, 0–10', default: '1' },
      { name: 'depu12', values: 'dependents under 12, 0–10', default: '0' },
      { name: 'numdep', values: 'older links: one dependent count, read as age 12 or older (used when dep12 and depu12 are absent)', default: 'none' },
      { name: 'movetype', values: 'gov, full-ppm or partial-ppm', default: 'gov' },
      { name: 'from', values: `${ZIP} of the old duty station`, default: 'none' },
      { name: 'to', values: `${ZIP} of the new duty station`, default: 'none' },
      { name: 'miles', values: 'distance in miles (sets a manual distance; otherwise estimated from from and to)', default: 'none' },
      { name: 'povs', values: '2 = a second privately owned vehicle', default: '1' },
      { name: 'hhg', values: 'household goods weight in pounds (PPM moves)', default: '5000' },
      { name: 'tleold', values: 'TLE days at the old station, 0–21', default: '0' },
      { name: 'tlenew', values: 'TLE days at the new station, 0–21', default: '0' },
    ],
    example: {
      label: 'E-5 with a spouse, government-arranged move of 1,000 miles, one vehicle',
      params: { rank: 'e5', dep: 'yes', dep12: '1', depu12: '0', movetype: 'gov', miles: '1000' },
    },
  },
  'guard-reserve': {
    title: 'Guard & Reserve Pay Calculator',
    path: '/calculators/guard-reserve',
    sources: ['src/components/calculators/guard-reserve/GuardReserveCalculator.tsx'],
    params: [
      { name: 'rank', values: 'pay grade e1–e9, w1–w5 or o1–o10; any case, hyphen optional', default: 'E-5' },
      { name: 'yos', values: 'years of service, 0–40', default: '6' },
      { name: 'weekends', values: 'drill weekends per year, 0–52', default: '12' },
      { name: 'periods', values: 'drill periods per weekend: 4, 6 or 8', default: '4' },
      { name: 'at', values: 'Annual Training days, 0–365', default: '15' },
      { name: 'addl', values: 'additional active-duty days, 0–365', default: '0' },
      { name: 'trs', values: 'TRICARE Reserve Select: none, member or family', default: 'none' },
      { name: 'brs', values: YES_NO, default: 'no' },
      { name: 'tsp', values: 'TSP contribution, percent, 0–100 (BRS only)', default: '5' },
    ],
    example: {
      label: 'E-5, 6 years of service, 12 drill weekends (4 periods each) and 15 days of Annual Training',
      params: { rank: 'e5', yos: '6', weekends: '12', periods: '4', at: '15' },
    },
  },
  education: {
    title: 'Education Benefits Calculator',
    path: '/calculators/education',
    sources: ['src/components/calculators/education/EducationCalculator.tsx'],
    params: [
      { name: 'status', values: 'veteran, active-duty or guard-reserve', default: 'veteran' },
      {
        name: 'tier',
        values: 'Post-9/11 GI Bill service length: lt-90, 90d, 6mo, 12mo, 18mo, 24mo, 30mo or 36mo+ (write 36mo%2B in a URL)',
        default: '36mo+',
      },
      { name: 'va', values: 'VA disability rating, 0–100 in steps of 10', default: '0' },
      { name: 'school', values: 'public, private or online', default: 'public' },
      { name: 'online', values: 'public or private (online schools only)', default: 'private' },
      { name: 'zip', values: `${ZIP} of the school (sets the GI Bill housing allowance)`, default: '92101' },
      { name: 'tuition', values: 'annual tuition in dollars', default: '12000' },
      { name: 'years', values: 'program length in years, 1–4', default: '4' },
      { name: 'enrollment', values: 'full, three-quarter or half', default: 'full' },
    ],
    example: {
      label: 'veteran at the 100% Post-9/11 GI Bill tier, full time at a public school in San Diego (ZIP 92093)',
      params: { status: 'veteran', tier: '36mo+', school: 'public', zip: '92093', tuition: '15000', years: '4', enrollment: 'full' },
    },
  },
  cola: {
    title: 'CONUS COLA Calculator',
    path: '/calculators/cola',
    sources: ['src/components/calculators/cola/ColaCalculator.tsx'],
    params: [{ name: 'zip', values: ZIP, default: 'none (results appear once a ZIP is entered)' }],
    example: { label: 'Seattle (ZIP 98101)', params: { zip: '98101' } },
  },
  compare: {
    title: 'Compare Your PCS Move',
    path: '/calculators/compare',
    sources: ['src/components/calculators/compare/CompareCalculator.tsx'],
    params: [
      { name: 'zip1', values: `${ZIP} of the current station`, default: '28310 (Fort Bragg)' },
      { name: 'zip2', values: `${ZIP} of the new station`, default: '98433 (JBLM)' },
      { name: 'rank', values: GRADE, default: 'E-5' },
      { name: 'yos', values: 'years of service, 0–40', default: '8' },
      { name: 'dependents', values: YES_NO, default: 'yes' },
      { name: 'residence', values: 'state of legal residence, 2-letter code (adds state income tax)', default: 'none (state tax not included)' },
      { name: 'change', values: `${YES_NO}; yes = change legal residence to the new station's state (only with residence)`, default: 'no' },
    ],
    example: {
      label: 'E-5, 8 years of service, with dependents, Fort Bragg (ZIP 28310) to San Diego (ZIP 92134)',
      params: { zip1: '28310', zip2: '92134', rank: 'e5', yos: '8', dependents: 'yes' },
    },
  },
  deployment: {
    title: 'Deployment Pay Calculator',
    path: '/calculators/deployment',
    sources: ['src/components/calculators/deployment/DeploymentCalculator.tsx'],
    params: [
      { name: 'rank', values: GRADE, default: 'E-6' },
      { name: 'yos', values: 'years of service, 0–40', default: '10' },
      { name: 'zip', values: `${ZIP} of the home station (sets BAH)`, default: '28310 (Fort Bragg)' },
      { name: 'dependents', values: YES_NO, default: 'yes' },
      { name: 'fsa', values: `${YES_NO}; Family Separation Allowance (needs dependents)`, default: 'same as dependents' },
      { name: 'fs', values: 'tax filing status: single, mfj or hoh', default: 'from dependents' },
      { name: 'months', values: 'deployment length in months, 1–18', default: '9' },
      { name: 'cz', values: `${YES_NO}; combat zone (tax exclusion)`, default: 'yes' },
      { name: 'idp', values: `${YES_NO}; Imminent Danger Pay`, default: 'yes' },
      { name: 'hdp', values: 'Hardship Duty Pay per month: 0, 50 or 100', default: '100' },
      { name: 'tsp', values: 'TSP contribution, percent of base pay, 0–100', default: '10' },
      { name: 'sdp', values: `${YES_NO}; Savings Deposit Program (combat zone only)`, default: 'yes' },
      { name: 'sdpDeposit', values: 'SDP deposit in dollars, 0–10000', default: '10000' },
    ],
    example: {
      label: 'E-5, 8 years of service, with dependents, home station Fort Bragg, 9 months in a combat zone with Imminent Danger Pay and FSA',
      params: {
        rank: 'e5', yos: '8', zip: '28310', dependents: 'yes', fsa: 'yes', months: '9',
        cz: 'yes', idp: 'yes', hdp: '0', tsp: '0', sdp: 'no',
      },
    },
  },
  'pay-raise': {
    title: '2027 Military Pay Raise Calculator',
    path: '/pay/raise',
    sources: ['src/components/calculators/pay-raise/PayRaiseCalculator.tsx'],
    params: [
      { name: 'grade', values: GRADE, default: 'E-5' },
      { name: 'yos', values: 'years of service, 0–40', default: '6' },
    ],
    example: { label: 'E-5 with 8 years of service', params: { grade: 'e5', yos: '8' } },
  },
  'dual-military-bah': {
    title: 'Dual Military BAH Calculator',
    path: '/calculators/dual-military-bah',
    sources: ['src/components/calculators/dual-military-bah/DualMilitaryBAHCalculator.tsx'],
    params: [
      { name: 'rank1', values: `${GRADE}; first member`, default: 'O-3' },
      { name: 'rank2', values: `${GRADE}; second member`, default: 'E-5' },
      { name: 'zip', values: `${ZIP}; both members at the same station`, default: 'none' },
      { name: 'zip1', values: `${ZIP} of the first member's station (different stations)`, default: 'none' },
      { name: 'zip2', values: `${ZIP} of the second member's station (different stations)`, default: 'none' },
      { name: 'dependents', values: `${YES_NO}; children or other dependents`, default: 'yes' },
      { name: 'claims', values: '1 or 2: which member claims the dependents', default: '1' },
    ],
    example: {
      label: 'two E-5s at Fort Bragg (ZIP 28310) with a child, the first member claiming',
      params: { rank1: 'e5', rank2: 'e5', zip: '28310', dependents: 'yes', claims: '1' },
    },
  },
  'transition-readiness': {
    title: 'Transition Readiness Calculator',
    path: '/calculators/transition-readiness',
    sources: ['src/components/calculators/transition-readiness/TransitionReadinessCalculator.tsx'],
    params: [
      { name: 'rank', values: GRADE, default: 'E-6' },
      { name: 'yos', values: 'years of service, 0–40', default: '10' },
      { name: 'zip', values: `${ZIP} of the duty station (sets BAH)`, default: 'none' },
      { name: 'dep', values: YES_NO, default: 'yes' },
      { name: 'sm', values: 'separation month, 0–11 (0 = January)', default: '14 months from today' },
      { name: 'sy', values: 'separation year, 2024–2035', default: '14 months from today' },
      { name: 'rs', values: 'brs or legacy', default: 'legacy' },
      { name: 'sal', values: 'civilian salary offer in dollars per year', default: '0' },
      { name: 'sp', values: 'spouse income in dollars per year', default: '0' },
      { name: 'va', values: 'expected VA rating, 0–100 in steps of 10, or -1 = not filed yet', default: '30' },
      { name: 'crsc', values: `${YES_NO}; CRSC eligible`, default: 'no' },
      { name: 'st', values: 'state you plan to live in, 2-letter code', default: 'none' },
      { name: 'str', values: 'state income tax rate, percent, 0–15', default: '5' },
      { name: 'fs', values: 'tax filing status: single, mfj or hoh', default: 'from dependents and spouse income' },
      { name: 'mode', values: 'quick or detailed (expense entry)', default: 'quick' },
      { name: 'exp', values: 'monthly expenses in dollars (quick mode)', default: '0' },
      { name: 'ef', values: 'emergency fund in dollars', default: '25000' },
      { name: 'tsp', values: 'TSP balance in dollars', default: '45000' },
      { name: 'sav', values: 'other savings in dollars', default: '0' },
      { name: 'hca', values: 'healthcare plan after service: marketplace, employer, va or ns (not sure)', default: 'employer' },
    ],
    example: {
      label: 'E-6, 10 years of service, with dependents, at JBSA (ZIP 78234), civilian offer of 75,000 a year, monthly expenses of 4,200',
      params: { rank: 'e6', yos: '10', zip: '78234', dep: 'yes', sal: '75000', exp: '4200' },
    },
  },
  'separation-timeline': {
    title: 'Separation Benefits Timeline',
    path: '/calculators/separation-timeline',
    sources: ['src/components/calculators/separation-timeline/SeparationTimelineCalculator.tsx'],
    params: [
      { name: 'date', values: 'separation date, YYYY-MM-DD', default: 'none (results appear once a date is entered)' },
      { name: 'type', values: 'separating or retiring', default: 'separating' },
      { name: 'tamp', values: 'TAMP eligible: yes, no or unknown', default: 'unknown' },
      { name: 'va', values: 'VA claim filed: yes, no or unknown', default: 'unknown' },
    ],
    example: {
      label: 'separating on June 30, 2027, TAMP eligible, VA claim not yet filed',
      params: { date: '2027-06-30', type: 'separating', tamp: 'yes', va: 'no' },
    },
  },
  'healthcare-comparison': {
    title: 'Healthcare Cost Comparison',
    path: '/calculators/healthcare-comparison',
    sources: ['src/components/calculators/healthcare-comparison/HealthcareComparisonCalculator.tsx'],
    params: [
      {
        name: 'family',
        values: 'single, married-no-kids, married-1-child, married-2-children, married-3plus or single-parent',
        default: 'single',
      },
      { name: 'path', values: 'coverage after service: employer, aca-no-subsidy, aca-subsidy, va, trs or tamp', default: 'employer' },
      { name: 'tier', values: 'bronze, silver or gold (employer and ACA paths)', default: 'silver' },
      { name: 'rating', values: 'VA rating band (va path): 50plus, 30to40, 10to20 or 0sc', default: '50plus' },
      { name: 'income', values: 'annual household income in dollars (aca-subsidy path)', default: 'none' },
      { name: 'tamp', values: 'true = eligible for TAMP', default: 'not eligible' },
    ],
    example: {
      label: 'married with two children, average employer silver plan',
      params: { family: 'married-2-children', path: 'employer', tier: 'silver' },
    },
  },
  'va-loan': {
    title: 'VA Loan Payment Calculator',
    path: '/calculators/va-loan',
    sources: ['src/components/calculators/va-loan/VALoanCalculator.tsx'],
    params: [
      { name: 'price', values: 'home price in dollars', default: '350000' },
      { name: 'down', values: 'down payment: dollars, or percent when downType=percent', default: '0' },
      { name: 'downType', values: 'dollar or percent', default: 'dollar' },
      { name: 'rate', values: 'interest rate, percent, above 0 and below 30', default: '6' },
      { name: 'term', values: '30, 20, 15 or arm5', default: '30' },
      { name: 'tax', values: 'annual property tax in dollars', default: '4200' },
      { name: 'ins', values: 'annual homeowners insurance in dollars', default: '1400' },
      { name: 'firstUse', values: `${YES_NO}; first use of the VA loan benefit`, default: 'yes' },
      { name: 'exempt', values: `${YES_NO}; exempt from the funding fee (VA disability compensation)`, default: 'no' },
      { name: 'financeFee', values: `${YES_NO}; roll the funding fee into the loan`, default: 'yes' },
      { name: 'zip', values: `${ZIP} for the BAH comparison`, default: 'none' },
      { name: 'rank', values: `${GRADE}; for the BAH comparison`, default: 'E-5' },
      { name: 'dep', values: `${YES_NO}; for the BAH comparison`, default: 'no' },
      { name: 'bah', values: `${YES_NO}; show the BAH comparison`, default: 'yes when zip is given, otherwise no' },
    ],
    example: {
      label: 'home price 350,000, first use, no down payment',
      params: { price: '350000', down: '0', firstUse: 'yes', exempt: 'no' },
    },
  },
  'va-refinance': {
    title: 'VA Refinance Calculator',
    path: '/calculators/va-refinance',
    sources: ['src/components/calculators/va-refinance/VARefinanceCalculator.tsx'],
    params: [
      { name: 'type', values: 'irrrl or cashout', default: 'irrrl' },
      { name: 'balance', values: 'current loan balance in dollars', default: '300000' },
      { name: 'currRate', values: 'current interest rate, percent, above 0 and below 30', default: '7' },
      { name: 'yearsRem', values: 'years left on the current loan, 1–50', default: '25' },
      { name: 'newRate', values: 'new interest rate, percent, above 0 and below 30', default: '6' },
      { name: 'newTerm', values: 'new loan term in years: 15, 20, 25 or 30', default: '30' },
      { name: 'closing', values: 'closing costs in dollars', default: '2500' },
      { name: 'credits', values: 'lender credits in dollars', default: '0' },
      { name: 'exempt', values: `${YES_NO}; exempt from the funding fee`, default: 'no' },
      { name: 'firstUse', values: `${YES_NO}; first use (cash-out funding fee)`, default: 'yes' },
      { name: 'firstPmt', values: "date of the current loan's first payment, YYYY-MM-DD (IRRRL seasoning check)", default: 'none' },
    ],
    example: {
      label: 'IRRRL on a balance of 300,000, not exempt from the funding fee',
      params: { type: 'irrrl', balance: '300000', exempt: 'no' },
    },
  },
} as const satisfies Record<string, CalculatorUrlSpec>;

export type CalculatorKey = keyof typeof CALCULATOR_URL_PARAMS;
export type UrlParamName<K extends CalculatorKey> = (typeof CALCULATOR_URL_PARAMS)[K]['params'][number]['name'];

/**
 * Read a calculator's query string. get() only takes the parameter names declared
 * for that calculator above, so an undeclared read fails type-checking.
 */
export function readUrlParams<K extends CalculatorKey>(_calc: K, search: string) {
  const sp = new URLSearchParams(search);
  return { get: (name: UrlParamName<K>): string | null => sp.get(name) };
}

/** Query string with readable commas (encodeURIComponent otherwise; '+' stays %2B). */
export function buildQuery(params: Readonly<Record<string, string>>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%2C/g, ',')}`)
    .join('&');
}

/** Site-relative example link for a calculator. */
export function exampleHref(calc: CalculatorKey): string {
  const spec: CalculatorUrlSpec = CALCULATOR_URL_PARAMS[calc];
  return `${spec.path}?${buildQuery(spec.example.params)}`;
}

/** Order of the calculators in llms.txt. */
export const LLMS_CALCULATOR_ORDER: readonly CalculatorKey[] = [
  'total-compensation', 'bah', 'va-disability', 'tsp', 'retirement', 'pcs', 'guard-reserve', 'education',
  'cola', 'compare', 'deployment', 'pay-raise', 'dual-military-bah', 'transition-readiness',
  'separation-timeline', 'healthcare-comparison', 'va-loan', 'va-refinance',
];

export const LLMS_SECTION_START = '<!-- calculator-url-settings:start (generated from src/data/calculatorUrlParams.ts; run npm run llms:params) -->';
export const LLMS_SECTION_END = '<!-- calculator-url-settings:end -->';

/** The llms.txt "Calculator link settings" section, markers included. No dollar figures. */
export function renderLlmsUrlSettings(): string {
  const lines: string[] = [
    LLMS_SECTION_START,
    '## Calculator link settings',
    '',
    'Each calculator reads the settings below from its URL, so a link can open a filled-in result. A missing or unrecognized setting falls back to the default shown. Results are estimates built on official tables (DFAS pay tables, DTMO BAH and COLA rates, VA compensation rates and funding fees, GSA per diem, TRICARE fees); the healthcare comparison also uses published survey averages. No account or personal information is needed.',
  ];
  for (const key of LLMS_CALCULATOR_ORDER) {
    const spec: CalculatorUrlSpec = CALCULATOR_URL_PARAMS[key];
    lines.push('', `### ${spec.title} (${spec.path})`);
    for (const p of spec.params) lines.push(`- \`${p.name}\`: ${p.values}. Default: ${p.default}.`);
    lines.push(`- Example (${spec.example.label}): ${SITE_ORIGIN}${exampleHref(key)}`);
  }
  lines.push(LLMS_SECTION_END);
  return lines.join('\n');
}
