import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuideMeta } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Military Finance Guides | MilPayTools',
  description:
    'Comprehensive topic guides on military pay, VA disability, retirement & TSP, PCS finances, and education benefits — with calculators and plain-English explanations.',
  alternates: { canonical: '/guides' },
};

const GUIDE_ICONS: Record<string, string> = {
  'military-pay': '💰',
  'va-disability': '🎖️',
  'retirement-tsp': '📈',
  pcs: '🚛',
  'education-benefits': '🎓',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Compensation & Pay': 'bg-red-100 text-red-700',
  'Veterans Benefits': 'bg-blue-100 text-blue-700',
  'TSP & Retirement': 'bg-purple-100 text-purple-700',
  'Career Transition': 'bg-amber-100 text-amber-700',
  'Education Benefits': 'bg-teal-100 text-teal-700',
};

export default function GuidesIndexPage() {
  const guides = getAllGuideMeta();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Comprehensive Military Finance Guides</h1>
        <p className="text-zinc-600 mt-2 text-base max-w-2xl">
          In-depth topic guides covering the full landscape of military compensation, benefits, and
          financial decisions. Each guide links to every relevant calculator and article on that topic.
        </p>
      </div>

      {/* Guide cards */}
      <div className="space-y-6">
        {guides.map((guide) => {
          const colorClass = CATEGORY_COLORS[guide.category] ?? 'bg-zinc-100 text-zinc-600';
          const icon = GUIDE_ICONS[guide.slug] ?? '📖';

          return (
            <article
              key={guide.slug}
              className="bg-white border border-zinc-200 rounded-lg p-6 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-none w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                      {guide.category}
                    </span>
                    <span className="text-xs text-zinc-400">{guide.readTime} min read</span>
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-2 leading-snug">
                    <Link href={`/guides/${guide.slug}`} className="hover:text-red-700 transition-colors">
                      {guide.title}
                    </Link>
                  </h2>
                  <p className="text-zinc-600 text-sm leading-relaxed mb-3">{guide.description}</p>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
                    >
                      Read guide →
                    </Link>
                    {guide.calculators.length > 0 && (
                      <span className="text-xs text-zinc-400">
                        {guide.calculators.length} calculator{guide.calculators.length !== 1 ? 's' : ''} referenced
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-lg bg-zinc-50 border border-zinc-200 p-6 text-center">
        <p className="text-zinc-700 text-base font-medium mb-2">Looking for something specific?</p>
        <p className="text-zinc-500 text-sm mb-4">
          Browse all our free calculators or read individual articles in the blog.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/calculators"
            className="inline-flex items-center text-sm font-medium text-white bg-red-700 hover:bg-red-800 transition-colors px-4 py-2 rounded-md"
          >
            All Calculators →
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors px-4 py-2 rounded-md"
          >
            Browse Blog →
          </Link>
        </div>
      </div>
    </div>
  );
}
