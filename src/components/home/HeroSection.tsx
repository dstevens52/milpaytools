import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-navy text-white py-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
          Built for the military community
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-6">
          Don&apos;t just see the number.{' '}
          <span className="text-gold">Know what it means.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          MilPayTools gives you the exact math behind your military pay and benefits — and
          tells you what to do with it. No guesswork. No jargon. Just answers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/calculators/total-compensation"
            className="rounded-lg bg-gold px-7 py-3.5 text-base font-bold text-navy hover:bg-gold-dark transition-colors shadow-lg"
          >
            Calculate My Total Compensation
          </Link>
          <Link
            href="/calculators/va-disability"
            className="rounded-lg border border-white/30 px-7 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors"
          >
            VA Disability Rating
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          Free. No account required. Based on official {new Date().getFullYear()} rates.
        </p>
      </div>
    </section>
  );
}
