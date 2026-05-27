'use client';

import { useState } from 'react';
import Link from 'next/link';

const EXTRA_CALCULATORS = [
  {
    href: '/calculators/transition-readiness',
    title: 'Transition Readiness',
    description: 'Compare your military compensation to post-service income and expenses.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/compare',
    title: 'Compare Your PCS Move',
    description: 'Compare BAH, COLA, state tax, and take-home between current and new station.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/retirement',
    title: 'Retirement Calculator',
    description: 'Project military retirement pay — High-3 or BRS — with COLA and TSP.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 10.5c-2.291 0-4.545-.16-6.75-.47V21M3 21h18" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/healthcare-comparison',
    title: 'Healthcare Cost Comparison',
    description: 'Compare TRICARE to civilian healthcare plans — employer, marketplace, and VA.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/tsp',
    title: 'TSP Growth Projector',
    description: 'Project your TSP balance with BRS matching and Roth vs. Traditional comparison.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/guard-reserve',
    title: 'Guard / Reserve Pay',
    description: 'Drill pay, Annual Training, Tricare Reserve Select, and BRS matching.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/education',
    title: 'Education Benefits',
    description: 'Compare GI Bill, tuition assistance, and education benefits by situation.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/cola',
    title: 'CONUS COLA',
    description: 'Check if your duty station qualifies for COLA and estimate the monthly amount.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/deployment',
    title: 'Deployment Pay',
    description: 'Tax-free pay, HFP/IDP, CZTE savings, and SDP interest — full deployment picture.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/pay-charts',
    title: 'Pay Charts',
    description: 'Look up 2026 base pay by rank and years of service.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/dual-military-bah',
    title: 'Dual Military BAH',
    description: 'BAH for dual-military couples at the same or different installations.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      </div>
    ),
  },
  {
    href: '/calculators/separation-timeline',
    title: 'Separation Benefits Timeline',
    description: 'Map out your separation benefits, deadlines, and entitlements before ETS.',
    icon: (
      <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      </div>
    ),
  },
];

export function ExpandableCalcGrid() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Extra 12 — smooth height expand */}
      <div
        style={{
          maxHeight: expanded ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-1">
          {EXTRA_CALCULATORS.map(({ href, title, description, icon }) => (
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
      </div>

      {/* Toggle link */}
      <p className="text-center mt-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          {expanded ? 'Show fewer ↑' : 'View all 16 calculators →'}
        </button>
      </p>
    </>
  );
}
