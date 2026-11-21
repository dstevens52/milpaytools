import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Link from 'next/link';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { CalculatorSummary } from '@/components/calculators/shared/CalculatorSummary';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { webApplicationSchema } from '@/lib/schema';
import { formatCurrency } from '@/lib/utils';
import {
  FUNDING_FEE_RATES_EFFECTIVE,
  VA_CASH_OUT_FUNDING_FEE,
  VA_IRRRL_FUNDING_FEE,
  feeRateLabel,
} from '@/lib/calculations/vaLoanFees';
import {
  IRRRL_MIN_RATE_DROP_BPS,
  VA_RECOUPMENT_LIMIT_MONTHS,
  VA_REFINANCE_DEFAULTS as D,
  bpsLabel,
  calcVaRefinance,
} from '@/lib/calculations/vaRefinance';
import { VARefinanceCalculator } from '@/components/calculators/va-refinance/VARefinanceCalculator';

// ── Figures (VRF-02): every dollar amount and month count below is computed by the
// calculator's own math (src/lib/calculations/vaRefinance.ts) from its default inputs,
// or from the fee table (src/lib/calculations/vaLoanFees.ts). Nothing is typed by hand.
const usd = (n: number) => formatCurrency(n);
const usdK = (n: number) => `$${Math.round(n / 1000)}K`;

/** The example: calculator defaults (IRRRL, no exemption, fee financed). */
const EX = calcVaRefinance(D);
/** Same inputs, exempt from the funding fee (e.g. receiving VA disability compensation). */
const EX_EXEMPT = calcVaRefinance({ ...D, feeStatus: 'comp' });

const EX_SAVINGS = Math.round(EX.monthlySavings);
const EX_MONTHS = EX.monthsToRecover ?? 0;
const EX_DIFF = `${usd(Math.abs(EX.fullTermDifference))} ${EX.fullTermDifference >= 0 ? 'more' : 'less'}`;
const EX_SAME_TERM_SAVINGS = Math.round(EX.sameTermSavings);
const RATE_CUR = D.currentRate.toFixed(1);
const RATE_NEW = D.newRate.toFixed(1);
const IRRRL_FEE = feeRateLabel(VA_IRRRL_FUNDING_FEE);
const CASH_FIRST = feeRateLabel(VA_CASH_OUT_FUNDING_FEE.first);
const CASH_SUB = feeRateLabel(VA_CASH_OUT_FUNDING_FEE.subsequent);
const months = (n: number) => `${n} month${n === 1 ? '' : 's'}`;

