import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Link from 'next/link';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { CalculatorSummary } from '@/components/calculators/shared/CalculatorSummary';
import { VALoanCalculator } from '@/components/calculators/va-loan/VALoanCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { webApplicationSchema } from '@/lib/schema';
import { formatCurrency } from '@/lib/utils';
import { calcVaLoan, VA_LOAN_DEFAULTS } from '@/lib/calculations/vaLoan';
import {
  FUNDING_FEE_RATES_EFFECTIVE,
  VA_PURCHASE_FUNDING_FEE as FEE,
  fundingFeeAmount,
} from '@/lib/calculations/vaLoanFees';

// ── Figures (VAL-03): every dollar amount below is computed by the calculator's own
// math (src/lib/calculations/vaLoan.ts) from its default inputs, or from the fee
// table (src/lib/calculations/vaLoanFees.ts). Nothing is typed by hand.
const pct = (rate: number) => `${(rate * 100).toFixed(2)}%`;
const usd = (n: number) => formatCurrency(n);
const usdK = (n: number) => `$${Math.round(n / 1000)}K`;

/** The example: calculator defaults (first use, $0 down, fee financed, no exemption). */
const EX = calcVaLoan(VA_LOAN_DEFAULTS);
/** Same inputs, exempt from the funding fee (e.g. receiving VA disability compensation). */
const EX_EXEMPT = calcVaLoan({ ...VA_LOAN_DEFAULTS, feeStatus: 'comp' });
const EX_MONTHLY_DIFF = EX.totalPITI - EX_EXEMPT.totalPITI;
const EX_TERM = VA_LOAN_DEFAULTS.termYears;
const EX_RATE = VA_LOAN_DEFAULTS.rate.toFixed(1);

/** Waiver examples: $400,000, $0 down, first and subsequent use. */
const WAIVER_PRICE = 400000;
const WAIVER_FIRST = fundingFeeAmount(WAIVER_PRICE, FEE.first.lt5);
const WAIVER_SUBSEQUENT = fundingFeeAmount(WAIVER_PRICE, FEE.subsequent.lt5);

const META_TITLE = 'VA Loan Payment Calculator 2026 | Funding Fee, Exemptions & BAH Comparison';
const META_DESCRIPTION =
  'Estimate your VA loan monthly payment, see your VA funding fee or whether you\u2019re exempt, and optionally see how your payment compares to BAH.';
const OG_SUB = 'Monthly payment, funding fee, and BAH comparison';

const FAQS: FaqItem[] = [
  {
    question: 'How does the VA loan funding fee work?',
    answer: `The VA funding fee is a one-time payment to the Department of Veterans Affairs — not the lender. First use with $0 down: ${pct(FEE.first.lt5)} of the loan amount. Subsequent use with $0 down: ${pct(FEE.subsequent.lt5)}. Putting 5%–9.99% down reduces the fee to ${pct(FEE.first.gte5lt10)}; 10%+ reduces it to ${pct(FEE.first.gte10)}. You can pay it at closing or finance it into the loan. VA's current rates took effect ${FUNDING_FEE_RATES_EFFECTIVE}.`,
  },
  {
    question: 'Who is exempt from the VA funding fee?',
    answer: `VA's rule: you don't pay the funding fee if any of these is true. (1) You receive VA compensation for a service-connected disability. (2) You're eligible for that compensation but receive retirement or active-duty pay instead. (3) You receive Dependency and Indemnity Compensation (DIC) as the surviving spouse of a Veteran. (4) You're a service member with a proposed or memorandum rating, dated before closing, that says you're eligible for compensation because of a pre-discharge claim. (5) You're on active duty and, on or before closing, provide evidence that you received a Purple Heart. The exemption follows compensation, not a rating number: a 0% rating pays no compensation, so on its own it doesn't exempt anyone. If VA later awards compensation with an effective date before your closing date, you may be eligible for a refund.`,
  },
  {
    question: 'When does a VA loan make more sense than a conventional loan?',
    answer: 'VA loans offer $0 down for eligible borrowers and have no monthly mortgage insurance at any loan-to-value. VA is usually superior for borrowers with limited down payment who plan to hold the home long-term. Conventional may make sense if you have 20%+ down (no PMI and no funding fee), expect to sell within 1–2 years, or are buying an investment property (VA requires primary residence).',
  },
  {
    question: 'Who qualifies for a VA home loan?',
    answer: 'Active-duty service members qualify after 90+ consecutive days of service. Veterans qualify based on service period, length of service, and character of discharge. Guard and Reserve members may qualify through 6+ years of service or 90+ days of qualifying active duty. Surviving spouses of veterans who died in service or from a service-connected disability may also be eligible. The Certificate of Eligibility (COE) confirms eligibility for a lender.',
  },
  {
    question: 'What does this VA loan calculator not include?',
    answer: 'This calculator provides estimates for educational purposes only. It does not provide rate quotes, closing cost estimates beyond the funding fee, debt-to-income or VA residual income analysis, loan pre-approval, jumbo VA loan specifics, or lender recommendations. Consult a VA-approved lender for actual loan estimates.',
  },
];

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESCRIPTION,
  alternates: {
    canonical: '/calculators/va-loan',
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    type: 'website',
    url: '/calculators/va-loan',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'VA Loan Payment Calculator 2026', sub: OG_SUB }),
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ogImage({ type: 'calculator', title: 'VA Loan Payment Calculator 2026', sub: OG_SUB }),
  },
};

