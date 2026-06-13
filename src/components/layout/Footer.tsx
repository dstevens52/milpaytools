import Link from 'next/link';
import { EmailSignup } from '@/components/EmailSignup';

const CALCULATORS = [
  { href: '/calculators/pay-charts', label: '2026 Pay Charts' },
  { href: '/calculators/total-compensation', label: 'Total Compensation' },
  { href: '/calculators/bah', label: 'BAH Calculator' },
  { href: '/calculators/va-disability', label: 'VA Disability Rating' },
  { href: '/calculators/va-loan', label: 'VA Loan Payment' },
  { href: '/calculators/tsp', label: 'TSP Growth Projector' },
  { href: '/calculators/retirement', label: 'Retirement Calculator' },
  { href: '/calculators/guard-reserve', label: 'Guard & Reserve Pay' },
  { href: '/calculators/cola', label: 'CONUS COLA' },
  { href: '/calculators/education', label: 'Education Benefits' },
];

const GUIDES = [
  { href: '/guides/va-home-loans', label: 'VA Home Loans Guide' },
  { href: '/guides/military-pay', label: 'Military Pay Guide' },
  { href: '/guides/va-disability', label: 'VA Disability Guide' },
  { href: '/guides/retirement-tsp', label: 'Retirement & TSP Guide' },
  { href: '/guides/pcs', label: 'PCS & Duty Station Guide' },
];

const RESOURCES = [
  { href: '/blog', label: 'Blog' },
  { href: '/bah', label: 'BAH by Station' },
  { href: '/pay', label: 'Pay by Rank' },
  { href: '/partners', label: 'For Partners' },
];

const DATA_SOURCES = [
  { href: 'https://www.dfas.mil/militarymembers/payentitlements/', label: '2026 Military Pay Tables (DFAS)' },
  { href: 'https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/', label: 'BAH Rates (DTMO)' },
  { href: 'https://www.benefits.va.gov/compensation/', label: 'VA Compensation (VA.gov)' },
  { href: 'https://www.tsp.gov/', label: 'TSP Limits (TSP.gov/IRS)' },
];

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Calculators */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Calculators
            </p>
            <ul className="space-y-2">
              {CALCULATORS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/calculators" className="text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                  View all calculators →
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Guides
            </p>
            <ul className="space-y-2">
              {GUIDES.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/guides" className="text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                  View all guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Resources
            </p>
            <ul className="space-y-2">
              {RESOURCES.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Data Sources
            </p>
            <ul className="space-y-2">
              {DATA_SOURCES.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              About
            </p>
            <p className="text-sm leading-relaxed mb-3">
              Built by Dan Stevens (NMLS-licensed) and Lt. Col. Ryan Durand, USAF/USSF (Ret.).
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                  Why We Built This →
                </Link>
              </li>
              <li>
                <Link href="/llms.txt" className="text-sm hover:text-white transition-colors">
                  llms.txt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 mb-8">
          <EmailSignup
            variant="inline"
            darkBg
            headline="Get notified when 2027 military pay data is updated"
            subtext="Updates when pay tables, BAH rates, or tools change. No spam."
            source="footer"
          />
        </div>

        <div className="border-t border-zinc-800 pt-6 space-y-3 text-xs">
          <p className="text-zinc-500 leading-relaxed">
            MilPayTools provides educational information only — not financial, tax, or legal advice.
            All calculations are estimates. Verify figures with official DoD and VA sources.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-zinc-500">
              &copy; 2026 DPS Digital LLC. All rights reserved. Not affiliated with the DoD, VA, or
              any government agency.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/partners" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                For Partners
              </Link>
              <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                Privacy Policy
              </Link>
              <a
                href="mailto:dan@milpaytools.com"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
