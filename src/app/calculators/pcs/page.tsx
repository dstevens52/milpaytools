import type { Metadata } from 'next';
import { PCSCalculator } from '@/components/calculators/pcs/PCSCalculator';

export const metadata: Metadata = {
  title: 'PCS Cost Estimator 2026 | Military Move Calculator | MilPayTools',
  description:
    'Estimate your PCS entitlements: DLA, MALT mileage, per diem, TLE, and PPM/DITY profit potential. Uses 2026 DTMO rates for all ranks.',
  alternates: {
    canonical: '/calculators/pcs',
  },
};

export default function PCSPage() {
  return (
    <>
      {/* ── Page intro ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">📦</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                PCS Cost Estimator — 2026 Rates
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Estimate your total PCS move entitlements — DLA, mileage (MALT), per diem, TLE, and
                PPM/DITY profit potential — all from one place. Uses 2026 DTMO rates for all ranks.
                Compare government move vs. PPM to see which puts more money in your pocket.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { text: 'DLA + MALT + Per Diem' },
              { text: 'PPM profit calculation' },
              { text: 'All ranks E-1 through O-10' },
              { text: '2026 DTMO rates' },
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

      {/* ── Calculator ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50">
        <PCSCalculator />
      </div>

      {/* ── Explainer ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">What is DLA?</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Dislocation Allowance (DLA) is a one-time payment intended to partially reimburse the
              cost of disruption that a PCS causes to your household. It is paid per move — not per
              mile — and varies by rank and dependency status.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              DLA is not the same as your moving reimbursement. It covers the incidental costs of
              uprooting a household: utility hookups, lease break fees, initial supplies at a new
              location. Keep it separate in your mental accounting from HHG shipping costs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">MALT and the DTOD distance</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              MALT (Monetary Allowance in Lieu of Transportation) reimburses you for driving your
              POV at a flat per-mile rate — $0.205/mile in 2026. The reimbursable distance is the
              official DTOD (Defense Table of Official Distances) route, not what your GPS shows.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              DTOD distances are typically slightly different from Google Maps or Waze. Look up the
              official DTOD mileage at{' '}
              <a
                href="https://www.dtod.sddc.army.mil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
              >
                dtod.sddc.army.mil
              </a>{' '}
              to get the exact number to use in your voucher.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">PPM (Personally Procured Move)</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              A PPM move (formerly DITY — Do It Yourself) lets you move your own household goods
              and get reimbursed at the government&apos;s cost to do the same move commercially.
              The difference between the reimbursement and your actual costs is your profit.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              PPM profit is taxable income. The calculator estimates after-tax profit at a ~22%
              federal effective rate — your actual tax will depend on your filing status and total
              income. Keep all receipts for the weight ticket, truck rental, fuel, and supplies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">TLE: Temporary Lodging Expense</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              TLE reimburses temporary lodging costs at your old or new duty station when your
              household goods have been shipped or haven&apos;t arrived yet. Maximum 14 days
              combined between both locations.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              This calculator uses the standard CONUS per diem rate ($179/day) as a TLE estimate.
              Actual TLE is based on your documented lodging receipts and M&IE — you must submit
              receipts to your finance office to receive reimbursement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Weight allowances</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The weight allowance is the maximum household goods weight the government will ship
              or reimburse for a PPM move. Exceeding your allowance means paying out-of-pocket for
              the overage. The allowance increases significantly with rank.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Pro-gear (professional books, papers, equipment) may not count against your weight
              allowance — check with your TMO for details. Unaccompanied baggage and items in
              temporary storage may have separate limits.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Per diem travel days</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Travel days for PCS per diem are calculated per JTR: 1 day for the first 400 miles,
              then 1 day per 350 miles thereafter (with a rounding rule for remainders). The first
              and last travel day are paid at 75% of the full daily rate.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Dependents traveling with you receive approximately 75% of the member&apos;s per diem
              rate (per JTR, for dependents age 12 and older). Younger dependents may receive a
              lower rate — verify the current JTR rules if this applies to your family.
            </p>
          </div>
        </div>

        {/* Cross-link */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-800">Comparing duty stations?</span>{' '}
          The{' '}
          <a href="/calculators/compare" className="text-blue-700 hover:underline font-medium">
            Duty Station Comparison Calculator
          </a>{' '}
          shows BAH difference, state income tax impact, CONUS COLA eligibility, and estimated
          take-home pay at each location — before you finalize which orders to accept.
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-600 mb-2">Disclaimer</p>
          <p>
            This calculator provides estimates based on published 2026 DoD rates. Actual entitlements
            depend on your specific orders, authorized DTOD route, and Finance Office approval. DLA
            rates from DTMO (verify at{' '}
            <a
              href="https://www.travel.dod.mil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              travel.dod.mil
            </a>
            ). MALT rate: $0.205/mile. Per diem at standard CONUS rates. PPM reimbursement rates
            are approximate — actual rates vary by distance and origin/destination, and are
            calculated by your installation&apos;s Transportation Office (TMO). TLE estimate uses
            standard CONUS per diem; actual TLE requires documented lodging receipts. Always verify
            your specific entitlements with your TMO and Finance Office before making financial
            decisions about your move.
          </p>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS & Duty Station Financial Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
