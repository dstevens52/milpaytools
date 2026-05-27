import type { Metadata } from 'next';
import { getAllPostMeta } from '@/lib/blog';
import { BlogFilters } from './BlogFilters';

const BLOG_TITLE = 'Military Finance Blog';
const BLOG_DESC =
  'Plain-language guides on military pay, BAH, VA disability, TSP, and benefits — written for active-duty service members and veterans.';
const BLOG_IMAGE = '/api/og?type=blog&title=Military+Finance+Blog&sub=Plain-language+guides+on+military+pay+%26+benefits&v=2';

export const metadata: Metadata = {
  title: { absolute: BLOG_TITLE },
  description: BLOG_DESC,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESC,
    type: 'website',
    url: '/blog',
    siteName: 'MilPayTools',
    images: [{ url: BLOG_IMAGE, width: 2400, height: 1260 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: BLOG_TITLE,
    description: BLOG_DESC,
    images: [BLOG_IMAGE],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPostMeta();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Military Finance Blog</h1>
        <p className="text-zinc-600 mt-2 text-base max-w-2xl">
          Plain-language guides on military pay, BAH, VA disability ratings, TSP, and benefits.
          Written for the service member who just wants the real number — not a marketing pitch.
        </p>
      </div>

      <BlogFilters posts={posts} />
    </div>
  );
}
