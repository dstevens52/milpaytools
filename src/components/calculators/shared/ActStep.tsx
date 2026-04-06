import type { ActionStep } from '@/types/calculator';

const priorityStyles = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-zinc-200 bg-white',
  low: 'border-zinc-200 bg-zinc-50',
};

const priorityBadge = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-zinc-100 text-zinc-600',
  low: 'bg-zinc-100 text-zinc-500',
};

interface ActStepProps {
  step: ActionStep;
  index?: number;
}

function ActStepInner({ step, index }: ActStepProps) {
  return (
    <>
      {index !== undefined && (
        <div className="flex-none w-7 h-7 rounded-full bg-red-700 text-white text-sm font-bold flex items-center justify-center">
          {index + 1}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-zinc-900 text-sm">{step.label}</p>
          <span
            className={['text-xs px-1.5 py-0.5 rounded font-medium', priorityBadge[step.priority]].join(' ')}
          >
            {step.priority}
          </span>
        </div>
        <p className="text-sm text-zinc-600 leading-snug">{step.description}</p>
        {step.href && (
          <span className="text-xs text-red-700 font-medium mt-1 inline-block">
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
        className={[containerClass, 'hover:border-red-300 cursor-pointer'].join(' ')}
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
      <h3 className="font-semibold text-zinc-900 text-base mb-3">{title}</h3>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <ActStep key={i} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}
