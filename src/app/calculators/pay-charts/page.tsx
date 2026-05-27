import type { Metadata } from 'next';
import Link from 'next/link';
import { PayChartsClient } from '@/components/calculators/pay-charts/PayChartsClient';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema, faqPageSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: '2026 Military Pay Charts' },
  description:
    'Official 2026 military pay tables for all ranks E-1 through O-10 and warrant officers. 3.8% pay raise effective January 1, 2026. Monthly basic pay by grade and years of service.',
  alternates: {
    canonical: '/calculators/pay-charts',
  },
  openGraph: {
    title: '2026 Military Pay Charts',
    description:
      'Official 2026 military pay tables for all ranks E-1 through O-10 and warrant officers. 3.8% pay raise effective January 1, 2026. Monthly basic pay by grade and years of service.',
    type: 'website',
    url: '/calculators/pay-charts',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=2026+Military+Pay+Charts&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 Military Pay Charts',
    description:
      'Official 2026 military pay tables for all ranks E-1 through O-10 and warrant officers. 3.8% pay raise effective January 1, 2026. Monthly basic pay by grade and years of service.',
    images: ['/api/og?type=calculator&title=2026+Military+Pay+Charts&v=2'],
  },
};

export default function PayChartsPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: '2026 Military Pay Charts', description: 'Official 2026 military pay tables for all ranks E-1 through O-10 and warrant officers. 3.8% pay raise effective January 1, 2026. Monthly basic pay by grade and years of service.', url: '/calculators/pay-charts' })} />
      <JsonLdScript schema={faqPageSchema([
        { question: 'What is the 2026 military pay raise?', answer: 'The 2026 military pay raise is 3.8%, effective January 1, 2026. It was authorized by the FY2026 National Defense Authorization Act, signed December 18, 2025.' },
        { question: 'Is military basic pay taxable?', answer: 'Yes. Military basic pay is subject to federal income tax and generally state income tax. Allowances such as BAH and BAS are excluded from federal taxable income.' },
        { question: 'Is BAH included in basic pay?', answer: 'No. BAH (Basic Allowance for Housing) is a separate allowance paid in addition to basic pay. It is excluded from federal taxable income.' },
        { question: 'Are military pay charts the same for all branches?', answer: 'Yes. Basic pay rates are identical across Army, Navy, Air Force, Marine Corps, Space Force, and Coast Guard. All branches use the same DFAS pay tables.' },
        { question: 'What does "over 6 years" mean on the pay chart?', answer: '"Over 6 years" means more than 6 completed years of creditable military service. The pay table uses "over X" brackets — select your completed years to find your rate.' },
        { question: 'What is O-1E, O-2E, or O-3E?', answer: 'O-1E, O-2E, and O-3E are commissioned officer grades (O-1 through O-3) with prior enlisted service. These officers receive higher base pay than officers without prior enlisted experience.' },
      ])} />
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            2026 Military Pay Charts
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Official 2026 basic pay rates for all ranks and years of service — look up your rate or browse the full tables.
          </p>
        </div>
      </section>

      {/* ── Interactive tables ─────────────────────────────────────────── */}
      <PayChartsClient />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
      </div>

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
                allowance (BAS) are excluded from federal taxable income — which significantly increases the real
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
                II. In 2026, O-9 and O-10 pay is capped at $18,999.90/month regardless of years of
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
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-zinc-800 mb-1.5">How &ldquo;over X years&rdquo; works</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Pay tables use &ldquo;over X years&rdquo; service brackets. For example, &ldquo;over 6&rdquo; means more than
                6 completed years of creditable service. Select your completed years in the Quick
                Lookup to find the correct column.
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
            Allowance for Subsistence) on top of basic pay — both are excluded from federal taxable income. An
            E-5 with dependents in a mid-cost duty station receives roughly $3,000–$4,000/month in
            allowances on top of their basic pay.
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

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900">Frequently asked questions</h2>
          {[
            {
              q: 'What is the 2026 military pay raise?',
              a: 'The 2026 pay raise is 3.8%, effective January 1, 2026, authorized by the FY2026 National Defense Authorization Act.',
            },
            {
              q: 'Is military basic pay taxable?',
              a: 'Yes. Basic pay is subject to federal income tax and generally state income tax. Allowances such as BAH and BAS are excluded from federal taxable income.',
            },
            {
              q: 'Is BAH included in basic pay?',
              a: 'No. BAH (Basic Allowance for Housing) is a separate allowance paid in addition to basic pay and is excluded from federal taxable income.',
            },
            {
              q: 'Are pay charts the same for all branches?',
              a: 'Yes. Basic pay is identical across Army, Navy, Air Force, Marine Corps, Space Force, and Coast Guard — all branches use the same DFAS pay tables.',
            },
            {
              q: 'What does "over 6 years" mean on the pay chart?',
              a: 'Pay tables use "over X years" service brackets. "Over 6" means more than 6 completed years of creditable service. Select your completed years in the Quick Lookup.',
            },
            {
              q: 'What is O-1E, O-2E, or O-3E?',
              a: 'These are commissioned officers (O-1 through O-3) with prior enlisted service. They receive higher base pay than officers without prior enlisted experience.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-zinc-900 mb-1">{q}</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{a}</p>
            </div>
          ))}
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
