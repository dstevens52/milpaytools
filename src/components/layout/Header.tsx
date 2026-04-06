'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from './Nav';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="MilPayTools home">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gold group-hover:bg-gold-dark transition-colors">
              <span className="text-navy font-black text-sm leading-none">$</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              MilPay<span className="text-gold">Tools</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Nav />
            <Link
              href="/calculators/total-compensation"
              className="rounded-md bg-gold px-4 py-1.5 text-sm font-semibold text-navy hover:bg-gold-dark transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden bg-white border-t border-navy/20 shadow-lg">
          <Nav mobile onClose={() => setMobileOpen(false)} />
          <div className="p-4 border-t border-slate-100">
            <Link
              href="/calculators/total-compensation"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center rounded-md bg-gold px-4 py-2.5 text-base font-semibold text-navy hover:bg-gold-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
