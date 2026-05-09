import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Homepage Preview v2 | MilPayTools',
  description: 'Experimental MilPayTools homepage preview.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// ── Floating sample calculator card ──────────────────────────────────────────

function SampleCard() {
  const rows = [
    {
      label: 'Base Pay',
      value: '$3,287.10',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'BAH',
      value: '$2,343.00',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10" />
        </svg>
      ),
    },
    {
      label: 'BAS',
      value: '$460.55',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      ),
    },
    {
      label: 'VA Disability',
      value: '$1,071.16',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: 'TSP Match',
      value: '$246.53',
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-white/20 w-full max-w-xs mx-auto transition-all duration-300 hover:scale-[1.02]"
      style={{
        boxShadow:
          '0 32px 64px -16px rgba(0,0,0,0.45), 0 12px 24px -8px rgba(0,0,0,0.30), 0 2px 8px -2px rgba(0,0,0,0.20)',
      }}
    >
      <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-3 flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-800">Sample Compensation</p>
        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
          E-5 · CONUS
        </span>
      </div>

      <div className="divide-y divide-zinc-100 px-5">
        {rows.map(({ label, value, icon }) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="text-zinc-300">{icon}</span>
              {label}
            </span>
            <span className="text-sm font-mono tabular-nums font-semibold text-zinc-800">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-2 mb-1 rounded-xl bg-red-700 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-red-200 font-semibold uppercase tracking-widest">
            Monthly Total
          </p>
          <p className="text-2xl font-black tabular-nums text-white leading-none mt-0.5">
            $7,408.34
          </p>
        </div>
      </div>

      <div className="px-5 py-3.5">
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
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
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
        <div className="mt-10 lg:hidden flex justify-center">
          <div className="w-full max-w-sm">
            <SampleCard />
          </div>
        </div>
      </div>

      {/* Desktop: card absolutely positioned at 47% from left — center of the hero.
          Text ends ~44-47%, service member photo is visible right of the card. */}
      <div
        className="hidden lg:flex items-center absolute z-20 top-0 bottom-0"
        style={{ left: '47%' }}
      >
        <SampleCard />
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
      'Understand your pay, allowances, benefits, and first financial decisions.',
    checklist: ['Basic Pay & Allowances', 'Benefits Overview', 'New Enlistee Checklist'],
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
      'Plan for PCS, BAH, duty stations, deployment pay, and the financial tradeoffs that come with your mission.',
    checklist: ['PCS & BAH Planning', 'Duty Station Comparison', 'Deployment Pay & Benefits'],
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
      'Prepare for separation or retirement with confidence using VA benefits, healthcare, and civilian salary replacement tools.',
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
              <Link
                key={title}
                href={href}
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
                {/* Card content — above image and overlay */}
                <div className="relative z-10 flex flex-col flex-1 px-5 py-5">
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
                  <span
                    className={`w-full flex items-center justify-center gap-1.5 ${ctaBg} text-white text-sm font-bold py-2.5 px-4 rounded-xl`}
                  >
                    {cta}
                  </span>
                </div>
              </Link>
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
    <section className="bg-white border-b border-zinc-100 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {TRUST_ITEMS.map(({ title, description, icon }) => (
              <div key={title} className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white flex-none">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm mb-1.5">{title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
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
    href: '/calculators/tsp',
    name: 'TSP Growth',
    description: 'See how your Thrift Savings Plan could grow over time.',
    iconBg: 'bg-green-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-4" />
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

        <div className="text-center">
          <Link
            href="/calculators"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm transition-all duration-300"
          >
            View All Calculators →
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

export default function HomepageV2PreviewPage() {
  return (
    <>
      <HeroSection />
      <JourneySection />
      <TrustBand />
      <CalculatorGridSection />
      <FooterTrustBand />
    </>
  );
}
