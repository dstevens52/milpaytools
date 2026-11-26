import { giBillBahAtZip, giBillBahAllMhas } from '@/lib/calculations/educationBah';
import { getLocationDisplayName } from '@/lib/calculations/bah';
import { EDUCATION_RATES } from '@/data/education/2026/constants';
import { formatCurrency } from '@/lib/utils';
import { giBillTotalAtZip } from '@/lib/giBillPost';

// S7b: GI Bill housing allowance (MHA) examples for posts, from the same data the
// education calculator uses for a school ZIP: E-5 with-dependents BAH for
// EDUCATION_BAH_YEAR (giBillBahAtZip), the online-only rate from EDUCATION_RATES.
// Full time, 100% tier, in person. Area names come from DTMO's MHA names. Server only.

const usd = (n: number) => formatCurrency(Math.round(n));

function mhaAt(zip: string): { mha: number; area: string } {
  const mha = giBillBahAtZip(zip);
  if (mha === null || !(mha > 0)) throw new Error(`GiBillMha: no GI Bill MHA for ZIP ${zip}`);
  return { mha, area: getLocationDisplayName(zip) ?? `ZIP ${zip}` };
}

/** Example table: one row per school ZIP (comma-separated `zips`), plus the online-only rate. */
export function GiBillMhaTable({ zips }: { zips: string }) {
  const list = zips.split(',').map((z) => z.trim()).filter(Boolean);
  if (list.length === 0) throw new Error('GiBillMhaTable: no ZIPs');
  return (
    <table data-testid="gi-bill-mha-table">
      <thead>
        <tr>
          <th>School ZIP</th>
          <th>Housing area (DTMO)</th>
          <th>Monthly housing allowance ({EDUCATION_RATES.academicYear})</th>
        </tr>
      </thead>
      <tbody>
        {list.map((zip) => {
          const { mha, area } = mhaAt(zip);
          return (
            <tr key={zip}>
              <td>{zip}</td>
              <td>{area}</td>
              <td>{usd(mha)}/month</td>
            </tr>
          );
        })}
        <tr>
          <td>Online only</td>
          <td>Any school</td>
          <td>up to {usd(EDUCATION_RATES.giBill.onlineMHAMonthly)}/month</td>
        </tr>
      </tbody>
    </table>
  );
}

type TotalFigure = 'mha' | 'mhaTotal' | 'books' | 'total' | 'area' | 'academicYear';

/**
 * S8: one figure from a degree-length housing total at a school ZIP (src/lib/giBillPost.ts):
 * the monthly MHA, MHA × `months`, the books stipend × `years`, their sum, or the DTMO area name.
 * Props are strings (MDX drops JS-expression props).
 */
export function GiBillTotalFigure({
  name,
  zip,
  months = '33',
  years = '4',
}: {
  name: TotalFigure;
  zip: string;
  months?: string;
  years?: string;
}) {
  const m = Number(months);
  const y = Number(years);
  if (!Number.isInteger(m) || m <= 0) throw new Error(`GiBillTotalFigure: bad months "${months}"`);
  if (!Number.isInteger(y) || y < 0) throw new Error(`GiBillTotalFigure: bad years "${years}"`);
  const t = giBillTotalAtZip(zip, m, y);
  switch (name) {
    case 'mha':
      return <>{usd(t.mhaMonthly)}</>;
    case 'mhaTotal':
      return <>{usd(t.mhaTotal)}</>;
    case 'books':
      return <>{usd(t.books)}</>;
    case 'total':
      return <>{usd(t.total)}</>;
    case 'area':
      return <>{mhaAt(zip).area}</>;
    case 'academicYear':
      return <>{t.academicYear}</>;
  }
}

type MhaFigure = 'lowest' | 'highest' | 'online' | 'areas' | 'academicYear';

/** One GI Bill MHA figure for prose: the lowest / highest across all housing areas, the online rate. */
export function GiBillMhaFigure({ name }: { name: MhaFigure }) {
  const all = giBillBahAllMhas();
  if (all.length === 0) throw new Error('GiBillMhaFigure: no MHA rates');
  switch (name) {
    case 'lowest':
      return <>{usd(Math.min(...all))}</>;
    case 'highest':
      return <>{usd(Math.max(...all))}</>;
    case 'online':
      return <>{usd(EDUCATION_RATES.giBill.onlineMHAMonthly)}</>;
    case 'areas':
      return <>{all.length}</>;
    case 'academicYear':
      return <>{EDUCATION_RATES.academicYear}</>;
  }
}
