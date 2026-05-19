import type { Metadata } from 'next';
import Link from 'next/link';
import { lookupBasePay, calculateTotalCompensation } from '@/lib/calculations/total-compensation';
import { lookupBAH } from '@/lib/calculations/bah';
import { BAS_RATES } from '@/data/constants';

export const metadata: Metadata = {
  title: 'Starting Military Service: Understand Your Pay & Benefits | MilPayTools',
  description:
    'New to the military? Understand your base pay, BAH, BAS, and TSP match — and make smart money decisions from day one.',
  alternates: { canonical: 'https://www.milpaytools.com/guides/starting-service' },
};

// Example scenario: E-3, 2 years, no dependents, Fort Bragg (ZIP 28310)
const _GRADE = 'E-3';
const _YOS = 2;
const _ZIP = '28310';

const _basePay = lookupBasePay(_GRADE, _YOS);
const _bas = Math.round(BAS_RATES.enlisted);
const _bah = lookupBAH({ payGrade: _GRADE, zipCode: _ZIP, hasDependents: false })?.monthlyRate ?? 0;
const _monthly = _basePay + _bas + _bah;
const _comp = calculateTotalCompensation({
  payGrade: _GRADE,
  yearsOfService: _YOS,
  zipCode: _ZIP,
  hasDependents: false,
  retirementSystem: 'brs',
  tspContributionPct: 5,
  govHousing: false,
  mealCard: false,
});
const _civAnnual = Math.round(_comp.civilianEquivalent / 500) * 500;

function _fmt(n: number) {
  return '$' + n.toLocaleString('en-US');
}

const EX = {
  label: 'Example: E-3 • 2 years • no dependents • Fort Bragg, NC',
  base: _fmt(_basePay),
  bas: _fmt(_bas),
  bah: _fmt(_bah),
  monthly: _fmt(_monthly),
  annual: '≈' + _fmt(_civAnnual),
};

const TOOLS = [
  {
    title: 'Total Compensation Calculator',
    desc: 'See your full monthly and annual compensation.',
    cta: 'Open calculator →',
    href: '/calculators/total-compensation?rank=e3&yos=2&zip=28310&dependents=no',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-700',
    iconPath:
      'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'BAH Calculator',
    desc: 'Find your housing allowance by location.',
    cta: 'Open calculator →',
    href: '/calculators/bah?rank=e3&dependents=no',
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

const TIMELINE = [
  {
    period: 'First 30 Days',
    question: 'What am I actually getting paid?',
    labelBg: 'bg-blue-50',
    labelText: 'text-blue-700',
    items: [
      { text: "Your base pay isn't your full compensation — see the real number", href: '/calculators/total-compensation?rank=e3&yos=2&zip=28310&dependents=no' },
      { text: 'Look up your housing allowance by location', href: '/calculators/bah?rank=e3&dependents=no' },
      { text: 'Your first paycheck stub (LES) — make sure the numbers match your rank', href: '/blog/how-to-read-your-military-les' },
      { text: "You're auto-enrolled in a retirement savings plan (TSP) after 60 days", href: '/calculators/tsp' },
    ],
  },
  {
    period: 'First 90 Days',
    question: 'Where should I live and what can I afford?',
    labelBg: 'bg-amber-50',
    labelText: 'text-amber-700',
    items: [
      { text: 'See what housing costs near your base', href: '/bah/fort-bragg?rank=E-3&dep=no' },
      { text: "Your retirement account (TSP) picks investments for you by default — worth understanding what it chose", href: '/blog/tsp-fund-options-explained' },
      { text: 'You have legal protections on interest rates and loans — look up SCRA and MLA', href: '/blog/scra-mla-protections-new-service-members' },
      { text: 'Free money course that takes an afternoon', href: 'https://www.militaryonesource.mil/financial-legal/personal-finance/', external: true },
    ],
  },
  {
    period: 'First Year',
    question: 'What changes when I get promoted or move?',
    labelBg: 'bg-green-50',
    labelText: 'text-green-700',
    items: [
      { text: 'Your pay changes with every promotion and PCS — recalculate', href: '/calculators/total-compensation?rank=e3&yos=2&zip=28310&dependents=no' },
      { text: 'You have education benefits you might not know about', href: '/guides/education-benefits' },
      { text: 'Free credit report once a year at annualcreditreport.com', href: 'https://www.annualcreditreport.com', external: true },
      { text: 'See how your retirement savings could grow', href: '/calculators/tsp' },
    ],
  },
];

export default function StartingServicePage() {
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
            src="/images/young-soldier.png"
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
              href="/calculators/total-compensation?rank=e3&yos=2&zip=28310&dependents=no"
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

      {/* ── Your First Year ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-zinc-200 py-5 sm:py-7 px-4">
        <div className="mx-auto max-w-5xl">

          <h2 className="text-base font-bold text-zinc-900 mb-0.5 tracking-tight">
            Your first year
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Key checkpoints to understand your pay and benefits.
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
                  {items.map(({ text, href, external }) => (
                    <li key={text} className="flex gap-2 items-start">
                      <span className="w-1 h-1 rounded-full bg-zinc-300 mt-1.5 flex-none" aria-hidden="true" />
                      {href && external ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[11px] text-red-700 hover:text-red-800 underline decoration-red-200 underline-offset-2 leading-snug">
                          {text}
                        </a>
                      ) : href ? (
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

    </>
  );
}
