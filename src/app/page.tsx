import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const HOME_TITLE = 'MilPayTools — Military Pay & Benefits Calculators';
const HOME_DESC =
  'Free, accurate military pay and benefits calculators. Total compensation, BAH, VA disability ratings, and TSP — with plain-English explanations and actionable next steps.';
const HOME_OG_IMAGE = '/api/og?type=home&title=MilPayTools&v=2';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESC,
  alternates: { canonical: 'https://www.milpaytools.com/' },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESC,
    type: 'website',
    url: '/',
    siteName: 'MilPayTools',
    images: [{ url: HOME_OG_IMAGE, width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [HOME_OG_IMAGE],
  },
};

// ── Floating sample calculator card ──────────────────────────────────────────

function SampleCard() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden w-full max-w-xs">
      {/* Header */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium">E-5 · 8 years · San Diego, CA</p>
          <p className="text-sm font-semibold text-zinc-800">Total Compensation Breakdown</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
          2026 rates
        </span>
      </div>

      {/* Line items */}
      <div className="px-5 py-1 divide-y divide-zinc-100">
        {[
          { label: 'Base Pay', value: '$4,299.90', sub: '/mo' },
          { label: 'BAH (w/ dependents)', value: '$3,975', sub: '/mo' },
          { label: 'BAS', value: '$476.95', sub: '/mo' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">{label}</span>
            <span className="text-sm font-mono tabular-nums text-zinc-800">
              {value}
              <span className="text-zinc-400 font-normal">{sub}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Total bar */}
      <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Total Monthly</p>
          <p className="text-2xl font-bold tabular-nums text-red-700">$8,752</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Civilian equivalent</p>
          <p className="text-sm font-semibold text-zinc-700">≈ $121,000 / yr</p>
        </div>
      </div>

      {/* Insight callout */}
      <div className="px-5 pb-4">
        <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5 flex gap-2 items-start">
          <span className="text-blue-600 text-base leading-tight flex-none">→</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            In some markets, BAH can exceed typical rent benchmarks — which can meaningfully change your housing math.
          </p>
        </div>
      </div>

      {/* Link */}
      <div className="px-5 pb-4">
        <Link
          href="/calculators/total-compensation"
          className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors"
        >
          View Full Breakdown →
        </Link>
      </div>
    </div>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 lg:min-h-[600px]">
      {/* Mobile: solid white bg */}
      <div className="absolute inset-0 bg-white lg:hidden" aria-hidden="true" />

      {/* Desktop: full-bleed photo — service member anchored to the right edge */}
      <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
        <Image
          src="/images/homepage-hero-overlook.png"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: '85% center' }}
          sizes="100vw"
          priority
        />
        {/* White-to-transparent gradient: opaque white left half fades to clear by 65% */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 25%, rgba(255,255,255,0.85) 42%, rgba(255,255,255,0.0) 65%)',
          }}
        />
      </div>

      {/* Text content — z-10, constrained to left ~45% so card+photo have room on the right */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-14">
        <div className="max-w-[440px]">
          {/* Trust strip eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free · No Account · No Personal Info · Official 2026 DoD & VA Data
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Stop guessing what your{' '}
            <span className="text-red-700">military pay and benefits</span>{' '}
            are worth.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-8">
            <strong className="text-zinc-900">Your service is worth more than base pay.</strong>{' '}
            Use free calculators to see your full military financial picture before your next PCS,
            transition, VA claim, retirement, or job offer decision.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              href="/calculators/total-compensation"
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-7 py-3.5 text-base font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              See My Full Compensation
            </Link>
            <Link
              href="/calculators"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
            >
              Explore All Tools
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
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
            <span>No sign-up. No personal info collected. Runs in your browser.</span>
          </div>
        </div>

        {/* Mobile: card below text in flow */}
        <div className="mt-10 lg:hidden">
          <div className="w-full max-w-sm mx-auto">
            <SampleCard />
            <p className="mt-3 text-xs text-center text-zinc-400">
              What an E-5 in San Diego sees — your numbers update live as you enter inputs
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: card absolutely positioned at 47% from left — center of the hero.
          Text ends ~44-47%, service member photo is visible right of the card. */}
      <div
        className="hidden lg:flex flex-col justify-center absolute z-20 top-0 bottom-0"
        style={{ left: '47%' }}
      >
        <SampleCard />
        <p className="mt-3 text-xs text-center text-zinc-400">
          What an E-5 in San Diego sees — your numbers update live as you enter inputs
        </p>
      </div>
    </section>
  );
}

