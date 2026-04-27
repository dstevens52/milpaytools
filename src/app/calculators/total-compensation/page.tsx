import type { Metadata } from 'next';
import { TotalCompensationCalculator } from '@/components/calculators/total-compensation/TotalCompensationCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Total Military Compensation Calculator 2026: Base Pay, BAH, BAS & Tax Advantages | MilPayTools',
  description:
    'Calculate your true total military compensation: base pay, BAH, BAS, TSP match, and tax advantage. See the civilian salary equivalent using official 2026 DoD rates.',
  alternates: {
    canonical: '/calculators/total-compensation',
  },
};

export default function TotalCompensationPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'Total Military Compensation Calculator 2026', description: 'Calculate your true total military compensation: base pay, BAH, BAS, TSP match, and tax advantage. See the civilian salary equivalent using official 2026 DoD rates.', url: '/calculators/total-compensation' })} />
      {/* ── Page intro ───────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <div className="flex-none w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center">
              <span className="text-white font-black text-lg leading-none select-none">$</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                Total Military Compensation Calculator
              </h1>
              <p className="text-zinc-600 mt-2 text-base leading-relaxed max-w-2xl">
                Base pay is only part of the picture. This calculator adds your BAH (Basic Allowance
                for Housing), BAS (Basic Allowance for Subsistence), TSP retirement match, and
                quantifies the tax advantage of your tax-free allowances — then converts it all into
                a civilian salary equivalent so you can make accurate comparisons.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: '📊', text: 'Official 2026 DoD pay tables' },
              { icon: '🏠', text: '40,959 ZIP codes' },
              { icon: '💼', text: 'BRS & Legacy retirement' },
              { icon: '🧾', text: 'Tax advantage calculation' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-full px-3 py-1"
              >
                <span>{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calculator ───────────────────────────────────────────────── */}
      <TotalCompensationCalculator />

      {/* ── Explainer ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        <hr className="border-zinc-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Why base pay understates your compensation
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              Military pay stubs list Basic Pay prominently because that&apos;s what&apos;s taxable —
              but the two largest allowances, BAH and BAS, are completely excluded from federal income
              tax (and most state income taxes). A civilian earning the same total dollar amount would
              pay hundreds or thousands more in taxes each year.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The civilian equivalent salary in this calculator accounts for that difference. It
              answers the question: &ldquo;What gross salary would a civilian need to earn to take home
              the same economic value you receive?&rdquo; This is the right number to compare against
              job offers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              How BAH is calculated
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              BAH (Basic Allowance for Housing) is set by pay grade and local median rental costs for
              the Military Housing Area (MHA) surrounding your duty station. Rates update every January
              1st. With dependents, rates are often higher, but the difference varies by location and
              pay grade.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              BAH is designed to cover approximately 95% of local median housing costs for your grade
              — it does not increase if you choose more expensive housing, and you keep any amount
              under your BAH if you find cheaper housing. This creates a strong financial incentive to
              live efficiently.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              BRS vs. Legacy retirement
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>Legacy (High-3):</strong> Receive 2.5% × years of service × average of highest
              36 months of basic pay. For a standard active-duty retirement, you must complete 20
              years of qualifying service.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              <strong>BRS (Blended Retirement):</strong> A reduced 2.0% pension multiplier plus DoD
              contributions to your TSP: 1% automatic, plus matching up to 4% of basic pay. You build
              retirement savings even if you serve fewer than 20 years. Most service members who
              with a DIEMS (Date of Initial Entry to Military Service) on or after January 1, 2018 are
              automatically covered by BRS. Some members who entered service earlier elected BRS
              during the opt-in window.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              <strong>BRS contribution timing:</strong> The 1% automatic DoD contribution begins after
              60 days of service. Matching contributions (up to 4%) begin at the start of the
              member&apos;s 25th month of service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">
              Understanding BAS
            </h2>
            <p className="text-zinc-600 text-sm leading-relaxed mb-3">
              BAS (Basic Allowance for Subsistence) is a monthly allowance designed to offset food
              costs. In 2026: enlisted members receive $476.95/month; officers receive $328.48/month.
              BAS is paid regardless of duty station — it does not vary by location.
            </p>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Like BAH, BAS is fully excluded from federal income tax, adding measurable economic value
              beyond the dollar amount shown on your pay stub.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-sm text-zinc-600 mb-3">
            Want to see where your basic pay falls across all ranks?{' '}
            <a href="/calculators/pay-charts" className="underline text-blue-700 hover:text-blue-800">
              View the full 2026 military pay charts →
            </a>
          </p>
          <h3 className="text-base font-semibold text-zinc-900 mb-2">What this calculator does not include</h3>
          <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
            <li>Special pay: flight pay, hazardous duty pay, combat zone tax exclusion, sea pay, etc.</li>
            <li>SGLI life insurance (up to $500K coverage at $26/month as of July 2025)</li>
            <li>Commissary and exchange savings (estimated $2,000–4,000/year for a family)</li>
            <li>TRICARE health insurance value (estimated $12,000–20,000/year civilian equivalent)</li>
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
            The actual economic value of military service is significantly higher than even this
            calculator shows — these items can materially increase the real value of military compensation, depending on your family size, duty station, health care usage, and career path
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            <strong>E-1 note:</strong> E-1 members with less than 4 months of active duty receive
            $2,225.70/month. This calculator shows the standard E-1 rate of $2,407.20.
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

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
