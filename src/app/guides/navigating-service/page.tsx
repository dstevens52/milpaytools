import type { Metadata } from 'next';
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
  scenario: 'E-6 · Fort Campbell → JBLM',
  bahDiff: '+$663/mo',
  colDiff: '+25%',
  insight: "Higher BAH doesn't always mean more money",
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
      { text: 'Dual military? See how both BAH rates change', href: '/calculators/dual-military-bah' },
    ],
  },
  {
    period: 'Deploying',
    question: 'What changes when I go downrange?',
    labelBg: 'bg-amber-50',
    labelText: 'text-amber-800',
    items: [
      { text: 'Your entire income can become tax-free in a combat zone', href: '/calculators/deployment' },
      { text: 'Savings Deposit Program (SDP) pays 10% guaranteed interest on up to $10,000' },
      { text: 'TSP contributions from tax-free combat pay go into Roth completely tax-free — a major long-term advantage' },
      { text: 'BAH continues for your dependents at your home station rate' },
    ],
  },
  {
    period: 'New Station',
    question: 'How do the numbers look now?',
    labelBg: 'bg-teal-50',
    labelText: 'text-teal-800',
    items: [
      { text: 'Recalculate total compensation at your new location', href: '/calculators/total-compensation' },
      { text: 'Compare your BAH to local housing costs', href: '/bah' },
      { text: 'Recalculate after promotion — your pay changes at every grade increase' },
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

        </div>
      </section>

      {/* ── PCS Comparison Proof Bar ─────────────────────────────────────────── */}
      <div
        className="border-b border-zinc-200 px-4 py-3"
        style={{ background: '#faf9f7' }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

            {/* Example label */}
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex-none">
              Example
            </span>

            <div className="w-px h-4 bg-zinc-200 hidden sm:block flex-none" aria-hidden="true" />

            {/* Scenario */}
            <span className="text-[13px] font-medium text-zinc-700 flex-none">
              {EX.scenario}
            </span>

            <div className="w-px h-4 bg-zinc-200 hidden sm:block flex-none" aria-hidden="true" />

            {/* BAH change */}
            <div className="flex items-baseline gap-1.5 flex-none">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wide">BAH change</span>
              <span className="text-base font-bold" style={{ color: '#1D9E75' }}>{EX.bahDiff}</span>
            </div>

            <div className="w-px h-4 bg-zinc-200 hidden sm:block flex-none" aria-hidden="true" />

            {/* COL change */}
            <div className="flex items-baseline gap-1.5 flex-none">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wide">COL change</span>
              <span className="text-base font-bold" style={{ color: '#c0392b' }}>{EX.colDiff}</span>
            </div>

            <div className="w-px h-4 bg-zinc-200 hidden sm:block flex-none" aria-hidden="true" />

            {/* Insight */}
            <span className="text-[12px] text-zinc-500 italic">{EX.insight}</span>

            {/* CTA — pushes to right */}
            <Link
              href="/calculators/compare"
              className="ml-auto text-[12px] font-semibold text-red-700 hover:text-red-800 flex-none"
            >
              Compare →
            </Link>

          </div>
        </div>
      </div>

      {/* ── Your Next Move Timeline ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-5 sm:py-7 px-4">
        <div className="mx-auto max-w-5xl">

          <h2 className="text-base font-bold text-zinc-900 mb-0.5 tracking-tight">
            Your next move
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Key checkpoints for PCS, deployment, and career decisions.
          </p>

          <div className="rounded-xl border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-100">
            {TIMELINE.map(({ period, question, labelBg, labelText, items }) => (
              <div key={period} className="flex flex-col sm:flex-row gap-3 sm:gap-0 px-4 py-3.5">
                <div className="sm:w-44 flex-none">
                  <span className={`inline-block text-[11px] font-bold ${labelBg} ${labelText} px-2.5 py-1 rounded-full whitespace-nowrap`}>
                    {period}
                  </span>
                  <p className="text-[10px] text-zinc-400 italic mt-1.5 leading-snug">{question}</p>
                </div>
                <ul className="flex-1 space-y-1.5 sm:pl-2">
                  {items.map(({ text, href }) => (
                    <li key={text} className="flex gap-2 items-start">
                      <span className="w-1 h-1 rounded-full bg-zinc-300 mt-1.5 flex-none" aria-hidden="true" />
                      {href ? (
                        <Link href={href} className="text-[11px] text-red-700 hover:text-red-800 underline decoration-red-200 underline-offset-2 leading-snug">
                          {text}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-zinc-600 leading-snug">{text}</span>
                      )}
                    </li>
                  ))}
                </ul>
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
