/**
 * BAH kit test helpers (build W3).
 *
 * - MOCK_2027_KIT_SOURCE: the release-day stand-in, as in
 *   bah-share-image-unit.spec.ts: "2027" rates = the 2026 rates + $30, except
 *   TX270, whose 2026 temporary increase ends (2027 = its 2025 rates). 2026
 *   becomes the prior year, with its real mid-year record. Rents: the real HUD
 *   FY2027 file (paired with BAH 2027).
 * - Run directly, it renders the kit page body (BahKitView) for every CONUS
 *   station and prints { slug: html } as JSON:
 *     node --import tsx tests/e2e/helpers/bahKitMock.ts live|mock2027
 *   Playwright compiles .tsx with its own JSX runtime (component testing), so
 *   React can't render the page components inside a spec; this runs them under
 *   tsx instead (tests/e2e/bah-kit-unit.spec.ts).
 */
import { BAH_RATES_BY_YEAR, BAH_LOOKUP_TABLES, BAH_MID_YEAR_CHANGES_BY_YEAR } from '../../../src/data/bah/registry';
import { getPairedFMR } from '../../../src/lib/calculations/fmr';
import { LIVE_BAH_KIT_SOURCE, type BahKitSource } from '../../../src/lib/bahKit';

export const MOCK_BUMP = 30;
const rates2026 = BAH_RATES_BY_YEAR['2026'];
const rates2025 = BAH_RATES_BY_YEAR['2025'];
const MAP_2026 = BAH_LOOKUP_TABLES['2026']!.zipToMha;

/** Mocked 2027 rates for an MHA (w = with dependents, wo = without). */
export function mock2027(mha: string, dep: 'w' | 'wo'): Record<string, number> | null {
  if (mha === 'TX270') return rates2025[mha]?.[dep] ?? null;
  const r = rates2026[mha]?.[dep];
  return r ? Object.fromEntries(Object.entries(r).map(([g, v]) => [g, v + MOCK_BUMP])) : null;
}

export const MOCK_2027_KIT_SOURCE: BahKitSource = {
  year: '2027',
  priorYear: '2026',
  effectiveNotice: false,
  mhaForZip: (zip) => MAP_2026[zip] ?? null,
  priorMhaForZip: (zip) => MAP_2026[zip] ?? null,
  ratesWithDeps: (mha, year) => (year === '2027' ? mock2027(mha, 'w') : year === '2026' ? rates2026[mha]?.w ?? null : null),
  ratesWithoutDeps: (mha, year) => (year === '2027' ? mock2027(mha, 'wo') : year === '2026' ? rates2026[mha]?.wo ?? null : null),
  midYearChange: (mha, year) => (year === '2026' ? BAH_MID_YEAR_CHANGES_BY_YEAR['2026']?.[mha] ?? null : null),
  rent: (mha, bahYear) => getPairedFMR(mha, bahYear, 2),
  mhaLabel: LIVE_BAH_KIT_SOURCE.mhaLabel,
};

async function main(mode: string) {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { BahKitView } = await import('../../../src/components/bah-kit/BahKitView');
  const { bahKitData, bahKitStations } = await import('../../../src/lib/bahKit');
  const source = mode === 'mock2027' ? MOCK_2027_KIT_SOURCE : mode === 'norent' ? { ...LIVE_BAH_KIT_SOURCE, rent: () => null } : LIVE_BAH_KIT_SOURCE;
  const out: Record<string, string> = {};
  for (const s of bahKitStations(source)) {
    out[s.slug] = renderToStaticMarkup(createElement(BahKitView, { kit: bahKitData(s.slug, source)! }));
  }
  process.stdout.write(JSON.stringify(out));
}

if (process.argv[1] && /bahKitMock\.ts$/.test(process.argv[1])) {
  main(process.argv[2] ?? 'live').catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
