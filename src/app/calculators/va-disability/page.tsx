import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { VADisabilityCalculator } from '@/components/calculators/va-disability/VADisabilityCalculator';
import { DataCurrencyBadge } from '@/components/calculators/shared/DataCurrencyBadge';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'VA Disability Rating Calculator 2026 | Combined Rating | MilPayTools' },
  description:
    'Calculate your combined VA disability rating using the official "whole person" formula (38 CFR § 4.25). Includes bilateral factor, step-by-step math, and 2026 compensation rates.',
  alternates: {
    canonical: '/calculators/va-disability',
  },
  openGraph: {
    title: 'VA Disability Rating Calculator 2026 | Combined Rating | MilPayTools',
    description:
      'Calculate your combined VA disability rating using the official "whole person" formula (38 CFR § 4.25). Includes bilateral factor, step-by-step math, and 2026 compensation rates.',
    type: 'website',
    url: '/calculators/va-disability',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=VA+Disability+Rating+Calculator+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VA Disability Rating Calculator 2026 | Combined Rating | MilPayTools',
    description:
      'Calculate your combined VA disability rating using the official "whole person" formula (38 CFR § 4.25). Includes bilateral factor, step-by-step math, and 2026 compensation rates.',
    images: ['/api/og?type=calculator&title=VA+Disability+Rating+Calculator+2026&v=2'],
  },
};

