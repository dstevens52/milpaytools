import { Fragment } from 'react';

interface CalcStep {
  title: string;
  sub?: string;
}

export function CalcStepStrip({ steps, noBg }: { steps: CalcStep[]; noBg?: boolean }) {
  return (
    <div className={[noBg ? '' : 'bg-zinc-50', 'px-4 sm:px-6 lg:px-8 pb-5'].filter(Boolean).join(' ')}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl bg-[#111318] shadow-xl px-5 py-4 md:px-7 md:py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {steps.map((step, i) => (
              <Fragment key={step.title}>
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs flex-none mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    {step.sub && <p className="text-xs text-white/50 mt-0.5">{step.sub}</p>}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <span className="hidden md:block text-white/25 text-lg flex-none" aria-hidden="true">›</span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
