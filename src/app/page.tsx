import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickNavSection } from '@/components/home/QuickNavSection';
import { CalculatorGrid } from '@/components/home/CalculatorGrid';
import { TrustSection } from '@/components/home/TrustSection';
import { LatestPostsSection } from '@/components/home/LatestPostsSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MilPayTools — Military Pay & Benefits Calculators',
  description:
    'Free, accurate military pay and benefits calculators. Total compensation, BAH, VA disability ratings, and TSP — with plain-English explanations and actionable next steps.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickNavSection />
      <CalculatorGrid />
      <TrustSection />
      <LatestPostsSection />

      {/* VARefinance cross-link */}
      <section className="py-5 px-4 bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500 text-center">
            Buying a home with a VA loan?{' '}
            <a
              href="https://varefinance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-medium hover:underline"
            >
              Check out VARefinance.com
            </a>{' '}
            — our companion site for VA mortgage tools and guides.
          </p>
        </div>
      </section>
    </>
  );
}