export default function VALoanPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({
        name: 'VA Loan Payment Calculator 2026',
        description: META_DESCRIPTION,
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
                Estimate your monthly payment, see your funding fee (or your waiver), and compare to your BAH.
              </p>

            </div>
          </div>

          {/* 3-step strip */}
          <CalcStepStrip noBg steps={[
            { title: 'Enter home price, rate & down payment' },
            { title: 'See your VA funding fee and PITI' },
            { title: 'See funding fee & BAH comparison' },
          ]} />

          {/* Sample output bar */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          A VA loan allows eligible service members and veterans to purchase a home with no down payment and no monthly mortgage insurance. The main VA-specific cost is the funding fee — {pct(FEE.first.lt5)} of the loan amount at first use with no down payment, or {pct(FEE.subsequent.lt5)} at subsequent use. Veterans receiving VA disability compensation don&apos;t pay the funding fee.
        </p>
      </div>
          <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-4 overflow-hidden">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
                Sample output
              </span>
              <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
                First use &middot; {usdK(VA_LOAN_DEFAULTS.homePrice)} home &middot; {EX_RATE}% rate &middot; $0 down
              </p>
              <div className="flex items-baseline gap-4 min-w-0 flex-1">
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Funding fee <span className="font-semibold text-zinc-700" data-testid="vl-hero-fee">{usd(EX.fundingFeeAmount)}</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">PMI <span className="font-semibold text-zinc-700">$0</span></span>
              </div>
              <p className="text-[11px] text-zinc-400 whitespace-nowrap flex-none">
                Est. payment <span className="text-[16px] font-extrabold text-red-700" data-testid="vl-hero-piti">{usd(EX.totalPITI)}/mo</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <VALoanCalculator />

      <CalculatorSummary calc="va-loan" />

      {/* ── Next steps cards ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-5">
            A VA loan payment typically includes principal, interest, property taxes, and homeowners insurance. VA loans have no monthly mortgage insurance. Borrowers who aren&apos;t exempt pay a one-time VA funding fee ({pct(FEE.first.lt5)} on first use with $0 down) that can be paid at closing or financed into the loan. Financing the fee lowers cash needed upfront but increases the loan balance and total interest paid over time.
          </p>
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
              Veterans receiving VA disability compensation don&apos;t pay the funding fee: that&apos;s {usd(EX.standardFeeAmount)} on a {usd(VA_LOAN_DEFAULTS.homePrice)} first-use purchase with no down payment. See how your conditions combine using the official bilateral factor formula.
            </p>
            <span className="text-sm font-medium text-red-700">
              Calculate combined VA rating →
            </span>
          </a>

          <a
            href="/calculators/va-refinance"
            className="group block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-zinc-900 mb-2 group-hover:text-red-700 transition-colors">
              Already have a VA loan?
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              The VA Streamline Refinance (IRRRL) lets you lower your rate with minimal paperwork and no appraisal. See if refinancing makes sense.
            </p>
            <span className="text-sm font-medium text-red-700">
              Estimate your refinance savings →
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
            E-5, First Use, {usdK(VA_LOAN_DEFAULTS.homePrice)} Home — The Full Picture
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            Scenario: {usd(VA_LOAN_DEFAULTS.homePrice)} home, $0 down, {EX_RATE}% rate, {EX_TERM}-year fixed, first use, no funding fee exemption, funding fee financed.
          </p>
          <ExampleTable>
            <ExampleRow label="Home price" value={usd(VA_LOAN_DEFAULTS.homePrice)} />
            <ExampleRow label="Down payment" value={`${usd(VA_LOAN_DEFAULTS.downDollars)} (0%)`} />
            <ExampleRow label="Base loan amount" value={usd(EX.baseLoan)} />
            <ExampleRow label={`Funding fee (${pct(EX.fundingFeeRate)} — first use, <5% down)`} value={usd(EX.fundingFeeAmount)} />
            <ExampleRow label="Financed loan amount" value={usd(EX.financedLoan)} highlight />
            <ExampleRow label={`Principal & Interest (${EX_RATE}%, ${EX_TERM} yr)`} value={`${usd(EX.monthlyPI)}/mo`} />
            <ExampleRow label={`Annual property taxes (${usd(VA_LOAN_DEFAULTS.annualTax)}/yr)`} value={`${usd(EX.monthlyTax)}/mo`} />
            <ExampleRow label={`Annual homeowner's insurance (${usd(VA_LOAN_DEFAULTS.annualIns)}/yr)`} value={`${usd(EX.monthlyIns)}/mo`} />
            <ExampleRow label="Total estimated PITI" value={`${usd(EX.totalPITI)}/mo`} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong> With $0 down and no PMI ever, the total payment is {usd(EX.totalPITI)}/month. The {usd(EX.fundingFeeAmount)} funding fee is rolled into the loan, adding roughly {usd(EX.feeFinancedExtra)}/month to the P&amp;I payment. A borrower who is exempt from the funding fee (for example, a Veteran receiving VA disability compensation) pays no funding fee at all — the loan stays at {usd(EX_EXEMPT.financedLoan)} and the monthly P&amp;I is approximately {usd(EX_EXEMPT.monthlyPI)}: a monthly payment {usd(EX_MONTHLY_DIFF)} lower for the life of the loan.
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
                The fee ranges from {pct(FEE.first.gte10)} to {pct(FEE.subsequent.lt5)} of the loan amount, depending on whether it&apos;s your first or subsequent use of the benefit, and how much you put down. First-time use with no down payment: {pct(FEE.first.lt5)}. Subsequent use with no down payment: {pct(FEE.subsequent.lt5)}. Putting 5%–9.99% down reduces the fee to {pct(FEE.first.gte5lt10)} for both groups; 10%+ down reduces it to {pct(FEE.first.gte10)} for both.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                You can either pay the funding fee at closing or finance it into your loan. Financing adds to your loan balance and increases your total interest paid over time, but lowers your upfront cash requirement. Most borrowers finance it.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                VA&apos;s current rates took effect {FUNDING_FEE_RATES_EFFECTIVE}.
              </p>
              <p className="text-sm text-zinc-600">
                <a href="/blog/va-loan-funding-fee-explained" className="text-blue-700 hover:text-blue-800 underline">
                  Full 2026 funding fee rates, exemptions, and dollar-amount examples →
                </a>
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
                Veterans receiving VA disability compensation don&apos;t pay the funding fee, and neither does anyone else on VA&apos;s exemption list (below). This is one of the most financially significant disability benefits, because it applies at the time of use rather than as a fixed monthly payment.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                On a {usd(WAIVER_PRICE)} first-use purchase with $0 down, the standard fee is {usd(WAIVER_FIRST)} ({pct(FEE.first.lt5)}). A Veteran receiving VA disability compensation pays $0. On a subsequent-use purchase, that same home would carry a {usd(WAIVER_SUBSEQUENT)} fee ({pct(FEE.subsequent.lt5)}), also $0 with the exemption. The exemption follows compensation, not a rating number: a 0% rating pays no compensation, so on its own it doesn&apos;t exempt you.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>Refunds:</strong> VA&apos;s rule: if you paid the fee and VA later awards you compensation for a service-connected disability with an effective date before your loan&apos;s closing date, you may be eligible for a refund. A proposed or memorandum rating received after closing doesn&apos;t qualify for a refund.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                VA&apos;s exemption list. You don&apos;t pay the funding fee if any of these is true:
              </p>
              <ul className="text-sm text-zinc-600 space-y-1.5 list-disc list-inside">
                <li>You receive VA compensation for a service-connected disability</li>
                <li>You&apos;re eligible for that compensation but receive retirement or active-duty pay instead</li>
                <li>You receive Dependency and Indemnity Compensation (DIC) as the surviving spouse of a Veteran</li>
                <li>You&apos;re a service member with a proposed or memorandum rating, dated before closing, that says you&apos;re eligible for compensation because of a pre-discharge claim</li>
                <li>You&apos;re on active duty and, on or before closing, provide evidence that you received a Purple Heart</li>
              </ul>
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
                <strong>VA loan advantages:</strong> $0 down payment for eligible borrowers, no private mortgage insurance ever, competitive rates, no prepayment penalty, and limits on what sellers can pay in closing costs. The no-PMI feature is significant: conventional loans with less than 20% down usually carry private mortgage insurance until enough equity builds up.
              </p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                <strong>When conventional might make more sense:</strong> If you have 20%+ down payment (no PMI on conventional, and the VA funding fee adds cost), if you&apos;re on your second use and aren&apos;t exempt from the fee, or if you&apos;re buying an investment property (VA requires the home to be your primary residence). Vacation homes and investment properties are not eligible for VA loans.
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
              <p className="text-sm text-zinc-600">
                <a href="/blog/can-i-use-va-loan-again" className="text-blue-700 hover:text-blue-800 underline">
                  Entitlement restoration, subsequent use, and using two VA loans at once →
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

        <div className="mb-8">
          <FaqSection faqs={FAQS} />
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
            Funding fee rates shown are VA&apos;s current rates, effective {FUNDING_FEE_RATES_EFFECTIVE} (VA.gov, &ldquo;VA funding fee and loan closing costs&rdquo;).
          </p>
        </div>

        {/* Related calculators */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related Calculators</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/bah" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">BAH Calculator →</Link>
            <a href="/calculators/va-disability" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Disability Calculator →</a>
            <a href="/calculators/total-compensation" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay Calculator →</a>
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
