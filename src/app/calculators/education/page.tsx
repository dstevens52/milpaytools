import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { EducationCalculator } from '@/components/calculators/education/EducationCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { DataCurrencyBadge } from '@/components/calculators/shared/DataCurrencyBadge';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'Military Education Benefits Comparison Calculator — 2026 | MilPayTools' },
  description:
    'Compare Post-9/11 GI Bill, VR&E (Chapter 31), Tuition Assistance, and Montgomery GI Bill side by side. See total program value by ZIP code, school type, and eligibility.',
  alternates: { canonical: '/calculators/education' },
  openGraph: {
    title: 'Military Education Benefits Comparison Calculator — 2026 | MilPayTools',
    description:
      'Compare Post-9/11 GI Bill, VR&E (Chapter 31), Tuition Assistance, and Montgomery GI Bill side by side. See total program value by ZIP code, school type, and eligibility.',
    type: 'website',
    url: '/calculators/education',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=Education+Benefits+Comparison+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Military Education Benefits Comparison Calculator — 2026 | MilPayTools',
    description:
      'Compare Post-9/11 GI Bill, VR&E (Chapter 31), Tuition Assistance, and Montgomery GI Bill side by side. See total program value by ZIP code, school type, and eligibility.',
    images: ['/api/og?type=calculator&title=Education+Benefits+Comparison+2026&v=2'],
  },
};

