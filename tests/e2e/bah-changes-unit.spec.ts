import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BAH_YEAR, BAH_PRIOR_YEAR } from '../../src/data/bah/current';
import { BAH_RATES_BY_YEAR, BAH_MID_YEAR_CHANGES_BY_YEAR, type MhaRateTable } from '../../src/data/bah/registry';
import { BAH_MHA_COUNT, currentMhaNames } from '../../src/lib/calculations/bah';
import { MHA_TO_STATION_PAGES } from '../../src/data/bah/mhaToStationPage';
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { RATE_PROTECTION_RULE, TEMPORARY_INCREASE_EXCEPTION } from '../../src/data/bah/rateProtection';
import { currentBahChanges } from '../../src/lib/calculations/bahChangesData';
import {
  buildBahChanges,
  bahChangesDatasetSchema,
  bahChangesDescription,
  bahChangesFaqs,
  bahChangesH1,
  bahChangesProtectionText,
  bahChangesScopeLine,
  bahChangesTitle,
  toTableRows,
  type BahChangeRow,
} from '../../src/lib/calculations/bahChanges';

/**
 * /bah/changes — data-only (no browser or server):
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/bah-changes-unit.spec.ts --project=chromium
 */

const ROOT = path.resolve(__dirname, '..', '..');
const C = currentBahChanges();

test.describe('/bah/changes data', () => {
  test('one row per MHA (BAH_MHA_COUNT), current year vs prior year', () => {
    expect(BAH_MHA_COUNT).toBe(338);
    expect(C.count).toBe(BAH_MHA_COUNT);
    expect(C.rows).toHaveLength(BAH_MHA_COUNT);
    expect(new Set(C.rows.map((r) => r.mha)).size).toBe(BAH_MHA_COUNT);
    expect(C.year).toBe(BAH_YEAR);
    expect(C.priorYear).toBe(BAH_PRIOR_YEAR);
    expect(C.up + C.same + C.down + C.noPrior).toBe(C.count);
    // Every figure is the stored E-5 with-dependents rate, and the change is computed from them.
    for (const r of C.rows) {
      expect(r.current).toBe(BAH_RATES_BY_YEAR[BAH_YEAR][r.mha].w['E-5']);
      expect(r.prior).toBe(BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR][r.mha].w['E-5']);
      expect(r.abs).toBe(r.current - r.prior!);
      expect(r.pct).toBeCloseTo(((r.current - r.prior!) / r.prior!) * 100, 10);
    }
  });

  test('five MHAs through the accuracy chain: ZIP → MHA code → MHA name → rate file, both years', () => {
    // 2026 leg: DTMO's raw ASCII files in data/sources/dtmo/2026 (the January package).
    // 2025 leg: no raw file in the repo; the stored file src/data/bah/2025/mhaRates.ts
    // (DTMO 2025_BAH_Rates.pdf) — expected values below are typed from it.
    const dir = path.join(ROOT, 'data', 'sources', 'dtmo', '2026');
    const zipMha = new Map(
      readFileSync(path.join(dir, 'sorted_zipmha26.txt'), 'utf8').trim().split(/\r?\n/).map((l) => l.trim().split(/\s+/) as [string, string]),
    );
    const names = new Map(
      readFileSync(path.join(dir, 'mhanames26.txt'), 'utf8').trim().split(/\r?\n/).map((l) => l.split(';') as [string, string]),
    );
    const e5w = new Map(
      readFileSync(path.join(dir, 'bahw26.txt'), 'utf8').trim().split(/\r?\n/).map((l) => {
        const f = l.split(',');
        return [f[0], Number(f[5])] as [string, number]; // code, E-1..E-4, E-5
      }),
    );
    const CASES = [
      { zip: '28310', mha: 'NC182', name: 'FORT BRAGG/POPE, NC', e5_2025: 1785, e5_2026: 1806, abs: 21, pct: '1.2' },
      { zip: '92134', mha: 'CA038', name: 'SAN DIEGO, CA', e5_2025: 3987, e5_2026: 3975, abs: -12, pct: '-0.3' },
      { zip: '76544', mha: 'TX286', name: 'FORT HOOD, TX', e5_2025: 1581, e5_2026: 1695, abs: 114, pct: '7.2' },
      { zip: '35203', mha: 'AL007', name: 'BIRMINGHAM, AL', e5_2025: 2106, e5_2026: 2439, abs: 333, pct: '15.8' },
      { zip: '78520', mha: 'TX281', name: 'BROWNSVILLE, TX', e5_2025: 1623, e5_2026: 1503, abs: -120, pct: '-7.4' },
    ];
    for (const k of CASES) {
      expect(zipMha.get(k.zip), k.zip).toBe(k.mha);
      expect(names.get(k.mha)?.toUpperCase(), k.mha).toBe(k.name.toUpperCase());
      expect(currentMhaNames()[k.mha].toUpperCase()).toBe(names.get(k.mha)!.toUpperCase());
      const row = C.rows.find((r) => r.mha === k.mha)!;
      expect(row.current, `${k.mha} 2026 = raw bahw26.txt`).toBe(e5w.get(k.mha));
      expect(row.current).toBe(k.e5_2026);
      expect(row.prior, `${k.mha} 2025`).toBe(k.e5_2025);
      expect(row.abs).toBe(k.abs);
      expect(row.pct!.toFixed(1)).toBe(k.pct);
    }
  });

  test('stored 2026 = raw January file for every MHA except DTMO mid-year changes (TX270)', () => {
    const raw = readFileSync(path.join(ROOT, 'data', 'sources', 'dtmo', '2026', 'bahw26.txt'), 'utf8').trim().split(/\r?\n/);
    const diff: string[] = [];
    for (const l of raw) {
      const f = l.split(',');
      if (f[0] === 'XX499') continue;
      const stored = BAH_RATES_BY_YEAR['2026'][f[0]]?.w['E-5'];
      if (stored !== undefined && stored !== Number(f[5])) diff.push(f[0]);
    }
    expect(diff).toEqual(Object.keys(BAH_MID_YEAR_CHANGES_BY_YEAR['2026'] ?? {}));
    const tx = C.rows.find((r) => r.mha === 'TX270')!;
    expect(tx.note?.kind).toBe('temporary-current');
    expect(tx.note?.text).toBe("The 2026 rate includes DTMO's temporary increase effective May 16, 2026, which expires December 31, 2026.");
  });

  test('top-10 lists match an independent sort of the full data', () => {
    const all = Object.keys(BAH_RATES_BY_YEAR[BAH_YEAR]).map((m) => {
      const cur = BAH_RATES_BY_YEAR[BAH_YEAR][m].w['E-5'];
      const pri = BAH_RATES_BY_YEAR[BAH_PRIOR_YEAR][m].w['E-5'];
      return { m, abs: cur - pri, pct: ((cur - pri) / pri) * 100 };
    });
    const ups = all.filter((x) => x.abs > 0).sort((a, b) => b.pct - a.pct).slice(0, 10).map((x) => x.m);
    const downs = all.filter((x) => x.abs < 0).sort((a, b) => a.pct - b.pct).slice(0, 10).map((x) => x.m);
    expect(C.topIncreases.map((r) => r.mha)).toEqual(ups);
    expect(C.topDecreases.map((r) => r.mha)).toEqual(downs);
    expect(C.largestIncrease?.mha).toBe(ups[0]);
    expect(C.largestDecrease?.mha).toBe(downs[0]);
    // Full table default order is % change, descending.
    const pcts = C.rows.map((r) => r.pct!);
    expect(pcts).toEqual([...pcts].sort((a, b) => b - a));
    expect(C.up).toBe(all.filter((x) => x.abs > 0).length);
    expect(C.down).toBe(all.filter((x) => x.abs < 0).length);
  });

  test('station links come from mhaToStationPage; no station slug collides with /bah/changes', () => {
    expect(DUTY_STATIONS.some((s) => s.slug === 'changes')).toBe(false);
    for (const r of C.rows) {
      expect(r.station).toEqual(MHA_TO_STATION_PAGES[r.mha]?.[0] ?? null);
    }
    expect(C.rows.filter((r) => r.station).length).toBe(Object.keys(MHA_TO_STATION_PAGES).length);
  });

  test('the client table gets only the slim rows', () => {
    const slim = toTableRows(C.rows);
    expect(Object.keys(slim[0]).sort()).toEqual(['abs', 'current', 'href', 'marked', 'mha', 'name', 'pct', 'prior']);
    expect(JSON.stringify(slim).length).toBeLessThan(60_000);
  });
});

