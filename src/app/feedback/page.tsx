import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { ogImage } from '@/lib/og';

export const metadata: Metadata = {
  title: { absolute: 'Feedback' },
  description: 'Spot an outdated number, confusing explanation, or missing topic? Send a quick note.',
  robots: { index: false },
  openGraph: {
    title: 'Feedback | MilPayTools',
    description: 'Spot an outdated number, confusing explanation, or missing topic? Send a quick note.',
    type: 'website',
    url: '/feedback',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'default', title: 'Feedback' }),
  },
};

export default function FeedbackPage() {
  return (
    <>
      <Suspense>
        <FeedbackForm />
      </Suspense>
      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-12 text-center border-t border-zinc-100 pt-6">
        <p className="text-xs text-zinc-400 leading-relaxed">
          Built by Dan Stevens — grew up on Air Force bases, now building tools for the military community.{' '}
          <Link href="/" className="text-zinc-500 hover:text-zinc-700 underline underline-offset-2">
            Back to MilPayTools
          </Link>
        </p>
      </div>
    </>
  );
}
