import type { Metadata } from 'next';
import { GuardReserveCalculator } from '@/components/calculators/guard-reserve/GuardReserveCalculator';

export const metadata: Metadata = {
  title: 'Guard & Reserve Pay Calculator 2026 | Drill Pay + AT + TRS | MilPayTools',
  description:
    'Estimate total Guard and Reserve annual compensation: drill pay (MUTA), Annual Training pay, Tricare Reserve Select savings, and BRS matching. Uses 2026 DFAS pay tables.',
  alternates: {
    canonical: '/calculators/guard-reserve',
  },
};

export default function GuardReservePage() {
  return (
    <>
      {/* ── Page intro ──────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">⭐</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                Guard &amp; Reserve Pay Calculator — 2026
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Estimate your total annual compensation as a Guard or Reserve member — drill pay,
                Annual Training income, Tricare Reserve Select savings, and BRS government TSP
                matching. See what your service is actually worth per drill weekend.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { text: 'All ranks E-1 through O-10' },
              { text: 'MUTA-4/6/8 drill schedules' },
              { text: 'TRS healthcare savings' },
              { text: '2026 DFAS pay tables' },
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

      {/* ── Calculator ──────────────────────────────────────────────────── */}
      <div className="bg-zinc-50">
        <GuardReserveCalculator />
      </div>

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
              $23,000/year in combined employer and employee premiums (KFF 2025 survey). The
              difference — the TRS savings — is a significant but often overlooked component of
              Guard/Reserve compensation.
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
              This calculator uses 8 hours per drill weekend plus 8 hours per AT/additional duty day
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

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/military-pay" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay & Compensation Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
