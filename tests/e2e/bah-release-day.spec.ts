import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
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
  getMHACode,
  getMHARatesForYear,
  priorYearMhaForZip,
  CURRENT_BAH_YEAR as CUR,
  PRIOR_BAH_YEAR as PRI,
} from '../../src/lib/calculations/bah';
import { yoyForGrade, hasRateDecrease } from '../../src/lib/calculations/bahStats';
import { bahReleasedDateFor } from '../../src/lib/bahReleaseDate';
import { BAH_RELEASE_HISTORY } from '../../src/data/bah/releaseHistory';
import { BAH_2027_STATUS } from '../../src/data/bah/2027-status';
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
// Static, not `await import(...)`: Playwright transpiles statically imported
// TypeScript, but a dynamic import() of a .ts file goes to Node's own loader,
// which failed with "Cannot use import statement outside a module" whenever no
// earlier spec in the worker had already loaded the route (R2, 2026-11-20).
import { GET as bahLookupGET } from '../../src/app/api/bah/lookup/route';

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

test.describe('Remapped ZIPs: prior-year figures use the MHA the ZIP was paid under (R2)', () => {
  // R2 rehearsal: DTMO moved Fairchild AFB's ZIP 99011 to another MHA in the synthetic
  // 2027 package; the station page compared 2027 rates with the NEW MHA's 2026 rate
  // ("the 2026 rate applies: $2,748" — Fairchild was paid $2,184).
  /** zipPriorMha.ts → its map (the importer's own output format). */
  const readPriorMap = (file: string): Record<string, string> => {
    const m = /zipPriorMha: Record<string, string> = (\{[\s\S]*?\});/.exec(readFileSync(file, 'utf8'));
    expect(m, file).toBeTruthy();
    return JSON.parse(m![1].replace(/,\s*\}$/, '}'));
  };

  test('importer writes zipPriorMha.ts: each remapped ZIP → its prior-year MHA', () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'bah-remap-'));
    try {
      // A "2027" package = the 2026 files with ZIP 99011 moved WA310 → WA307.
      const src = path.join(tmp, 'src');
      mkdirSync(src);
      const from = path.join(ROOT, 'data', 'sources', 'dtmo', '2026');
      for (const f of ['bahw', 'bahwo', 'mhanames']) copyFileSync(path.join(from, `${f}26.txt`), path.join(src, `${f}27.txt`));
      const zips = readFileSync(path.join(from, 'sorted_zipmha26.txt'), 'latin1');
      expect(zips).toContain('99011 WA310');
      writeFileSync(path.join(src, 'sorted_zipmha27.txt'), zips.replace('99011 WA310', '99011 WA307'), 'latin1');
      const out = path.join(tmp, 'out');
      const r = node(['scripts/bah-import.mjs', '--year', '2027', '--src', src, '--prior', '2026', '--out', out, '--report', path.join(tmp, 'report.md')]);
      expect(r.status, r.stderr + r.stdout).toBe(0);
      expect(readPriorMap(path.join(out, 'zipPriorMha.ts'))).toEqual({ '99011': 'WA310' });
      expect(readFileSync(path.join(tmp, 'report.md'), 'utf8')).toContain('zipPriorMha.ts');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('a year with a zipPriorMha.ts registers it (BAH_LOOKUP_TABLES[BAH_YEAR].priorMhaByZip)', () => {
    const file = path.join(ROOT, 'src', 'data', 'bah', BAH_YEAR, 'zipPriorMha.ts');
    const registered = BAH_LOOKUP_TABLES[BAH_YEAR as keyof typeof BAH_LOOKUP_TABLES]?.priorMhaByZip;
    if (!existsSync(file)) {
      // 2026 predates the file: nothing to register, and nothing registered.
      expect(registered).toBeUndefined();
      return;
    }
    expect(registered, `register src/data/bah/${BAH_YEAR}/zipPriorMha.ts in registry.ts`).toEqual(readPriorMap(file));
  });

  test('priorYearMhaForZip: the current MHA unless the ZIP was remapped', () => {
    expect(priorYearMhaForZip(X.bragg.zip)).toBe(getMHACode(X.bragg.zip)); // no remap at Fort Bragg
    expect(priorYearMhaForZip('00000')).toBeNull();
    const remaps = BAH_LOOKUP_TABLES[BAH_YEAR as keyof typeof BAH_LOOKUP_TABLES]?.priorMhaByZip ?? {};
    for (const [zip, prior] of Object.entries(remaps)) expect(priorYearMhaForZip(zip)).toBe(prior);
  });

  test('yoyForGrade / hasRateDecrease compare with the prior MHA when given one', () => {
    // NC182 now vs NC183 (Seymour Johnson) in the prior year: a stand-in for a remap.
    const y = yoyForGrade('NC182', 'E-5', true, 'NC183')!;
    expect(y.current).toBe(getMHARatesForYear('NC182', true, CUR)!['E-5']);
    expect(y.prior).toBe(getMHARatesForYear('NC183', true, PRI)!['E-5']);
    expect(y.prior).not.toBe(getMHARatesForYear('NC182', true, PRI)!['E-5']); // control: the MHAs differ
    expect(yoyForGrade('NC182', 'E-5', true)).toEqual(yoyForGrade('NC182', 'E-5', true, 'NC182')); // default = same MHA
    expect(hasRateDecrease('NC182')).toBe(hasRateDecrease('NC182', CUR, 'NC182'));
  });
});

