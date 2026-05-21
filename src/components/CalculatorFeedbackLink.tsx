'use client';

import { usePathname } from 'next/navigation';

const CALC_NAMES: Record<string, string> = {
  'total-compensation': 'Total Compensation Calculator',
  'bah': 'BAH Calculator',
  'va-disability': 'VA Disability Calculator',
  'tsp': 'TSP Growth Projector',
  'retirement': 'Military Retirement Calculator',
  'pcs': 'PCS Cost Estimator',
  'cola': 'CONUS COLA Calculator',
  'compare': 'Duty Station Comparison',
  'deployment': 'Deployment Pay Calculator',
  'pay-charts': 'Military Pay Charts',
  'guard-reserve': 'Guard & Reserve Pay Calculator',
  'dual-military-bah': 'Dual Military BAH Calculator',
  'transition-readiness': 'Transition Readiness Calculator',
  'healthcare-comparison': 'Healthcare Cost Comparison',
  'separation-timeline': 'Separation Benefits Timeline',
  'education': 'Education Benefits Calculator',
};

export function CalculatorFeedbackLink() {
  const pathname = usePathname();
  const key = pathname.split('/').pop() ?? '';
  const calcName = CALC_NAMES[key] ?? 'Calculator';
  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://www.milpaytools.com${pathname}`;
  const feedbackUrl = `/feedback?url=${encodeURIComponent(pageUrl)}&page=${encodeURIComponent(calcName)}`;

  return (
    <p className="text-xs text-zinc-400 mt-2">
      Does this result look off?{' '}
      <a
        href={feedbackUrl}
        className="text-zinc-500 hover:text-zinc-700 underline underline-offset-2 transition-colors"
      >
        Report a calculator issue →
      </a>
    </p>
  );
}
