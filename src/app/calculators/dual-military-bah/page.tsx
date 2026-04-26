import type { Metadata } from 'next';
import { DualMilitaryBAHCalculator } from '@/components/calculators/dual-military-bah/DualMilitaryBAHCalculator';
import { GuidePromo } from '@/components/calculators/shared/GuidePromo';

export const metadata: Metadata = {
  title: 'Dual Military BAH Calculator 2026: Maximize Your Household BAH | MilPayTools',
  description:
    'Calculate total BAH for dual military couples. See who should claim dependents, compare rates at different duty stations, and find the optimal configuration using official 2026 rates.',
  alternates: {
    canonical: '/calculators/dual-military-bah',
  },
};

export default function DualMilitaryBAHPage() {
  return (
    <>
      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">⌂⌂</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                Dual Military BAH Calculator — 2026 Rates
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Calculate total household BAH for dual active-duty couples. Enter both members&apos;
                pay grades, your duty station ZIP, and whether you have dependents — the calculator
                shows the optimal dependent-claiming configuration and the dollar difference between
                the two options.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { text: 'Same or different duty stations' },
              { text: 'Dependent-claiming comparison' },
              { text: 'Optimal configuration finder' },
              { text: 'Official 2026 DTMO data' },
            ].map(({ text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick rules box ──────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-red-700 flex items-center justify-center flex-none">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M12 6v6" />
              </svg>
            </div>
            <p className="text-sm font-bold text-red-900 uppercase tracking-wide">
              Dual Military BAH Rules
            </p>
          </div>
          <ul className="space-y-2">
            {[
              'Only one member can claim dependents for BAH — the claiming member gets the with-dependents rate; the other always gets the without-dependents rate.',
              'If neither member has dependents, both receive the without-dependents rate regardless of marital status.',
              'The higher-ranking member claiming dependents almost always produces the higher household total — the with-dependents premium scales with pay grade.',
              'If stationed at different locations, each member\'s BAH is based on their own duty station ZIP code, not their spouse\'s.',
              'Each member receives their BAH independently on their own LES — the amounts are never split or shared between the two.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-red-900">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-red-200 flex items-center justify-center flex-none text-xs font-bold text-red-700">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <DualMilitaryBAHCalculator />

      {/* ── Explainer ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              How BAH works for dual military couples
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              When both spouses are on active duty, each member has an independent BAH entitlement —
              but with one important constraint. DoD policy (DoDI 1340.09) prohibits both members
              from receiving the with-dependents rate simultaneously. Exactly one member can claim
              dependents for BAH purposes; the other automatically receives the without-dependents
              rate.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              This rule applies even if both members have dependents enrolled in DEERS and even if
              they are geographically separated. The claiming designation is recorded in the finance
              system and should match the member whose records show the dependents.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Why the higher-ranking member should claim dependents
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              BAH rates are set by pay grade and location. The with-dependents premium —
              the dollar difference between the with and without rates — increases at higher
              pay grades. An O-5 receives a larger premium than an E-5 in the same MHA.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              This means the higher-ranking spouse claiming dependents almost always maximizes
              household BAH. The calculator shows you both scenarios and the exact dollar difference,
              so you can confirm the optimal configuration for your specific grades and location.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Co-located vs. geographically separated
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              When both members are stationed at the same installation, they typically receive BAH
              based on the same Military Housing Area (MHA) — though their rates differ based on
              pay grade and who claims dependents. Living in the same house doesn&apos;t reduce either
              member&apos;s BAH entitlement.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              When members are stationed at different installations, each receives BAH based on their
              own duty station&apos;s MHA. This can work in a couple&apos;s favor if one is in a
              high-BAH market. Use the &ldquo;Different Stations&rdquo; mode to compare.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              What counts as a dependent for BAH
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              For dual military couples, &ldquo;dependents&rdquo; for BAH purposes refers to
              children — not the other spouse. Your spouse is also on active duty and has their own
              BAH entitlement. Children enrolled in DEERS are qualifying dependents for the
              with-dependents rate.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              If you have no children, both members receive the without-dependents rate even if
              married. The calculator defaults to &ldquo;Have Dependents&rdquo; to show the
              dependent-claiming comparison — toggle to &ldquo;No Dependents&rdquo; if neither
              member has children.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Joint-spouse assignment requests (JSAR)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              DoD policy directs assignment officers to attempt co-location for dual military couples
              when operationally feasible. A Joint-Spouse Assignment Request (JSAR) formally
              documents this request. It doesn&apos;t guarantee co-location, but it significantly
              improves the odds when both members are competitive for assignments in the same area.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              File your JSAR early in the assignment cycle — typically 18–24 months before your
              projected rotation date. Both members must submit requests through their respective
              branch assignment offices. See the{' '}
              <a href="/guides/pcs" className="text-blue-700 hover:underline font-medium">
                PCS &amp; Duty Station Guide
              </a>{' '}
              for more on navigating assignments as a dual military couple.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Rate protection and annual updates
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              BAH rate protection applies independently to each member. If one member&apos;s BAH
              rate decreases in a future year, that member keeps their current rate as long as their
              pay grade, duty station, and dependency status don&apos;t change. The other member is
              unaffected.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Rate protection resets when you PCS, change dependency status, or change pay grade.
              This calculator uses the 2026 DTMO rates published effective January 1, 2026.
            </p>
          </div>
        </div>

        {/* FAQ callout */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-3">Common questions</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-800">
                Can we both get BAH if we live together in the same house?
              </p>
              <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                Yes. Both members receive their full BAH entitlement regardless of shared housing.
                The military does not reduce BAH because a couple lives together. This is one of
                the most significant financial advantages of dual military status.
              </p>
            </div>
            <div className="border-t border-zinc-200 pt-4">
              <p className="text-sm font-medium text-zinc-800">
                What if we&apos;re at the same installation but different ZIP codes?
              </p>
              <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                BAH is determined by your duty station&apos;s Military Housing Area (MHA), not
                your residential ZIP code. Multiple ZIP codes often map to the same MHA. As long
                as both members are in the same MHA, they receive the same base rate (adjusted for
                grade and dependency status). Use any ZIP code associated with your installation.
              </p>
            </div>
            <div className="border-t border-zinc-200 pt-4">
              <p className="text-sm font-medium text-zinc-800">
                We just had a child. Do we need to update our BAH?
              </p>
              <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                Yes — enroll your child in DEERS, then update your dependency status with your
                unit&apos;s finance office. The member claiming dependents will have their BAH
                adjusted to the with-dependents rate effective the date of enrollment. Don&apos;t
                delay — BAH is not retroactively adjusted more than a limited period.
              </p>
            </div>
          </div>
        </div>

        {/* Blog post link */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Related Reading
          </p>
          <a
            href="/blog/dual-military-financial-strategies"
            className="text-sm font-medium text-blue-800 hover:text-blue-900 hover:underline"
          >
            Dual Military Financial Strategies: Making Two Incomes Work →
          </a>
          <p className="text-xs text-blue-600 mt-1">
            Covers BAH optimization, two TSP accounts, dual pensions, childcare costs, and tax
            filing strategy for dual military couples.
          </p>
        </div>

        {/* Guide promo */}
        <GuidePromo
          guides={[
            { slug: 'military-pay', title: 'Military Pay & Compensation Guide' },
            { slug: 'pcs', title: 'PCS & Duty Station Financial Guide' },
          ]}
        />

        {/* Disclaimer */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            MilPayTools calculators use official DoD rate tables (2026) for educational purposes
            only. Results are estimates and may not reflect your exact entitlement. Dual military
            BAH rules are governed by DoDI 1340.09 and your branch&apos;s implementing instructions —
            verify your specific situation with your unit&apos;s Finance Office or S1/J1. The
            authoritative source for BAH rates is the{' '}
            <a
              href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline hover:text-blue-800"
            >
              DTMO BAH Rate Lookup
            </a>
            . This tool is not affiliated with the Department of Defense or any government agency.
          </p>
        </div>
      </div>
    </>
  );
}
