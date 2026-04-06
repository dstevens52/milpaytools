import type { ActionStep } from '@/types/calculator';

const priorityStyles = {
  high: 'border-gold bg-gold/5',
  medium: 'border-slate-300 bg-white',
  low: 'border-slate-200 bg-slate-50',
};

const priorityBadge = {
  high: 'bg-gold text-navy',
  medium: 'bg-slate-200 text-slate-700',
  low: 'bg-slate-100 text-slate-500',
};

interface ActStepProps {
  step: ActionStep;
  index?: number;
}

function ActStepInner({ step, index }: ActStepProps) {
  return (
    <>
      {index !== undefined && (
        <div className="flex-none w-7 h-7 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center">
          {index + 1}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900 text-sm">{step.label}</p>
          <span
            className={['text-xs px-1.5 py-0.5 rounded font-medium', priorityBadge[step.priority]].join(' ')}
          >
            {step.priority}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-snug">{step.description}</p>
        {step.href && (
          <span className="text-xs text-navy font-medium mt-1 inline-block">
            Learn more →
          </span>
        )}
      </div>
    </>
  );
}

export function ActStep({ step, index }: ActStepProps) {
  const containerClass = [
    'flex gap-4 rounded-lg border p-4 transition-colors',
    priorityStyles[step.priority],
  ].join(' ');

  if (step.href) {
    return (
      <a
        href={step.href}
        target="_blank"
        rel="noopener noreferrer"
        className={[containerClass, 'hover:border-navy cursor-pointer'].join(' ')}
      >
        <ActStepInner step={step} index={index} />
      </a>
    );
  }

  return (
    <div className={containerClass}>
      <ActStepInner step={step} index={index} />
    </div>
  );
}

interface ActStepsProps {
  steps: ActionStep[];
  title?: string;
}

export function ActSteps({ steps, title = 'What to do next' }: ActStepsProps) {
  return (
    <div>
      <h3 className="font-semibold text-navy text-base mb-3">{title}</h3>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <ActStep key={i} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}
