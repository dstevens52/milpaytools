import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BahKitView } from '@/components/bah-kit/BahKitView';
import { bahKitData, bahKitStations } from '@/lib/bahKit';
import { bahShareOgImages } from '@/lib/bahShareImage';

/**
 * BAH kit page per CONUS station (build W3): the share image, sentences to
 * paste, the rate table and a credit link, for realtors, bloggers and relief
 * societies. Linked from outreach email only.
 *
 * noindex, follow; not in the sitemap, llms.txt or any "nearby" list: it must
 * not compete with the station page (/bah/[slug]). Overseas and unknown slugs
 * 404 (dynamicParams = false). Every figure and sentence: src/lib/bahKit.ts.
 */

export function generateStaticParams() {
  return bahKitStations().map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kit = bahKitData(slug);
  if (!kit) return {};
  const title = `${kit.name} BAH ${kit.year} kit`;
  const description = `Free to use: the ${kit.year} BAH share image, sentences to paste and the full rate table for ${kit.name}. Source: DTMO.`;
  const images = bahShareOgImages(slug);
  return {
    title,
    description,
    robots: { index: false, follow: true },
    // og/twitter skip the root title template, so they carry the site name.
    openGraph: { title: `${title} | MilPayTools`, description, type: 'website', url: `/bah/kit/${slug}`, siteName: 'MilPayTools', images },
    twitter: { card: 'summary_large_image', title: `${title} | MilPayTools`, description, images },
  };
}

export default async function BahKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = bahKitData(slug);
  if (!kit) notFound();
  return <BahKitView kit={kit} />;
}
