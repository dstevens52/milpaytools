import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
// In-process, data-only checks for the BAH release-day machinery (no server):
// the year switch + registry, the transition copy (with fixture configs, since
// current.ts stays on 2026 until release day), the importer's fidelity on the
// 2026 source files, the IndexNow URL list, and llms.txt.
import { BAH_YEAR, BAH_PRIOR_YEAR, BAH_EFFECTIVE_NOTICE, BAH_EFFECTIVE_DATE_LABEL } from '../../src/data/bah/current';
import {
  BAH_RATES_BY_YEAR,
  BAH_LOOKUP_TABLES,
  BAH_MID_YEAR_CHANGES_BY_YEAR,
} from '../../src/data/bah/registry';
import {
  BAH_ZIP_COUNT,
  BAH_MHA_COUNT,
  CURRENT_BAH_YEAR,
  PRIOR_BAH_YEAR,
  priorYearRates,
  isBahYear,
  currentZipToMha,
} from '../../src/lib/calculations/bah';
import {
  bahNoticeMode,
  bahTransitionText,
  bahPriorRateSubline,
  type BahYearConfig,
} from '../../src/lib/calculations/bahTransition';
import { BAH_EXPECTED as X } from './fixtures/bah-expected';
import { EDUCATION_BAH_YEAR } from '../../src/data/education/2026/constants';
import { giBillBahAtZip } from '../../src/lib/calculations/educationBah';
import { calculatePostGIBill } from '../../src/lib/calculations/education';

const ROOT = process.cwd();
const node = (args: string[]) =>
  spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });

test.describe('BAH year switch + registry', () => {
  test('current.ts and the registry agree', () => {
    expect(CURRENT_BAH_YEAR).toBe(BAH_YEAR);
    expect(PRIOR_BAH_YEAR).toBe(BAH_PRIOR_YEAR);
    expect(Number(BAH_PRIOR_YEAR)).toBe(Number(BAH_YEAR) - 1);
    expect(Object.keys(BAH_RATES_BY_YEAR)).toContain(BAH_YEAR);
    expect(Object.keys(BAH_RATES_BY_YEAR)).toContain(BAH_PRIOR_YEAR);
    expect(BAH_EFFECTIVE_DATE_LABEL).toBe(`January 1, ${BAH_YEAR}`);
  });

  test('only BAH_YEAR registers the ZIP map + names (one year of lookup data ships)', () => {
    expect(Object.keys(BAH_LOOKUP_TABLES)).toEqual([BAH_YEAR]);
  });

  test('BAH_YEAR has a mid-year-changes entry (a new year starts empty)', () => {
    expect(BAH_MID_YEAR_CHANGES_BY_YEAR).toHaveProperty(BAH_YEAR);
  });

  test('BAH counts are computed from the data and match the fixture', () => {
    expect(BAH_ZIP_COUNT).toBe(X.zipCount);
    expect(BAH_MHA_COUNT).toBe(X.mhaCount);
  });

  test('prior-year rates for the transition sub-line come from BAH_PRIOR_YEAR', () => {
    const p = priorYearRates(X.bragg.mha);
    expect(p.year).toBe(BAH_PRIOR_YEAR);
    expect(p.ratesW!['E-5']).toBe(X.bragg.priorE5W);
    expect(priorYearRates('ZZ999')).toEqual({ year: BAH_PRIOR_YEAR, ratesW: null, ratesWO: null });
  });

  test(`BAH_EFFECTIVE_NOTICE is a static flag (today: ${BAH_EFFECTIVE_NOTICE})`, () => {
    expect(typeof BAH_EFFECTIVE_NOTICE).toBe('boolean');
  });
});

