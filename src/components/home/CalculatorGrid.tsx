import Link from 'next/link';

interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  featured?: boolean;
}

function CalculatorCard({ href, title, description, tags, icon, featured }: CalculatorCardProps) {
  return (
    <Link
      href={href}
      className={[
        'group flex flex-col rounded-lg border p-6 bg-white transition-all duration-150',
        'hover:shadow-md hover:border-zinc-300',
        featured ? 'border-red-200 ring-1 ring-red-100' : 'border-zinc-200',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {featured && (
          <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            Most popular
          </span>
        )}
      </div>

      <h3 className="font-bold text-zinc-900 text-base mb-2 group-hover:text-red-700 transition-colors">
        {title}
      </h3>

      <p className="text-sm text-zinc-600 leading-relaxed flex-1 mb-4">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 text-sm font-semibold text-red-700 group-hover:gap-2 transition-all">
        Open calculator <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

const CALCULATORS: CalculatorCardProps[] = [
  {
    href: '/calculators/total-compensation',
    title: 'Total Compensation Calculator',
    description:
      'See the full economic value of your service: base pay, BAH, BAS, TSP agency match, and tax advantages — expressed as a civilian-equivalent salary.',
    tags: ['Base Pay', 'BAH', 'BAS', 'TSP', 'BRS'],
    icon: '💰',
    featured: true,
  },
  {
    href: '/calculators/bah',
    title: 'BAH Calculator',
    description:
      'Look up your exact Basic Allowance for Housing rate by ZIP code and rank. Understand how much of the local rental market your BAH covers.',
    tags: ['BAH', 'Housing', 'ZIP Code'],
    icon: '🏠',
  },
  {
    href: '/calculators/va-disability',
    title: 'VA Disability Rating Calculator',
    description:
      'Calculate your combined disability rating using the official whole-person method. Get monthly tax-free compensation and check CRDP eligibility.',
    tags: ['VA Rating', 'Tax-Free', 'CRDP', 'CRSC'],
    icon: '🎖️',
  },
];

export function CalculatorGrid() {
  return (
    <section className="py-16 px-4 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
            Financial calculators
          </h2>
          <p className="text-zinc-600 max-w-2xl">
            Each calculator ends with a plain-English interpretation and specific next steps —
            not just a number.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CALCULATORS.map((calc) => (
            <CalculatorCard key={calc.href} {...calc} />
          ))}
        </div>
      </div>
    </section>
  );
}
