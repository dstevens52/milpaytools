import { getCalculatorSummary, NO_ACCOUNT_LINE, type SummaryKey } from '@/lib/calculatorSummaries';

/**
 * "What this calculator does" — a short, server-rendered block (in the HTML without
 * JavaScript): what it calculates, what you enter, one worked result computed from
 * the lib with a link that opens it, and the data basis. Content and figures come
 * from src/lib/calculatorSummaries.ts.
 *
 * Placement is per page: above the calculator only when its first input still shows
 * on the first screen of a 390px phone, otherwise directly after the calculator.
 */
export function CalculatorSummary({ calc, nested = false }: { calc: SummaryKey; nested?: boolean }) {
  const s = getCalculatorSummary(calc);
  const headingId = `calc-summary-${calc}`;
  return (
    <section
      data-testid="calc-summary"
      data-calc={calc}
      aria-labelledby={headingId}
      // nested: inside a page wrapper that already sets the width and side padding
      className={nested ? undefined : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5'}
    >
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4 sm:px-5 text-sm leading-relaxed text-zinc-700 space-y-1.5">
        <h2 id={headingId} className="text-base font-semibold text-zinc-900">
          What this calculator does
        </h2>
        <p data-testid="calc-summary-what">{s.what}</p>
        <p data-testid="calc-summary-inputs">
          <span className="font-semibold text-zinc-900">What you enter:</span> {s.inputs}.
        </p>
        {s.example && (
          <p data-testid="calc-summary-example">
            <span className="font-semibold text-zinc-900">Example:</span> {s.example.lead} &rarr;{' '}
            <strong className="font-semibold text-zinc-900 tabular-nums" data-testid="calc-summary-figure">
              {s.example.figure}
            </strong>
            {s.example.tail}.{' '}
            {/* Plain <a>: a full load, so the calculator reads the example's URL settings on mount. */}
            <a
              href={s.example.href}
              data-testid="calc-summary-link"
              className="font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              Open this example
            </a>
          </p>
        )}
        <p className="text-zinc-500" data-testid="calc-summary-basis">
          {s.basis} {NO_ACCOUNT_LINE}
        </p>
      </div>
    </section>
  );
}
