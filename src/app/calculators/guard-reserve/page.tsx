import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { GuardReserveCalculator } from '@/components/calculators/guard-reserve/GuardReserveCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { webApplicationSchema } from '@/lib/schema';
import { calculateGuardReserve, HOURS_PER_DRILL_PERIOD, HOURS_PER_DUTY_DAY } from '@/lib/calculations/guardReserve';
import { TRICARE_RATES_2026 } from '@/data/tricare/2026/constants';
import { formatCurrency } from '@/lib/utils';

// Absolute title (no " | MilPayTools" suffix) — 56 chars.
const GR_TITLE = 'Guard & Reserve Drill Pay Calculator 2026 (All Branches)';
const GR_DESC =
  'Estimate 2026 drill pay (MUTA), AT pay, BAS and BRS TSP: Army Reserve & National Guard, Navy Reserve, Air Force Reserve, Air National Guard, Marine Reserve.';

const GR_FAQS: FaqItem[] = [
  {
    question:
      'Is drill pay the same for the Army Reserve, Navy Reserve, Air National Guard and other components?',
    answer:
      'Yes. Drill pay is based on the same basic pay tables for every reserve component. Each drill period (typically four per drill weekend) pays 1/30 of the monthly basic pay for your grade and years of service.',
  },
  {
    question: 'Do I get BAH during Annual Training?',
    answer:
      'For orders of 30 days or fewer (most Annual Training), Guard and Reserve members generally receive BAH Reserve Component/Transit (BAH-RC/T), a non-locality rate, rather than the local BAH rate.',
  },
];

export const metadata: Metadata = {
  title: { absolute: GR_TITLE },
  description: GR_DESC,
  alternates: {
    canonical: '/calculators/guard-reserve',
  },
  openGraph: {
    title: GR_TITLE,
    description: GR_DESC,
    type: 'website',
    url: '/calculators/guard-reserve',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'Guard & Reserve Pay Calculator 2026', sub: 'Drill pay, Annual Training, BAS, and BRS contributions' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: GR_TITLE,
    description: GR_DESC,
    images: ogImage({ type: 'calculator', title: 'Guard & Reserve Pay Calculator 2026', sub: 'Drill pay, Annual Training, BAS, and BRS contributions' }),
  },
};