// ── How it works strip ────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    n: '1',
    title: 'Choose your situation',
    description: 'Pick your rank, location, and what you want to know.',
  },
  {
    n: '2',
    title: 'Run the numbers',
    description: 'Get instant results using official 2026 DoD and VA data.',
  },
  {
    n: '3',
    title: 'Make a confident decision',
    description: 'See what your compensation is worth and what comes next.',
  },
];

function HowItWorksStrip() {
  return (
    <section className="bg-slate-100 border-b border-slate-300 py-6 md:py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center">
          {HOW_IT_WORKS.map(({ n, title, description }, i) => (
            <>
              {/* Step */}
              <div key={n} className="flex flex-col items-center text-center flex-1 px-4 py-2 md:py-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center mb-3 flex-none">
                  <span className="text-white text-sm font-black">{n}</span>
                </div>
                <p className="text-sm font-bold text-zinc-900 mb-1">{title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[160px]">{description}</p>
              </div>

              {/* Connector — desktop only, between steps */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:flex items-center flex-none" aria-hidden="true">
                  <svg className="w-6 h-6 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Journey cards section ─────────────────────────────────────────────────────

const JOURNEY_CARDS = [
  {
    imgSrc: '/images/journey-starting-service.png',
    // navy/blue overlay — rgba values for blue-900 and blue-950
    overlay: 'linear-gradient(135deg, rgba(30,58,138,0.72) 0%, rgba(23,37,84,0.82) 100%)',
    iconBg: 'bg-blue-700/70',
    iconColor: 'text-blue-100',
    borderLeft: 'border-l-blue-400',
    checkColor: 'text-blue-300',
    ctaColor: 'text-blue-200 hover:text-white',
    ctaBg: 'bg-blue-700',
    title: 'Starting Service',
    description:
      'Understand your pay, allowances, and total compensation — and the first financial decisions that set you up right.',
    checklist: ['Basic Pay & Allowances', 'Total Compensation Value', 'First Financial Decisions'],
    cta: 'Start With My Pay →',
    href: '/guides/military-pay',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    ),
  },
  {
    imgSrc: '/images/journey-navigating-service.png',
    // olive/green overlay — rgba values for emerald-900 and emerald-950
    overlay: 'linear-gradient(135deg, rgba(6,78,59,0.72) 0%, rgba(2,44,34,0.82) 100%)',
    iconBg: 'bg-emerald-700/70',
    iconColor: 'text-emerald-100',
    borderLeft: 'border-l-emerald-400',
    checkColor: 'text-emerald-300',
    ctaColor: 'text-emerald-200 hover:text-white',
    ctaBg: 'bg-emerald-700',
    title: 'Navigating Service',
    description:
      'Plan the financial side of PCS moves, duty station changes, and deployments — before the orders drop.',
    checklist: ['PCS & BAH Planning', 'Duty Station Cost Comparison', 'Deployment & Combat Pay'],
    cta: 'Compare My Options →',
    href: '/guides/pcs',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
        />
      </svg>
    ),
  },
  {
    imgSrc: '/images/journey-transitioning-service.png',
    // amber/gold overlay — rgba values for amber-900 and amber-950
    overlay: 'linear-gradient(135deg, rgba(120,53,15,0.72) 0%, rgba(69,26,3,0.82) 100%)',
    iconBg: 'bg-amber-700/70',
    iconColor: 'text-amber-100',
    borderLeft: 'border-l-amber-400',
    checkColor: 'text-amber-300',
    ctaColor: 'text-amber-200 hover:text-white',
    ctaBg: 'bg-amber-700',
    title: 'Transitioning From Service',
    description:
      'Know your VA disability compensation, healthcare costs, retirement pay, and the civilian salary you actually need — before you sign out.',
    checklist: ['VA Disability & Healthcare', 'Retirement Planning', 'Civilian Salary Comparison'],
    cta: 'Plan My Transition →',
    href: '/transition',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  },
];

function JourneySection() {
  return (
    <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-8 h-0.5 bg-red-700 rounded-full" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3 tracking-tight">
            Where are you in your military money journey?
          </h2>
          <p className="text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Choose the path that matches your next decision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {JOURNEY_CARDS.map(
            ({
              imgSrc,
              overlay,
              iconBg,
              iconColor,
              borderLeft,
              checkColor,
              ctaBg,
              title,
              description,
              checklist,
              cta,
              href,
              icon,
            }) => (
              <div
                key={title}
                className={`group relative flex flex-col rounded-2xl overflow-hidden border-l-[3px] ${borderLeft} shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 min-h-[300px]`}
              >
                {/* Background photo */}
                <Image
                  src={imgSrc}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Colored overlay */}
                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                  style={{ background: overlay }}
                />
                {/* Stretched link — makes whole card clickable without nesting anchors */}
                <Link href={href} className="absolute inset-0 z-10" aria-label={title} tabIndex={-1} />
                {/* Card content — pointer-events-none lets stretched link handle non-interactive areas */}
                <div className="relative z-20 flex flex-col flex-1 px-5 py-5 pointer-events-none">
                  {/* Title row */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
                    <div
                      className={`w-9 h-9 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-none backdrop-blur-sm`}
                    >
                      {icon}
                    </div>
                    <p className="text-white font-bold text-base drop-shadow-sm">{title}</p>
                  </div>
                  {/* Description */}
                  <p className="text-sm text-white/85 leading-relaxed mb-4">{description}</p>
                  {/* Checklist */}
                  <ul className="space-y-2 flex-1 mb-5">
                    {checklist.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <svg
                          className={`w-4 h-4 flex-none ${checkColor} mt-0.5 drop-shadow-sm`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {/* CTA */}
                  <Link
                    href={href}
                    className={`pointer-events-auto w-full flex items-center justify-center gap-1.5 ${ctaBg} text-white text-sm font-bold py-2.5 px-4 rounded-xl`}
                  >
                    {cta}
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ── Trust / value band ────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    title: 'Official Source Data',
    description: 'Uses official 2026 DoD, DFAS, DTMO, VA, and TSP source data.',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        />
      </svg>
    ),
  },
  {
    title: 'Private by Default',
    description: 'No account. No personal info collected. Calculations run in your browser.',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Decision-Focused Tools',
    description:
      'Built to help you compare, plan, and make confident military money decisions.',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Built for Military Families',
    description: 'Because every decision affects more than just one paycheck.',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </svg>
    ),
  },
];

function TrustBand() {
  return (
    <section className="bg-slate-900 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {TRUST_ITEMS.map(({ title, description, icon }) => (
            <div key={title} className="flex flex-col items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white flex-none">
                {icon}
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-1.5">{title}</p>
                <p className="text-xs text-white/60 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Calculator discovery grid ─────────────────────────────────────────────────

const CALCULATORS = [
  {
    href: '/calculators/total-compensation',
    name: 'Total Compensation',
    description: 'See your full pay and benefits package — not just base pay.',
    iconBg: 'bg-red-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/calculators/bah',
    name: 'BAH by ZIP',
    description: 'Find your housing allowance by ZIP code or installation.',
    iconBg: 'bg-blue-800',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10" />
      </svg>
    ),
  },
  {
    href: '/calculators/transition-readiness',
    name: 'Transition Readiness',
    description: 'Compare your military compensation to post-service income and expenses.',
    iconBg: 'bg-emerald-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  },
  {
    href: '/calculators/va-disability',
    name: 'VA Disability',
    description: 'Estimate your VA disability compensation and combined rating.',
    iconBg: 'bg-purple-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: '/calculators/pcs',
    name: 'PCS Cost Estimator',
    description: 'Estimate moving costs and reimbursements for your next PCS.',
    iconBg: 'bg-teal-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-4 11h10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H12a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1zm3-5a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm-7 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
      </svg>
    ),
  },
  {
    href: '/calculators/compare',
    name: 'Duty Station Comparison',
    description: 'Compare locations, BAH, costs, and financial tradeoffs.',
    iconBg: 'bg-orange-500',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/calculators/retirement',
    name: 'Retirement Calculator',
    description: 'Project military retirement pay and long-term value.',
    iconBg: 'bg-slate-800',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    href: '/calculators/healthcare-comparison',
    name: 'Healthcare Cost Comparison',
    description: 'Compare TRICARE to civilian healthcare — employer, marketplace, VA, and TRS.',
    iconBg: 'bg-blue-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v8M8 12h8" />
      </svg>
    ),
  },
];

function CalculatorGridSection() {
  return (
    <section className="bg-white border-b border-zinc-200 py-6 sm:py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-8 h-0.5 bg-red-700 rounded-full" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3 tracking-tight">
            Choose the calculator for your next decision.
          </h2>
          <p className="text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Powerful, free tools to help you see the full picture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {CALCULATORS.map(({ href, name, description, icon, iconBg }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-200 border-l-[3px] border-l-red-200 bg-white hover:border-zinc-300 hover:border-l-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center text-white flex-none shrink-0`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-zinc-900 group-hover:text-red-700 transition-colors duration-200 leading-snug mb-0.5">
                  {name}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed truncate">{description}</p>
              </div>
              <svg
                className="w-4 h-4 text-zinc-300 flex-none shrink-0 group-hover:text-red-400 transition-colors duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── Calculators + Blog two-column footer ──────────────────────────────────────

const BLOG_POSTS = [
  {
    href: '/blog/pcs-that-costs-14000-vs-makes-6000',
    title: 'The PCS That Costs $14,000 — And the One That Makes $6,000',
  },
  {
    href: '/blog/va-disability-math-explained',
    title: 'VA Disability Math: Why 50% + 30% ≠ 80%',
  },
  {
    href: '/blog/what-civilian-salary-do-i-need',
    title: 'What Civilian Salary Do I Need After the Military?',
  },
];

function CalcsAndBlogSection() {
  return (
    <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-12 px-4">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Left — More Calculators */}
        <div>
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
          <h2 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">More Calculators</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-6">
            14 free tools covering pay, benefits, PCS, retirement, VA disability, and transition planning.
          </p>
          <Link
            href="/calculators"
            className="inline-flex items-center justify-center rounded-lg bg-red-700 px-6 py-3 text-sm font-bold text-white hover:bg-red-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            View All Calculators →
          </Link>
        </div>

        {/* Right — From the Blog */}
        <div>
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-4" aria-hidden="true" />
          <h2 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">From the Blog</h2>
          <ul className="space-y-3 mb-5">
            {BLOG_POSTS.map(({ href, title }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-start gap-2 text-sm text-zinc-700 hover:text-red-700 transition-colors duration-200"
                >
                  <span className="text-red-400 font-bold flex-none mt-0.5 group-hover:text-red-600">→</span>
                  <span className="leading-snug">{title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/blog"
            className="text-sm font-bold text-red-700 hover:text-red-800 transition-colors duration-200"
          >
            Read All Posts →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer trust band ─────────────────────────────────────────────────────────

function FooterTrustBand() {
  return (
    <section className="bg-slate-900 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-none shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Trusted by service members, veterans, and families. Independent. Unbiased. 100% mission-aligned.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-none shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Your data stays private. We don&apos;t collect or store personal information.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-2xl leading-none mt-1 shrink-0" aria-hidden="true">🇺🇸</span>
            <p className="text-sm text-white/80 leading-relaxed">
              Proudly supporting the military community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksStrip />
      <JourneySection />
      <TrustBand />
      <CalculatorGridSection />
      <CalcsAndBlogSection />
      <FooterTrustBand />
    </>
  );
}
