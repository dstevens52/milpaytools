import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: { absolute: 'Feedback | MilPayTools' },
  description: 'Spot an outdated number, confusing explanation, or missing topic? Send a quick note.',
  robots: { index: false },
};

export default function FeedbackPage() {
  return (
    <Suspense>
      <FeedbackForm />
    </Suspense>
  );
}
