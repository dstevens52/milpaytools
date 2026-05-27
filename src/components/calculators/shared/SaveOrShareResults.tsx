'use client';

import { useState } from 'react';
import { fireShareEvent } from '@/lib/analytics';

export interface SaveOrShareResultsProps {
  pageName: string;
  headline: string;
  supportingText: string;
  usefulFor?: string[];
  getUrl: () => string;
  shareTitle?: string;
  shareText?: string;
}

export function SaveOrShareResults({
  pageName,
  headline,
  supportingText,
  usefulFor,
  getUrl,
  shareTitle = 'My MilPayTools result',
  shareText = 'Here are my MilPayTools results.',
}: SaveOrShareResultsProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {
      // clipboard unavailable — silently no-op
    }
  }

  async function handleCopy() {
    fireShareEvent('calculator', pageName);
    copyToClipboard();
  }

  async function handleShare() {
    fireShareEvent('calculator', pageName);
    const url = getUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    copyToClipboard();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5">

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="flex-none mt-0.5 w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 leading-snug">{headline}</p>
          <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{supportingText}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2.5">

        {/* Share result — mobile only, primary */}
        <button
          type="button"
          onClick={handleShare}
          className="md:hidden w-full flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-3.5 text-sm font-semibold text-white hover:bg-red-800 active:bg-red-900 transition-colors"
        >
          <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share result
        </button>

        {/* Copy result link
            Mobile: secondary (white/bordered), since Share is primary above
            Desktop: primary (red), since this is the only action shown  */}
        <button
          type="button"
          onClick={handleCopy}
          className={[
            'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-semibold transition-colors',
            copied
              ? 'bg-green-50 border border-green-200 text-green-700'
              : [
                  // mobile: secondary
                  'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm',
                  // desktop: override to primary red
                  'md:bg-red-700 md:border-red-700 md:text-white md:hover:bg-red-800 md:shadow-none',
                ].join(' '),
          ].join(' ')}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
              </svg>
              Copy result link
            </>
          )}
        </button>
      </div>

      {/* Success confirmation */}
      {copied && (
        <p className="mt-2.5 text-xs text-green-700 text-center">
          Copied! This link keeps your current inputs and result.
        </p>
      )}

      {/* Useful for chips */}
      {usefulFor && usefulFor.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Useful for:</span>
          {usefulFor.map((label) => (
            <span
              key={label}
              className="inline-flex items-center text-xs bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-full px-2.5 py-0.5"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Privacy note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
        <svg className="w-3 h-3 flex-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4" y="9" width="12" height="9" rx="1.5" />
          <path strokeLinecap="round" d="M7 9V6.5a3 3 0 016 0V9" />
        </svg>
        Your results are private. No personal data is stored.
      </div>

    </div>
  );
}
