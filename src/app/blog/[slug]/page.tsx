import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getPost, getAllSlugs, formatDate } from '@/lib/blog';
import { CalculatorCallout } from '@/components/blog/CalculatorCallout';
import { KeyFact } from '@/components/blog/KeyFact';
import { QuickAnswer, QAItem } from '@/components/blog/QuickAnswer';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

// MDX components available in all posts
const mdxComponents = {
  CalculatorCallout,
  KeyFact,
  QuickAnswer,
  QAItem,
  Disclaimer,
};

const GUIDE_TITLES: Record<string, string> = {
  'military-pay': 'Military Pay & Compensation Guide',
  'va-disability': 'VA Disability Benefits Guide',
  'retirement-tsp': 'Military Retirement & TSP Guide',
  'pcs': 'PCS & Duty Station Financial Guide',
  'education-benefits': 'Military Education Benefits Guide',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Compensation & Pay':  'bg-red-100 text-red-700',
  'Veterans Benefits':   'bg-blue-100 text-blue-700',
  'Housing & BAH':       'bg-green-100 text-green-700',
  'TSP & Retirement':    'bg-purple-100 text-purple-700',
  'Retirement & TSP':    'bg-purple-100 text-purple-700',
  'Career Transition':   'bg-amber-100 text-amber-700',
  'Education Benefits':  'bg-teal-100 text-teal-700',
  'General':             'bg-zinc-100 text-zinc-600',
};

const CALCULATOR_LINKS: Record<string, { label: string; href: string }> = {
  'total-compensation': { label: 'Total Compensation Calculator',    href: '/calculators/total-compensation' },
  bah:                  { label: 'BAH Calculator',                   href: '/calculators/bah' },
  'va-disability':      { label: 'VA Disability Calculator',          href: '/calculators/va-disability' },
  tsp:                  { label: 'TSP Growth Projector',              href: '/calculators/tsp' },
  retirement:           { label: 'Retirement Calculator',             href: '/calculators/retirement' },
  pcs:                  { label: 'PCS Cost Estimator',                href: '/calculators/pcs' },
  cola:                 { label: 'CONUS COLA Calculator',             href: '/calculators/cola' },
  compare:              { label: 'Duty Station Comparison',           href: '/calculators/compare' },
  deployment:           { label: 'Deployment Pay Calculator',          href: '/calculators/deployment' },
  'pay-charts':         { label: '2026 Military Pay Charts',           href: '/calculators/pay-charts' },
  'guard-reserve':      { label: 'Guard & Reserve Pay Calculator',     href: '/calculators/guard-reserve' },
  'dual-military-bah':  { label: 'Dual Military BAH Calculator',        href: '/calculators/dual-military-bah' },
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | MilPayTools`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const colorClass = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS['General'];
  const relatedCalcs = post.calculators
    .map((c) => CALCULATOR_LINKS[c])
    .filter(Boolean);
  const parentGuideTitle = post.guide ? GUIDE_TITLES[post.guide] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Parent guide breadcrumb */}
      {parentGuideTitle && post.guide && (
        <div className="mb-5">
          <a
            href={`/guides/${post.guide}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.966 8.966 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Part of our {parentGuideTitle} →
          </a>
        </div>
      )}

      {/* Post header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {post.category}
          </span>
          <span className="text-xs text-zinc-400">
            {formatDate(post.date)} · {post.readTime} min read · By {post.author}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">{post.description}</p>
      </header>

      {/* Related calculators */}
      {relatedCalcs.length > 0 && (
        <div className="mb-8 rounded-lg bg-zinc-50 border border-zinc-200 p-4 not-prose">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Free Calculators Referenced in This Article
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedCalcs.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="inline-flex items-center text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 transition-colors px-3 py-1.5 rounded-md"
              >
                {c.label} →
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MDX content */}
      <article className="prose prose-zinc prose-sm sm:prose-base max-w-none
        prose-headings:font-bold prose-headings:text-zinc-900
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-zinc-700 prose-p:leading-relaxed
        prose-strong:text-zinc-900 prose-strong:font-semibold
        prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
        prose-li:text-zinc-700 prose-li:leading-relaxed
        prose-table:text-sm
        prose-th:bg-zinc-50 prose-th:font-semibold prose-th:text-zinc-700
        prose-td:text-zinc-700
        prose-hr:border-zinc-200
        prose-blockquote:border-red-300 prose-blockquote:text-zinc-600">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {/* Author bio */}
      <AuthorBio />

      {/* Disclaimer */}
      <div className="mt-8">
        <Disclaimer dataYear="2026" />
      </div>
    </div>
  );
}
