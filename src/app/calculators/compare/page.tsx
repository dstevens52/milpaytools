import type { Metadata } from 'next';
import { CompareCalculator } from '@/components/calculators/compare/CompareCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Duty Station Comparison Calculator — 2026 | MilPayTools',
  description:
    'Compare total compensation, BAH, and take-home pay between two CONUS duty stations side by side. See the real financial difference between PCS orders using 2026 official data.',
  alternates: {
    canonical: '/calculators/compare',
  },
};

export default function ComparePage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Duty Station Comparison Calculator 2026', description: 'Compare total compensation, BAH, and take-home pay between two CONUS duty stations side by side. See the real financial difference between PCS orders using 2026 official data.', url: '/calculators/compare' })} />
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Duty Station Comparison
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            Duty Station Comparison
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl">
            Compare total compensation between two duty stations — BAH, CONUS COLA, state income
            tax, and estimated take-home pay — all in one side-by-side view.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <CompareCalculator />

        {/* Explainer */}
        <div className="space-y-8 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Why the duty station you accept matters financially
            </h2>
            <p className="text-zinc-600 mb-3">
              Two service members at the same rank and years of service can have dramatically
              different take-home pay depending on where they&apos;re stationed. The differences come
              from three places: BAH (which varies by local housing costs), CONUS COLA (available
              at a small number of high-cost duty stations), and state income tax (nine states have
              no income tax on wages).
            </p>
            <p className="text-zinc-600">
              A single PCS move between Fort Liberty, NC and Joint Base Lewis-McChord, WA can mean
              more than $500/month in additional take-home pay — not from a raise, but from the
              combination of higher BAH in the Pacific Northwest and Washington&apos;s lack of state
              income tax.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              What this calculator includes
            </h2>
            <ul className="text-zinc-600 space-y-2 list-disc list-inside">
              <li>
                <strong>BAH</strong> — 2026 Basic Allowance for Housing by ZIP code, pay grade,
                and dependency status (DTMO official data)
              </li>
              <li>
                <strong>Base pay</strong> — 2026 DFAS pay tables for all grades and years of service
              </li>
              <li>
                <strong>BAS</strong> — 2026 Basic Allowance for Subsistence ($476.95 enlisted,
                $328.48 officer)
              </li>
              <li>
                <strong>CONUS COLA</strong> — Approximate monthly allowance if either duty station
                is in a qualifying high-cost CONUS area
              </li>
              <li>
                <strong>State income tax</strong> — Approximate effective rate on taxable income
                (base pay + CONUS COLA) — BAH and BAS are always federal and state tax-free
              </li>
              <li>
                <strong>Federal income tax</strong> — Simplified progressive calculation using 2026
                brackets and standard deduction
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              What BAH is really worth at each location
            </h2>
            <p className="text-zinc-600 mb-3">
              BAH is calculated to cover approximately 95% of local median housing costs for your
              grade and dependency status. Because it&apos;s tax-free, a service member in the 22%
              federal bracket effectively needs to earn $1.28 in civilian wages to equal $1.00 of BAH.
            </p>
            <p className="text-zinc-600">
              The BAH difference between duty stations can be substantial — $500 to $1,000+/month
              between low-cost and high-cost areas. Combined with state tax differences, two
              comparable-looking sets of orders can mean a $6,000–$15,000/year difference in
              take-home pay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              State income tax and military pay
            </h2>
            <p className="text-zinc-600 mb-3">
              Nine states have no individual income tax on wages: Alaska, Florida, Nevada, New
              Hampshire (wages only), South Dakota, Tennessee, Texas, Washington, and Wyoming. A
              service member stationed in one of these states pays no state tax on their base pay,
              regardless of their home state of record (domicile) in many cases.
            </p>
            <p className="text-zinc-600 mb-3">
              Many other states offer partial or full exemptions for active duty military pay,
              particularly for members stationed out of state. The estimated state tax shown in this
              calculator uses simplified effective rates and does not account for these exemptions.
            </p>
            <p className="text-zinc-600">
              For accurate state tax information specific to your situation, contact your
              installation&apos;s Legal Assistance office or a qualified tax professional. VITA
              (Volunteer Income Tax Assistance) offers free tax filing services on most installations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Related calculators</h2>
            <ul className="space-y-2">
              <li>
                <a href="/calculators/bah" className="text-blue-700 hover:text-blue-800 underline">
                  BAH Calculator
                </a>{' '}
                — Look up 2026 BAH for any ZIP code with exact DTMO data
              </li>
              <li>
                <a href="/calculators/pcs" className="text-blue-700 hover:text-blue-800 underline">
                  PCS Cost Estimator
                </a>{' '}
                — Estimate DLA, MALT mileage, per diem, TLE, and PPM profit for your move
              </li>
              <li>
                <a href="/calculators/total-compensation" className="text-blue-700 hover:text-blue-800 underline">
                  Total Military Compensation
                </a>{' '}
                — Full compensation breakdown including tax advantages and TSP matching
              </li>
              <li>
                <a href="/calculators/cola" className="text-blue-700 hover:text-blue-800 underline">
                  CONUS COLA Calculator
                </a>{' '}
                — Check if your duty station qualifies for CONUS Cost of Living Allowance
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
                <a href="/guides/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS & Duty Station Financial Guide →</a>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
