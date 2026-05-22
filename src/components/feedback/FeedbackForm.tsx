'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function FeedbackForm() {
  const searchParams = useSearchParams();
  const prefillUrl = searchParams.get('url') ?? '';
  const prefillPage = searchParams.get('page') ?? '';

  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'General feedback',
          message,
          email: email.trim() || null,
          url: prefillUrl || (typeof window !== 'undefined' ? window.location.href : null),
          page: prefillPage || (typeof document !== 'undefined' ? document.title : null),
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
      setMessage('');
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
        <svg
          className="w-10 h-10 text-green-600 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-xl font-semibold text-zinc-900 mb-2">Thanks — we read every message.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 mb-3">Help us make this better</h1>
      <p className="text-zinc-600 text-sm leading-relaxed mb-8">
        MilPayTools is built for service members and veterans — and we want to get it right. If you
        spot something that looks off, think a topic could be explained better, or there&apos;s a tool
        or subject we should cover, we&apos;d genuinely appreciate hearing from you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (optional — only if you want a response)"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full rounded-lg bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending…' : 'Send feedback'}
        </button>
      </form>
    </div>
  );
}
