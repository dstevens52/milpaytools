import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MilPayTools — Homepage V3 (Preview)',
  robots: { index: false, follow: false },
};

// ── Hero ──────────────────────────────────────────────────────────────────────
//
// Image: /images/hero-desk.png — full-bleed atmospheric background, same
// pattern as /guides/starting-service. Dark-left → transparent-right gradient
// overlay so text stays readable while the desk scene shows through on the right.
// Mobile: flat dark overlay added for full-width readability. Sample bar hidden.

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#0f172a', minHeight: 'clamp(310px, 50vh, 420px)' }}
    >
      {/* Full-bleed desk background image */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero-desk.png"
          alt=""
          fill
          priority
          className="object-cover object-right"
          sizes="100vw"
        />
        {/* Left-to-right gradient: dark (text area) → transparent (image shows through) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.93) 28%, rgba(15,23,42,0.55) 52%, rgba(15,23,42,0.1) 72%, rgba(15,23,42,0) 85%)',
          }}
        />
        {/* Mobile: additional flat overlay so full-width text stays readable */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{ background: 'rgba(15,23,42,0.5)' }}
        />
        {/* Bottom fade: photo → warm cream, blends into journey section below */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, #f5f0e8)' }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center"
        style={{ minHeight: 'inherit' }}
      >
        <div className="w-full sm:max-w-[52%]">

          {/* Trust badge — single line, compact */}
          <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-white/10 border border-white/20 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-white uppercase tracking-wide whitespace-nowrap">
              FREE &middot; NO ACCOUNT &middot; OFFICIAL 2026 DOD &amp; VA DATA
            </span>
          </div>

          {/* Headline */}
          <h1
            className="whitespace-nowrap font-extrabold leading-[1.04] tracking-tight text-white mb-2"
            style={{ fontSize: 'clamp(38px, 5vw, 62px)' }}
          >
            Know Your <span className="text-red-500">Worth.</span>
          </h1>

          {/* Subline */}
          <p className="text-base sm:text-lg text-white/70 leading-snug mb-5">
            Military pay is more than base pay. Calculate your full compensation in minutes.
          </p>

          {/* CTA + sample card — same row on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Link
              href="/calculators/total-compensation"
              className="inline-block rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-sm text-center flex-none"
            >
              See your real pay →
            </Link>

            {/* Sample output card */}
            <div
              className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 w-full md:w-fit"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
            >
              <span style={{ fontSize: 9, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1, whiteSpace: 'nowrap', border: '1px solid #e5e5e5', borderRadius: 4, padding: '2px 5px', flexShrink: 0 }}>
                Sample
              </span>
              <div className="flex-none">
                <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 4 }}>
                  E-5 · 8yrs · San Diego
                </p>
                <div className="flex items-baseline gap-0.5">
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>$8,752</span>
                  <span style={{ fontSize: 11, color: '#999' }}>/mo</span>
                </div>
              </div>
              <div className="h-[30px] w-px bg-[#e5e5e5] flex-none" aria-hidden="true" />
              <div className="flex-none">
                <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 4 }}>
                  Civilian equiv.
                </p>
                <div className="flex items-baseline gap-0.5">
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>≈$121k</span>
                  <span style={{ fontSize: 11, color: '#999' }}>/yr</span>
                </div>
              </div>
              <Link
                href="/calculators/total-compensation"
                className="flex flex-none ml-1 transition-opacity hover:opacity-80"
                style={{ background: '#c0392b', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, whiteSpace: 'nowrap' }}
              >
                View →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── Journey section ───────────────────────────────────────────────────────────

