import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// In-process unit tests for the HUD SAFMR rent data layer (no server needed).
import {
  getFMR,
  getFMRRange,
  getFMRDetail,
  getPairedFMR,
  fmrYearForBahYear,
  FMR_BY_YEAR,
  type FmrYear,
  type MHAFmr,
} from '../../src/lib/calculations/fmr';
import { MHA_FMR_2026 } from '../../src/data/bah/fmr/fmr2026';
import { MHA_FMR_2027 } from '../../src/data/bah/fmr/fmr2027';
import { BAH_YEAR } from '../../src/data/bah/current';
import { BAH_LOOKUP_TABLES, BAH_RATES_BY_YEAR } from '../../src/data/bah/registry';
import { CURRENT_BAH_CONFIG, type BahYearConfig } from '../../src/lib/calculations/bahTransition';
import { stationRent, stationRentFaqAnswer } from '../../src/lib/stationRent';
import { hudFmrCardLabel, hudFmrSourceLabel } from '../../src/lib/rentCompare';
import { formatCurrency } from '../../src/lib/utils';

const ROOT = process.cwd();

// FY2026: verified against an independent recompute from the HUD SAFMR xlsx (0
// drift on p25/median/p75 across all 338 MHAs; medians byte-identical to the prior
// median-only generation — see scripts/build-fmr-data.py). These lock the data
// file to the verified source — any future regeneration that drifts will fail here.
const SPOT_2BR_MEDIAN_FY2026: Record<string, { median: number; zipsCovered: number }> = {
  VA298: { median: 1770, zipsCovered: 63 },  // Norfolk/Portsmouth, VA
  TX285: { median: 1410, zipsCovered: 111 }, // San Antonio, TX
  CA038: { median: 3000, zipsCovered: 154 }, // San Diego, CA
  WA311: { median: 1970, zipsCovered: 87 },  // Tacoma, WA
  NC182: { median: 1140, zipsCovered: 65 },  // Fort Bragg/Pope, NC
  HI408: { median: 2640, zipsCovered: 60 },  // Honolulu County, HI
  OK237: { median: 1000, zipsCovered: 15 },  // Fort Sill/Lawton, OK (rural)
  ND191: { median: 1120, zipsCovered: 21 },  // Minot AFB, ND (rural)
  MO163: { median: 925, zipsCovered: 32 },   // Fort Leonard Wood, MO (rural)
};

test.describe('FMR data layer (FY2026, paired with 2026 BAH) — getFMR / getFMRRange / data integrity', () => {
  test('2BR median + zipsCovered match the verified SAFMR values', () => {
    for (const [mha, exp] of Object.entries(SPOT_2BR_MEDIAN_FY2026)) {
      expect(getFMR(mha, '2026', 2)).toBe(exp.median);
      expect(getFMRDetail(mha, '2026')!.zipsCovered).toBe(exp.zipsCovered);
    }
  });

  test('getFMR returns the median; getFMRRange returns the full p25/median/p75', () => {
    // Norfolk is SAFMR-designated → a real spread.
    expect(getFMRRange('VA298', '2026', 2)).toEqual({ p25: 1590, median: 1770, p75: 1990 });
    expect(getFMR('VA298', '2026', 2)).toBe(1770);
    // Fort Sill (rural).
    expect(getFMRRange('OK237', '2026', 2)).toEqual({ p25: 985, median: 1000, p75: 1120 });
  });

  test('default bedrooms is 2BR for both accessors', () => {
    expect(getFMR('VA298', '2026')).toBe(getFMR('VA298', '2026', 2));
    expect(getFMRRange('VA298', '2026')).toEqual(getFMRRange('VA298', '2026', 2));
  });

  test('each bedroom size resolves correctly (San Diego CA038)', () => {
    const e = getFMRDetail('CA038', '2026')!;
    for (const b of [0, 1, 2, 3, 4] as const) {
      expect(getFMRRange('CA038', '2026', b)).toEqual(e[`br${b}` as const]);
      expect(getFMR('CA038', '2026', b)).toBe(e[`br${b}` as const].median);
    }
    expect(getFMRRange('CA038', '2026', 4)).toEqual({ p25: 4840, median: 4840, p75: 5390 });
  });

  test('omit path: unknown MHA → null (graceful, all accessors + bedrooms)', () => {
    for (const y of ['2026', '2027']) {
      expect(getFMR('ZZ999', y)).toBeNull();
      expect(getFMR('ZZ999', y, 0)).toBeNull();
      expect(getFMRRange('ZZ999', y)).toBeNull();
      expect(getFMRDetail('ZZ999', y)).toBeNull();
      expect(getPairedFMR('ZZ999', y)).toBeNull();
      // XX499 (territory) is never an FMR entry — OHA, not BAH.
      expect(getFMR('XX499', y)).toBeNull();
    }
  });

  test('every entry of every loaded year is structurally sound (p25 ≤ median ≤ p75, positive integers, tag)', () => {
    for (const [fy, { data }] of Object.entries(FMR_BY_YEAR)) {
      const codes = Object.keys(data);
      expect(codes.length, `FY${fy} MHA count`).toBe(338);
      for (const code of codes) {
        const e: MHAFmr = data[code];
        for (const k of ['br0', 'br1', 'br2', 'br3', 'br4'] as const) {
          const r = e[k];
          for (const p of [r.p25, r.median, r.p75]) {
            expect(Number.isInteger(p)).toBe(true);
            expect(p).toBeGreaterThan(0);
          }
          expect(r.p25).toBeLessThanOrEqual(r.median);
          expect(r.median).toBeLessThanOrEqual(r.p75);
        }
        expect(e.zipsCovered).toBeGreaterThan(0);
        expect(e.method).toBe('safmr-zip-pctile');
      }
    }
  });

  test("data year tags: each FMR_BY_YEAR entry's year is its file's FMR_DATA_YEAR and equals its key", () => {
    expect(Object.keys(FMR_BY_YEAR).sort()).toEqual(['2026', '2027']);
    for (const [fy, entry] of Object.entries(FMR_BY_YEAR)) expect(entry.year).toBe(fy);
    expect(FMR_BY_YEAR['2026'].data).toBe(MHA_FMR_2026);
    expect(FMR_BY_YEAR['2027'].data).toBe(MHA_FMR_2027);
  });
});

