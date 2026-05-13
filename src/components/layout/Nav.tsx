'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CALCULATOR_GROUPS = [
  {
    label: 'Pay & Compensation',
    links: [
      { href: '/calculators/total-compensation', label: 'Total Military Compensation' },
      { href: '/calculators/pay-charts', label: '2026 Pay Charts' },
      { href: '/calculators/bah', label: 'BAH Calculator' },
      { href: '/calculators/cola', label: 'CONUS COLA' },
      { href: '/calculators/guard-reserve', label: 'Guard/Reserve Pay' },
      { href: '/calculators/deployment', label: 'Deployment Pay' },
    ],
  },
  {
    label: 'Planning & Comparison',
    links: [
      { href: '/calculators/compare', label: 'Duty Station Comparison' },
      { href: '/calculators/pcs', label: 'PCS Cost Estimator' },
      { href: '/calculators/dual-military-bah', label: 'Dual Military BAH' },
    ],
  },
  {
    label: 'Benefits & Retirement',
    links: [
      { href: '/calculators/va-disability', label: 'VA Disability Rating' },
      { href: '/calculators/retirement', label: 'Military Retirement' },
      { href: '/calculators/tsp', label: 'TSP Growth Projector' },
      { href: '/calculators/education', label: 'Education Benefits' },
      { href: '/calculators/transition-readiness', label: 'Transition Readiness' },
      { href: '/calculators/separation-timeline', label: 'Separation Timeline' },
    ],
  },
];

const GUIDES_LINKS = [
  { href: '/guides/military-pay', label: 'Military Pay & Compensation' },
  { href: '/guides/pcs', label: 'PCS & Duty Station' },
  { href: '/guides/va-disability', label: 'VA Disability Benefits' },
  { href: '/guides/retirement-tsp', label: 'Retirement & TSP' },
  { href: '/guides/education-benefits', label: 'Education Benefits' },
  { href: '/bah', label: 'BAH by Duty Station' },
];

const ALL_CALCULATOR_LINKS = CALCULATOR_GROUPS.flatMap((g) => g.links);

const CHEVRON = (
  <svg viewBox="0 0 10 10" fill="none" aria-hidden="true" className="w-3 h-3 transition-transform duration-150">
    <path d="M1.5 3.5 5 7 8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Shared dropdown hook ─────────────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 175);
  }, [cancelClose]);

  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    if (!open) return;
    function onMouse(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onMouse);
    return () => document.removeEventListener('mousedown', onMouse);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return { open, setOpen, containerRef, cancelClose, scheduleClose, close };
}

// ─── Calculators dropdown (2-column) ─────────────────────────────────────────

