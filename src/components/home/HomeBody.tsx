import Link from 'next/link';

// ── Section 1: Problem statement ─────────────────────────────────────────────

function ProblemSection() {
  return (
    <section className="py-12 sm:py-14 px-4 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight mb-4">
              Military compensation is more than base pay.
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed max-w-xl">
              BAH, BAS, tax advantages, TSP match, healthcare, and benefits can change the true
              value of your service by thousands of dollars. Don&apos;t make career or financial
              decisions with only part of the math.
            </p>
            <p className="text-base text-zinc-600 leading-relaxed max-w-xl mt-3">
              You earned the benefits. Now see the full picture — so your next decision starts with real numbers.
            </p>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 px-8 py-8">
            <p className="text-red-700 text-lg font-semibold leading-relaxed">
              &ldquo;Many service members underestimate the true value of their pay and benefits by tens of thousands per year — because they only compare civilian salary to base pay.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 2: Decision-based navigation ─────────────────────────────────────

const DECISION_CARDS = [
  {
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Compare pay to civilian',
    description: 'See your total military compensation and compare it to civilian salaries.',
    href: '/calculators/total-compensation',
    cta: 'Compare My Compensation →',
  },
  {
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10" />
      </svg>
    ),
    title: 'PCS or compare duty stations',
    description: 'Check BAH, COLA, PCS costs, and housing differences.',
    href: '/calculators/compare',
    cta: 'Compare Duty Stations →',
  },
  {
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Plan separation or retirement',
    description: 'Estimate income, TSP, pension, healthcare, and VA benefits.',
    href: '/transition',
    cta: 'Plan My Transition →',
  },
  {
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: 'Understand VA or education benefits',
    description: 'Calculate VA ratings, monthly compensation, and education value.',
    href: '/calculators/va-disability',
    cta: 'Estimate My Benefits →',
  },
];

function DecisionSection() {
  return (
    <section className="py-12 sm:py-14 px-4 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 text-center mb-10">
          What decision are you trying to make?
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {DECISION_CARDS.map(({ bgClass, textClass, icon, title, description, href, cta }) => (
            <div
              key={href}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
            >
              <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center ${textClass} mb-4 flex-none`}>
                {icon}
              </div>
              <h3 className="font-bold text-zinc-900 text-sm leading-snug mb-2">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-4">{description}</p>
              <Link
                href={href}
                className="text-xs font-semibold text-red-700 hover:text-red-800 transition-colors"
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 3: Three-step process ────────────────────────────────────────────

const HOW_STEPS = [
  {
    title: 'Choose your situation',
    description: 'Pick the calculator that matches the decision you\'re facing.',
  },
  {
    title: 'Run the calculator',
    description: 'Enter a few details. We use official 2026 DoD, DFAS, VA, and DTMO data.',
  },
  {
    title: 'Make your next move',
    description:
      'Use real numbers to compare options and plan ahead.',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-14 px-4 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 text-center mb-10">
          Get your numbers in three simple steps
        </h2>
        <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-0">
          {HOW_STEPS.map((step, i) => (
            <>
              <div
                key={step.title}
                className="flex-1 flex flex-col items-center text-center px-4 md:px-6"
              >
                <div className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-lg mb-4 flex-none">
                  {i + 1}
                </div>
                <h3 className="font-bold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{step.description}</p>
              </div>
              {i < HOW_STEPS.length - 1 && (
                <div key={`chevron-${i}`} className="hidden md:flex items-center flex-none text-zinc-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

// ── Section 4: Popular calculators strip ─────────────────────────────────────

const POPULAR_CALCS = [
  {
    href: '/calculators/total-compensation',
    name: 'Total Compensation',
    description: 'See your complete military compensation in one view.',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/calculators/bah',
    name: 'BAH Calculator',
    description: '2026 housing allowance for any ZIP code.',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10" />
      </svg>
    ),
  },
  {
    href: '/calculators/va-disability',
    name: 'VA Disability Rating',
    description: 'Calculate combined rating and monthly compensation.',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: '/calculators/tsp',
    name: 'TSP Growth',
    description: 'Project your TSP balance using adjustable return assumptions.',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 4-4" />
      </svg>
    ),
  },
  {
    href: '/calculators/retirement',
    name: 'Military Retirement',
    description: 'Estimate pension, SBP, and total retirement income.',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    href: '/calculators/pcs',
    name: 'PCS Cost Estimator',
    description: 'Calculate moving costs and entitlements.',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-4 11h10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H12a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1zm3-5a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm-7 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
      </svg>
    ),
  },
];

function PopularCalculatorsSection() {
  return (
    <section className="py-10 sm:py-12 px-4 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-zinc-900">Pick the calculator for your situation</h3>
          <Link
            href="/calculators"
            className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            See every calculator →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_CALCS.map(({ href, name, description, icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:shadow-sm hover:border-zinc-300 transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 flex-none group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                {icon}
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 group-hover:text-red-700 transition-colors leading-snug">
                  {name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 5: Trust bar ──────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    title: 'Official 2026 Data',
    description: 'Official source data, with assumptions shown where projections are needed.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: '100% Private',
    description: 'No account required. No personal information collected or stored.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Built for Service Members',
    description: 'Created by a military family to provide straight answers you can trust.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    title: 'Works Anywhere',
    description: 'Runs in your browser on any device. No downloads.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

function TrustBarSection() {
  return (
    <section className="py-12 sm:py-14 px-4 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 text-center mb-10">
          Trusted data. Private. Always free.
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_ITEMS.map(({ title, description, icon }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-700 flex-none">
                {icon}
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-sm mb-1">{title}</p>
                <p className="text-xs text-zinc-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 6: Final CTA ──────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="py-12 sm:py-14 px-4 bg-red-50 border-b border-red-100">
      <div className="mx-auto max-w-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-5 text-red-700">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 6l-9.5 9.5-5-5L1 18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 6h6v6" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-3">
          Stop guessing. Start knowing.
        </h2>
        <p className="text-base text-zinc-600 mb-8">
          Use real numbers to make smarter pay, PCS, and retirement decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/calculators/total-compensation"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-red-700 px-6 py-3 text-base font-semibold text-white hover:bg-red-800 transition-colors shadow-sm"
          >
            See My Full Compensation
          </Link>
          <Link
            href="/calculators"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-6 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Explore All Tools
          </Link>
        </div>
        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>No sign-up. No personal info. Start now.</span>
        </div>
      </div>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function HomeBody() {
  return (
    <>
      <ProblemSection />
      <DecisionSection />
      <HowItWorksSection />
      <PopularCalculatorsSection />
      <TrustBarSection />
      <FinalCTASection />
    </>
  );
}
