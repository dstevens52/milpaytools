/**
 * S8 (FIX_QUEUE row 10): the Post-9/11 GI Bill housing totals in
 * post-911-gi-bill-explained-2026, computed the way <GiBillMhaFigure> computes
 * its rates: the E-5 with-dependents BAH at the school ZIP for EDUCATION_BAH_YEAR
 * (giBillBahAtZip), full time at the 100% tier, times the months the post states.
 * The books stipend is EDUCATION_RATES.giBill.bookStipendAnnualMax per year.
 *
 * `data` carries the academic-year label with the rates, so the label and the
 * totals change together on VA's Aug. 1 rate change. Server/build only.
 */

import { EDUCATION_BAH_YEAR, EDUCATION_RATES } from '@/data/education/2026/constants';
import { giBillBahAtZip, type EducationBahTables } from '@/lib/calculations/educationBah';

export interface GiBillPostData {
  /** The BAH year behind the MHA (EDUCATION_BAH_YEAR). */
  bahYear: string;
  /** "2026–2027": the academic year those rates pay. */
  academicYear: string;
  bookStipendAnnualMax: number;
  /** BAH tables; omitted = the registry (tests pass a fixture). */
  tables?: EducationBahTables;
}

export const CURRENT_GI_BILL_POST_DATA: GiBillPostData = {
  bahYear: EDUCATION_BAH_YEAR,
  academicYear: EDUCATION_RATES.academicYear,
  bookStipendAnnualMax: EDUCATION_RATES.giBill.bookStipendAnnualMax,
};

export interface GiBillTotal {
  academicYear: string;
  mhaMonthly: number;
  months: number;
  mhaTotal: number;
  years: number;
  books: number;
  total: number;
}

/** MHA × months, plus the books stipend × years (tuition left out: the post covers it separately). */
export function giBillTotalAtZip(
  zip: string,
  months: number,
  years: number,
  data: GiBillPostData = CURRENT_GI_BILL_POST_DATA,
): GiBillTotal {
  if (!(months > 0) || !(years >= 0)) throw new Error(`giBillPost: bad months/years ${months}/${years}`);
  const mha = data.tables ? giBillBahAtZip(zip, data.bahYear, data.tables) : giBillBahAtZip(zip, data.bahYear);
  if (mha === null || !(mha > 0)) throw new Error(`giBillPost: no GI Bill MHA for ZIP ${zip}`);
  const mhaTotal = mha * months;
  const books = data.bookStipendAnnualMax * years;
  return { academicYear: data.academicYear, mhaMonthly: mha, months, mhaTotal, years, books, total: mhaTotal + books };
}
