interface CalcStep {
  title: string;
  sub?: string;
}

export function CalcStepStrip({ steps }: { steps: CalcStep[] }) {
  return (
    <div className="bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-0">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={[
                'flex items-start gap-3 flex-1',
                i > 0 ? 'sm:pl-6 sm:border-l sm:border-white/10' : '',
                i < steps.length - 1 ? 'sm:pr-6' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs flex-none mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{step.title}</p>
                {step.sub && <p className="text-xs text-white/50 mt-0.5">{step.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
