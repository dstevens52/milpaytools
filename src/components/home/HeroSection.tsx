import Link from 'next/link';

const CATEGORY_LINKS = [
  {
    label: 'Military Pay',
    href: '/calculators/total-compensation',
    icon: (
      <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'BAH by ZIP',
    href: '/calculators/bah',
    icon: (
      <svg className="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5zM8 18v-6h4v6" />
      </svg>
    ),
  },
  {
    label: 'VA Disability',
    href: '/calculators/va-disability',
    icon: (
      <svg className="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 2L3 5.5v5.5C3 14.6 6.1 17.9 10 19c3.9-1.1 7-4.4 7-8V5.5L10 2z" />
      </svg>
    ),
  },
  {
    label: 'TSP & Retirement',
    href: '/calculators/tsp',
    icon: (
      <svg className="w-4 h-4 flex-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 14l5-5 3 3 5-5 3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h5v5" />
      </svg>
    ),
  },
];

// A static preview card that shows what the calculator output looks like.
// This immediately communicates the product's value without a word of explanation.
function SampleResultPreview() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden">
      {/* Card header */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium">E-5 · 8 years · San Diego, CA</p>
          <p className="text-sm font-semibold text-zinc-800">Total Compensation Breakdown</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
          2026 rates
        </span>
      </div>

      {/* Rows */}
      <div className="px-5 py-1 divide-y divide-zinc-100">
        {[
          { label: 'Base Pay', value: '$4,299.90', sub: '/mo' },
          { label: 'BAH (w/ dependents)', value: '$3,975', sub: '/mo' },
          { label: 'BAS', value: '$476.95', sub: '/mo' },
          { label: 'TSP Match (BRS)', value: '$172', sub: '/mo' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-zinc-600">{label}</span>
            <span className="text-sm font-mono tabular-nums text-zinc-800">
              {value}
              <span className="text-zinc-400 font-normal">{sub}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mx-5 my-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Total Monthly</p>
          <p className="text-2xl font-bold tabular-nums text-red-700">$8,924</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Civilian equivalent</p>
          <p className="text-sm font-semibold text-zinc-700">≈ $113,500 / yr</p>
        </div>
      </div>

      {/* Action step teaser */}
      <div className="px-5 pb-4">
        <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5 flex gap-2 items-start">
          <span className="text-blue-600 text-base leading-tight">→</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            In some markets, BAH can exceed typical rent benchmarks — which can meaningfully change your housing math.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="flex items-start gap-2 mb-5">
              <span className="block flex-none w-6 h-0.5 bg-red-700 mt-2" />
              <span className="text-[10px] font-semibold text-red-700 uppercase tracking-normal leading-snug">
                Free · No Account · No Personal Info Required · Official 2026 DoD Data
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
              Stop guessing what your
              <br className="hidden lg:block" />
              <span className="text-red-700"> military pay and benefits</span>
              <br className="hidden lg:block" />
              {' '}are worth.
            </h1>

            <p className="text-lg text-zinc-600 leading-relaxed mb-6 max-w-lg">
              <strong className="text-zinc-900">Your service is worth more than base pay.</strong>{' '}
              Use free calculators to see your full military financial picture before you make
              your next big decision.
            </p>

            {/* Category buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              {CATEGORY_LINKS.map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <span className="text-red-700">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/calculators/total-compensation"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-red-700 px-6 py-3 text-base font-semibold text-white hover:bg-red-800 transition-colors shadow-sm"
              >
                Calculate My Total Compensation
              </Link>
              <Link
                href="/calculators"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-6 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Explore All Tools
              </Link>
            </div>

            {/* Trust line */}
            <div className="mt-5 flex items-center gap-1.5 text-xs text-zinc-400">
              <svg className="w-3.5 h-3.5 flex-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="4" y="9" width="12" height="9" rx="1.5" />
                <path strokeLinecap="round" d="M7 9V6.5a3 3 0 0 1 6 0V9" />
              </svg>
              <span>No sign-up. No personal info collected. Runs in your browser.</span>
            </div>
          </div>

          {/* Right — sample output */}
          <div className="lg:pl-4">
            <SampleResultPreview />
            <p className="mt-3 text-xs text-center text-zinc-400">
              What an E-5 in San Diego sees — your numbers update live as you enter inputs
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
