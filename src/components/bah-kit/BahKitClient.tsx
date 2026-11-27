'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { fireKitCopy, fireKitImageDownload, fireKitView, type KitCopyItem } from '@/lib/analytics';

/**
 * Client parts of the BAH kit page (build W3): Copy buttons, the image download
 * link and kit_view. Every text comes from src/lib/bahKit.ts through props.
 * Events go through src/lib/analytics.ts, so the GA opt-out
 * (/internal/disable-analytics) and the production-host guard apply.
 */

/** Copy to the clipboard; falls back to a hidden textarea where the async API is blocked. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Sends kit_view once per page load (the ref survives React's dev double effect). */
export function KitViewEvent({ station, year }: { station: string; year: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fireKitView(station, year);
  }, [station, year]);
  return null;
}

export function KitCopyButton({
  text,
  item,
  station,
  year,
  children,
  primary = false,
}: {
  text: string;
  item: KitCopyItem;
  station: string;
  year: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleClick() {
    const ok = await copyText(text);
    if (ok) fireKitCopy(item, station, year);
    setState(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid={`kit-copy-${item}`}
      className={
        primary
          ? 'inline-flex items-center rounded-md bg-red-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors'
          : 'inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 transition-colors'
      }
    >
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Select and copy' : children}</span>
    </button>
  );
}

export function KitDownloadLink({
  href,
  filename,
  station,
  year,
}: {
  href: string;
  filename: string;
  station: string;
  year: string;
}) {
  return (
    <a
      href={href}
      download={filename}
      onClick={() => fireKitImageDownload(station, year)}
      data-testid="kit-download"
      className="inline-flex items-center rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
    >
      Download image
    </a>
  );
}
