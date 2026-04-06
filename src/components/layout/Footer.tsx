import Link from 'next/link';

const calculators = [
  { href: '/calculators/total-compensation', label: 'Total Compensation' },
  { href: '/calculators/bah', label: 'BAH Calculator' },
  { href: '/calculators/va-disability', label: 'VA Disability' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-slate-400 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="text-white font-bold text-lg mb-2">
              MilPay<span className="text-gold">Tools</span>
            </p>
            <p className="text-sm leading-relaxed">
              Decision tools for service members and veterans. Accurate math, clear answers, actionable
              guidance.
            </p>
          </div>

          {/* Calculators */}
          <div>
            <p className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Calculators
            </p>
            <ul className="space-y-2">
              {calculators.map(({ href, label }) => (
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
              Official Resources
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.dfas.mil/militarymembers/payentitlements/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  DFAS Pay Entitlements
                </a>
              </li>
              <li>
                <a
                  href="https://www.benefits.va.gov/compensation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  VA Compensation
                </a>
              </li>
              <li>
                <a
                  href="https://www.tsp.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Thrift Savings Plan
                </a>
              </li>
              <li>
                <a
                  href="https://myarmybenefits.us.army.mil/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  MyArmyBenefits
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <p>&copy; {year} MilPayTools. Not affiliated with the DoD, VA, or any government agency.</p>
          <p className="text-slate-500">
            Rates based on official DoD/VA tables. Verify with your Finance Office.
          </p>
        </div>
      </div>
    </footer>
  );
}
