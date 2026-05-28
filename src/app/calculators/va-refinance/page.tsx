import type { Metadata } from 'next';
import Link from 'next/link';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema, faqPageSchema } from '@/lib/schema';

const FAQS = [
  {
    question: 'What is a VA Streamline Refinance (IRRRL)?',
    answer: 'The IRRRL (Interest Rate Reduction Refinance Loan) is a VA refinance program for existing VA loan borrowers. It typically requires no appraisal and no income verification. The funding fee is 0.5% — much lower than purchase loans — and disability-rated veterans are exempt. The refinance must result in a lower interest rate, lower payment, or a transition from an adjustable-rate to a fixed-rate mortgage. It can only refinance an existing VA loan.',
  },
  {
    question: 'What is a VA Cash-Out Refinance?',
    answer: 'A VA Cash-Out Refinance replaces your current mortgage — VA or non-VA — with a new VA loan. Unlike the IRRRL, it can convert a conventional or FHA loan to a VA loan and can access home equity as cash. It requires full underwriting including appraisal, income verification, and credit check. Funding fee: 2.15% first use, 3.30% subsequent use — same rates as purchase loans.',
  },
  {
    question: 'What is the VA net tangible benefit requirement?',
    answer: 'For a fixed-to-fixed IRRRL, the VA requires the new interest rate to be at least 0.5% lower than the current rate. Converting from an adjustable-rate to a fixed-rate mortgage counts as a benefit in itself. The VA also uses a 36-month recoupment guideline: closing costs should be recouped through monthly savings within 36 months. Lenders must document cases where either threshold is not met.',
  },
  {
    question: 'When does refinancing not make financial sense?',
    answer: 'Refinancing may not make sense if you plan to sell before the break-even point (closing costs not yet recouped), the rate reduction is too small to justify the fees, you are restarting a long remaining term on a new 30-year loan, or you have paid down substantial principal and would restart the amortization clock with more interest-heavy early payments.',
  },
];
import { VARefinanceCalculator } from '@/components/calculators/va-refinance/VARefinanceCalculator';

const TITLE = 'VA Refinance Calculator 2026 | IRRRL & Cash-Out Savings, Break-Even & VA Requirements';
const DESC =
  'Should you refinance your VA loan? Calculate monthly savings, break-even point, and check VA net tangible benefit requirements — IRRRL and cash-out refinance.';
const CANONICAL = '/calculators/va-refinance';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: 'website',
    url: CANONICAL,
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=VA+Refinance+Calculator+2026&v=1', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ['/api/og?type=calculator&title=VA+Refinance+Calculator+2026&v=1'],
  },
};

