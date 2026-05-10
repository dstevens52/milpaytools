import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeBody } from '@/components/home/HomeBody';
import { GuidesSection } from '@/components/home/GuidesSection';
import { LatestPostsSection } from '@/components/home/LatestPostsSection';
import Link from 'next/link';
import { JsonLdScript } from '@/components/JsonLdScript';
import { organizationSchema } from '@/lib/schema';

const HOME_TITLE = 'MilPayTools — Military Pay & Benefits Calculators';
const HOME_DESC =
  'Free, accurate military pay and benefits calculators. Total compensation, BAH, VA disability ratings, and TSP — with plain-English explanations and actionable next steps.';
const HOME_OG_IMAGE = '/api/og?type=home&title=MilPayTools&v=2';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESC,
  alternates: { canonical: 'https://www.milpaytools.com/' },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESC,
    type: 'website',
    url: '/',
    siteName: 'MilPayTools',
    images: [{ url: HOME_OG_IMAGE, width: 2400, height: 1260 }],
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
      <HomeBody />
      <GuidesSection />
      <LatestPostsSection />

      {/* VARefinance cross-link */}
      <section className="py-5 px-4 bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-500 text-center">
            Using your VA loan benefit?{' '}
            <a
              href="https://varefinance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-medium hover:underline"
            >
              Visit VARefinance.com
            </a>{' '}
            for VA mortgage education and tools.
          </p>
        </div>
      </section>
    </>
  );
}
