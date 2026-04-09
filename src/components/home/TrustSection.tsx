const TRUST_SIGNALS = [
  {
    icon: '📋',
    text: 'Official 2026 DoD pay tables, DTMO BAH rates, and VA compensation data',
  },
  {
    icon: '📍',
    text: '40,959 ZIP codes — every U.S. duty station covered',
  },
  {
    icon: '✓',
    text: 'Multi-source fact-checked for accuracy',
  },
  {
    icon: '🔒',
    text: 'No account required. No data collected. Runs in your browser.',
  },
];

export function TrustSection() {
  return (
    <section className="py-10 px-4 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Bio */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-6 h-0.5 bg-red-700" />
              <h2 className="text-2xl font-bold text-zinc-900">Why trust MilPayTools?</h2>
            </div>
            <p className="text-base text-zinc-600 leading-relaxed">
              Built by <span className="font-semibold text-zinc-800">Dan Stevens</span> — grew up on
              Air Force bases around the world as the son of a 20-year Air Force veteran. Now an
              NMLS-licensed mortgage industry professional building the financial tools he wished his
              family had.
            </p>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRUST_SIGNALS.map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <span className="text-lg flex-none mt-0.5">{icon}</span>
                <p className="text-sm text-zinc-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
