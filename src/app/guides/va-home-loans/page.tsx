import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { TrackedLink } from '@/components/TrackedLink';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';
import { formatCurrency } from '@/lib/utils';
import { calcVaLoan, VA_LOAN_DEFAULTS } from '@/lib/calculations/vaLoan';
import {
  FUNDING_FEE_RATES_EFFECTIVE,
  VA_CASH_OUT_FUNDING_FEE,
  VA_IRRRL_FUNDING_FEE,
  VA_PURCHASE_FUNDING_FEE as FEE,
  feeRateLabel as pct,
  fundingFeeAmount,
} from '@/lib/calculations/vaLoanFees';
import { IRRRL_MIN_RATE_DROP_BPS } from '@/lib/calculations/vaRefinance';
import { BASIC_ENTITLEMENT_MAX_LOAN } from '@/lib/calculations/vaEntitlement';

const TITLE = 'VA Home Loan Guide: Eligibility & Funding Fee';
const DESC =
  'VA home loan eligibility, the funding fee and its disability exemption, entitlement and reuse, and how BAH factors into affordability. No account required.';
const CANONICAL = '/guides/va-home-loans';
const DATE = '2026-05-27';
/** Last factual review (build V3: fee figures computed, VA's exemption list, COE, IRRRL wording; V3b: service requirements). Drives "Last reviewed" and dateModified. */
const UPDATED = '2026-11-25';

// ── Figures (build V3): every funding fee rate and dollar amount below comes from the
// fee table (src/lib/calculations/vaLoanFees.ts) or the VA loan calculator's own math
// (src/lib/calculations/vaLoan.ts, its default inputs). Nothing is typed by hand.
const usd = (n: number) => formatCurrency(n);
const usdK = (n: number) => `$${Math.round(n / 1000)}K`;
/** The sample card: the VA loan calculator's defaults (first use, $0 down, fee financed, no exemption). */
const EX = calcVaLoan(VA_LOAN_DEFAULTS);
/** E-5 with dependents, Fort Bragg area, 2026 BAH: typed (J1, FIX_QUEUE row 11f, will compute it). */
const SAMPLE_BAH_E5_FORT_BRAGG = 1806;
const SAMPLE_BAH_COVERS = Math.round((SAMPLE_BAH_E5_FORT_BRAGG / EX.totalPITI) * 100);
/** Funding fee examples on a $400,000 home with $0 down. */
const EX400 = 400000;
const IRRRL_FEE = pct(VA_IRRRL_FUNDING_FEE);
const COE_URL = 'https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/';
// Service requirements: docs/sources/va-home-loan-eligibility-2026.md (V3b).
const ELIGIBILITY_URL = 'https://www.va.gov/housing-assistance/home-loans/eligibility/';
const OG_IMAGE = ogImage({ type: 'guide', title: 'VA Home Loans Guide 2026', sub: 'Eligibility, funding fee, disability waiver, and payments' });

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `https://www.milpaytools.com${CANONICAL}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: 'article',
    url: CANONICAL,
    siteName: 'MilPayTools',
    publishedTime: DATE,
    authors: ['Dan Stevens'],
    images: OG_IMAGE,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: OG_IMAGE,
  },
};

// ── FAQ schema data ───────────────────────────────────────────────────────────

const FAQS = [
  {
    question: 'Who qualifies for a VA home loan?',
    answer:
      "Active-duty service members, Veterans, Guard and Reserve members, and some surviving spouses of veterans who died in service or from a service-connected disability can be eligible. VA's minimum service is at least 90 continuous days for current active-duty service members; National Guard and Selected Reserve members qualify through paths that include at least 90 days of non-training active-duty service or 6 creditable years of service; for Veterans, it depends on when they served, and discharge character also counts. The Certificate of Eligibility (COE) confirms eligibility for a lender; VA lists three ways to request one: online, through your lender, or by mail with VA Form 26-1880. The benefit does not expire and can be used multiple times with entitlement restoration.",
  },
  {
    question: 'How does the VA funding fee work?',
    answer:
      `The VA funding fee is a one-time payment to the Department of Veterans Affairs. On a purchase it ranges from ${pct(FEE.first.gte10)} to ${pct(FEE.subsequent.lt5)} of the loan amount depending on whether it is your first or subsequent use and your down payment. First use with no down payment: ${pct(FEE.first.lt5)}. Subsequent use with no down payment: ${pct(FEE.subsequent.lt5)}. Putting 5%–9.99% down reduces the fee to ${pct(FEE.first.gte5lt10)} for both groups; 10%+ reduces it to ${pct(FEE.first.gte10)}. The fee can be financed into the loan or paid at closing. VA's current rates took effect ${FUNDING_FEE_RATES_EFFECTIVE}.`,
  },
  {
    question: 'Who is exempt from the VA funding fee?',
    answer:
      "VA's rule: you don't pay the funding fee if any of these is true. (1) You receive VA compensation for a service-connected disability. (2) You're eligible for that compensation but receive retirement or active-duty pay instead. (3) You receive Dependency and Indemnity Compensation (DIC) as the surviving spouse of a Veteran. (4) You're a service member with a proposed or memorandum rating, dated before closing, that says you're eligible for compensation because of a pre-discharge claim. (5) You're on active duty and, on or before closing, provide evidence that you received a Purple Heart. The exemption follows compensation, not a rating number. If VA later awards you compensation with an effective date before your closing date, you may be eligible for a refund.",
  },
  {
    question: 'Does no down payment mean no cash needed at closing?',
    answer:
      'No. Even with $0 down, a VA purchase loan typically requires cash for earnest money, home inspection, appraisal, prepaid property taxes and insurance, lender origination and title fees, and moving costs. The funding fee can be financed; whether other closing costs can be financed depends on VA’s and your lender’s rules. Seller credits and lender credits can reduce cash needed, and VA allows sellers to contribute toward closing costs — but plan for real cash requirements before signing a purchase contract.',
  },
  {
    question: 'Can I use my VA loan benefit more than once?',
    answer:
      `Yes. The VA loan can be used multiple times. Full entitlement is restored when the home bought with the prior VA loan is sold and the loan paid in full, or when a qualified Veteran buyer assumes the loan and substitutes their entitlement. There is also a one-time restoration if you've repaid the prior loan in full, even if you keep the home. If a prior VA loan still uses part of your entitlement, VA's rule for what's left is 25% of the county's One-Unit loan limit minus the entitlement already used, and most lenders lend up to 4 times that with no down payment. After your first use, the funding fee with less than 5% down is ${pct(FEE.subsequent.lt5)} instead of ${pct(FEE.first.lt5)}. Veterans receiving VA disability compensation don't pay the funding fee on any use. With full entitlement there's no VA loan limit, but lenders still approve the loan based on your credit, income, debts and assets.`,
  },
  {
    question: 'How does BAH factor into a VA loan?',
    answer:
      'BAH is excluded from federal taxable income but is counted as income for VA loan qualification purposes. How much of an estimated monthly payment BAH covers depends on the duty station. BAH can change if you PCS, change dependency status, or separate from service. Size the mortgage conservatively — not at the edge of what current BAH covers — and plan for the scenario where BAH decreases or stops.',
  },
  {
    question: 'What is the VA IRRRL (streamline refinance)?',
    answer:
      `The Interest Rate Reduction Refinance Loan (IRRRL) refinances an existing VA-backed home loan; it can't refinance any other loan. It may lower your monthly payment by getting you a lower interest rate, or move you from an adjustable rate to a fixed rate, which can make payments more stable. Fixed to fixed, the new rate must be at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower (38 U.S.C. § 3709(b)). VA generally doesn't require an appraisal or credit underwriting for an IRRRL. Lenders can still require them under their own rules. The VA funding fee on an IRRRL is ${IRRRL_FEE}, and borrowers on VA's exemption list don't pay it.`,
  },
];

