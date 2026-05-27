'use client';

import { useState } from 'react';
import Link from 'next/link';
type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;
  readTime: number;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  'Compensation & Pay': 'bg-red-100 text-red-700',
  'Veterans Benefits':  'bg-blue-100 text-blue-700',
  'Housing & BAH':      'bg-green-100 text-green-700',
  'TSP & Retirement':   'bg-purple-100 text-purple-700',
  'Retirement & TSP':   'bg-purple-100 text-purple-700',
  'Career Transition':  'bg-amber-100 text-amber-700',
  'Education Benefits': 'bg-teal-100 text-teal-700',
  'PCS & Lifestyle':    'bg-indigo-100 text-indigo-700',
  'General':            'bg-zinc-100 text-zinc-600',
};

type Filter = {
  label: string;
  categories: string[] | null;
};

const FILTERS: Filter[] = [
  { label: 'All', categories: null },
  { label: 'Pay & Compensation', categories: ['Compensation & Pay', 'Housing & BAH'] },
  { label: 'Retirement & TSP',   categories: ['Retirement & TSP', 'TSP & Retirement'] },
  { label: 'Veterans Benefits',  categories: ['Veterans Benefits'] },
  { label: 'Transition',         categories: ['Career Transition'] },
  { label: 'PCS & Lifestyle',    categories: ['PCS & Lifestyle'] },
  { label: 'Education',          categories: ['Education Benefits'] },
];

export function BlogFilters({ posts }: { posts: PostMeta[] }) {
  const [activeLabel, setActiveLabel] = useState<string>('All');

  const activeFilter = FILTERS.find((f) => f.label === activeLabel)!;
  const filtered = activeFilter.categories
    ? posts.filter((p) => activeFilter.categories!.includes(p.category))
    : posts;

  return (
    <>
      {/* Filter tab bar */}
      <div className="mb-8">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FILTERS.map(({ label, categories }) => {
            const count = categories
              ? posts.filter((p) => categories.includes(p.category)).length
              : posts.length;
            const isActive = activeLabel === label;

            return (
              <button
                key={label}
                onClick={() => setActiveLabel(label)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-red-700 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {label}{' '}
                <span className={`text-xs ml-0.5 ${isActive ? 'text-red-200' : 'text-zinc-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Post list */}
      <div className="space-y-6">
        {filtered.map((post) => {
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
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-red-700 transition-colors"
                >
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
    </>
  );
}