const JOURNEY_CARDS = [
  {
    imgSrc: '/images/journey-starting-service.png',
    overlay: 'linear-gradient(135deg, rgba(30,58,138,0.72) 0%, rgba(23,37,84,0.82) 100%)',
    borderLeft: 'border-l-blue-400',
    title: 'Starting service',
    description:
      'Understand base pay, BAH, BAS, TSP match, and what your compensation is really worth.',
    cta: 'Start with pay basics →',
    href: '/guides/starting-service',
    icon: (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.83m2.55-5.84a14.98 14.98 0 00-6.16 12.12A14.98 14.98 0 0014.37 8.41" />
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
    href: '/guides/navigating-service',
    icon: (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
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
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
    ),
  },
];

function JourneySection() {
  return (
    <section className="border-b border-zinc-200 py-3 sm:py-4 px-4" style={{ background: '#f5f0e8' }}>
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-zinc-500 text-center mb-1.5">
          <span className="text-zinc-700 font-medium">①</span> Choose your situation
          {' '}<span className="mx-1.5">&middot;</span>{' '}
          <span className="text-zinc-700 font-medium">②</span> Run the numbers
          {' '}<span className="mx-1.5">&middot;</span>{' '}
          <span className="text-zinc-700 font-medium">③</span> Decide with confidence
        </p>
        <h2 className="text-[24px] sm:text-[28px] font-medium text-zinc-800 text-center mb-3">
          Where are you in your military money journey?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {JOURNEY_CARDS.map(({ imgSrc, overlay, borderLeft, title, description, cta, href, icon }) => (
            <div
              key={title}
              className={`group relative flex flex-col rounded-xl overflow-hidden border-l-[3px] ${borderLeft} shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 min-h-[210px]`}
            >
              <Image src={imgSrc} alt="" fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0" aria-hidden="true" style={{ background: overlay }} />
              <Link href={href} className="absolute inset-0 z-10" aria-label={title} tabIndex={-1} />
              <div className="relative z-20 flex flex-col flex-1 px-5 py-4 pointer-events-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-none">
                    {icon}
                  </div>
                  <p className="text-white font-bold text-sm drop-shadow-sm">{title}</p>
                </div>
                <p className="text-[13px] text-white/85 leading-relaxed flex-1 mb-3">{description}</p>
                <Link href={href} className="pointer-events-auto text-[13px] font-semibold text-white/90 hover:text-white transition-colors">
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

// ── Calculator grid ───────────────────────────────────────────────────────────

const TOP_CALCULATORS = [
  {
    href: '/calculators/total-compensation',
    title: 'Total Compensation',
    description: 'Base pay, BAH, BAS, tax advantages, and civilian salary equivalent — all in one view.',
    icon: '💰',
  },
  {
    href: '/calculators/bah',
    title: 'BAH by ZIP Code',
    description: '2026 housing allowance for any ZIP code. Compare two duty stations for PCS planning.',
    icon: '🏠',
  },
  {
    href: '/calculators/va-disability',
    title: 'VA Disability Rating',
    description: 'Combined rating calculator with step-by-step math and monthly compensation estimate.',
    icon: '🎖️',
  },
  {
    href: '/calculators/pcs',
    title: 'PCS Cost Estimator',
    description: 'DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds from one tool.',
    icon: '📦',
  },
] as const;

function CalculatorGridSection() {
  return (
    <section className="bg-white border-b border-zinc-200 py-6 sm:py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 text-center mb-5 tracking-tight">
          Most popular tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {TOP_CALCULATORS.map(({ href, title, description, icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-lg border border-zinc-200 p-5 bg-white hover:shadow-md hover:border-zinc-300 transition-all duration-150"
            >
              <span className="text-2xl mb-3">{icon}</span>
              <h3 className="font-bold text-zinc-900 text-sm mb-1.5 group-hover:text-red-700 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-3">{description}</p>
              <span className="text-xs font-semibold text-red-700">Try it →</span>
            </Link>
          ))}
        </div>
        <p className="text-center">
          <Link href="/calculators" className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 transition-colors">
            View all 16 calculators →
          </Link>
        </p>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomeV3Page() {
  return (
    <>
      <HeroSection />
      <JourneySection />
      <CalculatorGridSection />
      <FooterTrustBand />
    </>
  );
}
