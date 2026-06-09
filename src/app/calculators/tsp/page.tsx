import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { TSPCalculator } from '@/components/calculators/tsp/TSPCalculator';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';
import { projectTSP, getBasePayMonthly } from '@/lib/calculations/tspGrowth';
import { calculateHigh3Average, calculatePension } from '@/lib/calculations/retirement';
import { projectTSPBalance, formatCurrency, formatPercent } from '@/lib/utils';
import { ALLOCATION_PRESETS } from '@/data/tsp/2026/constants';

export const metadata: Metadata = {
  title: { absolute: 'TSP Growth Projector 2026 | Thrift Savings Plan Calculator' },
  description:
    'Project your military TSP balance at retirement. Includes BRS matching, fund allocation, Roth vs Traditional comparison, and compound growth chart. 2026 contribution limits.',
  alternates: {
    canonical: '/calculators/tsp',
  },
  openGraph: {
    title: 'TSP Growth Projector 2026 | Thrift Savings Plan Calculator',
    description:
      'Project your military TSP balance at retirement. Includes BRS matching, fund allocation, Roth vs Traditional comparison, and compound growth chart. 2026 contribution limits.',
    type: 'website',
    url: '/calculators/tsp',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=TSP+Growth+Projector+2026&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TSP Growth Projector 2026 | Thrift Savings Plan Calculator',
    description:
      'Project your military TSP balance at retirement. Includes BRS matching, fund allocation, Roth vs Traditional comparison, and compound growth chart. 2026 contribution limits.',
    images: ['/api/og?type=calculator&title=TSP+Growth+Projector+2026&v=2'],
  },
};

