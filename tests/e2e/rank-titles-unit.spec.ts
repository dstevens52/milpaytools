import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import {
  RANK_SERVICES,
  RANK_TITLES,
  RANK_LABELS,
  rankLabel,
  rankHelperText,
  payPageBranchTitles,
} from '../../src/data/ranks/rankTitles';
import { ALL_PAY_GRADES, RANK_DISPLAY } from '../../src/types/military';
import { PAY_PAGE_RANKS } from '../../src/data/pay-pages/ranks';

// Build RL: rank names (src/data/ranks/rankTitles.ts). Unit tests: no page is opened.
// Run: npm run test:ranks
//
// The expected abbreviations are typed here from docs/sources/rank-abbreviations.md
// (war.gov rank insignia; verified by Claude Chat 2026-11-25), not read from the module,
// so a wrong abbreviation in the module fails here.

const ORDER = ['army', 'marineCorps', 'navy', 'airForce', 'spaceForce'];

// Grade → [Army, Marine Corps, Navy, Air Force, Space Force], as in the source table.
const TABLE: Record<string, [string, string, string, string, string]> = {
  'E-1': ['PVT', 'Pvt', 'SR', 'AB', 'Spc1'],
  'E-2': ['PV2', 'PFC', 'SA', 'Amn', 'Spc2'],
  'E-3': ['PFC', 'LCpl', 'SN', 'A1C', 'Spc3'],
  'E-4': ['SPC / CPL', 'Cpl', 'PO3', 'SrA', 'Spc4'],
  'E-5': ['SGT', 'Sgt', 'PO2', 'SSgt', 'Sgt'],
  'E-6': ['SSG', 'SSgt', 'PO1', 'TSgt', 'TSgt'],
  'E-7': ['SFC', 'GySgt', 'CPO', 'MSgt', 'MSgt'],
  'E-8': ['MSG / 1SG', 'MSgt / 1stSgt', 'SCPO', 'SMSgt', 'SMSgt'],
  'E-9': ['SGM / CSM', 'MGySgt / SgtMaj', 'MCPO', 'CMSgt', 'CMSgt'],
  'O-1': ['2LT', '2ndLt', 'ENS', '2d Lt', '2d Lt'],
  'O-2': ['1LT', '1stLt', 'LTJG', '1st Lt', '1st Lt'],
  'O-3': ['CPT', 'Capt', 'LT', 'Capt', 'Capt'],
  'O-4': ['MAJ', 'Maj', 'LCDR', 'Maj', 'Maj'],
  'O-5': ['LTC', 'LtCol', 'CDR', 'Lt Col', 'Lt Col'],
  'O-6': ['COL', 'Col', 'CAPT', 'Col', 'Col'],
  'O-7': ['BG', 'BGen', 'RDML', 'Brig Gen', 'Brig Gen'],
  'O-8': ['MG', 'MajGen', 'RADM', 'Maj Gen', 'Maj Gen'],
  'O-9': ['LTG', 'LtGen', 'VADM', 'Lt Gen', 'Lt Gen'],
  'O-10': ['GEN', 'Gen', 'ADM', 'Gen', 'Gen'],
};
// Warrant grades per war.gov: Army · Marine Corps · Navy; no Air Force or Space Force
// warrant officers (an empty cell).
const WARRANT: Record<string, [string, string, string, string, string]> = {
  'W-1': ['WO1', 'WO', 'WO1', '', ''],
  'W-2': ['CW2', 'CWO2', 'CWO2', '', ''],
  'W-3': ['CW3', 'CWO3', 'CWO3', '', ''],
  'W-4': ['CW4', 'CWO4', 'CWO4', '', ''],
  'W-5': ['CW5', 'CWO5', 'CWO5', '', ''],
};
const PRIOR_ENLISTED: Record<string, string> = { 'O-1E': 'O-1', 'O-2E': 'O-2', 'O-3E': 'O-3' };

/** The source table cell "SPC / CPL" as the module's abbreviation list ("" = none). */
const cell = (s: string) => (s === '' ? [] : s.split(' / '));

function expectedAbbrs(g: string): string[][] {
  return (WARRANT[g] ?? TABLE[PRIOR_ENLISTED[g] ?? g]).map(cell);
}