export default function GuardReservePage() {
  // ── Worked-example values, computed server-side from the Guard/Reserve lib ────
  // Scenario: E-5, 6 YOS, 12 weekend UTAs (MUTA-4 = 48 drill periods), 15-day AT,
  // TRICARE Reserve Select family coverage, no activations.
  const gr = calculateGuardReserve({
    rank: 'E-5',
    yearsOfService: 6,
    weekendsPerYear: 12,
    periodsPerWeekend: 4,
    atDays: 15,
    additionalDays: 0,
    trsPlan: 'family',
    brsEnrolled: false,
    tspContribPct: 0,
  });
  const grTrsMonthly = gr.trsMonthlyPremium;
  // Retirement points: 1 per drill period + 1 per AT day + 15 membership points.
  const grDrillPeriods = 12 * 4;
  const grPoints = grDrillPeriods + 15 + 15;
  const usd2 = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const trsMemberOnly = usd2(TRICARE_RATES_2026.reserveSelect.memberOnly);
  const trsFamily = usd2(TRICARE_RATES_2026.reserveSelect.memberAndFamily);

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Guard & Reserve Pay Calculator 2026', description: GR_DESC, url: '/calculators/guard-reserve' })} />
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
            Calculate your total Guard or Reserve compensation — drill pay, Annual Training pay and BAS, and BRS/TSP contributions in one view, with your TRICARE Reserve Select premium shown separately.
          </p>
        </div>
        <CalcStepStrip noBg steps={[
          { title: 'Enter your pay grade and drill schedule' },
          { title: 'See annual drill pay and AT earnings' },
          { title: 'Add BRS contributions and see your TRS premium' },
        ]} />
      </section>

      {/* ── Calculator ──────────────────────────────────────────────────── */}
      <GuardReserveCalculator />

      {/* ── Example Calculation ──────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          Guard and Reserve compensation includes drill pay, Annual Training pay and BAS, possible active-duty periods, retirement points, and BRS TSP contributions when eligible; BRS contributions apply to drill pay as well as active-duty pay. TRICARE Reserve Select is a premium you pay, shown separately. A standard drilling member may earn several thousand dollars per year in drill and AT pay. This calculator combines the pay components into a single annual view using official 2026 DFAS rates.
        </p>
      </div>
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            What Does a Drilling E-5 Reservist Actually Earn Each Year?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-5, 6 years of service, standard drilling reservist — 12 weekend UTAs ({grDrillPeriods} drill periods), 15-day Annual Training, with TRICARE Reserve Select family coverage. No activations or mobilizations.
          </p>
          <ExampleTable>
            <ExampleRow label={`E-5 daily base pay rate (6 yrs — ${formatCurrency(gr.monthlyBasePay)}/mo ÷ 30)`} value={`${formatCurrency(gr.dailyRate, true)}/day`} />
            <ExampleRow label={`Weekend drill pay (${grDrillPeriods} periods × ${formatCurrency(gr.dailyRate)})`} value={`${formatCurrency(gr.annualDrillPay)}/yr`} />
            <ExampleRow label={`Annual Training pay (15 days × ${formatCurrency(gr.dailyRate)})`} value={`${formatCurrency(gr.atPay)}/yr`} />
            <ExampleRow label={`BAS during Annual Training (15 days × ${formatCurrency(gr.monthlyBAS, true)}/mo ÷ 30)`} value={`${formatCurrency(gr.atBAS)}/yr`} />
            <ExampleRow label="Total drill + AT pay (incl. BAS)" value={`${formatCurrency(gr.totalMilitaryPay)}/yr`} highlight />
            <ExampleRow label={`Estimated retirement points (${grDrillPeriods} drills + 15 AT + 15 membership)`} value={`${grPoints} pts/yr`} />
            <ExampleRow label="TRICARE Reserve Select — member + family premium (a cost, not in the total)" value={`${formatCurrency(grTrsMonthly, true)}/mo (${formatCurrency(gr.trsAnnualPremium)}/yr)`} />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> Drill weekends and Annual Training pay {formatCurrency(gr.totalMilitaryPay)}/year in this scenario. TRICARE Reserve Select family coverage costs {formatCurrency(gr.trsAnnualPremium)}/year in premiums; employer plans vary widely, so the <a href="/calculators/healthcare-comparison" className="font-medium text-red-700 hover:text-red-800">Healthcare Cost Comparison</a> calculator is the place to compare options. Retirement points accumulate toward a reserve pension payable at age 60.
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
              across two days, and each paid drill period is at least 4 hours.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The daily rate is calculated as monthly base pay divided by 30. This is the standard
              method used by DFAS for Reserve Component pay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Annual Training pay</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              During Annual Training (AT), Guard and Reserve members receive active-duty basic pay and
              BAS for each day on orders (housing allowance not included here) — basic pay at the same
              daily rate as drill pay, for each calendar day of the AT period.
              Most Guard/Reserve members complete 15 days of AT per year, though this varies by
              unit and mission.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              For orders of 30 days or fewer, Guard and Reserve members generally receive BAH Reserve
              Component/Transit (BAH-RC/T), a non-locality rate.{' '}
              <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/" target="_blank" rel="noopener" className="font-medium text-red-700 hover:text-red-800 transition-colors">DTMO BAH rates →</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Tricare Reserve Select</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Tricare Reserve Select (TRS) is a premium-based health plan available to most
              Selected Reserve members not covered by an employer plan. The 2026 premiums are
              {trsMemberOnly}/month for member-only coverage and {trsFamily}/month for
              member-and-family coverage.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The premium is a cost, so this calculator shows it separately from your pay. Employer
              plans vary widely; compare your options with the{' '}
              <a href="/calculators/healthcare-comparison" className="font-medium text-red-700 hover:text-red-800 transition-colors">Healthcare Cost Comparison calculator →</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">BRS contributions on drill and active-duty pay</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Under the Blended Retirement System (BRS), the government&apos;s TSP contributions apply
              to drill pay and active-duty pay — Annual Training, ADOS, and other active duty orders.
              The 1% automatic contribution starts after 60 days of service; matching starts after
              2 years of service.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The structure mirrors active duty: 1% automatic contribution, dollar-for-dollar
              on the first 3% of base pay you contribute, and 50 cents per dollar on the next 2%.
              Maximum government contribution is 5% of basic pay.
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
              This calculator uses {HOURS_PER_DRILL_PERIOD} hours per paid drill period (each paid drill period is at
              least {HOURS_PER_DRILL_PERIOD} hours) plus {HOURS_PER_DUTY_DAY} hours per AT/additional duty day
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

        <FaqSection faqs={GR_FAQS} />

        {/* Disclaimer */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-600 mb-2">Disclaimer</p>
          <p>
            This calculator provides estimates based on 2026 base pay tables. Actual pay depends on
            your specific drill schedule, duty status, and unit requirements. Guard and Reserve
            members may receive additional pay during mobilization, deployment, or extended active
            duty orders. BAH and BAS eligibility during drill weekends and AT varies by component
            and orders type. TRS eligibility and premiums are subject to annual change. BRS matching rules during Reserve status are governed by current DoD
            policy — verify applicability with your unit finance office. Verify all pay with your
            unit finance office and LES.
          </p>
        </div>

        {/* What this calculator does not include */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5">
          <p className="font-semibold text-zinc-800 mb-2">What this calculator does not include</p>
          <ul className="space-y-1 text-sm text-zinc-500">
            <li className="flex gap-2"><span>•</span> BAH Reserve Component/Transit (BAH-RC/T) or other housing allowance during AT or other orders</li>
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
