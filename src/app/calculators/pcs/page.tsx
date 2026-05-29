import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { PCSCalculator } from '@/components/calculators/pcs/PCSCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'PCS Cost Estimator 2026 | Military Move Calculator' },
  description:
    'Estimate your PCS entitlements: DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds. Uses 2026 DTMO rates for all ranks.',
  alternates: {
    canonical: '/calculators/pcs',
  },
  openGraph: {
    title: 'PCS Cost Estimator 2026 | Military Move Calculator',
    description:
      'Estimate your PCS entitlements: DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds. Uses 2026 DTMO rates for all ranks.',
    type: 'website',
    url: '/calculators/pcs',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=PCS+Cost+Estimator+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PCS Cost Estimator 2026 | Military Move Calculator',
    description:
      'Estimate your PCS entitlements: DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds. Uses 2026 DTMO rates for all ranks.',
    images: ['/api/og?type=calculator&title=PCS+Cost+Estimator+2026&v=2'],
  },
};

export default function PCSPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'PCS Cost Estimator 2026', description: 'Estimate your PCS entitlements: DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds. Uses 2026 DTMO rates for all ranks.', url: '/calculators/pcs' })} />
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
            PCS Cost Estimator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Estimate your full PCS entitlements — DLA, mileage, per diem, TLE, and PPM/DITY proceeds — using official 2026 DTMO rates.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your origin and destination' },
          { title: 'See your full PCS entitlements (DLA, MALT, per diem, TLE)' },
          { title: 'Compare government move vs. PPM/DITY' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          A PCS move triggers several financial entitlements — Dislocation Allowance (DLA), MALT mileage at $0.205/mile, per diem for travel days, and Temporary Lodging Expense (TLE) for transition. Service members who arrange a Personally Procured Move (PPM) can keep the difference between the government&apos;s weight estimate and their actual shipping cost, which often generates $1,000–$5,000 in net proceeds on longer moves. This calculator estimates all major PCS entitlements using 2026 DTMO rates for your rank and family situation.
        </p>
      </div>
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-5 &middot; w/dep &middot; Fort Bragg &rarr; JBLM &middot; 2,973 mi
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">DLA <span className="font-semibold text-zinc-700">$3,548</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">MALT <span className="font-semibold text-zinc-700">$609</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">Per diem <span className="font-semibold text-zinc-700">$2,663</span></span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Gov move total: <span className="font-semibold text-red-700">$6,820</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Calculator ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50">
        <PCSCalculator />
      </div>

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Government Move vs. PPM: E-6 from Fort Campbell, KY to JBLM, WA
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-6, married with 2 dependents (3 total travelers), PCS from Fort Campbell, KY to Joint Base Lewis-McChord, WA — approximately 2,200 miles. Assumes 1 authorized POV, 6 travel days, and 20 days combined TLE. 2026 DTMO rates.
          </p>
          <ExampleTable>
            <ExampleRow label="DLA — Dislocation Allowance (E-6 with dependents)" value="$3,548" />
            <ExampleRow label="MALT mileage (2,200 mi × $0.205, 1 POV)" value="$451" />
            <ExampleRow label="Per diem — member (6 days: 2 × $134.25 + 4 × $179)" value="$985" />
            <ExampleRow label="Per diem — 2 dependents (75% of member rate each)" value="$1,477" />
            <ExampleRow label="TLE — Temporary Lodging Expense (20 days × $179)" value="$3,580" />
            <ExampleRow label="Total government move entitlement" value="$10,041" highlight />
            <ExampleRow label="PPM — gross reimbursement (11,000 lbs ÷ 100 × $210/cwt)" value="$23,100" />
            <ExampleRow label="PPM — estimated move costs (truck rental, fuel, supplies)" value="−$4,500" />
            <ExampleRow label="PPM — gross proceeds" value="$18,600" />
            <ExampleRow label="PPM — after-tax proceeds (22% tax)" value="$14,508" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> DLA, MALT, per diem, and TLE ($10,041) are paid the same way regardless of which move type you choose. With a PPM, you keep all of those entitlements AND net $14,508 after tax — bringing total PPM compensation to $24,549 vs. $10,041 for a government move. The E-6 keeps approximately $14,508 more by choosing PPM over a government move. The net proceeds come from moving efficiently under the 11,000-lb weight allowance; actual amounts depend on real moving costs and how much of the weight allowance you use.
          </p>
        </ExampleBox>
      </section>

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
              The difference between the reimbursement and your actual costs is your net proceeds.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              PPM net proceeds are taxable income. The calculator estimates the after-tax amount at a ~22%
              federal effective rate — your actual tax will depend on your filing status and total
              income. Keep all receipts for the weight ticket, truck rental, fuel, and supplies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">TLE: Temporary Lodging Expense</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              TLE reimburses temporary lodging and meals near your old or new duty station during a PCS. For many CONUS-to-CONUS moves, TLE may be available for up to 21 days, subject to location, receipts, daily caps, and JTR rules. OCONUS-related moves follow different limits, and TLA (Temporary Lodging Allowance) may apply overseas instead.
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
            Compare Your PCS Move
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
