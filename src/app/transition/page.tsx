import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema } from '@/lib/schema';

const PAGE_TITLE = 'Military Transition Financial Guide 2026';
const META_TITLE = `${PAGE_TITLE}`;
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

const TRANSITION_RISK_CARDS = [
  {
    id: 'income',
    category: 'Income & Taxes',
    headline: 'Income and taxes change fast',
    body: 'Your civilian salary may need to replace more than base pay. BAH, BAS, tax advantages, and TSP contributions can all change after separation.',
    cta: { label: 'Calculate civilian equivalent pay', href: '/calculators/total-compensation' },
    image: '/images/wallet.png',
    imageAlt: 'Wallet illustration',
    theme: {
      band: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
      borderColor: '#bbf7d0',
      category: '#15803d',
      ctaBg: '#15803d',
    },
  },
  {
    id: 'healthcare',
    category: 'Healthcare',
    headline: 'Healthcare becomes a real bill',
    body: 'Compare employer coverage, VA healthcare, marketplace plans, TAMP, and CHCBP before your final out.',
    cta: { label: 'Compare healthcare costs', href: '/calculators/healthcare-comparison' },
    image: '/images/healthcare.png',
    imageAlt: 'Healthcare illustration',
    theme: {
      band: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
      borderColor: '#bfdbfe',
      category: '#1d4ed8',
      ctaBg: '#1d4ed8',
    },
  },
  {
    id: 'deadlines',
    category: 'Deadlines',
    headline: 'Some windows are easy to miss',
    body: 'BDD claims, SGLI/VGLI, TAMP, final move benefits, records, and DD-214 corrections all have timing rules.',
    cta: { label: 'View transition timeline', href: '#timeline' },
    image: '/images/clock.png',
    imageAlt: 'Clock illustration',
    theme: {
      band: 'linear-gradient(135deg,#fff7ed 0%,#fed7aa 100%)',
      borderColor: '#fdba74',
      category: '#c2410c',
      ctaBg: '#c2410c',
    },
  },
] as const;

const COMPARISON_ROWS: { active: string; after: string }[] = [
  {
    active: 'Base pay (taxable)',
    after: 'Civilian salary — or GI Bill MHA if using education benefits post-separation',
  },
  {
    active: 'BAH and BAS (excluded from federal taxable income)',
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
    after: 'Access rules vary by retiree status, disability rating, caregiver status, and current DoD/VA policy',
  },
];

