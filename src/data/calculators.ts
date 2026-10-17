// Calculator registry — rendered by /calculators and read by the v2 OCONUS
// station template (src/components/oconus/OconusStationPage.tsx), which shows
// only entries flagged supportsOconus.

export interface CalculatorDetail {
  href: string;
  icon: string;
  name: string;
  description: string;
  features: string[];
  /** Inputs/outputs accept an overseas (OCONUS) duty station. Gates v2 OCONUS station CTAs. Default false — Dan confirms each true. */
  supportsOconus: boolean;
  group: 'active-duty' | 'guard-reserve' | 'veteran' | 'va-loans' | 'education' | 'allowances' | 'reference';
}

export const CALCULATORS: CalculatorDetail[] = [
  {
    href: '/calculators/total-compensation',
    icon: '💰',
    name: 'Total Military Compensation Calculator',
    description:
      'See your complete military pay package — not just base pay. Includes BAH by ZIP code, BAS, tax advantage breakdown, BRS matching, and civilian salary equivalent.',
    features: [
      'All ranks E-1 through O-10',
      '40,959 ZIP codes',
      'Tax-free allowance calculation',
      'Civilian equivalent salary',
    ],
    group: 'active-duty',
    supportsOconus: false,
  },
  {
    href: '/bah',
    icon: '🏠',
    name: 'BAH Calculator',
    description:
      'Look up your 2026 Basic Allowance for Housing by duty station ZIP code, pay grade, and dependency status. Compare two locations side by side for PCS planning.',
    features: [
      'All 40,959 U.S. ZIP codes',
      '338 military housing areas',
      'PCS comparison mode',
      'With and without dependents',
    ],
    group: 'active-duty',
    supportsOconus: false,
  },
  {
    href: '/calculators/va-loan',
    icon: '🏡',
    name: 'VA Loan Payment Calculator',
    description:
      'Estimate your monthly VA loan payment, funding fee, and BAH comparison. Shows the funding fee waiver for disability-rated veterans and compares your estimated PITI against your BAH.',
    features: [
      'Monthly PITI estimate',
      'Funding fee or disability waiver calculation',
      'BAH coverage comparison',
      'First vs. subsequent use rates',
    ],
    group: 'va-loans',
    supportsOconus: false,
  },
  {
    href: '/calculators/va-refinance',
    icon: '🔄',
    name: 'VA Refinance Calculator',
    description:
      'Calculate IRRRL (VA Streamline) and cash-out refinance savings, break-even timeline, and VA net tangible benefit check. See whether a rate reduction pays off before your next PCS.',
    features: [
      'IRRRL and cash-out refinance',
      'Monthly savings and break-even',
      'VA net tangible benefit check',
      '0.50% IRRRL funding fee calculation',
    ],
    group: 'va-loans',
    supportsOconus: false,
  },
  {
    href: '/calculators/va-disability',
    icon: '🎖️',
    name: 'VA Disability Combined Rating Calculator',
    description:
      'Calculate your combined VA disability rating using the official whole-person formula. See every step of the math, including bilateral factor, and estimate your monthly compensation.',
    features: [
      'Step-by-step math breakdown',
      'Automatic bilateral factor',
      '2026 compensation rates',
      'Scenario builder for additional conditions',
    ],
    group: 'veteran',
    supportsOconus: false,
  },
  {
    href: '/calculators/tsp',
    icon: '📈',
    name: 'TSP Growth Projector',
    description:
      'Project your Thrift Savings Plan balance at retirement with BRS matching, fund allocation across G/F/C/S/I funds, and Roth vs Traditional comparison.',
    features: [
      'BRS matching calculator',
      '5 TSP fund allocations',
      'Roth vs Traditional comparison',
      'Retirement income estimate',
    ],
    group: 'active-duty',
    supportsOconus: false,
  },
  {
    href: '/calculators/retirement',
    icon: '🎖️',
    name: 'Military Retirement Calculator',
    description:
      'Estimate your pension under High-3 or BRS using 2026 pay tables. See lifetime pension value, TSP projection, CRDP eligibility, and the civilian salary you\'d need to replace it.',
    features: [
      'High-3 and BRS pension math',
      'Live TSP growth projection',
      'Lifetime value with COLA',
      'CRDP eligibility check',
    ],
    group: 'active-duty',
    supportsOconus: false,
  },
  {
    href: '/calculators/pcs',
    icon: '📦',
    name: 'PCS Cost Estimator',
    description:
      'Estimate total PCS entitlements — DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds. Compare government move vs. PPM to see the financial outcome of each option.',
    features: [
      'DLA by rank and dependency status',
      'MALT mileage + travel days',
      'PPM net proceeds after expenses and tax',
      'Government vs. PPM comparison',
    ],
    group: 'active-duty',
    supportsOconus: false,
  },
  {
    href: '/calculators/guard-reserve',
    icon: '⭐',
    name: 'Guard & Reserve Pay Calculator',
    description:
      'Estimate total annual Guard/Reserve compensation — drill pay (MUTA-4/6/8), Annual Training income, Tricare Reserve Select healthcare savings, and BRS government TSP matching.',
    features: [
      'MUTA-4, MUTA-6, MUTA-8 schedules',
      'AT and additional duty pay',
      'TRS vs. civilian insurance comparison',
      'BRS matching during active duty periods',
    ],
    group: 'guard-reserve',
    supportsOconus: false,
  },
  {
    href: '/calculators/education',
    icon: '🎓',
    name: 'Education Benefits Comparison Calculator',
    description:
      'Compare Post-9/11 GI Bill, VR&E (Chapter 31), Tuition Assistance, and Montgomery GI Bill side by side. See total program value by school ZIP code, tuition, and eligibility tier.',
    features: [
      'GI Bill MHA by school ZIP code',
      'VR&E no-cap tuition comparison',
      'TA vs. GI Bill sequencing strategy',
      'Total program value over 2 or 4 years',
    ],
    group: 'education',
    supportsOconus: false,
  },
  {
    href: '/calculators/separation-timeline',
    icon: '📅',
    name: 'Separation Benefits Timeline',
    description:
      'Enter your separation date and see exactly when each benefit stops, converts, or expires. TRICARE, SGLI, TAMP, BDD filing windows, and final move deadlines — all calculated from your specific date.',
    features: [
      'TRICARE & TAMP cutoff dates',
      'SGLI → VGLI conversion windows',
      'BDD pre-separation filing window',
      'Final move deadline (180 days or 3 years)',
    ],
    group: 'education',
    supportsOconus: false,
  },
  {
    href: '/calculators/healthcare-comparison',
    icon: '🏥',
    name: 'Healthcare Cost Comparison Calculator',
    description:
      'Active-duty TRICARE costs you nothing. Civilian healthcare can cost thousands per year. See exactly what that gap looks like — employer insurance, ACA Marketplace, VA healthcare, and TRICARE Reserve Select compared side by side.',
    features: [
      'Employer, ACA, VA, and TRS comparison',
      'ACA subsidy calculation by income & FPL',
      'TAMP 180-day bridge cost split',
      'First-year total cost estimate',
    ],
    group: 'education',
    supportsOconus: false,
  },
  {
    href: '/calculators/cola',
    icon: '📊',
    name: 'CONUS COLA Calculator',
    description:
      'Check if your duty station qualifies for Continental U.S. Cost of Living Allowance and see approximate monthly rates by pay grade. Covers approximately 18 qualifying high-cost locations.',
    features: [
      'ZIP code eligibility lookup',
      'Approximate rates by grade group',
      'High/moderate-high/moderate cost tiers',
      'DTMO official rate verification link',
    ],
    group: 'allowances',
    supportsOconus: false,
  },
  {
    href: '/calculators/deployment',
    icon: '🎖️',
    name: 'Deployment Pay Calculator',
    description:
      'Calculate your pay increase during deployment — HFP/IDP, Hardship Duty Pay, FSA, Combat Zone Tax Exclusion savings, and Savings Deposit Program interest. Before vs. during vs. tour total.',
    features: [
      'CZTE tax savings (enlisted & officer)',
      'SDP 10% annual return',
      'HFP/IDP + HDP + FSA modeling',
      'TSP combat zone contribution limit',
    ],
    group: 'active-duty',
    supportsOconus: false,
  },
  {
    href: '/pay',
    icon: '📋',
    name: '2026 Military Pay Charts',
    description:
      'Browse the complete 2026 DFAS pay tables for all ranks and years of service. Use the quick lookup to find your pay rate instantly, or scroll through enlisted, warrant officer, and officer tables.',
    features: [
      'All ranks E-1 through O-10',
      'Warrant officers W-1 through W-5',
      '3.8% raise applied (Jan 1, 2026)',
      'Monthly and annual toggle',
    ],
    group: 'reference',
    supportsOconus: false,
  },
  {
    href: '/calculators/dual-military-bah',
    icon: '👫',
    name: 'Dual Military BAH Calculator',
    description:
      'Calculate total household BAH for dual active-duty couples. Find the optimal dependent-claiming configuration, compare same-station and different-station scenarios, and see the exact dollar difference between options.',
    features: [
      'Optimal dependent-claiming finder',
      'Same-station and different-station modes',
      'Step-by-step math breakdown',
      'All 40,959 ZIP codes · 2026 DTMO data',
    ],
    group: 'allowances',
    supportsOconus: false,
  },
  {
    href: '/calculators/compare',
    icon: '⚖️',
    name: 'Compare Your PCS Move',
    description:
      'Compare total compensation between your current and new duty station side by side. Shows BAH difference, CONUS COLA eligibility, estimated state income tax, and real take-home pay at each location — the financial answer to "Should I take these orders?"',
    features: [
      'Side-by-side BAH comparison by ZIP code',
      'State income tax impact (9 no-tax states)',
      'CONUS COLA eligibility for both stations',
      'Estimated monthly and annual take-home difference',
    ],
    group: 'allowances',
    supportsOconus: false,
  },
];
