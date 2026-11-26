import { dlaPostTable, maltPerMileText, CURRENT_PCS_POST_RATES } from '@/lib/pcsPost';

// S8: DLA table and MALT rate for pcs-financial-planning-guide, from the PCS
// calculator's rate file (src/lib/pcsPost.ts). Server only.

/** The DLA table, with its year label in the heading row above it. */
export function PcsDlaTable() {
  const t = dlaPostTable();
  return (
    <>
      <p>
        <strong>{t.year} DLA rates (DTMO):</strong>
      </p>
      <table data-testid="pcs-dla-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Without dependents</th>
            <th>With dependents</th>
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td>{r.without}</td>
              <td>{r.with}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** "maltPerMile" → "$0.205"; "year" → the rate file's year. */
export function PcsFigure({ name }: { name: 'maltPerMile' | 'year' }) {
  return <>{name === 'maltPerMile' ? maltPerMileText() : CURRENT_PCS_POST_RATES.year}</>;
}
