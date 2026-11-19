import { test, expect } from '@playwright/test';
import {
  authorizedPOVs,
  calculateDLA,
  calculateMALT,
  calculatePCS,
  calculatePerDiem,
  calculateTLE,
  calculateTravelDays,
  getWeightAllowance,
  tlePercent,
  type PCSInput,
} from '../../src/lib/calculations/pcs';
import { PCS_RATES_2026 } from '../../src/data/pcs/2026/constants';
import { CONUS_PER_DIEM, PCS_PER_DIEM_RATE, conusPerDiemForDate } from '../../src/data/pcs/conusPerDiem';

// PCS rules (build 07, audit PCS-01–07 + DATA flags). Unit tests: no page is opened.
// Rules and sources: docs/sources/pcs-rules-2026.md. Run: npm run test:pcs-rules

const base: PCSInput = {
  rank: 'E-5',
  hasDependents: true,
  depsAge12Plus: 1,
  depsUnder12: 0,
  moveType: 'gov',
  distance: 1000,
  numPOVs: 1,
  hhgWeight: 0,
  tleOldDays: 0,
  tleNewDays: 0,
};

test.describe('PCS-01 travel days (JTR 050205)', () => {
  // PDTATAC computation examples (rules note §1).
  for (const [miles, days, source] of [
    [1010, 3, 'CE-MPDT-07'],
    [1500, 5, 'CE-MPDT-01'],
    [2627, 8, 'CE-CPDT-20'],
  ] as const) {
    test(`${miles} miles → ${days} days (${source})`, () => {
      expect(calculateTravelDays(miles)).toBe(days);
    });
  }

  for (const [miles, days] of [
    [0, 0],
    [1, 1],
    [400, 1],
    [401, 2],
    [450, 2],
    [750, 2],
    [751, 3],
    [1120, 4], // audit scenario: was 3
    [1150, 4],
    [1151, 4],
    [2900, 9],
  ] as const) {
    test(`${miles} miles → ${days} days`, () => {
      expect(calculateTravelDays(miles)).toBe(days);
    });
  }
});

