import Link from 'next/link';
import { getAllPostMeta, formatDate } from '@/lib/blog';

export function LatestPostsSection() {
  const posts = getAllPostMeta().slice(0, 3);

  return (
    <section className="py-10 px-4 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="block w-6 h-0.5 bg-red-700" />
              <h2 className="text-2xl font-bold text-zinc-900">Latest from the blog</h2>
            </div>
            <p className="text-zinc-600">
              Guides, breakdowns, and financial concepts explained for service members.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            View all posts <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                  {post.category}
                </span>
              </div>
              <h3 className="font-bold text-zinc-900 text-sm leading-snug mb-2 group-hover:text-red-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed flex-1 mb-3 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{post.readTime} min read</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            View all posts <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
