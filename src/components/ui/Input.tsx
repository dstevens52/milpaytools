import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          'rounded-md border px-3 py-2 text-base text-slate-900 bg-white',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
