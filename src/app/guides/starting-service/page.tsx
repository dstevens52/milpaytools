import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Starting Military Service: Understand Your Pay & Benefits | MilPayTools',
  description:
    'New to the military? Understand your base pay, BAH, BAS, and TSP match — and make smart money decisions from day one.',
  alternates: { canonical: 'https://www.milpaytools.com/guides/starting-service' },
};

// TODO: replace with live calc from lib/calculations/total-compensation (E-3, 2 yrs, ZIP 28307)
const EX = {
  label: 'Example: E-3 • 2 years • no dependents • Fort Bragg, NC',
  base: '$2,263',
  bas: '$476',
  bah: '$1,236',
  monthly: '$3,975',
  annual: '≈$66,600',
};

const TOOLS = [
  {
    title: 'Total Compensation Calculator',
    desc: 'See your full monthly and annual compensation.',
    cta: 'Open calculator →',
    href: '/calculators/total-compensation',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-700',
    iconPath:
      'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'BAH Calculator',
    desc: 'Find your housing allowance by location.',
    cta: 'Open calculator →',
    href: '/calculators/bah',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    iconPath:
      'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    title: 'Military Pay Guide',
    desc: 'Understand base pay, allowances, and special pays.',
    cta: 'Learn more →',
    href: '/guides/military-pay',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-700',
    iconPath:
      'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    title: 'TSP & BRS Basics',
    desc: 'Learn how matching works and build early habits.',
    cta: 'Learn more →',
    href: '/guides/retirement-tsp',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    iconPath:
      'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  },
];

const MOVES = [
  { title: 'Start TSP early', desc: 'BRS matches up to 4% after 60 days. Free money.' },
  { title: 'Know your BAH before signing a lease', desc: 'Rates vary enormously by duty station.' },
  { title: 'Build an emergency fund', desc: 'Three months of expenses before anything else.' },
  { title: 'Use SCRA/MLA protections', desc: 'Caps interest rates and blocks predatory loans.' },
];

export default function StartingServicePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        {/* Soldier image — right column, desktop only */}
        <div className="absolute inset-y-0 right-0 w-[42%] hidden sm:block" aria-hidden="true">
          {/* Fade into cream at the left edge so text stays readable */}
          <div
            className="absolute inset-0 z-10"
            style={{ background: 'linear-gradient(to right, rgba(242,232,212,1) 0%, rgba(242,232,212,0) 38%)' }}
          />
          <Image
            src="/images/young-soldier.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="42vw"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl pt-6 pb-5 sm:pt-9 sm:pb-6 px-4">

          {/* Left column text — constrained so the image stays visible on desktop */}
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
              Starting Service: Understand your{' '}
              <span className="text-red-700">military pay and benefits</span>{' '}
              from day one.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-4">
              Military pay is more than base pay. See the full picture—including BAH, BAS, tax
              advantages, healthcare value, and TSP match—so you can make smart money decisions
              from the start.
            </p>

            {/* Primary CTA */}
            <Link
              href="/calculators/total-compensation"
              className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Calculate My Total Compensation
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

          </div>

          {/* ── Example compensation card ── */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden">
            {/* Card label */}
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/70">
              <p className="text-[11px] text-zinc-400 font-medium">{EX.label}</p>
            </div>

            {/* Pay columns */}
            <div className="flex flex-col sm:flex-row">

              {/* Base Pay */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 sm:border-r border-b sm:border-b-0 border-zinc-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">Base Pay</p>
                  <p className="text-base font-bold text-zinc-900 tabular-nums leading-none">{EX.base}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">monthly</p>
                </div>
              </div>

              {/* BAS */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 sm:border-r border-b sm:border-b-0 border-zinc-100">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">BAS</p>
                  <p className="text-base font-bold text-zinc-900 tabular-nums leading-none">{EX.bas}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">monthly</p>
                </div>
              </div>

              {/* BAH */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 sm:border-r border-b sm:border-b-0 border-zinc-100">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-none">
                  <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">BAH</p>
                  <p className="text-base font-bold text-zinc-900 tabular-nums leading-none">{EX.bah}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">monthly</p>
                </div>
              </div>

              {/* Est. Monthly — green */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-green-50 sm:border-r border-b sm:border-b-0 border-green-100">
                <div>
                  <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider leading-none mb-1">Est. Monthly Value</p>
                  <p className="text-lg font-extrabold text-green-800 tabular-nums leading-none">{EX.monthly}</p>
                  <p className="text-[10px] text-green-500 mt-0.5">per month</p>
                </div>
              </div>

              {/* Civilian Equivalent — amber */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-amber-50">
                <div>
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider leading-none mb-1">Civilian Equivalent</p>
                  <p className="text-lg font-extrabold text-amber-900 tabular-nums leading-none">{EX.annual}</p>
                  <p className="text-[10px] text-amber-500 mt-0.5">annual, pre-tax</p>
                </div>
              </div>

            </div>
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
            Choose a tool or guide to understand your pay and benefits.
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

      {/* ── First Money Moves + Info Strip ────────────────────────────────────── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-4 sm:py-5 px-4">
        <div className="mx-auto max-w-5xl">

          <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">
            First money moves that matter
          </h2>

          {/* Compact checklist row */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:divide-x divide-zinc-100">
              {MOVES.map(({ title, desc }, i) => (
                <div
                  key={title}
                  className={`flex-1 flex gap-2.5 px-3 py-3 ${i < MOVES.length - 1 ? 'border-b sm:border-b-0 border-zinc-100' : ''}`}
                >
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-none mt-0.5">
                    <svg className="w-2.5 h-2.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-900 leading-snug">{title}</p>
                    <p className="text-[10px] text-zinc-400 leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtle info strip */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
            <svg className="w-3.5 h-3.5 text-blue-400 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-[11px] text-blue-600">
              Most new service members underestimate the value of tax-free allowances and matching contributions.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
