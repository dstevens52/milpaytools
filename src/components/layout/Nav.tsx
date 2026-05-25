'use client';

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CALCULATOR_GROUPS = [
  {
    label: 'Top Calculators',
    links: [
      { href: '/calculators/total-compensation', label: 'Total Military Compensation', featured: true },
      { href: '/calculators/bah', label: 'BAH Calculator', featured: true },
      { href: '/calculators/va-disability', label: 'VA Disability Rating', featured: true },
      { href: '/bah', label: 'BAH by Duty Station' },
      { href: '/calculators/compare', label: 'Compare Your PCS Move' },
      { href: '/calculators/pcs', label: 'PCS Cost Estimator' },
      { href: '/calculators/tsp', label: 'TSP Growth Projector' },
      { href: '/calculators/deployment', label: 'Deployment Pay' },
    ],
  },
  {
    label: 'More Calculators',
    links: [
      { href: '/calculators/cola', label: 'CONUS COLA' },
      { href: '/calculators/guard-reserve', label: 'Guard/Reserve Pay' },
      { href: '/calculators/dual-military-bah', label: 'Dual Military BAH' },
      { href: '/calculators/retirement', label: 'Retirement Calculator' },
      { href: '/calculators/healthcare-comparison', label: 'Healthcare Comparison' },
      { href: '/calculators/separation-timeline', label: 'Separation Timeline' },
      { href: '/calculators/transition-readiness', label: 'Transition Readiness' },
      { href: '/calculators/education', label: 'Education Benefits' },
      { href: '/calculators/pay-charts', label: 'Pay Charts' },
    ],
  },
];

const GUIDES_JOURNEY = [
  { href: '/guides/starting-service', label: 'Starting Service' },
  { href: '/guides/navigating-service', label: 'Navigating Service' },
];

const GUIDES_TOPICS = [
  { href: '/guides/military-pay', label: 'Military Pay Guide' },
  { href: '/guides/pcs', label: 'PCS & Duty Station Guide' },
  { href: '/guides/retirement-tsp', label: 'Retirement & TSP Guide' },
  { href: '/guides/va-disability', label: 'VA Disability Guide' },
  { href: '/guides/education-benefits', label: 'Education Benefits Guide' },
  { href: '/transition', label: 'Military Transition Roadmap' },
];

const GUIDES_LINKS = [...GUIDES_JOURNEY, ...GUIDES_TOPICS];

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
          'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors select-none text-red-700',
          open ? 'bg-red-100' : 'bg-red-50 hover:bg-red-100',
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
            {CALCULATOR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-4 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {group.label}
                </p>
                {group.links.map(({ href, label, featured }, index) => (
                  <Fragment key={href}>
                    {!featured && index > 0 && group.links[index - 1].featured && (
                      <div className="mx-3 my-1 border-t border-zinc-200" />
                    )}
                    <Link
                      href={href}
                      role="menuitem"
                      onClick={close}
                      className={[
                        'block px-4 py-1.5 text-sm transition-colors',
                        pathname === href
                          ? 'text-red-700 font-semibold bg-red-50'
                          : featured
                            ? 'text-zinc-800 font-medium hover:text-zinc-900 hover:bg-zinc-50'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Guides dropdown ──────────────────────────────────────────────────────────

function GuidesDropdown({ pathname }: { pathname: string }) {
  const { open, setOpen, containerRef, cancelClose, scheduleClose, close } = useDropdown();
  const isActive = GUIDES_LINKS.some((l) => pathname === l.href || (l.href === '/transition' && pathname.startsWith('/transition')));

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
          className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="py-1.5">
            {GUIDES_JOURNEY.map(({ href, label }) => (
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
            <div className="my-1.5 mx-3 border-t border-zinc-100" />
            {GUIDES_TOPICS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={close}
                className={[
                  'block px-3 py-1.5 text-sm transition-colors',
                  pathname === href || (href === '/transition' && pathname.startsWith('/transition'))
                    ? 'text-red-700 font-semibold bg-red-50'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50',
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
    return (
      <nav aria-label="Mobile navigation">
        <ul className="flex flex-col">

          {/* Who made this */}
          <li>
            <Link
              href="/about"
              onClick={onClose}
              className={[
                'block px-4 py-3 text-base font-medium border-b border-zinc-100',
                pathname === '/about' ? 'text-zinc-900' : 'text-zinc-800 hover:text-zinc-900',
              ].join(' ')}
            >
              Who made this
            </Link>
          </li>

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
                      {group.links.map(({ href, label, featured }, index) => (
                        <Fragment key={href}>
                          {!featured && index > 0 && group.links[index - 1].featured && (
                            <div className="mx-4 my-1 border-t border-zinc-200" />
                          )}
                          <li>
                            <Link
                              href={href}
                              onClick={onClose}
                              className={[
                                'block px-6 py-2.5 text-sm border-b border-zinc-100 last:border-0',
                                pathname === href
                                  ? 'text-red-700 font-semibold'
                                  : featured
                                  ? 'text-zinc-800 font-medium'
                                  : 'text-zinc-600',
                              ].join(' ')}
                            >
                              {label}
                            </Link>
                          </li>
                        </Fragment>
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
                        pathname === href || (href === '/transition' && pathname.startsWith('/transition'))
                          ? 'text-red-700 font-semibold'
                          : 'text-zinc-700',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Blog */}
          <li>
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

          {/* Got feedback? — warm muted, positioned at bottom of menu */}
          <li>
            <Link
              href="/feedback"
              onClick={onClose}
              className={[
                'block px-4 py-3 text-sm font-medium border-b border-zinc-100',
                pathname === '/feedback' ? 'text-stone-700' : 'text-stone-500 hover:text-stone-700',
              ].join(' ')}
            >
              Got feedback?
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
        <li>
          <Link
            href="/feedback"
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname === '/feedback' ? 'text-stone-700 bg-stone-100' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50',
            ].join(' ')}
          >
            Got feedback?
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              pathname === '/about' ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
            ].join(' ')}
          >
            Who made this
          </Link>
        </li>
        <li>
          <CalculatorsDropdown pathname={pathname} />
        </li>
        <li>
          <GuidesDropdown pathname={pathname} />
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
      </ul>
    </nav>
  );
}
