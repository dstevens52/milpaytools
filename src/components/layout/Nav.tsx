'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Flagship links — always visible as direct top-level items
const FLAGSHIP_LINKS = [
  { href: '/calculators/total-compensation', label: 'Total Compensation' },
  { href: '/calculators/bah', label: 'BAH Calculator' },
];

// Grouped dropdown categories (desktop) / expanded sections (mobile)
const DROPDOWN_GROUPS = [
  {
    label: 'Pay & Allowances',
    links: [
      { href: '/calculators/cola', label: 'CONUS COLA' },
      { href: '/calculators/guard-reserve', label: 'Guard/Reserve Pay' },
    ],
  },
  {
    label: 'Retirement & Savings',
    links: [
      { href: '/calculators/tsp', label: 'TSP Projector' },
      { href: '/calculators/retirement', label: 'Retirement Calculator' },
    ],
  },
  {
    label: 'Veterans',
    links: [
      { href: '/calculators/va-disability', label: 'VA Disability Rating' },
      { href: '/calculators/education', label: 'Education Benefits' },
    ],
  },
  {
    label: 'PCS & Transition',
    links: [{ href: '/calculators/pcs', label: 'PCS Cost Estimator' }],
  },
];

// All dropdown links flattened — used to check if any is active
const ALL_DROPDOWN_LINKS = DROPDOWN_GROUPS.flatMap((g) => g.links);

// ─── Desktop dropdown ────────────────────────────────────────────────────────

function CalculatorsDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const isActive = ALL_DROPDOWN_LINKS.some((l) => pathname === l.href);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors select-none',
          isActive || open
            ? 'text-red-700 bg-red-50'
            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
        ].join(' ')}
      >
        Calculators
        <svg
          className={['w-3 h-3 transition-transform duration-150', open ? 'rotate-180' : ''].join(' ')}
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 3.5 5 7 8.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="py-1.5">
            {DROPDOWN_GROUPS.map((group, i) => (
              <div key={group.label}>
                {i > 0 && <div className="my-1 mx-3 border-t border-zinc-100" />}
                <p className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {group.label}
                </p>
                {group.links.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={close}
                    className={[
                      'block px-3 py-1.5 text-sm transition-colors',
                      pathname === href
                        ? 'text-red-700 font-semibold bg-red-50'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav component ────────────────────────────────────────────────────────────

interface NavProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Nav({ mobile = false, onClose }: NavProps) {
  const pathname = usePathname();

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (mobile) {
    return (
      <nav aria-label="Mobile navigation">
        <ul className="flex flex-col">
          {/* Flagship links */}
          {FLAGSHIP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={[
                  'block px-4 py-3 text-base font-medium border-b border-zinc-100',
                  pathname === href ? 'text-red-700' : 'text-zinc-800 hover:text-zinc-900',
                ].join(' ')}
              >
                {label}
              </Link>
            </li>
          ))}

          {/* "More Calculators" section divider */}
          <li className="px-4 pt-4 pb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              More Calculators
            </p>
          </li>

          {/* Grouped categories */}
          {DROPDOWN_GROUPS.map((group) => (
            <li key={group.label}>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {group.label}
              </p>
              <ul>
                {group.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={[
                        'block px-6 py-2.5 text-sm border-b border-zinc-100',
                        pathname === href
                          ? 'text-red-700 font-semibold'
                          : 'text-zinc-700 hover:text-zinc-900',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}

          {/* Blog */}
          <li className="border-t border-zinc-100 mt-1">
            <Link
              href="/blog"
              onClick={onClose}
              className={[
                'block px-4 py-3 text-base font-medium border-b border-zinc-100',
                pathname.startsWith('/blog') ? 'text-red-700' : 'text-zinc-800 hover:text-zinc-900',
              ].join(' ')}
            >
              Blog
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-0.5">
        {/* Flagship direct links */}
        {FLAGSHIP_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'text-red-700 bg-red-50'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
              ].join(' ')}
            >
              {label}
            </Link>
          </li>
        ))}

        {/* Calculators dropdown */}
        <li>
          <CalculatorsDropdown pathname={pathname} />
        </li>

        {/* Blog — separated by a hairline */}
        <li className="ml-1 pl-1 border-l border-zinc-200">
          <Link
            href="/blog"
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith('/blog')
                ? 'text-red-700 bg-red-50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
            ].join(' ')}
          >
            Blog
          </Link>
        </li>
      </ul>
    </nav>
  );
}