test.describe('Transition mode (fixture configs, not active until release day)', () => {
  const pending: BahYearConfig = { year: '2026', priorYear: '2025', effectiveNotice: false };
  const transition: BahYearConfig = { year: '2027', priorYear: '2026', effectiveNotice: true };
  const january: BahYearConfig = { year: '2027', priorYear: '2026', effectiveNotice: false };

  test('notice mode per phase', () => {
    expect(bahNoticeMode(pending)).toBe('next-year-status');
    expect(bahNoticeMode(transition)).toBe('transition');
    expect(bahNoticeMode(january)).toBe('none');
    expect(bahNoticeMode({ year: '2028', priorYear: '2027', effectiveNotice: false })).toBe('none');
  });

  test('station line names the prior-year E-5 with-dependents rate', () => {
    expect(bahTransitionText(transition, 1806)).toBe(
      '2027 rates take effect January 1, 2027. Until then, the 2026 rate applies: $1,806 for an E-5 with dependents.',
    );
  });

  test('/bah hub line has no figure', () => {
    expect(bahTransitionText(transition, null)).toBe('2027 rates take effect January 1, 2027. Until then, 2026 rates apply.');
  });

  test('ZIP calculator sub-line', () => {
    expect(bahPriorRateSubline('2026', 1806)).toBe('2026 rate (through Dec 31, 2026): $1,806');
    expect(bahPriorRateSubline('2026', 12345)).toBe('2026 rate (through Dec 31, 2026): $12,345');
  });

  test('today\'s config is the pre-release mode', () => {
    test.skip(BAH_YEAR !== ('2026' as string), 'only meaningful while BAH_YEAR is 2026');
    expect(bahNoticeMode()).toBe('next-year-status');
  });
});

