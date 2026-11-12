import { COLA_AREAS, COLA_SOURCE, DATA_YEAR, formatRetrievedDate } from '@/data/cola/2026/constants';

/** id of the area table; the calculator's "see the list" links scroll here. */
export const COLA_AREA_TABLE_ID = 'cola-areas';

/** All 2026 CONUS COLA areas, generated from the data file (no hand-keyed rows). */
export function ColaAreaTable() {
  return (
    <section id={COLA_AREA_TABLE_ID} className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-zinc-900 mb-3">
        All {COLA_AREAS.length} CONUS COLA areas for {DATA_YEAR}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-zinc-200 rounded-lg overflow-hidden" data-testid="cola-area-table">
          <thead>
            <tr className="bg-zinc-50">
              <th scope="col" className="text-left px-4 py-3 font-semibold text-zinc-700">State</th>
              <th scope="col" className="text-left px-4 py-3 font-semibold text-zinc-700">Military housing area</th>
              <th scope="col" className="text-right px-4 py-3 font-semibold text-zinc-700">{DATA_YEAR} COLA index</th>
            </tr>
          </thead>
          <tbody>
            {COLA_AREAS.map((a) => (
              <tr key={a.mhaCode} className="border-t border-zinc-100" data-testid="cola-area-row">
                <td className="px-4 py-2.5 text-zinc-600">{a.state}</td>
                <td className="px-4 py-2.5 font-medium text-zinc-800">{a.dtmoName}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-zinc-800">{a.index}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500 mt-2" data-testid="cola-area-source">
        Source:{' '}
        <a
          href={COLA_SOURCE.sourceUrl}
          target="_blank"
          rel="noopener"
          className="underline hover:text-zinc-700"
        >
          DTMO, {COLA_SOURCE.title}
        </a>{' '}
        (retrieved {formatRetrievedDate()})
      </p>
    </section>
  );
}
