import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema, faqPageSchema } from '@/lib/schema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

const TITLE = 'VA Home Loans Guide 2026 | Funding Fee, Eligibility & Payment Calculator';
const DESC =
  'Understand your VA home loan benefit — eligibility, funding fee, disability waiver, BAH comparison, and payment estimates. Free tools and guides for service members and veterans.';
const CANONICAL = '/guides/va-home-loans';
const DATE = '2026-05-27';
const OG_IMAGE = '/api/og?type=guide&title=VA+Home+Loans+Guide+2026&v=1';

export const metadata: Metadata = {
  title: { absolute: TITLE },
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
    images: [{ url: OG_IMAGE, width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [OG_IMAGE],
  },
};

// ── FAQ schema data ───────────────────────────────────────────────────────────

const FAQS = [
  {
    question: 'Who qualifies for a VA home loan?',
    answer:
      'Active-duty service members qualify after 90 continuous days during wartime or 181 continuous days during peacetime. Veterans need the same service requirements plus an honorable or general discharge. National Guard and Reserve members qualify with 6+ years of qualifying service, or 90+ days of active duty under Title 10 federal orders. Surviving spouses of veterans who died in service or from a service-connected disability may also qualify. VA loan eligibility does not expire — it is a lifetime benefit.',
  },
  {
    question: 'How does the VA funding fee work?',
    answer:
      'The VA funding fee is a one-time payment to the Department of Veterans Affairs that helps sustain the loan program. It ranges from 1.25% to 3.30% of the loan amount depending on whether it is your first or subsequent use and your down payment amount. First use with no down payment: 2.15%. Subsequent use with no down payment: 3.30%. Putting 5%–9.99% down reduces the fee to 1.50% for both groups; 10%+ down reduces it to 1.25%. The fee can be financed into the loan or paid at closing.',
  },
  {
    question: 'Who is exempt from the VA funding fee?',
    answer:
      'Any service-connected disability rating of 10% or higher exempts you from the funding fee entirely — on every VA loan you ever use. Purple Heart recipients on active duty are also exempt, as are surviving spouses receiving Dependency and Indemnity Compensation (DIC) for a veteran who died in service or from a service-connected disability. If you received your disability rating after closing on a VA loan and already paid the funding fee, you may be eligible for a refund from the VA.',
  },
  {
    question: 'What makes VA loans different from conventional financing?',
    answer:
      'VA loans offer $0 down payment for eligible borrowers, no private mortgage insurance (PMI) ever, and competitive rates — typically competitive with or better than conventional loans. PMI on a conventional loan with less than 20% down can cost $150–$400/month until you reach 20% equity, which can take 7–10 years. VA loans require the home to be your primary residence — investment properties and vacation homes are not eligible.',
  },
  {
    question: 'Can I use my VA loan benefit more than once?',
    answer:
      'Yes. The VA loan is a lifetime benefit you can use multiple times. After paying off a previous VA loan and selling the property, you can restore your full entitlement. There is also a one-time entitlement restoration option even if you keep the property. If you use the benefit again without full entitlement restoration, you pay the higher subsequent-use funding fee (3.30% vs 2.15% with $0 down). A service-connected disability rating of 10%+ waives the fee on every use.',
  },
  {
    question: 'How does BAH factor into buying a home with a VA loan?',
    answer:
      'BAH is excluded from federal taxable income but is counted as income for VA loan qualification purposes. Your BAH may cover a significant portion of a mortgage payment — at many affordable duty stations it can cover 70–100%+ of an estimated payment. BAH can change if you PCS, change dependency status, or separate from service, so plan for those scenarios when sizing a mortgage.',
  },
];

// ── Benefit cards (Zone 2) ────────────────────────────────────────────────────

const VA_BENEFITS = [
  {
    accent: 'bg-blue-800',
    label: 'Benefit 1',
    title: '$0 Down. No PMI. Ever.',
    description:
      'The VA loan is one of the only loan types that allows 100% financing with no private mortgage insurance — at any down payment level, for the life of the loan.',
    bullets: [
      '$0 down payment for eligible borrowers',
      'No PMI at any down payment level',
      'PMI on conventional: $150–$400/mo until 20% equity',
      'No prepayment penalty',
    ],
    cta: 'Estimate your VA loan payment →',
    href: '/calculators/va-loan',
  },
  {
    accent: 'bg-amber-600',
    label: 'Benefit 2',
    title: 'The Funding Fee — and the Waiver',
    description:
      "VA loans have a one-time funding fee instead of ongoing PMI. If you have a service-connected disability rating, you pay $0 — on every VA loan, for life.",
    bullets: [
      'First use, $0 down: 2.15% of loan amount',
      'Subsequent use, $0 down: 3.30%',
      '10%+ disability rating: $0 fee — every use',
      'Fee can be financed into the loan',
    ],
    cta: 'Calculate your funding fee →',
    href: '/calculators/va-loan',
    secondaryHref: '/calculators/va-disability',
    secondaryLabel: 'Check if you qualify for the waiver →',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Benefit 3',
    title: 'BAH as Mortgage Power',
    description:
      'For active-duty service members, BAH often covers a significant portion of a VA loan payment. At affordable duty stations, it can cover nearly all of it.',
    bullets: [
      'BAH counts as income for VA loan qualification',
      'BAH is excluded from federal taxable income',
      'At many stations, BAH covers 70–100%+ of PITI',
      'Compare your BAH to any estimated payment instantly',
    ],
    cta: 'See BAH vs. your payment →',
    href: '/calculators/va-loan',
    secondaryHref: '/calculators/bah',
    secondaryLabel: 'Look up your BAH rate →',
  },
];

// ── Accordion items (Zone 4) ──────────────────────────────────────────────────

const ACCORDION = [
  {
    question: 'Who qualifies for a VA home loan?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          VA loan eligibility is based on your service history and character of discharge.
          General eligibility requirements:
        </p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">Active-duty service members:</strong> 90 consecutive days during wartime, or 181 consecutive days during peacetime</li>
          <li><strong className="text-zinc-800">Veterans:</strong> Same service requirements, plus honorable or general discharge</li>
          <li><strong className="text-zinc-800">National Guard &amp; Reserve:</strong> 6+ years of service, or 90+ days of active duty under Title 10 federal orders with qualifying discharge</li>
          <li><strong className="text-zinc-800">Surviving spouses:</strong> Unmarried spouses of veterans who died in service or from a service-connected disability, or who are missing in action / POW</li>
        </ul>
        <p>
          <strong className="text-zinc-800">The benefit does not expire.</strong> It is a lifetime
          benefit — there is no deadline to use it. Entitlement can be restored after selling a
          VA-financed property and paying off the loan, and the benefit can be used again.
        </p>
        <a
          href="https://www.ebenefits.va.gov/ebenefits/about/feature?feature=cert-of-eligibility-home-loan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
        >
          Get your Certificate of Eligibility at VA.gov →
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
          — not to the lender. It helps sustain the VA loan program for future generations of
          veterans. It is not an insurance premium and does not accrue interest on its own
          (though financing it adds to your loan balance).
        </p>
        <p><strong className="text-zinc-800">2026 purchase loan funding fee rates:</strong></p>
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
                <td className="px-4 py-2 font-medium text-zinc-800">2.15%</td>
                <td className="px-4 py-2 font-medium text-zinc-800">3.30%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-600">5% to 9.99%</td>
                <td className="px-4 py-2 font-medium text-zinc-800">1.50%</td>
                <td className="px-4 py-2 font-medium text-zinc-800">1.50%</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-zinc-600">10% or more</td>
                <td className="px-4 py-2 font-medium text-zinc-800">1.25%</td>
                <td className="px-4 py-2 font-medium text-zinc-800">1.25%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          On a $400,000 home with $0 down: first use fee = $8,600. Subsequent use fee = $13,200.
          You can finance the fee into your loan or pay it at closing. Financing reduces
          upfront cash needed but adds to your total interest paid over time.
        </p>
        <p className="text-xs text-zinc-400">
          Rates effective through November 14, 2031, per the Blue Water Navy Vietnam Veterans
          Act of 2019 (Public Law 116-23). Refinance loans (IRRRL, Cash-Out) have different rates.
        </p>
        <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate your funding fee →
        </Link>
      </div>
    ),
  },
  {
    question: 'The funding fee waiver — one of the most valuable disability benefits',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Any service-connected disability rating of{' '}
          <strong className="text-zinc-800">10% or higher waives the VA funding fee entirely</strong>{' '}
          — on every VA loan you ever use. This is one of the most financially significant disability
          benefits, because it applies at the time of purchase rather than as a monthly payment.
        </p>
        <p>
          On a $400,000 first-use purchase with $0 down, the standard fee is $8,600.
          On a subsequent-use purchase, that same home carries a $13,200 fee. With a 10%+
          disability rating, you pay $0 — every time, for life.
        </p>
        <p>
          <strong className="text-zinc-800">Also exempt:</strong> Purple Heart recipients on active
          duty, and surviving spouses receiving Dependency and Indemnity Compensation (DIC) for a
          veteran who died in service or from a service-connected disability.
        </p>
        <p>
          <strong className="text-zinc-800">Retroactive refunds:</strong> If you received your
          service-connected disability rating after closing on a VA loan and had already paid the
          funding fee, you may be eligible for a refund. Contact the VA or your lender to request one.
        </p>
        <Link href="/calculators/va-disability" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Calculate your combined VA disability rating →
        </Link>
      </div>
    ),
  },
  {
    question: 'What makes VA loans different from conventional financing?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p><strong className="text-zinc-800">Key VA loan advantages:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">$0 down payment</strong> — one of the only loan types that allows 100% financing for eligible borrowers</li>
          <li><strong className="text-zinc-800">No PMI, ever</strong> — conventional loans require PMI with less than 20% down, often $150–$400/month until you reach 20% equity. VA loans never have PMI.</li>
          <li><strong className="text-zinc-800">Competitive rates</strong> — VA-backed loans typically offer rates competitive with or better than conventional loans</li>
          <li><strong className="text-zinc-800">No prepayment penalty</strong> — pay off early or make extra payments without fees</li>
          <li><strong className="text-zinc-800">Lifetime benefit</strong> — can be reused after selling or paying off a previous VA-financed home</li>
        </ul>
        <p>
          <strong className="text-zinc-800">When conventional might make more sense:</strong> If you
          have 20%+ down payment (no PMI on conventional, and the VA funding fee adds upfront cost),
          if you have a subsequent-use fee and no disability exemption, or if you&apos;re buying a
          vacation home or investment property (VA loans require primary residence occupancy).
        </p>
        <p>
          <strong className="text-zinc-800">The PMI math:</strong> On a $350K home with 5% down,
          conventional PMI at ~0.5% runs about $143/month until you reach 20% equity — typically
          7–10 years. The VA loan has no equivalent ongoing cost, which is why the VA loan is
          usually superior for borrowers with little money down.
        </p>
        <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Estimate your VA loan payment →
        </Link>
      </div>
    ),
  },
  {
    question: 'Using BAH to buy a home',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Active-duty service members receive BAH based on duty station, rank, and dependency status.
          BAH is excluded from federal taxable income — but it{' '}
          <strong className="text-zinc-800">is counted as income for VA loan qualification purposes</strong>.
          Lenders can factor your housing allowance into your qualifying income, which can help you
          qualify for a larger loan than base pay alone would support.
        </p>
        <p>
          Your BAH may cover a significant portion of a mortgage payment at your duty station. At
          affordable markets, BAH often covers 70–100%+ of an estimated payment for a moderately
          priced home. Use the VA Loan Payment Calculator&apos;s BAH comparison feature to see what
          percentage of your estimated payment your current BAH covers.
        </p>
        <p>
          <strong className="text-zinc-800">Important planning consideration:</strong> BAH can change
          if you PCS, change dependency status, or separate from service. Don&apos;t build a housing
          budget that assumes your current BAH rate is permanent — plan for the scenario where it
          decreases or stops entirely after separation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Compare BAH to your estimated payment →
          </Link>
          <Link href="/calculators/bah" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
            Look up your BAH rate →
          </Link>
        </div>
      </div>
    ),
  },
  {
    question: 'Can I use my VA loan benefit more than once?',
    content: (
      <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
        <p>
          Yes. The VA loan is not a one-time benefit — it can be used multiple times throughout
          your life.
        </p>
        <p><strong className="text-zinc-800">How to use it again:</strong></p>
        <ul className="space-y-1 pl-4 list-disc">
          <li><strong className="text-zinc-800">Entitlement restoration:</strong> After paying off a previous VA loan and selling the property, your full entitlement can be restored and used again at first-use rates.</li>
          <li><strong className="text-zinc-800">One-time restoration:</strong> One time only, you can restore entitlement after paying off the loan even if you still own the property.</li>
          <li><strong className="text-zinc-800">Subsequent-use fee:</strong> Without full entitlement restoration, the funding fee is higher — 3.30% vs 2.15% with $0 down. A service-connected disability rating of 10%+ waives this fee every use.</li>
        </ul>
        <p>
          Even with the higher subsequent-use fee, VA loans often still beat conventional financing
          because there is no PMI and no down payment required. Whether the VA loan or conventional
          financing is better on a subsequent use depends on your loan amount, down payment, and
          whether you have a disability rating.
        </p>
        <Link href="/calculators/va-loan" className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors">
          Run the numbers on a subsequent-use VA loan →
        </Link>
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
    href: '/calculators/va-disability',
    border: 'border-l-purple-500',
    label: 'Calculator',
    title: 'VA Disability Rating',
    description: 'Calculate your combined rating — 10%+ waives the funding fee entirely.',
  },
  {
    href: '/calculators/bah',
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
      'What the VA loan benefit actually covers, how to get your Certificate of Eligibility, and how to use the benefit for the first time.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VAHomeLoansGuidePage() {
  return (
    <>
      <JsonLdScript schema={articleSchema({ title: 'VA Home Loans Guide 2026', description: DESC, datePublished: DATE, url: CANONICAL })} />
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
            Your{' '}
            <span className="text-red-700">VA loan benefit</span>{' '}
            could save you tens of thousands. Most people don&apos;t know how.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-7">
            No down payment. No PMI. And if you have a VA disability rating, no funding fee.
            The VA home loan is one of the most powerful financial benefits available to service
            members and veterans — but only if you understand how to use it.
          </p>

          {/* Key stat callout */}
          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              Veterans with a 10% disability rating pay{' '}
              <span className="text-red-700">$0 funding fee</span>{' '}
              — saving $7,500+ on a typical $350,000 home purchase. Many eligible veterans don&apos;t
              know they qualify.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Link
              href="/calculators/va-loan"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Estimate Your VA Loan Payment →
            </Link>
            <Link
              href="/calculators/va-disability"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              Check Your Disability Rating →
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

      {/* ── ZONE 2: Three VA loan benefits ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="w-8 h-0.5 bg-red-700 rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
              Three things that make the VA loan different from every other mortgage.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              Most eligible veterans underuse this benefit. Here&apos;s what you actually get — and what it&apos;s worth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VA_BENEFITS.map(({ accent, label, title, description, bullets, cta, href, secondaryHref, secondaryLabel }) => (
              <div key={title} className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
                <div className={`${accent} px-5 py-3`}>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">{label}</span>
                  <p className="text-lg font-bold text-white leading-snug mt-0.5">{title}</p>
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
                  <Link href={href} className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    {cta}
                  </Link>
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
                See your estimated payment before you talk to a single lender.
              </h2>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Enter your home price, rate, and down payment. The calculator shows your funding fee
                (or your exemption), estimated monthly PITI, and how your BAH compares — so you walk
                into every lender conversation already knowing your numbers.
              </p>
              <Link
                href="/calculators/va-loan"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Open the VA Loan Calculator →
              </Link>
              <p className="mt-3 text-xs text-white/40">No account. No personal info. Takes under a minute.</p>
            </div>

            {/* Right: sample VA loan calculation card */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
                <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">E-5 · First use · Fort Bragg, NC</p>
                    <p className="text-sm font-semibold text-zinc-800">$350K home · $0 down · 6.0%</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">2026 rates</span>
                </div>
                <div className="px-5 py-1 divide-y divide-zinc-100">
                  {[
                    { label: 'VA Funding Fee (2.15%)', value: '$7,525' },
                    { label: 'Monthly P&I', value: '$2,144' },
                    { label: 'Tax + Insurance', value: '$467' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-zinc-600">{label}</span>
                      <span className="text-sm font-mono tabular-nums text-zinc-800">{value}<span className="text-zinc-400">/mo</span></span>
                    </div>
                  ))}
                </div>
                <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Est. Monthly PITI</p>
                    <p className="text-2xl font-bold tabular-nums text-red-700">$2,611</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">E-5 BAH (w/ dep.)</p>
                    <p className="text-sm font-semibold text-zinc-700">$1,806/mo</p>
                    <p className="text-xs text-emerald-700 font-semibold">covers 69%</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <Link href="/calculators/va-loan" className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors">
                    Run your own numbers →
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-white/40">
                Sample — E-5 at Fort Bragg, NC. Your numbers update live as you enter inputs.
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
            <p className="text-base text-zinc-500">
              Expand any section to go deeper. Everything below is for reference — the calculators
              above give you the numbers for your specific situation.
            </p>
          </div>

          <div className="divide-y divide-zinc-200 border-t border-zinc-200">
            {ACCORDION.map(({ question, content }) => (
              <details key={question} className="group py-1">
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

          <AuthorBio />

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
                Funding fee rates shown are effective as of 2026 and apply to purchase and
                construction loans. Rates for refinance loans (IRRRL, Cash-Out) differ. Verify
                current rates at VA.gov.
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
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">Start with these calculators</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RELATED_CALCULATORS.map(({ href, border, label, title, description }) => (
                <Link
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
                </Link>
              ))}
            </div>
          </div>

          {/* Articles */}
          {RELATED_ARTICLES.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Keep reading</h2>
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