export default function VARefinancePage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({
        name: 'VA Refinance Calculator 2026',
        description: DESC,
        url: CANONICAL,
      })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200 md:min-h-[340px]"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        <div className="relative z-10">
          <div className="mx-auto max-w-5xl pt-6 sm:pt-9 px-4">
            <div className="sm:max-w-[65%] mb-5">

              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
                  Free &middot; No Account &middot; No Personal Info &middot; Official 2026 VA Data
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[28px] sm:text-[38px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
                VA Refinance Calculator
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Compare your current VA loan to a new rate. See monthly savings, break-even, VA recoupment estimate, and whether the IRRRL meets VA requirements.
              </p>

            </div>
          </div>

          {/* 3-step strip */}
          <CalcStepStrip noBg steps={[
            { title: 'Enter your current loan details' },
            { title: 'Set your new rate and terms' },
            { title: 'See savings, break-even, VA recoupment, and requirement checks' },
          ]} />

          {/* Sample output bar */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          An IRRRL (VA Streamline Refinance) allows existing VA loan holders to lower their interest rate with minimal paperwork — typically no appraisal and no full income verification required — and carries a 0.50% funding fee, the lowest of any VA loan type. A VA cash-out refinance carries a higher funding fee (2.15% or 3.30%) and requires a full appraisal and underwriting. This calculator estimates monthly savings, break-even timeline, and whether the VA&apos;s net tangible benefit requirement is met for your specific scenario.
        </p>
      </div>
          <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-4 overflow-hidden">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
                Sample output
              </span>
              <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
                Current $300K at 7% → New 6% &middot; 25 yrs remaining &middot; IRRRL
              </p>
              <div className="flex items-baseline gap-4 min-w-0 flex-1">
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Monthly savings <span className="font-semibold text-zinc-700">$312</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Your break-even <span className="font-semibold text-zinc-700">13 months</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">VA recoupment <span className="font-semibold text-red-700 text-[16px] font-extrabold">9 months</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <VARefinanceCalculator />

      {/* ── Next steps cards ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Related tools</h2>
          <p className="text-zinc-600 text-sm leading-relaxed max-w-2xl">
            Refinancing is one piece of the VA loan benefit. These tools help you use it fully.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/calculators/va-loan"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Estimate a VA purchase payment
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Buying instead of refinancing? Estimate your VA loan payment with funding fee, BAH comparison, and VA vs. conventional breakdown.
            </p>
            <span className="text-sm font-medium text-red-700">Open VA loan calculator →</span>
          </Link>

          <Link
            href="/calculators/va-disability"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Check your VA disability rating
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              A disability rating of 10% or higher waives the refinance funding fee too. Calculate your combined rating to see if you qualify.
            </p>
            <span className="text-sm font-medium text-red-700">Calculate combined VA rating →</span>
          </Link>

          <Link
            href="/guides/va-home-loans"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              VA Home Loans Guide
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Understand the full VA loan benefit — eligibility, funding fee, IRRRL, entitlement, and when VA may or may not be the best option.
            </p>
            <span className="text-sm font-medium text-red-700">Read the guide →</span>
          </Link>

          <Link
            href="/calculators/bah"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Look up your BAH rate
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              See your 2026 housing allowance by duty station and rank. BAH is counted as income for VA loan qualification.
            </p>
            <span className="text-sm font-medium text-red-700">Look up BAH rates →</span>
          </Link>
        </div>
      </section>

      {/* ── Example calculation ───────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            IRRRL Example — $300K at 7% → 6%, 30-Year Fixed
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: $300,000 balance, 7.0% current rate, 25 years remaining. Refinancing to 6.0% on a new 30-year. Closing costs $2,500. No disability exemption.
          </p>
          <ExampleTable>
            <ExampleRow label="Current monthly P&I (25 years remaining, 7.0%)" value="$2,120" />
            <ExampleRow label="VA IRRRL funding fee (0.5%)" value="$1,500" />
            <ExampleRow label="New loan balance" value="$301,500" />
            <ExampleRow label="New monthly P&I (6.0%, 30 years)" value="$1,808" highlight />
            <ExampleRow label="Monthly savings" value="$312/mo" />
            <ExampleRow label="Your break-even (fee + $2,500 closing ÷ savings)" value="13 months" />
            <ExampleRow label="VA recoupment estimate ($2,500 closing ÷ savings)" value="9 months" />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> The rate reduction meets VA&apos;s 0.5% net tangible benefit requirement. VA recoupment estimate — closing costs only, excluding the funding fee — is 9 months, well within the 36-month guideline. Your all-in consumer break-even including the funded fee is 13 months. A borrower with a 10%+ disability rating pays no funding fee — both measures equal 8 months.
          </p>
        </ExampleBox>
      </section>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <hr className="border-zinc-200 mb-6" />

        <div className="space-y-2 mb-8">

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">What is a VA Streamline Refinance (IRRRL)?</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                The Interest Rate Reduction Refinance Loan — commonly called the IRRRL or &ldquo;streamline refinance&rdquo; — is a VA refinance program for existing VA loan borrowers. It allows you to refinance to a lower interest rate with significantly less paperwork than a standard refinance.
              </p>
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li>Only available for existing VA loans — cannot convert a conventional or FHA loan to a VA loan</li>
                <li>Typically no appraisal required</li>
                <li>No income verification or debt-to-income calculation in most cases</li>
                <li>Must result in a lower interest rate, lower payment, or transition from an adjustable-rate to a fixed-rate mortgage</li>
                <li>VA funding fee is 0.5% (much lower than the purchase fee)</li>
                <li>Disability-rated veterans are exempt from the IRRRL funding fee as well</li>
              </ul>
              <p className="text-sm text-zinc-600">
                <a href="/blog/va-loan-funding-fee-explained" className="text-blue-700 hover:text-blue-800 underline">
                  Full 2026 funding fee rates — purchase, IRRRL, and cash-out →
                </a>
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">What is a VA Cash-Out Refinance?</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                A VA Cash-Out Refinance replaces your current mortgage — VA or non-VA — with a new VA loan. Unlike the IRRRL, it can be used to convert a conventional or FHA loan into a VA loan, and it can pull equity out as cash.
              </p>
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li>Requires full underwriting — appraisal, income verification, credit check</li>
                <li>Can be used to refinance a conventional loan into a VA loan (the IRRRL cannot)</li>
                <li>Can access home equity as cash</li>
                <li>Funding fee is higher: 2.15% first use, 3.30% subsequent use (same as purchase loans)</li>
                <li>Disability-rated veterans are exempt from the cash-out funding fee as well</li>
              </ul>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">VA Net Tangible Benefit requirement</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                The VA requires that an IRRRL provide a &ldquo;net tangible benefit&rdquo; to the borrower. For a fixed-to-fixed rate refinance, the new interest rate must be at least 0.5% lower than the current rate. Converting from an adjustable-rate to a fixed-rate mortgage is considered a benefit in itself — rate reduction is not required in that case.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                VA lenders are required to document the net tangible benefit before closing. An IRRRL that fails the 0.5% threshold for a fixed-to-fixed scenario may still be lender-approved if the lender can otherwise document the benefit — but it is a yellow flag worth discussing with your lender.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The 36-month recoupment guideline means your closing costs should be recouped within 36 months through monthly savings. VA&apos;s calculation excludes the funding fee and escrow — so a refinance can pass the VA recoupment test even when the all-in consumer break-even (including the funded fee) exceeds 36 months. This calculator shows both numbers separately.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                This calculator estimates fixed-rate refinance scenarios. For ARM-to-fixed conversions, the stability of a fixed rate is generally considered a net tangible benefit by VA, even if the initial payment does not decrease. Consult with your lender for ARM-specific IRRRL guidance.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">When refinancing may not make sense</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li>You plan to sell within the break-even period — you won&apos;t recoup the closing costs before the sale</li>
                <li>The rate reduction is too small to justify the fees — especially for a subsequent-use cash-out at 3.30%</li>
                <li>You&apos;re restarting a long term — refinancing a 20-year-remaining loan to a new 30-year adds 10 years of payments; even with a lower rate, the extended amortization usually means paying more in interest overall</li>
                <li>You&apos;ve paid down substantial principal — restarting the amortization clock means more of your early payments go to interest again</li>
              </ul>
            </div>
          </details>

        </div>

        {/* Disclaimers */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 mb-6 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Disclaimers</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This calculator is for educational purposes only and is not a loan offer, commitment, or guarantee. Actual rates, fees, and savings will depend on your credit profile, lender, and current market conditions. MilPayTools is not a mortgage lender and does not originate, process, or fund loans. We do not provide rate quotes or lender recommendations. Consult a VA-approved lender for personalized refinance estimates.
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Monthly payment calculations are for principal and interest only and do not include taxes, insurance, or other escrow items. VA funding fee rates are 2026 rates effective through November 14, 2031 per Public Law 116-23.
          </p>
        </div>

        {/* Related calculators */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related Calculators</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Loan Calculator →</Link>
            <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Disability Rating →</Link>
            <Link href="/calculators/bah" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">BAH Calculator →</Link>
            <Link href="/calculators/total-compensation" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Total Compensation →</Link>
            <Link href="/guides/va-home-loans" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Home Loans Guide →</Link>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
