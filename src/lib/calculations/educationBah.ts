/**
 * Post-9/11 GI Bill MHA basis: the E-5 with-dependents BAH at the school's ZIP,
 * for the BAH year VA uses for the academic year (EDUCATION_BAH_YEAR), NOT the
 * site's current BAH year. Between DoD's BAH release and VA's Aug 1 rate change
 * the two differ (e.g. BAH_YEAR 2027 while GI Bill MHA still uses 2026 BAH).
 *
 * Server/build only (reads the BAH registry). The education calculator in the
 * browser gets the same numbers from /api/bah/lookup?ratesYear=EDUCATION_BAH_YEAR.
 * The `tables` argument exists so tests can run with a BAH_YEAR-2027 fixture.
 */

import { EDUCATION_BAH_YEAR } from '@/data/education/2026/constants';
import { BAH_RATES_BY_YEAR, type MhaRateTable } from '@/data/bah/registry';
import { currentZipToMha } from '@/lib/calculations/bah';

export interface EducationBahTables {
  /** ZIP → MHA map (the current BAH year's; MHA codes carry across years). */
  zipToMha: Readonly<Record<string, string>>;
  /** Rates by year, as registered in src/data/bah/registry.ts. */
  ratesByYear: Readonly<Record<string, MhaRateTable>>;
}

const TERRITORY = 'XX499';

function defaultTables(): EducationBahTables {
  return { zipToMha: currentZipToMha(), ratesByYear: BAH_RATES_BY_YEAR };
}

function ratesFor(year: string, tables: EducationBahTables): MhaRateTable {
  const rates = tables.ratesByYear[year];
  if (!rates) {
    throw new Error(
      `EDUCATION_BAH_YEAR ${year} has no rates in the BAH registry (src/data/bah/registry.ts → BAH_RATES_BY_YEAR). Keep it registered until VA's Aug 1 rate change.`,
    );
  }
  return rates;
}

/** E-5 with-dependents BAH at a ZIP for the GI Bill year, or null (not found / territory). */
export function giBillBahAtZip(
  zip: string,
  year: string = EDUCATION_BAH_YEAR,
  tables: EducationBahTables = defaultTables(),
): number | null {
  const mha = tables.zipToMha[zip];
  if (!mha || mha === TERRITORY) return null;
  return ratesFor(year, tables)[mha]?.w['E-5'] ?? null;
}

/** E-5 with-dependents BAH for every MHA in the GI Bill year (territories excluded, > 0). */
export function giBillBahAllMhas(
  year: string = EDUCATION_BAH_YEAR,
  tables: EducationBahTables = defaultTables(),
): number[] {
  return Object.entries(ratesFor(year, tables))
    .filter(([code]) => !code.startsWith('XX'))
    .map(([, set]) => set.w['E-5'] ?? 0)
    .filter((v) => v > 0);
}
