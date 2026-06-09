import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { RetirementCalculator } from '@/components/calculators/retirement/RetirementCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import { calculateRetirement } from '@/lib/calculations/retirement';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: { absolute: 'Military Retirement Calculator 2026' },
  description:
    'Estimate your military pension under High-3 or BRS. See monthly pension, lifetime value, TSP projection, and VA disability combined income using 2026 pay tables.',
  alternates: {
    canonical: '/calculators/retirement',
  },
  openGraph: {
    title: 'Military Retirement Calculator 2026',
    description:
      'Estimate your military pension under High-3 or BRS. See monthly pension, lifetime value, TSP projection, and VA disability combined income using 2026 pay tables.',
    type: 'website',
    url: '/calculators/retirement',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=Military+Retirement+Calculator+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Military Retirement Calculator 2026',
    description:
      'Estimate your military pension under High-3 or BRS. See monthly pension, lifetime value, TSP projection, and VA disability combined income using 2026 pay tables.',
    images: ['/api/og?type=calculator&title=Military+Retirement+Calculator+2026&v=2'],
  },
};

export default function RetirementCalculatorPage() {
  // ── Worked-example values, computed server-side from the retirement lib ───────
  // Scenario: E-7 retiring at exactly 20 YOS in 2026. High-3 average comes from the
  // pay table at YOS 20/19/18; BRS pension uses the 2.0% multiplier; the TSP side
  // assumes 5% contribution throughout service at a 7% return.
  // Assumptions not pinned down by the narrative (flagged): the lib projects TSP
  // contributions at a single grade's pay, so this holds E-7 base pay flat across
  // all 20 years (currentGrade E-7, currentYOS 0) with a $0 starting balance.
  const exRet = calculateRetirement({
    retirementSystem: 'brs',
    currentGrade: 'E-7',
    currentYOS: 0,
    retirementYOS: 20,
    retirementGrade: 'E-7',
    tspContributionPct: 5,
    tspCurrentBalance: 0,
    tspAnnualReturnPct: 7,
    vaRating: 0,
  });
  const exBrsAdvantageMonthly = exRet.totalBRSMonthlyIncome - exRet.high3MonthlyPension;

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Military Retirement Calculator 2026', description: 'Estimate your military pension under High-3 or BRS. See monthly pension, lifetime value, TSP projection, and VA disability combined income using 2026 pay tables.', url: '/calculators/retirement' })} />

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
            Military Retirement Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            The &ldquo;Should I stay to 20?&rdquo; calculator. Estimate your pension under High-3 or BRS, project your TSP, and combine VA disability income — all using official 2026 pay tables.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your pay grade and planned service length' },
          { title: 'Compare High-3 vs. BRS pension + TSP' },
          { title: 'See your projected retirement income' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Military retirement pay is an immediate pension beginning at separation, not at age 65. Under High-3, the pension is 2.5% × years of service × average of the highest 36 months of base pay — 50% of High-3 at exactly 20 years; under BRS, the multiplier is 2.0%, partially offset by government TSP matching of up to 5% of base pay over a career. This calculator projects your pension under both systems and models the lifetime value at different career lengths.
        </p>
      </div>
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-7 &middot; 20 yrs &middot; BRS &middot; 40% VA
            </p>
            <div className="flex items-baseline gap-3 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">Pension <span className="font-semibold text-zinc-700">$2,480/mo</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">TSP <span className="font-semibold text-zinc-700">~$190K</span></span>
              <span className="text-[12px] text-zinc-500 whitespace-nowrap">VA <span className="font-semibold text-zinc-700">$796/mo</span></span>
            </div>
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Civilian equiv: <span className="font-semibold text-red-700">~$50K/yr</span>
            </p>
          </div>
        </div>
      </section>

      <div className="bg-zinc-50">
        {/* Calculator */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3 md:py-6">
          <RetirementCalculator />
        </div>

        
{/* Example Calculation */}
        <section className="calc-example mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <ExampleBox>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              BRS vs. High-3 at 20 Years: What Does an E-7 Actually Take Home?
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed mb-0">
              Scenario: E-7, retiring at exactly 20 years of service in 2026. High-3 average calculated from the three years immediately preceding retirement. BRS pension assumes 5% TSP contribution throughout service.
            </p>
            <ExampleTable>
              <ExampleRow label="High-3 average base pay (yrs 18, 19, 20 — E-7)" value={`${formatCurrency(exRet.high3Average, true)}/mo`} />
              <ExampleRow label={`High-3 pension (2.5% × 20 yrs × ${formatCurrency(exRet.high3Average, true)})`} value={`${formatCurrency(exRet.high3MonthlyPension)}/mo`} highlight />
              <ExampleRow label="High-3 annual pension" value={`${formatCurrency(exRet.high3MonthlyPension * 12)}/yr`} />
              <ExampleRow label={`BRS pension (2.0% × 20 yrs × ${formatCurrency(exRet.high3Average, true)})`} value={`${formatCurrency(exRet.monthlyPension)}/mo`} highlight />
              <ExampleRow label="BRS TSP projected balance (5% contrib, 20 yrs, 7% return)" value={`~${formatCurrency(exRet.tspProjectedBalance)}`} />
              <ExampleRow label="BRS TSP monthly income (4% rule)" value={`+${formatCurrency(exRet.tspMonthlyIncome)}/mo`} />
              <ExampleRow label="BRS total monthly income (pension + TSP)" value={`${formatCurrency(exRet.totalBRSMonthlyIncome)}/mo`} highlight />
              <ExampleRow label="BRS advantage over High-3" value={`+${formatCurrency(exBrsAdvantageMonthly)}/mo + ${formatCurrency(exRet.tspProjectedBalance)} accessible`} />
            </ExampleTable>
            <p className="text-sm leading-relaxed text-zinc-700">
              <strong>What this means:</strong> On this flat-pay basis, BRS edges out High-3 by a slim margin — {formatCurrency(exRet.totalBRSMonthlyIncome)}/month total versus {formatCurrency(exRet.high3MonthlyPension)}/month — so neither system runs away with it in this snapshot. They weight different things. High-3 pays the larger pension (the 2.5% multiplier, {formatCurrency(exRet.high3MonthlyPension)}/month) but only if you reach 20 years; leave earlier and there is no pension. BRS pays a smaller pension ({formatCurrency(exRet.monthlyPension)}/month) and adds the TSP on top: {formatCurrency(exRet.tspMonthlyIncome)}/month of income drawn from a {formatCurrency(exRet.tspProjectedBalance)} balance after 20 years — and unlike the pension, your TSP is yours to keep even if you separate earlier. This example holds E-7 pay constant across all 20 years to keep the math simple; over a real career the gap tends to widen in BRS&apos;s favor, because pay rises with promotions and longevity and the 5% match compounds on that higher pay, so the matched TSP grows faster than this flat-pay snapshot shows. Which side comes out ahead depends on how long you serve and how the match is invested. Retirees also keep TRICARE at a fraction of civilian cost — <a href="/calculators/healthcare-comparison" className="text-red-700 underline hover:text-red-800">see what replacing it would cost on the civilian side</a>.
            </p>
          </ExampleBox>
        </section>

        {/* Explainer */}
        <div className="bg-white border-t border-zinc-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <h2 className="text-2xl font-bold text-zinc-900">Understanding Military Retirement</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <li className="flex gap-2"><span className="text-red-700">•</span> 1% automatic contribution — generally begins after 60 days of service</li>
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

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
              <p>
                This calculator provides estimates for educational purposes only. Actual retirement pay depends on
                your individual service record, promotion history, and pay table changes over the course of your
                career. The High-3 average used here is estimated from 2026 pay table values at your selected
                retirement rank — it does not account for actual pay history, mid-career promotions, or future
                pay table adjustments. TSP projections assume a constant contribution rate and a fixed annual
                return; actual returns will vary. VA disability compensation amounts are from official 2026 VA
                rate tables (veteran alone, no dependents). CRDP eligibility requires 20+ years of qualifying
                service and a VA disability rating of 50% or higher — eligibility determinations are made by
                DFAS, not this calculator. This is not financial, tax, or legal advice. Verify all estimates
                with DFAS, your installation finance office, or an accredited military financial counselor.
              </p>
            </div>
          </div>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/guides/retirement-tsp" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Retirement &amp; TSP Guide →</a>
            <a href="/calculators/healthcare-comparison" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Healthcare Cost Comparison Calculator →</a>
            <a href="/calculators/separation-timeline" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Separation Benefits Timeline →</a>
          </div>
        </div>
      </div>
    </>
  );
}
