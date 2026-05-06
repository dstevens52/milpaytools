import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema } from '@/lib/schema';
import { DataCurrencyBadge } from '@/components/calculators/shared/DataCurrencyBadge';

const PAGE_TITLE = 'Military Transition Financial Guide';
const META_TITLE = `${PAGE_TITLE} | MilPayTools`;
const META_DESC =
  'Step-by-step financial roadmap for separating and retiring service members. Timeline-based guide from 12 months out through your first 90 days as a civilian.';
const OG_IMAGE = `/api/og?type=guide&title=${encodeURIComponent(PAGE_TITLE)}&v=2`;

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
    active: 'SGLI — $500K coverage for ~$25/month',
    after: 'VGLI conversion window (120 days after separation), private term policy, or employer group coverage',
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
    after: 'Final move entitlement — time-limited, typically one year after separation',
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

// ─── Phase data ────────────────────────────────────────────────────────────

function PhaseHeader({
  number,
  timeframe,
  title,
}: {
  number: number;
  timeframe: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2.5 mb-3">
        <span className="w-8 h-8 rounded-full bg-red-700 text-white text-sm font-bold flex items-center justify-center flex-none">
          {number}
        </span>
        <span className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 rounded-full px-3 py-1">
          {timeframe}
        </span>
      </div>
      <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
    </div>
  );
}

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
      'Run the Total Compensation Calculator with your new civilian salary to see exactly how your compensation changed. Quantifying the delta helps you make informed decisions about negotiating raises or benefits.',
    href: '/calculators/total-compensation',
    external: false,
  },
];

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

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li>
                <Link href="/" className="hover:text-zinc-700 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-zinc-900 font-medium">Transition Guide</li>
            </ol>
          </nav>

          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Financial Roadmap
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-4">
            Your Military Transition —
            <br className="hidden sm:block" /> A Financial Roadmap
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-4 max-w-2xl">
            A step-by-step financial guide for separating and retiring service members. Use
            this as a financial checklist before your paycheck, healthcare, housing allowance,
            and benefits change.
          </p>

          <DataCurrencyBadge source="Official DoD, DFAS & VA data" />

          {/* Primary CTAs */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/calculators/transition-readiness"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-sm"
            >
              Check My Transition Readiness
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/transition/worksheet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Download TAP Student Worksheet (PDF)
            </Link>
          </div>

          <div className="mt-5 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-md px-4 py-2.5 inline-block">
            <p>
              Designed to complement the DoD Transition Assistance Program (TAP) financial
              readiness module.
            </p>
            <p className="mt-1 text-zinc-400">
              TAP covers what to complete. This page helps you run the numbers.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* ── What Changes After Separation ────────────────────────────── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
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
            {/* Header */}
            <div className="grid grid-cols-2">
              <div className="px-5 py-3 bg-zinc-800 text-white text-sm font-semibold">Active Duty</div>
              <div className="px-5 py-3 bg-zinc-700 text-white text-sm font-semibold border-l border-zinc-600">After Separation</div>
            </div>
            {/* Rows */}
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

        {/* ── Choose Your Transition Path ───────────────────────────────── */}
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

        {/* ── Phase 0 ─────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <PhaseHeader number={0} timeframe="12+ months out" title="Start the process" />
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
        </section>

        {/* ── Phase 1 ─────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <PhaseHeader number={1} timeframe="6–12 months out" title="Know your numbers" />
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
              description="If you have any service-connected conditions, your VA disability rating directly affects your post-separation income. Know your estimated rating now — before you start any civilian salary negotiations."
            />
            <ResourceCard
              href="/blog/file-va-disability-before-separation"
              title="File for VA Disability Before You Separate"
              description="The BDD (Benefits Delivery at Discharge) window is 180–90 days before your separation date. File within this window so VA can review records and schedule exams before separation. VA's goal is to deliver a decision within 30 days after separation, but timing varies by claim complexity and exam completion."
            />
            <ResourceCard
              href="/calculators/tsp"
              title="TSP Growth Projector"
              description="Review your TSP balance and contribution strategy. Your last months on active duty may be your best opportunity to maximize contributions — especially if you'll be moving to a higher tax bracket as a civilian."
            />
            <ResourceCard
              href="/calculators/transition-readiness"
              title="Transition Readiness Calculator"
              description="One tool that brings it all together. Enter your rank, duty station, expected VA rating, target civilian salary, and expenses — get a clear readiness verdict with action steps."
            />
          </div>
        </section>

        {/* ── Phase 2 ─────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <PhaseHeader number={2} timeframe="3–6 months out" title="Lock in your benefits" />
          <p className="text-base text-zinc-600 leading-relaxed mb-8 max-w-2xl">
            You&apos;ve done the math. Now it&apos;s time to take action on the benefits that have
            deadlines. Miss these windows and you can&apos;t go back.
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
        </section>

        {/* ── Phase 3 ─────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <PhaseHeader number={3} timeframe="90 days out" title="Execute your plan" />
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
          </div>
        </section>

        {/* ── Phase 4 ─────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-12 border-b border-zinc-200">
          <PhaseHeader
            number={4}
            timeframe="After separation"
            title="Your first 90 days as a civilian"
          />
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
        </section>

        {/* ── Classroom & Privacy Note ─────────────────────────────────── */}
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
                Download printable TAP worksheet (no account required) →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Coming Next ──────────────────────────────────────────────── */}
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

        {/* ── Related guides ───────────────────────────────────────────── */}
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
