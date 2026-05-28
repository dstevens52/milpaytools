import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';

export const metadata: Metadata = {
  title: 'Free Military Financial Calculators & Guides | MilPayTools Resources',
  description:
    'Free military pay, BAH, TSP, VA loan, PCS, education, and transition calculators — all using official DoD and VA data. No accounts, no personal info, no ads.',
  alternates: { canonical: 'https://www.milpaytools.com/resources' },
  openGraph: {
    title: 'Free Military Financial Calculators & Guides | MilPayTools',
    description:
      'Free military pay, BAH, TSP, VA loan, PCS, education, and transition calculators — all using official DoD and VA data. No accounts, no personal info, no ads.',
    url: 'https://www.milpaytools.com/resources',
    type: 'website',
    siteName: 'MilPayTools',
    images: [{ url: '/api/og?type=home&title=MilPayTools+Resources&v=2', width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Military Financial Calculators & Guides | MilPayTools',
    description: 'Free military pay, BAH, TSP, VA loan, PCS, education, and transition calculators — official data, no accounts.',
    images: ['/api/og?type=home&title=MilPayTools+Resources&v=2'],
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Free Military Financial Calculators & Guides',
  description: 'Free military pay, BAH, TSP, VA loan, PCS, education, and transition calculators — all using official DoD and VA data.',
  url: 'https://www.milpaytools.com/resources',
  publisher: {
    '@type': 'Organization',
    name: 'MilPayTools',
    url: 'https://www.milpaytools.com',
  },
};

// ── Section data ──────────────────────────────────────────────────────────────

type ToolType = 'Calculator' | 'Guide' | 'Blog';

interface Tool {
  href: string;
  name: string;
  desc: string;
  type: ToolType;
}

interface Section {
  id: string;
  title: string;
  description: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  tools: Tool[];
}

const SECTIONS: Section[] = [
  {
    id: 'starting-service',
    title: 'Starting Service',
    description: 'Understanding your pay, benefits, and first financial decisions.',
    accentBg: 'bg-blue-600',
    accentText: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-700',
    tools: [
      { href: '/calculators/total-compensation', name: 'Total Military Compensation', desc: 'Full pay including BAH, BAS, tax advantages, and civilian equivalent', type: 'Calculator' },
      { href: '/calculators/pay-charts', name: '2026 Military Pay Charts', desc: 'Look up base pay by rank and years of service', type: 'Calculator' },
      { href: '/calculators/bah', name: 'BAH Calculator', desc: 'Find your housing allowance by location, rank, and dependency status', type: 'Calculator' },
      { href: '/blog/how-to-read-your-les', name: 'How to Read Your LES', desc: 'Every line on your military pay stub explained', type: 'Blog' },
      { href: '/blog/tsp-for-beginners-what-happens-if-you-do-nothing', name: 'TSP for Beginners', desc: 'What happens if you never log into TSP', type: 'Blog' },
      { href: '/guides/starting-service', name: 'Starting Service Guide', desc: 'Your financial foundation from day one', type: 'Guide' },
    ],
  },
  {
    id: 'pay-housing',
    title: 'Pay & Housing',
    description: 'Understanding what you earn and where it goes.',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    tools: [
      { href: '/calculators/bah', name: 'BAH Calculator', desc: 'Look up BAH rates for any ZIP code, any rank', type: 'Calculator' },
      { href: '/calculators/dual-military-bah', name: 'Dual Military BAH', desc: 'Calculate combined BAH for dual-military couples', type: 'Calculator' },
      { href: '/calculators/compare', name: 'Duty Station Comparison', desc: 'Compare pay, BAH, and take-home pay between stations', type: 'Calculator' },
      { href: '/calculators/cola', name: 'CONUS COLA Calculator', desc: 'Cost-of-living allowance lookup by ZIP code', type: 'Calculator' },
      { href: '/calculators/guard-reserve', name: 'Guard & Reserve Pay', desc: 'Estimate drill pay, annual training, and TRS savings', type: 'Calculator' },
      { href: '/bah', name: 'BAH by Duty Station', desc: '200+ duty station pages with local housing context', type: 'Guide' },
      { href: '/guides/military-pay', name: 'Military Pay Guide', desc: 'Complete guide to military compensation and allowances', type: 'Guide' },
    ],
  },
  {
    id: 'pcs-relocation',
    title: 'PCS & Relocation',
    description: 'Planning a move without financial surprises.',
    accentBg: 'bg-indigo-600',
    accentText: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 text-indigo-700',
    tools: [
      { href: '/calculators/pcs', name: 'PCS Cost Estimator', desc: 'Estimate DLA, mileage, per diem, TLE, and PPM profit', type: 'Calculator' },
      { href: '/calculators/compare', name: 'Duty Station Comparison', desc: 'Compare BAH, housing costs, and take-home pay at two stations', type: 'Calculator' },
      { href: '/bah', name: 'BAH by Duty Station', desc: 'Local housing context for 200+ installations', type: 'Guide' },
      { href: '/guides/pcs', name: 'PCS & Relocation Guide', desc: 'Financial planning for your next move', type: 'Guide' },
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment',
    description: 'Making the most of deployment pay and benefits.',
    accentBg: 'bg-amber-600',
    accentText: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-700',
    tools: [
      { href: '/calculators/deployment', name: 'Deployment Pay Calculator', desc: 'See how HFP, FSA, CZTE, and SDP change your take-home pay', type: 'Calculator' },
      { href: '/calculators/tsp', name: 'TSP Growth Projector', desc: 'Model Roth TSP growth including combat-zone contribution strategies', type: 'Calculator' },
      { href: '/blog/deployment-pay-explained', name: 'Deployment Pay Explained', desc: 'Every dollar you earn downrange, explained', type: 'Blog' },
    ],
  },
  {
    id: 'retirement-tsp',
    title: 'Retirement & TSP',
    description: 'Planning for 20 years and beyond.',
    accentBg: 'bg-purple-600',
    accentText: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700',
    tools: [
      { href: '/calculators/tsp', name: 'TSP Growth Projector', desc: 'Project your TSP balance at retirement with fund allocation modeling', type: 'Calculator' },
      { href: '/calculators/retirement', name: 'Military Retirement Calculator', desc: 'Estimate your pension under BRS or High-3', type: 'Calculator' },
      { href: '/blog/brs-vs-high-3-retirement', name: 'BRS vs High-3 Explained', desc: 'Which system wins — and for whom', type: 'Blog' },
      { href: '/guides/retirement-tsp', name: 'Retirement & TSP Guide', desc: 'BRS, High-3, TSP strategies, and retirement planning', type: 'Guide' },
    ],
  },
  {
    id: 'education',
    title: 'Education & Career',
    description: 'Maximizing GI Bill, Tuition Assistance, and education benefits.',
    accentBg: 'bg-teal-600',
    accentText: 'text-teal-700',
    badgeBg: 'bg-teal-50 text-teal-700',
    tools: [
      { href: '/calculators/education', name: 'Education Benefits Calculator', desc: 'Compare GI Bill, VR&E, and Tuition Assistance side by side', type: 'Calculator' },
      { href: '/blog/gi-bill-vs-tuition-assistance', name: 'GI Bill vs Tuition Assistance', desc: 'Which to use — and in what order', type: 'Blog' },
      { href: '/guides/education-benefits', name: 'Education Benefits Guide', desc: 'GI Bill, TA, VR&E, and military education benefits explained', type: 'Guide' },
    ],
  },
  {
    id: 'va-loans',
    title: 'Buying a Home (VA Loans)',
    description: 'Understanding the VA loan benefit before talking to a lender.',
    accentBg: 'bg-red-600',
    accentText: 'text-red-700',
    badgeBg: 'bg-red-50 text-red-700',
    tools: [
      { href: '/calculators/va-loan', name: 'VA Loan Payment Calculator', desc: 'Estimate your payment, funding fee, and BAH comparison', type: 'Calculator' },
      { href: '/calculators/va-refinance', name: 'VA Refinance Calculator', desc: 'IRRRL savings, break-even, and VA net tangible benefit checks', type: 'Calculator' },
      { href: '/calculators/va-disability', name: 'VA Disability Calculator', desc: 'A 10%+ rating waives the VA funding fee entirely', type: 'Calculator' },
      { href: '/blog/va-loan-funding-fee-explained', name: 'VA Funding Fee Explained', desc: 'Every 2026 rate, exemption, and dollar amount', type: 'Blog' },
      { href: '/guides/va-home-loans', name: 'VA Home Loans Guide', desc: 'Eligibility, funding fee, IRRRL, and when VA may not be best', type: 'Guide' },
    ],
  },
  {
    id: 'veterans-benefits',
    title: 'Veterans Benefits',
    description: 'Benefits that continue and grow after service.',
    accentBg: 'bg-sky-600',
    accentText: 'text-sky-700',
    badgeBg: 'bg-sky-50 text-sky-700',
    tools: [
      { href: '/calculators/va-disability', name: 'VA Disability Calculator', desc: 'Calculate combined ratings with bilateral factor and 2026 rates', type: 'Calculator' },
      { href: '/calculators/healthcare-comparison', name: 'Healthcare Cost Comparison', desc: 'Compare TRICARE, employer plans, and Marketplace costs', type: 'Calculator' },
      { href: '/blog/file-va-disability-before-separation', name: 'File VA Disability Before You Separate', desc: 'Why filing on active duty produces better outcomes', type: 'Blog' },
      { href: '/guides/va-disability', name: 'VA Disability Guide', desc: 'Combined rating formula, bilateral factor, and 2026 compensation rates', type: 'Guide' },
    ],
  },
  {
    id: 'transition',
    title: 'Leaving the Military',
    description: 'Making the transition with financial confidence.',
    accentBg: 'bg-orange-600',
    accentText: 'text-orange-700',
    badgeBg: 'bg-orange-50 text-orange-700',
    tools: [
      { href: '/calculators/transition-readiness', name: 'Transition Readiness Calculator', desc: 'Compare military vs civilian compensation after taxes and benefits', type: 'Calculator' },
      { href: '/calculators/separation-timeline', name: 'Separation Benefits Timeline', desc: 'Key dates and deadlines for separating service members', type: 'Calculator' },
      { href: '/calculators/total-compensation', name: 'Total Compensation Calculator', desc: 'Know your military comp baseline before salary negotiation', type: 'Calculator' },
      { href: '/blog/are-you-financially-ready-to-leave-the-military', name: 'Are You Financially Ready to Leave?', desc: 'The three-factor readiness test', type: 'Blog' },
      { href: '/transition', name: 'Military Transition Roadmap', desc: 'Full financial arc of military separation', type: 'Guide' },
    ],
  },
];

const TYPE_STYLES: Record<ToolType, string> = {
  Calculator: 'bg-zinc-100 text-zinc-600',
  Guide: 'bg-zinc-100 text-zinc-600',
  Blog: 'bg-zinc-100 text-zinc-600',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <>
      <JsonLdScript schema={schema} />

      {/* ── Hero ── */}
      <section className="bg-slate-900 py-14 sm:py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full bg-white/10 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
              Free · No Account · No Personal Info · Official 2026 DoD &amp; VA Data
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Free Military Financial Tools
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-3">
            Every calculator and guide uses official DoD and VA data. No accounts. No personal information. No ads.
          </p>
          <p className="text-sm text-white/50">
            Built by an NMLS-licensed mortgage professional and military family. Share freely with service members, veterans, and military families.
          </p>
        </div>
      </section>

      {/* ── Jump nav ── */}
      <section className="bg-white border-b border-zinc-200 py-4 px-4 sticky top-[64px] z-40">
        <div className="mx-auto max-w-6xl overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1.5 min-w-max">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors whitespace-nowrap"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sections ── */}
      <div className="bg-zinc-50 py-10 px-4">
        <div className="mx-auto max-w-6xl space-y-14">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-32">
              {/* Section header */}
              <div className="mb-6">
                <div className={`w-8 h-0.5 rounded-full ${section.accentBg} mb-3`} aria-hidden="true" />
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                  {section.title}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
              </div>

              {/* Tool cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200 px-4 py-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-zinc-900 group-hover:text-red-700 transition-colors leading-snug">
                        {tool.name}
                      </span>
                      <span className={`flex-none text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${TYPE_STYLES[tool.type]}`}>
                        {tool.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed flex-1">{tool.desc}</p>
                    <span className="text-xs font-bold text-red-700 group-hover:text-red-800 transition-colors">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── About + Sharing ── */}
      <section className="bg-white border-t border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">

            {/* About */}
            <div>
              <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
              <h2 className="text-lg font-black text-zinc-900 tracking-tight mb-3">About MilPayTools</h2>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                MilPayTools is a free military financial education platform built by Dan Stevens,
                an NMLS-licensed mortgage professional and son of a 20-year Air Force veteran,
                in partnership with Col. Ryan Durand, USAF/USSF (Ret.). Every tool uses official
                DoD and VA data.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                We are not a lender, financial advisor, or government agency — just clear tools
                and honest education for military families.
              </p>
              <Link
                href="/about"
                className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
              >
                Learn more about why we built this →
              </Link>
            </div>

            {/* Sharing note */}
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-5 py-5">
              <h2 className="text-base font-bold text-zinc-900 mb-2">Share freely</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                These tools are free for everyone. If you work with service members, veterans,
                or military families and find these useful, you&apos;re welcome to share this
                page or any individual tool. No permission needed.
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                  Share this page
                </p>
                <code className="text-xs font-mono text-zinc-700 bg-white border border-zinc-200 rounded px-3 py-1.5 block select-all">
                  milpaytools.com/resources
                </code>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
