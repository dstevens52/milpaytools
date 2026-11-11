/**
 * Locks src/data/pay-tables/2026.ts to the DFAS 2026 basic pay tables.
 *
 * Data-only: no page fixture, so no browser is launched. Source snapshot:
 * docs/sources/dfas-2026-basic-pay.csv (see docs/sources/README.md for the
 * DFAS URLs and retrieval date). Every DFAS cell is resolved through the same
 * YOS bracket logic the app uses and must match to the cent; every blank DFAS
 * cell must resolve to "no value".
 *
 * Needs no server. Run it without one via `npm run test:pay-table`
 * (a non-localhost BASE_URL turns off the config's webServer).
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { payTable, E1_UNDER_4_MONTHS } from '@/data/pay-tables/2026';
import { getYOSBracket } from '@/lib/utils';
import { lookupBasePay } from '@/lib/calculations/basePay';

const CSV_PATH = join(__dirname, '..', '..', 'docs', 'sources', 'dfas-2026-basic-pay.csv');
const EXPECTED_FILLED_CELLS = 541;

/** DFAS column header → years of service that column starts at. */
function columnYos(header: string): number {
  if (header === '2_or_less') return 0;
  const m = /^over_(\d+)$/.exec(header);
  if (!m) throw new Error(`Unexpected CSV column header: ${header}`);
  return Number(m[1]);
}

/** Convert dollars to integer cents so comparisons are exact to the cent. */
const cents = (dollars: number) => Math.round(dollars * 100);

/**
 * The site's value for a grade at a DFAS column: highest table key ≤ the
 * column's bracket (getYOSBracket). Undefined when no such key exists.
 */
function resolveSiteValue(grade: string, yos: number): number | undefined {
  const gradeTable = payTable[grade as keyof typeof payTable] as Record<number, number | undefined>;
  const bracket = getYOSBracket(yos);
  const keys = Object.keys(gradeTable)
    .map(Number)
    .filter((k) => k <= bracket && gradeTable[k] !== undefined)
    .sort((a, b) => b - a);
  return keys.length ? gradeTable[keys[0]] : undefined;
}

interface CsvRow {
  grade: string;
  cells: { header: string; yos: number; value: number | null }[];
}

function readCsv(): { headers: string[]; rows: CsvRow[] } {
  const lines = readFileSync(CSV_PATH, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '');
  const [headerLine, ...dataLines] = lines;
  const [gradeCol, ...headers] = headerLine.split(',').map((h) => h.trim());
  if (gradeCol !== 'grade') throw new Error(`First CSV column must be "grade", got "${gradeCol}"`);
  const rows = dataLines.map((line) => {
    const [grade, ...raw] = line.split(',').map((c) => c.trim());
    if (raw.length !== headers.length) {
      throw new Error(`${grade}: ${raw.length} cells, expected ${headers.length}`);
    }
    return {
      grade,
      cells: raw.map((c, i) => ({
        header: headers[i],
        yos: columnYos(headers[i]),
        value: c === '' ? null : Number(c),
      })),
    };
  });
  return { headers, rows };
}

test.describe('2026 pay table matches DFAS source snapshot', () => {
  const { headers, rows } = readCsv();

  test('CSV is non-empty and has the expected shape', () => {
    // Guard: an empty CSV would make every loop below pass vacuously.
    expect(headers.length).toBe(22);
    expect(rows.length).toBe(27);
  });

  test('grade sets match in both directions', () => {
    const csvGrades = rows.map((r) => r.grade).sort();
    const siteGrades = Object.keys(payTable).sort();
    expect(siteGrades.length).toBeGreaterThan(0);
    expect(siteGrades).toEqual(csvGrades);
  });

  test(`every DFAS cell matches to the cent (${EXPECTED_FILLED_CELLS} cells)`, () => {
    let checked = 0;
    let blanks = 0;
    const failures: string[] = [];

    for (const row of rows) {
      for (const cell of row.cells) {
        const site = resolveSiteValue(row.grade, cell.yos);
        const app = lookupBasePay(row.grade, cell.yos);
        if (cell.value === null) {
          blanks++;
          if (site !== undefined) {
            failures.push(`${row.grade} ${cell.header}: DFAS blank, site resolves to ${site}`);
          }
          continue;
        }
        if (Number.isNaN(cell.value)) {
          failures.push(`${row.grade} ${cell.header}: unparseable CSV value`);
          continue;
        }
        checked++;
        if (site === undefined || cents(site) !== cents(cell.value)) {
          failures.push(`${row.grade} ${cell.header}: DFAS ${cell.value.toFixed(2)}, site ${site}`);
        }
        // The calculator lookup must agree with the bracket resolution too.
        if (cents(app) !== cents(cell.value)) {
          failures.push(`${row.grade} ${cell.header}: DFAS ${cell.value.toFixed(2)}, lookupBasePay ${app}`);
        }
      }
    }

    console.log(`pay-table-dfas: ${checked} cells checked, ${blanks} blank cells checked, ${failures.length} failures`);
    expect(failures).toEqual([]);
    expect(checked).toBe(EXPECTED_FILLED_CELLS);
  });

  test('E-1 under 4 months footnote is $2,225.70', () => {
    expect(E1_UNDER_4_MONTHS).toBe(2225.7);
  });
});