// /pay/[rank] branch titles as they were typed in src/data/pay-pages/ranks.ts before
// build RL. They feed the frozen /pay meta descriptions and branch FAQ (pay meta guard
// to ~Dec 10), so the derived titles must reproduce them exactly.
const PAY_PAGE_TITLES_BEFORE_RL: Record<string, Record<string, string>> = {
  'E-1': { army: 'Private (PV1)', marines: 'Private', airForce: 'Airman Basic', navy: 'Seaman Recruit', spaceForce: 'Specialist 1' },
  'E-2': { army: 'Private (PV2)', marines: 'Private First Class', airForce: 'Airman', navy: 'Seaman Apprentice', spaceForce: 'Specialist 2' },
  'E-3': { army: 'Private First Class', marines: 'Lance Corporal', airForce: 'Airman First Class', navy: 'Seaman', spaceForce: 'Specialist 3' },
  'E-4': { army: 'Specialist or Corporal', marines: 'Corporal', airForce: 'Senior Airman', navy: 'Petty Officer Third Class', spaceForce: 'Specialist 4' },
  'E-5': { army: 'Sergeant', marines: 'Sergeant', airForce: 'Staff Sergeant', navy: 'Petty Officer Second Class', spaceForce: 'Sergeant' },
  'E-6': { army: 'Staff Sergeant', marines: 'Staff Sergeant', airForce: 'Technical Sergeant', navy: 'Petty Officer First Class', spaceForce: 'Technical Sergeant' },
  'E-7': { army: 'Sergeant First Class', marines: 'Gunnery Sergeant', airForce: 'Master Sergeant', navy: 'Chief Petty Officer', spaceForce: 'Master Sergeant' },
  'E-8': { army: 'Master Sergeant or First Sergeant', marines: 'Master Sergeant or First Sergeant', airForce: 'Senior Master Sergeant', navy: 'Senior Chief Petty Officer', spaceForce: 'Senior Master Sergeant' },
  'E-9': { army: 'Sergeant Major or Command Sergeant Major', marines: 'Master Gunnery Sergeant or Sergeant Major', airForce: 'Chief Master Sergeant', navy: 'Master Chief Petty Officer', spaceForce: 'Chief Master Sergeant' },
  'O-1': { army: 'Second Lieutenant', marines: 'Second Lieutenant', airForce: 'Second Lieutenant', navy: 'Ensign', spaceForce: 'Second Lieutenant' },
  'O-2': { army: 'First Lieutenant', marines: 'First Lieutenant', airForce: 'First Lieutenant', navy: 'Lieutenant (Junior Grade)', spaceForce: 'First Lieutenant' },
  'O-3': { army: 'Captain', marines: 'Captain', airForce: 'Captain', navy: 'Lieutenant', spaceForce: 'Captain' },
  'O-4': { army: 'Major', marines: 'Major', airForce: 'Major', navy: 'Lieutenant Commander', spaceForce: 'Major' },
  'O-5': { army: 'Lieutenant Colonel', marines: 'Lieutenant Colonel', airForce: 'Lieutenant Colonel', navy: 'Commander', spaceForce: 'Lieutenant Colonel' },
  'O-6': { army: 'Colonel', marines: 'Colonel', airForce: 'Colonel', navy: 'Captain', spaceForce: 'Colonel' },
};

