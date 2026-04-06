const features = [
  {
    icon: '📊',
    title: 'Official rate tables',
    body: 'Every calculation pulls from current DoD and VA rate tables. Same source your Finance office uses. Updated every January.',
  },
  {
    icon: '📝',
    title: 'Plain-English results',
    body: "Numbers without context are noise. We tell you what your result actually means for your situation — from E-1 to O-6.",
  },
  {
    icon: '✅',
    title: 'Specific next steps',
    body: 'Every calculator ends with prioritized action steps you can take this week, not generic "talk to a financial advisor" filler.',
  },
  {
    icon: '🔒',
    title: 'Nothing collected',
    body: 'All math runs in your browser. We never see your rank, pay grade, or location. Zero sign-up required.',
  },
];

export function ValueProp() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-10">
          <span className="block w-6 h-0.5 bg-red-700" />
          <h2 className="text-2xl font-bold text-zinc-900">Why MilPayTools?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="text-2xl">{icon}</div>
              <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Inline trust signal */}
        <div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900 mb-1">
              Not affiliated with the government — just built for the people who serve in it.
            </p>
            <p className="text-sm text-zinc-500">
              MilPayTools is an independent tool. All rate data is sourced from official DoD and VA
              publications. Always verify pay and benefits with your unit Finance office or
              MyPay account.
            </p>
          </div>
          <div className="flex-none text-3xl">🎗️</div>
        </div>
      </div>
    </section>
  );
}