test.describe('/bah/changes text', () => {
  test('title, H1, description and scope line', () => {
    expect(bahChangesTitle(C.year)).toBe('2026 BAH Changes: Biggest Increases and Decreases by Area');
    expect(bahChangesTitle(C.year).length).toBe(57);
    expect(bahChangesH1(C.year)).toBe('2026 BAH Changes by Military Housing Area');
    const d = bahChangesDescription(C);
    expect(d).toBe('How 2026 BAH changed from 2025 in all 338 military housing areas: E-5 with dependents, biggest increases and decreases. Official DTMO rates.');
    expect(d.length).toBeLessThanOrEqual(160);
    expect(bahChangesScopeLine(C)).toBe('338 housing areas · E-5 with dependents · 2025 → 2026 · source DTMO');
  });

  test('FAQ: four questions; release timing only from past release dates; rate protection is the approved text', () => {
    const faqs = bahChangesFaqs(C);
    expect(faqs.map((f) => f.question)).toEqual([
      'When do 2027 BAH rates come out?',
      'Why did BAH go down in some areas?',
      "Does BAH change if I'm already stationed there?",
      'Where do these numbers come from?',
    ]);
    expect(faqs[0].answer).toContain('December 11, 2025 (2026 rates), December 13, 2024 (2025 rates) and December 14, 2023 (2024 rates)');
    expect(faqs[0].answer).not.toMatch(/expected|likely|around|mid-December 2026/i);
    expect(faqs[1].answer).toContain(RATE_PROTECTION_RULE);
    expect(faqs[2].answer).toContain(RATE_PROTECTION_RULE);
    expect(faqs[2].answer).toContain(TEMPORARY_INCREASE_EXCEPTION);
    expect(faqs[3].answer).toContain('(https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/)');
    expect(faqs[3].answer).toContain('(4.2%)');
    // No dollar figure in the FAQ at all.
    expect(faqs.map((f) => f.answer).join(' ')).not.toContain('$');
  });

  test('Dataset JSON-LD: source is DTMO, coverage is the two years', () => {
    const s = bahChangesDatasetSchema(C);
    expect(s['@type']).toBe('Dataset');
    expect(s.creator.name).toBe('Defense Travel Management Office');
    expect(s.temporalCoverage).toBe('2025-01-01/2026-12-31');
    expect(s.distribution.contentUrl).toBe('https://www.milpaytools.com/bah/changes');
    expect(s.description.length).toBeGreaterThanOrEqual(50);
  });

  test('no 2027 figure while BAH_YEAR is 2026', () => {
    test.skip(BAH_YEAR !== '2026', 'checks the pre-flip state');
    const faqs = bahChangesFaqs(C);
    const text = [
      bahChangesTitle(C.year), bahChangesH1(C.year), bahChangesDescription(C), bahChangesScopeLine(C),
      ...bahChangesProtectionText(C), ...faqs.flatMap((f) => [f.question, f.answer]),
      ...C.rows.flatMap((r) => [r.name, r.note?.text ?? '']),
    ].join('\n');
    // "2027" appears only as the next year in the release-timing FAQ.
    const hits = [...text.matchAll(/2027/g)].length;
    expect(hits).toBe([...(faqs[0].question + faqs[0].answer).matchAll(/2027/g)].length);
    expect(text).not.toMatch(/2027[^.\n]*\$\d/);
  });
});

