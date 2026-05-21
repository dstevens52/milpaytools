'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const FEEDBACK_TYPES = [
  'Something looks wrong',
  'Data or rate issue',
  'Confusing explanation',
  'Missing topic',
  'Feature idea',
  'General feedback',
];

export function FeedbackForm() {
  const searchParams = useSearchParams();
  const prefillUrl = searchParams.get('url') ?? '';
  const prefillPage = searchParams.get('page') ?? '';

  const [type, setType] = useState(FEEDBACK_TYPES[0]);
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
          type,
          message,
          email: email.trim() || null,
          url: prefillUrl || (typeof window !== 'undefined' ? window.location.href : null),
          page: prefillPage || (typeof document !== 'undefined' ? document.title : null),
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
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
        <h1 className="text-2xl font-bold text-zinc-900 mb-3">Thanks — we&apos;ll review this.</h1>
        <p className="text-zinc-600 leading-relaxed">
          Your feedback helps make MilPayTools more accurate for everyone.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Help improve MilPayTools</h1>
      <p className="text-zinc-600 text-sm leading-relaxed mb-8">
        Spot an outdated number, confusing explanation, or missing topic? Send a quick note and
        we&apos;ll review it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="feedback-type"
            className="block text-sm font-medium text-zinc-700 mb-1.5"
          >
            What type of feedback?
          </label>
          <select
            id="feedback-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {FEEDBACK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="feedback-message"
            className="block text-sm font-medium text-zinc-700 mb-1.5"
          >
            What should we know?{' '}
            <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <textarea
            id="feedback-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue or idea..."
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label
            htmlFor="feedback-email"
            className="block text-sm font-medium text-zinc-700 mb-1.5"
          >
            Email{' '}
            <span className="text-zinc-400 font-normal">— only if you&apos;d like a reply</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {prefillPage && (
          <p className="text-xs text-zinc-400">
            Page:{' '}
            <span className="text-zinc-500">{prefillPage}</span>
          </p>
        )}

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
