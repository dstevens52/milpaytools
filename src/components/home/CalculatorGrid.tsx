import Link from 'next/link';

interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  icon: string;
  featured?: boolean;
}

function CalculatorCard({ href, title, description, icon, featured }: CalculatorCardProps) {
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
            Most Popular
          </span>
        )}
      </div>

      <h3 className="font-bold text-zinc-900 text-base mb-2 group-hover:text-red-700 transition-colors">
        {title}
      </h3>

      <p className="text-sm text-zinc-600 leading-relaxed flex-1 mb-4">{description}</p>

      <div className="flex items-center gap-1 text-sm font-semibold text-red-700 group-hover:gap-2 transition-all">
        Try it <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

const CALCULATORS: CalculatorCardProps[] = [
  {
    href: '/calculators/total-compensation',
    title: 'Total Military Compensation',
    description:
      'Base pay, BAH, BAS, tax advantages, and civilian salary equivalent — all in one view.',
    icon: '💰',
    featured: true,
  },
  {
    href: '/calculators/bah',
    title: 'BAH Calculator',
    description:
      '2026 housing allowance for any ZIP code. Compare two duty stations side by side for PCS planning.',
    icon: '🏠',
  },
  {
    href: '/calculators/va-disability',
    title: 'VA Disability Rating',
    description:
      'Combined rating calculator with step-by-step math, bilateral factor, and monthly compensation estimate.',
    icon: '🎖️',
  },
  {
    href: '/calculators/tsp',
    title: 'TSP Growth Projector',
    description:
      'Model your retirement savings with BRS matching, fund allocation, and Roth vs Traditional comparison.',
    icon: '📈',
  },
];

export function CalculatorGrid() {
  return (
    <section className="py-16 px-4 bg-zinc-50 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
            Free calculators. Official 2026 data.
          </h2>
          <p className="text-zinc-600 max-w-2xl">
            Every tool uses verified DoD, DFAS, DTMO, and VA data — not estimates.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CALCULATORS.map((calc) => (
            <CalculatorCard key={calc.href} {...calc} />
          ))}
        </div>
      </div>
    </section>
  );
}