// ── Tracked links (V3b) ───────────────────────────────────────────────────────

/**
 * Every link on this hub to the VA loan, VA entitlement (V2) or VA refinance calculator sends
 * calc_deeplink_click (`guide`, placement `hub`). Any other href (the card and
 * related-calculator maps also hold /calculators/va-disability, /bah and
 * /calculators/total-compensation) renders a plain <Link>.
 */
function HubLink({ href, ...rest }: ComponentProps<typeof Link>) {
  const path = typeof href === 'string' ? href : '';
  const to = path.startsWith('/calculators/va-loan')
    ? ('va-loan' as const)
    : path.startsWith('/calculators/va-refinance')
      ? ('va-refinance' as const)
      : path.startsWith('/calculators/va-entitlement')
        ? ('va-entitlement' as const)
        : null;
  if (!to) return <Link href={href} {...rest} />;
  return <TrackedLink href={href} fromPageType="guide" toCalculator={to} placement="hub" {...rest} />;
}

// ── Benefit cards (Zone 2) ────────────────────────────────────────────────────

const VA_BENEFITS = [
  {
    accent: 'bg-blue-800',
    label: 'Feature 1',
    title: 'No down payment. No PMI.',
    description:
      'Eligible borrowers can purchase with no down payment and pay no monthly mortgage insurance — at any loan-to-value.',
    bullets: [
      '$0 down for eligible borrowers',
      'No monthly mortgage insurance at any LTV',
      'Conventional loans under 20% down usually add PMI',
      'No prepayment penalty',
    ],
    cta: 'Estimate your payment →',
    href: '/calculators/va-loan',
  },
  {
    accent: 'bg-amber-600',
    label: 'Feature 2',
    title: 'Funding fee — and who\'s exempt',
    description: 'A one-time fee to the VA, not your lender. Many are exempt.',
    bullets: [
      `First use, $0 down: ${pct(FEE.first.lt5)} of loan`,
      `Subsequent use, $0 down: ${pct(FEE.subsequent.lt5)} of loan`,
      'Receiving VA disability compensation: $0 fee',
      'Can finance into loan or pay at closing',
    ],
    cta: 'See your funding fee →',
    href: '/calculators/va-loan',
    secondaryHref: '/calculators/va-disability',
    secondaryLabel: 'Check your disability rating →',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Feature 3',
    title: 'VA Streamline Refinance (IRRRL)',
    description: 'Already have a VA loan? An IRRRL may lower your rate and monthly payment.',
    bullets: [
      'Refinances an existing VA loan only',
      `Fixed to fixed: new rate at least ${IRRRL_MIN_RATE_DROP_BPS} basis points lower`,
      'Can move an adjustable rate to a fixed rate',
      'VA generally requires no appraisal or credit underwriting (lenders may)',
    ],
    cta: 'Estimate your refinance savings →',
    href: '/calculators/va-refinance',
  },
];

