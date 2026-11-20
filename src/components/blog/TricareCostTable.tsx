import { tricareTable, type TableName } from '@/lib/tricarePost';

// A named TRICARE cost table (2026 | 2027 | Change), or TRICARE's official
// 2027 comparison table with its footnotes. Built from the TRICARE year files
// by src/lib/tricarePost.ts. Server only.

export function TricareCostTable({ name }: { name: TableName }) {
  const t = tricareTable(name);
  return (
    <div className="not-prose my-6" data-tricare-table={name}>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              {t.head.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-3 py-2 font-semibold text-zinc-700 ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {t.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-3 py-2 text-left font-normal text-zinc-700">
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-3 py-2 text-right tabular-nums text-zinc-700">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(t.footnotes || t.source) && (
        <div className="mt-2 space-y-1 text-xs leading-relaxed text-zinc-500">
          {t.footnotes?.map((f) => <p key={f}>{f}</p>)}
          {t.source && (
            <p>
              Source:{' '}
              <a href={t.source.url} className="text-red-700 hover:underline" rel="noopener">
                {t.source.title}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
