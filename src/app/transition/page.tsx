import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema } from '@/lib/schema';

const PAGE_TITLE = 'Military Transition Financial Guide 2026';
const META_TITLE = `${PAGE_TITLE} | MilPayTools`;
const META_DESC =
  'Know what your income, healthcare, and benefits look like after the uniform. Separation changes BAH, TRICARE, taxes, and TSP on day one. Free tools using official 2026 DoD and VA data.';
const OG_IMAGE = `/api/og?type=guide&title=${encodeURIComponent('Military Transition Financial Guide 2026')}&v=2`;

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESC,
  alternates: { canonical: 'https://www.milpaytools.com/transition' },
  openGraph: {
    title: META_TITLE,
    description: META_DESC,
    type: 'article',
    url: '/transition',
    siteName: 'MilPayTools',
    images: [{ url: OG_IMAGE, width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESC,
    images: [OG_IMAGE],
  },
};

const RELATED_GUIDES = [
  { href: '/guides/military-pay', title: 'Military Pay & Compensation Guide' },
  { href: '/guides/va-disability', title: 'VA Disability Benefits Guide' },
  { href: '/guides/retirement-tsp', title: 'Military Retirement & TSP Guide' },
  { href: '/guides/pcs', title: 'PCS & Duty Station Financial Guide' },
  { href: '/guides/education-benefits', title: 'Military Education Benefits Guide' },
];

// ─── Comparison table data ─────────────────────────────────────────────────

const COMPARISON_ROWS: { active: string; after: string }[] = [
  {
    active: 'Base pay (taxable)',
    after: 'Civilian salary — or GI Bill MHA if using education benefits post-separation',
  },
  {
    active: 'BAH and BAS (tax-free)',
    after: 'Housing and food allowances end at separation — must be covered by civilian income',
  },
  {
    active: 'TRICARE Prime — $0 premiums for member and family',
    after: 'Employer plan, VA healthcare (if eligible), marketplace plan, CHCBP, or TAMP (180 days if eligible)',
  },
  {
    active: 'SGLI — $500K coverage for ~$26/month',
    after: 'SGLI ends 120 days after separation. VGLI can be requested up to 1 year and 120 days after separation, with no health questions required during the first 240 days.',
  },
  {
    active: 'TSP with automatic payroll contributions',
    after: 'Leave TSP in place, roll to a civilian IRA, or start employer 401(k) — TSP stays invested either way',
  },
  {
    active: 'Tax-free BAH/BAS, combat zone exclusion, housing allowance exclusion',
    after: 'Standard civilian tax rules — your effective tax rate often increases at separation',
  },
  {
    active: 'PCS entitlements for duty-station moves',
    after: 'Most separating members have 180 days to complete their final move; most retirees have 3 years. Check your orders and branch transportation office for your specific deadline.',
  },
  {
    active: 'Commissary and exchange access, recreational facilities',
    after: 'Limited or no access depending on veteran status and disability rating',
  },
];

// ─── Transition path cards ─────────────────────────────────────────────────

const PATH_CARDS: { title: string; description: string; href: string; icon: string }[] = [
  {
    title: 'Going to Civilian Employment',
    description: 'Compare your military compensation to what you\'ll need on the civilian side. Get a readiness verdict with action steps.',
    href: '/calculators/transition-readiness',
    icon: '💼',
  },
  {
    title: 'Using GI Bill / Education Benefits',
    description: 'Compare Post-9/11 GI Bill, VR&E Chapter 31, and Tuition Assistance. Calculate MHA by duty station ZIP.',
    href: '/calculators/education',
    icon: '🎓',
  },
  {
    title: 'Pursuing SkillBridge',
    description: 'Plan your SkillBridge timeline alongside separation benefits and deadlines. Understand how SkillBridge affects pay and benefits.',
    href: '/guides/education-benefits',
    icon: '🔗',
  },
  {
    title: 'Retiring from the Military (20+ Years)',
    description: 'Project your pension, TSP balance, and total retirement income. Compare High-3 vs. BRS side by side.',
    href: '/calculators/retirement',
    icon: '🏅',
  },
  {
    title: 'Guard / Reserve Transition',
    description: 'Calculate drill pay, TRICARE Reserve Select premiums, and the financial picture of part-time military service.',
    href: '/calculators/guard-reserve',
    icon: '⚡',
  },
];

// ─── Three financial shocks (Zone 2) ──────────────────────────────────────

const THREE_SHOCKS = [
  {
    accent: 'bg-blue-800',
    label: 'Shock 1',
    title: 'Healthcare costs appear',
    description:
      'TRICARE costs you $0 in premiums. Civilian health insurance for a family runs $400–$600/month — or $8,000–$12,000/year after TAMP coverage ends.',
    bullets: [
      'TRICARE → $0/month in premiums',
      'Employer plan → $400–$600/month for family coverage',
      'Marketplace plan → potentially more without subsidy',
    ],
    cta: 'See TRICARE cost comparison →',
    href: '/blog/tricare-costs-2026-vs-civilian',
  },
  {
    accent: 'bg-emerald-600',
    label: 'Shock 2',
    title: 'Tax-free income disappears',
    description:
      "BAH and BAS are tax-free. Your civilian salary is fully taxable. An E-6 receiving $3,000/month in BAH would need ~$3,850/month in civilian gross pay to match — that's $10,200/year in hidden income loss.",
    bullets: [
      'BAH + BAS: tax-free on active duty',
      'Civilian salary: fully taxed',
      'The gap is real and often overlooked',
    ],
    cta: 'Calculate the civilian equivalent →',
    href: '/calculators/total-compensation',
  },
  {
    accent: 'bg-amber-600',
    label: 'Shock 3',
    title: 'Benefit deadlines are unforgiving',
    description:
      "SGLI ends 120 days after separation. TAMP healthcare is 180 days — if you qualify. GI Bill transfer has its own timeline. Miss a window and you can't go back.",
    bullets: [
      'SGLI → 120-day conversion window',
      'TAMP → 180 days (not automatic)',
      'BDD claim → file 180–90 days before separation',
    ],
    cta: 'See the full timeline below ↓',
    href: '#timeline',
  },
];

// ─── Phase data ────────────────────────────────────────────────────────────

const PHASE0_STEPS = [
  "Schedule TAP initial counseling and pre-separation briefing at your installation's Military & Family Readiness Center.",
  'Begin your Individual Transition Plan (ITP) — this becomes your living document through separation.',
  'Pull your VMET (DD Form 2586) to translate military experience into civilian language.',
  'Decide your post-transition path: employment, education, SkillBridge, entrepreneurship, or retirement.',
  'If considering SkillBridge, begin researching programs and confirm command approval timeline.',
];

const AFTER_SEP_ITEMS: {
  text: string;
  detail: string;
  href: string | null;
  external: boolean;
}[] = [
  {
    text: 'Check your VA claim status',
    detail:
      "VA's goal is to issue BDD decisions within 30 days after separation, but timing depends on records, exams, claim complexity, and VA workload. Log into VA.gov to track your claim status.",
    href: 'https://www.va.gov',
    external: true,
  },
  {
    text: 'Verify your first civilian paycheck',
    detail:
      'Compare your actual take-home against your pre-transition budget. Did the numbers hold up? If not, identify the gap before it becomes a pattern.',
    href: null,
    external: false,
  },
  {
    text: 'Confirm TRICARE and healthcare coverage',
    detail:
      "TRICARE typically ends at 11:59 p.m. on your last active-duty day. Some separating members qualify for 180 days of transitional coverage (TAMP), but eligibility is not automatic. Confirm your TAMP eligibility before you sign out. If you don't qualify, research alternatives: employer coverage, VA healthcare (if eligible), marketplace plans, or the Continued Health Care Benefit Program (CHCBP).",
    href: null,
    external: false,
  },
  {
    text: 'Build a cash-flow plan for the transition gap',
    detail:
      'Plan for the gap between your final military pay, first civilian paycheck, VA claim decision, final travel claim reimbursement, and moving expenses. Know exactly how many weeks your savings need to cover.',
    href: null,
    external: false,
  },
  {
    text: 'Review your state residency and domicile situation before your first post-service tax filing.',
    detail:
      "Your state tax situation may have changed. Some states don't tax military retirement pay or VA disability income; others do. Verify your new state's treatment before your first tax filing.",
    href: null,
    external: false,
  },
  {
    text: 'Revisit your total compensation baseline',
    detail:
      'Run the Total Compensation Calculator with your new civilian salary to see exactly how your compensation changed. Quantifying the delta helps you evaluate pay, benefits, expenses, and future job offers with clearer numbers.',
    href: '/calculators/total-compensation',
    external: false,
  },
];

// ─── Helper components ─────────────────────────────────────────────────────

function ResourceCard({
  href,
  title,
  description,
  external = false,
}: {
  href: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
    >
      <h3 className="font-semibold text-zinc-900 group-hover:text-red-700 transition-colors mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 leading-relaxed flex-1">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-700">
        {external ? 'Visit site' : 'Open'} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="font-semibold text-zinc-900 mb-2 leading-snug">{title}</h3>
      <p className="text-sm text-zinc-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-zinc-500 leading-snug">{title}</h3>
        <span className="flex-none text-xs font-medium bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded-full whitespace-nowrap">
          Coming soon
        </span>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Shared accordion summary header ──────────────────────────────────────

function PhaseAccordionSummary({
  number,
  timeframe,
  title,
}: {
  number: number;
  timeframe: string;
  title: string;
}) {
  return (
    <summary className="flex items-center justify-between py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="w-8 h-8 rounded-full bg-red-700 text-white text-sm font-bold flex items-center justify-center flex-none">
          {number}
        </span>
        <span className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 rounded-full px-3 py-1">
          {timeframe}
        </span>
        <span className="text-xl font-bold text-zinc-900 group-open:text-red-700 transition-colors">
          {title}
        </span>
      </div>
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
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TransitionPage() {
  return (
    <>
      <JsonLdScript
        schema={articleSchema({
          title: PAGE_TITLE,
          description: META_DESC,
          datePublished: '2026-05-03',
          url: '/transition',
        })}
      />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li>
                <Link href="/" className="hover:text-zinc-700 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-zinc-800 font-medium">Transition Guide</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── ZONE 1: Hero ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Transition Financial Guide · Official 2026 DoD &amp; VA Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Know what your{' '}
            <span className="text-red-700">income, healthcare, and benefits</span>{' '}
            look like after you take off the uniform.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-4">
            Separation changes more than your paycheck. BAH, BAS, TRICARE, tax advantages, and TSP
            contributions all shift on day one.{' '}
            <strong className="text-zinc-900">Use free tools to see exactly where you stand</strong>{' '}
            — before you sign out.
          </p>

          <p className="text-sm font-medium text-zinc-500 mb-7">
            Leave TAP with your numbers, deadlines, and next steps written down.
          </p>

          {/* Urgency stat */}
          <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 mb-8 flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-red-500 flex-none" aria-hidden="true" />
            <p className="text-base font-semibold text-red-800 leading-snug">
              Many separating service members face a significant effective income drop in year one —
              not because civilian pay is low, but because{' '}
              <span className="text-red-700">
                replacing tax-free housing, healthcare, and food allowances costs more than expected.
              </span>
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-5">
            <Link
              href="/calculators/transition-readiness"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Check My Transition Readiness →
            </Link>
            <Link
              href="#comparison"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              See What Changes After Separation ↓
            </Link>
            <Link
              href="/transition/worksheet"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              Open Printable TAP Student Worksheet →
            </Link>
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 flex-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            No account. No personal info. Uses official 2026 DoD and VA data.
          </p>
        </div>
      </section>

      {/* ── ZONE 2: Three financial shocks ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4" aria-hidden="true">
              <div className="w-8 h-0.5 bg-red-700 rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 tracking-tight">
              Three financial shocks most service members don&apos;t see coming.
            </h2>
            <p className="text-base text-zinc-500 max-w-xl mx-auto">
              Base pay has a civilian equivalent. These don&apos;t.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {THREE_SHOCKS.map(({ accent, label, title, description, bullets, cta, href }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden"
              >
                <div className={`${accent} px-5 py-3`}>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                    {label}
                  </span>
                  <p className="text-lg font-bold text-white leading-snug mt-0.5">{title}</p>
                </div>
                <div className="px-5 py-4 flex flex-col flex-1">
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">{description}</p>
                  <ul className="space-y-2 flex-1 mb-5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 flex-none text-zinc-400 mt-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-zinc-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors"
                  >
                    {cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* ── What Changes After Separation ── */}
        <section id="comparison" className="py-10 sm:py-12 border-b border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">What Changes After Separation</h2>
          <p className="text-base text-zinc-600 leading-relaxed mb-7 max-w-2xl">
            Most service members underestimate how much of their compensation is invisible — BAH, BAS,
            TRICARE, and tax advantages that never show up on their LES. Here&apos;s what changes on day one.
          </p>

          {/* Mobile: stacked cards */}
          <div className="sm:hidden space-y-3">
            {COMPARISON_ROWS.map(({ active, after }, i) => (
              <div key={i} className="rounded-lg border border-zinc-200 overflow-hidden">
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Active Duty</p>
                  <p className="text-sm text-zinc-800">{active}</p>
                </div>
                <div className="px-4 py-3 bg-white">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">After Separation</p>
                  <p className="text-sm text-zinc-600">{after}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block rounded-lg border border-zinc-200 overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="px-5 py-3 bg-zinc-800 text-white text-sm font-semibold">Active Duty</div>
              <div className="px-5 py-3 bg-zinc-700 text-white text-sm font-semibold border-l border-zinc-600">After Separation</div>
            </div>
            {COMPARISON_ROWS.map(({ active, after }, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 border-t border-zinc-200 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
              >
                <div className="px-5 py-3.5 text-sm text-zinc-800">{active}</div>
                <div className="px-5 py-3.5 text-sm text-zinc-600 border-l border-zinc-200">{after}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Choose Your Transition Path ── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Choose Your Transition Path</h2>
          <p className="text-base text-zinc-600 leading-relaxed mb-7 max-w-2xl">
            Select the path that best describes your post-military plan. Each links to the calculator or
            guide most relevant to your situation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATH_CARDS.map(({ title, description, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xl" aria-hidden>{icon}</span>
                  <h3 className="font-semibold text-zinc-900 group-hover:text-red-700 transition-colors leading-snug text-sm">
                    {title}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed flex-1">{description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Timeline (accordion phases) ── */}
        <div id="timeline" className="border-b border-zinc-200">
          <div className="pt-10 pb-2">
            <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-zinc-900 mb-1">Your transition timeline</h2>
            <p className="text-base text-zinc-500 max-w-2xl">
              Expand each phase to see the financial actions, calculators, and deadlines that apply at
              that stage. Phase 0 is the right starting point.
            </p>
          </div>

          {/* Phase 0: 12+ months out — open by default */}
          <details open className="group border-t border-zinc-200 mt-6">
            <PhaseAccordionSummary number={0} timeframe="12+ months out" title="Start the process" />
            <div className="pb-10 sm:pb-12">
              <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-2xl">
                Transitioning service members must begin TAP no later than 365 days before
                transition. Retirees are encouraged to begin 18–24 months out where available.
                This phase is about getting into the system and building your baseline.
              </p>
              <div className="space-y-3">
                {PHASE0_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4"
                  >
                    <span className="flex-none mt-0.5 w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-zinc-300" />
                    </span>
                    <p className="text-sm text-zinc-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </details>

          {/* Phase 1: 6–12 months out */}
          <details className="group border-t border-zinc-200">
            <PhaseAccordionSummary number={1} timeframe="6–12 months out" title="Know your numbers" />
            <div className="pb-10 sm:pb-12">
              <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-2xl">
                Before you can plan your transition, you need to understand exactly what you&apos;re
                leaving behind — and what it takes to replace it. This phase is about getting
                honest with the math.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResourceCard
                  href="/calculators/total-compensation"
                  title="Total Compensation Calculator"
                  description="Start here. Many service members underestimate the true value of their pay and benefits by tens of thousands per year because they only compare civilian salary to base pay. See the full picture — BAH, BAS, TSP matching, and tax advantages — before you evaluate any civilian offer."
                />
                <ResourceCard
                  href="/blog/what-civilian-salary-do-i-need"
                  title="What Civilian Salary Do I Need?"
                  description="The article that shows why a $60K civilian offer might not replace your E-6 pay. Walks through the side-by-side comparison of taxable vs. tax-free compensation and benefits."
                />
                <ResourceCard
                  href="/calculators/va-disability"
                  title="VA Disability Rating Calculator"
                  description="If you have any service-connected conditions, your VA disability rating directly affects your post-separation income. Know your estimated rating now — so your post-separation income plan is more complete before evaluating civilian offers."
                />
                <ResourceCard
                  href="/blog/file-va-disability-before-separation"
                  title="File for VA Disability Before You Separate"
                  description="The BDD (Benefits Delivery at Discharge) window is 180–90 days before your separation date. File within this window so VA can review records and schedule exams before separation. VA's goal is to deliver a decision within 30 days after separation, but timing varies by claim complexity and exam completion."
                />
                <ResourceCard
                  href="/calculators/tsp"
                  title="TSP Growth Projector"
                  description="Review your TSP balance and contribution strategy. Your last months on active duty may be your best opportunity to review contribution levels, Roth vs. Traditional choices, and how your civilian tax bracket could change."
                />
                <ResourceCard
                  href="/calculators/transition-readiness"
                  title="Transition Readiness Calculator"
                  description="One tool that brings it all together. Enter your rank, duty station, expected VA rating, target civilian salary, and expenses — get a clear readiness verdict with action steps."
                />
              </div>
            </div>
          </details>

          {/* Phase 2: 3–6 months out */}
          <details className="group border-t border-zinc-200">
            <PhaseAccordionSummary number={2} timeframe="3–6 months out" title="Lock in your benefits" />
            <div className="pb-10 sm:pb-12">
              <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-2xl">
                You&apos;ve done the math. Now it&apos;s time to take action on the benefits that have
                deadlines. Miss these windows and your options get narrower, more expensive, or harder to fix.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResourceCard
                  href="/blog/sgli-vgli-private-life-insurance"
                  title="SGLI vs. VGLI vs. Private Life Insurance"
                  description="Your SGLI coverage ends 120 days after separation. If you need life insurance after separation, compare private term, VGLI, and conversion options before SGLI ends. Health changes after service can affect private coverage pricing or eligibility."
                />
                <ResourceCard
                  href="/blog/tricare-costs-2026-vs-civilian"
                  title="TRICARE Costs in 2026"
                  description="Understand exactly what healthcare will cost as a civilian. This is often the most underestimated transition expense — the gap between TRICARE and a civilian employer plan can exceed $10,000 per year for a family."
                />
                <ResourceCard
                  href="/blog/post-911-gi-bill-explained-2026"
                  title="Post-9/11 GI Bill Explained"
                  description="Verify your GI Bill eligibility, transfer status, and remaining months before you separate. If you're planning to use it for school, research MHA rates by ZIP code — the monthly housing allowance varies significantly by location."
                />
                <ResourceCard
                  href="/blog/gi-bill-vs-tuition-assistance"
                  title="GI Bill vs. Tuition Assistance"
                  description="If Tuition Assistance is available and fits your degree plan, compare using TA while on active duty versus saving GI Bill months for after separation, when MHA may apply. GI Bill months used on active duty generally do not produce MHA."
                />
                <ResourceCard
                  href="/blog/pcs-financial-planning-guide"
                  title="PCS Financial Planning"
                  description="If your separation involves a final PCS, know your entitlements. The difference between a well-planned and poorly-planned final move can be $10,000 or more — DLA, MALT, and PPM all matter here."
                />
                <InfoCard
                  title="Schedule your SHPE/SHA and final dental exam"
                  description="Schedule your Separation History and Physical Examination (SHPE/SHA) and final dental exam — typically between 90 and 180 days before separation. This supports your medical record and VA disability claim. If filing a BDD claim, complete the Separation Health Assessment - Part A Self-Assessment and be available for VA exams."
                />
              </div>
            </div>
          </details>

          {/* Phase 3: 90 days out */}
          <details className="group border-t border-zinc-200">
            <PhaseAccordionSummary number={3} timeframe="90 days out" title="Execute your plan" />
            <div className="pb-10 sm:pb-12">
              <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-2xl">
                The final stretch. This is about verification, not new decisions. Confirm
                everything is in place before you sign out.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResourceCard
                  href="/blog/how-to-read-military-les-2026"
                  title="How to Read Your Military LES"
                  description="Pull your final LES and verify everything: correct dependency status, TSP contributions hitting the right amount, state tax withholding for your future state of residence. Errors here are easier to fix while you're still in."
                />
                <ResourceCard
                  href="/calculators/retirement"
                  title="Military Retirement Calculator"
                  description="If you're retiring, verify your pension calculation before your separation date. Confirm your High-3 average matches what DFAS will use — even a one-month error in your High-3 period can cost thousands annually."
                />
                <ResourceCard
                  href="/blog/roth-tsp-advantage-junior-enlisted"
                  title="Roth TSP Advantage"
                  description="Review whether Roth or Traditional TSP contributions make sense during your final active-duty months, especially if your civilian tax bracket may change."
                />
                <InfoCard
                  title="Request and review your draft DD-214"
                  description="Request and review your draft DD-214 before final out. Verify service dates, characterization, deployment history, awards, MOS/AFSC, and separation codes. Fixing errors is much harder after you've separated."
                />
                <InfoCard
                  title="Download records before you lose system access"
                  description="Download and save: service treatment records, LES history and tax documents, VMET / JST / CCAF / training transcripts, orders, evals, awards, deployment records, and clearance documentation."
                />
                <InfoCard
                  title="Map your final timeline"
                  description="Map terminal leave, permissive TDY, final out date, and first civilian start date on the same calendar. Check your separation or retirement orders for your final move deadline and request extensions early if needed. Many members have a limited post-separation window to use final-move entitlements."
                />
                <ResourceCard
                  href="/transition/worksheet"
                  title="TAP Student Worksheet"
                  description="Use the printable TAP worksheet to organize your numbers before your final TAP session. Captures pay, expenses, healthcare costs, VA estimates, and benefit deadlines in one place."
                />
              </div>
            </div>
          </details>

          {/* Phase 4: After separation */}
          <details className="group border-t border-zinc-200">
            <PhaseAccordionSummary number={4} timeframe="After separation" title="Your first 90 days as a civilian" />
            <div className="pb-10 sm:pb-12">
              <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-2xl">
                You&apos;re out. The paycheck looks different, the healthcare works different, and the
                tax situation changed. Here&apos;s what to check and when.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AFTER_SEP_ITEMS.map(({ text, detail, href, external }) => (
                  <div key={text} className="rounded-lg border border-zinc-200 bg-white p-5">
                    <div className="flex gap-3">
                      <span className="flex-none mt-0.5 w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-zinc-300" />
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm mb-1.5">{text}</p>
                        <p className="text-sm text-zinc-600 leading-relaxed">{detail}</p>
                        {href && (
                          <Link
                            href={href}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
                          >
                            {external ? 'Visit VA.gov' : 'Open calculator'}{' '}
                            <span aria-hidden>→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>

        {/* ── Classroom & Privacy Note ── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-5 flex gap-4">
            <div className="flex-none mt-0.5">
              <svg
                className="w-5 h-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-blue-900 mb-1.5">Classroom &amp; Privacy Note</h2>
              <p className="text-sm text-blue-800 leading-relaxed">
                MilPayTools does not require an account and does not collect personal information to run
                any calculator. No login, no email, no data stored. Students and service members can use
                approximate numbers if they prefer not to enter exact income, savings, or VA estimates
                during a classroom session.
              </p>
              <Link
                href="/transition/worksheet"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Open Printable TAP Student Worksheet →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Coming Next ── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 mb-1">Coming Next</h2>
          <p className="text-sm text-zinc-500 mb-6">More transition tools are in development.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComingSoonCard
              title="Separation Benefits Timeline"
              description="See exactly when each benefit stops, converts, or changes after your separation date. SGLI, TRICARE, BAH, BAS — all on one visual timeline."
            />
            <ComingSoonCard
              title="TSP Separation Decision Tool"
              description="Leave your TSP in place, roll to a civilian IRA, or Roth convert? See the tax implications of each option based on your balance and expected civilian income."
            />
          </div>
        </section>

        {/* ── Related guides ── */}
        <section className="py-10 sm:py-12">
          <h2 className="text-xl font-bold text-zinc-900 mb-1">Related Guides</h2>
          <p className="text-sm text-zinc-500 mb-6">
            In-depth coverage of every major topic in military finance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELATED_GUIDES.map(({ href, title }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:shadow-sm hover:border-zinc-300 transition-all duration-150"
              >
                <span className="text-sm font-medium text-zinc-800 group-hover:text-red-700 transition-colors leading-snug">
                  {title}
                </span>
                <span
                  className="flex-none text-zinc-400 group-hover:text-red-700 transition-colors"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-xs text-zinc-400 border-t border-zinc-100 pt-6">
            This guide is continuously updated. All data reflects official 2026 DoD, DFAS, and
            VA rates.
          </p>
        </section>

      </div>
    </>
  );
}