export default function EducationCalculatorPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Military Education Benefits Comparison Calculator 2026', description: 'Compare Post-9/11 GI Bill, VR&E (Chapter 31), Tuition Assistance, and Montgomery GI Bill side by side. See total program value by ZIP code, school type, and eligibility.', url: '/calculators/education' })} />
    <div className="min-h-screen bg-zinc-50">
      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="hidden md:inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Education &amp; Transition
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            Education Benefits Comparison
          </h1>
          <p className="hidden md:block text-lg text-zinc-600 max-w-2xl">
            See the total dollar value of Post-9/11 GI Bill, VR&amp;E, Tuition Assistance, and
            Montgomery GI Bill side by side — and find out which benefit is worth the most for your
            specific school, location, and situation.
          </p>
          <div className="mt-3 hidden md:flex flex-wrap gap-3">
            {[
              'Post-9/11 GI Bill',
              'VR&E Chapter 31',
              'Tuition Assistance',
              'Montgomery GI Bill',
              '2026 VA MHA rates',
            ].map((text) => (
              <span
                key={text}
                className="inline-flex items-center text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                {text}
              </span>
            ))}
          </div>
          <div className="hidden md:block"><DataCurrencyBadge source="2026 VA MHA rates &bull; DFAS pay tables" /></div>
        </div>
      </div>

      {/* ── 3-step plan strip ────────────────────────────────────────── */}
      <div className="hidden md:block border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-5">
            {[
              { n: 1, title: 'Enter your service record and school ZIP' },
              { n: 2, title: 'Compare GI Bill, VR&E, and Tuition Assistance' },
              { n: 3, title: 'See your total education benefit value' },
            ].map(({ n, title }, i, arr) => (
              <>
                <div key={n} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs flex-none">
                    {n}
                  </div>
                  <p className="font-semibold text-zinc-700 text-sm whitespace-nowrap">{title}</p>
                </div>
                {i < arr.length - 1 && (
                  <svg key={`sep-${n}`} className="w-4 h-4 text-zinc-300 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </>
            ))}
          </div>
        </div>
      </div>

      <EducationCalculator />

      {/* Example Calculation */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            How Much Is the Post-9/11 GI Bill Worth at a San Diego University?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5 with 36+ months of qualifying active duty service (100% eligibility), attending UC San Diego or a comparable institution in San Diego, CA (ZIP 92093), full-time. California in-state tuition approximately $15,000/yr. Compared to Montgomery GI Bill (Chapter 30).
          </p>
          <ExampleTable>
            <ExampleRow label="Tuition &amp; fees covered (100% Post-9/11, in-state public)" value="~$15,000/yr" />
            <ExampleRow label="Monthly Housing Allowance — San Diego (CA-038, E-5 w/dep rate)" value="$3,975/mo" />
            <ExampleRow label="MHA × 9 academic months" value="$35,775/yr" />
            <ExampleRow label="Books &amp; supplies stipend" value="up to $1,000/yr" />
            <ExampleRow label="Post-9/11 GI Bill total annual value" value="~$51,775/yr" highlight />
            <ExampleRow label="Montgomery GI Bill (Ch. 30) — full-time monthly" value="$2,185/mo" />
            <ExampleRow label="MGIB annual value (9 months)" value="$19,665/yr" />
            <ExampleRow label="Post-9/11 advantage over MGIB" value="+$32,110/yr" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> In a high-cost city like San Diego, the Post-9/11 GI Bill is overwhelmingly the better choice — worth $32,110 more per year than the Montgomery GI Bill, primarily because the Monthly Housing Allowance ($3,975/month) is benchmarked to the local BAH rate. A student in San Diego on the Post-9/11 GI Bill can realistically cover both tuition and rent with their benefit alone.
          </p>
        </ExampleBox>
      </section>

      {/* Explainer content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 space-y-10">

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">How the Comparison Works</h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            This calculator estimates the total financial value of each education benefit over your
            full program, combining tuition coverage, monthly housing allowance, and books/supplies.
            Not all benefits are available to everyone — the calculator shows only the benefits you
            qualify for based on your service history and VA rating.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Post-9/11 GI Bill (Ch. 33)',
                body: 'The most widely used benefit. Covers in-state public tuition at 100% (or up to $30,908.34/year at private schools), plus a monthly housing allowance equal to E-5 with-dependents BAH at your school\'s ZIP code. Value varies enormously by location.',
              },
              {
                title: 'VR&E — Vocational Rehab (Ch. 31)',
                body: 'Often overlooked but potentially the most valuable: covers full tuition with no dollar cap, all required books and supplies, and the same housing allowance as GI Bill. Requires 10%+ VA rating and an employment barrier determination by a VR&E counselor.',
              },
              {
                title: 'Tuition Assistance (Active Duty)',
                body: 'Available to active duty members only. Covers $250/credit hour up to $4,500/year — less total value than GI Bill, but doesn\'t consume GI Bill months. The right strategy for most active duty members is TA now, GI Bill after separation.',
              },
              {
                title: 'Montgomery GI Bill (Ch. 30)',
                body: 'A fixed monthly payment ($2,185/month full-time) paid directly to you — you cover tuition from that amount. Better than Post-9/11 for online programs with low tuition, but usually less total value for in-person students where housing allowance adds up.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 bg-white p-4">
                <p className="font-semibold text-zinc-900 text-sm mb-2">{item.title}</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Why the ZIP Code Matters So Much</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            The GI Bill monthly housing allowance (MHA) is set equal to the E-5 with-dependents BAH
            at the school&apos;s ZIP code. This means two veterans attending the same program at
            different schools can receive vastly different MHA amounts — a school in San Diego might
            pay $3,900+/month while the same degree program in a rural area might pay $1,200/month.
            Over 36 months of enrollment, that gap is worth $96,000+ in housing allowance alone.
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed mt-3">
            If you&apos;re choosing between comparable schools, enter both ZIP codes separately and compare
            the resulting MHA. The housing allowance difference often exceeds the tuition difference.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">The Active Duty Strategy</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            For service members still on active duty, the optimal sequencing is almost always:
            use Tuition Assistance while serving, save GI Bill for after separation. Here&apos;s why:
          </p>
          <ul className="mt-3 space-y-2">
            {[
              'TA covers $4,500/year and resets annually — use it or lose it each fiscal year.',
              'GI Bill\'s main financial value is the housing allowance, which is not paid to active duty members (you already receive BAH).',
              'Every GI Bill month used on active duty is a month of MHA you\'ll never collect post-separation.',
              'A TA-first strategy can be worth $30,000–$60,000+ in GI Bill months preserved.',
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-1.5" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        <Disclaimer dataYear="2026" />

      </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/education-benefits" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Education Benefits Guide →</a>
          </div>
        </div>

    </div>
    </>
  );
}