// ── Accordion items (Zone 4) ──────────────────────────────────────────────────

const ACCORDION = [
  {
    question: 'Who qualifies for a VA home loan?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">Active-duty service members</strong> can be eligible
          after at least 90 continuous days of service.
        </p>
        <p>
          <strong className="text-zinc-800">Veterans</strong> have eligibility rules that depend
          on service period, length of service, and discharge character. The specifics vary
          depending on when you served;{' '}
          <a
            href={ELIGIBILITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-700 hover:text-red-800 underline"
          >
            VA&apos;s eligibility page
          </a>{' '}
          lists them by service period.
        </p>
        <p>
          <strong className="text-zinc-800">Guard and Reserve members</strong> may qualify through
          paths that include at least 90 days of non-training active-duty service or 6
          creditable years of service. Because the rules depend on orders
          and discharge status, use the COE process to confirm.
        </p>
        <p>
          <strong className="text-zinc-800">Surviving spouses</strong> — an unmarried surviving
          spouse of a veteran who died in service or from a service-connected disability may
          be eligible.
        </p>
        <p>
          <strong className="text-zinc-800">The benefit does not expire</strong> — it can be used
          multiple times with entitlement restoration after paying off a prior VA loan.
        </p>
        <p>
          <strong className="text-zinc-800">Your Certificate of Eligibility (COE) is what
          confirms eligibility for a lender.</strong> VA lists three ways to request one: online,
          through your lender (the lender may use VA&apos;s Web LGY system), or by mail with VA
          Form 26-1880.
        </p>
        <a
          href={COE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
        >
          How to request a COE (VA.gov) →
        </a>
      </div>
    ),
  },
  {
    question: 'How does the VA funding fee work?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The VA funding fee is a one-time payment paid to the Department of Veterans Affairs
          — not to the lender. It is not a monthly
          insurance premium and does not accrue interest on its own, though financing it adds
          to your loan balance and total interest paid.
        </p>
        <p><strong className="text-zinc-800">Purchase loan funding fee rates (2026):</strong></p>
        <div className="overflow-x-auto rounded-md border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-4 py-2 font-semibold text-zinc-700">Down Payment</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-700">First Use</th>
                <th className="text-left px-4 py-2 font-semibold text-zinc-700">Subsequent Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="px-4 py-2 text-zinc-600">Less than 5%</td>
                <td className="px-4 py-2 font-medium text-zinc-800">{pct(FEE.first.lt5)}</td>
                <td className="px-4 py-2 font-medium text-zinc-800">{pct(FEE.subsequent.lt5)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-600">5% to 9.99%</td>
                <td className="px-4 py-2 font-medium text-zinc-800">{pct(FEE.first.gte5lt10)}</td>
                <td className="px-4 py-2 font-medium text-zinc-800">{pct(FEE.subsequent.gte5lt10)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-600">10% or more</td>
                <td className="px-4 py-2 font-medium text-zinc-800">{pct(FEE.first.gte10)}</td>
                <td className="px-4 py-2 font-medium text-zinc-800">{pct(FEE.subsequent.gte10)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          {`On a ${usd(EX400)} home with $0 down: first use fee = ${usd(fundingFeeAmount(EX400, FEE.first.lt5))}. Subsequent use fee = ${usd(fundingFeeAmount(EX400, FEE.subsequent.lt5))}.`}{' '}
          Both are one-time costs, not monthly charges. Financing the fee reduces upfront cash
          but increases your loan balance and total interest.
        </p>
        <p className="text-xs text-zinc-400">
          {`VA's current rates took effect ${FUNDING_FEE_RATES_EFFECTIVE}. Refinance loans have their own rates: IRRRL ${IRRRL_FEE}; cash-out ${pct(VA_CASH_OUT_FUNDING_FEE.first)} on first use, ${pct(VA_CASH_OUT_FUNDING_FEE.subsequent)} after first use.`}
        </p>
        <HubLink href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate your funding fee →
        </HubLink>
      </div>
    ),
  },
  {
    question: 'Funding fee exemptions — who qualifies',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          VA&apos;s rule: you don&apos;t pay the funding fee if any of these is true for you:
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>You receive VA compensation for a service-connected disability</li>
          <li>You&apos;re eligible for that compensation but receive retirement or active-duty pay instead</li>
          <li>You receive Dependency and Indemnity Compensation (DIC) as the surviving spouse of a Veteran</li>
          <li>You&apos;re a service member with a proposed or memorandum rating, dated before closing, that says you&apos;re eligible for compensation because of a pre-discharge claim</li>
          <li>You&apos;re on active duty and, on or before closing, provide evidence that you received a Purple Heart</li>
        </ul>
        <p>
          The exemption follows compensation, not a rating number: a 0% rating pays no
          compensation, so on its own it doesn&apos;t exempt anyone.{' '}
          <strong className="text-zinc-800">Check that your Loan Estimate and Closing Disclosure
          show the fee the way you expect before closing.</strong>
        </p>
        <p>
          <strong className="text-zinc-800">Refunds:</strong>{' '}VA&apos;s rule: if you paid the fee
          and VA later awards you compensation with an effective date before your loan&apos;s
          closing date, you may be eligible for a refund. A proposed or memorandum rating
          received after closing doesn&apos;t qualify for a refund.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Calculate your combined VA disability rating →
          </Link>
          <Link href="/blog/va-loan-funding-fee-explained" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Full 2026 funding fee rates and exemptions →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'VA loan vs. conventional financing — understanding the tradeoffs',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p><strong className="text-zinc-800">Situations where VA often has advantages:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Limited cash for down payment — VA allows no down payment where conventional requires 3–20%</li>
          <li>Low down payment scenarios — conventional loans with less than 20% down usually add PMI until enough equity builds</li>
          <li>You&apos;re exempt from the funding fee — VA&apos;s main upfront cost is gone</li>
          <li>Long hold period — the no-PMI advantage compounds over time</li>
        </ul>
        <p><strong className="text-zinc-800">Situations where conventional may be worth comparing:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>20%+ down payment — no PMI either way, and the VA funding fee adds upfront cost</li>
          <li>Short hold period — the funding fee may not be recovered if you sell within 1–2 years</li>
          <li>Subsequent use without exemption — the {pct(FEE.subsequent.lt5)} fee (less than 5% down) versus a conventional option is worth modeling</li>
          <li>Property condition — VA appraisal requirements may complicate purchases of distressed homes</li>
          <li>Investment property or vacation home — VA requires primary residence occupancy</li>
        </ul>
        <p>
          The clearest way to decide is to get Loan Estimates from VA-approved lenders and
          conventional lenders and compare the actual numbers side by side, including total
          upfront costs, monthly payment, and projected break-even on the funding fee.
        </p>
        <HubLink href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Estimate your VA loan payment →
        </HubLink>
      </div>
    ),
  },
  {
    question: 'How BAH affects affordability',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Active-duty service members receive BAH based on duty station, rank, and dependency
          status. BAH is excluded from federal taxable income — but it{' '}
          <strong className="text-zinc-800">is counted as income for VA loan qualification
          purposes</strong>. Lenders can include it in your qualifying income, which can affect
          how much you can borrow.
        </p>
        <p>
          How much of a mortgage payment BAH covers depends on the duty station. Use the VA
          Loan Payment Calculator&apos;s BAH comparison feature to see what percentage of your
          estimated payment your current BAH covers.
        </p>
        <p>
          <strong className="text-zinc-800">Budget conservatively.</strong> BAH can help
          support a mortgage payment, but it should not be treated as a guarantee that buying
          is the right move. PCS timing, maintenance costs, property tax increases, insurance
          increases, vacancy risk if you rent after PCS, and selling costs can erode the
          advantage if your timeline is short or the market is weak. Size the mortgage at what
          you can afford without BAH, or at a meaningful cushion below BAH — not at the edge
          of what BAH covers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <HubLink href="/calculators/va-loan?bah=yes" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Compare BAH to your estimated payment →
          </HubLink>
          <Link href="/bah" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Look up your BAH rate →
          </Link>
          <Link href="/blog/using-bah-to-buy-a-home" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            How BAH works as mortgage income →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'What you still need cash for — closing costs',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          No down payment does not mean no cash at closing. The VA funding fee can be financed
          into the loan; whether other closing costs can be financed depends on VA&apos;s and your
          lender&apos;s rules. Even with $0 down, plan for:
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>Earnest money deposit (refundable if contract falls through under most contingencies, but due at contract)</li>
          <li>Home inspection</li>
          <li>Appraisal fee</li>
          <li>Prepaid property taxes and homeowner&apos;s insurance</li>
          <li>Lender origination and title/recording fees</li>
          <li>Optional discount points</li>
          <li>Reserves after closing (some lenders require a set number of payments in savings)</li>
          <li>Repairs, furniture, and move-in costs</li>
        </ul>
        <p>
          Seller credits and lender credits can reduce cash needed at closing, and VA allows
          sellers to contribute toward closing costs. Ask about these options when negotiating.
          But go into the process with a realistic cash estimate — not just the down payment.
        </p>
      </div>
    ),
  },
  {
    question: 'Understanding VA loan entitlement',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          <strong className="text-zinc-800">Entitlement is not how much you can borrow.</strong>{' '}
          It is the part of the loan VA guarantees to the lender: for loans above{' '}
          {usd(BASIC_ENTITLEMENT_MAX_LOAN)}, up to 25% of the loan amount. With full entitlement, VA
          says you don&apos;t have a loan limit, but the lender still has to approve the loan (your
          credit, income, debts and assets) and the appraisal has to support the price.
        </p>
        <p>
          <strong className="text-zinc-800">Remaining entitlement:</strong>{' '}if a prior VA loan still
          uses part of your entitlement, VA&apos;s rule for what&apos;s left is 25% of the county&apos;s
          One-Unit loan limit (FHFA&apos;s conforming loan limit) minus the entitlement already used. Most
          lenders lend up to 4 times your remaining entitlement with no down payment; for a larger loan,
          most lenders want your entitlement and a down payment together to cover at least 25% of the loan.
        </p>
        <p><strong className="text-zinc-800">Restoring entitlement:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">Sell and pay off:</strong>{' '}the home bought with the prior VA loan is sold and the loan paid in full</li>
          <li><strong className="text-zinc-800">Assumption with substitution:</strong>{' '}a qualified Veteran buyer assumes the loan and substitutes their entitlement</li>
          <li><strong className="text-zinc-800">One-time restoration:</strong>{' '}the prior VA loan is repaid in full, even if you keep the home (once only)</li>
        </ul>
        <p>
          {`After your first use, the funding fee with less than 5% down is ${pct(FEE.subsequent.lt5)} instead of ${pct(FEE.first.lt5)}.`}{' '}
          Veterans receiving VA disability compensation don&apos;t pay the funding fee on any use.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-1">
          <HubLink href="/calculators/va-entitlement" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Check your remaining entitlement by county →
          </HubLink>
          <HubLink href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Estimate payment for a subsequent-use VA loan →
          </HubLink>
          <Link href="/blog/can-i-use-va-loan-again" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Entitlement restoration and reuse explained →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'When to compare other loan types',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          A VA loan is not automatically the right choice for every purchase. Consider
          comparing conventional financing if:
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>You have 20% or more for a down payment — conventional avoids PMI too, and has no funding fee</li>
          <li>You expect to sell within 1–2 years — closing costs and the funding fee may not be recovered before you sell</li>
          <li>You aren&apos;t exempt from the funding fee and a conventional loan with PMI is cheaper in total over your expected hold period</li>
          <li>The property has condition issues that may complicate VA appraisal requirements (VA appraisals have minimum property standards)</li>
          <li>You are buying a second home or investment property — VA requires the home to be your primary residence</li>
        </ul>
        <p>
          One way to compare is to get actual Loan Estimates from both VA-approved and
          conventional lenders, then compare total upfront costs, monthly payment, and
          break-even timeline side by side. The calculator on this site gives you a baseline
          to start from.
        </p>
        <HubLink href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Estimate your VA loan payment →
        </HubLink>
      </div>
    ),
  },
  {
    id: 'irrrl',
    question: 'VA Streamline Refinance (IRRRL)',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          The Interest Rate Reduction Refinance Loan — commonly called the IRRRL or
          &ldquo;streamline refinance&rdquo; — refinances an existing VA-backed home loan. It may
          lower your monthly payment by getting you a lower interest rate.
        </p>
        <p><strong className="text-zinc-800">Key features:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li>VA generally doesn&apos;t require an appraisal or credit underwriting for an IRRRL. Lenders can still require them under their own rules.</li>
          <li>You must certify that you currently live in or used to live in the home covered by the loan</li>
          <li>Fixed to fixed, the new rate must be at least {IRRRL_MIN_RATE_DROP_BPS} basis points lower; an IRRRL can also move you from an adjustable rate to a fixed rate, which can make payments more stable</li>
          <li>VA funding fee on an IRRRL: {IRRRL_FEE} of the loan amount (lower than any purchase fee)</li>
          <li>Borrowers on VA&apos;s funding fee exemption list don&apos;t pay the IRRRL funding fee either</li>
        </ul>
        <p>
          <strong className="text-zinc-800">Important:</strong> The IRRRL is only available
          if you already have a VA loan. It cannot be used to refinance a conventional, FHA,
          or other non-VA loan into a VA loan. For that, you would need a VA Cash-Out
          Refinance, which has different requirements and a higher funding fee.
        </p>
        <p>
          <strong className="text-zinc-800">When an IRRRL is commonly considered:</strong> If
          interest rates have dropped since you got your VA loan, or if you have an
          adjustable-rate VA loan you want to move to a fixed rate.
        </p>
        <HubLink href="/calculators/va-refinance" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Estimate an IRRRL with the VA refinance calculator →
        </HubLink>
        <p className="text-xs text-zinc-400">
          MilPayTools does not provide refinance quotes or lender recommendations. Contact
          VA-approved lenders to compare IRRRL offers.
        </p>
      </div>
    ),
  },
];

