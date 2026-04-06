import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  error?: string;
  hint?: string;
}

export function Select({ label, options, groups, error, hint, id, className = '', ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        className={[
          'rounded-md border px-3 py-2 text-base text-slate-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent',
          'appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")] bg-[length:20px_20px] bg-[right_8px_center] bg-no-repeat pr-9',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        ].join(' ')}
        {...props}
      >
        {groups
          ? groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))
          : options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