test.describe('Release date for data dates (sitemap) when DoD states no percent (R2)', () => {
  const RELEASED = { ...BAH_2027_STATUS, status: 'released' as const, releasedDate: '2026-12-12' };
  const NO_2027_ROW = BAH_RELEASE_HISTORY.filter((r) => r.ratesYear !== 2027);

  test('the history row wins', () => {
    expect(bahReleasedDateFor('2026')).toBe('2025-12-11');
    const withRow = [{ ...NO_2027_ROW[0], ratesYear: 2027, releasedDate: '2026-12-15' }, ...NO_2027_ROW];
    expect(bahReleasedDateFor('2027', withRow, RELEASED)).toBe('2026-12-15');
  });

  test("no 2027 row (no percent in DoD's release): falls back to BAH_2027_STATUS.releasedDate, never throws", () => {
    // R2: /sitemap.xml returned 500 with the row left out, which fails the build.
    expect(bahReleasedDateFor('2027', NO_2027_ROW, RELEASED)).toBe('2026-12-12');
  });

  test('no row and no status date: a clear error naming both fixes', () => {
    expect(() => bahReleasedDateFor('2027', NO_2027_ROW, { ...BAH_2027_STATUS, releasedDate: null })).toThrow(/releaseHistory\.ts.*BAH_2027_STATUS\.releasedDate/);
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

  test('covers every static page that reaches the BAH release status or history through any import chain', () => {
    // R2 rehearsal: /pay, /pay/raise and /pay/dates change on release day (the key-dates
    // calendar reads 2027-status.ts) but import no BAH code directly, so the check above
    // missed them. Follow imports transitively from each page.tsx.
    const SRC = path.join(ROOT, 'src');
    const TARGETS = ['data/bah/2027-status.ts', 'data/bah/releaseHistory.ts'].map((p) => path.join(SRC, p));
    const resolve = (from: string, spec: string): string | null => {
      const base = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(from), spec) : null;
      if (!base) return null;
      for (const c of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
        try { if (statSync(c).isFile()) return c; } catch { /* next candidate */ }
      }
      return null;
    };
    const memo = new Map<string, boolean>();
    const reaches = (f: string, stack: Set<string>): boolean => {
      if (TARGETS.includes(f)) return true;
      if (memo.has(f)) return memo.get(f)!;
      if (stack.has(f)) return false;
      stack.add(f);
      const src = readFileSync(f, 'utf8');
      const deps = [...src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)]
        .map((m) => resolve(f, m[1] ?? m[2])).filter((x): x is string => !!x);
      const r = deps.some((d) => reaches(d, stack));
      stack.delete(f);
      memo.set(f, r);
      return r;
    };
    const r = node(['scripts/bah-urls.mjs', '--print']);
    const paths = new Set((JSON.parse(r.stdout).urls as string[]).map((u) => new URL(u).pathname));
    const appDir = path.join(SRC, 'app');
    const found: string[] = [];
    const missing: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir)) {
        const p = path.join(dir, e);
        if (statSync(p).isDirectory()) walk(p);
        else if (e === 'page.tsx' && reaches(p, new Set())) {
          const rel = path.relative(appDir, path.dirname(p)).split(path.sep).join('/');
          const route = rel === '' ? '/' : `/${rel}`;
          if (route.includes('[') || route.startsWith('/_archive') || route.startsWith('/home-v')) continue;
          found.push(route);
          if (!paths.has(route)) missing.push(route);
        }
      }
    };
    walk(appDir);
    expect(found).toEqual(expect.arrayContaining(['/', '/bah', '/pay', '/pay/raise', '/pay/dates'])); // control: the walk found them
    expect(missing, `pages reaching 2027-status.ts / releaseHistory.ts but missing from bah-urls STATIC_PATHS: ${missing.join(', ')}`).toEqual([]);
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
    const GET = bahLookupGET;
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