// ─── H1: the pairing rule (FMR year that goes with a BAH year) ───────────────
test.describe('H1 pairing rule — fmrYearForBahYear', () => {
  test('2026 BAH → FY2026, 2027 BAH → FY2027', () => {
    expect(fmrYearForBahYear('2026')).toBe('2026');
    expect(fmrYearForBahYear('2027')).toBe('2027');
  });

  test('an unknown year → null, never a fallback to another year', () => {
    for (const y of ['2025', '2028', '', '26', 'FY2026', 'constructor', '__proto__', 'toString']) {
      expect(fmrYearForBahYear(y), y).toBeNull();
      expect(getPairedFMR('NC182', y), y).toBeNull();
      expect(getFMR('NC182', y), y).toBeNull();
      expect(getFMRDetail('NC182', y), y).toBeNull();
    }
  });

  test('getPairedFMR reads the paired year and carries its FY from the data', () => {
    expect(getPairedFMR('NC182', '2026')).toEqual({ fmrYear: '2026', range: MHA_FMR_2026.NC182.br2 });
    expect(getPairedFMR('NC182', '2027')).toEqual({ fmrYear: '2027', range: MHA_FMR_2027.NC182.br2 });
    expect(getPairedFMR('NC182', '2027', 4)!.range).toEqual(MHA_FMR_2027.NC182.br4);
  });

  test("the site's BAH year has an FMR year (station pages show rent today)", () => {
    expect(fmrYearForBahYear(BAH_YEAR)).toBe(BAH_YEAR);
    expect(stationRent('NC182')!.fmrYear).toBe(BAH_YEAR);
  });
});

// ─── H1: the FMR file paired with BAH_YEAR was built with BAH_YEAR's ZIP map ──
/** The BAH folder whose ZIP map built an FMR file (header note; absent = its own year). */
function fmrZipMapYear(fy: string): string {
  const text = readFileSync(path.join(ROOT, 'src', 'data', 'bah', 'fmr', `fmr${fy}.ts`), 'utf8');
  return /ZIP → MHA map: src\/data\/bah\/(\d{4})\//.exec(text)?.[1] ?? fy;
}

