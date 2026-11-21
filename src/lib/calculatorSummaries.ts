/**
 * "What this calculator does" blocks — the server-rendered summary near each
 * calculator (src/components/calculators/shared/CalculatorSummary.tsx).
 *
 * SERVER / TESTS ONLY: imports the BAH dataset. Every example figure is computed
 * here from the same lib functions the calculator uses, with the inputs carried by
 * the example link in src/data/calculatorUrlParams.ts, and formatted the way the
 * calculator formats it. No hand-typed figures. tests/e2e/calculator-summary.spec.ts
 * checks the rendered block and that the example link shows the same figure.
 */

import { CALCULATOR_URL_PARAMS, describeFundMix, exampleHref, type CalculatorKey } from '@/data/calculatorUrlParams';
import { BAH_YEAR } from '@/data/bah/current';
import { ALLOCATION_PRESETS } from '@/data/tsp/2026/constants';
import { DATA_YEAR as COLA_YEAR } from '@/data/cola/2026/constants';
import { getMHACode, getMHARates, getLocationDisplayName, combinedBahForZip } from '@/lib/calculations/bah';
import { calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { calculateCombinedRating, getCompensation } from '@/lib/calculations/va-disability';
import { projectTSP, getBasePayMonthly } from '@/lib/calculations/tspGrowth';
import { sampleFmt } from '@/lib/calculations/tspSampleDefaults';
import { calculateRetirement } from '@/lib/calculations/retirement';
import { calculatePCS } from '@/lib/calculations/pcs';
import { calculateGuardReserve } from '@/lib/calculations/guardReserve';
import { compareAllBenefits } from '@/lib/calculations/education';
import { giBillBahAtZip } from '@/lib/calculations/educationBah';
import { lookupCola } from '@/lib/calculations/cola';
import { compareLocations } from '@/lib/calculations/compare';
import { calculateDeployment, defaultDeploymentFilingStatus } from '@/lib/calculations/deployment';
import {
  calculateTransitionReadiness,
  DEFAULT_STATE_TAX_RATE,
  defaultFilingStatus,
} from '@/lib/calculations/transition-readiness';
import { calculateHealthcare } from '@/lib/calculations/healthcare';
import { getFundingFeeRate, getRefinanceFundingFeeRate, fundingFeeAmount } from '@/lib/calculations/vaLoanFees';
import type { PayGrade } from '@/types/military';

/** Calculators that get a block (every /calculators page plus the /bah hub; /pay/* is frozen). */
export type SummaryKey = Exclude<CalculatorKey, 'pay-raise'>;

export interface CalculatorSummaryExample {
  /** Text before the arrow, e.g. "an E-5 with 8 years of service ... at Fort Bragg". */
  lead: string;
  /** The computed figure, formatted exactly as the calculator shows it. */
  figure: string;
  /** Text after the figure (starts with a space or punctuation). */
  tail: string;
  /** Site-relative link that opens this example in the calculator. */
  href: string;
}

export interface CalculatorSummaryData {
  key: SummaryKey;
  /** One sentence on what it calculates. */
  what: string;
  /** What you enter, comma-separated. */
  inputs: string;
  /** One worked result; absent when a worked example isn't meaningful. */
  example: CalculatorSummaryExample | null;
  /** Data-source half of the trust line. */
  basis: string;
}

// ── Formatting, matching each calculator's own formatter ──────────────────────
/** Whole dollars, "$1,234" (BAH, dual BAH, compare, deployment, PCS, GR, education, retirement, healthcare, total comp). */
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
/** Dollars and cents, "$1,234.56" (VA disability). */
const usd2 = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct2 = (rate: number) => `${(rate * 100).toFixed(2)}%`;

function bahRate(zip: string, grade: PayGrade, withDependents: boolean): number {
  const mha = getMHACode(zip);
  return (mha && getMHARates(mha, withDependents)?.[grade]) || 0;
}

/**
 * BAH for an example that ADDS PAY (total comp, compare, deployment, transition
 * readiness): the pay table's year, the one-year rule (src/lib/combinedPayYear.ts).
 * BAH-only examples (BAH, dual-military household BAH) keep bahRate (BAH_YEAR).
 */
function payBahRate(zip: string, grade: PayGrade, withDependents: boolean): number {
  return combinedBahForZip(zip, grade, withDependents);
}

/** Throws at build time if an example would show $0 or a non-number, so it never ships. */
function nonZero(n: number, key: SummaryKey): number {
  if (!Number.isFinite(n) || Math.round(n) <= 0) throw new Error(`calculatorSummaries: ${key} example is ${n}`);
  return n;
}

const href = (k: SummaryKey) => exampleHref(k);

// ── Example computations (inputs mirror CALCULATOR_URL_PARAMS[k].example) ─────

function totalCompExample(): CalculatorSummaryExample {
  const zip = '28310';
  const r = calculateTotalCompensation(
    { payGrade: 'E-5', yearsOfService: 8, zipCode: zip, hasDependents: true, retirementSystem: 'brs', tspContributionPct: 5, govHousing: false, mealCard: false },
    payBahRate(zip, 'E-5', true),
  );
  return {
    lead: 'an E-5 with 8 years of service and dependents at Fort Bragg',
    figure: `${usd(nonZero(r.cashMonthly, 'total-compensation'))}/month`,
    tail: ' total (base pay, BAH and BAS)',
    href: href('total-compensation'),
  };
}

function bahExample(): CalculatorSummaryExample {
  return {
    lead: 'an E-5 with dependents at Fort Bragg',
    figure: `${usd(nonZero(bahRate('28310', 'E-5', true), 'bah'))}/month`,
    tail: ` in ${BAH_YEAR} BAH`,
    href: href('bah'),
  };
}

function vaDisabilityExample(): CalculatorSummaryExample {
  const rating = calculateCombinedRating([
    { id: 'back', rating: 50, label: '', side: 'none', pairKey: null },
    { id: 'left-knee', rating: 30, label: '', side: 'left', pairKey: 'leg' },
    { id: 'right-knee', rating: 20, label: '', side: 'right', pairKey: 'leg' },
  ]);
  const comp = getCompensation(rating.rounded, { hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0 });
  return {
    lead: `a veteran with no dependents rated 50% (back), 30% (left knee) and 20% (right knee): ${rating.rounded}% combined`,
    figure: `${usd2(nonZero(comp.monthly, 'va-disability'))}/month`,
    tail: ` at ${comp.dataYear} VA rates, excluded from federal taxable income`,
    href: href('va-disability'),
  };
}

function tspExample(): CalculatorSummaryExample {
  // The calculator's defaults for this link: current age 26, 5% of base pay, aggressive
  // preset, 4.5% annual raise, match stops after 20 − 6 = 14 more years.
  const allocation = { ...ALLOCATION_PRESETS.aggressive };
  const p = projectTSP({
    startingBalance: 0,
    monthlyContribution: getBasePayMonthly('E-5', 6) * 0.05,
    retirementSystem: 'brs',
    payGrade: 'E-5',
    yearsOfService: 6,
    allocation,
    yearsToProject: 39,
    moreYearsToServe: 14,
    annualPayRaisePct: 4.5,
  });
  return {
    lead: 'an E-5 with 6 years of service contributing 5% of base pay under BRS, from age 26 to 65',
    figure: sampleFmt(nonZero(p.finalBalance, 'tsp')),
    // Rate shown the way the calculator shows it ("Blended annual return: 8.98%").
    tail: `, assuming a ${(p.blendedAnnualReturn * 100).toFixed(2)}% average annual return (the blended rate of a ${describeFundMix(allocation)} mix; not a forecast), in future dollars`,
    href: href('tsp'),
  };
}

function retirementExample(): CalculatorSummaryExample {
  const r = calculateRetirement({
    retirementSystem: 'brs',
    currentGrade: 'E-7',
    currentYOS: 10,
    retirementYOS: 20,
    retirementMonths: 0,
    retirementGrade: 'E-7',
    tspContributionPct: 5,
    tspCurrentBalance: 0,
    tspAnnualReturnPct: 7,
    vaRating: 0,
  });
  return {
    lead: 'an E-7 retiring at 20 years of service under BRS',
    figure: `${usd(nonZero(r.monthlyPension, 'retirement'))}/month`,
    tail: ' in retired pay, before taxes',
    href: href('retirement'),
  };
}

function pcsExample(): CalculatorSummaryExample {
  const r = calculatePCS({
    rank: 'E-5',
    hasDependents: true,
    depsAge12Plus: 1,
    depsUnder12: 0,
    moveType: 'gov',
    distance: 1000,
    numPOVs: 1,
    hhgWeight: 5000,
    tleOldDays: 0,
    tleNewDays: 0,
    tleRoute: 'conus',
  });
  return {
    lead: 'an E-5 with a spouse on a 1,000-mile government-arranged move with one car',
    figure: usd(nonZero(r.govMoveTotal, 'pcs')),
    tail: ' in DLA, MALT mileage and per diem',
    href: href('pcs'),
  };
}

function guardReserveExample(): CalculatorSummaryExample {
  const r = calculateGuardReserve({
    rank: 'E-5',
    yearsOfService: 6,
    weekendsPerYear: 12,
    periodsPerWeekend: 4,
    atDays: 15,
    additionalDays: 0,
    trsPlan: 'none',
    brsEnrolled: false,
    tspContribPct: 5,
  });
  return {
    lead: 'an E-5 with 6 years of service drilling 12 weekends (48 drill periods) plus 15 days of Annual Training',
    figure: `${usd(nonZero(r.totalValue, 'guard-reserve'))}/year`,
    tail: ' in military pay',
    href: href('guard-reserve'),
  };
}

function educationExample(): CalculatorSummaryExample {
  const zip = '92093';
  const r = compareAllBenefits({
    status: 'veteran',
    serviceTier: '36mo+',
    vaRating: 0,
    schoolType: 'public',
    onlineInstitution: 'private',
    schoolZip: zip,
    schoolBAH: giBillBahAtZip(zip) ?? 0,
    schoolLocationName: getLocationDisplayName(zip),
    annualTuition: 15000,
    programYears: 4,
    enrollment: 'full',
  });
  const gi = r.benefits.find((b) => b.id === 'gi-bill');
  return {
    lead: 'a veteran at the 100% Post-9/11 GI Bill tier studying full time at a public school in San Diego (ZIP 92093)',
    figure: `${usd(nonZero(gi?.monthlyMHA ?? 0, 'education'))}/month`,
    tail: ' GI Bill housing allowance',
    href: href('education'),
  };
}

function colaExample(): CalculatorSummaryExample {
  const r = lookupCola('98101');
  if (r.status !== 'eligible') throw new Error('calculatorSummaries: cola example ZIP is not a COLA area');
  return {
    lead: `a duty station in ${r.dtmoName} (ZIP 98101)`,
    figure: `${nonZero(r.index, 'cola')}%`,
    tail: ` COLA index on DTMO’s ${COLA_YEAR} list`,
    href: href('cola'),
  };
}

function compareExample(): CalculatorSummaryExample {
  const at = (zip: string) => {
    const mha = getMHACode(zip);
    return { monthlyBAH: payBahRate(zip, 'E-5', true), locationName: getLocationDisplayName(zip) ?? zip, bahFound: !!mha, mha };
  };
  const r = compareLocations({ payGrade: 'E-5', yearsOfService: 8, hasDependents: true, zipA: '28310', zipB: '92134', bahA: at('28310'), bahB: at('92134') });
  if (!r || r.verdict !== 'B_better') throw new Error('calculatorSummaries: compare example must favor San Diego');
  return {
    lead: 'an E-5 with 8 years of service and dependents moving from Fort Bragg (ZIP 28310) to San Diego (ZIP 92134)',
    figure: usd(nonZero(Math.abs(r.afterTaxDiffMonthly), 'compare')),
    tail: ' more per month in San Diego, after estimated federal income tax',
    href: href('compare'),
  };
}

function deploymentExample(): CalculatorSummaryExample {
  const r = calculateDeployment({
    payGrade: 'E-5',
    yearsOfService: 8,
    hasDependents: true,
    filingStatus: defaultDeploymentFilingStatus(true),
    zipCode: '28310',
    monthlyBAH: payBahRate('28310', 'E-5', true),
    bahFound: true,
    deploymentMonths: 9,
    isCombatZone: true,
    receivingIDP: true,
    hdpLevel: 0,
    hasFSA: true,
    tspContributionPct: 0,
    usingSDP: false,
    sdpDeposit: 10000,
  });
  return {
    lead: 'an E-5 with 8 years of service and dependents on a 9-month combat zone deployment with Imminent Danger Pay and FSA',
    figure: usd(nonZero(r.tour.totalTourBenefit, 'deployment')),
    tail: ' in added pay and tax savings over the tour',
    href: href('deployment'),
  };
}

function dualMilitaryExample(): CalculatorSummaryExample {
  const total = bahRate('28310', 'E-5', true) + bahRate('28310', 'E-5', false);
  return {
    lead: 'two E-5s at Fort Bragg with a child, one claiming the child',
    figure: `${usd(nonZero(total, 'dual-military-bah'))}/month`,
    tail: ' in combined household BAH',
    href: href('dual-military-bah'),
  };
}

function transitionExample(): CalculatorSummaryExample {
  // The link's salary and expenses (results show only once both are entered); calculator
  // defaults for every setting it leaves out. The salary needed doesn't depend on either.
  const zip = '78234';
  const r = calculateTransitionReadiness(
    {
      payGrade: 'E-6',
      yearsOfService: 10,
      zipCode: zip,
      hasDependents: true,
      separationMonths: 14,
      retirementSystem: 'legacy',
      targetCivilianSalary: 75000,
      spouseIncome: 0,
      vaRating: 30,
      crscEligible: false,
      retirementState: null,
      stateTaxRate: DEFAULT_STATE_TAX_RATE,
      filingStatus: defaultFilingStatus(0, true),
      healthcareAssumption: 'employer',
      expenseMode: 'quick',
      totalMonthlyExpenses: 4200,
      expenseHousing: 0,
      expenseCar: 0,
      expenseInsurance: 0,
      expenseGroceries: 0,
      expenseDebt: 0,
      expenseChildcare: 0,
      expenseUtilities: 0,
      expenseOther: 0,
      emergencyFund: 25000,
      tspBalance: 45000,
      otherSavings: 0,
    },
    payBahRate(zip, 'E-6', true),
  );
  return {
    lead: 'an E-6 with 10 years of service and dependents at JBSA (ZIP 78234)',
    figure: `${usd(nonZero(r.grossedUpCivilianSalary, 'transition-readiness'))}/year`,
    tail: ' civilian salary to match military take-home pay',
    href: href('transition-readiness'),
  };
}

function healthcareExample(): CalculatorSummaryExample {
  const r = calculateHealthcare('married-2-children', 'employer', 'silver', '50plus');
  return {
    lead: 'a married member with two children moving to an average employer silver plan',
    figure: `${usd(nonZero(r.annualPremium + r.estimatedDeductibleUsage, 'healthcare-comparison'))}/year`,
    tail: ' in premiums and estimated deductible costs',
    href: href('healthcare-comparison'),
  };
}

function vaLoanExample(): CalculatorSummaryExample {
  const rate = getFundingFeeRate(true, 0);
  return {
    lead: 'a $350,000 home, first use of the VA loan, no down payment',
    figure: usd(nonZero(fundingFeeAmount(350000, rate), 'va-loan')),
    tail: ` VA funding fee (${pct2(rate)} of the loan)`,
    href: href('va-loan'),
  };
}

function vaRefinanceExample(): CalculatorSummaryExample {
  const rate = getRefinanceFundingFeeRate('irrrl', true);
  return {
    lead: 'an IRRRL (streamline refinance) on a $300,000 balance',
    figure: usd(nonZero(fundingFeeAmount(300000, rate), 'va-refinance')),
    tail: ` VA funding fee (${pct2(rate)} of the balance)`,
    href: href('va-refinance'),
  };
}

// ── Block content ─────────────────────────────────────────────────────────────

const SUMMARIES: Record<SummaryKey, Omit<CalculatorSummaryData, 'key' | 'example'> & { example: (() => CalculatorSummaryExample) | null }> = {
  'total-compensation': {
    what: 'Adds up your monthly military pay (base pay, BAH and BAS), then the TSP match, the tax value of BAH and BAS (both excluded from federal taxable income), and the civilian salary it would take to match it.',
    inputs: 'pay grade, years of service, duty station ZIP, dependents, retirement system, TSP contribution, government housing or meal card',
    example: totalCompExample,
    basis: 'Built on official DFAS pay tables and DTMO BAH rates.',
  },
  bah: {
    what: `Looks up the ${BAH_YEAR} Basic Allowance for Housing for any U.S. ZIP code by pay grade and dependency status.`,
    inputs: 'duty station ZIP, pay grade, dependents (a second ZIP to compare)',
    example: bahExample,
    basis: 'Built on official DTMO BAH rates.',
  },
  'va-disability': {
    what: 'Combines VA disability ratings with the whole-person formula (38 CFR § 4.25), applies the bilateral factor, and shows the monthly compensation for the combined rating.',
    inputs: 'each rating and its body location, spouse (and Aid and Attendance), children, dependent parents',
    example: vaDisabilityExample,
    basis: 'Built on official VA compensation rates.',
  },
  tsp: {
    what: 'Projects your Thrift Savings Plan balance at retirement from your contributions, the BRS government match and your fund mix.',
    inputs: 'current and retirement age, pay grade, years of service, current balance, contribution, retirement system, Roth or Traditional, fund mix',
    example: tspExample,
    basis: 'Built on official DFAS pay tables and TSP contribution rules.',
  },
  retirement: {
    what: 'Estimates your military retired pay under BRS or High-3, with the TSP balance and lifetime value that go with it.',
    inputs: 'retirement system, current and retirement pay grade, years of service, TSP contribution and balance, expected return, VA rating',
    example: retirementExample,
    basis: 'Built on official DFAS pay tables.',
  },
  pcs: {
    what: 'Estimates the government’s PCS move payments (DLA, MALT mileage, per diem and TLE) for your rank and family, and explains how a PPM incentive is set.',
    inputs: 'pay grade, dependents and their ages, move type, old and new duty station or miles, vehicles, household goods weight, TLE days',
    example: pcsExample,
    basis: 'Built on official JTR rules, DTMO DLA rates and GSA per diem rates.',
  },
  'guard-reserve': {
    what: 'Estimates a drilling Guard or Reserve member’s yearly pay from drill periods, Annual Training and extra active-duty days.',
    inputs: 'pay grade, years of service, drill weekends and periods, Annual Training and extra active-duty days, TRICARE Reserve Select plan, BRS and TSP contribution',
    example: guardReserveExample,
    basis: 'Built on official DFAS pay tables.',
  },
  education: {
    what: 'Compares the Post-9/11 GI Bill, Montgomery GI Bill, VR&E and Tuition Assistance for your school, including the GI Bill monthly housing allowance.',
    inputs: 'service status, GI Bill service length, VA rating, school type and ZIP, tuition, program length, enrollment',
    example: educationExample,
    basis: 'Built on official VA education rates and DTMO BAH data.',
  },
  cola: {
    what: `Checks whether a duty station is on DTMO’s ${COLA_YEAR} CONUS COLA list and shows its official COLA index.`,
    inputs: 'duty station ZIP',
    example: colaExample,
    basis: 'Built on DTMO’s official CONUS COLA list.',
  },
  compare: {
    what: 'Compares pay at two duty stations side by side: base pay, BAH, BAS and estimated pay after income tax.',
    inputs: 'current and new station ZIP, pay grade, years of service, dependents, state of legal residence (optional)',
    example: compareExample,
    basis: 'Built on official DFAS pay tables and DTMO BAH rates.',
  },
  deployment: {
    what: 'Estimates how a deployment changes your pay: Hostile Fire or Imminent Danger Pay, Hardship Duty Pay, FSA, the combat zone tax exclusion and Savings Deposit Program interest.',
    inputs: 'pay grade, years of service, home station ZIP, dependents, deployment length, combat zone, IDP, Hardship Duty Pay, TSP contribution, SDP deposit',
    example: deploymentExample,
    basis: 'Built on official DFAS pay tables, DoD special pay rates and DTMO BAH rates.',
  },
  'dual-military-bah': {
    what: 'Shows what two married service members draw in BAH and which one claiming the dependents gives the higher household total.',
    inputs: 'both members’ pay grades, duty station ZIP (or one for each member), dependents, which member claims them',
    example: dualMilitaryExample,
    basis: 'Built on official DTMO BAH rates.',
  },
  'transition-readiness': {
    what: 'Compares your military take-home pay with civilian pay after taxes and benefits, and checks your savings runway for leaving the service.',
    inputs: 'pay grade, years of service, duty station ZIP, dependents, separation date, retirement system, civilian salary, spouse income, VA rating, state, expenses, savings',
    example: transitionExample,
    basis: 'Built on official DFAS pay tables, DTMO BAH rates and VA compensation rates.',
  },
  'separation-timeline': {
    what: 'Builds a dated timeline of the benefits that stop, convert or expire after you leave the military, such as SGLI to VGLI, TAMP and VA claim windows.',
    inputs: 'separation date, separating or retiring, TAMP eligibility, VA claim status',
    example: null,
    basis: 'Built on official VA, TRICARE and DoD timelines.',
  },
  'healthcare-comparison': {
    what: 'Compares healthcare costs after service (employer plans, the ACA marketplace, VA care, TRICARE Reserve Select, retiree TRICARE and TAMP) with active-duty TRICARE.',
    inputs: 'family size, coverage after service, plan tier, VA rating, retiree TRICARE plan and group, TAMP eligibility',
    example: healthcareExample,
    basis: 'Built on TRICARE.mil fees and published cost averages (KFF employer survey, Healthcare.gov).',
  },
  'va-loan': {
    what: 'Estimates a VA loan’s monthly payment, the VA funding fee or exemption, and how the payment compares with your BAH.',
    inputs: 'home price, down payment, interest rate, term, property tax, insurance, first or later use, funding fee exemption, BAH comparison (optional)',
    example: vaLoanExample,
    basis: 'Built on VA’s official funding fee table.',
  },
  'va-refinance': {
    what: 'Estimates a VA IRRRL or cash-out refinance: the monthly payment change, the months to recover closing costs (VA’s method), the cost over the full term, VA’s rate and 36-month recoupment checks, and the earliest closing date.',
    inputs: 'refinance type, current balance, rate and years left, new rate and term, cash out, closing costs, lender credits, funding fee status, first use, first payment due date',
    example: vaRefinanceExample,
    basis: 'Built on VA’s official funding fee table.',
  },
};

export const NO_ACCOUNT_LINE = 'No account, no personal information.';

export function getCalculatorSummary(key: SummaryKey): CalculatorSummaryData {
  const s = SUMMARIES[key];
  return { key, what: s.what, inputs: s.inputs, example: s.example ? s.example() : null, basis: s.basis };
}

export const SUMMARY_KEYS = Object.keys(SUMMARIES) as SummaryKey[];

/** Page path for a summary key (from the shared URL-parameter list). */
export function summaryPath(key: SummaryKey): string {
  return CALCULATOR_URL_PARAMS[key].path;
}