const PATH_CARDS: {
  title: string;
  description: string;
  href: string;
  icon: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}[] = [
  {
    title: 'Going to Civilian Employment',
    description: "Compare your military compensation to what you'll need on the civilian side. Get a readiness verdict with action steps.",
    href: '/calculators/transition-readiness',
    icon: '💼',
    secondaryHref: '/calculators/healthcare-comparison',
    secondaryLabel: 'Compare healthcare costs →',
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
    href: '/blog/skillbridge-program-guide',
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
    href: '/blog/tamp-healthcare-after-military-separation',
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

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        {/* Soldier image — full-width background, desktop only */}
        <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/transition-soldier.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'right center' }}
          />
          {/* Cream overlay: solid on left (text area), fades to transparent on right (soldier) */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(242,232,212,1) 0%, rgba(242,232,212,1) 30%, rgba(242,232,212,0.85) 45%, rgba(242,232,212,0) 62%)' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl pt-6 pb-5 sm:pt-9 sm:pb-6 px-4">

          {/* Left column — constrained so image stays visible on desktop */}
          <div className="sm:max-w-[58%] mb-5">

            {/* Trust pill */}
            <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
                Free Calculators &bull; No Account &bull; No Personal Info &bull; Official 2026 DoD &amp; VA Data
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[32px] sm:text-[42px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
              Know what your{' '}
              <span className="text-red-700">income, healthcare, and benefits</span>{' '}
              look like after you take off the uniform.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-4">
              Separation changes more than your paycheck. BAH, BAS, TRICARE, tax advantages, and TSP
              contributions all shift on day one. Use free tools to see exactly where you stand
              — before you sign out.
            </p>

            {/* Primary CTA */}
            <Link
              href="/calculators/transition-readiness"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Check My Transition Readiness →
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

          </div>

          {/* Proof bar — inside hero to give it height and reveal the soldier image */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/70">
              <p className="text-[11px] text-zinc-400 font-medium">Example: E-6 &middot; 10 years &middot; Fort Campbell &middot; separating</p>
            </div>
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">

              {/* Col 1: Active duty value */}
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Active duty value</p>
                  <p className="text-lg font-extrabold text-zinc-900">$8,200/mo</p>
                </div>
              </div>

              {/* Col 2: Civilian salary to match */}
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Civilian salary to match</p>
                  <p className="text-lg font-extrabold" style={{ color: '#c0392b' }}>$95,000/yr</p>
                </div>
              </div>

              {/* Col 3: Hidden gap — red tint */}
              <div className="flex-1 px-4 py-3 bg-red-50 flex items-center">
                <div>
                  <p className="text-[10px] text-red-600 uppercase tracking-wide font-medium">Hidden gap</p>
                  <p className="text-lg font-extrabold" style={{ color: '#c0392b' }}>$16,800/yr</p>
                  <p className="text-[9px] text-red-600 mt-0.5">in tax-free allowances + healthcare</p>
                </div>
              </div>

              {/* Col 4: Calculate yours */}
              <div className="flex-1 px-4 py-3 bg-zinc-50 flex items-center">
                <Link
                  href="/calculators/total-compensation"
                  className="text-[11px] font-semibold text-red-700 hover:text-red-800 transition-colors"
                >
                  Calculate yours →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      
      {/* ── Direct answer ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-6 sm:py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Military-to-civilian financial transition requires replacing the full value of military compensation — not just base pay — in a civilian job offer. For an E-6 with a family, BAH, BAS, TRICARE, and tax advantages typically represent $30,000–$50,000 per year in value that disappears at separation, with healthcare replacement alone running $600–$2,000/month in premiums for comparable civilian family coverage. Use the tools on this page to understand the gap before accepting any offer.
          </p>
        </div>
      </section>
{/* ── Three things that change after separation ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8 mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
              Three financial shocks most service members don&apos;t see coming.
            </h2>
            <p className="text-base text-zinc-500">
              Base pay has a civilian equivalent. These don&apos;t.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRANSITION_RISK_CARDS.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow"
                style={{ border: `1px solid ${card.theme.borderColor}` }}
              >
                {/* Full-bleed image band */}
                <div
                  className="relative h-44 overflow-hidden flex-none"
                  style={{ background: card.theme.band }}
                >
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Subtle bottom fade into card content */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                    aria-hidden="true"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))' }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.13em] mb-2.5"
                    style={{ color: card.theme.category }}
                  >
                    {card.category}
                  </span>
                  <h3 className="text-[18px] font-bold text-zinc-900 leading-snug mb-2">
                    {card.headline}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-5">
                    {card.body}
                  </p>
                  <div className="flex-1" />
                  <Link
                    href={card.cta.href}
                    className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: card.theme.ctaBg }}
                  >
                    {card.cta.label}
                    <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── What Changes After Separation ── */}
      <section id="comparison" className="bg-white border-b border-zinc-200 py-10 sm:py-12 px-4">
        <div className="mx-auto max-w-4xl">
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
              <div className="px-5 py-3 bg-zinc-700 text-white text-sm font-semibold border-l border-zinc-600">
                After Separation
              </div>
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
        </div>
      </section>

      {/* ── Transition path cards ── */}
      <section className="border-b border-zinc-200 py-10 sm:py-12 px-4" style={{ background: '#f8f7f5' }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="text-base font-medium text-zinc-900 mb-1">Choose your transition path</h2>
          <p className="text-sm text-zinc-500 mb-7">
            Select the path that fits your plan. Each links to the most relevant tools.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATH_CARDS.map(({ title, description, href, icon, secondaryHref, secondaryLabel }) =>
              secondaryHref ? (
                <div
                  key={href}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm p-4 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xl" aria-hidden>{icon}</span>
                    <h3 className="font-semibold text-zinc-900 leading-snug text-sm">{title}</h3>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed flex-1">{description}</p>
                  <div className="mt-3 flex flex-col gap-1.5">
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
                    >
                      Open <span aria-hidden>→</span>
                    </Link>
                    <Link
                      href={secondaryHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
                    >
                      {secondaryLabel}
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm p-4 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
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
              )
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

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
                <ResourceCard
                  href="/calculators/healthcare-comparison"
                  title="Healthcare Cost Comparison Calculator"
                  description="Use this calculator to understand what replacing TRICARE will cost. Compare employer plans, ACA marketplace, VA healthcare, and TRICARE Reserve Select side by side — with actual premium and out-of-pocket estimates."
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
                  href="/calculators/healthcare-comparison"
                  title="Healthcare Cost Comparison Calculator"
                  description="Research your healthcare options — employer plan, ACA marketplace, VA care, or TRICARE Reserve Select. See premium costs, deductibles, and the annual gap vs. TRICARE side by side."
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
                  href="/blog/how-to-read-your-les"
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
        <section className="py-10 sm:py-12">
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
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Open Printable TAP Student Worksheet →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