test.describe('H1 release-day guard — FMR ZIP map year', () => {
  test("the FMR year shown with BAH_YEAR was aggregated with BAH_YEAR's ZIP → MHA map", () => {
    // Fails after the 2027 BAH import until fmr2027.ts is regenerated:
    //   python scripts/build-fmr-data.py --year 2027 --src data/sources/hud/FY27_safmrs.xlsx
    // (docs/RELEASE_DAY_BAH_2027.md step 3).
    const fy = fmrYearForBahYear(BAH_YEAR)!;
    expect(fmrZipMapYear(fy)).toBe(BAH_YEAR);
  });

  test('every FMR file whose own BAH year is registered uses that year’s map', () => {
    for (const fy of Object.keys(FMR_BY_YEAR)) {
      if (BAH_LOOKUP_TABLES[fy as keyof typeof BAH_LOOKUP_TABLES]) expect(fmrZipMapYear(fy), `fmr${fy}.ts`).toBe(fy);
    }
    // Today: FY2027 was built before 2027 BAH exists, with the 2026 map.
    if (!(('2027' as string) in BAH_RATES_BY_YEAR)) expect(fmrZipMapYear('2027')).toBe('2026');
  });
});

// ─── H1: fmr2026.ts byte-identical after the generator change ────────────────
const eolHash = (file: string) =>
  createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');

test.describe('H1 generator — byte-identical FY2026 output', () => {
  test('fmr2026.ts is byte-identical to the pre-H1 file (SHA-256 of the LF text)', () => {
    // Hash of src/data/bah/fmr/fmr2026.ts at main f6d9a6d (before the --year/--src change).
    expect(eolHash(path.join(ROOT, 'src', 'data', 'bah', 'fmr', 'fmr2026.ts'))).toBe(
      '4aec7af00c733b522adf22c00a43dd7d76ccd4ac608ce2bc2366acfd9b1c6708',
    );
  });
});

// ─── H1: recomputation from the HUD xlsx (local only: the xlsx is gitignored) ──
const HUD_DIR = path.join(ROOT, 'data', 'sources', 'hud');
const XLSX: Record<FmrYear, string> = {
  '2026': path.join(HUD_DIR, 'fy2026_safmrs_revised.xlsx'),
  '2027': path.join(HUD_DIR, 'FY27_safmrs.xlsx'),
};
const python = (args: string[], input?: string) =>
  spawnSync('python', args, { cwd: ROOT, encoding: 'utf8', input, timeout: 180_000, maxBuffer: 64 * 1024 * 1024 });
function pythonReady(): boolean {
  const r = python(['-c', 'import pandas, python_calamine, numpy']);
  return !r.error && r.status === 0;
}