// ── Related calculators (Zone 5) ──────────────────────────────────────────────

const RELATED_CALCULATORS = [
  {
    href: '/calculators/va-loan',
    border: 'border-l-red-500',
    label: 'Calculator',
    title: 'VA Loan Payment Calculator',
    description: 'Estimate your monthly payment, funding fee, and optional BAH comparison.',
  },
  {
    href: '/calculators/va-entitlement',
    border: 'border-l-amber-500',
    label: 'Calculator',
    title: 'VA Loan Entitlement Calculator',
    description: 'Keeping a home with a VA loan? See your remaining entitlement and $0-down buying power by county.',
  },
  {
    href: '/calculators/va-disability',
    border: 'border-l-purple-500',
    label: 'Calculator',
    title: 'VA Disability Calculator',
    description: 'Calculate your combined rating — Veterans receiving VA disability compensation don\u2019t pay the funding fee.',
  },
  {
    href: '/bah',
    border: 'border-l-blue-500',
    label: 'Calculator',
    title: 'BAH Calculator',
    description: 'Look up your housing allowance by location, rank, and dependency status.',
  },
  {
    href: '/calculators/total-compensation',
    border: 'border-l-emerald-500',
    label: 'Calculator',
    title: 'Total Compensation',
    description: 'See your full military compensation including BAH, BAS, and tax advantages.',
  },
];

