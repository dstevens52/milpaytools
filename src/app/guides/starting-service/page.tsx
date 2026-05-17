import type { Metadata } from 'next';
import Link from 'next/link';
import { EmailSignup } from '@/components/EmailSignup';

export const metadata: Metadata = {
  title: 'Starting Military Service: Pay, Benefits & First Money Moves | MilPayTools',
  description:
    'New to the military? Understand your base pay, BAH, BAS, and TSP match — plus the first financial moves every service member should make.',
  alternates: { canonical: 'https://www.milpaytools.com/guides/starting-service' },
};

// ── Example bar data (hardcoded E-3, 2 yrs, Fort Bragg — update with live calc later)
// TODO: replace with dynamic calculation from lib/calculations/total-compensation
const EXAMPLE = {
  profile: 'E-3 · 2 yrs · Fort Bragg, NC',
  base: '$2,263',
  bas: '$476',
  bah: '$1,236',
  monthly: '$3,975',
  annual: '≈$66,600',
};

// ── Start-here cards
const START_HERE_CARDS = [
  {
    title: 'Total Compensation Calculator',
    description:
      'See your full military pay package — base pay, BAH, BAS, TSP match, and tax advantage — in one number.',
    cta: 'Calculate my pay →',
    href: '/calculators/total-compensation',
    iconPath:
      'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'BAH Calculator',
    description:
      'Look up your Basic Allowance for Housing by duty station and dependent status — before you sign a lease.',
    cta: 'Look up BAH →',
    href: '/calculators/bah',
    iconPath:
      'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    title: 'Military Pay Guide',
    description:
      'Plain-English breakdown of how base pay, allowances, and special pays work — and how they add up.',
    cta: 'Read the guide →',
    href: '/guides/military-pay',
    iconPath:
      'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    title: 'TSP & BRS Guide',
    description:
      'Understand the Blended Retirement System matching and why starting TSP contributions on day one matters.',
    cta: 'Learn about TSP →',
    href: '/guides/retirement-tsp',
    iconPath:
      'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  },
];

// ── First-moves checklist
const FIRST_MOVES = [
  {
    heading: 'Start TSP contributions immediately',
    body: 'Under BRS, the government matches up to 4% of base pay after 60 days of service. Every month you wait is free money left on the table.',
  },
  {
    heading: 'Look up your BAH before signing a lease',
    body: 'BAH is set by duty station and dependent status — and it varies enormously. Know the number before you commit to rent.',
  },
  {
    heading: 'Build a 3-month emergency fund first',
    body: 'Military life is unpredictable. PCS orders, deployment, unexpected expenses. Three months of expenses in a savings account before anything else.',
  },
  {
    heading: 'Know your SCRA and MLA protections',
    body: 'The Servicemembers Civil Relief Act caps interest rates on pre-service debt at 6%. The Military Lending Act protects you from predatory loans. These protections only work if you use them.',
  },
];

export default function StartingServicePage() {
  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/" className="hover:text-zinc-700 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/guides/military-pay" className="hover:text-zinc-700 transition-colors">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">Starting service</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        className="border-b border-zinc-200 py-10 sm:py-14 px-4"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        <div className="mx-auto max-w-4xl">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 mb-4 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free · No account · Official 2026 DoD data
            </span>
          </div>

          <h1 className="text-[34px] sm:text-[42px] font-extrabold leading-tight tracking-tight text-zinc-900 mb-4">
            Starting service?{' '}
            <span className="text-red-700">Understand every dollar you&apos;re earning.</span>
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl mb-6">
            Military pay isn&apos;t just a base salary. BAH, BAS, TSP matching, and tax advantages
            can add tens of thousands of dollars to your real compensation — but only if you know
            they exist and how to use them.
          </p>

          <Link
            href="/calculators/total-compensation"
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
          >
            Calculate my total compensation
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Example result bar ── */}
      <section className="bg-white border-b border-zinc-200 px-4 py-5">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-[#111318] shadow-xl px-5 py-4 md:px-7 md:py-5">
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">
              Example · {EXAMPLE.profile}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">Base pay</p>
                <p className="text-xl font-bold text-white tabular-nums">{EXAMPLE.base}</p>
              </div>
              <div className="hidden sm:block text-white/20 text-lg">+</div>
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">BAS</p>
                <p className="text-xl font-bold text-white tabular-nums">{EXAMPLE.bas}</p>
              </div>
              <div className="hidden sm:block text-white/20 text-lg">+</div>
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">BAH</p>
                <p className="text-xl font-bold text-white tabular-nums">{EXAMPLE.bah}</p>
              </div>
              <div className="hidden sm:block text-white/20 text-lg">=</div>
              <div className="ml-auto text-right">
                <p className="text-[11px] text-white/50 uppercase tracking-wider">Monthly total</p>
                <p className="text-2xl font-extrabold text-white tabular-nums">{EXAMPLE.monthly}<span className="text-sm font-normal text-white/60">/mo</span></p>
                <p className="text-[12px] text-white/50">{EXAMPLE.annual}/yr</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Start here cards ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-5" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight">
            Start here
          </h2>
          <p className="text-base text-zinc-600 mb-7">
            Four tools and guides every new service member should use in their first 90 days.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {START_HERE_CARDS.map(({ title, description, cta, href, iconPath }) => (
              <Link
                key={title}
                href={href}
                className="group bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-3 hover:border-red-200 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-none">
                  <svg className="w-5 h-5 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 mb-1">{title}</p>
                  <p className="text-sm text-zinc-600 leading-relaxed">{description}</p>
                </div>
                <p className="text-sm font-semibold text-red-700 group-hover:text-red-800 mt-auto">{cta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── First money moves checklist ── */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-5" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2 tracking-tight">
            First money moves
          </h2>
          <p className="text-base text-zinc-600 mb-7">
            Do these four things in your first few months of service and you&apos;ll be ahead of most.
          </p>

          <div className="space-y-4">
            {FIRST_MOVES.map(({ heading, body }, i) => (
              <div key={heading} className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-bold text-zinc-900 mb-1">{heading}</p>
                  <p className="text-sm text-zinc-600 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className="mt-8 flex gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <svg className="w-5 h-5 text-blue-600 flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-sm text-blue-800 leading-relaxed">
              These moves apply to active-duty service members entering under BRS (Blended Retirement System),
              which covers everyone who entered service after January 1, 2018. If you entered before that date,
              you may be under the legacy High-3 system — your TSP matching works differently.{' '}
              <Link href="/guides/retirement-tsp" className="font-semibold underline underline-offset-2 hover:text-blue-900">
                Learn more about BRS vs. High-3.
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Email signup ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-10 sm:py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <EmailSignup source="starting-service" variant="card" />
        </div>
      </section>
    </>
  );
}
