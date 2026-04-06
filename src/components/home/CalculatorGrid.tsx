import Link from 'next/link';

interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  highlight?: boolean;
}

function CalculatorCard({ href, title, description, tags, icon, highlight }: CalculatorCardProps) {
  return (
    <Link
      href={href}
      className={[
        'group flex flex-col rounded-xl p-6 border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        highlight
          ? 'border-gold/40 bg-gradient-to-br from-navy to-navy-dark text-white'
          : 'border-slate-200 bg-white text-slate-900 hover:border-navy/30',
      ].join(' ')}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3
        className={[
          'font-bold text-lg mb-2',
          highlight ? 'text-white' : 'text-navy group-hover:text-navy',
        ].join(' ')}
      >
        {title}
      </h3>
      <p className={['text-sm leading-relaxed flex-1 mb-4', highlight ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className={[
              'text-xs px-2 py-0.5 rounded-full font-medium',
              highlight ? 'bg-white/15 text-slate-200' : 'bg-slate-100 text-slate-600',
            ].join(' ')}
          >
            {tag}
          </span>
        ))}
      </div>
      <div
        className={[
          'mt-4 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all',
          highlight ? 'text-gold' : 'text-navy',
        ].join(' ')}
      >
        Open Calculator <span>→</span>
      </div>
    </Link>
  );
}

const CALCULATORS: CalculatorCardProps[] = [
  {
    href: '/calculators/total-compensation',
    title: 'Total Compensation Calculator',
    description:
      'See the full economic value of your service: base pay, BAH, BAS, TSP match, tax advantages, and what it all means as a civilian-equivalent salary.',
    tags: ['Base Pay', 'BAH', 'BAS', 'TSP', 'BRS'],
    icon: '💰',
    highlight: true,
  },
  {
    href: '/calculators/bah',
    title: 'BAH Calculator',
    description:
      'Look up your exact Basic Allowance for Housing rate by ZIP code, rank, and dependency status. Understand how much housing you can afford on BAH alone.',
    tags: ['BAH', 'Housing', 'ZIP Code'],
    icon: '🏠',
  },
  {
    href: '/calculators/va-disability',
    title: 'VA Disability Rating Calculator',
    description:
      'Calculate your combined disability rating using the official whole-person method. See your monthly tax-free compensation and CRDP/CRSC eligibility.',
    tags: ['VA Rating', 'Tax-Free', 'CRDP', 'CRSC'],
    icon: '🎖️',
  },
];

export function CalculatorGrid() {
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            Financial Calculators for the Military Community
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Every calculator follows the same formula: accurate math → plain-English interpretation →
            specific action steps.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATORS.map((calc) => (
            <CalculatorCard key={calc.href} {...calc} />
          ))}
        </div>
      </div>
    </section>
  );
}
