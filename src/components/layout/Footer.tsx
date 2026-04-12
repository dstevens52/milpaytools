import Link from 'next/link';

const CALCULATORS = [
  { href: '/calculators/total-compensation', label: 'Total Compensation' },
  { href: '/calculators/bah', label: 'BAH Calculator' },
  { href: '/calculators/va-disability', label: 'VA Disability Rating' },
  { href: '/calculators/tsp', label: 'TSP Growth Projector' },
];

const TOP_POSTS = [
  { href: '/blog/how-much-does-an-e5-really-make-2026', label: 'How Much Does an E-5 Really Make?' },
  { href: '/blog/va-disability-math-explained', label: 'VA Disability Math Explained' },
  { href: '/blog/bah-rates-2026-complete-guide', label: '2026 BAH Rates Complete Guide' },
  { href: '/blog/brs-vs-high-3-retirement', label: 'BRS vs High-3 Retirement' },
];

const GUIDES = [
  { href: '/guides/military-pay', label: 'Military Pay Guide' },
  { href: '/guides/va-disability', label: 'VA Disability Guide' },
  { href: '/guides/retirement-tsp', label: 'Retirement & TSP Guide' },
  { href: '/guides/pcs', label: 'PCS & Duty Station Guide' },
  { href: '/guides/education-benefits', label: 'Education Benefits Guide' },
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
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Resources
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              {TOP_POSTS.map(({ href, label }) => (
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
              Built by Dan Stevens — NMLS-licensed mortgage professional and son of a 20-year Air Force veteran.
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://varefinance.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  VARefinance.com
                </a>
              </li>
              <li>
                <Link href="/llms.txt" className="text-sm hover:text-white transition-colors">
                  llms.txt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <p>
            &copy; 2026 MilPayTools. Not affiliated with the DoD, VA, or any government agency. For
            educational purposes only.
          </p>
          <p className="text-zinc-500">Verify all figures with official DoD and VA sources.</p>
        </div>
      </div>
    </footer>
  );
}
