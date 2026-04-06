'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const calculatorLinks = [
  { href: '/calculators/total-compensation', label: 'Total Compensation' },
  { href: '/calculators/bah', label: 'BAH Calculator' },
  { href: '/calculators/va-disability', label: 'VA Disability' },
];

interface NavProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Nav({ mobile = false, onClose }: NavProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav aria-label="Mobile navigation">
        <ul className="flex flex-col">
          <li>
            <Link
              href="/"
              onClick={onClose}
              className={[
                'block px-4 py-3 text-base font-medium border-b border-slate-100',
                pathname === '/' ? 'text-gold' : 'text-slate-700 hover:text-navy',
              ].join(' ')}
            >
              Home
            </Link>
          </li>
          <li className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Calculators
            </p>
          </li>
          {calculatorLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={[
                  'block px-4 py-3 text-base border-b border-slate-100',
                  pathname === href ? 'text-gold font-semibold' : 'text-slate-700 hover:text-navy',
                ].join(' ')}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-1">
        {calculatorLinks.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'text-gold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
