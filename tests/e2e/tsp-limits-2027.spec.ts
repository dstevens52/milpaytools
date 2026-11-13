/**
 * 2027 TSP limits (IRS Notice 2026-66 / IR-2026-136, announced Nov 12, 2026).
 *
 * Data-only: no page fixture, no browser, no server. Locks
 * src/data/tsp/2027/constants.ts (and the 2026 column) to the source record
 * docs/sources/tsp-limits-2027.md, row for row, and checks each 2027 figure
 * appears in the verbatim IRS sentences recorded there.
 * Run alone with:
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/tsp-limits-2027.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TSP_CONSTANTS_2026 } from '@/data/tsp/2026/constants';
import {
  TSP_CONSTANTS_2027,
  TSP_LIMITS_2027_ANNOUNCED,
  TSP_LIMITS_2027_NOTICE,
  TSP_LIMITS_2027_SOURCE_URL,
} from '@/data/tsp/2027/constants';

const DOC = readFileSync(join(__dirname, '..', '..', 'docs', 'sources', 'tsp-limits-2027.md'), 'utf8');

type LimitKey = 'electiveDeferralLimit' | 'catchUpLimit' | 'enhancedCatchUpLimit' | 'annualAdditionsLimit';
const KEYS: LimitKey[] = ['electiveDeferralLimit', 'catchUpLimit', 'enhancedCatchUpLimit', 'annualAdditionsLimit'];

/** "$25,500" → 25500 */
const money = (s: string) => Number(s.replace(/[$,\s]/g, ''));

/** Rows of the "## Limits" table: | label | key | 2026 | 2027 | */
function docRows(): { key: string; y2026: number; y2027: number }[] {
  const section = DOC.split('## Limits')[1]?.split('\n## ')[0] ?? '';
  return section
    .split(/\r?\n/)
    .filter((l) => /^\|.*\$\d/.test(l))
    .map((l) => {
      const cells = l.split('|').slice(1, -1).map((c) => c.trim());
      return { key: cells[1], y2026: money(cells[2]), y2027: money(cells[3]) };
    });
}

test.describe('TSP 2027 limits: data matches docs/sources/tsp-limits-2027.md', () => {
  test('the source table has exactly the four limits, in order', () => {
    const rows = docRows();
    expect(rows.length).toBe(4); // a broken parse reads 0 rows, which must fail
    expect(rows.map((r) => r.key)).toEqual(KEYS);
  });

  test('2027 constants match the source table row for row', () => {
    for (const r of docRows()) {
      expect(TSP_CONSTANTS_2027[r.key as LimitKey], r.key).toBe(r.y2027);
    }
    expect(TSP_CONSTANTS_2027.DATA_YEAR).toBe(2027);
  });

  test('the 2026 column matches the 2026 constants (Notice 2025-67)', () => {
    for (const r of docRows()) {
      expect(TSP_CONSTANTS_2026[r.key as LimitKey], r.key).toBe(r.y2026);
    }
  });

  test('golden values (literals): $25,500 / $8,500 / $11,750 / $75,000', () => {
    expect(TSP_CONSTANTS_2027.electiveDeferralLimit).toBe(25_500);
    expect(TSP_CONSTANTS_2027.catchUpLimit).toBe(8_500);
    expect(TSP_CONSTANTS_2027.enhancedCatchUpLimit).toBe(11_750);
    expect(TSP_CONSTANTS_2027.annualAdditionsLimit).toBe(75_000);
  });

  test('each 2027 figure appears in a verbatim IRS sentence in the source record', () => {
    const verbatim = DOC.split('## Verbatim IRS sentences')[1]?.split('\n## ')[0] ?? '';
    expect(verbatim.length).toBeGreaterThan(0);
    expect(verbatim).toContain('is increased to $25,500, up from $24,500 for 2026.');
    expect(verbatim).toContain('is increased to $8,500, up from $8,000 for 2026.');
    expect(verbatim).toContain('this higher catch-up contribution limit is $11,750 instead of the $8,500 noted above.');
    expect(verbatim).toContain('is increased in 2027 from $72,000 to $75,000.');
  });

  test('announcement date, notice number and source URL match the record', () => {
    expect(TSP_LIMITS_2027_ANNOUNCED).toBe('2026-11-12');
    expect(DOC).toContain('**Announced:** November 12, 2026');
    expect(TSP_LIMITS_2027_NOTICE).toBe('IRS Notice 2026-66');
    expect(DOC).toContain('IRS Notice 2026-66');
    expect(TSP_LIMITS_2027_SOURCE_URL).toBe('https://www.irs.gov/pub/irs-drop/n-26-66.pdf');
    expect(DOC).toContain(TSP_LIMITS_2027_SOURCE_URL);
  });
});