export default function VADisabilityPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'VA Disability Rating Calculator 2026', description: 'Calculate your combined VA disability rating using the official "whole person" formula (38 CFR § 4.25). Includes bilateral factor, step-by-step math, and 2026 compensation rates.', url: '/calculators/va-disability' })} />

      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200" style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
            VA Disability Combined Rating Calculator
          </h1>
          <p className="text-red-700 font-semibold mt-1.5 text-base leading-snug">
            Stop guessing your VA combined rating.
          </p>
          <p className="hidden md:block text-zinc-600 mt-1 text-sm leading-relaxed max-w-2xl mb-3">
            Enter each service-connected condition to see the official VA whole-person formula
            applied step by step, with the bilateral factor calculated automatically.
          </p>
          <div className="inline-flex items-center gap-2.5 rounded-full bg-zinc-900 px-4 py-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <div className="hidden md:block"><DataCurrencyBadge source="Official VA rates effective December 1, 2025 (2.8% COLA)" /></div>
        </div>
      </div>

      {/* ── 3-step plan strip ────────────────────────────────────────── */}
      <CalcStepStrip steps={[
        { title: 'Enter each condition' },
        { title: 'See the VA math' },
        { title: 'Estimate your compensation' },
      ]} />

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <VADisabilityCalculator />

      {/* ── What this calculator does and does not do ────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-0">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-1.5">This calculator estimates:</p>
              <ul className="text-xs text-zinc-600 space-y-1 leading-relaxed list-disc list-inside">
                <li>Combined VA disability rating using the whole-person formula</li>
                <li>Bilateral factor impact on paired body parts</li>
                <li>2026 monthly compensation based on rating and dependents</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-700 mb-1.5">This calculator does not estimate:</p>
              <ul className="text-xs text-zinc-600 space-y-1 leading-relaxed list-disc list-inside">
                <li>Whether VA will grant service connection for a condition</li>
                <li>The rating VA will assign for a specific medical condition</li>
                <li>Effective dates or back pay amounts</li>
                <li>Special Monthly Compensation (SMC)</li>
                <li>TDIU approval</li>
                <li>VA healthcare priority group or state-level benefits</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-200">
            A small difference near a rounding threshold can move you from 60% to 70%, or from 90% to 100% — this calculator shows the math before you file, appeal, or plan around your expected rating. Always verify estimates with your VA decision letter, C&P exam results, or an accredited VSO.
          </p>
        </div>
      </div>

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            How Does the VA Rate a Veteran with Back and Bilateral Knee Conditions?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: Three service-connected conditions — 50% lumbar spine (back), 30% left knee, 20% right knee. The knees trigger the bilateral factor under 38 CFR § 4.26 because both sides of the same joint are rated.
          </p>
          <ExampleTable>
            <ExampleRow label="Left knee (30%) + right knee (20%) combined" value="44.0% before factor" />
            <ExampleRow label="Bilateral factor added (+10% of combined)" value="+4.4 pts → 48.4%" />
            <ExampleRow label="50% back applied to remaining 51.6%" value="−25.8 pts" />
            <ExampleRow label="Combined exact value" value="74.2%" />
            <ExampleRow label="VA rounded rating (nearest 10%)" value="70%" highlight />
            <ExampleRow label="2026 monthly compensation — veteran alone" value="$1,808.45/mo" highlight />
            <ExampleRow label="Annual VA compensation" value="$21,701/yr" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> Without the bilateral factor, these three conditions combine to 72% (100 − (0.50 × 0.70 × 0.80) = 72%), which also rounds to 70% — so in this particular case the rounded result is the same either way. But the bilateral factor matters enormously in cases near a rounding threshold: a combined value of 63% without the factor becomes 67% with it, changing the rounded rating from 60% to 70% and adding hundreds of dollars per month. VA rules require the bilateral adjustment whenever both sides of a paired joint carry compensable ratings. At 70%, this veteran receives $1,808.45/month in tax-free VA disability compensation, and may qualify for additional dependent-based increases if they have a spouse or children.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">How VA math works</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The VA uses a &ldquo;whole person&rdquo; theory: you start at 100% healthy, and each
              disability reduces your remaining capacity. A 50% disability leaves you at 50%
              healthy. A subsequent 30% disability then reduces that remaining 50% — not the
              original 100%.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              This is why 50% + 30% does <strong>not</strong> equal 80%. After applying 50%, you
              have 50% remaining. Applying 30% to that 50% leaves 35% (50 × 0.70 = 35). Combined
              value: 100 − 35 = 65%, which rounds to <strong>70%</strong>.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The VA&apos;s position is that you cannot be more than 100% disabled — so each
              additional condition has diminishing impact the higher your existing combined rating.
              The final combined value is rounded <em>once</em> to the nearest 10%.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">The bilateral factor explained</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Under 38 CFR § 4.26, if you have compensable disabilities affecting <em>both sides</em>{' '}
              of a paired body part — both knees, both arms, both legs, both eyes — you receive a
              10% bonus on the combined value of those bilateral disabilities.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Example:</strong> Left knee 20% + Right knee 10%. Using VA math, these combine
              to 28%. The bilateral factor adds 10% of 28 (= 2.8), giving 30.8%. That 30.8 is then
              combined with your other disabilities as if it were a single rating.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The bilateral factor only applies when <strong>both</strong> sides have a compensable
              (greater than 0%) rating. A 0% rating on one side does not trigger it. If both sides
              are affected, review whether each side is separately documented and claimed. An
              accredited VSO can help confirm how to file bilateral conditions.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Note: Eye ratings can involve separate VA rating rules beyond the standard bilateral
              factor. If your claim involves paired eye conditions, verify the calculation with an
              accredited representative.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Key rating thresholds</h2>
            <div className="space-y-2">
              {[
                { pct: '0%', text: 'Service-connected with no monthly compensation. Establishes the condition for VA purposes but does not increase the combined percentage unless later increased.' },
                { pct: '10–20%', text: 'Flat compensation rate — no dependent additions at these levels' },
                { pct: '30%+', text: 'Dependent compensation kicks in (spouse, children, parents)' },
                { pct: '50%+', text: 'At 50% or higher, veterans are usually placed in Priority Group 1 for VA healthcare, with reduced or eliminated copays for many types of care. Exact healthcare eligibility, copays, and covered services depend on care type, priority group, and current VA rules.' },
                { pct: '70%+', text: 'May qualify for TDIU (see below) if unable to work' },
                { pct: '100%', text: 'Maximum schedular rating — highest compensation tier, P&T status if permanent' },
              ].map(({ pct, text }) => (
                <div key={pct} className="flex gap-3">
                  <span className="shrink-0 font-mono font-bold text-red-700 text-sm w-14">{pct}</span>
                  <p className="text-sm text-zinc-600">{text}</p>
                </div>
              ))}
              <p className="text-xs text-zinc-400 mt-1 pl-0">
                Note: Comprehensive VA dental care has separate eligibility rules and is not automatic at 50%.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Common VA math mistakes</h2>
            <div className="space-y-3">
              {[
                {
                  mistake: 'Adding ratings together',
                  fix: 'Ratings are never added. Each is applied to the remaining healthy percentage.',
                },
                {
                  mistake: 'Rounding between steps',
                  fix: 'Round only once — at the very end, after all ratings have been applied.',
                },
                {
                  mistake: 'Forgetting the bilateral factor',
                  fix: 'If you have rated disabilities on both sides of a paired body part, the bilateral factor can push you to the next threshold.',
                },
                {
                  mistake: 'Filing only one side of a bilateral condition',
                  fix: 'If symptoms affect both sides of a paired body part, make sure both sides are documented in your records. Review the filing approach with an accredited VSO or attorney before submitting.',
                },
              ].map(({ mistake, fix }) => (
                <div key={mistake}>
                  <p className="text-sm font-semibold text-zinc-800">✗ {mistake}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{fix}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">TDIU — Total Disability Based on Individual Unemployability</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              TDIU allows veterans to receive compensation at the 100% rate even if their combined
              schedular rating is below 100%, if the disabilities prevent them from maintaining
              substantially gainful employment.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>General eligibility:</strong> Combined rating of at least 70% with one
              disability rated at least 40%, OR a single disability rated at least 60%. The VA may
              also grant TDIU on an extraschedular basis in exceptional cases.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              TDIU requires a separate VA Form 21-8940 (Veteran&apos;s Application for Increased
              Compensation Based on Unemployability). Work with an accredited VSO to file.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mt-2">
              Marginal employment and protected work environments can be nuanced — review TDIU
              questions with an accredited VSO or attorney.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Special Monthly Compensation (SMC)</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              SMC provides additional compensation above the 100% rate for veterans with specific
              severe disabilities: loss of use of limbs, blindness, need for regular aid and
              attendance, housebound status, and others.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              SMC calculations are complex and depend heavily on your specific conditions and
              combination of ratings. This calculator does not compute SMC — if you believe you may
              qualify, contact an accredited VSO or the VA directly.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            This calculator provides estimates based on the official VA combined rating formula
            (38 CFR § 4.25–4.26) and{' '}
            <a
              href="https://www.va.gov/disability/compensation-rates/veteran-rates/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              2026 VA compensation rates
            </a>{' '}
            (effective December 1, 2025, 2.8% COLA). Actual ratings are determined by the VA
            based on medical evidence, C&amp;P exam findings, and adjudicator review. This tool is
            not affiliated with the Department of Veterans Affairs or the Department of Defense.
            Verify all figures with your regional VA office or an{' '}
            <a
              href="https://www.va.gov/ogc/apps/accreditation/index.asp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              accredited VSO or attorney
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
                <a href="/guides/va-disability" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Disability Benefits Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
