import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { GuardReserveCalculator } from '@/components/calculators/guard-reserve/GuardReserveCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'Guard & Reserve Pay Calculator 2026 | Drill Pay + AT + TRS' },
  description:
    'Estimate total Guard and Reserve annual compensation: drill pay (MUTA), Annual Training pay, Tricare Reserve Select savings, and BRS matching. Uses 2026 DFAS pay tables.',
  alternates: {
    canonical: '/calculators/guard-reserve',
  },
  openGraph: {
    title: 'Guard & Reserve Pay Calculator 2026 | Drill Pay + AT + TRS',
    description:
      'Estimate total Guard and Reserve annual compensation: drill pay (MUTA), Annual Training pay, Tricare Reserve Select savings, and BRS matching. Uses 2026 DFAS pay tables.',
    type: 'website',
    url: '/calculators/guard-reserve',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=Guard+%26+Reserve+Pay+Calculator+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guard & Reserve Pay Calculator 2026 | Drill Pay + AT + TRS',
    description:
      'Estimate total Guard and Reserve annual compensation: drill pay (MUTA), Annual Training pay, Tricare Reserve Select savings, and BRS matching. Uses 2026 DFAS pay tables.',
    images: ['/api/og?type=calculator&title=Guard+%26+Reserve+Pay+Calculator+2026&v=2'],
  },
};