function CalculatorsDropdown({ pathname }: { pathname: string }) {
  const { open, setOpen, containerRef, cancelClose, scheduleClose, close } = useDropdown();
  const isActive = ALL_CALCULATOR_LINKS.some((l) => pathname === l.href);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors select-none',
          isActive || open ? 'text-red-700 bg-red-50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
        ].join(' ')}
      >
        Calculators
        <span className={open ? '[&>svg]:rotate-180' : ''}>{CHEVRON}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 w-[480px] bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="grid grid-cols-2 divide-x divide-zinc-100 py-2">
            {/* Left: Pay & Compensation */}
            <div>
              <p className="px-4 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {CALCULATOR_GROUPS[0].label}
              </p>
              {CALCULATOR_GROUPS[0].links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={close}
                  className={[
                    'block px-4 py-1.5 text-sm transition-colors',
                    pathname === href ? 'text-red-700 font-semibold bg-red-50' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right: Planning & Comparison + Benefits & Retirement */}
            <div>
              <p className="px-4 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {CALCULATOR_GROUPS[1].label}
              </p>
              {CALCULATOR_GROUPS[1].links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={close}
                  className={[
                    'block px-4 py-1.5 text-sm transition-colors',
                    pathname === href ? 'text-red-700 font-semibold bg-red-50' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
              <div className="my-2 mx-4 border-t border-zinc-100" />
              <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {CALCULATOR_GROUPS[2].label}
              </p>
              {CALCULATOR_GROUPS[2].links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={close}
                  className={[
                    'block px-4 py-1.5 text-sm transition-colors',
                    pathname === href ? 'text-red-700 font-semibold bg-red-50' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Guides dropdown ──────────────────────────────────────────────────────────

function GuidesDropdown({ pathname }: { pathname: string }) {
  const { open, setOpen, containerRef, cancelClose, scheduleClose, close } = useDropdown();
  const isActive = GUIDES_LINKS.some((l) => pathname === l.href);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors select-none',
          isActive || open ? 'text-red-700 bg-red-50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
        ].join(' ')}
      >
        Guides
        <span className={open ? '[&>svg]:rotate-180' : ''}>{CHEVRON}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="py-1.5">
            {GUIDES_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={close}
                className={[
                  'block px-3 py-1.5 text-sm transition-colors',
                  pathname === href ? 'text-red-700 font-semibold bg-red-50' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
                ].join(' ')}
              >
                {label}
              </Link>
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
  const [calcOpen, setCalcOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (mobile) {
    const standaloneLinks = [
      { href: '/transition', label: 'Transition', active: pathname.startsWith('/transition') },
      { href: '/blog', label: 'Blog', active: pathname.startsWith('/blog') },
      { href: '/about', label: 'About', active: pathname === '/about' },
    ];

    return (
      <nav aria-label="Mobile navigation">
        <ul className="flex flex-col">

          {/* Calculators accordion */}
          <li>
            <button
              onClick={() => setCalcOpen((o) => !o)}
              className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold border-b border-zinc-100 text-zinc-800"
              aria-expanded={calcOpen}
            >
              Calculators
              <svg
                className={['w-4 h-4 text-zinc-400 transition-transform duration-150', calcOpen ? 'rotate-180' : ''].join(' ')}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {calcOpen && (
              <ul className="bg-zinc-50 border-b border-zinc-100">
                {CALCULATOR_GROUPS.map((group, i) => (
                  <li key={group.label}>
                    {i > 0 && <div className="mx-4 border-t border-zinc-200" />}
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {group.label}
                    </p>
                    <ul>
                      {group.links.map(({ href, label }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={onClose}
                            className={[
                              'block px-6 py-2.5 text-sm border-b border-zinc-100 last:border-0',
                              pathname === href ? 'text-red-700 font-semibold' : 'text-zinc-700',
                            ].join(' ')}
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Guides accordion */}
          <li>
            <button
              onClick={() => setGuidesOpen((o) => !o)}
              className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold border-b border-zinc-100 text-zinc-800"
              aria-expanded={guidesOpen}
            >
              Guides
              <svg
                className={['w-4 h-4 text-zinc-400 transition-transform duration-150', guidesOpen ? 'rotate-180' : ''].join(' ')}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {guidesOpen && (
              <ul className="bg-zinc-50 border-b border-zinc-100">
                {GUIDES_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={[
                        'block px-6 py-2.5 text-sm border-b border-zinc-100 last:border-0',
                        pathname === href ? 'text-red-700 font-semibold' : 'text-zinc-700',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Standalone links */}
          {standaloneLinks.map(({ href, label, active }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={[
                  'block px-4 py-3 text-base font-medium border-b border-zinc-100',
                  active ? 'text-red-700' : 'text-zinc-800 hover:text-zinc-900',
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

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-0.5">
        <li>
          <CalculatorsDropdown pathname={pathname} />
        </li>
        <li>
          <GuidesDropdown pathname={pathname} />
        </li>
        <li>
          <Link
            href="/transition"
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith('/transition') ? 'text-red-700 bg-red-50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
            ].join(' ')}
          >
            Transition
          </Link>
        </li>
        <li>
          <Link
            href="/blog"
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith('/blog') ? 'text-red-700 bg-red-50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
            ].join(' ')}
          >
            Blog
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname === '/about' ? 'text-red-700 bg-red-50' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
            ].join(' ')}
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}
