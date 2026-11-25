import type { Metadata } from 'next';
import Link from 'next/link';
import { ogImage } from '@/lib/og';
import { ExampleBox, ExampleTable, ExampleRow } from '@/components/calculators/shared/ExampleBox';
import { CalcStepStrip } from '@/components/calculators/shared/CalcStepStrip';
import { CalculatorSummary } from '@/components/calculators/shared/CalculatorSummary';
import { VAEntitlementCalculator } from '@/components/calculators/va-entitlement/VAEntitlementCalculator';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection } from '@/components/FaqSection';
import { webApplicationSchema } from '@/lib/schema';
import { LOAN_LIMIT_SUMMARIES, LOAN_LIMIT_YEAR, loanLimitYearsShown } from '@/data/va-loan/loanLimitYear';
import {
  VA_ENTITLEMENT_EXAMPLE as EXAMPLE,
  VA_ENTITLEMENT_FAQS,
  VA_ENTITLEMENT_SOURCES,
} from '@/lib/vaEntitlementPage';
import { usdExact } from '@/lib/calculations/vaEntitlement';

// ── Figures: every dollar amount below comes from the FHFA summary files
// (src/data/va-loan/loanLimitsSummary{year}.ts) or the entitlement lib
// (src/lib/calculations/vaEntitlement.ts). Nothing is typed by hand.

const META_TITLE = 'VA Loan Entitlement Calculator: Buy Again With a VA Loan';
const META_DESCRIPTION =
  'See your remaining VA loan entitlement from your county’s loan limit and the entitlement you’ve already used, and how much most lenders lend with $0 down.';
const OG_SUB = 'Remaining entitlement, county loan limit, $0-down buying power';
const PATH = '/calculators/va-entitlement';

const YEARS = loanLimitYearsShown();
const CUR = LOAN_LIMIT_SUMMARIES[LOAN_LIMIT_YEAR];

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    type: 'website',
    url: PATH,
    siteName: 'MilPayTools',
    images: ogImage({ type: 'calculator', title: 'VA Loan Entitlement Calculator', sub: OG_SUB }),
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ogImage({ type: 'calculator', title: 'VA Loan Entitlement Calculator', sub: OG_SUB }),
  },
};

export default function VAEntitlementPage() {
  return (
    <>
      <JsonLdScript schema={webApplicationSchema({ name: 'VA Loan Entitlement Calculator', description: META_DESCRIPTION, url: PATH })} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        <div className="relative z-10">
          <div className="mx-auto max-w-5xl pt-6 sm:pt-9 px-4">
            <div className="sm:max-w-[70%] mb-5">
              <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
                  Free &middot; No Account &middot; No Personal Info &middot; Official FHFA &amp; VA Data
                </span>
              </div>
              <h1 className="text-[28px] sm:text-[38px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
                VA Loan Entitlement Calculator: Buy Again With a VA Loan
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Keeping your home when you PCS? See your remaining entitlement in the county where you&apos;re buying, and
                how much most lenders lend with $0 down.
              </p>
            </div>
          </div>
          <CalcStepStrip
            noBg
            steps={[
              { title: 'Enter the entitlement you’ve used' },
              { title: 'Pick the county where you’re buying' },
              { title: 'See your $0-down buying power' },
            ]}
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
            <p className="text-sm text-zinc-600 leading-relaxed">
              VA&apos;s rule: your remaining entitlement is 25% of the county&apos;s loan limit minus the entitlement you&apos;ve
              already used. In most U.S. counties the one-unit limit is {usdExact(CUR.baseline)} in {CUR.year}
              {YEARS.length > 1 ? ` and ${usdExact(LOAN_LIMIT_SUMMARIES[YEARS[1]].baseline)} in ${YEARS[1]}` : ''}.
            </p>
          </div>
        </div>
      </section>

      {/* ── Calculator ────────────────────────────────────────────────── */}
      <VAEntitlementCalculator />

      <CalculatorSummary calc="va-entitlement" />

      {/* ── Example: VA's worked example ──────────────────────────────── */}
      <section className="calc-example max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExampleBox>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">VA&apos;s worked example</h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-0">
            From VA.gov&apos;s &ldquo;VA home loan limits&rdquo; page: a county with a {usdExact(EXAMPLE.countyLimit)} limit and{' '}
            {usdExact(EXAMPLE.used)} of entitlement already used.
          </p>
          <ExampleTable>
            <ExampleRow label="County loan limit (one unit)" value={usdExact(EXAMPLE.countyLimit)} />
            <ExampleRow label="VA's 25% of the limit" value={usdExact(EXAMPLE.result.vaShare)} />
            <ExampleRow label="Entitlement already used" value={`− ${usdExact(EXAMPLE.used)}`} />
            <ExampleRow label="Remaining entitlement" value={usdExact(EXAMPLE.result.remaining)} highlight />
            <ExampleRow label="Most lenders, with $0 down (4 × remaining)" value={usdExact(EXAMPLE.result.maxZeroDown)} highlight />
          </ExampleTable>
          <p className="text-sm leading-relaxed text-zinc-700">
            <strong>What this means:</strong>{' '}VA calls {usdExact(EXAMPLE.result.maxZeroDown)} &ldquo;the maximum loan most lenders
            would make without a down payment.&rdquo; For a larger loan, most lenders want your remaining entitlement and a
            down payment together to cover at least 25% of the loan.
          </p>
        </ExampleBox>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <FaqSection faqs={VA_ENTITLEMENT_FAQS} />
        </div>

        {/* Sources */}
        <div className="rounded-lg bg-white border border-zinc-200 p-5 mb-6" data-testid="ve-sources">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Sources</p>
          <ul className="space-y-1.5 text-sm text-zinc-600 list-disc list-inside">
            {VA_ENTITLEMENT_SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-800">
                  {s.label}
                </a>
                {s.note ? ` — ${s.note}` : ''}
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimers */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 mb-6 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Disclaimers</p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This calculator provides estimates for educational purposes only. It is not a loan offer, pre-approval or a
            statement of your entitlement. VA determines your entitlement, and your Certificate of Eligibility (COE) shows
            it. Lenders set their own requirements: the 4 × remaining entitlement and the 25% down payment figures are how
            most lenders work as VA describes it, not a VA guarantee of any loan amount.
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            MilPayTools is not a lender and does not originate, process, or fund mortgage loans.
          </p>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related Calculators</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Loan Calculator →</Link>
            <Link href="/calculators/va-refinance" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Refinance Calculator →</Link>
            <Link href="/bah" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">BAH Calculator →</Link>
            <Link href="/guides/va-home-loans" className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md">VA Home Loans Guide →</Link>
          </div>
        </div>

        <Disclaimer dataYear="2026" />
      </div>
    </>
  );
}