test.describe('/bah/changes — release-day flip (fixture data)', () => {
  // SYNTHETIC 2027 table: every 2026 E-5 rate + $30, except TX270 −$300 (its
  // 2026 temporary increase ends) and NC182 unchanged. Never shown on the site.
  const fixture2027: MhaRateTable = Object.fromEntries(
    Object.entries(BAH_RATES_BY_YEAR['2026']).map(([m, set]) => {
      const e5 = set.w['E-5'];
      const next = m === 'TX270' ? e5 - 300 : m === 'NC182' ? e5 : e5 + 30;
      return [m, { w: { ...set.w, 'E-5': next }, wo: set.wo }];
    }),
  );
  const F = buildBahChanges({
    year: '2027',
    priorYear: '2026',
    current: fixture2027,
    prior: BAH_RATES_BY_YEAR['2026'],
    names: currentMhaNames(),
    stationPages: MHA_TO_STATION_PAGES,
    midYearCurrent: {},
    midYearPrior: BAH_MID_YEAR_CHANGES_BY_YEAR['2026'],
  });

  test('title, H1, description, scope and counts follow the data', () => {
    expect(bahChangesTitle(F.year)).toBe('2027 BAH Changes: Biggest Increases and Decreases by Area');
    expect(bahChangesH1(F.year)).toBe('2027 BAH Changes by Military Housing Area');
    expect(bahChangesDescription(F)).toContain('How 2027 BAH changed from 2026 in all 338');
    expect(bahChangesScopeLine(F)).toBe('338 housing areas · E-5 with dependents · 2026 → 2027 · source DTMO');
    expect([F.up, F.same, F.down]).toEqual([336, 1, 1]);
    expect(F.release).toBeUndefined(); // no 2027 row in releaseHistory.ts yet
  });

  test('rows and top lists use the fixture; TX270 is marked as an ended temporary increase', () => {
    const tx = F.rows.find((r) => r.mha === 'TX270') as BahChangeRow;
    expect(tx.prior).toBe(1872);
    expect(tx.current).toBe(1572);
    expect(tx.abs).toBe(-300);
    expect(tx.note?.kind).toBe('temporary-prior');
    expect(F.largestDecrease?.mha).toBe('TX270');
    expect(F.topDecreases.map((r) => r.mha)).toEqual(['TX270']);
    expect(bahChangesProtectionText(F)).toContain(TEMPORARY_INCREASE_EXCEPTION);
    expect(bahChangesProtectionText(C)).not.toContain(TEMPORARY_INCREASE_EXCEPTION);
  });

  test('FAQ moves on a year', () => {
    const faqs = bahChangesFaqs(F);
    expect(faqs[0].question).toBe('When do 2028 BAH rates come out?');
    expect(faqs[0].answer).toContain('December 11, 2025 (2026 rates)');
    expect(faqs[1].answer).toContain('1 of the 338 housing areas have a lower 2027 rate than in 2026');
    expect(faqs[3].answer).toContain('from its 2026 and 2027 rate files');
  });
});
