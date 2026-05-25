import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FilterableCalculatorGrid } from '@/components/home/FilterableCalculatorGrid';

export const metadata: Metadata = {
  title: 'MilPayTools — Homepage V2 (Preview)',
  robots: { index: false, follow: false },
};

// ── Hero ──────────────────────────────────────────────────────────────────────
//
// Layout: full-bleed section, image bleeds from right, gradient fades it
// toward the left so text stays legible. On mobile the image becomes a
// lower-opacity background behind stacked text.
//
// Image: place your desk-scene photo at /public/images/hero-desk-v2.jpg
// (landscape, ideally 1800×1100+, main subject toward the right third).

const SAMPLE_ROWS = [
  { label: 'Base Pay', value: '$49,320' },
  { label: 'BAH — Housing', value: '$17,808' },
  { label: 'BAS — Food', value: '$5,724' },
];

function HeroResultCard() {
  return (
    <div className="inline-block rounded-2xl bg-white border border-zinc-200/80 shadow-xl p-5 min-w-[230px]">
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
        Sample result
      </p>
      <p className="text-[11px] text-zinc-500 mb-2 leading-snug">
        E-5 · 6 yrs · Fort Bragg, NC
      </p>
      <div className="mb-3">
        <p className="text-[34px] font-extrabold text-zinc-900 tabular-nums leading-none tracking-tight">
          $72,852
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">total annual compensation</p>
      </div>
      <div className="border-t border-zinc-100 pt-3 space-y-2">
        {SAMPLE_ROWS.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center gap-6">
            <span className="text-[11px] text-zinc-500">{label}</span>
            <span className="text-[11px] font-semibold text-zinc-800 tabular-nums">{value}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-zinc-300 mt-3 pt-3 border-t border-zinc-100">
        Based on 2026 DoD &amp; DTMO rates
      </p>
    </div>
  );
}

function HeroSection() {
  // Left-side background color — warm sand
  const sandBg = '#f5ede0';

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: sandBg, minHeight: 'clamp(520px, 78vh, 860px)' }}
    >
      {/* ── Right-side desk image ─────────────────────────────────────────── */}
      {/*
        On desktop this covers the right ~55% of the hero and fades to
        transparent on its left edge, letting the warm sand background show
        through behind the text. On mobile it's a dimmed full-bleed backdrop.
      */}
      <div
        className="absolute inset-0 lg:left-[42%]"
        aria-hidden="true"
      >
        <Image
          src="/images/hero-desk-v2.jpg"
          alt=""
          fill
          priority
          className="object-cover object-left-top"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
        {/* Mobile: heavy warm overlay so text is always readable */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: 'rgba(245,237,224,0.82)' }}
        />
        {/* Desktop: gradient from solid sand → transparent, left→right */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background: `linear-gradient(to right, ${sandBg} 0%, ${sandBg} 12%, rgba(245,237,224,0.92) 32%, rgba(245,237,224,0.5) 52%, transparent 72%)`,
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center h-full"
        style={{ minHeight: 'inherit' }}
      >
        <div className="w-full lg:max-w-[530px] py-16 lg:py-24">

          {/* Trust pill */}
          <div className="inline-flex items-center gap-2.5 mb-6 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
              Free · No account · Official 2026 DoD &amp; VA data
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-[1.04] tracking-tight text-zinc-900 mb-4"
            style={{ fontSize: 'clamp(46px, 6.5vw, 76px)' }}
          >
            Know Your<br />
            Worth.
          </h1>

          {/* Supporting line */}
          <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-8 max-w-[420px]">
            Free calculators and guidance to help service members make confident financial decisions.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/guides/starting-service"
              className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-sm"
            >
              Start With Your Situation
            </Link>
            <Link
              href="/calculators"
              className="rounded-lg border border-zinc-300 bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-white hover:border-zinc-400 transition-colors"
            >
              Explore Calculators
            </Link>
          </div>

          {/* Floating result card */}
          <HeroResultCard />

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
    <section className="bg-white border-b border-zinc-200 py-8 sm:py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[22px] sm:text-[24px] font-medium text-zinc-800 text-center mb-5">
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomeV2Page() {
  return (
    <>
      <HeroSection />
      <JourneySection />
      <CalculatorGridSection />
      <FooterTrustBand />
    </>
  );
}
