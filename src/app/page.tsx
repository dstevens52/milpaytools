import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickNavSection } from '@/components/home/QuickNavSection';
import { CalculatorGrid } from '@/components/home/CalculatorGrid';
import { TrustSection } from '@/components/home/TrustSection';
import { GuidesSection } from '@/components/home/GuidesSection';
import { LatestPostsSection } from '@/components/home/LatestPostsSection';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { organizationSchema } from '@/lib/schema';

const HOME_TITLE = 'MilPayTools — Military Pay & Benefits Calculators';
const HOME_DESC =
  'Free, accurate military pay and benefits calculators. Total compensation, BAH, VA disability ratings, and TSP — with plain-English explanations and actionable next steps.';
const HOME_OG_IMAGE = '/api/og?type=home&title=MilPayTools';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESC,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESC,
    type: 'website',
    url: '/',
    siteName: 'MilPayTools',
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [HOME_OG_IMAGE],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLdScript schema={organizationSchema()} />
      <HeroSection />
      <QuickNavSection />
      <CalculatorGrid />
      <TrustSection />
      <GuidesSection />
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
