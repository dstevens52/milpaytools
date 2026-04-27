import type { Metadata } from 'next';
import { BAHCalculator } from '@/components/calculators/bah/BAHCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'BAH Calculator 2026 | Military Housing Allowance | MilPayTools',
  description:
    'Look up your 2026 BAH rate by ZIP code, pay grade, and dependency status. Covers all 40,959 ZIP codes using official DTMO data. Compare rates across duty stations.',
  alternates: {
    canonical: '/calculators/bah',
  },
};

export default function BAHPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'BAH Calculator 2026', description: 'Look up your 2026 BAH rate by ZIP code, pay grade, and dependency status. Covers all 40,959 ZIP codes using official DTMO data. Compare rates across duty stations.', url: '/calculators/bah' })} />
      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">⌂</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                BAH Calculator — 2026 Rates
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Look up your Basic Allowance for Housing rate by ZIP code, pay grade, and dependency
                status. Uses official 2026 DTMO data covering all 40,959 ZIP codes across all U.S.
                military housing areas. Includes a PCS comparison tool to see how your BAH changes
                between duty stations.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { text: '40,959 ZIP codes' },
              { text: '299 military housing areas' },
              { text: 'Official 2026 DTMO data' },
              { text: 'PCS comparison mode' },
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

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <BAHCalculator />

      {/* ── Explainer ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">What is BAH?</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Basic Allowance for Housing (BAH) is a monthly allowance paid to service members who
              live off-post or off-base in the United States. It is not taxable income — excluded
              from federal income tax, FICA, and most state income taxes.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              BAH is determined by three factors: your pay grade, your duty station&apos;s Military
              Housing Area (MHA), and whether you have dependents. It does not depend on your actual
              rent — you receive the same rate whether you spend every dollar of it or find a great
              deal and pocket the difference.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">How BAH rates are set</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The Defense Travel Management Office (DTMO) surveys local rental markets each year and
              sets BAH to cover approximately 95% of median local housing costs for your grade. Rates
              update every January 1st based on the prior year&apos;s survey data.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Because surveys lag the market by roughly a year, BAH may not perfectly match current
              rents in rapidly changing markets — but it is always benchmarked against real local
              data, not a flat national rate.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Rate protection</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              If BAH rates decrease in a future year, your rate is protected — you keep your current
              rate as long as your pay grade, duty station, and dependency status stay the same. This
              is called &ldquo;rate protection&rdquo; or &ldquo;grandfathering.&rdquo;
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Rate protection resets when your dependency status changes (e.g., you gain or lose
              dependents) or when you PCS to a new duty station. In those cases, you receive the
              current rate for your new situation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">With vs. without dependents</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The &ldquo;with dependents&rdquo; rate applies if you have any qualifying dependent —
              a spouse, child, or other dependent listed in DEERS. You only need one qualifying
              dependent to receive the higher rate, and you receive it even if your dependent does
              not live with you (e.g., geographically separated families).
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              BAH does not increase based on the number of dependents — one dependent and four
              dependents receive the same rate. The &ldquo;without dependents&rdquo; rate applies
              to single service members and those whose dependents are not enrolled in DEERS.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">BAH and your taxes</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              BAH is excluded from gross income for federal income tax, FICA (Social Security and
              Medicare), and most state income taxes under 26 U.S.C. § 134. It does not appear on
              your W-2 as taxable wages. A few states partially tax military allowances —
              consult your state&apos;s tax guidance if you are unsure.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              This tax exclusion meaningfully increases the real value of BAH. A service member in
              the 22% federal bracket receiving $2,500/month in BAH is effectively receiving the
              equivalent of $3,205/month in taxable civilian compensation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">BAH and PCS moves</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              When you PCS to a new duty station, your BAH transitions to the rate for your new
              MHA. Use the Compare mode above to see the difference between your current and gaining
              stations before you move — this is essential input for your housing budget.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              During a PCS move, you may be entitled to BAH at your old station, your new station,
              or both for a limited period, depending on your situation. Consult your S1/J1 or PSD
              for your specific transition entitlements.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              To estimate your full PCS entitlements — DLA, MALT mileage, per diem, TLE, and
              PPM/DITY profit potential — see the{' '}
              <a href="/calculators/pcs" className="text-blue-700 hover:underline font-medium">
                PCS Cost Estimator
              </a>
              .
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              To compare total compensation — BAH, state income tax, CONUS COLA, and estimated
              take-home pay — between two specific duty stations, use the{' '}
              <a href="/calculators/compare" className="text-blue-700 hover:underline font-medium">
                Duty Station Comparison Calculator
              </a>
              .
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-2">
            Situations where BAH does not apply
          </h3>
          <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
            <li>Living in government-provided housing (barracks, quarters) — BAH is not paid</li>
            <li>Stationed overseas — service members assigned to overseas duty stations receive OHA (Overseas Housing Allowance) instead of BAH. Unaccompanied overseas tours with dependents remaining in the U.S. may involve both OHA and BAH, but the rules are complex; contact your finance office for your specific entitlement</li>
            <li>U.S. territories (Puerto Rico, Guam, USVI) — these locations are treated as overseas for housing allowance purposes and receive OHA, not BAH</li>
            <li>Single E-1 through E-3 members in many locations are required to live in barracks</li>
            <li>Members under the Basic Allowance for Housing Reserve Component (BAH-RC) have different rules</li>
          </ul>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            MilPayTools calculators use official DoD rate tables (2026) for educational purposes
            only. Results are estimates and may not reflect your exact situation. Always verify your
            BAH entitlement with your unit&apos;s Finance Office or your MyPay account. The
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

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
                <a href="/guides/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS & Duty Station Financial Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
