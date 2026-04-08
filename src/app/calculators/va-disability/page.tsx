import type { Metadata } from 'next';
import { VADisabilityCalculator } from '@/components/calculators/va-disability/VADisabilityCalculator';

export const metadata: Metadata = {
  title: 'VA Disability Rating Calculator 2026 | Combined Rating | MilPayTools',
  description:
    'Calculate your combined VA disability rating using the official "whole person" formula (38 CFR § 4.25). Includes bilateral factor, step-by-step math, and 2026 compensation rates.',
  alternates: {
    canonical: '/calculators/va-disability',
  },
};

export default function VADisabilityPage() {
  return (
    <>
      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">★</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                VA Disability Combined Rating Calculator
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                VA disability ratings are not simply added together. This calculator uses the
                official &ldquo;whole person&rdquo; formula (38 CFR § 4.25), applies the bilateral
                factor automatically, and shows you every step of the math — so you understand
                exactly how your combined rating was calculated.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              'Official VA whole-person formula',
              'Bilateral factor (38 CFR § 4.26)',
              'Step-by-step math',
              '2026 compensation rates',
              'Scenario builder',
            ].map((text) => (
              <span
                key={text}
                className="inline-flex items-center text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <VADisabilityCalculator />

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
              (greater than 0%) rating. A 0% rating on one side does not trigger it. Make sure you
              have filed separate claims for both sides of any bilateral condition.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Key rating thresholds</h2>
            <div className="space-y-2">
              {[
                { pct: '0%', text: 'Service-connected, no compensation — but counts toward combined rating and establishes healthcare eligibility for that condition' },
                { pct: '10–20%', text: 'Flat compensation rate — no dependent additions at these levels' },
                { pct: '30%+', text: 'Dependent compensation kicks in (spouse, children, parents)' },
                { pct: '50%+', text: 'Enhanced VA healthcare, dental care, and additional benefits' },
                { pct: '70%+', text: 'May qualify for TDIU (see below) if unable to work' },
                { pct: '100%', text: 'Maximum schedular rating — highest compensation tier, P&T status if permanent' },
              ].map(({ pct, text }) => (
                <div key={pct} className="flex gap-3">
                  <span className="shrink-0 font-mono font-bold text-red-700 text-sm w-14">{pct}</span>
                  <p className="text-sm text-zinc-600">{text}</p>
                </div>
              ))}
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
                  fix: 'File separate claims for both sides. Even a low rating on the second side can trigger the bilateral factor.',
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
      </div>
    </>
  );
}
