'use client';

import { useState } from 'react';

export interface EmailSignupProps {
  headline?: string;
  subtext?: string;
  source: string;
  stationName?: string;
  variant?: 'inline' | 'card';
  darkBg?: boolean;
}

export function EmailSignup({
  headline,
  subtext,
  source,
  stationName,
  variant = 'inline',
  darkBg = false,
}: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const displayHeadline = stationName
    ? `Get notified when 2027 BAH rates update for ${stationName}`
    : (headline ?? 'Get notified when 2027 rates are updated');

  const headlineClass = darkBg ? 'text-white' : 'text-zinc-900';
  const subtextClass = darkBg ? 'text-zinc-400' : 'text-zinc-500';
  const consentClass = darkBg ? 'text-zinc-500' : 'text-zinc-400';
  const errorClass = darkBg ? 'text-red-400' : 'text-red-600';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setStatus('success');
      } else {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className={`text-sm font-medium ${darkBg ? 'text-green-400' : 'text-green-700'}`}>
        You&apos;re in! We&apos;ll email you when 2027 rates drop.
      </p>
    );
  }

  const form = (
    <>
      <p className={`text-sm font-semibold mb-1 ${headlineClass}`}>{displayHeadline}</p>
      {subtext && <p className={`text-xs mb-3 ${subtextClass}`}>{subtext}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2 sm:max-w-[480px]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === 'loading'}
          className="flex-1 min-w-0 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-none px-4 py-2 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? 'Sending…' : 'Notify me'}
        </button>
      </form>
      {status === 'error' && (
        <p className={`text-xs mt-1.5 ${errorClass}`}>{errorMsg}</p>
      )}
      <p className={`text-xs mt-2 ${consentClass}`}>
        We&apos;ll only email you when official rates change or new tools launch. Unsubscribe anytime.
      </p>
    </>
  );

  if (variant === 'card') {
    return (
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
        {form}
      </div>
    );
  }

  return <div>{form}</div>;
}
