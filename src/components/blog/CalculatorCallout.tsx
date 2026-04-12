interface CalculatorCalloutProps {
  calculator: 'total-compensation' | 'bah' | 'va-disability' | 'tsp' | 'retirement' | 'pcs' | 'cola' | 'compare' | 'deployment' | 'pay-charts' | 'guard-reserve' | 'education';
  text?: string;
}

const CALCULATOR_CONFIG = {
  'total-compensation': {
    href: '/calculators/total-compensation',
    label: 'Total Compensation Calculator',
    defaultText: 'See your exact total military compensation — base pay, BAH, BAS, TSP match, and the civilian salary equivalent.',
  },
  bah: {
    href: '/calculators/bah',
    label: 'BAH Calculator',
    defaultText: 'Look up BAH for any ZIP code in the country — all 40,959 ZIP codes with official 2026 DTMO data.',
  },
  'va-disability': {
    href: '/calculators/va-disability',
    label: 'VA Disability Rating Calculator',
    defaultText: 'Calculate your combined VA disability rating using the official whole-person formula. Shows every step of the math.',
  },
  tsp: {
    href: '/calculators/tsp',
    label: 'TSP Growth Projector',
    defaultText: 'Project your TSP balance at retirement with BRS matching, fund allocation, and a Roth vs. Traditional comparison.',
  },
  retirement: {
    href: '/calculators/retirement',
    label: 'Military Retirement Calculator',
    defaultText: 'Estimate your pension under High-3 or BRS using 2026 pay tables — with lifetime value, TSP projection, and CRDP eligibility.',
  },
  pcs: {
    href: '/calculators/pcs',
    label: 'PCS Cost Estimator',
    defaultText: 'Estimate your total PCS entitlements — DLA, mileage (MALT), per diem, TLE, and PPM/DITY profit potential. Uses 2026 DTMO rates.',
  },
  cola: {
    href: '/calculators/cola',
    label: 'CONUS COLA Calculator',
    defaultText: 'Check whether your duty station qualifies for CONUS COLA and see approximate monthly rates by pay grade and dependency status.',
  },
  compare: {
    href: '/calculators/compare',
    label: 'Duty Station Comparison Calculator',
    defaultText: 'Compare BAH, CONUS COLA eligibility, state income tax, and estimated take-home pay between two duty stations side by side.',
  },
  deployment: {
    href: '/calculators/deployment',
    label: 'Deployment Pay Calculator',
    defaultText: 'See your deployment pay increase — HFP/IDP, CZTE tax savings, Hardship Duty Pay, FSA, and SDP interest. Before vs. during vs. tour total.',
  },
  'pay-charts': {
    href: '/calculators/pay-charts',
    label: '2026 Military Pay Charts',
    defaultText: 'Browse the complete 2026 DFAS pay tables for all ranks — E-1 through O-10 and warrant officers — with quick lookup by grade and years of service.',
  },
  'guard-reserve': {
    href: '/calculators/guard-reserve',
    label: 'Guard & Reserve Pay Calculator',
    defaultText: 'Calculate total annual Guard/Reserve compensation — drill pay, Annual Training, TRICARE Reserve Select savings, and BRS TSP matching.',
  },
  education: {
    href: '/calculators/education',
    label: 'Education Benefits Calculator',
    defaultText: 'Compare Post-9/11 GI Bill, VR&E Chapter 31, and Tuition Assistance — see total benefit value, monthly housing allowance by school ZIP code, and the optimal sequencing strategy.',
  },
};

export function CalculatorCallout({ calculator, text }: CalculatorCalloutProps) {
  const config = CALCULATOR_CONFIG[calculator];
  const description = text ?? config.defaultText;

  return (
    <div className="my-8 rounded-lg border border-red-200 bg-red-50 p-5 not-prose">
      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
        Free Calculator
      </p>
      <p className="text-base font-semibold text-zinc-900 mb-1">{config.label}</p>
      <p className="text-sm text-zinc-600 mb-3">{description}</p>
      <a
        href={config.href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 transition-colors px-4 py-2 rounded-md"
      >
        Open Calculator →
      </a>
    </div>
  );
}
