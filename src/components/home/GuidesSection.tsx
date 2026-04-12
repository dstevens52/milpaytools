import Link from 'next/link';

const GUIDES = [
  {
    slug: 'military-pay',
    title: 'Military Pay & Compensation Guide',
    description: 'Base pay, BAH, BAS, tax advantages, and how to calculate your true total compensation vs. a civilian salary.',
    icon: '💰',
    category: 'Compensation & Pay',
  },
  {
    slug: 'va-disability',
    title: 'VA Disability Benefits Guide',
    description: 'How ratings are calculated, VA math explained, bilateral factor, 2026 compensation rates, and CRDP.',
    icon: '🎖️',
    category: 'Veterans Benefits',
  },
  {
    slug: 'retirement-tsp',
    title: 'Military Retirement & TSP Guide',
    description: 'High-3 vs. BRS pension math, TSP contribution strategy, Roth vs. Traditional, and the stay-to-20 decision.',
    icon: '📈',
    category: 'TSP & Retirement',
  },
  {
    slug: 'pcs',
    title: 'PCS & Duty Station Financial Guide',
    description: 'DLA, MALT, per diem, PPM profit, BAH resets, and how to compare duty stations on total financial picture.',
    icon: '🚛',
    category: 'PCS & Moving',
  },
  {
    slug: 'education-benefits',
    title: 'Military Education Benefits Guide',
    description: 'Post-9/11 GI Bill, VR&E Chapter 31, Tuition Assistance — benefit values, sequencing strategy, and MHA by ZIP code.',
    icon: '🎓',
    category: 'Education Benefits',
  },
];

export function GuidesSection() {
  return (
    <section className="py-10 px-4 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="block w-6 h-0.5 bg-red-700" />
              <h2 className="text-2xl font-bold text-zinc-900">Comprehensive Guides</h2>
            </div>
            <p className="text-zinc-600">
              In-depth guides covering every major topic in military finance — with embedded calculators and linked articles.
            </p>
          </div>
          <Link
            href="/guides"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            All guides <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex gap-4 items-start rounded-lg border border-zinc-200 bg-white p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-150"
            >
              <div className="flex-none w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-xl">
                {guide.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-zinc-900 text-sm leading-snug mb-1 group-hover:text-red-700 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                  {guide.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            All guides <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