test.describe('Rank titles module (build RL)', () => {
  test('the grade list is the full pay-grade list (27 grades)', () => {
    expect(ALL_PAY_GRADES).toHaveLength(27);
    expect(Object.keys(RANK_TITLES).sort()).toEqual([...ALL_PAY_GRADES].sort());
  });

  test('every grade has all five services, in DoD order; only AF/SF warrants are empty', () => {
    expect([...RANK_SERVICES]).toEqual(ORDER);
    for (const g of ALL_PAY_GRADES) {
      expect(Object.keys(RANK_TITLES[g]), g).toEqual(ORDER);
      for (const s of ORDER) {
        const names = RANK_TITLES[g][s as (typeof RANK_SERVICES)[number]];
        const none = g.startsWith('W-') && (s === 'airForce' || s === 'spaceForce');
        expect(names.length === 0, `${g} ${s} empty`).toBe(none);
        for (const x of names) {
          expect(x.abbr.trim(), `${g} ${s} abbr`).not.toBe('');
          expect(x.title.trim(), `${g} ${s} title`).not.toBe('');
        }
      }
    }
  });

  test('abbreviations match the source table (docs/sources/rank-abbreviations.md)', () => {
    for (const g of ALL_PAY_GRADES) {
      const actual = ORDER.map((s) => RANK_TITLES[g][s as (typeof RANK_SERVICES)[number]].map((x) => x.abbr));
      expect(actual, g).toEqual(expectedAbbrs(g));
    }
  });

  test('dropdown labels: format, fixed slots, -E suffix, merged warrant labels', () => {
    for (const g of ALL_PAY_GRADES) {
      const slots = expectedAbbrs(g).filter((a) => a.length > 0).map((a) => a.join('/'));
      const inner = WARRANT[g] ? [...new Set(slots)].join(' · ') : slots.join(' · ');
      const suffix = PRIOR_ENLISTED[g] ? ' — prior enlisted' : '';
      expect(rankLabel(g), g).toBe(`${g} (${inner}${suffix})`);
    }
    // Spot checks written out in full (the build spec's example and the long labels).
    expect(rankLabel('E-4')).toBe('E-4 (SPC/CPL · Cpl · PO3 · SrA · Spc4)');
    expect(rankLabel('E-9')).toBe('E-9 (SGM/CSM · MGySgt/SgtMaj · MCPO · CMSgt · CMSgt)');
    expect(rankLabel('O-1E')).toBe('O-1E (2LT · 2ndLt · ENS · 2d Lt · 2d Lt — prior enlisted)');
    expect(rankLabel('W-1')).toBe('W-1 (WO1 · WO)');
    expect(rankLabel('W-2')).toBe('W-2 (CW2 · CWO2)');
    expect(rankLabel('W-5')).toBe('W-5 (CW5 · CWO5)');
  });

  test('RANK_DISPLAY is derived from the module, with no hand-typed labels', () => {
    for (const g of ALL_PAY_GRADES) {
      expect(RANK_DISPLAY[g], g).toBe(rankLabel(g));
      expect(RANK_LABELS[g], g).toBe(rankLabel(g));
    }
    const src = fs.readFileSync(path.join(process.cwd(), 'src', 'types', 'military.ts'), 'utf8');
    expect(src).toContain('RANK_DISPLAY');
    // No label string literal like 'E-4 (…' left in the types file.
    expect(src.match(/['"`][EOW]-\d+E? \(/g) ?? []).toEqual([]);
  });

  test('helper line: services named, abbreviations only, Navy & Coast Guard', () => {
    expect(rankHelperText('E-4')).toBe('Army SPC/CPL · Marines Cpl · Navy & Coast Guard PO3 · Air Force SrA · Space Force Spc4');
    expect(rankHelperText('E-9')).toBe(
      'Army SGM/CSM · Marines MGySgt/SgtMaj · Navy & Coast Guard MCPO · Air Force CMSgt · Space Force CMSgt',
    );
    expect(rankHelperText('W-2')).toBe(
      'Army CW2 · Marines CWO2 · Navy & Coast Guard CWO2 · no Air Force or Space Force warrant officers',
    );
    // The Coast Guard has no W-1 or W-5 (war.gov lists CWO2–CWO4), so that slot says "Navy".
    expect(rankHelperText('W-1')).toBe('Army WO1 · Marines WO · Navy WO1 · no Air Force or Space Force warrant officers');
    expect(rankHelperText('W-5')).toBe('Army CW5 · Marines CWO5 · Navy CWO5 · no Air Force or Space Force warrant officers');
    expect(rankHelperText('O-2E')).toBe(`${rankHelperText('O-2')} — prior enlisted`);
    const names = ['Army', 'Marines', 'Navy & Coast Guard', 'Air Force', 'Space Force'];
    for (const g of ALL_PAY_GRADES) {
      if (WARRANT[g]) continue;
      // Abbreviations only, every service named, in order.
      const expected = expectedAbbrs(g).map((a, i) => `${names[i]} ${a.join('/')}`).join(' · ');
      expect(rankHelperText(g), g).toBe(expected + (PRIOR_ENLISTED[g] ? ' — prior enlisted' : ''));
    }
  });

  test('Navy O-7/O-8 full titles use war.gov wording', () => {
    expect(RANK_TITLES['O-7'].navy[0].title).toBe('Rear Admiral Lower Half');
    expect(RANK_TITLES['O-8'].navy[0].title).toBe('Rear Admiral Upper Half');
  });

  test('/pay/[rank] branch titles come from the module and match the pre-RL text exactly', () => {
    expect(PAY_PAGE_RANKS).toHaveLength(15);
    for (const r of PAY_PAGE_RANKS) {
      expect(r.branchTitles, r.grade).toEqual(payPageBranchTitles(r.grade));
      expect(r.branchTitles, r.grade).toEqual(PAY_PAGE_TITLES_BEFORE_RL[r.grade]);
    }
    const src = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'pay-pages', 'ranks.ts'), 'utf8');
    expect(src.match(/branchTitles: payPageBranchTitles\('/g) ?? []).toHaveLength(15);
    expect(src).not.toMatch(/branchTitles: \{/);
  });
});

// Guard: the wrong label pairings from before build RL must never come back. The
// strings are joined at run time so this file doesn't match itself.
const WRONG_PAIRINGS = [
  ['E-1 (PVT', 'SR', 'Amn'],
  ['SPC', 'Cpl', 'SN'],
  ['PFC', 'SA', 'SrA'],
  ['PV2', 'FA', 'A1C'],
].map((parts) => parts.join('/'));

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name === 'node_modules' || d.name.startsWith('.')) continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) sourceFiles(p, out);
    else if (/\.(ts|tsx|mdx)$/.test(d.name)) out.push(p);
  }
  return out;
}

test('guard: no known wrong rank pairing in any .ts/.tsx/.mdx outside src/data/ranks/', () => {
  const root = process.cwd();
  const ranksDir = path.join(root, 'src', 'data', 'ranks') + path.sep;
  const files = ['src', 'tests', 'scripts']
    .filter((d) => fs.existsSync(path.join(root, d)))
    .flatMap((d) => sourceFiles(path.join(root, d)))
    .filter((f) => !f.startsWith(ranksDir));
  // An empty scan is evidence of nothing (CLAUDE.md).
  expect(files.length).toBeGreaterThan(300);
  expect(files.some((f) => f.endsWith('.mdx'))).toBe(true);
  const hits: string[] = [];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    for (const w of WRONG_PAIRINGS) if (text.includes(w)) hits.push(`${path.relative(root, f)}: ${w}`);
  }
  expect(hits).toEqual([]);
});
