'use client';

import { useState, useRef, useEffect } from 'react';

interface InfoTipProps {
  label: string;
  tooltip: string;
  className?: string;
}

export function InfoTip({ label, tooltip, className }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={['relative inline-flex items-center gap-1', className ?? ''].join(' ')}
    >
      <span className="text-xs text-zinc-500 leading-snug">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
        aria-label="More information"
        aria-expanded={open}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 bottom-full left-0 mb-1.5 w-64 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-700 shadow-lg leading-relaxed"
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}
