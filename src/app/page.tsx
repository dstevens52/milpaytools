import type { Metadata } from 'next';
import { Fragment } from 'react';
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

// ── Hero section ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="border-b border-zinc-200 py-4 sm:py-5 px-4"
      style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
            Free · No Account · No Personal Info · Official 2026 DoD &amp; VA Data
          </span>
        </div>

        <h1 className="text-[36px] sm:text-[38px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-2">
          Stop guessing what your{' '}
          <span className="text-red-700">military pay and benefits</span>{' '}
          are worth.
        </h1>

        <p className="text-sm text-zinc-600 leading-relaxed">
          Free military financial calculators using official 2026 DoD and VA data. No account required. No personal information collected.
        </p>
      </div>
    </section>
  );
}

// ── Journey cards section ─────────────────────────────────────────────────────

const JOURNEY_CARDS = [
  {
    imgSrc: '/images/journey-starting-service.png',
    overlay: 'linear-gradient(135deg, rgba(30,58,138,0.72) 0%, rgba(23,37,84,0.82) 100%)',
    borderLeft: 'border-l-blue-400',
    title: 'Starting service',
    description:
      'Understand base pay, BAH, BAS, TSP match, and what your compensation is really worth.',
    cta: 'Start with pay basics →',
    href: '/guides/military-pay',
    icon: (
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.83m2.55-5.84a14.98 14.98 0 00-6.16 12.12A14.98 14.98 0 0014.37 8.41"
        />
      </svg>
    ),
  },
  {
    imgSrc: '/images/journey-navigating-service.png',
    overlay: 'linear-gradient(135deg, rgba(6,78,59,0.72) 0%, rgba(2,44,34,0.82) 100%)',
    borderLeft: 'border-l-emerald-400',
    title: 'Navigating service',
    description:
      'Compare duty stations, PCS costs, BAH changes, deployment pay, and cost-of-living tradeoffs.',
    cta: 'Plan my next move →',
    href: '/guides/pcs',
    icon: (
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    imgSrc: '/images/journey-transitioning-service.png',
    overlay: 'linear-gradient(135deg, rgba(120,53,15,0.72) 0%, rgba(69,26,3,0.82) 100%)',
    borderLeft: 'border-l-amber-400',
    title: 'Transitioning from service',
    description:
      'Estimate VA disability, retirement income, healthcare costs, and civilian salary targets.',
    cta: 'Plan my transition →',
    href: '/transition',
    icon: (
      <svg
        className="w-4 h-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        />
      </svg>
    ),
  },
];

function JourneySection() {
  return (
    <section className="bg-white border-b border-zinc-200 py-4 sm:py-5 px-4">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[22px] font-medium text-zinc-800 text-center mb-3">
          Where are you in your military money journey?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {JOURNEY_CARDS.map(({ imgSrc, overlay, borderLeft, title, description, cta, href, icon }) => (
            <div
              key={title}
              className={`group relative flex flex-col rounded-xl overflow-hidden border-l-[3px] ${borderLeft} shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 min-h-[210px]`}
            >
              {/* Background photo */}
              <Image
                src={imgSrc}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {/* Color overlay */}
              <div className="absolute inset-0" aria-hidden="true" style={{ background: overlay }} />
              {/* Stretched link — whole card clickable */}
              <Link href={href} className="absolute inset-0 z-10" aria-label={title} tabIndex={-1} />
              {/* Card content */}
              <div className="relative z-20 flex flex-col flex-1 px-5 py-4 pointer-events-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-none">
                    {icon}
                  </div>
                  <p className="text-white font-bold text-sm drop-shadow-sm">{title}</p>
                </div>
                <p className="text-[13px] text-white/85 leading-relaxed flex-1 mb-3">
                  {description}
                </p>
                <Link
                  href={href}
                  className="pointer-events-auto text-[13px] font-semibold text-white/90 hover:text-white transition-colors"
                >
                  {cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 1-2-3 Process strip ───────────────────────────────────────────────────────

const PROCESS_STEPS = [
  { n: '1', title: 'Choose your situation', sub: 'Pick a calculator or life stage' },
  { n: '2', title: 'Run the numbers', sub: 'Use official data and simple inputs' },
  { n: '3', title: 'Make a confident decision', sub: 'Compare options before you act' },
];

function ProcessStrip() {
  return (
    <section className="bg-zinc-900 border-b border-zinc-800 py-4 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
          {PROCESS_STEPS.map(({ n, title, sub }, i) => (
            <Fragment key={n}>
              <div className="flex items-center gap-3 py-2 sm:py-0 sm:flex-1">
                <div className="w-[26px] h-[26px] rounded-full bg-red-700 flex items-center justify-center flex-none shrink-0">
                  <span className="text-white text-xs font-black">{n}</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-snug">{title}</p>
                  <p className="text-[11px] text-white/50 leading-snug mt-0.5">{sub}</p>
                </div>
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <svg
                  className="hidden sm:block w-4 h-4 text-zinc-600 flex-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Example result bar ────────────────────────────────────────────────────────

function ExampleResultBar() {
  return (
    <section className="bg-zinc-50 border-t border-b border-zinc-200 px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Label */}
          <div className="flex-none">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">
              Example result
            </p>
            <p className="text-[13px] text-zinc-600">E-5 · 8 years · San Diego</p>
          </div>

          <div className="hidden sm:block h-8 w-px bg-zinc-200 flex-none" aria-hidden="true" />

          {/* Stats */}
          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium">
                Monthly value
              </p>
              <p className="text-lg font-bold text-zinc-900 tabular-nums">$8,752</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium">
                Civilian equivalent
              </p>
              <p className="text-lg font-bold text-zinc-900 tabular-nums">
                ≈ $121,000
                <span className="text-sm font-medium text-zinc-500">/yr</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="sm:ml-auto">
            <Link
              href="/calculators/total-compensation"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-700 hover:text-red-800 transition-colors bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg px-4 py-2"
            >
              View breakdown →
            </Link>
          </div>
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

// ── Calculators + Blog two-column section ─────────────────────────────────────

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
      <JourneySection />
      <ProcessStrip />
      <ExampleResultBar />
      <TrustBand />
      <CalculatorGridSection />
      <CalcsAndBlogSection />
      <FooterTrustBand />
    </>
  );
}
