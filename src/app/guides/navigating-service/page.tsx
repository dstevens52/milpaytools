import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EmailSignup } from '@/components/EmailSignup';

export const metadata: Metadata = {
  title: 'Navigating Service: PCS, Deployment & Duty Station Financial Tools | MilPayTools',
  description:
    'PCSing, deploying, or comparing duty stations? Compare BAH, estimate move costs, see combat zone tax savings, and make every assignment work for your finances. Free 2026 tools.',
  alternates: { canonical: 'https://www.milpaytools.com/guides/navigating-service' },
};

// PCS comparison example — E-6 w/dep Fort Campbell → JBLM (hardcoded)
// TODO: Make dynamic using lookupBAH once Fort Campbell and JBLM ZIP mappings are verified
const EX = {
  label: 'Example: E-6 · Fort Campbell → JBLM · with dependents',
  bahFtCampbell: '$1,815/mo',
  bahJBLM: '$2,478/mo',
  bahDiff: '+$663/mo',
  colDiff: '+25%',
  insight: 'Higher BAH ≠ more money',
};

const TOOLS = [
  {
    title: 'Duty Station Comparison',
    desc: 'Compare total pay, BAH, taxes, and COLA between two stations.',
    cta: 'Open calculator →',
    href: '/calculators/compare',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    iconPath:
      'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  },
  {
    title: 'PCS Cost Estimator',
    desc: 'Estimate DLA, mileage, per diem, and PPM profit.',
    cta: 'Open calculator →',
    href: '/calculators/pcs',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    iconPath:
      'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  },
  {
    title: 'Deployment Pay Calculator',
    desc: 'See combat zone tax savings, special pays, and SDP interest.',
    cta: 'Open calculator →',
    href: '/calculators/deployment',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    iconPath:
      'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
  },
  {
    title: 'PCS & Duty Station Guide',
    desc: 'The complete financial picture for every move.',
    cta: 'Read guide →',
    href: '/guides/pcs',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-700',
    iconPath:
      'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
];

const SITUATION_CARDS = [
  {
    id: 'pcs',
    category: 'PCS / New Base',
    headline: 'Moving to a new base?',
    body: 'Compare BAH, housing costs, PCS entitlements, and cost-of-living changes before you make decisions.',
    chips: ['BAH', 'PCS money', 'Housing'],
    quickLinks: [
      { label: 'Compare BAH', href: '/calculators/compare' },
      { label: 'Estimate PCS money', href: '/calculators/pcs' },
      { label: 'Check housing costs', href: '/bah' },
    ],
    cta: { label: 'Plan your move', href: '/calculators/compare' },
    image: '/images/house.png',
    imageAlt: 'House illustration',
    theme: {
      band: 'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)',
      borderColor: '#bfdbfe',
      category: '#1d4ed8',
      chipBg: 'rgba(29,78,216,0.11)',
      chipText: '#1d4ed8',
      ctaBg: '#1d4ed8',
      quickLinkHover: '#1e3a8a',
    },
  },
  {
    id: 'deployment',
    category: 'Deployment',
    headline: 'Deploying soon?',
    body: 'Know what may become tax-free, which special pays apply, and how to use SDP and TSP well.',
    chips: ['Tax-free pay', 'SDP', 'TSP'],
    quickLinks: [
      { label: 'Tax-free pay', href: '/calculators/deployment' },
      { label: 'Savings Deposit Program', href: '/blog/savings-deposit-program-sdp-explained' },
      { label: 'Combat-zone TSP', href: '/blog/roth-tsp-deployment-strategy' },
    ],
    cta: { label: 'Review deployment money', href: '/calculators/deployment' },
    image: '/images/soldier-helicopter.png',
    imageAlt: 'Soldier and helicopter illustration',
    theme: {
      band: 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)',
      borderColor: '#fde68a',
      category: '#b45309',
      chipBg: 'rgba(180,83,9,0.10)',
      chipText: '#b45309',
      ctaBg: '#b45309',
      quickLinkHover: '#78350f',
    },
  },
  {
    id: 'career',
    category: 'Career Decisions',
    headline: 'Thinking about your next step?',
    body: 'Compare military compensation, TSP growth, pension value, and what you’d need to earn as a civilian.',
    chips: ['Total comp', 'TSP', 'Pension'],
    quickLinks: [
      { label: 'Total compensation', href: '/calculators/total-compensation' },
      { label: 'TSP growth', href: '/calculators/tsp' },
      { label: 'Pension / civilian pay', href: '/calculators/retirement' },
    ],
    cta: { label: 'Compare your options', href: '/calculators/total-compensation' },
    image: '/images/roadsign.png',
    imageAlt: 'Road sign illustration',
    theme: {
      band: 'linear-gradient(135deg,#f3e8ff 0%,#e9d5ff 100%)',
      borderColor: '#e9d5ff',
      category: '#7c3aed',
      chipBg: 'rgba(124,58,237,0.10)',
      chipText: '#7c3aed',
      ctaBg: '#7c3aed',
      quickLinkHover: '#4c1d95',
    },
  },
] as const;

const TIMELINE = [
  {
    period: 'PCS Orders',
    question: 'What changes when I move?',
    labelBg: 'bg-blue-50',
    labelText: 'text-blue-800',
    items: [
      { text: 'Compare BAH, taxes, and COLA between current and new station', href: '/calculators/compare' },
      { text: 'Estimate PCS entitlements — DLA, mileage, per diem, PPM profit', href: '/calculators/pcs' },
      { text: 'Check housing costs at your new base', href: '/bah' },
    ],
  },
  {
    period: 'Deploying',
    question: 'What changes when I go downrange?',
    labelBg: 'bg-amber-50',
    labelText: 'text-amber-800',
    items: [
      { text: 'Your entire income can become tax-free in a combat zone', href: '/calculators/deployment' },
      { text: 'Savings Deposit Program (SDP) pays 10% guaranteed interest on up to $10,000', href: '/blog/savings-deposit-program-sdp-explained' },
      { text: 'TSP contributions from tax-free combat pay go into Roth completely tax-free — a major long-term advantage', href: '/blog/roth-tsp-deployment-strategy' },
    ],
  },
  {
    period: 'New Station',
    question: 'How do the numbers look now?',
    labelBg: 'bg-teal-50',
    labelText: 'text-teal-800',
    items: [
      { text: 'Recalculate total compensation after any move or promotion', href: '/calculators/total-compensation' },
      { text: 'Compare your BAH to local housing costs', href: '/bah' },
    ],
  },
  {
    period: 'Longer Term',
    question: "What's the bigger picture?",
    labelBg: 'bg-purple-50',
    labelText: 'text-purple-800',
    items: [
      { text: 'Project your TSP growth over the rest of your career', href: '/calculators/tsp' },
      // TODO: /calculators/military-to-civilian doesn't exist yet — using total-compensation (civilian equivalent)
      { text: 'What would you need to earn as a civilian?', href: '/calculators/total-compensation' },
      { text: 'Review your retirement system and projected pension', href: '/calculators/retirement' },
    ],
  },
];

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
              Compare Two Duty Stations
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

          <div className="mb-8">
            <h2 className="text-[22px] sm:text-[28px] font-bold text-zinc-900 mb-2 leading-tight">
              Before your next military move, check the money.
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-2xl">
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
                {/* Image band */}
                <div
                  className="relative h-44 overflow-hidden"
                  style={{ background: card.theme.band }}
                >
                  <div className="absolute inset-5">
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  {/* Bottom fade into card white */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                    aria-hidden="true"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.55))' }}
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
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                    {card.body}
                  </p>

                  {/* Topic chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {card.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: card.theme.chipBg, color: card.theme.chipText }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Quick links */}
                  <div className="border-t border-zinc-100 pt-3.5 mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2.5">
                      Quick links
                    </p>
                    <ul className="space-y-2">
                      {card.quickLinks.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="flex items-center justify-between text-[12px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors group/ql"
                          >
                            {link.label}
                            <svg
                              className="w-3 h-3 flex-none ml-2 text-zinc-300 group-hover/ql:text-zinc-500 transition-colors"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Spacer pushes CTA to bottom */}
                  <div className="flex-1" />

                  {/* Primary CTA */}
                  <Link
                    href={card.cta.href}
                    className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: card.theme.ctaBg }}
                  >
                    {card.cta.label}
                    <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Start Here ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-5 sm:py-7 px-4">
        <div className="mx-auto max-w-5xl">

          <h2 className="text-base font-bold text-zinc-900 mb-0.5 tracking-tight">
            Start here
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Choose a tool for your next decision.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOOLS.map(({ title, desc, cta, href, iconBg, iconColor, iconPath }) => (
              <Link
                key={title}
                href={href}
                className="group bg-white rounded-xl border border-zinc-200 shadow-sm p-3.5 flex flex-col gap-2.5 hover:border-zinc-300 hover:shadow-md transition-all"
              >
                <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-none`}>
                  <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-900 mb-0.5 leading-snug">{title}</p>
                  <p className="text-[11px] text-zinc-500 leading-snug">{desc}</p>
                </div>
                <p className="text-[11px] font-semibold text-red-700 group-hover:text-red-800">{cta}</p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Email Signup ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-5 sm:py-7 px-4">
        <div className="mx-auto max-w-5xl">
          <EmailSignup
            variant="inline"
            source="navigating-service"
            headline="Get notified when 2027 pay tables and BAH rates update"
            subtext="Updates when rates, tools, or guides change. No spam."
          />
        </div>
      </section>
    </>
  );
}
