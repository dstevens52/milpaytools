'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [rawQuery, setRawQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounce search input (250ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(rawQuery), 250);
    return () => clearTimeout(debounceRef.current);
  }, [rawQuery]);

  // Apply search filter first, then category filter
  const q = searchQuery.trim().toLowerCase();
  const searchFiltered = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    : posts;

  const activeFilter = FILTERS.find((f) => f.label === activeLabel)!;
  const filtered = activeFilter.categories
    ? searchFiltered.filter((p) => activeFilter.categories!.includes(p.category))
    : searchFiltered;

  function clearSearch() {
    setRawQuery('');
    setSearchQuery('');
  }

  const isSearching = q.length > 0;

  return (
    <>
      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search posts..."
            aria-label="Search blog posts"
            className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-9 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-0.5 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter tab bar */}
      <div className="mb-5">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FILTERS.map(({ label, categories }) => {
            // Counts reflect posts matching the current search query
            const count = categories
              ? searchFiltered.filter((p) => categories.includes(p.category)).length
              : searchFiltered.length;
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

      {/* Result count */}
      <p className="text-xs text-zinc-500 mb-5">
        {isSearching
          ? `${filtered.length} post${filtered.length !== 1 ? 's' : ''} match your search`
          : `Showing ${filtered.length} of ${posts.length} posts`}
      </p>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm mb-2">No posts match your search.</p>
          <button
            type="button"
            onClick={clearSearch}
            className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
          >
            Clear search →
          </button>
        </div>
      ) : (
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
      )}
    </>
  );
}
