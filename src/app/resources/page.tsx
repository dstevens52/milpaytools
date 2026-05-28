import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';

export const metadata: Metadata = {
  title: { absolute: 'Free Military Finance Tools You Can Share With Confidence | MilPayTools' },
  description:
    'MilPayTools helps service members, veterans, and military families understand pay, BAH, PCS costs, VA disability, education benefits, retirement, and transition — using official DoD and VA data. No account required, no personal information collected.',
  alternates: { canonical: 'https://www.milpaytools.com/resources' },
  openGraph: {
    title: 'Free Military Finance Tools You Can Share With Confidence | MilPayTools',
    description:
      'MilPayTools helps service members, veterans, and military families understand pay, BAH, PCS costs, VA disability, and transition — official data, no account, no ads.',
    url: 'https://www.milpaytools.com/resources',
    type: 'website',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=home&title=MilPayTools+Resources&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Military Finance Tools You Can Share With Confidence | MilPayTools',
    description:
      'Official data. No account required. No personal information collected. Safe to share with service members, veterans, and military families.',
    images: ['/api/og?type=home&title=MilPayTools+Resources&v=2'],
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Free Military Finance Tools You Can Share With Confidence',
  description:
    'MilPayTools helps service members, veterans, and military families understand pay, BAH, PCS costs, VA disability, education benefits, retirement, and transition decisions using official DoD and VA data.',
  url: 'https://www.milpaytools.com/resources',
  publisher: {
    '@type': 'Organization',
    name: 'MilPayTools',
    url: 'https://www.milpaytools.com',
  },
};

// ── Flagship sections ──────────────────────────────────────────────────────────

const FLAGSHIP_SECTIONS = [
  {
    id: 'compensation',
    label: 'A',
    heading: 'Understand your real military compensation',
    body: 'Base pay alone can dramatically understate what military service is worth. BAH, BAS, tax advantages, healthcare value, and TSP contributions can add $20,000–$50,000 per year that doesn\'t show up on the LES base pay line.',
    tools: [
      { href: '/calculators/total-compensation', name: 'Total Military Compensation Calculator', desc: 'Full pay breakdown including BAH, BAS, tax advantages, and civilian salary equivalent' },
      { href: '/calculators/bah', name: 'BAH Calculator', desc: 'Housing allowance by location, rank, and dependency status — 40,000+ ZIP codes' },
      { href: '/calculators/pay-charts', name: '2026 Military Pay Charts', desc: 'Official DFAS pay tables for all ranks and years of service' },
    ],
  },
  {
    id: 'pcs',
    label: 'B',
    heading: 'Plan a PCS move or duty station decision',
    body: 'PCS moves create both one-time costs and long-term budget changes. Families often focus on the move itself and miss the housing, tax, and cost-of-living reset that follows.',
    tools: [
      { href: '/calculators/pcs', name: 'PCS Cost Estimator', desc: 'DLA, MALT mileage, per diem, TLE, and PPM net proceeds — 2026 DTMO rates' },
      { href: '/calculators/compare', name: 'Duty Station Comparison', desc: 'Side-by-side BAH, state taxes, COLA, and take-home between current and new station' },
      { href: '/bah', name: 'BAH Rates by Duty Station', desc: '200+ installation pages with local housing context' },
    ],
  },
  {
    id: 'transition',
    label: 'C',
    heading: 'Prepare for transition',
    body: 'Leaving the military isn\'t just changing jobs. BAH, BAS, TRICARE, SGLI, TSP contributions, and tax treatment can all change on day one. The financial gap is often larger than people expect.',
    tools: [
      { href: '/calculators/transition-readiness', name: 'Transition Readiness Calculator', desc: 'Military vs. civilian compensation after taxes — is the offer actually better?' },
      { href: '/calculators/separation-timeline', name: 'Separation Benefits Timeline', desc: 'Key dates and deadlines when SGLI, TRICARE, and move entitlements expire' },
      { href: '/calculators/healthcare-comparison', name: 'Healthcare Cost Comparison', desc: 'TRICARE vs. employer plan vs. ACA Marketplace — what it actually costs after separation' },
    ],
  },
  {
    id: 'va',
    label: 'D',
    heading: 'Understand VA benefits and home loans',
    body: 'VA benefits can be powerful, but the rules are easy to misunderstand. These tools explain the math and tradeoffs without selling a loan, capturing a lead, or steering anyone toward a provider.',
    tools: [
      { href: '/calculators/va-disability', name: 'VA Disability Calculator', desc: 'Combined rating using the VA whole-person formula — with bilateral factor and 2026 rates' },
      { href: '/calculators/va-loan', name: 'VA Loan Payment Calculator', desc: 'Monthly payment, funding fee, and BAH comparison — no lender recommendation' },
      { href: '/calculators/va-refinance', name: 'VA Refinance Calculator', desc: 'IRRRL break-even and net tangible benefit — educational only' },
      { href: '/guides/va-home-loans', name: 'VA Home Loans Guide', desc: 'Eligibility, funding fee, IRRRL, and when VA may not be the best option' },
    ],
  },
  {
    id: 'education-retirement',
    label: 'E',
    heading: 'Make education and retirement decisions',
    body: 'GI Bill, Tuition Assistance, VR&E, TSP, BRS, and High-3 decisions can be worth tens of thousands of dollars over a career. The official rules are scattered — these tools bring them together.',
    tools: [
      { href: '/calculators/education', name: 'Education Benefits Comparison', desc: 'GI Bill, VR&E, Tuition Assistance side-by-side — by school ZIP, eligibility tier, and tuition' },
      { href: '/calculators/tsp', name: 'TSP Growth Projector', desc: 'Retirement savings projections with fund allocation and BRS matching' },
      { href: '/calculators/retirement', name: 'Military Retirement Calculator', desc: 'High-3 and BRS pension projections with lifetime value and CRDP eligibility' },
    ],
  },
];

// ── All tools directory ────────────────────────────────────────────────────────

const ALL_TOOLS = [
  {
    group: 'Pay & Compensation',
    items: [
      { href: '/calculators/total-compensation', name: 'Total Military Compensation Calculator' },
      { href: '/calculators/bah', name: 'BAH Calculator' },
      { href: '/calculators/pay-charts', name: '2026 Military Pay Charts' },
      { href: '/calculators/dual-military-bah', name: 'Dual Military BAH Calculator' },
      { href: '/calculators/cola', name: 'CONUS COLA Calculator' },
      { href: '/calculators/guard-reserve', name: 'Guard & Reserve Pay Calculator' },
      { href: '/calculators/deployment', name: 'Deployment Pay Calculator' },
    ],
  },
  {
    group: 'PCS & Duty Stations',
    items: [
      { href: '/calculators/pcs', name: 'PCS Cost Estimator' },
      { href: '/calculators/compare', name: 'Duty Station Comparison' },
      { href: '/bah', name: 'BAH Rates by Installation (200+ stations)' },
    ],
  },
  {
    group: 'Retirement & TSP',
    items: [
      { href: '/calculators/retirement', name: 'Military Retirement Calculator' },
      { href: '/calculators/tsp', name: 'TSP Growth Projector' },
    ],
  },
  {
    group: 'Veterans Benefits & VA Loans',
    items: [
      { href: '/calculators/va-disability', name: 'VA Disability Rating Calculator' },
      { href: '/calculators/va-loan', name: 'VA Loan Payment Calculator' },
      { href: '/calculators/va-refinance', name: 'VA Refinance Calculator' },
    ],
  },
  {
    group: 'Education',
    items: [
      { href: '/calculators/education', name: 'Education Benefits Comparison' },
    ],
  },
  {
    group: 'Transition',
    items: [
      { href: '/calculators/transition-readiness', name: 'Transition Readiness Calculator' },
      { href: '/calculators/separation-timeline', name: 'Separation Benefits Timeline' },
      { href: '/calculators/healthcare-comparison', name: 'Healthcare Cost Comparison' },
    ],
  },
  {
    group: 'Guides',
    items: [
      { href: '/guides/military-pay', name: 'Military Pay Guide' },
      { href: '/guides/va-home-loans', name: 'VA Home Loans Guide' },
      { href: '/guides/va-disability', name: 'VA Disability Guide' },
      { href: '/guides/retirement-tsp', name: 'Retirement & TSP Guide' },
      { href: '/guides/education-benefits', name: 'Education Benefits Guide' },
      { href: '/guides/pcs', name: 'PCS & Duty Station Guide' },
      { href: '/transition', name: 'Military Transition Financial Roadmap' },
    ],
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <>
      <JsonLdScript schema={schema} />

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-16 sm:py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full bg-white/10 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
              Free · No Account · No Personal Info · Official DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Free Military Finance Tools You Can Share With Confidence
          </h1>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            MilPayTools helps service members, veterans, and military families understand pay, BAH,
            PCS costs, VA disability, education benefits, retirement, and transition decisions using
            official DoD and VA data — with no account required, no personal information collected, and no display advertising.
          </p>
        </div>
      </section>

      {/* ── 2. Who built this ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-14 sm:py-18 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-6" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-6">
            Who built this — and why
          </h2>
          <p className="text-base text-zinc-600 leading-relaxed mb-8">
            MilPayTools was built by <strong className="text-zinc-900">Dan Stevens</strong>, an
            NMLS-licensed mortgage professional and the son of a 20-year Air Force veteran who grew
            up on bases from Offutt to Eielson to Lajes Field. Military advisor{' '}
            <strong className="text-zinc-900">Col. Ryan Durand, USAF/USSF (Ret.)</strong> provides
            military-insider guidance and review.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed mb-10">
            The goal is simple: make confusing military financial decisions easier to understand
            before they become expensive mistakes. Every tool uses official published data from
            DFAS, VA, TSP, and DTMO. We don&apos;t sell loans, capture leads, or recommend
            products. We just build the clearest tools we can and make them free.
          </p>

          {/* Headshots */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Image
                src="/images/dan-stevens.jpg"
                alt="Dan Stevens"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover flex-none"
              />
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Dan Stevens</p>
                <p className="text-xs text-zinc-500">Founder · NMLS-Licensed Mortgage Professional</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src="/images/ryan-durand.jpeg"
                alt="Col. Ryan Durand"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover flex-none"
              />
              <div>
                <p className="font-semibold text-zinc-900 text-sm">Col. Ryan Durand, USAF/USSF (Ret.)</p>
                <p className="text-xs text-zinc-500">Military Advisor</p>
              </div>
            </div>
          </div>

          <Link
            href="/about"
            className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            Learn more about us →
          </Link>
        </div>
      </section>

      {/* ── 3. Trust block ──────────────────────────────────────────────────── */}
      <section className="bg-emerald-50 border-b border-emerald-100 py-14 sm:py-18 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-emerald-600 rounded-full mb-6" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-8">
            Why this is safe to share
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Free to use — every tool, every time',
              'No account or login required',
              'No personal information collected for calculator use',
              'No display advertising',
              'Our calculators don\'t recommend specific lenders or provide rate quotes',
              'No account or personal information required to use any calculator',
              'Built from official DoD, DFAS, VA, TSP, and DTMO published data',
              'Educational only — not tax, legal, financial, or lending advice',
              'Not affiliated with the Department of Defense or Department of Veterans Affairs',
              'If we ever partner with a financial service or recommend a resource, it will be clearly labeled and separate from our calculator tools.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white rounded-lg border border-emerald-100 px-4 py-3">
                <svg
                  className="w-4 h-4 text-emerald-600 flex-none mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-zinc-700 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Flagship tools by life stage ─────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-14 sm:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-6" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-3">
            Flagship tools by life stage
          </h2>
          <p className="text-base text-zinc-500 mb-12">
            The most-used tools, organized by when they matter most.
          </p>

          <div className="space-y-12">
            {FLAGSHIP_SECTIONS.map((s) => (
              <div key={s.id} id={s.id}>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{s.label}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900">{s.heading}</h3>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed mb-5 pl-6">{s.body}</p>
                <ul className="space-y-2 pl-6">
                  {s.tools.map((t) => (
                    <li key={t.href} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-2" aria-hidden="true" />
                      <div>
                        <Link
                          href={t.href}
                          className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
                        >
                          {t.name}
                        </Link>
                        <span className="text-sm text-zinc-500"> — {t.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. How to share ─────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-14 sm:py-18 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-6" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-8">
            Ways to share these tools
          </h2>
          <ul className="space-y-3 mb-8">
            {[
              'Share this page as a general military finance resource',
              'Share the Total Compensation Calculator with new service members and their families',
              'Share the PCS tools before PCS season or with families receiving orders',
              'Share the Transition Readiness Calculator with separating or retiring members',
              'Share the VA Disability Calculator with veterans navigating the claims process',
              'Share the VA Loan tools with eligible buyers comparing payment and funding fee impact',
              "Add MilPayTools to your unit, installation, or organization's financial resources list",
              'Include in TAP briefings, financial readiness sessions, or spouse group resources',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-2" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-white border border-zinc-200 px-5 py-4">
            <p className="text-sm text-zinc-600">
              <strong className="text-zinc-900">No permission needed.</strong>{' '}
              These tools are free for everyone.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
              >
                Open MilPayTools →
              </Link>
              <Link
                href="/calculators/total-compensation"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Total Compensation Calculator →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Full directory (collapsed) ───────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden py-2">
              <span className="text-sm font-semibold text-zinc-700 group-open:text-red-700 transition-colors">
                See all tools and guides
              </span>
              <svg
                className="w-4 h-4 text-zinc-400 flex-none transition-transform duration-200 group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </summary>

            <div className="pt-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {ALL_TOOLS.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    {group.group}
                  </p>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-zinc-700 hover:text-red-700 transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* ── 7. Bottom section ───────────────────────────────────────────────── */}
      <section className="bg-zinc-50 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs text-zinc-500 leading-relaxed mb-6 max-w-2xl">
            MilPayTools is an independent educational platform. We are not affiliated with the
            Department of Defense, Department of Veterans Affairs, or any government agency. All
            tools are educational only and do not constitute tax, legal, financial, or lending advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <Link
              href="/about"
              className="font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              Learn more about why we built this →
            </Link>
            <Link
              href="/feedback"
              className="font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Questions or suggestions? We&apos;d love to hear from you →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