// ── Related articles (Zone 5) — only confirmed existing posts ─────────────────

const RELATED_ARTICLES = [
  {
    href: '/blog/va-home-loan-basics',
    border: 'border-l-blue-500',
    label: 'VA Home Loans',
    title: 'VA Home Loans Explained',
    description:
      'What the VA loan benefit covers, how to get your Certificate of Eligibility, and how to use the benefit for the first time.',
  },
  {
    href: '/blog/va-loan-funding-fee-explained',
    border: 'border-l-green-500',
    label: 'Funding Fee',
    title: 'VA Loan Funding Fee Explained',
    description:
      'Every 2026 rate, exemption, and dollar amount — purchase, IRRRL, and cash-out. Know exactly what applies before you close.',
  },
  {
    href: '/blog/can-i-use-va-loan-again',
    border: 'border-l-amber-500',
    label: 'Entitlement',
    title: 'Can I Use My VA Loan Again?',
    description:
      'Entitlement restoration, one-time restoration, simultaneous loans, and what the subsequent use fee actually costs.',
  },
  {
    href: '/blog/using-bah-to-buy-a-home',
    border: 'border-l-purple-500',
    label: 'BAH & Homebuying',
    title: 'Using BAH to Buy a Home',
    description:
      'BAH as qualifying income, the tax-equivalent math, what BAH covers at your duty station, and the PCS and separation scenarios.',
  },
  {
    href: '/blog/va-appraisal-what-to-expect',
    border: 'border-l-red-500',
    label: 'VA Appraisal',
    title: 'VA Appraisal: What to Expect',
    description:
      'What the appraiser looks for, Minimum Property Requirements, the Tidewater process, and what to do if the value comes in low.',
  },
  {
    href: '/blog/va-loan-vs-fha-vs-conventional',
    border: 'border-l-teal-500',
    label: 'Loan Comparison',
    title: 'VA Loan vs FHA vs Conventional',
    description:
      'When each loan type makes sense, what the hidden costs are, and how to compare actual Loan Estimates for your situation.',
  },
  {
    href: '/blog/va-loan-assumptions-explained',
    border: 'border-l-indigo-500',
    label: 'Assumptions',
    title: 'VA Loan Assumptions Explained',
    description:
      'How VA loan assumptions work, what happens to seller entitlement, and when a below-market-rate assumption makes sense for buyers and sellers.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VAHomeLoansGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'VA Home Loans Guide 2026', description: DESC, datePublished: DATE, dateModified: UPDATED, url: CANONICAL })} />
      <JsonLdScript schema={faqPageSchema(FAQS)} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/guides" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">VA Home Loans</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── ZONE 1: Hero ── */}
      <section className="border-b border-zinc-200 py-12 sm:py-16 px-4" style={{ background: 'linear-gradient(to bottom, #ecddc8 0%, #f5f0e8 100%)' }}>
        <div className="mx-auto max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free &middot; No Account &middot; No Personal Info &middot; Official 2026 VA &amp; DoD Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Understand your{' '}
            <span className="text-red-700">VA loan</span>{' '}
            before you talk to a lender.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            Estimate your payment, funding fee, and BAH coverage in one place — then decide
            whether a VA loan fits your budget, PCS timeline, and long-term plan.
          </p>

          {/* Informational callout */}
          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              Veterans receiving VA disability compensation don&apos;t pay the funding fee, and
              VA lists four other exemptions. Check how the fee appears on your{' '}
              <span className="text-red-700">Loan Estimate</span>{' '}
              before closing.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <HubLink
              href="/calculators/va-loan"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Estimate my VA loan payment →
            </HubLink>
            <Link
              href="/calculators/va-disability"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              Check your disability rating →
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. MilPayTools is not a lender and does not provide rate quotes.
          </p>
        </div>
      </section>

      {/* ── Opening context ── */}
      <section className="bg-white border-b border-zinc-200 py-8 sm:py-10 px-4">
        <div className="mx-auto max-w-3xl prose-sm text-zinc-600 leading-relaxed space-y-4">
          <p>
            A VA loan can reduce the two biggest barriers to buying a home: down payment and
            monthly mortgage insurance. But it is still a mortgage. The payment has to fit
            your budget, the home has to appraise, closing costs still matter, and your
            PCS timeline can change the math quickly.
          </p>
          <p>
            This guide helps you estimate the payment, understand the funding fee, compare
            the payment against your BAH, and decide what questions to ask before you talk
            to a lender.
          </p>
        </div>
      </section>

      {/* ── ZONE 2: Three VA loan features ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="w-8 h-0.5 bg-red-700 rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
              What the VA loan program actually offers
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              Three structural differences that affect upfront cash, monthly payment, and how you qualify.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VA_BENEFITS.map(({ accent, label, title, description, bullets, cta, href, secondaryHref, secondaryLabel }) => (
              <div key={label} className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
                <div className={`${accent} px-5 py-3`}>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">{label}</span>
                  <p className="text-base font-bold text-white leading-snug mt-0.5">{title}</p>
                </div>
                <div className="px-5 py-4 flex flex-col flex-1">
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">{description}</p>
                  <ul className="space-y-2 flex-1 mb-5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <svg className="w-4 h-4 flex-none text-zinc-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-zinc-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <HubLink href={href} className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    {cta}
                  </HubLink>
                  {secondaryHref && (
                    <Link href={secondaryHref} className="mt-1.5 text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                      {secondaryLabel}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ZONE 3: Mid-page CTA strip ── */}
      <section className="bg-slate-900 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: copy + CTA */}
            <div>
              <div className="flex justify-start mb-4" aria-hidden="true">
                <div className="w-8 h-0.5 bg-red-500 rounded-full" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight leading-tight">
                Run your VA loan numbers before you talk to a lender.
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your home price, rate, and down payment. The calculator shows your
                funding fee (or your exemption), estimated monthly PITI, and how your BAH
                compares — so you can compare lender quotes against your own estimate.
              </p>
              <HubLink
                href="/calculators/va-loan"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Open the VA Loan Calculator →
              </HubLink>
              <p className="mt-3 text-xs text-white/40">No account. No personal info. Takes under a minute.</p>
            </div>

            {/* Right: sample VA loan calculation card */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">E-5 · First use · Fort Bragg area, NC</p>
                    <p className="text-sm font-semibold text-zinc-800">{`${usdK(VA_LOAN_DEFAULTS.homePrice)} home · $0 down · ${VA_LOAN_DEFAULTS.rate.toFixed(1)}%`}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">2026 rates</span>
                </div>
                <div className="px-5 py-1 divide-y divide-zinc-100">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-zinc-600">{`VA Funding Fee (${pct(EX.fundingFeeRate)})`}</span>
                    <span className="text-sm font-mono tabular-nums text-zinc-800" data-testid="guide-sample-fee">{usd(EX.fundingFeeAmount)} <span className="text-zinc-400 text-xs">one-time</span></span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-zinc-600">Monthly P&amp;I</span>
                    <span className="text-sm font-mono tabular-nums text-zinc-800">{usd(EX.monthlyPI)}<span className="text-zinc-400">/mo</span></span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-zinc-600">Tax + Insurance</span>
                    <span className="text-sm font-mono tabular-nums text-zinc-800">{usd(EX.monthlyTax + EX.monthlyIns)}<span className="text-zinc-400">/mo</span></span>
                  </div>
                </div>
                <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Est. Monthly PITI</p>
                    <p className="text-2xl font-bold tabular-nums text-red-700" data-testid="guide-sample-piti">{usd(EX.totalPITI)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">E-5 BAH (w/ dep.)</p>
                    <p className="text-sm font-semibold text-zinc-700">{usd(SAMPLE_BAH_E5_FORT_BRAGG)}/mo</p>
                    <p className="text-xs text-emerald-700 font-semibold">{`covers ${SAMPLE_BAH_COVERS}%`}</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <HubLink href="/calculators/va-loan" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    Run your own numbers →
                  </HubLink>
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-white/40">
                Sample only — E-5 at Fort Bragg area, NC. Your numbers update live as you enter inputs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE 4: Learning zone ── */}
      <section className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight">
              Understanding your VA home loan benefit
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-3">
              A VA home loan is a mortgage benefit for eligible service members, veterans, and certain surviving spouses. It can allow qualified borrowers to purchase a primary residence with no required down payment and no monthly mortgage insurance. The borrower still has to qualify with a lender, pay closing costs, satisfy VA occupancy rules, and meet appraisal and property requirements.
            </p>
            <p className="text-base text-zinc-500">
              Expand any section to go deeper. Everything below is for reference — the calculators
              above give you the numbers for your specific situation.
            </p>
          </div>

          <div className="divide-y divide-zinc-200 border-t border-zinc-200">
            {ACCORDION.map(({ question, content, id }) => (
              <details key={question} id={id} className="group py-1">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-semibold text-zinc-900 group-open:text-red-700 transition-colors pr-4">
                    {question}
                  </span>
                  <svg
                    className="w-5 h-5 text-zinc-400 flex-none transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-6 pr-4 sm:pr-8">
                  {content}
                </div>
              </details>
            ))}
          </div>

          <AuthorBio date={UPDATED} />

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Link href="/guides" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              ← Back to all guides
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/guides/va-disability" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                VA Disability Guide →
              </Link>
              <Link href="/guides/military-pay" className="text-red-700 hover:text-red-800 font-medium transition-colors">
                Military Pay Guide →
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100">
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5 space-y-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Disclaimers</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                This guide is for educational purposes only. MilPayTools is not a mortgage lender
                and does not originate, process, or fund mortgage loans. We do not provide rate
                quotes, pre-approvals, or lender recommendations. VA loan eligibility is determined
                by the Department of Veterans Affairs. Loan terms, rates, and qualification
                requirements are determined by individual VA-approved lenders. Consult with a
                VA-approved lender for personalized loan information.
              </p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {`Funding fee rates shown are VA's current rates (effective ${FUNDING_FEE_RATES_EFFECTIVE}) for purchase and construction loans. Rates for refinance loans (IRRRL, cash-out) differ. Verify current rates at VA.gov.`}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Disclaimer dataYear="2026" />
          </div>
        </div>
      </section>

      {/* ── ZONE 5: Related tools and content ── */}
      <section className="bg-zinc-50 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">

          {/* Calculators */}
          <div className="mb-10">
            <div className="mb-6">
              <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">Start with these VA loan calculators</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {RELATED_CALCULATORS.map(({ href, border, label, title, description }) => (
                <HubLink
                  key={href}
                  href={href}
                  className={`group bg-white rounded-xl border border-zinc-200 border-l-4 ${border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 px-5 py-5 flex flex-col gap-3`}
                >
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
                  <p className="text-sm font-bold text-zinc-900 group-hover:text-red-700 transition-colors leading-snug">
                    {title}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed flex-1">{description}</p>
                  <span className="text-xs font-bold text-red-700 group-hover:text-red-800 transition-colors mt-auto">
                    Open calculator →
                  </span>
                </HubLink>
              ))}
            </div>
          </div>

          {/* Articles */}
          {RELATED_ARTICLES.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Keep reading about VA home loans</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {RELATED_ARTICLES.map(({ href, border, label, title, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`group bg-white rounded-xl border border-zinc-200 border-l-4 ${border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 px-5 py-5 flex flex-col gap-3`}
                  >
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-red-700 transition-colors leading-snug">
                      {title}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
                    <span className="text-xs font-bold text-red-700 group-hover:text-red-800 transition-colors mt-auto">
                      Read article →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
