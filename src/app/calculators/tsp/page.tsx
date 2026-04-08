import type { Metadata } from 'next';
import { TSPCalculator } from '@/components/calculators/tsp/TSPCalculator';

export const metadata: Metadata = {
  title: 'TSP Growth Projector 2026 | Thrift Savings Plan Calculator | MilPayTools',
  description:
    'Project your military TSP balance at retirement. Includes BRS matching, fund allocation, Roth vs Traditional comparison, and compound growth chart. 2026 contribution limits.',
  alternates: {
    canonical: '/calculators/tsp',
  },
};

export default function TSPPage() {
  return (
    <>
      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">↗</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                TSP Growth Projector
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                See how your Thrift Savings Plan grows between now and retirement. Inputs your
                pay grade, BRS matching, and fund allocation — then models compound growth year by year
                with a contribution increase assumption and a full Roth vs. Traditional comparison.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              'BRS matching calculator',
              'Fund allocation (G/F/C/S/I)',
              'Roth vs Traditional',
              '2026 contribution limits',
              'Year-by-year growth chart',
            ].map((text) => (
              <span
                key={text}
                className="inline-flex items-center text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <TSPCalculator />

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
              The TSP has the lowest expense ratios of any retirement plan in the country — as
              of 2025, around 0.04% annually. That means more of your money stays invested
              instead of going to fund managers. A civilian 401(k) might charge 0.5–1.5% per year,
              which compounds into dramatically less money at retirement.
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
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">Roth vs. Traditional TSP</h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Traditional TSP:</strong> Contributions are pre-tax (reduce your taxable income now). Your entire balance is taxed when you withdraw in retirement.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Roth TSP:</strong> Contributions are after-tax (no immediate tax break). Qualified withdrawals in retirement are completely tax-free, including all the growth.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              <strong>Combat zone triple tax advantage:</strong> If you contribute to Roth TSP from combat zone pay, you get a uniquely powerful benefit — combat pay is excluded from income tax, so you pay no tax going in, no tax on the growth, and no tax on the withdrawal. This is one of the best tax advantages available to any American investor.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">2026 TSP Contribution Limits</h2>
            <div className="space-y-2">
              {[
                { label: 'Elective deferral limit (all ages)', value: '$24,500/year' },
                { label: 'Catch-up contributions (age 50–59, 64+)', value: '+$8,000/year' },
                { label: 'Enhanced catch-up (ages 60–63, SECURE 2.0)', value: '+$11,250/year' },
                { label: 'Annual additions limit (incl. employer match)', value: '$72,000/year' },
                { label: 'Combat zone limit (all contributions)', value: '$72,000/year' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm border-b border-zinc-100 pb-1.5">
                  <span className="text-zinc-600">{label}</span>
                  <span className="font-semibold tabular-nums text-zinc-900 shrink-0">{value}</span>
                </div>
              ))}
            </div>
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
                { fund: 'G Fund', full: 'Government Securities', desc: 'Invests in short-term U.S. Treasury securities. Principal cannot decrease. Returns are currently ~4–5%. Good for near-retirement capital preservation.' },
                { fund: 'F Fund', full: 'Fixed Income Index', desc: 'Tracks the Bloomberg U.S. Aggregate Bond Index. Higher return potential than G, but bond prices fluctuate with interest rates.' },
                { fund: 'C Fund', full: 'Common Stock Index (S&P 500)', desc: 'Tracks the S&P 500. Long-term average ~10%/year. The most popular single-fund choice for young, growth-oriented investors.' },
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
              The math is unforgiving: those early years do the most compounding. Even a
              very small contribution at 20 beats a large contribution at 30. Start now,
              even if the amount is small.
            </p>
          </div>
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
      </div>
    </>
  );
}
