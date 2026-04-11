import type { Metadata } from 'next';
import { DeploymentCalculator } from '@/components/calculators/deployment/DeploymentCalculator';

export const metadata: Metadata = {
  title: 'Deployment Pay Calculator 2026 | CZTE, HFP, SDP | MilPayTools',
  description:
    'Calculate your deployment pay increase: HFP/IDP, Hardship Duty Pay, FSA, CZTE tax savings, and Savings Deposit Program interest. All ranks, 2026 rates.',
  alternates: {
    canonical: 'https://milpaytools.com/calculators/deployment',
  },
};

export default function DeploymentPage() {
  return (
    <>
      {/* ── Page intro ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">🎖️</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                Deployment Pay Calculator — 2026 Rates
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                See exactly how much more you take home during a deployment — before vs. during vs.
                full tour total. Models HFP/IDP, Hardship Duty Pay, Family Separation Allowance,
                Combat Zone Tax Exclusion, Savings Deposit Program, and TSP contribution capacity.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { text: 'All ranks E-1 through O-10' },
              { text: 'CZTE tax savings (enlisted & officer)' },
              { text: 'SDP 10% guaranteed return' },
              { text: '2026 DoD & IRS rates' },
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

      {/* ── Calculator ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-50">
        <DeploymentCalculator />
      </div>

      {/* ── Explainer ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Combat Zone Tax Exclusion (CZTE)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Service members in a designated combat zone receive federal income tax relief under
              26 U.S.C. § 112. Enlisted members and warrant officers have all military pay excluded
              from federal income tax for any month they serve in the combat zone — even one day in a
              month qualifies the entire month.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Officers receive the same exclusion but capped at the highest enlisted rate (E-9 maximum
              base pay) plus the HFP/IDP amount — approximately $10,520/month in 2026. Base pay
              above that cap remains taxable. State income tax treatment varies by state — many states
              follow the federal exclusion, others do not.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Savings Deposit Program (SDP)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The SDP is a government-backed savings account offering a guaranteed 10% annual return
              — available only to service members deployed to designated combat zones for 30 or more
              consecutive days. The maximum deposit is $10,000; interest is compounded quarterly at
              2.5% per quarter.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              SDP interest continues for 90 days after leaving the combat zone, making the full
              return slightly higher than the deployment window suggests. The SDP is administered
              through DFAS — open an account through your unit finance office or myPay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Hostile Fire Pay / Imminent Danger Pay
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              HFP and IDP are both authorized under 37 U.S.C. § 310 at the same rate — $225/month
              in 2026. HFP is typically paid as a flat monthly rate for members engaged with or under
              threat of hostile fire. IDP may be prorated on a daily basis depending on the type of
              deployment and qualifying conditions — verify with your finance office how your specific
              deployment is categorized.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              When receiving HFP or IDP, Hardship Duty Pay is capped at $100/month (down from
              $150/month maximum) per DoD FMR Volume 7A, Chapter 17.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Family Separation Allowance (FSA)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              FSA is authorized when a service member with dependents is deployed away from them for
              30 or more consecutive days. The FY2026 NDAA increased FSA from $250 to $300/month —
              the first increase since 2002. FSA is a non-taxable allowance.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              FSA requires dependents to be enrolled — it is not paid to single members without
              dependents. Authorization is under 37 U.S.C. § 427.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              TSP during deployment
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              During months in a designated combat zone, the TSP contribution limit rises from the
              normal elective deferral limit ($24,500 in 2026) to the IRC § 415(c) total additions
              limit ($72,000 in 2026). This dramatically increases the amount you can shelter
              tax-free during a deployment.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Contributions above the normal limit must go into the traditional TSP — not Roth TSP —
              during combat zone months. Plan your contribution percentage in advance; DFAS processes
              TSP elections and changes through myPay.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Hardship Duty Pay — Location (HDP-L)
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              HDP-L is a tiered allowance authorized under 37 U.S.C. § 305 for service in locations
              designated as hardship duty areas. The four tiers are $50, $100, $150, and $0 (no
              HDP). The level is determined by the specific deployment location designation, not by
              personal election.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              HDP-L is capped at $100/month when also receiving HFP or IDP. If your deployment
              location is designated at the $150 tier but you are also receiving HFP, you receive
              $100 HDP-L — not $150.
            </p>
          </div>
        </div>

        {/* Cross-links */}
        <div className="space-y-3">
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
            <span className="font-semibold text-zinc-800">Planning for retirement?</span>{' '}
            The{' '}
            <a href="/calculators/tsp" className="text-blue-700 hover:underline font-medium">
              TSP Growth Projector
            </a>{' '}
            can model the long-term impact of maxing your TSP contributions during a combat zone
            deployment — the jump from $24,500 to $72,000 in contribution room is significant.
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-600">
            <span className="font-semibold text-zinc-800">Leaving dependents behind?</span>{' '}
            The{' '}
            <a href="/calculators/bah" className="text-blue-700 hover:underline font-medium">
              BAH Calculator
            </a>{' '}
            can help your family understand the housing allowance that continues during deployment —
            BAH does not stop when you deploy.
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-600 mb-2">Disclaimer</p>
          <p>
            This calculator provides estimates based on published 2026 DoD and IRS rates. Actual
            entitlements depend on your deployment orders, official combat zone designation, DFAS
            processing, and individual tax situation. HFP/IDP rate: $225/month (37 U.S.C. § 310).
            FSA: $300/month (37 U.S.C. § 427, FY2026 NDAA). CZTE: 26 U.S.C. § 112 and IRS
            Publication 3. SDP: 10 U.S.C. § 1035. TSP combat zone limit: IRC § 415(c) — $72,000
            for 2026. Federal tax calculation uses 2026 tax brackets and standard deduction for
            single filers; actual taxes will vary based on filing status, deductions, and state tax
            law. Always verify your specific entitlements with your finance office and DFAS.
          </p>
        </div>
      </div>
    </>
  );
}