export default function GuardReservePage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Guard & Reserve Pay Calculator 2026', description: 'Estimate total Guard and Reserve annual compensation: drill pay (MUTA), Annual Training pay, Tricare Reserve Select savings, and BRS matching. Uses 2026 DFAS pay tables.', url: '/calculators/guard-reserve' })} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-3">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official DFAS 2026 Reserve Pay Data &middot; TRICARE 2026 Premium Data
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Guard &amp; Reserve Pay Calculator
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Calculate your total Guard or Reserve compensation — drill pay, Annual Training, TRICARE Reserve Select value, and BRS/TSP contributions in one view.
          </p>
        </div>
        <CalcStepStrip noBg steps={[
          { title: 'Enter your pay grade and drill schedule' },
          { title: 'See annual drill pay and AT earnings' },
          { title: 'Add TRICARE Reserve Select to see full compensation value' },
        ]} />
      </section>

      {/* ── Calculator ──────────────────────────────────────────────────── */}
      <GuardReserveCalculator />

      {/* ── Example Calculation ──────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Guard and Reserve compensation extends beyond drill pay to include Annual Training pay, TRICARE Reserve Select ($57.88/month member-only or $286.66/month for family in 2026), and BRS TSP matching for enrolled members. An E-6 Guard member attending 48 UTA periods per year earns approximately $16,000–$18,000 in drill pay alone, before counting Annual Training, special pays, or healthcare savings. This calculator combines all components into a single annual compensation view using official 2026 DFAS rates.
        </p>
      </div>
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            What Does a Drilling E-5 Reservist Actually Earn Each Year?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5, 6 years of service, standard drilling reservist — 12 weekend UTAs (48 drill periods), 15-day Annual Training, with TRICARE Reserve Select family coverage. No activations or mobilizations.
          </p>
          <ExampleTable>
            <ExampleRow label="E-5 daily base pay rate (6 yrs — $4,110/mo ÷ 30)" value="$137.00/day" />
            <ExampleRow label="Weekend drill pay (48 periods × $137)" value="$6,576/yr" />
            <ExampleRow label="Annual Training pay (15 days × $137)" value="$2,055/yr" />
            <ExampleRow label="Total drill + AT pay" value="$8,631/yr" highlight />
            <ExampleRow label="Estimated retirement points (48 drills + 15 AT + 15 membership)" value="78 pts/yr" />
            <ExampleRow label="TRICARE Reserve Select — member + family premium" value="$286.66/mo ($3,440/yr)" />
            <ExampleRow label="Avg. employer-sponsored family plan total premiums (KFF 2025 est.)" value="~$27,000/yr" />
            <ExampleRow label="Est. TRS premium value vs. avg. employer plan" value="~$23,500/yr" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> The cash drill pay of $8,631/year understates the total value of reserve service. TRICARE Reserve Select family premiums are $3,440/year — substantially lower than typical employer-sponsored family coverage, though employee payroll cost, deductibles, and employer contributions vary widely. Retirement points accumulate toward a reserve pension payable at age 60.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">How drill pay works</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Guard and Reserve members are paid in drill periods. One drill period equals one
              day&apos;s base pay — the same daily rate as active duty members of the same rank and
              years of service. A standard drill weekend (MUTA-4) consists of four drill periods
              across two days.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The daily rate is calculated as monthly base pay divided by 30. This is the standard
              method used by DFAS for Reserve Component pay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Annual Training pay</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              During Annual Training (AT), Guard and Reserve members receive full active duty pay —
              the same daily rate as their drill pay but for each calendar day of the AT period.
              Most Guard/Reserve members complete 15 days of AT per year, though this varies by
              unit and mission.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Depending on your orders, you may also be eligible for BAH and BAS during AT — use
              the BAH calculator to look up rates at your training location.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Tricare Reserve Select</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Tricare Reserve Select (TRS) is a premium-based health plan available to most
              Selected Reserve members not covered by an employer plan. The 2026 premiums are
              $57.88/month for member-only coverage and $286.66/month for member-and-family
              coverage.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              By comparison, average employer-sponsored family health insurance costs approximately
              $27,000/year in combined employer and employee premiums (KFF 2025 survey). The
              difference — the TRS savings — is a significant but often overlooked component of
              Guard/Reserve compensation.{' '}
              <a href="/calculators/healthcare-comparison" className="font-medium text-red-700 hover:text-red-800 transition-colors">Compare TRS to other healthcare options →</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">BRS matching during active duty</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Under the Blended Retirement System (BRS), government TSP matching contributions only
              apply during active duty periods — Annual Training, ADOS, REFRAD, and other active
              duty orders. Matching does not apply during Inactive Duty Training (IDT) drill
              weekends.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The matching structure mirrors active duty: 1% automatic contribution, dollar-for-dollar
              on the first 3% of base pay you contribute, and 50 cents per dollar on the next 2%.
              Maximum government contribution is 5% of active duty base pay for those periods.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Additional duty types</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Beyond standard drill and AT, Guard and Reserve members may earn pay from several
              additional duty categories: Additional Flight Training Periods (AFTPs) for aviation
              members, Readiness Management Periods (RMPs), Additional Duty (ADOS) orders, military
              schools and training, and deployment orders.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              All of these are paid at the same daily rate as AT — base pay divided by 30 per day.
              During mobilization or deployment, pay rules may differ from the estimates in this
              calculator.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Effective hourly rate</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The effective hourly rate divides your total compensation value by the hours committed.
              This calculator uses 16 hours per drill weekend (two 8-hour days) plus 8 hours per AT/additional duty day
              as the time denominator — a simplified figure that helps compare Guard/Reserve service
              to civilian employment on a per-hour basis.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Guard and Reserve service involves preparation time, travel, and other commitments
              not captured in this calculation. The effective hourly rate is a comparison tool, not
              an exact measure.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-600 mb-2">Disclaimer</p>
          <p>
            This calculator provides estimates based on 2026 base pay tables. Actual pay depends on
            your specific drill schedule, duty status, and unit requirements. Guard and Reserve
            members may receive additional pay during mobilization, deployment, or extended active
            duty orders. BAH and BAS eligibility during drill weekends and AT varies by component
            and orders type. Tricare Reserve Select premiums and civilian insurance comparisons are
            approximate — TRS eligibility and premiums are subject to annual change. Civilian
            insurance comparison uses KFF 2025 survey data and will vary significantly by employer,
            region, and plan. BRS matching rules during Reserve status are governed by current DoD
            policy — verify applicability with your unit finance office. Verify all pay with your
            unit finance office and LES.
          </p>
        </div>

        {/* What this calculator does not include */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5">
          <p className="font-semibold text-zinc-800 mb-2">What this calculator does not include</p>
          <ul className="space-y-1 text-sm text-zinc-500">
            <li className="flex gap-2"><span>•</span> Travel reimbursement or lodging</li>
            <li className="flex gap-2"><span>•</span> Special or incentive pays</li>
            <li className="flex gap-2"><span>•</span> Enlistment or reenlistment bonuses</li>
            <li className="flex gap-2"><span>•</span> Per diem during AT or ADOS orders</li>
            <li className="flex gap-2"><span>•</span> Federal and state income taxes</li>
            <li className="flex gap-2"><span>•</span> SGLI premiums</li>
            <li className="flex gap-2"><span>•</span> Uniform or clothing allowances</li>
            <li className="flex gap-2"><span>•</span> State active duty pay</li>
            <li className="flex gap-2"><span>•</span> Mobilization or deployment pay</li>
            <li className="flex gap-2"><span>•</span> TRS deductibles, copays, or catastrophic cap costs</li>
            <li className="flex gap-2"><span>•</span> Retirement point corrections or official point statements</li>
          </ul>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
                <a href="/calculators/healthcare-comparison" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Healthcare Cost Comparison Calculator →</a>
          </div>
        </div>

      </div>
    </>
  );
}
