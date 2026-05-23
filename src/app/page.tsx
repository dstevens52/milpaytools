import type { Metadata } from 'next';
import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FilterableCalculatorGrid } from '@/components/home/FilterableCalculatorGrid';

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
            Free Calculators · No Account · No Personal Info · Official 2026 DoD &amp; VA Data
          </span>
        </div>

        <h1 className="text-[36px] sm:text-[38px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-0">
          Stop guessing what your{' '}
          <span className="text-red-700">military pay and benefits</span>{' '}
          are worth.
        </h1>
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
    href: '/guides/starting-service',
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
    href: '/guides/navigating-service',
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

function JourneyHeading() {
  return (
    <section className="bg-white border-b border-zinc-200 pt-3 pb-2 sm:pt-4 sm:pb-3 px-4">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[24px] font-medium text-zinc-800 text-center">
          Where are you in your military money journey?
        </h2>
      </div>
    </section>
  );
}

function JourneyCards() {
  return (
    <section className="bg-white border-b border-zinc-200 pt-3 pb-4 px-4">
      <div className="mx-auto max-w-4xl">
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

// ── Combined process + proof strip ───────────────────────────────────────────

const PROOF_STEPS = [
  { n: '1', title: 'Choose your situation' },
  { n: '2', title: 'Run the numbers' },
  { n: '3', title: 'Make a confident decision' },
];

function ProofStrip() {
  return (
    <section className="bg-white border-b border-zinc-200 px-4 py-3">
      <div className="mx-auto max-w-4xl">
        {/* Dark floating card — same width as journey cards above */}
        <div className="rounded-2xl bg-[#111318] shadow-xl px-5 py-4 md:px-7 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">

            {/* Steps */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-1 md:gap-4">
              {PROOF_STEPS.map(({ n, title }, i) => (
                <Fragment key={n}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white flex-none shrink-0">
                      {n}
                    </span>
                    <span className="text-[13px] font-semibold text-white leading-snug">{title}</span>
                  </div>
                  {i < PROOF_STEPS.length - 1 && (
                    <span className="hidden md:block text-white/25 text-base" aria-hidden="true">›</span>
                  )}
                </Fragment>
              ))}
            </div>

            {/* Proof card */}
            <div
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 flex-shrink-0 w-full md:w-auto"
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
                className="hidden md:flex flex-none ml-1 transition-opacity hover:opacity-80"
                style={{ background: '#c0392b', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, whiteSpace: 'nowrap' }}
              >
                View →
              </Link>
            </div>

            {/* Mobile CTA — full-width, below the proof card */}
            <Link
              href="/calculators/total-compensation"
              className="md:hidden block w-full text-center text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
              style={{ background: '#B91C1C', fontSize: 17, fontWeight: 600, paddingTop: 16, paddingBottom: 16, borderRadius: 12 }}
            >
              Calculate Your Pay →
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}

// ── Calculator discovery grid ─────────────────────────────────────────────────

function CalculatorGridSection() {
  return (
    <section className="bg-white border-b border-zinc-200 py-6 sm:py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8">
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

        <FilterableCalculatorGrid />
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
      <JourneyHeading />
      <ProofStrip />
      <JourneyCards />
      <CalculatorGridSection />
      <FooterTrustBand />
    </>
  );
}
