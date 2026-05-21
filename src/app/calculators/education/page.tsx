import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { EducationCalculator } from '@/components/calculators/education/EducationCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import { CalculatorFeedbackLink } from '@/components/CalculatorFeedbackLink';

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

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Education Benefits Comparison
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Compare the total dollar value of Post-9/11 GI Bill, VR&amp;E, Tuition Assistance, and Montgomery GI Bill for your specific school and situation.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your service record and school location' },
          { title: 'Compare GI Bill, VR&E, and Tuition Assistance' },
          { title: 'See your total education benefit value' },
        ]} />

      </section>

      <div className="min-h-screen bg-zinc-50">
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
              <ExampleRow label="Montgomery GI Bill (Ch. 30) — full-time monthly" value="$2,518/mo" />
              <ExampleRow label="MGIB annual value (9 months)" value="$22,662/yr" />
              <ExampleRow label="Post-9/11 advantage over MGIB" value="+$29,113/yr" highlight />
            </ExampleTable>
            <p className="text-sm leading-relaxed text-zinc-700">
              <strong>What this means:</strong> Under this scenario, Post-9/11 GI Bill has the higher estimated dollar value — primarily because the Monthly Housing Allowance ($3,975/month) is benchmarked to the local BAH rate. In this scenario, Post-9/11 benefits may cover in-state tuition and provide a substantial housing allowance, though actual rent, fees, enrollment level, and eligibility tier will affect the result.
            </p>
          </ExampleBox>
          <CalculatorFeedbackLink />
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
                  body: 'Often overlooked: covers full tuition with no dollar cap and all required books and supplies. VR&E participants may receive a subsistence allowance; some may elect the Post-9/11 subsistence rate if they have GI Bill entitlement. Requires 10%+ VA rating and employment barrier determination by a VR&E counselor.',
                },
                {
                  title: 'Tuition Assistance (Active Duty)',
                  body: 'Available to active duty members only. Covers $250/credit hour up to $4,500/year — does not consume GI Bill months. For many active-duty members, TA is worth comparing first because it does not use GI Bill months and active-duty GI Bill use generally does not include MHA.',
                },
                {
                  title: 'Montgomery GI Bill (Ch. 30)',
                  body: 'A fixed monthly payment ($2,518/month full-time) paid directly to you — you cover tuition from that amount. Better than Post-9/11 for online programs with low tuition, but usually less total value for in-person students where housing allowance adds up.',
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
              the resulting MHA. In some high-cost locations, the housing allowance difference can exceed the tuition difference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">Active Duty: TA vs. GI Bill</h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              For service members on active duty, TA and GI Bill have different rules worth comparing. Key factors:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                'TA covers $4,500/year and resets annually — use it or lose it each fiscal year.',
                'Post-9/11 GI Bill generally does not pay MHA to active-duty members — they already receive BAH separately.',
                'Every GI Bill month used on active duty is a month of MHA not collected post-separation.',
                'Using TA while on active duty may preserve GI Bill months that could include MHA post-separation — a difference that can be significant over a multi-year program.',
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-1.5" />
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5">
            <p className="font-semibold text-zinc-800 mb-2">What this calculator does not include</p>
            <ul className="space-y-1 text-sm text-zinc-500">
              <li className="flex gap-2"><span>•</span> Yellow Ribbon school-specific matching (may close the private school tuition gap)</li>
              <li className="flex gap-2"><span>•</span> GI Bill kicker / college fund</li>
              <li className="flex gap-2"><span>•</span> MGIB $600 buy-up option</li>
              <li className="flex gap-2"><span>•</span> Transferability service-obligation approval details</li>
              <li className="flex gap-2"><span>•</span> VR&amp;E counselor-approved plan specifics</li>
              <li className="flex gap-2"><span>•</span> School-specific fees not certified to VA</li>
              <li className="flex gap-2"><span>•</span> Break months or summer term differences</li>
              <li className="flex gap-2"><span>•</span> State tuition waivers or grants</li>
              <li className="flex gap-2"><span>•</span> Changes from individual VA eligibility determinations</li>
            </ul>
          </div>

          <Disclaimer dataYear="2026" />

        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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
