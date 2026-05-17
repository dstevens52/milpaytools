'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'all' | 'pay' | 'pcs' | 'transition' | 'benefits';

const PILLS: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pay', label: 'Pay & Compensation' },
  { id: 'pcs', label: 'PCS & Housing' },
  { id: 'transition', label: 'Transition' },
  { id: 'benefits', label: 'Benefits & Retirement' },
];

interface CalcCard {
  href: string;
  name: string;
  description: string;
  iconBg: string;
  categories: Category[];
  icon: React.ReactNode;
}

const CALCULATORS: CalcCard[] = [
  {
    href: '/calculators/total-compensation',
    name: 'Total Compensation',
    description: 'See your full pay and benefits package — not just base pay.',
    iconBg: 'bg-red-700',
    categories: ['pay'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: '/calculators/bah',
    name: 'BAH by ZIP',
    description: 'Find your housing allowance by ZIP code or installation.',
    iconBg: 'bg-blue-800',
    categories: ['pcs'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10" />
      </svg>
    ),
  },
  {
    href: '/calculators/transition-readiness',
    name: 'Transition Readiness',
    description: 'Compare your military compensation to post-service income and expenses.',
    iconBg: 'bg-emerald-600',
    categories: ['transition'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  },
  {
    href: '/calculators/va-disability',
    name: 'VA Disability',
    description: 'Estimate your VA disability compensation and combined rating.',
    iconBg: 'bg-purple-700',
    categories: ['benefits'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: '/calculators/pcs',
    name: 'PCS Cost Estimator',
    description: 'Estimate moving costs and reimbursements for your next PCS.',
    iconBg: 'bg-teal-600',
    categories: ['pcs'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m-4 11h10a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H12a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1zm3-5a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm-7 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
      </svg>
    ),
  },
  {
    href: '/calculators/compare',
    name: 'Duty Station Comparison',
    description: 'Compare locations, BAH, costs, and financial tradeoffs.',
    iconBg: 'bg-orange-500',
    categories: ['pcs'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/calculators/retirement',
    name: 'Retirement Calculator',
    description: 'Project military retirement pay and long-term value.',
    iconBg: 'bg-slate-800',
    categories: ['benefits'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    href: '/calculators/healthcare-comparison',
    name: 'Healthcare Cost Comparison',
    description: 'Compare TRICARE to civilian healthcare — employer, marketplace, VA, and TRS.',
    iconBg: 'bg-blue-700',
    categories: ['transition'],
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v8M8 12h8" />
      </svg>
    ),
  },
];

export function FilterableCalculatorGrid() {
  const [active, setActive] = useState<Category>('all');

  const visible = CALCULATORS.filter(
    (c) => active === 'all' || c.categories.includes(active),
  );

  return (
    <>
      {/* Filter pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 mb-8 sm:overflow-visible sm:flex-wrap sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Filter calculators by category"
      >
        {PILLS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            aria-pressed={active === id}
            className={[
              'rounded-full px-5 py-2 text-[13px] font-medium whitespace-nowrap flex-none transition-colors duration-150',
              active === id
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Calculator cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {visible.map(({ href, name, description, icon, iconBg }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-200 border-l-[3px] border-l-red-200 bg-white hover:border-zinc-300 hover:border-l-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center text-white flex-none shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-zinc-900 group-hover:text-red-700 transition-colors duration-200 leading-snug mb-0.5">
                {name}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed truncate">{description}</p>
            </div>
            <svg
              className="w-4 h-4 text-zinc-300 flex-none shrink-0 group-hover:text-red-400 transition-colors duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </>
  );
}
