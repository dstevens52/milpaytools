'use client';

import { useState } from 'react';
import Link from 'next/link';

const EXTRA_CALCULATORS = [
  { href: '/calculators/transition-readiness', title: 'Transition Readiness', description: 'Compare your military compensation to post-service income and expenses.', icon: '🚀' },
  { href: '/calculators/compare', title: 'Compare Your PCS Move', description: 'Compare BAH, COLA, state tax, and take-home between current and new station.', icon: '⚖️' },
  { href: '/calculators/retirement', title: 'Retirement Calculator', description: 'Project military retirement pay — High-3 or BRS — with COLA and TSP.', icon: '🏦' },
  { href: '/calculators/healthcare-comparison', title: 'Healthcare Cost Comparison', description: 'Compare TRICARE to civilian healthcare plans — employer, marketplace, and VA.', icon: '🏥' },
  { href: '/calculators/tsp', title: 'TSP Growth Projector', description: 'Project your TSP balance with BRS matching and Roth vs. Traditional comparison.', icon: '📈' },
  { href: '/calculators/guard-reserve', title: 'Guard / Reserve Pay', description: 'Drill pay, Annual Training, Tricare Reserve Select, and BRS matching.', icon: '⭐' },
  { href: '/calculators/education', title: 'Education Benefits', description: 'Compare GI Bill, tuition assistance, and education benefits by situation.', icon: '🎓' },
  { href: '/calculators/cola', title: 'CONUS COLA', description: 'Check if your duty station qualifies for COLA and estimate the monthly amount.', icon: '📊' },
  { href: '/calculators/deployment', title: 'Deployment Pay', description: 'Tax-free pay, HFP/IDP, CZTE savings, and SDP interest — full deployment picture.', icon: '🪖' },
  { href: '/calculators/pay-charts', title: 'Pay Charts', description: 'Look up 2026 base pay by rank and years of service.', icon: '📋' },
  { href: '/calculators/dual-military-bah', title: 'Dual Military BAH', description: 'BAH for dual-military couples at the same or different installations.', icon: '👫' },
  { href: '/calculators/separation-timeline', title: 'Separation Benefits Timeline', description: 'Map out your separation benefits, deadlines, and entitlements before ETS.', icon: '📅' },
] as const;

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
              <span className="text-2xl mb-3">{icon}</span>
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
