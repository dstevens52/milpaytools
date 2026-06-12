import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { TotalCompensationCalculator } from '@/components/calculators/total-compensation/TotalCompensationCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import { calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { getMHACode, getMHARates } from '@/lib/calculations/bah';
import { formatCurrency, roundToNearest } from '@/lib/utils';

export const metadata: Metadata = {
  title: { absolute: 'Total Military Compensation Calculator 2026: Base Pay, BAH, BAS & Tax Advantages' },
  description:
    'Calculate your true total military compensation: base pay, BAH, BAS, TSP match, and tax advantage. See the civilian salary equivalent using official 2026 DoD rates.',
  alternates: {
    canonical: '/calculators/total-compensation',
  },
  openGraph: {
    title: 'Total Military Compensation Calculator 2026: Base Pay, BAH, BAS & Tax Advantages',
    description:
      'Calculate your true total military compensation: base pay, BAH, BAS, TSP match, and tax advantage. See the civilian salary equivalent using official 2026 DoD rates.',
    type: 'website',
    url: '/calculators/total-compensation',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'Total Military Compensation Calculator 2026' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Total Military Compensation Calculator 2026: Base Pay, BAH, BAS & Tax Advantages',
    description:
      'Calculate your true total military compensation: base pay, BAH, BAS, TSP match, and tax advantage. See the civilian salary equivalent using official 2026 DoD rates.',
    images: ogImage({ type: 'calculator', title: 'Total Military Compensation Calculator 2026' }),
  },
};

