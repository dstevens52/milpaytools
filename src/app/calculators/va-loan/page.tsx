import type { Metadata } from 'next';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { VALoanCalculator } from '@/components/calculators/va-loan/VALoanCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { webApplicationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: { absolute: 'VA Loan Payment Calculator 2026 | Funding Fee, BAH Comparison & VA vs Conventional' },
  description:
    'Estimate your VA loan monthly payment, see your funding fee (or waiver), compare VA to conventional financing, and optionally see how your payment compares to BAH.',
  alternates: {
    canonical: '/calculators/va-loan',
  },
  openGraph: {
    title: 'VA Loan Payment Calculator 2026 | Funding Fee, BAH Comparison & VA vs Conventional',
    description:
      'Estimate your VA loan monthly payment, see your funding fee (or waiver), compare VA to conventional financing, and optionally see how your payment compares to BAH.',
    type: 'website',
    url: '/calculators/va-loan',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=calculator&title=VA+Loan+Payment+Calculator+2026&v=1', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VA Loan Payment Calculator 2026 | Funding Fee, BAH Comparison & VA vs Conventional',
    description:
      'Estimate your VA loan monthly payment, see your funding fee (or waiver), compare VA to conventional financing, and optionally see how your payment compares to BAH.',
    images: ['/api/og?type=calculator&title=VA+Loan+Payment+Calculator+2026&v=1'],
  },
};

