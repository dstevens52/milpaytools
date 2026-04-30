export function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
      {children}
    </div>
  );
}

export function ExampleRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        'flex justify-between px-4 py-2.5 text-sm',
        highlight ? 'bg-blue-50 font-semibold' : '',
      ].join(' ')}
    >
      <span className={highlight ? 'text-zinc-900' : 'text-zinc-600'}>{label}</span>
      <span className={['tabular-nums', highlight ? 'text-zinc-900' : 'font-medium text-zinc-800'].join(' ')}>
        {value}
      </span>
    </div>
  );
}

export function ExampleTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 overflow-hidden rounded-lg border border-blue-100 bg-white divide-y divide-zinc-100">
      {children}
    </div>
  );
}