test.describe('DATA: standard CONUS per diem (GSA)', () => {
  test('FY2026 is $110 + $68, FY2027 is $113 + $68, each with a Federal Register source', () => {
    expect(CONUS_PER_DIEM.FY2026).toMatchObject({ lodging: 110, mie: 68, start: '2025-10-01', end: '2026-09-30' });
    expect(CONUS_PER_DIEM.FY2027).toMatchObject({ lodging: 113, mie: 68, start: '2026-10-01', end: '2027-09-30' });
    for (const r of Object.values(CONUS_PER_DIEM)) expect(r.source.url).toMatch(/^https:\/\/www\.federalregister\.gov\//);
  });

  test('the estimator uses FY2027 (moves on or after Oct 1, 2026)', () => {
    expect(PCS_PER_DIEM_RATE.fiscalYear).toBe('FY2027');
  });

  test('date lookup picks the fiscal year', () => {
    expect(conusPerDiemForDate('2026-09-30')?.fiscalYear).toBe('FY2026');
    expect(conusPerDiemForDate('2026-10-01')?.fiscalYear).toBe('FY2027');
    expect(conusPerDiemForDate('2027-10-01')).toBeNull();
  });
});

test.describe('PCS-04 en route per diem (MALT Plus, JTR Table 5-4)', () => {
  test('member: travel days × full standard rate, no 75% day', () => {
    expect(calculatePerDiem(1, 0, 0).memberPerDiem).toBe(181);
    expect(calculatePerDiem(4, 0, 0).memberPerDiem).toBe(4 * 181);
    expect(calculatePerDiem(0, 1, 1).total).toBe(0);
  });

  test('dependents: 75% each if 12 or older, 50% if under 12', () => {
    expect(calculatePerDiem(1, 1, 0).dependentsPerDiem).toBe(135.75);
    expect(calculatePerDiem(1, 0, 1).dependentsPerDiem).toBe(90.5);
    // Spouse + 2 children under 12, 4 days: 4 × 181 × (0.75 + 0.5 + 0.5)
    const r = calculatePerDiem(4, 1, 2);
    expect(r.memberPerDiem).toBe(724);
    expect(r.dependentsPerDiem).toBe(1267);
    expect(r.total).toBe(1991);
  });

  test('FY2026 rate can be passed explicitly', () => {
    expect(calculatePerDiem(2, 0, 0, CONUS_PER_DIEM.FY2026).memberPerDiem).toBe(2 * 178);
  });
});

test.describe('PCS-02 TLE (JTR 050601, Table 5-17)', () => {
  test('percentages by family size', () => {
    expect(tlePercent(0, 0)).toBe(0.65); // member alone
    expect(tlePercent(1, 0)).toBe(1.0); // member + spouse
    expect(tlePercent(0, 1)).toBe(1.0); // member + child
    expect(tlePercent(1, 1)).toBeCloseTo(1.25); // + child under 12
    expect(tlePercent(1, 2)).toBeCloseTo(1.5); // spouse + 2 under 12
    expect(tlePercent(3, 0)).toBeCloseTo(1.7); // spouse + 2 aged 12+
    expect(tlePercent(1, 0, false)).toBe(0.65); // one dependent alone
    expect(tlePercent(2, 0, false)).toBe(1.0); // two dependents
  });

  test('audit scenario: single E-4 and family of four no longer get the same TLE', () => {
    const single = calculateTLE(10, 0, 0, 0);
    const family = calculateTLE(10, 0, 1, 2);
    expect(single.dailyRate).toBe(117.65); // 65% × $181
    expect(single.total).toBeCloseTo(1176.5, 2);
    expect(family.dailyRate).toBe(271.5); // 150% × $181
    expect(family.total).toBe(2715);
  });

  test('$290 daily cap (lodging taxes included)', () => {
    // Spouse + 3 children under 12 = 175% × $181 = $316.75 → $290
    const r = calculateTLE(5, 0, 1, 3);
    expect(r.percent).toBeCloseTo(1.75);
    expect(r.dailyRate).toBe(PCS_RATES_2026.tle.dailyCap);
    expect(r.dailyRate).toBe(290);
    expect(r.total).toBe(5 * 290);
  });

  test('21 days in total across old and new stations for a CONUS move', () => {
    expect(calculateTLE(14, 14, 1, 0).days).toBe(21);
    expect(calculateTLE(21, 0, 1, 0).days).toBe(21);
    expect(calculateTLE(10, 10, 1, 0).days).toBe(20);
  });

  test('7 days for a CONUS → OCONUS move', () => {
    const r = calculateTLE(5, 5, 1, 0, 'conus-to-oconus');
    expect(r.maxDays).toBe(7);
    expect(r.days).toBe(7);
  });
});

test.describe('PCS-03 weight allowance (JTR Table 5-37, Oct 1, 2024 edition)', () => {
  // [grade, with dependents, without dependents] — rules note §5.
  const TABLE: [string, number, number][] = [
    ['O-10', 18000, 18000], ['O-9', 18000, 18000], ['O-8', 18000, 18000], ['O-7', 18000, 18000], ['O-6', 18000, 18000],
    ['O-5', 17500, 16000], ['W-5', 17500, 16000],
    ['O-4', 17000, 14000], ['W-4', 17000, 14000],
    ['O-3', 14500, 13000], ['W-3', 14500, 13000],
    ['O-2', 13500, 12500], ['W-2', 13500, 12500],
    ['O-1', 12000, 10000], ['W-1', 12000, 10000],
    ['E-9', 15000, 13000], ['E-8', 14000, 12000], ['E-7', 13000, 11000], ['E-6', 11000, 8000],
    ['E-5', 9000, 7000], ['E-4', 8000, 7000],
    ['E-3', 8000, 5000], ['E-2', 8000, 5000], ['E-1', 8000, 5000],
  ];

  test('every grade matches both columns', () => {
    expect(TABLE.length).toBe(24);
    const mismatches = TABLE.flatMap(([g, w, wo]) => {
      const out: string[] = [];
      if (getWeightAllowance(g, true) !== w) out.push(`${g} with: ${getWeightAllowance(g, true)} ≠ ${w}`);
      if (getWeightAllowance(g, false) !== wo) out.push(`${g} without: ${getWeightAllowance(g, false)} ≠ ${wo}`);
      return out;
    });
    expect(mismatches).toEqual([]);
    expect(Object.keys(PCS_RATES_2026.weightAllowance.withDependents).sort()).toEqual(TABLE.map(([g]) => g).sort());
    expect(Object.keys(PCS_RATES_2026.weightAllowance.withoutDependents).sort()).toEqual(TABLE.map(([g]) => g).sort());
  });

  test('spot checks: E-5 7,000 / 9,000; O-6 18,000 / 18,000', () => {
    expect(getWeightAllowance('E-5', false)).toBe(7000);
    expect(getWeightAllowance('E-5', true)).toBe(9000);
    expect(getWeightAllowance('O-6', false)).toBe(18000);
    expect(getWeightAllowance('O-6', true)).toBe(18000);
  });

  test('prior-enlisted officers use the O-1/O-2/O-3 rows', () => {
    for (const [pe, o] of [['O-1E', 'O-1'], ['O-2E', 'O-2'], ['O-3E', 'O-3']]) {
      expect(getWeightAllowance(pe, true)).toBe(getWeightAllowance(o, true));
      expect(getWeightAllowance(pe, false)).toBe(getWeightAllowance(o, false));
    }
  });
});

test.describe('PCS-05 prior-enlisted officers', () => {
  test('O-1E–O-3E DLA is never $0', () => {
    expect(calculateDLA('O-1E', true)).toBe(3621.1);
    expect(calculateDLA('O-1E', false)).toBe(2687.09);
    expect(calculateDLA('O-3E', true)).toBe(4343.8);
  });
});

test.describe('PCS-06 PPM', () => {
  test('no typed $/cwt rate and no PPM dollar output', () => {
    expect('ppmPerCWT' in PCS_RATES_2026).toBe(false);
    const out = calculatePCS({ ...base, moveType: 'full-ppm', hhgWeight: 9000 });
    expect(Object.keys(out).filter((k) => k.startsWith('ppm'))).toEqual([]);
    expect(PCS_RATES_2026.ppmIncentivePercentOfGcc).toBe(1);
  });
});

test.describe('PCS-07 edge cases', () => {
  test('second-POV MALT only when a dependent travels (JTR 050203, Table 5-1)', () => {
    expect(authorizedPOVs(2, 0)).toBe(1);
    expect(authorizedPOVs(2, 1)).toBe(2);
    expect(calculateMALT(1120, 2, 0)).toBeCloseTo(229.6, 2);
    const alone = calculatePCS({ ...base, hasDependents: false, depsAge12Plus: 0, distance: 1120, numPOVs: 2 });
    expect(alone.maltPOVs).toBe(1);
    expect(alone.malt).toBeCloseTo(229.6, 2); // audit: was $459.20
    const withSpouse = calculatePCS({ ...base, distance: 1120, numPOVs: 2 });
    expect(withSpouse.maltPOVs).toBe(2);
    expect(withSpouse.malt).toBeCloseTo(459.2, 2);
  });

  test('member with dependents who travel separately: one POV', () => {
    const r = calculatePCS({ ...base, depsAge12Plus: 0, depsUnder12: 0, numPOVs: 2, distance: 500 });
    expect(r.maltPOVs).toBe(1);
  });

  test('distance 0: DLA and TLE not counted as payable', () => {
    const r = calculatePCS({ ...base, distance: 0, tleOldDays: 5 });
    expect(r.isLocalMove).toBe(true);
    expect(r.dla).toBe(0);
    expect(r.dlaRate).toBe(3548.02);
    expect(r.tleTotal).toBe(0);
    expect(r.govMoveTotal).toBe(0);
  });
});

test.describe('Hold scenario: E-5, spouse + 2 children under 12, 1,120 miles', () => {
  test('full output', () => {
    const r = calculatePCS({ ...base, depsAge12Plus: 1, depsUnder12: 2, distance: 1120 });
    expect(r.travelDays).toBe(4);
    expect(r.dla).toBe(3548.02);
    expect(r.malt).toBeCloseTo(229.6, 2);
    expect(r.perDiemMember).toBe(724);
    expect(r.perDiemDependents).toBe(1267);
    expect(r.weightAllowance).toBe(9000);
    expect(r.govMoveTotal).toBeCloseTo(5768.62, 2);
  });
});
