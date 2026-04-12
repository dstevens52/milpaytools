import Link from 'next/link';

interface GuidePromoProps {
  guides: Array<{ slug: string; title: string }>;
}

export function GuidePromo({ guides }: GuidePromoProps) {
  return (
    <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 not-prose">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
        Learn More
      </p>
      <div className="flex flex-wrap gap-2">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="inline-flex items-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md"
          >
            {guide.title} →
          </Link>
        ))}
      </div>
    </div>
  );
}
