import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { DualMilitaryBAHCalculator } from '@/components/calculators/dual-military-bah/DualMilitaryBAHCalculator';
import { GuidePromo } from '@/components/calculators/shared/GuidePromo';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'Dual Military BAH Calculator 2026: Maximize Your Household BAH | MilPayTools' },
  description:
    'Calculate total BAH for dual military couples. See who should claim dependents, compare rates at different duty stations, and find the optimal configuration using official 2026 rates.',
  alternates: {
    canonical: '/calculators/dual-military-bah',
  },
  openGraph: {
    title: 'Dual Military BAH Calculator 2026: Maximize Your Household BAH | MilPayTools',
    description:
      'Calculate total BAH for dual military couples. See who should claim dependents, compare rates at different duty stations, and find the optimal configuration using official 2026 rates.',
    type: 'website',
    url: '/calculators/dual-military-bah',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=Dual+Military+BAH+Calculator+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dual Military BAH Calculator 2026: Maximize Your Household BAH | MilPayTools',
    description:
      'Calculate total BAH for dual military couples. See who should claim dependents, compare rates at different duty stations, and find the optimal configuration using official 2026 rates.',
    images: ['/api/og?type=calculator&title=Dual+Military+BAH+Calculator+2026&v=2'],
  },
};

export default function DualMilitaryBAHPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Dual Military BAH Calculator 2026', description: 'Calculate total BAH for dual military couples. See who should claim dependents, compare rates at different duty stations, and find the optimal configuration using official 2026 rates.', url: '/calculators/dual-military-bah' })} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Dual Military BAH Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Calculate total household BAH for dual active-duty couples — see the optimal dependent-claiming configuration and compare duty station scenarios.
          </p>
        </div>
        <CalcStepStrip noBg steps={[
          { title: "Enter both service members' duty stations and ranks" },
          { title: 'See who should claim dependents for maximum BAH' },
          { title: 'Compare all housing scenarios' },
        ]} />
      </section>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <DualMilitaryBAHCalculator />

      {/* ── Collapsible rules ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 flex-none">
                <svg className="w-3 h-3 text-red-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M12 6v6" />
                </svg>
              </span>
              Dual Military BAH Rules
            </span>
            <svg
              className="h-4 w-4 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-5">
            <ul className="space-y-2">
              {[
                'Only one member can claim dependents for BAH — the claiming member gets the with-dependents rate; the other always gets the without-dependents rate.',
                'If neither member has dependents, both receive the without-dependents rate regardless of marital status.',
                'The higher-ranking member claiming dependents almost always produces the higher household total — the with-dependents premium scales with pay grade.',
                "If stationed at different locations, each member's BAH is based on their own duty station ZIP code, not their spouse's.",
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
        </details>
      </div>

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            What Does a Dual-Military E-5 Couple Take Home at Fort Bragg?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: Two E-5s stationed together at Fort Bragg, NC (ZIP 28310). Member A has 8 years of service, Member B has 6 years. They have one child — Member A claims the dependent and receives BAH with dependents; Member B receives BAH without dependents. 2026 rates.
          </p>
          <ExampleTable>
            <ExampleRow label="Member A base pay (E-5, 8 yrs)" value="$4,300/mo" />
            <ExampleRow label="Member B base pay (E-5, 6 yrs)" value="$4,110/mo" />
            <ExampleRow label="Member A BAH — Fort Bragg, with dependents (claims child)" value="$1,806/mo" />
            <ExampleRow label="Member B BAH — Fort Bragg, without dependents" value="$1,527/mo" />
            <ExampleRow label="Household BAH total" value="$3,333/mo" highlight />
            <ExampleRow label="Household BAS (both enlisted)" value="$954/mo" />
            <ExampleRow label="Household gross monthly" value="$12,697/mo" highlight />
            <ExampleRow label="Household gross annual" value="$152,364/yr" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> This dual-military couple earns $152,364/year in gross compensation — more than twice the median U.S. household income — while $51,444 of that ($3,333 BAH + $954 BAS × 12) is excluded from federal taxable income. Because only one member can claim the dependent, choosing which spouse claims the child does not change the household total in this example, since both are E-5s with the same BAH rates.
          </p>
        </ExampleBox>
      </section>

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
              This means the higher-ranking spouse claiming dependents almost always produces the
              highest household BAH total. The calculator shows you both scenarios and the exact dollar difference,
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
