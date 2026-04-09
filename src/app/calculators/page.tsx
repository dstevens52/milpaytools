import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Military Financial Calculators — 2026 | MilPayTools',
  description:
    'Free military pay calculators using official 2026 DoD, VA, and DTMO data. Total compensation, BAH, VA disability rating, and TSP growth — no account required.',
};

interface CalculatorDetail {
  href: string;
  icon: string;
  name: string;
  description: string;
  features: string[];
  group: 'active-duty' | 'guard-reserve' | 'veteran';
}

const CALCULATORS: CalculatorDetail[] = [
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
  },
  {
    href: '/calculators/bah',
    icon: '🏠',
    name: 'BAH Calculator',
    description:
      'Look up your 2026 Basic Allowance for Housing by duty station ZIP code, pay grade, and dependency status. Compare two locations side by side for PCS planning.',
    features: [
      'All 40,959 U.S. ZIP codes',
      '299 military housing areas',
      'PCS comparison mode',
      'With and without dependents',
    ],
    group: 'active-duty',
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
  },
  {
    href: '/calculators/pcs',
    icon: '📦',
    name: 'PCS Cost Estimator',
    description:
      'Estimate total PCS entitlements — DLA, MALT mileage, per diem, TLE, and PPM/DITY profit potential. Compare government move vs. self-move to see which puts more money in your pocket.',
    features: [
      'DLA by rank and dependency status',
      'MALT mileage + travel days',
      'PPM profit after expenses and tax',
      'Government vs. PPM comparison',
    ],
    group: 'active-duty',
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
  },
];

export default function CalculatorsPage() {
  const activeDuty = CALCULATORS.filter((c) => c.group === 'active-duty');
  const guardReserve = CALCULATORS.filter((c) => c.group === 'guard-reserve');
  const veteran = CALCULATORS.filter((c) => c.group === 'veteran');

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Free · Official 2026 data
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            Military Financial Calculators
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl">
            Free tools using official DoD, VA, and DTMO data. No account required. All calculations
            run in your browser.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Active duty tools */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Active Duty &amp; Guard/Reserve
          </h2>
          <div className="space-y-4">
            {activeDuty.map((calc) => (
              <CalculatorHubCard key={calc.href} {...calc} />
            ))}
          </div>
        </section>

        {/* Guard & Reserve tools */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Guard &amp; Reserve
          </h2>
          <div className="space-y-4">
            {guardReserve.map((calc) => (
              <CalculatorHubCard key={calc.href} {...calc} />
            ))}
          </div>
        </section>

        {/* Veteran tools */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Veterans
          </h2>
          <div className="space-y-4">
            {veteran.map((calc) => (
              <CalculatorHubCard key={calc.href} {...calc} />
            ))}
          </div>
        </section>

        {/* Data sources note */}
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-5">
          <p className="text-sm font-semibold text-zinc-800 mb-2">Data sources</p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            All calculators use official 2026 rate data: DFAS military pay tables, DTMO BAH rates,
            VA disability compensation rates (effective December 1, 2025, 2.8% COLA), and IRS/TSP
            contribution limits. Rates update annually — data year is always displayed on each
            calculator.
          </p>
        </div>
      </div>
    </div>
  );
}

function CalculatorHubCard({ href, icon, name, description, features }: CalculatorDetail) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 hover:border-zinc-300 hover:shadow-sm transition-all duration-150">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <span className="text-3xl flex-none">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-zinc-900 text-lg mb-2">{name}</h3>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">{description}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
          >
            Use this calculator →
          </Link>
        </div>
      </div>
    </div>
  );
}