test.describe('H1 recompute from the HUD xlsx (skipped where the xlsx is absent, e.g. CI)', () => {
  test.describe.configure({ timeout: 300_000 });

  for (const fy of ['2026', '2027'] as const) {
    test(`regenerating fmr${fy}.ts from the xlsx gives the committed file byte for byte`, () => {
      test.skip(!existsSync(XLSX[fy]) || !pythonReady(), `no ${path.basename(XLSX[fy])} or no python/pandas here`);
      const dir = mkdtempSync(path.join(os.tmpdir(), 'fmr-regen-'));
      try {
        const out = path.join(dir, `fmr${fy}.ts`);
        const r = python(['scripts/build-fmr-data.py', '--year', fy, '--src', XLSX[fy], '--mha-year', fmrZipMapYear(fy), '--out', out]);
        expect(r.status, r.stderr).toBe(0);
        const committed = path.join(ROOT, 'src', 'data', 'bah', 'fmr', `fmr${fy}.ts`);
        expect(eolHash(out)).toBe(eolHash(committed));
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }

  // Step 0 report ZIPs (Fort Bragg, Norfolk, San Antonio, Camp Pendleton, JBLM).
  const STEP0_ZIPS = ['28310', '23511', '78201', '92055', '98433'];

  test('FY2027 spot check: the 5 Step 0 ZIPs feed their MHA, and its medians + coverage recompute from the raw rows', () => {
    test.skip(!existsSync(XLSX['2027']) || !pythonReady(), 'no FY27_safmrs.xlsx or no python/pandas here');
    const mapYear = fmrZipMapYear('2027') as keyof typeof BAH_LOOKUP_TABLES;
    const zipToMha = BAH_LOOKUP_TABLES[mapYear]?.zipToMha;
    test.skip(!zipToMha, `the ${mapYear} ZIP map is no longer registered`);
    const mhaZips = new Map<string, string[]>();
    for (const [z, m] of Object.entries(zipToMha!)) {
      if (m === 'XX499') continue;
      mhaZips.set(m, [...(mhaZips.get(m) ?? []), z.padStart(5, '0')]);
    }
    const mhas = [...new Set(STEP0_ZIPS.map((z) => zipToMha![z]))];
    const want = mhas.flatMap((m) => mhaZips.get(m) ?? []);
    const r = python(['scripts/fmr-xlsx-rows.py', XLSX['2027']], JSON.stringify(want));
    expect(r.status, r.stderr).toBe(0);
    const rows: Record<string, (number | null)[]> = JSON.parse(r.stdout);

    for (const zip of STEP0_ZIPS) {
      const mha = zipToMha![zip];
      const raw = rows[zip];
      test.info().annotations.push({ type: 'raw FY2027 row', description: `${zip} → ${mha}: 0–4BR ${JSON.stringify(raw)}` });
      expect(raw, `${zip} is in the HUD file`).toBeDefined();
      expect(raw[2], `${zip} has a 2BR SAFMR (so it counts toward ${mha})`).not.toBeNull();
      const covered = (mhaZips.get(mha) ?? []).filter((z) => rows[z] && rows[z][2] !== null);
      const entry = MHA_FMR_2027[mha];
      expect(entry.zipsCovered, `${mha} zipsCovered`).toBe(covered.length);
      for (const b of [0, 1, 2, 3, 4] as const) {
        const vals = covered.map((z) => rows[z][b]).filter((v): v is number => v !== null);
        expect(entry[`br${b}`].median, `${mha} ${b}BR median`).toBe(pyMedianInt(vals));
        expect(Math.min(...vals)).toBeLessThanOrEqual(entry[`br${b}`].p25);
        expect(entry[`br${b}`].p75).toBeLessThanOrEqual(Math.max(...vals));
      }
    }
  });
});

/** scripts/build-fmr-data.py median_int: Python round() is round-half-to-even. */
function pyMedianInt(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  if (s.length % 2) return s[mid];
  const x = (s[mid - 1] + s[mid]) / 2;
  const f = Math.floor(x);
  return x - f === 0.5 ? (f % 2 === 0 ? f : f + 1) : Math.round(x);
}

// ─── H1: station page rent in the transition fixture (config-driven, no flip) ──
test.describe('H1 station rent — paired with the BAH year the page shows', () => {
  const CFG_2026: BahYearConfig = { year: '2026', priorYear: '2025', effectiveNotice: false };
  // R2 transition mode: 2027 BAH loaded, effective notice on (Dec → Jan 1).
  const CFG_TRANSITION: BahYearConfig = { year: '2027', priorYear: '2026', effectiveNotice: true };
  const E5W = 1906; // synthetic 2027 E-5 w/dep rate for the fixture (not real data)

  test("today: the page's config pairs with FY2026 and labels it FY2026", () => {
    const rent = stationRent('NC182', CURRENT_BAH_CONFIG)!;
    expect(rent.fmrYear).toBe(fmrYearForBahYear(CURRENT_BAH_CONFIG.year));
    expect(rent.range).toEqual(FMR_BY_YEAR[fmrYearForBahYear(BAH_YEAR)!].data.NC182.br2);
    if (BAH_YEAR === '2026') {
      expect(rent.fmrYear).toBe('2026');
      expect(hudFmrCardLabel(rent.fmrYear)).toBe('2BR rent (HUD FMR, FY2026)');
      expect(hudFmrSourceLabel(rent.fmrYear)).toBe('2-bedroom Fair Market Rent (HUD, FY2026)');
    }
  });

  test('transition fixture: 2027 BAH shows FY2027 rents with the FY2027 label', () => {
    const rent = stationRent('NC182', CFG_TRANSITION)!;
    expect(rent.fmrYear).toBe('2027');
    expect(rent.range).toEqual(MHA_FMR_2027.NC182.br2);
    expect(hudFmrCardLabel(rent.fmrYear)).toBe('2BR rent (HUD FMR, FY2027)');
    const r = MHA_FMR_2027.NC182.br2;
    const faq = stationRentFaqAnswer(CFG_TRANSITION, 'Fort Bragg', 'Fort Bragg/Pope, NC', E5W, rent);
    expect(faq).toContain(`Starting January 1, 2027, an E-5 with dependents at Fort Bragg will receive ${formatCurrency(E5W)}/month in BAH.`);
    expect(faq).toContain(
      `2-bedroom Fair Market Rent (HUD, FY2027) runs about ${formatCurrency(r.p25)}–${formatCurrency(r.p75)} (median ${formatCurrency(r.median)}).`,
    );
    expect(faq).not.toContain('FY2026');
  });

  test('the 2026 line still pairs with FY2026 while 2027 is loaded', () => {
    const rent = stationRent('NC182', CFG_2026)!;
    expect(rent).toEqual({ fmrYear: '2026', range: MHA_FMR_2026.NC182.br2 });
    const faq = stationRentFaqAnswer(CFG_2026, 'Fort Bragg', 'Fort Bragg/Pope, NC', 1806, rent);
    expect(faq).toContain('2-bedroom Fair Market Rent (HUD, FY2026) runs about');
    expect(faq).not.toContain('FY2027');
  });

  test('a BAH year with no paired FMR year shows no rent (no fallback)', () => {
    expect(stationRent('NC182', { year: '2028', priorYear: '2027', effectiveNotice: true })).toBeNull();
    expect(stationRent(null, CFG_TRANSITION)).toBeNull();
  });

  test("today's FAQ answer is unchanged (FY2026 wording, figures from the data)", () => {
    test.skip(BAH_YEAR !== '2026', 'checks the pre-release-day wording');
    const r = MHA_FMR_2026.NC182.br2;
    const rent = stationRent('NC182')!;
    expect(stationRentFaqAnswer(CURRENT_BAH_CONFIG, 'Fort Bragg', 'Fort Bragg/Pope, NC', 1806, rent)).toBe(
      `For 2026, an E-5 with dependents at Fort Bragg receives $1,806/month in BAH. Across the Fort Bragg/Pope, NC area, 2-bedroom Fair Market Rent (HUD, FY2026) runs about ${formatCurrency(r.p25)}–${formatCurrency(r.p75)} (median ${formatCurrency(r.median)}). The 2026 BAH for an E-5 with dependents ($1,806) is above the area's 75th-percentile 2-bedroom rent — it covers a 2-bedroom across most of this area. BAH is designed to cover about 95% of typical local housing costs — rent plus utilities — for a member's pay grade and dependency status.`,
    );
  });
});

// ─── Phase 2B: BAH-vs-rent comparison clause (pure, no surplus framing) ──────
import { bahVsRentClause } from '../../src/lib/rentCompare';

test.describe('rentCompare — bahVsRentClause (3 branches, no surplus language)', () => {
  const FMR = { p25: 1000, median: 1200, p75: 1400 };

  test('BAH ≥ p75 → "above the 75th-percentile / covers across most of this area"', () => {
    expect(bahVsRentClause(1500, FMR, 'E-5 with dependents')).toContain("above the area's 75th-percentile 2-bedroom rent");
    expect(bahVsRentClause(1400, FMR, 'E-5 with dependents')).toContain('covers a 2-bedroom across most of this area'); // boundary: >= p75
  });

  test('p25 ≤ BAH < p75 → "falls within the area\'s 2-bedroom rent range"', () => {
    expect(bahVsRentClause(1200, FMR, 'E-5 with dependents')).toContain("falls within the area's 2-bedroom rent range");
    expect(bahVsRentClause(1000, FMR, 'E-5 with dependents')).toContain('falls within'); // boundary: >= p25
    expect(bahVsRentClause(1399, FMR, 'E-5 with dependents')).toContain('falls within'); // < p75
  });

  test('BAH < p25 → "2-bedroom rent runs above the {BAH_YEAR} BAH"', () => {
    expect(bahVsRentClause(900, FMR, 'E-5 with dependents')).toContain(`2-bedroom rent runs above the ${BAH_YEAR} BAH`);
    expect(bahVsRentClause(999, FMR, 'E-5 with dependents')).toContain(`runs above the ${BAH_YEAR} BAH`);
    // The year is a parameter (defaults to BAH_YEAR).
    expect(bahVsRentClause(999, FMR, 'E-5 with dependents', '2031')).toContain('runs above the 2031 BAH');
  });

  test('includes the BAH dollar amount + the grade label; never surplus/you-keep', () => {
    for (const b of [1500, 1200, 900]) {
      const s = bahVsRentClause(b, FMR, 'E-5 with dependents');
      expect(s).toContain('E-5 with dependents');
      expect(s).toMatch(/\$\d/);
      expect(s).not.toMatch(/surplus|you keep|you pocket|pocket|you'?d keep/i);
    }
  });
});
