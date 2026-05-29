import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExpandableCalcGrid } from './home-v3/ExpandableCalcGrid';

const HOME_TITLE = 'MilPayTools — Military Pay & Benefits Calculators';
const HOME_DESC =
  'Free, accurate military pay and benefits calculators. Total compensation, BAH, VA disability ratings, and TSP — with plain-English explanations and actionable next steps.';
const HOME_OG_IMAGE = '/api/og?type=home&title=MilPayTools&v=2';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
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

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden sm:min-h-[clamp(310px,50vh,420px)]"
      style={{ background: '#0f172a' }}
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
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-4 pb-3 sm:py-8 flex items-start sm:items-center"
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
    <section className="border-b border-zinc-200 pt-1 pb-3 sm:py-4 px-4" style={{ background: '#f5f0e8' }}>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs sm:text-sm text-zinc-500 text-center mb-0.5 sm:mb-1.5">
          <span className="text-zinc-700 font-medium">①</span> Choose your situation
          {' '}<span className="mx-1.5">&middot;</span>{' '}
          <span className="text-zinc-700 font-medium">②</span> Run the numbers
          {' '}<span className="mx-1.5">&middot;</span>{' '}
          <span className="text-zinc-700 font-medium">③</span> Decide with confidence
        </p>
        <h2 className="text-[22px] sm:text-[28px] font-medium text-zinc-800 text-center mb-2 sm:mb-3">
          Where are you in your military money journey?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {JOURNEY_CARDS.map(({ imgSrc, overlay, borderLeft, title, description, cta, href, icon }) => (
            <div
              key={title}
              className={`group relative flex flex-col rounded-xl overflow-hidden border-l-[3px] ${borderLeft} shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 min-h-[175px] md:min-h-[210px]`}
            >
              <Image src={imgSrc} alt="" fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0" aria-hidden="true" style={{ background: overlay }} />
              <Link href={href} className="absolute inset-0 z-10" aria-label={title} tabIndex={-1} />
              <div className="relative z-20 flex flex-col flex-1 px-4 py-3 sm:px-5 sm:py-4 pointer-events-none">
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
    icon: (
      <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/bah',
    title: 'BAH by ZIP Code',
    description: '2026 housing allowance for any ZIP code. Compare two duty stations for PCS planning.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/va-disability',
    title: 'VA Disability Rating',
    description: 'Combined rating calculator with step-by-step math and monthly compensation estimate.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/pcs',
    title: 'PCS Cost Estimator',
    description: 'DLA, MALT mileage, per diem, TLE, and PPM/DITY net proceeds from one tool.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </div>
    ),
  },
];

function CalculatorGridSection() {
  return (
    <section className="bg-white border-b border-zinc-200 py-6 sm:py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 text-center mb-5 tracking-tight">
          Most popular tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOP_CALCULATORS.map(({ href, title, description, icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-lg border border-zinc-200 p-5 bg-white hover:shadow-md hover:border-zinc-300 transition-all duration-150"
            >
              <div className="mb-3">{icon}</div>
              <h3 className="font-bold text-zinc-900 text-sm mb-1.5 group-hover:text-red-700 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-3">{description}</p>
              <span className="text-xs font-semibold text-red-700">Try it →</span>
            </Link>
          ))}
        </div>
        <ExpandableCalcGrid />
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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <JourneySection />
      <CalculatorGridSection />
      <FooterTrustBand />
    </>
  );
}