const FAQS: FaqItem[] = [
  {
    question: 'What is a VA Streamline Refinance (IRRRL)?',
    answer: `The IRRRL (Interest Rate Reduction Refinance Loan) is a VA refinance for existing VA loan borrowers. VA generally doesn't require an appraisal or credit underwriting for an IRRRL. Lenders can still require them under their own rules. The funding fee is ${IRRRL_FEE} of the loan, and borrowers on VA's funding fee exemption list don't pay it. Fixed to fixed, the new rate must be at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower; an IRRRL can also move you from an adjustable rate to a fixed rate. It can only refinance an existing VA loan. [Funding fee rates and exemptions](/blog/va-loan-funding-fee-explained)`,
  },
  {
    question: 'What is a VA Cash-Out Refinance?',
    answer: `A VA Cash-Out Refinance replaces your current mortgage, VA or non-VA, with a new VA loan. Unlike the IRRRL, it can convert a conventional or FHA loan to a VA loan and can take home equity out as cash. It requires full underwriting, including an appraisal, income verification and a credit check. The funding fee is ${CASH_FIRST} on first use and ${CASH_SUB} after first use, a percentage of the total new loan with the cash out included. VA limits the new loan, including a financed funding fee, to 100% of the home's VA-appraised value. VA's 36-month recoupment test and its rate test don't apply when the new loan is larger than the payoff (38 U.S.C. § 3709(d)).`,
  },
  {
    question: 'What is the VA net tangible benefit requirement?',
    answer: `For a fixed-to-fixed IRRRL, the new rate must be at least ${bpsLabel(IRRRL_MIN_RATE_DROP_BPS)} lower than the current rate; fixed to adjustable, at least 200 basis points lower (38 U.S.C. § 3709(b)). The lender must also certify that the fees and closing costs are recouped through the lower monthly payment within ${VA_RECOUPMENT_LIMIT_MONTHS} months; the VA funding fee, taxes and escrow are left out of that calculation (§ 3709(a)). And the loan can't close until the later of 210 days after the current loan's first payment due date and the sixth consecutive monthly payment (§ 3709(c)).`,
  },
  {
    question: 'How long does it take to recover the closing costs?',
    answer: `Divide the net closing costs (after lender credits) by the monthly principal-and-interest saving and round up to whole months. That's VA's method: the funding fee is left out, and a financed fee is already in the new payment. At the calculator's defaults (${usd(EX.netClosingCosts)} in closing costs, a payment ${usd(EX_SAVINGS)} a month lower) it's ${months(EX_MONTHS)}.`,
  },
  {
    question: 'Can a refinance with a lower payment cost more overall?',
    answer: `Yes, when the new term is longer than the years left on the current loan. At the calculator's defaults the payment drops ${usd(EX_SAVINGS)} a month, but the new ${D.newTermYears}-year loan adds ${EX.extraYears} years of payments: paid to the end of its term, it totals ${EX_DIFF} than the remaining payments on the current loan, closing costs included. Paid off over the same ${D.yearsRemaining} years, the new loan's payment would be ${usd(Math.round(EX.sameTermPayment))}, ${usd(EX_SAME_TERM_SAVINGS)} a month less than now. Selling before the closing costs are recovered also leaves part of them unrecovered.`,
  },
];

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
    images: ogImage({ type: 'calculator', title: 'VA Refinance Calculator 2026', sub: 'Monthly savings, break-even point, IRRRL or cash-out' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ogImage({ type: 'calculator', title: 'VA Refinance Calculator 2026', sub: 'Monthly savings, break-even point, IRRRL or cash-out' }),
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
                Compare your current VA loan to a new rate. See the monthly payment change, the months to recover closing costs, the cost over the full term, and whether an IRRRL meets VA&apos;s requirements.
              </p>

            </div>
          </div>

          {/* 3-step strip */}
          <CalcStepStrip noBg steps={[
            { title: 'Enter your current loan details' },
            { title: 'Set your new rate and terms' },
            { title: 'See savings, months to recover costs, full-term cost, and VA checks' },
          ]} />

          {/* Sample output bar */}

      {/* ── Direct answer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-b border-zinc-100 hidden md:block">
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          {`An IRRRL (VA Streamline Refinance) refinances an existing VA loan, for example to a lower interest rate. VA generally doesn't require an appraisal or credit underwriting for an IRRRL. Lenders can still require them under their own rules. It carries a ${IRRRL_FEE} funding fee, lower than any purchase or cash-out rate. A VA cash-out refinance carries a higher funding fee (${CASH_FIRST} or ${CASH_SUB}) and requires a full appraisal and underwriting.`}
        </p>
      </div>
          <div className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 flex items-center gap-4 overflow-hidden">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex-none whitespace-nowrap border border-zinc-200 rounded px-1.5 py-0.5">
                Sample output
              </span>
              <p className="text-[11px] font-medium text-zinc-400 flex-none whitespace-nowrap">
                {`Current ${usdK(D.balance)} at ${D.currentRate}% → New ${D.newRate}% · ${D.yearsRemaining} yrs remaining · IRRRL`}
              </p>
              <div className="flex items-baseline gap-4 min-w-0 flex-1">
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Monthly savings <span className="font-semibold text-zinc-700" data-testid="vr-hero-savings">{usd(EX_SAVINGS)}</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Months to recover closing costs <span className="font-semibold text-red-700 text-[16px] font-extrabold" data-testid="vr-hero-months">{months(EX_MONTHS)}</span></span>
                <span className="text-[12px] text-zinc-500 whitespace-nowrap">Over the full term <span className="font-semibold text-zinc-700" data-testid="vr-hero-full-term">{EX_DIFF}</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <VARefinanceCalculator />

      <CalculatorSummary calc="va-refinance" />

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
              Buying instead of refinancing? Estimate your VA loan payment with the funding fee and a comparison with your BAH.
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
              Borrowers who receive VA disability compensation, or are eligible for it, don&apos;t pay the funding fee. The exemption follows compensation, not a rating number. See how your ratings combine and the compensation that goes with the result.
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
            href="/bah"
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
            {`IRRRL Example — ${usdK(D.balance)} at ${D.currentRate}% → ${D.newRate}%, ${D.newTermYears}-Year Fixed`}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            {`Scenario: ${usd(D.balance)} balance, ${RATE_CUR}% current rate, ${D.yearsRemaining} years remaining. Refinancing to ${RATE_NEW}% on a new ${D.newTermYears}-year. Closing costs ${usd(D.closingCosts)}. No funding fee exemption; the fee is financed.`}
          </p>
          <ExampleTable>
            <ExampleRow label={`Current monthly P&I (${D.yearsRemaining} years remaining, ${RATE_CUR}%)`} value={usd(Math.round(EX.currentPayment))} />
            <ExampleRow label={`VA IRRRL funding fee (${IRRRL_FEE})`} value={usd(EX.fundingFeeAmount)} />
            <ExampleRow label="New loan balance" value={usd(EX.newLoan)} />
            <ExampleRow label={`New monthly P&I (${RATE_NEW}%, ${D.newTermYears} years)`} value={usd(Math.round(EX.newPayment))} highlight />
            <ExampleRow label="Monthly savings" value={`${usd(EX_SAVINGS)}/mo`} />
            <ExampleRow label={`Months to recover closing costs (${usd(EX.netClosingCosts)} ÷ savings)`} value={months(EX_MONTHS)} />
            <ExampleRow label={`Remaining payments on the current loan (${D.yearsRemaining * 12} months)`} value={usd(EX.currentRemainingTotal)} />
            <ExampleRow label={`New loan over ${D.newTermYears * 12} months, plus closing costs`} value={usd(EX.newLoanTotal)} />
            <ExampleRow label="Over the full term" value={EX_DIFF} />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong>{' '}
            {`The rate drops ${bpsLabel(EX.rateDropBps)}, which meets VA's ${IRRRL_MIN_RATE_DROP_BPS}-basis-point test for a fixed-to-fixed IRRRL. The ${usd(EX.netClosingCosts)} in closing costs is recovered in ${months(EX_MONTHS)}, within VA's ${VA_RECOUPMENT_LIMIT_MONTHS}-month limit; VA's method leaves out the funding fee, which is financed into the new payment. Paid to the end of its term, the new loan totals ${EX_DIFF} than the remaining payments on the current loan: it adds ${EX.extraYears} years of payments. Paid off over the same ${D.yearsRemaining} years, the new loan's payment would be ${usd(Math.round(EX.sameTermPayment))}, ${usd(EX_SAME_TERM_SAVINGS)} a month less than now. A borrower who is exempt from the funding fee (for example, a Veteran receiving VA disability compensation) borrows ${usd(EX_EXEMPT.newLoan)} instead of ${usd(EX.newLoan)}: the payment drops ${usd(Math.round(EX_EXEMPT.monthlySavings))} a month and the closing costs are recovered in ${months(EX_EXEMPT.monthsToRecover ?? 0)}.`}
          </p>
        </ExampleBox>
      </section>

      {/* ── Educational content ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <hr className="border-zinc-200 mb-6" />

        <div className="mb-6">
          <FaqSection faqs={FAQS} />
        </div>

        <p className="text-sm text-zinc-600 leading-relaxed mb-8">
          This calculator models fixed-rate loans only. An IRRRL can also move you from an adjustable rate to a fixed rate, which can make payments more stable. Ask your lender about IRRRL terms for an adjustable-rate loan.
        </p>

        {/* Disclaimers */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 mb-6 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Disclaimers</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This calculator is for educational purposes only and is not a loan offer, commitment, or guarantee. Actual rates, fees, and savings will depend on your credit profile, lender, and current market conditions. MilPayTools is not a mortgage lender and does not originate, process, or fund loans. We do not provide rate quotes or lender recommendations. Consult a VA-approved lender for personalized refinance estimates.
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {`Monthly payment calculations are for principal and interest only and do not include taxes, insurance, or other escrow items. VA's current funding fee rates took effect ${FUNDING_FEE_RATES_EFFECTIVE}.`}
          </p>
        </div>

        {/* Related calculators */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related Calculators</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Loan Calculator →</Link>
            <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Disability Calculator →</Link>
            <Link href="/bah" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">BAH Calculator →</Link>
            <Link href="/calculators/total-compensation" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">Military Pay Calculator →</Link>
            <Link href="/guides/va-home-loans" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Home Loans Guide →</Link>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
