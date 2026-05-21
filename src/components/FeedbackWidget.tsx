'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface Props {
  pageTitle?: string;
}

export function FeedbackWidget({ pageTitle }: Props) {
  const [voted, setVoted] = useState(false);
  const pathname = usePathname();

  const title =
    pageTitle ??
    (typeof document !== 'undefined' ? document.title.replace(' | MilPayTools', '') : 'this page');

  const feedbackUrl = `/feedback?url=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : `https://www.milpaytools.com${pathname}`
  )}&page=${encodeURIComponent(title)}`;

  if (voted) {
    return (
      <p className="text-xs text-zinc-400 py-2">Thanks — glad it helped.</p>
    );
  }

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-xs text-zinc-400">Was this useful?</span>
      <button
        onClick={() => setVoted(true)}
        className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1"
        aria-label="Yes, this was useful"
      >
        <span aria-hidden="true">👍</span> Yes
      </button>
      <a
        href={feedbackUrl}
        className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1"
        aria-label="Something looks off — report an issue"
      >
        <span aria-hidden="true">⚠️</span> Something looks off
      </a>
    </div>
  );
}
