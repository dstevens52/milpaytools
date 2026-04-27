import type { Metadata } from 'next';
import Link from 'next/link';
import { PayChartsClient } from '@/components/calculators/pay-charts/PayChartsClient';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: '2026 Military Pay Charts | MilPayTools',
  description:
    'Official 2026 military pay tables for all ranks E-1 through O-10 and warrant officers. 3.8% pay raise effective January 1, 2026. Monthly basic pay by grade and years of service.',
  alternates: {
    canonical: '/calculators/pay-charts',
  },
};

export default function PayChartsPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: '2026 Military Pay Charts', description: 'Official 2026 military pay tables for all ranks E-1 through O-10 and warrant officers. 3.8% pay raise effective January 1, 2026. Monthly basic pay by grade and years of service.', url: '/calculators/pay-charts' })} />
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">$</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                2026 Military Pay Charts
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Official basic pay rates for all ranks and years of service, effective January 1,
                2026. Use the quick lookup to find your rate instantly, or scroll to browse the full
                tables.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: '📊', text: 'All ranks E-1 through O-10' },
              { icon: '⭐', text: 'Warrant officers W-1 through W-5' },
              { icon: '📈', text: '3.8% raise applied' },
              { icon: '✓', text: 'Official DFAS data' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                <span>{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive tables ─────────────────────────────────────────── */}
      <PayChartsClient />

      {/* ── Key Facts ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Key facts about military basic pay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">2026 pay raise</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The 3.8% pay raise was authorized by the FY2026 National Defense Authorization Act,
                signed December 18, 2025. It applies to all active-duty service members and most
                reserve component members in a pay status.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">Same across all branches</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Basic pay rates are identical regardless of branch — Army, Navy, Air Force, Marine
                Corps, Coast Guard, and Space Force all use the same DFAS pay tables.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">Basic pay is taxable</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Basic pay is subject to federal income tax. Your housing allowance (BAH) and food
                allowance (BAS) are completely tax-free — which significantly increases the real
                value of your compensation.{' '}
                <Link href="/blog/military-tax-advantages" className="text-blue-700 underline hover:text-blue-800 text-xs">
                  Learn about military tax advantages →
                </Link>
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">Longevity increases</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Pay increases with both promotion (moving up in grade) and time in service
                (longevity steps). Senior NCOs and officers typically see the largest longevity
                increases between years 16–26 of service.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">Senior officer cap</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                General and flag officers (O-7 through O-10) are capped at Executive Schedule Level
                II. In 2026, O-9 and O-10 pay is capped at $20,058.13/month regardless of years of
                service.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">Verify on your LES</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                These tables show base pay only. Your actual take-home pay on your Leave and
                Earnings Statement (LES) via myPay will reflect deductions (taxes, SGLI, TSP
                contributions) and additional allowances.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-sm font-semibold text-zinc-800 mb-3">
            Basic pay is the starting point — your total compensation is significantly higher
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed mb-3">
            Most service members receive BAH (Basic Allowance for Housing) and BAS (Basic
            Allowance for Subsistence) on top of basic pay — and both are completely tax-free. An
            E-5 with dependents in a mid-cost duty station receives roughly $3,000–$4,000/month in
            tax-free allowances on top of their basic pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculators/total-compensation"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Calculate my total compensation →
            </Link>
            <Link
              href="/calculators/bah"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Look up BAH for my duty station →
            </Link>
          </div>
        </div>

        <Disclaimer
          dataYear="2026"
          className="text-xs"
        />

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <strong>Pay rates shown</strong> are monthly basic pay from the 2026 DFAS pay tables,
            effective January 1, 2026 (3.8% increase). Basic pay is taxable income and does not
            include allowances (BAH, BAS), special pays, or bonuses. Actual take-home pay varies
            based on duty station, dependency status, tax withholding, and deductions. Verify your
            pay on your Leave and Earnings Statement (LES) via{' '}
            <a
              href="https://mypay.dfas.mil"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              myPay
            </a>
            . Source:{' '}
            <a
              href="https://militarypay.defense.gov/Pay/Military-Pay-Charts/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              DFAS Military Pay Charts
            </a>
            .
          </p>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
