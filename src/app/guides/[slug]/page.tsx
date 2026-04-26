import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getGuide, getAllGuideSlugs, formatDate } from '@/lib/guides';
import { CalculatorCallout } from '@/components/blog/CalculatorCallout';
import { KeyFact } from '@/components/blog/KeyFact';
import { QuickAnswer, QAItem } from '@/components/blog/QuickAnswer';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { Disclaimer } from '@/components/calculators/shared/Disclaimer';

// MDX components available in all guides
const mdxComponents = {
  CalculatorCallout,
  KeyFact,
  QuickAnswer,
  QAItem,
  Disclaimer,
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
  deployment:           { label: 'Deployment Pay Calculator',         href: '/calculators/deployment' },
  'pay-charts':         { label: '2026 Military Pay Charts',          href: '/calculators/pay-charts' },
  'guard-reserve':      { label: 'Guard & Reserve Pay Calculator',    href: '/calculators/guard-reserve' },
  education:            { label: 'Education Benefits Calculator',     href: '/calculators/education' },
  'dual-military-bah':  { label: 'Dual Military BAH Calculator',      href: '/calculators/dual-military-bah' },
};

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | MilPayTools`,
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      publishedTime: guide.date,
      authors: [guide.author],
    },
  };
}

export default async function GuidePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const relatedCalcs = guide.calculators
    .map((c) => CALCULATOR_LINKS[c])
    .filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
          <li>
            <Link href="/guides" className="hover:text-zinc-700 transition-colors">
              Guides
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-zinc-800 font-medium truncate">{guide.title}</li>
        </ol>
      </nav>

      {/* Post header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Comprehensive Guide
          </span>
          <span className="text-xs text-zinc-400">
            {formatDate(guide.date)} · {guide.readTime} min read · By {guide.author}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight mb-4">
          {guide.title}
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">{guide.description}</p>
      </header>

      {/* Related calculators */}
      {relatedCalcs.length > 0 && (
        <div className="mb-8 rounded-lg bg-zinc-50 border border-zinc-200 p-4 not-prose">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Free Calculators Referenced in This Guide
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
          source={guide.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>

      {/* Author bio */}
      <AuthorBio />

      {/* Back to all guides */}
      <div className="mt-8 pt-6 border-t border-zinc-200">
        <Link
          href="/guides"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          ← Back to all guides
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-6">
        <Disclaimer dataYear="2026" />
      </div>
    </div>
  );
}