export default function TotalCompensationPage() {
  // ── Worked-example values, computed server-side (BAH resolved via bah.ts) ──────
  // One scenario drives both the hero "sample output" bar and the full example:
  // E-5, 8 yrs, Fort Bragg NC (28310), with dependents, BRS, 5% TSP.
  const tcMha = getMHACode('28310');
  const tcBah = (tcMha && getMHARates(tcMha, true)?.['E-5']) || 0;
  const tc = calculateTotalCompensation(
    {
      payGrade: 'E-5',
      yearsOfService: 8,
      zipCode: '28310',
      hasDependents: true,
      retirementSystem: 'brs',
      tspContributionPct: 5,
      govHousing: false,
      mealCard: false,
    },
    tcBah,
  );
  const tcGrossAnnual = tc.totalMonthly * 12; // Base + BAH + BAS, no match
  const tcPctHigher = Math.round((tc.civilianEquivalent / tc.annualBasePay - 1) * 100);
  const tcCivRounded = roundToNearest(tc.civilianEquivalent, 100); // for the "≈" / "roughly" figures

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Total Military Compensation Calculator 2026', description: 'Calculate your true total military compensation: base pay, BAH, BAS, TSP match, and tax advantage. See the civilian salary equivalent using official 2026 DoD rates.', url: '/calculators/total-compensation' })} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200 md:min-h-[340px]"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        {/* Soldier image — full-width background, desktop only */}
        <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/desk-soldier.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'right center' }}
          />
          {/* Cream overlay: solid on left (text area), fades to transparent on right (soldier) */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(242,232,212,1) 0%, rgba(242,232,212,1) 30%, rgba(242,232,212,0.85) 45%, rgba(242,232,212,0) 62%)' }}
          />
        </div>

        <div className="relative z-10">

          {/* Left column — constrained so image stays visible on desktop */}
          <div className="mx-auto max-w-5xl pt-6 sm:pt-9 px-4">
            <div className="sm:max-w-[58%] mb-5">

              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
                  Free &middot; No Account &middot; No Personal Info &middot; Official 2026 DoD &amp; VA Data
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[28px] sm:text-[38px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
                Total Military Compensation Calculator
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                See what your military compensation is really worth — including BAH, BAS, TSP match, and tax advantages.
              </p>

            </div>
          </div>

          {/* ── 3-step plan strip — inside hero ──────────────────────── */}
          <CalcStepStrip noBg steps={[
            { title: 'Enter rank, years, and station' },
            { title: 'See full pay, BAH, and tax value' },
            { title: 'Compare against civilian salary' },
          ]} />

          {/* ── Proof bar — inside hero ───────────────────────────────── */}
          <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-4 overflow-hidden">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
                Sample output
              </span>
              <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
                E-5 &middot; 8 yrs &middot; Fort Bragg &middot; w/dep
              </p>
              <div className="flex items-baseline gap-4 min-w-0 flex-1">
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Base <span className="font-semibold text-zinc-700">{formatCurrency(tc.monthlyBasePay)}</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">BAH <span className="font-semibold text-zinc-700">{formatCurrency(tc.monthlyBAH)}</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">BAS <span className="font-semibold text-zinc-700">{formatCurrency(tc.monthlyBAS)}</span></span>
              </div>
              <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">Civilian equiv. <span className="text-[16px] font-extrabold text-red-700">&asymp;{formatCurrency(tcCivRounded)}/yr</span></p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <TotalCompensationCalculator />

      {/* ── Direct answer — solid background, below the calculator ────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Total military compensation includes base pay, BAH, BAS, TSP matching, and the tax advantage of allowances excluded from federal taxable income — together these often exceed what most service members realize. An E-5 with 6 years stationed in a mid-cost market typically receives $75,000–$90,000 in total compensation value per year, though the number varies significantly by duty station. This calculator breaks down every component and shows the civilian pretax salary equivalent needed to match your full package.
        </p>
      </div>

      {/* ── Beyond this calculator ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Your military value goes beyond this calculator
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-3">
            Military compensation includes more than base pay. A complete picture adds BAH (excluded from federal taxable income), BAS, federal tax advantages on allowances, BRS/TSP government contributions, and the estimated replacement value of TRICARE healthcare coverage. A civilian job offer needs to be compared against this full economic value — not just the base-pay line on the LES — to determine whether it represents a step up or a pay cut.
          </p>
          <p className="text-zinc-600 text-sm leading-relaxed max-w-2xl">
            Total compensation is just the starting point. These benefits add thousands more in value — and each has its own calculator.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Healthcare */}
          <a
            href="/calculators/healthcare-comparison"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Healthcare (TRICARE)
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Active-duty TRICARE covers you and your family with no enrollment premium. Replacing it as a civilian can cost $600–$1,700/month depending on coverage type.
            </p>
            <span className="text-sm font-medium text-red-700">
              Compare healthcare costs after service →
            </span>
          </a>

          {/* Life Insurance */}
          <a
            href="/calculators/separation-timeline"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Life Insurance (SGLI)
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              SGLI provides $500,000 in coverage for roughly $26/month. Comparable civilian term life insurance for the same coverage can cost $50–$150/month depending on age and health.
            </p>
            <span className="text-sm font-medium text-red-700">
              See your separation benefits timeline →
            </span>
          </a>

          {/* Combat Zone Tax */}
          <a
            href="/calculators/deployment"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Combat Zone Tax Savings
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Serving in a combat zone? Your entire income — base pay, allowances, and special pays — can be federal and state tax-free. That can add thousands to your annual take-home.
            </p>
            <span className="text-sm font-medium text-red-700">
              Calculate deployment pay →
            </span>
          </a>

          {/* Education Benefits */}
          <a
            href="/calculators/education"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Education Benefits
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              The Post-9/11 GI Bill, VR&amp;E, and Tuition Assistance can cover tens of thousands in education costs. These don&apos;t show up on your LES but they&apos;re part of your total package.
            </p>
            <span className="text-sm font-medium text-red-700">
              Compare education benefits →
            </span>
          </a>

          {/* Retirement & TSP */}
          <a
            href="/calculators/tsp"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Retirement &amp; TSP
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              The BRS match alone adds up to 5% of your base pay in government contributions. Over a career, TSP contributions with matching can grow to six or seven figures.
            </p>
            <span className="text-sm font-medium text-red-700">
              Project your TSP growth →
            </span>
          </a>
        </div>
      </section>

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            What Does an E-5 with 8 Years Really Make?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5 (Sergeant / Petty Officer 2nd Class), 8 years of service, stationed at Fort Bragg, NC (ZIP 28310), married with dependents, enrolled in BRS and contributing 5% to TSP.
          </p>
          <ExampleTable>
            <ExampleRow label="Monthly Base Pay (E-5, 8 yrs — 2026 table)" value={`${formatCurrency(tc.monthlyBasePay)}/mo`} />
            <ExampleRow label="BAH — Fort Bragg, NC (with dependents)" value={`${formatCurrency(tc.monthlyBAH)}/mo`} />
            <ExampleRow label="BAS — Enlisted" value={`${formatCurrency(tc.monthlyBAS)}/mo`} />
            <ExampleRow label="Monthly Gross" value={`${formatCurrency(tc.totalMonthly)}/mo`} highlight />
            <ExampleRow label="Annual (Base + BAH + BAS)" value={`${formatCurrency(tcGrossAnnual)}/yr`} />
            <ExampleRow label="BRS Gov Match (auto 1% + 4% match at 5% contribution)" value={`+${formatCurrency(tc.tspAgencyContribution)}/yr`} />
            <ExampleRow label="Tax advantage — BAH &amp; BAS excluded from income (12% marginal)" value={`+${formatCurrency(tc.taxAdvantageValue)}/yr`} />
            <ExampleRow label="TRICARE healthcare value (family)" value={`+${formatCurrency(tc.tricareSavings)}/yr`} />
            <ExampleRow label="Civilian Salary Equivalent" value={`${formatCurrency(tc.civilianEquivalent)}/yr`} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> This E-5 sees {formatCurrency(tc.monthlyBasePay)} on their pay stub, but their true economic compensation is {formatCurrency(tc.civilianEquivalent)} — {tcPctHigher}% higher than base pay alone. The gap comes from BAH and BAS being completely excluded from federal income tax, plus TRICARE family coverage that would cost a civilian roughly {formatCurrency(tc.tricareSavings)}/year in employer-plan premiums. A civilian would need to earn roughly {formatCurrency(tcCivRounded)}{' '}before taxes to match the same financial value, and that still doesn&apos;t count commissary access or the pension.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer accordions ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <hr className="border-zinc-200 mb-6" />

        <div className="space-y-2 mb-8">

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">Why base pay understates your compensation</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                Military pay stubs list Basic Pay prominently because that&apos;s what&apos;s taxable —
                but the two largest allowances, BAH and BAS, are excluded from federal taxable income
                and are generally not taxed by states, but state treatment can vary. A civilian earning
                the same total dollar amount would pay hundreds or thousands more in taxes each year.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The civilian equivalent salary in this calculator accounts for that difference. It
                answers the question: &ldquo;What gross salary would a civilian need to earn to take home
                the same economic value you receive?&rdquo; This is the right number to compare against
                job offers.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">How BAH is calculated</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                BAH (Basic Allowance for Housing) is set by pay grade and local median rental costs for
                the Military Housing Area (MHA) surrounding your duty station. Rates update every January
                1st. With dependents, rates are often higher, but the difference varies by location and
                pay grade.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                BAH is based on rental and utility cost data for your pay grade, dependency status, and
                Military Housing Area. It helps offset housing costs, but your actual out-of-pocket cost
                depends on the housing you choose. You keep any amount under your BAH if you find cheaper
                housing, and you pay the difference if you spend more.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">BRS vs. Legacy retirement</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>Legacy (High-3):</strong> Receive 2.5% × years of service × average of highest
                36 months of basic pay. For a standard active-duty retirement, you must complete 20
                years of qualifying service.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>BRS (Blended Retirement):</strong> A reduced 2.0% pension multiplier plus DoD
                contributions to your TSP: 1% automatic, plus matching up to 4% of basic pay. You build
                retirement savings even if you serve fewer than 20 years. Most service members with a
                DIEMS (Date of Initial Entry to Military Service) on or after January 1, 2018 are
                automatically covered by BRS. Some members who entered service earlier elected BRS
                during the opt-in window.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>BRS contribution timing:</strong> The 1% automatic DoD contribution begins after
                60 days of service. Matching contributions (up to 4%) begin at the start of the
                member&apos;s 25th month of service.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">Understanding BAS</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                BAS (Basic Allowance for Subsistence) is a monthly allowance designed to offset food
                costs. In 2026: enlisted members receive $476.95/month; officers receive $328.48/month.
                BAS is paid regardless of duty station — it does not vary by location.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Like BAH, BAS is fully excluded from federal income tax, adding measurable economic value
                beyond the dollar amount shown on your pay stub.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">What this calculator does not include</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100">
              <p className="text-sm text-zinc-600 mb-3">
                Want to see where your basic pay falls across all ranks?{' '}
                <a href="/calculators/pay-charts" className="underline text-blue-700 hover:text-blue-800">
                  View the full 2026 military pay charts →
                </a>
              </p>
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li>Special pay: flight pay, hazardous duty pay, combat zone tax exclusion, sea pay, etc.</li>
                <li>SGLI life insurance (up to $500K coverage at $26/month as of July 2025)</li>
                <li>Commissary and exchange savings (estimated $2,000–4,000/year for a family)</li>
                <li>Full TRICARE health insurance value — this calculator includes a conservative TRICARE replacement estimate ($2,040/yr for individual, $6,840/yr for family) in the Full Economic Value section based on employer Silver plan premiums. The actual civilian replacement cost can be significantly higher ($12,000–20,000/year for comprehensive family coverage).</li>
                <li>VA loan eligibility and education benefits (GI Bill)</li>
                <li>The value of the military pension itself (not just the TSP match)</li>
                <li>
                  CONUS COLA — if your duty station is in a high-cost area (parts of CA, NY, MA, CT, NJ, or the NCR),
                  you may receive additional taxable allowance.{' '}
                  <a href="/calculators/cola" className="underline text-blue-700 hover:text-blue-800">
                    Check CONUS COLA eligibility →
                  </a>
                </li>
              </ul>
              <p className="text-xs text-zinc-500 mt-3">
                Your total value may be higher than this calculator shows if you receive special pays, use TRICARE, qualify for CONUS COLA, build pension eligibility, or use education and VA loan benefits.
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                <strong>E-1 note:</strong> E-1 members with less than 4 months of active duty receive
                $2,225.70/month. This calculator shows the standard E-1 rate of $2,407.20.
              </p>
            </div>
          </details>

        </div>

        {/* Related calculators */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Related Calculators
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/calculators/bah" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">BAH Calculator →</a>
            <a href="/calculators/deployment" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Deployment Pay Calculator →</a>
            <a href="/calculators/tsp" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">TSP Growth Projector →</a>
            <a href="/calculators/retirement" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Retirement Calculator →</a>
            <a href="/calculators/transition-readiness" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Transition Readiness Calculator →</a>
            <a href="/calculators/compare" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Compare Your PCS Move →</a>
            <a href="/calculators/education" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Education Benefits →</a>
            <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
