import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import Image from 'next/image';
import Link from 'next/link';
import { EmailSignup } from '@/components/EmailSignup';

export const metadata: Metadata = {
  title: 'Navigating Service: PCS, Deployment & Duty Station Financial Tools',
  description:
    'PCSing, deploying, or comparing duty stations? Compare BAH, estimate move costs, see combat zone tax savings, and make every assignment work for your finances. Free 2026 tools.',
  alternates: { canonical: 'https://www.milpaytools.com/guides/navigating-service' },
  openGraph: {
    title: 'Navigating Service: PCS, Deployment & Duty Station Financial Tools',
    description:
      'PCSing, deploying, or comparing duty stations? Compare BAH, estimate move costs, see combat zone tax savings, and make every assignment work for your finances. Free 2026 tools.',
    type: 'website',
    url: 'https://www.milpaytools.com/guides/navigating-service',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'guide', title: 'Navigating Service: PCS & Duty Station' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Navigating Service: PCS, Deployment & Duty Station Financial Tools',
    description:
      'PCSing, deploying, or comparing duty stations? Compare BAH, estimate move costs, see combat zone tax savings, and make every assignment work for your finances. Free 2026 tools.',
    images: ogImage({ type: 'guide', title: 'Navigating Service: PCS & Duty Station' }),
  },
};

// PCS comparison example — E-6 w/dep Fort Campbell → JBLM (hardcoded)
const EX = {
  label: 'Example: E-6 · Fort Campbell → JBLM · with dependents',
  bahFtCampbell: '$2,100/mo',
  bahJBLM: '$2,919/mo',
  bahDiff: '+$819/mo',
  colDiff: '+25%',
  insight: 'Higher BAH ≠ more money',
};

const SITUATION_CARDS = [
  {
    id: 'pcs',
    category: 'PCS / New Base',
    headline: 'Moving to a new base?',
    body: 'Compare BAH and PCS money before you sign a lease or plan your move.',
    cta: { label: 'Plan your move', href: '/calculators/compare' },
    secondaryLink: { label: 'Estimate PCS costs', href: '/calculators/pcs' },
    image: '/images/house.png',
    imageAlt: 'House illustration',
    theme: {
      band: 'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)',
      borderColor: '#bfdbfe',
      category: '#1d4ed8',
      ctaBg: '#1d4ed8',
    },
  },
  {
    id: 'deployment',
    category: 'Deployment',
    headline: 'Deploying soon?',
    body: 'Understand tax-free pay, special pays, SDP, and TSP moves before you leave.',
    cta: { label: 'Review deployment money', href: '/calculators/deployment' },
    secondaryLink: { label: 'Combat-zone TSP', href: '/blog/roth-tsp-deployment-strategy' },
    image: '/images/soldier-helicopter.png',
    imageAlt: 'Soldier and helicopter illustration',
    theme: {
      band: 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)',
      borderColor: '#fde68a',
      category: '#b45309',
      ctaBg: '#b45309',
    },
  },
  {
    id: 'career',
    category: 'Career Decisions',
    headline: 'Thinking about your next step?',
    body: 'Compare your military pay, benefits, TSP, pension value, and civilian equivalent salary.',
    cta: { label: 'See your full compensation', href: '/calculators/total-compensation' },
    secondaryLink: { label: 'Retirement & pension', href: '/calculators/retirement' },
    image: '/images/roadsign.png',
    imageAlt: 'Road sign illustration',
    theme: {
      band: 'linear-gradient(135deg,#f3e8ff 0%,#e9d5ff 100%)',
      borderColor: '#e9d5ff',
      category: '#7c3aed',
      ctaBg: '#7c3aed',
    },
  },
] as const;

export default function NavigatingServicePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        {/* Soldier image — full-width background, desktop only */}
        <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/navigating-soldier.png"
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
                Free Calculators &bull; No Account &bull; Official 2026 DoD &amp; VA Data
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[32px] sm:text-[42px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-3">
              Navigating Service: Make every{' '}
              <span className="text-red-700">PCS, deployment, and duty station</span>{' '}
              work for your finances.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-4">
              Your pay changes with every move, every deployment, and every promotion. Compare
              stations, estimate PCS costs, and see how combat zone tax savings add up — before you
              make decisions.
            </p>

            {/* Primary CTA */}
            <Link
              href="/calculators/compare"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Compare Your PCS Move
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

          </div>

          {/* PCS comparison card — inside hero to give it height and reveal the soldier image */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-4">
              <p className="text-[11px] text-zinc-400 font-medium">{EX.label}</p>
              <Link
                href="/calculators/compare"
                className="text-[11px] font-semibold text-red-700 hover:text-red-800 flex-none"
              >
                Compare stations →
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">

              {/* Col 1: Fort Campbell BAH */}
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Fort Campbell BAH</p>
                  <p className="text-lg font-extrabold text-zinc-900">{EX.bahFtCampbell}</p>
                </div>
              </div>

              {/* Col 2: JBLM BAH */}
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wide">JBLM BAH</p>
                  <p className="text-lg font-extrabold text-zinc-900">{EX.bahJBLM}</p>
                </div>
              </div>

              {/* Col 3: BAH Change — green */}
              <div className="flex-1 px-4 py-3 bg-green-50 flex items-center">
                <div>
                  <p className="text-[10px] text-green-600 uppercase tracking-wide font-medium">BAH Change</p>
                  <p className="text-lg font-extrabold text-green-800">{EX.bahDiff}</p>
                </div>
              </div>

              {/* Col 4: Cost of Living — amber */}
              <div className="flex-1 px-4 py-3 bg-amber-50 flex items-center">
                <div>
                  <p className="text-[10px] text-amber-600 uppercase tracking-wide font-medium">Cost of Living</p>
                  <p className="text-lg font-extrabold text-amber-800">{EX.colDiff}</p>
                  <p className="text-[9px] text-amber-600 mt-0.5">{EX.insight}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Situation Cards ──────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8 mx-auto max-w-3xl text-center">
            <h2 className="text-[22px] sm:text-[28px] font-bold text-zinc-900 mb-2 leading-tight">
              Before your next military move, check the money.
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
              PCS orders, deployment, promotion, and separation can all change your real income.{' '}
              Start with the situation that fits you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {SITUATION_CARDS.map((card) => (
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
                    sizes="(max-width: 640px) 100vw, 33vw"
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

                  {/* Category label */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.13em] mb-2.5"
                    style={{ color: card.theme.category }}
                  >
                    {card.category}
                  </span>

                  {/* Headline */}
                  <h3 className="text-[19px] font-bold text-zinc-900 leading-snug mb-2">
                    {card.headline}
                  </h3>

                  {/* Body */}
                  <p className="text-sm text-zinc-500 leading-relaxed mb-5">
                    {card.body}
                  </p>

                  {/* Spacer pushes CTAs to bottom */}
                  <div className="flex-1" />

                  {/* Primary CTA */}
                  <Link
                    href={card.cta.href}
                    className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity mb-3"
                    style={{ background: card.theme.ctaBg }}
                  >
                    {card.cta.label}
                    <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>

                  {/* Secondary text link */}
                  <Link
                    href={card.secondaryLink.href}
                    className="text-center text-[12px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {card.secondaryLink.label} →
                  </Link>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Email Signup ───────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 shadow-sm">
            <EmailSignup
              variant="inline"
              source="navigating-service"
              headline="Stay updated when military pay changes"
              subtext="Official pay tables, BAH rates, and major tool updates — no spam."
            />
          </div>
        </div>
      </section>
    </>
  );
}
