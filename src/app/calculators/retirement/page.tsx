import type { Metadata } from 'next';
import { RetirementCalculator } from '@/components/calculators/retirement/RetirementCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

export const metadata: Metadata = {
  title: 'Military Retirement Calculator 2026 | MilPayTools',
  description:
    'Estimate your military pension under High-3 or BRS. See monthly pension, lifetime value, TSP projection, and VA disability combined income using 2026 pay tables.',
  alternates: {
    canonical: 'https://milpaytools.com/calculators/retirement',
  },
};

export default function RetirementCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Free · Official 2026 data
            </span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl">🎖️</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Military Retirement Calculator
            </h1>
          </div>
          <p className="text-lg text-zinc-600 max-w-2xl mb-5">
            The &ldquo;Should I stay to 20?&rdquo; calculator. Estimate your pension under High-3 or BRS,
            project your TSP balance, see your lifetime pension value, and combine VA disability
            income — all using official 2026 pay tables.
          </p>
          <div className="flex flex-wrap gap-2">
            {['High-3 & BRS', 'Live TSP projection', 'Lifetime value', 'CRDP eligible check', '2026 pay tables'].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <RetirementCalculator />
      </div>

      {/* Explainer */}
      <div className="bg-white border-t border-zinc-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <h2 className="text-2xl font-bold text-zinc-900">Understanding Military Retirement</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* High-3 */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">High-3 (Legacy) System</h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                High-3 is the legacy defined-benefit pension for members who entered service before
                January 1, 2018 (or opted to stay in it during the 2018 window). The formula is:
              </p>
              <div className="rounded-md bg-zinc-50 border border-zinc-200 px-4 py-3 font-mono text-sm text-zinc-800">
                2.5% × years of service × High-3 average
              </div>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                The <strong>High-3 average</strong> is the average of your highest 36 months of base
                pay — typically the three years immediately before retirement. At 20 years, your
                multiplier is 50%; at 30 years, 75%.
              </p>
            </div>

            {/* BRS */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">BRS (Blended Retirement System)</h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                BRS is mandatory for members who entered after January 1, 2018. It trades a slightly
                lower pension multiplier for TSP matching contributions:
              </p>
              <div className="rounded-md bg-zinc-50 border border-zinc-200 px-4 py-3 font-mono text-sm text-zinc-800">
                2.0% × years of service × High-3 average
              </div>
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
                Plus: DoD contributes <strong>1% automatically</strong> and matches member
                contributions <strong>dollar-for-dollar up to 3%</strong>, then <strong>50 cents per
                dollar on the next 2%</strong> — meaning 5% member contribution = 5% total
                government contribution. Matching begins at month 25 (start of year 3).
              </p>
            </div>

            {/* High-3 average math */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">How High-3 Average Is Calculated</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The DoD averages your base pay across the <em>36 consecutive months</em> of highest
                pay. For most members, this is the final three years. This calculator uses the pay
                table rates for your retirement grade at retirement YOS, YOS−1, and YOS−2 and
                averages them — consistent with how DFAS applies the formula for a member retiring
                at their current grade without a promotion in the final year.
              </p>
            </div>

            {/* CRDP */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">CRDP: Collecting Both Pension and VA Pay</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Normally, military retirement pay is reduced dollar-for-dollar by VA compensation
                (the &ldquo;VA waiver&rdquo;). <strong>Concurrent Retirement and Disability Pay (CRDP)</strong>{' '}
                eliminates this offset for retirees with <strong>20+ years of service</strong> and a
                <strong> VA disability rating of 50% or higher</strong>. If you qualify, you receive
                the full pension amount AND the full VA compensation — both simultaneously.
              </p>
            </div>

            {/* TSP matching */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">BRS TSP Matching Math</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The full government contribution structure under BRS:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                <li className="flex gap-2"><span className="text-red-700">•</span> 1% automatic contribution (day 1, always)</li>
                <li className="flex gap-2"><span className="text-red-700">•</span> Dollar-for-dollar match on your first 3% (starts month 25)</li>
                <li className="flex gap-2"><span className="text-red-700">•</span> 50¢ per dollar match on your next 2% (starts month 25)</li>
                <li className="flex gap-2"><span className="text-green-700 font-semibold">→</span> Contribute 5% = receive 5% total from DoD</li>
              </ul>
            </div>

            {/* Lifetime value */}
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">The Lifetime Value Number</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The lifetime pension value adds up your projected monthly payments across your
                expected years of collection, applying 2.5% annual COLA to each year (the historical
                average for military retired pay cost-of-living adjustments). This is a nominal
                sum — not discounted to present value — and exists to illustrate the magnitude of
                the pension as an asset, not as a precise financial figure.
              </p>
            </div>
          </div>

          {/* Callout: what this calculator doesn't include */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5">
            <p className="font-semibold text-zinc-800 mb-2">What this calculator does not include</p>
            <ul className="space-y-1 text-sm text-zinc-500">
              <li className="flex gap-2"><span>•</span> Continuation Pay (BRS bonus at 8–12 years — varies by branch and year)</li>
              <li className="flex gap-2"><span>•</span> CRSC (Combat Related Special Compensation — separate program from CRDP)</li>
              <li className="flex gap-2"><span>•</span> SBP (Survivor Benefit Plan) premiums, which reduce retired pay if elected</li>
              <li className="flex gap-2"><span>•</span> State income taxes (33+ states exempt military retirement from state tax)</li>
              <li className="flex gap-2"><span>•</span> Part-time employment or Guard/Reserve retirement points (for non-active-duty retirements)</li>
            </ul>
          </div>

          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
