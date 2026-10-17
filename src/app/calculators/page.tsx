import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Link from 'next/link';
import { CALCULATORS, type CalculatorDetail } from '@/data/calculators';

const CALC_HUB_TITLE = 'Military Financial Calculators — 2026';
const CALC_HUB_DESC =
  'Free military pay calculators using official 2026 DoD, VA, and DTMO data. Total compensation, BAH, VA disability rating, and TSP growth — no account required.';
const CALC_HUB_IMAGE = ogImage({ type: 'calculator', title: 'Military Financial Calculators 2026', sub: 'Total compensation, BAH, VA disability, and TSP growth' });

export const metadata: Metadata = {
  title: { absolute: CALC_HUB_TITLE },
  description: CALC_HUB_DESC,
  alternates: { canonical: 'https://www.milpaytools.com/calculators' },
  openGraph: {
    title: CALC_HUB_TITLE,
    description: CALC_HUB_DESC,
    type: 'website',
    url: '/calculators',
    siteName: 'MilPayTools',
    images: CALC_HUB_IMAGE,
  },
  twitter: {
    card: 'summary_large_image',
    title: CALC_HUB_TITLE,
    description: CALC_HUB_DESC,
    images: CALC_HUB_IMAGE,
  },
};

export default function CalculatorsPage() {
  const activeDuty = CALCULATORS.filter((c) => c.group === 'active-duty');
  const guardReserve = CALCULATORS.filter((c) => c.group === 'guard-reserve');
  const allowances = CALCULATORS.filter((c) => c.group === 'allowances');
  const veteran = CALCULATORS.filter((c) => c.group === 'veteran');
  const vaLoans = CALCULATORS.filter((c) => c.group === 'va-loans');
  const education = CALCULATORS.filter((c) => c.group === 'education');
  const reference = CALCULATORS.filter((c) => c.group === 'reference');

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

        {/* Allowances & Entitlements tools */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Allowances &amp; Entitlements
          </h2>
          <div className="space-y-4">
            {allowances.map((calc) => (
              <CalculatorHubCard key={calc.href} {...calc} />
            ))}
          </div>
        </section>

        {/* VA Loans tools */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            VA Loans &amp; Homebuying
          </h2>
          <div className="space-y-4">
            {vaLoans.map((calc) => (
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

        {/* Education & Transition tools */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Education &amp; Transition
          </h2>
          <div className="space-y-4">
            {education.map((calc) => (
              <CalculatorHubCard key={calc.href} {...calc} />
            ))}
          </div>
        </section>

        {/* Reference tables */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
            Reference Tables
          </h2>
          <div className="space-y-4">
            {reference.map((calc) => (
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
