interface QuickAnswerProps {
  children: React.ReactNode;
}

export function QuickAnswer({ children }: QuickAnswerProps) {
  return (
    <div className="my-8 rounded-lg border border-red-200 bg-red-50 not-prose">
      <div className="flex items-center gap-2 border-b border-red-200 px-5 py-3">
        <svg
          className="h-4 w-4 shrink-0 text-red-700"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
          />
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest text-red-700">
          Quick Answer
        </span>
      </div>
      <ul className="divide-y divide-red-100 px-5 py-1">
        {children}
      </ul>
    </div>
  );
}

interface QAItemProps {
  children: React.ReactNode;
}

export function QAItem({ children }: QAItemProps) {
  return (
    <li className="flex items-start gap-2.5 py-2.5 text-sm text-zinc-800 leading-snug">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
