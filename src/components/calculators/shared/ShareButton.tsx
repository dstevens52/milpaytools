'use client';

import { useState } from 'react';

interface ShareButtonProps {
  getUrl: () => string;
  className?: string;
}

export function ShareButton({ getUrl, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-all select-none',
        copied
          ? 'border-green-300 bg-green-50 text-green-700'
          : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900',
        className ?? '',
      ].join(' ')}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Copy link
        </>
      )}
    </button>
  );
}
