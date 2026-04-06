const features = [
  {
    icon: '🎯',
    title: 'Official rate tables',
    body: 'Every calculation uses current DoD and VA rate tables — the same data your Finance office uses. Updated annually.',
  },
  {
    icon: '📖',
    title: 'Results in plain English',
    body: 'Numbers alone are useless. We tell you what your result means for your specific situation, from E-1 to O-6.',
  },
  {
    icon: '✅',
    title: 'Specific next steps',
    body: 'Every calculator ends with prioritized action steps — not generic advice, but decisions you can make this week.',
  },
  {
    icon: '🔒',
    title: 'No data collected',
    body: 'All calculations run in your browser. We never see your rank, pay, or location data. Zero accounts required.',
  },
];

export function ValueProp() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            Why MilPayTools?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            There are a dozen military pay calculators on the internet. Most just show you a number.
            We show you what to do with it.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <div className="text-3xl">{icon}</div>
              <h3 className="font-semibold text-navy text-base">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
