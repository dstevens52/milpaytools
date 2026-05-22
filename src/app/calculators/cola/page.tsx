import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { ColaCalculator } from '@/components/calculators/cola/ColaCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'CONUS COLA Calculator — 2026 | MilPayTools' },
  description:
    'Check whether your duty station qualifies for CONUS Cost of Living Allowance and see approximate monthly rates by grade. Uses DTMO area data for 2026.',
  alternates: {
    canonical: '/calculators/cola',
  },
  openGraph: {
    title: 'CONUS COLA Calculator — 2026 | MilPayTools',
    description:
      'Check whether your duty station qualifies for CONUS Cost of Living Allowance and see approximate monthly rates by grade. Uses DTMO area data for 2026.',
    type: 'website',
    url: '/calculators/cola',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=CONUS+COLA+Calculator+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CONUS COLA Calculator — 2026 | MilPayTools',
    description:
      'Check whether your duty station qualifies for CONUS Cost of Living Allowance and see approximate monthly rates by grade. Uses DTMO area data for 2026.',
    images: ['/api/og?type=calculator&title=CONUS+COLA+Calculator+2026&v=2'],
  },
};

export default function ColaPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'CONUS COLA Calculator 2026', description: 'Check whether your duty station qualifies for CONUS Cost of Living Allowance and see approximate monthly rates by grade. Uses DTMO area data for 2026.', url: '/calculators/cola' })} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        {/* ── Intro ──────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            CONUS COLA Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Check if your duty station qualifies for CONUS COLA and see your approximate monthly rate using official 2026 DTMO data.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your duty station and pay grade' },
          { title: 'Check CONUS COLA eligibility' },
          { title: 'See your full allowance picture with BAH' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-5 &middot; w/dep &middot; Monterey, CA
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">CONUS COLA <span className="font-semibold text-zinc-700">$430/mo</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">High-cost tier</span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Annual: <span className="font-semibold text-red-700">$5,160</span> &middot; Taxable
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10">
        <ColaCalculator />

        {/* Example Calculation */}
        <div className="calc-example">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            How Much CONUS COLA Does an E-5 at Monterey, CA Receive?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5 stationed at the Naval Postgraduate School or Defense Language Institute, Monterey, CA (ZIP 93940). Monterey is one of the highest-tier CONUS COLA locations — one of the most expensive duty stations in the continental U.S.
          </p>
          <ExampleTable>
            <ExampleRow label="E-5 CONUS COLA — Monterey, CA — with dependents" value="$430/mo" highlight />
            <ExampleRow label="E-5 CONUS COLA — Monterey, CA — without dependents" value="$310/mo" />
            <ExampleRow label="Annual COLA (with dependents)" value="$5,160/yr" highlight />
            <ExampleRow label="Annual COLA (without dependents)" value="$3,720/yr" />
            <ExampleRow label="Tax treatment" value="Taxable income" />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> An E-5 with dependents at the Naval Postgraduate School receives $5,160/year in additional pay specifically because Monterey&apos;s cost of living far exceeds the national average — even accounting for BAH. Unlike BAH, CONUS COLA is taxable income, so the net value after federal taxes at the 12% marginal bracket is approximately $4,541/year. It is still a meaningful supplement for one of the most expensive duty stations in the country.
          </p>
        </ExampleBox>
        </div>

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
              compared to BAH. Members stationed at installations like Fort Bragg (Fayetteville,
              NC), Fort Hood (Killeen, TX), or most Midwest and Southeast installations do not
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
                — Estimate DLA, MALT mileage, per diem, and PPM net proceeds for your next move
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