test.describe('Importer (scripts/bah-import.mjs)', () => {
  test('2026 regen from data/sources/dtmo/2026 matches src/data/bah/2026 except TX270', () => {
    const out = mkdtempSync(path.join(tmpdir(), 'bah-import-'));
    try {
      const r = node([
        'scripts/bah-import.mjs', '--year', '2026', '--src', 'data/sources/dtmo/2026', '--prior', '2025',
        '--out', out, '--report', path.join(out, 'report.md'),
      ]);
      expect(r.status, r.stderr + r.stdout).toBe(0);
      const norm = (s: string) => s.replace(/\r\n/g, '\n');
      const read = (dir: string, f: string) => norm(readFileSync(path.join(dir, f), 'utf8'));
      const src = path.join(ROOT, 'src', 'data', 'bah', '2026');
      for (const f of ['zipToMha.ts', 'mhaNames.ts']) {
        const a = read(src, f);
        const b = read(out, f);
        expect(a.length).toBeGreaterThan(1000);
        expect(b, f).toBe(a);
      }
      // mhaRates: every row identical except TX270 (hand-applied May 16, 2026
      // temporary increase; the 2026 source files predate it).
      const rows = (s: string) =>
        Object.fromEntries([...s.matchAll(/^\s*"([A-Z]{2}\d{3})":(\{w:.*\}\})/gm)].map((m) => [m[1], m[2]]));
      const a = rows(read(src, 'mhaRates.ts'));
      const b = rows(read(out, 'mhaRates.ts'));
      expect(Object.keys(a)).toHaveLength(338);
      expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
      const differ = Object.keys(a).filter((k) => a[k] !== b[k]);
      expect(differ).toEqual(['TX270']);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  test('refuses to overwrite an existing year folder without --force', () => {
    const out = mkdtempSync(path.join(tmpdir(), 'bah-import-'));
    try {
      const r = node([
        'scripts/bah-import.mjs', '--year', '2026', '--src', 'data/sources/dtmo/2026', '--prior', '2025',
        '--report', path.join(out, 'report.md'),
      ]);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('already exists');
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});

test.describe('IndexNow URL list (scripts/bah-urls.mjs)', () => {
  test('covers /bah, every CONUS station page, rank pages and every page that imports BAH code', () => {
    const r = node(['scripts/bah-urls.mjs', '--print']);
    expect(r.status, r.stderr).toBe(0);
    const urls: string[] = JSON.parse(r.stdout).urls;
    const paths = new Set(urls.map((u) => new URL(u).pathname));
    expect(paths.has('/bah')).toBe(true);
    expect(paths.has('/bah/fort-bragg')).toBe(true);
    expect(paths.has('/pay/e5')).toBe(true);
    expect(paths.has('/bah/ramstein-air-base')).toBe(false); // OCONUS: OHA, not BAH

    // Every static route whose page.tsx imports BAH-data code must be listed.
    const BAH_IMPORT = /from '@\/(lib\/calculations\/(bah|bahStats|cola|transition-readiness-example)|lib\/sample-scenario|data\/calculators|data\/bah\/(current|mhaToStationPage|2027-status))'/;
    const appDir = path.join(ROOT, 'src', 'app');
    const missing: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir)) {
        const p = path.join(dir, e);
        if (statSync(p).isDirectory()) walk(p);
        else if (e === 'page.tsx' && BAH_IMPORT.test(readFileSync(p, 'utf8'))) {
          const route = '/' + path.relative(appDir, path.dirname(p)).split(path.sep).join('/');
          const r2 = route === '/' || route === '/.' ? '/' : route;
          if (r2.includes('[')) continue; // dynamic: /bah/[slug], /pay/[rank] checked above
          if (r2.startsWith('/_archive') || r2.startsWith('/home-v')) continue; // not public pages
          if (!paths.has(r2)) missing.push(r2);
        }
      }
    };
    walk(appDir);
    expect(missing, `pages importing BAH code but missing from bah-urls STATIC_PATHS: ${missing.join(', ')}`).toEqual([]);
  });
});

test.describe('llms.txt', () => {
  test('BAH lines match BAH_YEAR and the ZIP count (npm run bah:llms)', () => {
    const r = node(['scripts/bah-llms.mjs', '--check']);
    expect(r.status, r.stderr + r.stdout).toBe(0);
    const txt = readFileSync(path.join(ROOT, 'public', 'llms.txt'), 'utf8');
    expect(txt).toContain(`${BAH_YEAR} BAH rates for all ${BAH_ZIP_COUNT.toLocaleString('en-US')} ZIP codes`);
  });
});

test.describe('Education: GI Bill MHA uses EDUCATION_BAH_YEAR, not BAH_YEAR', () => {
  // VA: "We use the 2026 rates to calculate the monthly payment you get between
  // August 1, 2026, and July 31, 2027." The 2026 E-5 with-dependents rate at
  // ZIP 92134 (CA038) is $3,975 (data/sources/dtmo/2026/bahw26.txt).
  const ZIP = '92134';
  const E5W_2026 = 3975;

  test('EDUCATION_BAH_YEAR is a registered BAH year', () => {
    expect(EDUCATION_BAH_YEAR).toBe('2026');
    expect(isBahYear(EDUCATION_BAH_YEAR)).toBe(true);
  });

  test('with a BAH_YEAR=2027 fixture, education MHA at 92134 still equals the 2026 E-5 w/dep rate', () => {
    // Fixture: registry after the 2027 flip, with every 2027 rate $100 higher than 2026.
    const rates2026 = BAH_RATES_BY_YEAR['2026'];
    const bump = (set: Record<string, number>) =>
      Object.fromEntries(Object.entries(set).map(([g, v]) => [g, v + 100]));
    const rates2027 = Object.fromEntries(
      Object.entries(rates2026).map(([m, s]) => [m, { w: bump(s.w), wo: bump(s.wo) }]),
    );
    const flipped = { zipToMha: currentZipToMha(), ratesByYear: { '2026': rates2026, '2027': rates2027 } };
    const current2027 = flipped.ratesByYear['2027'][flipped.zipToMha[ZIP]].w['E-5'];
    expect(current2027).toBe(E5W_2026 + 100); // the site's (fixture) BAH_YEAR rate differs

    const schoolBAH = giBillBahAtZip(ZIP, EDUCATION_BAH_YEAR, flipped);
    expect(schoolBAH).toBe(E5W_2026);
    // 100% tier, full time, in person: MHA = the E-5 with-dependents BAH.
    const gi = calculatePostGIBill({
      status: 'veteran', serviceTier: '36mo+', vaRating: 0, schoolType: 'public',
      schoolZip: ZIP, schoolBAH, schoolLocationName: 'San Diego, CA',
      annualTuition: 12000, programYears: 4, enrollment: 'full',
    });
    expect(gi.monthlyMHA).toBe(E5W_2026);
  });

  test('today, education and the BAH pages read the same 2026 rate', () => {
    expect(giBillBahAtZip(ZIP)).toBe(E5W_2026);
  });

  test('lookup API serves EDUCATION_BAH_YEAR rates on request; rejects unregistered years', async () => {
    const { GET } = await import('../../src/app/api/bah/lookup/route');
    const res = await GET(new Request(`http://localhost/api/bah/lookup?zip=${ZIP}&y=${BAH_YEAR}&ratesYear=${EDUCATION_BAH_YEAR}`));
    const body = await res.json();
    expect(body.ratesYear).toBe(EDUCATION_BAH_YEAR);
    expect(body.ratesW['E-5']).toBe(E5W_2026);
    expect(res.headers.get('cache-control')).toContain('immutable');
    const bad = await GET(new Request(`http://localhost/api/bah/lookup?zip=${ZIP}&ratesYear=1999`));
    expect(bad.status).toBe(400);
    expect(bad.headers.get('cache-control')).toBe('no-store');
  });
});
