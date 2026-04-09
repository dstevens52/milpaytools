import type { Metadata } from 'next';
import { EducationCalculator } from '@/components/calculators/education/EducationCalculator';

export const metadata: Metadata = {
  title: 'Military Education Benefits Comparison Calculator — 2026 | MilPayTools',
  description:
    'Compare Post-9/11 GI Bill, VR&E (Chapter 31), Tuition Assistance, and Montgomery GI Bill side by side. See total program value by ZIP code, school type, and eligibility.',
  alternates: { canonical: 'https://milpaytools.com/calculators/education' },
};

export default function EducationCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Education &amp; Transition
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            Education Benefits Comparison
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl">
            See the total dollar value of Post-9/11 GI Bill, VR&amp;E, Tuition Assistance, and
            Montgomery GI Bill side by side — and find out which benefit is worth the most for your
            specific school, location, and situation.
          </p>
        </div>
      </div>

      <EducationCalculator />

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

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Data Sources</h2>
          <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
            <ul className="space-y-1.5 text-sm text-zinc-500">
              <li>· Post-9/11 GI Bill rates: VA.gov, 2026–2027 academic year (effective Aug 1, 2026)</li>
              <li>· VR&amp;E policies: VA.gov Chapter 31 program guidance</li>
              <li>· Tuition Assistance: DoD Voluntary Education policy (DoDI 1322.25)</li>
              <li>· Montgomery GI Bill: VA.gov Chapter 30, 2025–2026 rates</li>
              <li>· MHA/BAH rates: DTMO 2026 BAH data (all 40,959 U.S. ZIP codes)</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
