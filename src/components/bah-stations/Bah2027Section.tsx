import Link from 'next/link';
import {
  BAH_2027_HUB_ANCHOR,
  bah2027Facts,
  bah2027HubHeading,
  bah2027HubMode,
  bah2027HubStatusText,
} from '@/data/bah/2027-status';
import { BAH_RELEASE_HISTORY } from '@/data/bah/releaseHistory';
import {
  DOD_RATE_PROTECTION_QUOTE,
  DOD_RATE_PROTECTION_QUOTE_SOURCE,
  RATE_PROTECTION_PROMOTION,
  RATE_PROTECTION_RULE,
  TEMPORARY_INCREASE_EXCEPTION,
  TEMPORARY_INCREASE_SOURCES,
} from '@/data/bah/rateProtection';
import { formatIsoDate } from '@/lib/calculations/payRaise';

const ext = { target: '_blank', rel: 'noopener noreferrer', className: 'underline text-blue-700 hover:text-blue-800' } as const;

/**
 * /bah "#2027": release status, DoD's increase history, how BAH is set, the pay
 * raise, and rate protection. Status-driven (src/data/bah/2027-status.ts): pending →
 * "released" → loaded (BAH_YEAR 2027). Official figures only; no estimates.
 */
export function Bah2027Section() {
  const mode = bah2027HubMode();
  const facts = bah2027Facts();
  // Which release states which fact (docs/sources/bah-release-history.md → "How BAH is set"):
  // rent + utilities: the 2023-rates release; 5% cost-sharing: the 2022, 2025 and 2026 releases.
  const methodSource = BAH_RELEASE_HISTORY.find((r) => r.ratesYear === 2023);
  const costShareSource = BAH_RELEASE_HISTORY.find((r) => r.ratesYear === 2026);

  return (
    <section
      id={BAH_2027_HUB_ANCHOR}
      className="scroll-mt-20 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6 space-y-6"
      data-testid="bah-2027-section"
      data-mode={mode}
      aria-labelledby="bah-2027-h"
    >
      <div>
        <h2 id="bah-2027-h" className="text-xl font-semibold text-zinc-900 mb-2">
          {bah2027HubHeading(mode)}
        </h2>
        <p className="text-sm text-zinc-700 leading-relaxed" data-testid="bah-2027-status">
          {bah2027HubStatusText(mode)}
          {mode !== 'pending' && facts.sourceUrl && (
            <>
              {' '}
              <a href={facts.sourceUrl} {...ext}>DoD release</a>
            </>
          )}
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-zinc-900 mb-2">BAH increases by year</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="bah-release-history">
            <caption className="caption-bottom text-left text-xs text-zinc-500 pt-2">
              Source: DoD release for each year.
            </caption>
            <thead>
              <tr className="border-b border-zinc-200 text-left">
                <th scope="col" className="font-semibold text-zinc-700 pb-1.5 pr-3">Rates year</th>
                <th scope="col" className="font-semibold text-zinc-700 pb-1.5 pr-3 text-right">Average increase</th>
                <th scope="col" className="font-semibold text-zinc-700 pb-1.5">Released</th>
              </tr>
            </thead>
            <tbody>
              {BAH_RELEASE_HISTORY.map((r) => (
                <tr key={r.ratesYear} className="border-b border-zinc-100">
                  <th scope="row" className="font-normal text-left text-zinc-700 py-1.5 pr-3">{r.ratesYear}</th>
                  <td className="py-1.5 pr-3 text-right tabular-nums font-semibold text-zinc-900">{`${r.avgIncreasePct}%`}</td>
                  <td className="py-1.5">
                    <a href={r.sourceUrl} {...ext}>{formatIsoDate(r.releasedDate)}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed mt-2">
          The average is across all areas, pay grades and dependency statuses. Individual rates can
          rise more, less, or fall.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-zinc-900 mb-2">How BAH is set</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          DoD sets BAH from the median current market rent plus average utilities (electricity,
          heat and water/sewer) in each military housing area, by pay grade and dependency status
          {methodSource && (
            <>
              {' '}(<a href={methodSource.sourceUrl} {...ext}>{`${methodSource.ratesYear} rates release`}</a>)
            </>
          )}
          . Members share part of the cost: the rates include out-of-pocket cost-sharing of five
          percent of the national average housing cost by pay grade
          {costShareSource && (
            <>
              {' '}(<a href={costShareSource.sourceUrl} {...ext}>{`${costShareSource.ratesYear} rates release`}</a>)
            </>
          )}
          .
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-zinc-900 mb-2">The pay raise doesn&apos;t set BAH</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          BAH is set from housing costs by location, pay grade and dependency status. The 2027
          basic pay raise doesn&apos;t change it.{' '}
          <Link href="/pay/raise" className="font-medium text-red-700 hover:text-red-800 underline">
            See the 2027 pay raise →
          </Link>
        </p>
      </div>

      <div id="rate-protection" className="scroll-mt-20">
        <h3 className="text-base font-semibold text-zinc-900 mb-2">Rate protection</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {`${RATE_PROTECTION_RULE} ${RATE_PROTECTION_PROMOTION}`}
        </p>
        <blockquote className="mt-3 border-l-2 border-zinc-300 pl-3 text-sm text-zinc-700 italic leading-relaxed">
          &ldquo;{DOD_RATE_PROTECTION_QUOTE}&rdquo;
          <footer className="not-italic text-xs text-zinc-500 mt-1">
            <a href={DOD_RATE_PROTECTION_QUOTE_SOURCE.url} {...ext}>{DOD_RATE_PROTECTION_QUOTE_SOURCE.label}</a>
          </footer>
        </blockquote>
        <p className="text-sm text-zinc-600 leading-relaxed mt-3">
          {TEMPORARY_INCREASE_EXCEPTION}{' '}
          <span className="text-xs text-zinc-500">
            Sources:{' '}
            {TEMPORARY_INCREASE_SOURCES.map((s, i) => (
              <span key={s.url}>
                {i > 0 && '; '}
                <a href={s.url} {...ext}>{s.label}</a>
              </span>
            ))}
            .
          </span>
        </p>
      </div>
    </section>
  );
}
