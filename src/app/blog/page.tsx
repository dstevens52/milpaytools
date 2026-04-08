import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPostMeta, formatDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Military Finance Blog | MilPayTools',
  description:
    'Plain-language guides on military pay, BAH, VA disability, TSP, and benefits — written for active-duty service members and veterans.',
  alternates: { canonical: '/blog' },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Compensation & Pay': 'bg-red-100 text-red-700',
  'Veterans Benefits':  'bg-blue-100 text-blue-700',
  'Housing & BAH':      'bg-green-100 text-green-700',
  'TSP & Retirement':   'bg-purple-100 text-purple-700',
  'General':            'bg-zinc-100 text-zinc-600',
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

      {/* Post list */}
      <div className="space-y-6">
        {posts.map((post) => {
          const colorClass = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS['General'];
          return (
            <article
              key={post.slug}
              className="bg-white border border-zinc-200 rounded-lg p-6 hover:border-zinc-300 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                  {post.category}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatDate(post.date)} · {post.readTime} min read
                </span>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-2 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-red-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-zinc-600 text-sm leading-relaxed mb-3">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
              >
                Read article →
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
