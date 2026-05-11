import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About MilPayTools | Free Military Pay & Benefits Calculators',
  description:
    'MilPayTools provides free, private military financial calculators built on official DoD and VA data. Built by Dan Stevens, NMLS-licensed financial professional and military family member.',
  alternates: { canonical: 'https://www.milpaytools.com/about' },
};

const PRINCIPLES = [
  {
    icon: (
      <svg className="w-6 h-6 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    heading: 'Official data only',
    body: 'All calculations use published rates from DFAS, DTMO, the VA, and the TSP. When rates update, the calculators update.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    heading: 'Private by default',
    body: 'No account required. No personal information collected. Every calculation runs in your browser and is never stored or transmitted.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    heading: 'Decision-focused',
    body: "The goal isn't just a number. It's helping you understand what that number means for your next PCS, transition, VA claim, retirement, or career decision.",
  },
];

const STATS = [
  { value: '14', label: 'Free calculators' },
  { value: '33', label: 'Blog posts & guides' },
  { value: '76', label: 'Duty station BAH pages' },
  { value: '2026', label: 'Official DoD & VA data' },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
              <li><Link href="/" className="hover:text-zinc-700 transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 font-medium">About</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-14 sm:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-6" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
            Built for the military community.{' '}
            <span className="text-red-700">By someone who grew up in it.</span>
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl">
            MilPayTools exists because military compensation is deliberately complex, and service
            members deserve to see the full picture before they make decisions that affect their
            family&apos;s financial future.
          </p>
        </div>
      </section>

      {/* ── About Dan ── */}
      <section className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo placeholder */}
            <div className="flex-none">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center select-none" aria-hidden="true">
                <span className="text-white text-2xl font-bold tracking-tight">DS</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <p className="text-xl font-bold text-zinc-900">Dan Stevens</p>
                <p className="text-sm text-zinc-500 font-medium">NMLS-Licensed Mortgage Professional</p>
              </div>

              <div className="mt-4 space-y-4 text-base text-zinc-600 leading-relaxed">
                <p>
                  Dan Stevens is an NMLS-licensed mortgage industry professional and the creator
                  of MilPayTools. He grew up as a military brat — his father served 20 years in the
                  United States Air Force, with the family stationed at bases including Offutt AFB,
                  Lajes Field (Azores), and Eielson AFB (Alaska).
                </p>
                <p>
                  That experience — watching his family navigate PCS moves, housing decisions, and
                  the financial complexity of military life — shaped his understanding of what service
                  members and their families actually need: clear numbers, not guesswork.
                </p>
                <p>
                  Dan brings professional lending expertise to MilPayTools. As a mortgage industry
                  manager, he understands how military compensation translates to civilian financial
                  systems — and where the gaps create real problems for service members making major
                  decisions.
                </p>
                <p className="text-sm text-zinc-500 border-t border-zinc-100 pt-4">
                  MilPayTools is independently built and operated. It is not affiliated with or
                  endorsed by the Department of Defense, the Department of Veterans Affairs, or
                  any branch of the U.S. military.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="w-8 h-0.5 bg-red-700 rounded-full mb-5" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-8 tracking-tight">
            The mission
          </h2>

          <p className="text-base text-zinc-600 mb-8">
            Every calculator on this site follows three principles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PRINCIPLES.map(({ icon, heading, body }) => (
              <div
                key={heading}
                className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-none">
                  {icon}
                </div>
                <p className="text-sm font-bold text-zinc-900">{heading}</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <dt className="text-3xl font-extrabold text-red-700 tabular-nums">{value}</dt>
                <dd className="mt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

    </>
  );
}