export default function VALoanPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({
        name: 'VA Loan Payment Calculator 2026',
        description: 'Estimate your VA loan monthly payment, see your funding fee (or waiver), compare VA to conventional financing, and optionally see how your payment compares to BAH.',
        url: '/calculators/va-loan',
      })} />

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
                  Free &middot; No Account &middot; No Personal Info &middot; Official 2026 VA &amp; DoD Data
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[28px] sm:text-[38px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
                VA Loan Payment Calculator
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Estimate your monthly payment, see your funding fee (or your waiver), and compare VA to conventional financing side by side.
              </p>

            </div>
          </div>

          {/* 3-step strip */}
          <CalcStepStrip noBg steps={[
            { title: 'Enter home price, rate & down payment' },
            { title: 'See your VA funding fee and PITI' },
            { title: 'Compare VA vs. conventional & BAH' },
          ]} />

          {/* Sample output bar */}
          <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-4 overflow-hidden">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
                Sample output
              </span>
              <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
                First use &middot; $350K home &middot; 6.0% rate &middot; $0 down
              </p>
              <div className="flex items-baseline gap-4 min-w-0 flex-1">
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Funding fee <span className="font-semibold text-zinc-700">$7,525</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">PMI <span className="font-semibold text-zinc-700">$0</span></span>
              </div>
              <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
                Est. payment <span className="text-[16px] font-extrabold text-red-700">$2,611/mo</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <VALoanCalculator />

      {/* ── Next steps cards ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            Take the next step
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed max-w-2xl">
            The VA loan benefit is one piece of a larger financial picture. These tools help you use it well.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://www.ebenefits.va.gov/ebenefits/about/feature?feature=cert-of-eligibility-home-loan"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Get your Certificate of Eligibility
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Your COE confirms your VA loan eligibility. Apply through eBenefits, your lender, or by mail. Most lenders can pull it electronically in minutes.
            </p>
            <span className="text-sm font-medium text-red-700">
              Apply at VA eBenefits →
            </span>
          </a>

          <a
            href="/calculators/va-disability"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Calculate your VA disability rating
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              A rating of 10% or higher waives the funding fee entirely — that&apos;s $7,500+ on a typical $350K purchase. See how your conditions combine using the official bilateral factor formula.
            </p>
            <span className="text-sm font-medium text-red-700">
              Calculate combined VA rating →
            </span>
          </a>

          <a
            href="/calculators/bah"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Compare duty station housing costs
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              See BAH rates and housing costs at different duty stations. Your BAH can often cover or exceed the mortgage payment at affordable markets.
            </p>
            <span className="text-sm font-medium text-red-700">
              Look up BAH rates →
            </span>
          </a>

          <a
            href="/calculators/total-compensation"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Understand your total military compensation
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Your VA loan benefit is part of a broader compensation package. See your full pay, BAH, BAS, tax advantages, and civilian salary equivalent.
            </p>
            <span className="text-sm font-medium text-red-700">
              Calculate total compensation →
            </span>
          </a>
        </div>
      </section>

      {/* ── Example calculation ───────────────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">
            E-5, First Use, $350K Home — The Full Picture
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: $350,000 home, $0 down, 6.0% rate, 30-year fixed, first use, no disability exemption, funding fee financed.
          </p>
          <ExampleTable>
            <ExampleRow label="Home price" value="$350,000" />
            <ExampleRow label="Down payment" value="$0 (0%)" />
            <ExampleRow label="Base loan amount" value="$350,000" />
            <ExampleRow label="Funding fee (2.15% — first use, &lt;5% down)" value="$7,525" />
            <ExampleRow label="Financed loan amount" value="$357,525" highlight />
            <ExampleRow label="Principal &amp; Interest (6.0%, 30 yr)" value="$2,144/mo" />
            <ExampleRow label="Annual property taxes ($4,200/yr)" value="$350/mo" />
            <ExampleRow label="Annual homeowner&apos;s insurance ($1,400/yr)" value="$117/mo" />
            <ExampleRow label="Total estimated PITI" value="$2,611/mo" highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> With $0 down and no PMI ever, the total payment is $2,611/month. The $7,525 funding fee is rolled into the loan, adding roughly $45/month to the P&amp;I payment. A borrower with a 10%+ service-connected disability rating pays no funding fee at all — reducing the loan to $350,000 and the monthly P&amp;I to approximately $2,098, saving $46/month over the life of the loan.
          </p>
        </ExampleBox>
      </section>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <hr className="border-zinc-200 mb-6" />

        <div className="space-y-2 mb-8">

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">How the VA loan funding fee works</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                The VA funding fee is a one-time payment to the Department of Veterans Affairs that helps sustain the VA home loan program for future generations of veterans. It is not paid to the lender and is not an insurance premium — it is a direct payment to VA.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The fee ranges from 1.25% to 3.30% of the loan amount, depending on whether it&apos;s your first or subsequent use of the benefit, and how much you put down. First-time use with no down payment: 2.15%. Subsequent use with no down payment: 3.30%. Putting 5%–9.99% down reduces the fee to 1.50% for both groups; 10%+ down reduces it to 1.25% for both.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                You can either pay the funding fee at closing or finance it into your loan. Financing adds to your loan balance and increases your total interest paid over time, but lowers your upfront cash requirement. Most borrowers finance it.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                These rates are effective through November 14, 2031, per the Blue Water Navy Vietnam Veterans Act of 2019.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">The funding fee waiver: one of the most valuable disability benefits</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                Any service-connected disability rating of 10% or higher waives the VA funding fee entirely — on every VA loan you ever use. This is one of the most financially significant disability benefits, because it applies at the time of use rather than as a fixed monthly payment.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                On a $400,000 first-use purchase with $0 down, the standard fee is $8,600 (2.15%). With a 10%+ disability rating, you pay $0. On a subsequent-use purchase, that same home would carry a $13,200 fee (3.30%). If you have a disability rating, the waiver saves you real money every time.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>Retroactive refunds:</strong> If you received your service-connected disability rating after closing on a VA loan and had already paid the funding fee, you may be eligible for a refund. Contact the VA or your lender to request one.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Also exempt: Purple Heart recipients on active duty, and surviving spouses receiving Dependency and Indemnity Compensation (DIC) for a veteran who died in service or from a service-connected disability.
              </p>
              <p className="text-sm text-zinc-600">
                <a href="/calculators/va-disability" className="text-blue-700 hover:text-blue-800 underline">
                  Calculate your combined disability rating →
                </a>
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">VA loan vs. conventional: when each makes sense</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>VA loan advantages:</strong> $0 down payment for eligible borrowers, no private mortgage insurance ever, competitive rates, no prepayment penalty, and limits on what sellers can pay in closing costs. The no-PMI feature is significant — PMI on a $350K home with 5% down can run $140–200/month until you reach 20% equity.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>When conventional might make more sense:</strong> If you have 20%+ down payment (no PMI on conventional, and the VA funding fee adds cost), if you&apos;re on your second use and haven&apos;t waived the fee, or if you&apos;re buying an investment property (VA requires the home to be your primary residence). Vacation homes and investment properties are not eligible for VA loans.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>The PMI math:</strong> On a $350K home with 5% down, conventional PMI at 0.5% of the loan amount runs about $143/month until you reach 20% equity — typically 7–10 years, depending on your payment rate and home value appreciation. The VA loan has no equivalent cost, which is why the VA loan is usually superior for borrowers with little money down.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>VA loan occupancy:</strong> VA loans require you to occupy the home as your primary residence. Investment properties and vacation homes are not eligible.
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">Understanding VA loan eligibility</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100 space-y-3">
              <p className="text-zinc-600 text-sm leading-relaxed">
                VA loan eligibility is based on your service history and character of discharge. General eligibility:
              </p>
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li><strong>Active duty:</strong> 90 consecutive days during wartime, or 181 days during peacetime</li>
                <li><strong>Veterans:</strong> Same service requirements, plus honorable or general discharge</li>
                <li><strong>National Guard &amp; Reserve:</strong> 6+ years of service, or 90+ days of active duty under Title 10 federal orders with qualifying discharge</li>
                <li><strong>Surviving spouses:</strong> Unmarried spouses of veterans who died in service or from a service-connected disability, or who are missing in action / POW</li>
              </ul>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>Entitlement restoration:</strong> After paying off a previous VA loan and selling (or refinancing to a non-VA loan and restoring entitlement), your VA benefit can be fully restored and used again. The benefit does not expire — it&apos;s a lifetime benefit.
              </p>
              <p className="text-sm text-zinc-600">
                Get your Certificate of Eligibility to confirm your eligibility:{' '}
                <a
                  href="https://www.ebenefits.va.gov/ebenefits/about/feature?feature=cert-of-eligibility-home-loan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 underline"
                >
                  VA.gov eBenefits →
                </a>
              </p>
            </div>
          </details>

          <details className="group border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
              <h2 className="text-base font-semibold text-zinc-900">What this calculator does not include</h2>
              <svg className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform flex-none ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-zinc-100">
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li>Specific rate quotes or rate shopping — enter the rate you&apos;ve been quoted</li>
                <li>Closing cost estimates beyond the funding fee (typically 1–2% of loan amount)</li>
                <li>Debt-to-income ratio or income qualification analysis</li>
                <li>VA residual income requirements (a key VA underwriting factor)</li>
                <li>Loan pre-approval or pre-qualification</li>
                <li>Jumbo VA loan considerations (loans above the conforming loan limit)</li>
                <li>VA renovation or construction loan specifics</li>
                <li>Seller concession calculations or discount point analysis</li>
                <li>Lender recommendations or comparisons — we do not recommend, endorse, or compare specific mortgage lenders. For loan quotes, contact VA-approved lenders directly.</li>
                <li>Loan type comparisons — this calculator estimates VA loan payments only. It does not compare VA loans to conventional, FHA, or other loan types. For help deciding which loan type fits your situation, consult with a mortgage professional.</li>
              </ul>
              <p className="text-xs text-zinc-400 mt-3">
                This calculator is designed to give you a clear estimate of your monthly payment and help you understand the funding fee. Consult a VA-approved lender for actual loan estimates.
              </p>
            </div>
          </details>

        </div>

        {/* Disclaimers */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 mb-6 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Disclaimers</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This calculator provides estimates for educational purposes only. It is not a loan offer, rate quote, or pre-approval. Actual loan terms, rates, closing costs, and qualification requirements are determined by individual lenders. Property tax and insurance estimates are approximate — verify with your county assessor and insurance provider. VA loan eligibility is determined by the Department of Veterans Affairs. This calculator does not account for all possible fees, credits, or adjustments that may apply to your specific situation. Consult with a VA-approved lender for personalized loan estimates.
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            MilPayTools is not a lender and does not originate, process, or fund mortgage loans.
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Funding fee rates shown are 2026 rates, effective through November 14, 2031, per Public Law 116-23 (Blue Water Navy Vietnam Veterans Act of 2019).
          </p>
        </div>

        {/* Related calculators */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related Calculators</p>
          <div className="flex flex-wrap gap-2">
            <a href="/calculators/bah" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">BAH Calculator →</a>
            <a href="/calculators/va-disability" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Disability Rating →</a>
            <a href="/calculators/total-compensation" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Total Compensation →</a>
            <a href="/calculators/pcs" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">PCS Cost Estimator →</a>
            <a href="/calculators/compare" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Compare PCS Stations →</a>
            <a href="/calculators/retirement" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Retirement Calculator →</a>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
