import type { Metadata } from 'next';
import { ColaCalculator } from '@/components/calculators/cola/ColaCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

export const metadata: Metadata = {
  title: 'CONUS COLA Calculator — 2026 | MilPayTools',
  description:
    'Check whether your duty station qualifies for CONUS Cost of Living Allowance and see approximate monthly rates by grade. Uses DTMO area data for 2026.',
  alternates: {
    canonical: '/calculators/cola',
  },
};

export default function ColaPage() {
  return (
    <>
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Active Duty Pay
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            CONUS COLA Calculator
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl">
            Continental U.S. Cost of Living Allowance supplements pay at high-cost duty stations.
            Enter your ZIP code to check eligibility and see approximate monthly rates.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <ColaCalculator />

        {/* Explainer */}
        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">What is CONUS COLA?</h2>
            <p className="text-zinc-600 mb-3">
              CONUS COLA (Continental U.S. Cost of Living Allowance) is a supplemental pay
              entitlement for service members stationed in high-cost CONUS locations where the cost
              of living substantially exceeds the national average. It is paid in addition to BAH
              and BAS — it does not replace or reduce those allowances.
            </p>
            <p className="text-zinc-600">
              CONUS COLA is governed by 37 U.S.C. § 403b and administered by the Defense Travel
              Management Office (DTMO), which publishes official rates by location, grade, and
              dependency status each fiscal year.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              How CONUS COLA differs from BAH
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-zinc-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="text-left px-4 py-3 font-semibold text-zinc-700">Feature</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-700">BAH</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-700">CONUS COLA</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Purpose', 'Offset housing costs', 'Offset overall high cost of living'],
                    ['Who receives it', 'All members assigned to CONUS duty stations', 'Members at specific high-cost CONUS locations only'],
                    ['Taxable?', 'No — tax-free', 'Yes — taxable income'],
                    ['Basis', 'Pay grade + ZIP code + dependency status', 'Pay grade + qualifying area + dependency status'],
                    ['Updated', 'January 1 each year', 'Annually by DTMO'],
                    ['Paid together?', 'Yes — both can be paid simultaneously', 'Yes — paid in addition to BAH'],
                  ].map(([feature, bah, cola]) => (
                    <tr key={feature} className="border-t border-zinc-100">
                      <td className="px-4 py-3 font-medium text-zinc-700">{feature}</td>
                      <td className="px-4 py-3 text-zinc-600">{bah}</td>
                      <td className="px-4 py-3 text-zinc-600">{cola}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Which areas qualify for CONUS COLA?
            </h2>
            <p className="text-zinc-600 mb-3">
              CONUS COLA is authorized for locations where the cost of goods and services exceeds
              the national average by a threshold defined by DTMO. The qualifying areas are
              predominantly in California (Bay Area, Monterey, Los Angeles, San Diego, and
              surrounding counties), the Northeast (New York City metro, Boston, and Connecticut),
              and the National Capital Region.
            </p>
            <p className="text-zinc-600 mb-3">
              Most CONUS duty stations do not qualify — CONUS COLA is a relatively narrow entitlement
              compared to BAH. Members stationed at installations like Fort Liberty (Fayetteville,
              NC), Fort Cavazos (Killeen, TX), or most Midwest and Southeast installations do not
              receive CONUS COLA.
            </p>
            <p className="text-zinc-600">
              DTMO updates the qualifying areas list annually. If your duty station is near a
              borderline area, verify using the official DTMO tool at{' '}
              <a
                href="https://www.travel.dod.mil/Pay-Entitlements/CONUS-COLA/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-800"
              >
                travel.dod.mil
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              CONUS COLA and your tax picture
            </h2>
            <p className="text-zinc-600 mb-3">
              Unlike BAH and BAS, which are excluded from federal income tax, CONUS COLA is fully
              taxable. This is an important distinction when calculating your total take-home
              compensation.
            </p>
            <p className="text-zinc-600">
              If you receive $300/month in CONUS COLA and are in the 22% federal tax bracket, your
              after-tax benefit is approximately $234/month ($300 × 0.78). Factor this in when
              comparing duty station financial packages — the pre-tax COLA amount overstates the
              actual take-home value.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Related calculators</h2>
            <ul className="space-y-2">
              <li>
                <a href="/calculators/total-compensation" className="text-blue-700 hover:text-blue-800 underline">
                  Total Military Compensation Calculator
                </a>{' '}
                — See your full compensation package including BAH, BAS, and tax advantages
              </li>
              <li>
                <a href="/calculators/bah" className="text-blue-700 hover:text-blue-800 underline">
                  BAH Calculator
                </a>{' '}
                — Look up your Basic Allowance for Housing by ZIP code and pay grade
              </li>
              <li>
                <a href="/calculators/pcs" className="text-blue-700 hover:text-blue-800 underline">
                  PCS Cost Estimator
                </a>{' '}
                — Estimate DLA, MALT mileage, per diem, and PPM profit for your next move
              </li>
            </ul>
          </div>
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

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
