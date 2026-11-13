/**
 * DoD BAH release history (src/data/bah/releaseHistory.ts) ↔ its source record
 * docs/sources/bah-release-history.md, row for row; 2027-status pastReleases and
 * the station pages' national average both derive from it.
 *
 * Data-only: no page fixture, no browser, no server.
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BAH_RELEASE_HISTORY, NATIONAL_AVG_BAH_INCREASE_BY_YEAR } from '@/data/bah/releaseHistory';
import { BAH_2027_STATUS } from '@/data/bah/2027-status';
import { NATIONAL_AVG_BAH_INCREASE } from '@/lib/calculations/bahStats';

const DOC = readFileSync(join(__dirname, '..', '..', 'docs', 'sources', 'bah-release-history.md'), 'utf8');

/** Rows of the history table: | year | x.x% | YYYY-MM-DD | source … | */
function docRows() {
  return DOC.split(/\r?\n/)
    .filter((l) => /^\|\s*\d{4}\s*\|/.test(l))
    .map((l) => {
      const c = l.split('|').slice(1, -1).map((x) => x.trim());
      return {
        ratesYear: Number(c[0]),
        avgIncreasePct: Number(c[1].replace('%', '')),
        releasedDate: c[2],
        // first URL in the source cell (trailing punctuation trimmed)
        sourceUrl: (/https:\/\/\S+/.exec(c[3])?.[0] ?? '').replace(/[.,;)]+$/, ''),
      };
    });
}

test.describe('BAH release history: data ↔ source doc', () => {
  test('the doc table parses to 6 rows (2026 → 2021); an empty parse fails', () => {
    const rows = docRows();
    expect(rows.length).toBe(6);
    expect(rows.map((r) => r.ratesYear)).toEqual([2026, 2025, 2024, 2023, 2022, 2021]);
  });

  test('releaseHistory.ts matches the doc row for row (year, percent, date, source URL)', () => {
    const rows = docRows();
    expect(BAH_RELEASE_HISTORY.length).toBe(rows.length);
    BAH_RELEASE_HISTORY.forEach((r, i) => {
      expect({ ratesYear: r.ratesYear, avgIncreasePct: r.avgIncreasePct, releasedDate: r.releasedDate, sourceUrl: r.sourceUrl }, String(r.ratesYear)).toEqual(rows[i]);
      expect(r.sourceUrl).toMatch(/^https:\/\//);
      expect(r.sourceLabel.length).toBeGreaterThan(0);
    });
  });

  test('2024 rates were released 2023-12-14 (not the JBSA repost date 2023-12-15)', () => {
    expect(BAH_RELEASE_HISTORY.find((r) => r.ratesYear === 2024)?.releasedDate).toBe('2023-12-14');
    expect(JSON.stringify(BAH_RELEASE_HISTORY)).not.toContain('2023-12-15');
    expect(DOC).toContain('WASHINGTON, December 14, 2023');
  });

  test('golden percents (literals): 4.2 / 5.4 / 5.4 / 12.1 / 5.1 / 2.9', () => {
    expect(BAH_RELEASE_HISTORY.map((r) => r.avgIncreasePct)).toEqual([4.2, 5.4, 5.4, 12.1, 5.1, 2.9]);
  });
});

test.describe('BAH release history: derived values', () => {
  test('2027-status pastReleases = the top 3 history rows before 2027 (no copy of its own)', () => {
    expect(BAH_2027_STATUS.pastReleases).toEqual(
      BAH_RELEASE_HISTORY.filter((r) => r.ratesYear < 2027)
        .slice(0, 3)
        .map(({ ratesYear, releasedDate }) => ({ ratesYear, releasedDate })),
    );
    expect(BAH_2027_STATUS.pastReleases).toEqual([
      { ratesYear: 2026, releasedDate: '2025-12-11' },
      { ratesYear: 2025, releasedDate: '2024-12-13' },
      { ratesYear: 2024, releasedDate: '2023-12-14' },
    ]);
  });

  test('station pages\' national average comes from the history', () => {
    expect(NATIONAL_AVG_BAH_INCREASE).toBe(NATIONAL_AVG_BAH_INCREASE_BY_YEAR);
    expect(NATIONAL_AVG_BAH_INCREASE['2026']).toBe(4.2);
    expect(NATIONAL_AVG_BAH_INCREASE['2027']).toBeUndefined(); // no 2027 figure until DoD publishes it
  });

  test('pending status carries no 2027 figures', () => {
    expect(BAH_2027_STATUS.status).toBe('pending');
    expect(BAH_2027_STATUS.avgIncreasePct).toBeNull();
    expect(BAH_2027_STATUS.releaseSourceUrl).toBeNull();
    expect(BAH_2027_STATUS.releasedDate).toBeNull();
  });
});