export default function TSPPage() {
  // ── Worked-example values, computed server-side from the TSP growth lib ───────
  // Scenario: E-6 at 10 YOS, BRS, contributing 10% of base pay, $25,000 current
  // balance, projecting 10 more years to a 20-year retirement.
  // Assumptions not pinned down by the narrative (flagged): "aggressive growth" =
  // the calculator's own aggressive preset (C60/S25/I15); 0% annual pay raise, which
  // keeps the monthly contribution flat to match the table's simple FV framing.
  const tspStartBalance = 25000;
  const tspBasePay = getBasePayMonthly('E-6', 10);
  const tspMember = tspBasePay * 0.1;
  const tspProjection = projectTSP({
    startingBalance: tspStartBalance,
    monthlyContribution: tspMember,
    retirementSystem: 'brs',
    payGrade: 'E-6',
    yearsOfService: 10,
    allocation: { ...ALLOCATION_PRESETS.aggressive },
    yearsToProject: 10,
    annualPayRaisePct: 0,
  });
  const tspGovMatch = tspProjection.monthlyGovContribution;
  const tspTotalMonthly = tspMember + tspGovMatch;
  const tspReturnPct = tspProjection.blendedAnnualReturn * 100;
  const tspFvBalance = projectTSPBalance(tspStartBalance, 0, tspReturnPct, 10);
  const tspFvContributions = tspProjection.finalBalance - tspFvBalance;
  const tspGovFutureValue = projectTSPBalance(0, tspGovMatch, tspReturnPct, 10); // FV of the gov-match stream
  // E-7 / 20-year BRS pension, referenced in the closing paragraph.
  const tspE7Pension = calculatePension('brs', 20, calculateHigh3Average('E-7', 20).average);

  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'TSP Growth Projector 2026', description: 'Project your military TSP balance at retirement. Includes BRS matching, fund allocation, Roth vs Traditional comparison, and compound growth chart. 2026 contribution limits.', url: '/calculators/tsp' })} />
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
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">TSP Growth Projector</p>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            Your TSP could be worth more than you think — run the numbers.
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Project your TSP growth year by year — with BRS matching, fund allocation, Roth vs. Traditional comparison, and 2026 contribution limits.
          </p>
        </div>

        {/* ── 3-step plan strip ──────────────────────────────────────── */}
        <CalcStepStrip noBg steps={[
          { title: 'Enter your pay grade and contribution rate' },
          { title: 'See year-by-year TSP growth' },
          { title: 'Compare Roth vs. Traditional and BRS match scenarios' },
        ]} />

        {/* ── Proof bar ──────────────────────────────────────────────── */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          The Thrift Savings Plan is the military&apos;s 401(k) equivalent, with expense ratios typically under 0.06% — among the lowest of any retirement plan available. Under BRS, the government contributes 1% automatically and matches up to 4% more for members who contribute at least 5% of base pay. This calculator projects your TSP balance at retirement based on contribution rate, fund allocation, and the BRS government match.
        </p>
      </div>
        <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-3 overflow-hidden">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
              Sample output
            </span>
            <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
              E-5 &middot; age 26 &middot; BRS 5% &middot; aggressive &middot; $0 starting
            </p>
            <div className="flex-1 min-w-0" />
            <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
              Projected at 65: <span className="font-semibold text-red-700">$2.85M</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <TSPCalculator />

      {/* ── Example Calculation ──────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            What Does an E-6 at 10 Years Project for TSP at Retirement?
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: E-6, 10 years of service, enrolled in BRS, contributing 10% of base pay to TSP in an aggressive growth allocation (approximating L2050), with $25,000 current balance — projecting 10 more years to a 20-year retirement.
          </p>
          <ExampleTable>
            <ExampleRow label="E-6 monthly base pay (10 yrs — 2026 table)" value={formatCurrency(tspBasePay, true)} />
            <ExampleRow label="Member TSP contribution (10%)" value={`${formatCurrency(tspMember, true)}/mo`} />
            <ExampleRow label="BRS gov match (auto 1% + full 4% match)" value={`${formatCurrency(tspGovMatch, true)}/mo`} />
            <ExampleRow label="Total monthly TSP contribution" value={`${formatCurrency(tspTotalMonthly, true)}/mo`} highlight />
            <ExampleRow label="Current balance" value={formatCurrency(tspStartBalance)} />
            <ExampleRow label="Projected blended return (aggressive allocation)" value={`${formatPercent(tspReturnPct)}/yr`} />
            <ExampleRow label={`FV of current balance (10 yrs at ${formatPercent(tspReturnPct)})`} value={formatCurrency(tspFvBalance)} />
            <ExampleRow label={`FV of monthly contributions (10 yrs at ${formatPercent(tspReturnPct)})`} value={formatCurrency(tspFvContributions)} />
            <ExampleRow label="Projected TSP balance at retirement" value={formatCurrency(tspProjection.finalBalance)} highlight />
            <ExampleRow label="Monthly retirement income (4% withdrawal rule)" value={`${formatCurrency(tspProjection.monthlyRetirementIncome4pct)}/mo`} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> By contributing 10% under BRS, the government adds nearly {formatCurrency(tspGovMatch)}/month on top of the member&apos;s {formatCurrency(tspMember)} — effectively a 50% match up to 5% of base pay. Over 10 years, that government contribution alone is worth approximately {formatCurrency(tspGovFutureValue)} in the account. The projected {formatCurrency(tspProjection.monthlyRetirementIncome4pct)}/month in TSP income supplements the BRS pension, which at E-7/20-year retirement adds another {formatCurrency(tspE7Pension)}/month.
          </p>
        </ExampleBox>
      </section>

      {/* ── Explainer ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">What is the TSP?</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              The Thrift Savings Plan is the federal government&apos;s retirement savings plan —
              the military equivalent of a 401(k). It offers five individual investment funds
              (G, F, C, S, I) plus Lifecycle funds that automatically shift to more conservative
              allocations as you approach your target retirement date.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The TSP is among the lowest-cost retirement plans available — with core fund
              expense ratios around a few basis points per year as of 2025. That means more
              of your money stays invested instead of going to fund managers. A civilian 401(k)
              might charge 0.5–1.5% per year, which compounds into dramatically less money at retirement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">BRS Matching Explained</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-2">
              Under the Blended Retirement System (BRS), DoD contributes to your TSP:
            </p>
            <ul className="text-zinc-600 text-sm leading-relaxed space-y-1.5 list-none">
              <li><strong>1% automatic:</strong> DoD puts in 1% of your base pay automatically, even if you contribute nothing. Starts after 60 days of service.</li>
              <li><strong>Dollar-for-dollar on first 3%:</strong> You contribute 3%, DoD matches 3%.</li>
              <li><strong>50¢ on next 2%:</strong> You contribute 2% more (total 5%), DoD adds 1% more.</li>
              <li><strong>Maximum match:</strong> Contribute 5% → DoD adds 5% → 10% of base pay going in each month.</li>
            </ul>
            <p className="text-zinc-600 text-sm leading-relaxed mt-2">
              BRS matching is monthly — if you max out your contributions early in the year (hitting the IRS limit), you stop receiving matching for the rest of the year. Spread contributions evenly across the year.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mt-2">
              <strong>When matching begins:</strong> The automatic 1% DoD contribution starts after 60 days of service. The matching contributions (up to 4%) do not begin until the start of your third year of service — month 25. If you entered service on or after January 1, 2018, full matching kicks in after 24 months. A brand-new E-1 receives only the 1% automatic contribution until that milestone.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Roth vs. Traditional TSP</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Traditional TSP:</strong> Contributions are pre-tax (reduce your taxable income now). Your entire balance is taxed when you withdraw in retirement.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Roth TSP:</strong> Contributions are after-tax (no immediate tax break). Qualified withdrawals in retirement are tax-free, including all the growth.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Combat zone triple tax advantage (Roth TSP only):</strong> If you contribute to Roth TSP from combat zone pay, you get a rare benefit — combat pay is already excluded from income tax, so you pay no tax going in, no tax on the growth, and no tax on the withdrawal. This is a significant tax advantage that applies specifically to Roth TSP in qualifying combat zones.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              <strong>Traditional TSP in a combat zone:</strong> Contributions made from excluded combat pay are not subject to income tax withholding at the time of contribution — but all growth and withdrawals from Traditional TSP are still taxed in retirement. The full triple tax-free benefit only applies to Roth TSP.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">2026 TSP Contribution Limits</h2>
            <div className="space-y-2">
              {[
                { label: 'Elective deferral limit (all ages)', value: '$24,500/year' },
                { label: 'Catch-up contributions (age 50–59, 64+)', value: '+$8,000/year' },
                { label: 'Enhanced catch-up (ages 60–63, SECURE 2.0)', value: '+$11,250/year' },
                { label: 'Annual additions limit (incl. employer contributions)', value: '$72,000/year' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm border-b border-zinc-100 pb-1.5">
                  <span className="text-zinc-600">{label}</span>
                  <span className="font-semibold tabular-nums text-zinc-900 shrink-0">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              In a combat zone, the $72,000 annual additions limit applies to total contributions — but the Roth TSP elective deferral portion is still capped at $24,500. Contributions above that go to Traditional TSP only. Verify your specific situation with your finance office.
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Limits are set by the IRS. Sources:{' '}
              <a href="https://www.tsp.gov/making-contributions/contribution-limits/" target="_blank" rel="noopener noreferrer" className="underline">TSP.gov</a>
              {' '}and{' '}
              <a href="https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits" target="_blank" rel="noopener noreferrer" className="underline">IRS.gov</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">The TSP Funds</h2>
            <div className="space-y-2 text-sm">
              {[
                { fund: 'G Fund', full: 'Government Securities', desc: 'Invests in short-term U.S. Treasury securities. Principal cannot decrease in nominal terms. Returns are currently ~4–5%. Best suited for near-retirement stability or short-term preservation — returns may not outpace inflation over long periods.' },
                { fund: 'F Fund', full: 'Fixed Income Index', desc: 'Tracks the Bloomberg U.S. Aggregate Bond Index. Higher return potential than G, but bond prices fluctuate with interest rates.' },
                { fund: 'C Fund', full: 'Common Stock Index (S&P 500)', desc: 'Tracks the S&P 500. Long-term historical average approximately 10%/year. A common growth option for investors with long time horizons — past performance does not guarantee future results.' },
                { fund: 'S Fund', full: 'Small/Mid Cap Stock Index', desc: 'Tracks the Dow Jones U.S. Completion Total Stock Market Index — everything not in the S&P 500. Higher volatility and higher long-term return potential than C.' },
                { fund: 'I Fund', full: 'International Stock Index', desc: 'Tracks international developed markets. Provides geographic diversification. Performance varies with currency and global economic conditions.' },
              ].map(({ fund, full, desc }) => (
                <div key={fund}>
                  <p className="font-semibold text-zinc-800">{fund} — {full}</p>
                  <p className="text-zinc-500 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">The Power of Starting Early</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Time in the market is the single biggest factor in TSP growth. An E-3 who starts
              contributing $200/month at age 20 (with a 10% blended return) reaches retirement
              at 65 with approximately $1.7M. An E-5 who waits until age 26 to contribute the
              same amount reaches the same age with approximately $1.1M — $600K less, despite
              paying in for only 6 fewer years.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Those early years do the most compounding. Even a small contribution at 20
              beats a larger contribution at 30. Start with what you can, and increase it
              over time as your pay grows.
            </p>
          </div>
        </div>

        {/* What this projection does not include */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-2">What this projection does not include</h3>
          <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
            <li>Inflation — projected balances are in nominal (today&apos;s) dollars, not inflation-adjusted purchasing power</li>
            <li>Taxes on Traditional TSP withdrawals — your actual after-tax income will be lower</li>
            <li>Required Minimum Distributions (RMDs) beginning at age 73</li>
            <li>The Roth TSP 5-year rule — qualified tax-free withdrawals require 5 years to have passed since your first Roth TSP contribution</li>
            <li>TSP loans or early withdrawals — both reduce compound growth and can trigger taxes and penalties</li>
            <li>Future rank or duty status changes — pay grade promotions, early separation, or retirement system changes all affect contributions</li>
            <li>Sequence-of-returns risk — a series of poor returns early in retirement can significantly reduce how long your balance lasts</li>
            <li>State income taxes on Traditional TSP withdrawals — most states tax these; a few exempt military retirement income</li>
          </ul>
        </div>

        {/* Common TSP mistakes */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-2">Common TSP mistakes to understand</h3>
          <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
            <li><strong>Front-loading contributions under BRS:</strong> If you hit the $24,500 annual limit before December, you stop receiving BRS matching contributions for the rest of the year. Spread contributions evenly across all 12 months to capture the full match.</li>
            <li><strong>Moving to the G Fund during market downturns:</strong> Selling out of stock funds when the market drops locks in losses and misses the recovery. Historically, staying invested has outperformed market-timing attempts.</li>
            <li><strong>Taking TSP loans:</strong> A TSP loan removes money from compound growth, and if you separate before repaying it, the outstanding balance becomes a taxable distribution with potential penalties.</li>
            <li><strong>Ignoring the Roth option in low-income years:</strong> Early career — especially in tax-free combat zones — is often the best time to use Roth TSP, since your marginal tax rate is lower and growth compounds tax-free for decades.</li>
            <li><strong>Not keeping beneficiary designations current:</strong> TSP beneficiaries are determined by your TSP designation on file, not your will. Review your designation after major life events (marriage, divorce, birth of a child).</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            This is a projection tool using assumed rates of return, not guaranteed outcomes.
            Default return assumptions (G: 4%, F: 5%, C: 10%, S: 9.5%, I: 7%) are simplified
            long-term historical averages — past performance does not guarantee future results.
            Actual returns will vary year to year, including periods of negative returns.
            This calculator is not financial advice. Consult a fee-only financial advisor or
            accredited financial counselor for personalized guidance.{' '}
            <a
              href="https://www.tsp.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Visit TSP.gov
            </a>{' '}
            for official fund information and contribution rules. 2026 contribution limits
            sourced from{' '}
            <a
              href="https://www.tsp.gov/making-contributions/contribution-limits/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              TSP.gov
            </a>{' '}
            and the IRS.
          </p>
        </div>

        {/* Guide links */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mt-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Learn More
          </p>
          <div className="flex flex-wrap gap-2">
                <a href="/guides/retirement-tsp" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Retirement & TSP Guide →</a>
          </div>
        </div>

      </div>
    </>
  );
}
