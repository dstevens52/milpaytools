import Link from 'next/link';

const QUESTIONS = [
  {
    question: 'How much am I really making?',
    href: '/calculators/total-compensation',
  },
  {
    question: "What's my BAH at a new duty station?",
    href: '/calculators/bah',
  },
  {
    question: "What's my VA combined rating?",
    href: '/calculators/va-disability',
  },
  {
    question: 'How much will my TSP be worth?',
    href: '/calculators/tsp',
  },
];

export function QuickNavSection() {
  return (
    <section className="py-10 px-4 bg-white border-b border-zinc-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">
          What do you need help with?
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUESTIONS.map(({ question, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors group"
            >
              <span className="leading-snug">{question}</span>
              <span className="text-zinc-400 group-hover:text-red-500 flex-none" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
