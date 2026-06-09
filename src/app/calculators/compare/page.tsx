import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { CompareCalculator } from '@/components/calculators/compare/CompareCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import { compareLocations } from '@/lib/calculations/compare';
import { getMHACode, getMHARates, getLocationName } from '@/lib/calculations/bah';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: { absolute: 'Compare Your PCS Move — 2026' },
  description:
    'Compare BAH, take-home pay, and total compensation between your current and new duty station. See the real financial difference of your PCS move using 2026 official data.',
  alternates: {
    canonical: '/calculators/compare',
  },
  openGraph: {
    title: 'Compare Your PCS Move — 2026',
    description:
      'Compare BAH, take-home pay, and total compensation between your current and new duty station. See the real financial difference of your PCS move using 2026 official data.',
    type: 'website',
    url: '/calculators/compare',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=Compare+Your+PCS+Move+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Your PCS Move — 2026',
    description:
      'Compare BAH, take-home pay, and total compensation between your current and new duty station. See the real financial difference of your PCS move using 2026 official data.',
    images: ['/api/og?type=calculator&title=Compare+Your+PCS+Move+2026&v=2'],
  },
};

export default function ComparePage() {
  // ── Worked-example values, BAH resolved server-side and fed into compareLocations ──
  // High-contrast pair to show how widely BAH varies: E-5, 8 yrs, with dependents —
  // Fort Leonard Wood, MO (65473) vs Schofield Barracks, HI (96857). Hawaii (HI408)
  // resolves as standard BAH, not OHA.
  const cmpFlwMha = getMHACode('65473');
  const cmpSchMha = getMHACode('96857');
  const cmpFlwBah = (cmpFlwMha && getMHARates(cmpFlwMha, true)?.['E-5']) || 0;
  const cmpSchBah = (cmpSchMha && getMHARates(cmpSchMha, true)?.['E-5']) || 0;
  const cmp = compareLocations({
    payGrade: 'E-5',
    yearsOfService: 8,
    hasDependents: true,
    zipA: '65473',
    zipB: '96857',
    bahA: { monthlyBAH: cmpFlwBah, locationName: getLocationName('65473') ?? 'Fort Leonard Wood', bahFound: true },
    bahB: { monthlyBAH: cmpSchBah, locationName: getLocationName('96857') ?? 'Schofield Barracks', bahFound: true },
  })!;
  const cmpBahAdvantage = cmp.locB.monthlyBAH - cmp.locA.monthlyBAH; // Schofield over Fort Leonard Wood
  const cmpAnnualAdvantage = (cmp.locB.grossMonthly - cmp.locA.grossMonthly) * 12;

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Compare Your PCS Move 2026', description: 'Compare BAH, take-home pay, and total compensation between your current and new duty station. See the real financial difference of your PCS move using 2026 official data.', url: '/calculators/compare' })} />
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
            Compare Your PCS Move
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Compare your current and new station side by side — BAH, CONUS COLA, state income tax, and estimated take-home pay.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your current and new station, plus your rank' },
          { title: 'See side-by-side BAH, COLA, and tax differences' },
          { title: 'Make an informed PCS preference decision' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Comparing two duty stations financially requires looking beyond base pay — BAH differences of $1,000–$2,000/month between assignments are common, state income tax treatment varies significantly, and CONUS COLA may apply at some stations. An E-5 with dependents stationed in San Diego receives approximately $26,000 more per year in BAH than the same rank at Fort Bragg, before factoring in state taxes and cost of living. This calculator produces a side-by-side comparison of total compensation at two stations using official 2026 DTMO and DFAS data.
        </p>
      </div>
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-5 &middot; 8 yrs &middot; w/dep &middot; Fort Bragg &rarr; JBLM
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">BAH diff <span className="font-semibold text-zinc-700">+$750/mo</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">State tax savings <span className="font-semibold text-zinc-700">+$172/mo</span></span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              JBLM ahead: <span className="font-semibold text-red-700">+$922/mo</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10">
        <CompareCalculator />

        
{/* Example Calculation */}
        <div className="calc-example">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Fort Leonard Wood, MO vs. Schofield Barracks, HI: How Much Does BAH Vary by Duty Station?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5, 8 years of service, married with dependents — comparing total monthly compensation at Fort Leonard Wood, MO (ZIP 65473) vs. Schofield Barracks, HI (ZIP 96857). Same rank, same years, dramatically different BAH rates. 2026 data.
          </p>
          <ExampleTable>
            <ExampleRow label="Base Pay (E-5, 8 yrs) — identical at both stations" value={`${formatCurrency(cmp.monthlyBasePay)}/mo`} />
            <ExampleRow label="BAS — identical at both stations" value={`${formatCurrency(cmp.monthlyBAS)}/mo`} />
            <ExampleRow label="BAH — Fort Leonard Wood, MO (with dependents)" value={`${formatCurrency(cmp.locA.monthlyBAH)}/mo`} />
            <ExampleRow label="BAH — Schofield Barracks, HI (with dependents)" value={`${formatCurrency(cmp.locB.monthlyBAH)}/mo`} />
            <ExampleRow label="BAH difference (Schofield Barracks advantage)" value={`+${formatCurrency(cmpBahAdvantage)}/mo`} highlight />
            <ExampleRow label="Monthly gross — Fort Leonard Wood" value={`${formatCurrency(cmp.locA.grossMonthly)}/mo`} highlight />
            <ExampleRow label="Monthly gross — Schofield Barracks" value={`${formatCurrency(cmp.locB.grossMonthly)}/mo`} highlight />
            <ExampleRow label="Annual advantage — Schofield Barracks" value={`+${formatCurrency(cmpAnnualAdvantage)}/yr`} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> The E-5 at Schofield Barracks receives {formatCurrency(cmpAnnualAdvantage)} more per year in BAH than their counterpart at Fort Leonard Wood — driven almost entirely by Hawaii&apos;s far higher housing market. That {formatCurrency(cmpBahAdvantage)}/month difference is excluded from federal taxable income, but BAH tracks local housing costs, so a higher rate largely reflects higher rents rather than extra discretionary income. (Hawaii also receives a separate OCONUS Cost-of-Living Allowance (COLA) this CONUS comparison doesn&apos;t model.) When evaluating PCS orders, weigh the BAH difference alongside the actual cost of living at each location.
          </p>
        </ExampleBox>
        </div>

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
              A single PCS move between Fort Bragg, NC and Joint Base Lewis-McChord, WA can mean
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
                — Estimate DLA, MALT mileage, per diem, TLE, and PPM net proceeds for your move
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
