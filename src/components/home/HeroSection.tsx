import Link from 'next/link';

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
          { label: 'Base Pay', value: '$3,263', sub: '/mo' },
          { label: 'BAH (w/ dependents)', value: '$3,312', sub: '/mo' },
          { label: 'BAS', value: '$476', sub: '/mo' },
          { label: 'TSP Match (BRS)', value: '$131', sub: '/mo' },
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
          <p className="text-2xl font-bold tabular-nums text-red-700">$7,182</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Civilian equivalent</p>
          <p className="text-sm font-semibold text-zinc-700">≈ $96,400 / yr</p>
        </div>
      </div>

      {/* Action step teaser */}
      <div className="px-5 pb-4">
        <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5 flex gap-2 items-start">
          <span className="text-blue-600 text-base leading-tight">→</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Your BAH covers rent by $612/mo.</span> That gap could fund a down payment in 18 months.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="block w-6 h-0.5 bg-red-700" />
              <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
                Free · Official 2026 rates
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-zinc-900 mb-5">
              Know the full value
              <br />
              <span className="text-red-700">of your service.</span>
            </h1>

            <p className="text-lg text-zinc-600 leading-relaxed mb-8 max-w-lg">
              Most pay calculators show you a number. MilPayTools shows you what that number
              means — and exactly what to do about it.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                'E-1 through O-10',
                'All 6 branches',
                'BAH by ZIP code',
                'VA combined ratings',
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-zinc-600 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/calculators"
                className="inline-flex items-center justify-center rounded-md bg-red-700 px-6 py-3 text-base font-semibold text-white hover:bg-red-800 transition-colors shadow-sm"
              >
                Explore All Tools
              </Link>
              <Link
                href="/calculators/va-disability"
                className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-6 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                VA disability rating
              </Link>
            </div>

            <p className="mt-5 text-xs text-zinc-400">
              No account. No data stored. All calculations run in your browser.
            </p>
          </div>

          {/* Right — sample output */}
          <div className="lg:pl-4">
            <SampleResultPreview />
            <p className="mt-3 text-xs text-center text-zinc-400">
              Sample output — your numbers update live as you enter inputs
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
