/**
 * R3 one-year rule (FIX_QUEUE row 11d): any figure that adds pay to BAH uses one
 * year for both (src/lib/combinedPayYear.ts).
 *
 * Data-only: no page, no server. The transition state is forced with a
 * synthetic next-year BAH table (every rate +$100: the R2 / bah-release-day
 * fixture pattern), never real 2027 data. The site's own pages are checked for
 * "nothing changes today" by the main-vs-branch dump in the R3 report.
 *
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/one-year-rule.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';
import {
  combinedPayBahYear,
  pendingBahYear,
  combinedBahRatesYear,
  pendingBahLabel,
  CURRENT_PAY_BAH_YEARS,
  type PayBahYears,
} from '../../src/lib/combinedPayYear';
import { BAH_YEAR } from '../../src/data/bah/current';
import { DATA_YEAR as PAY_YEAR } from '../../src/data/pay-tables/2026';
import { BAS_RATES } from '../../src/data/constants';
import {
  combinedBahYear,
  combinedBahForZip,
  pendingBahForZip,
  getMHACode,
  getMHARates,
  getNationalAverages,
  bahRateForZipInYear,
  CURRENT_BAH_YEAR,
} from '../../src/lib/calculations/bah';
import { lookupBasePay } from '../../src/lib/calculations/basePay';
import { calculateTotalCompensation } from '../../src/lib/calculations/total-compensation';
import { compareLocations } from '../../src/lib/calculations/compare';
import { calculateDeployment, defaultDeploymentFilingStatus } from '../../src/lib/calculations/deployment';
import { calculateTransitionReadiness } from '../../src/lib/calculations/transition-readiness';
import { TR_EXAMPLE_INPUT } from '../../src/lib/calculations/transition-readiness-example';
import { stationTotalPayForYears } from '../../src/lib/calculations/stationTotalPay';
import { SAMPLE_SCENARIO, SAMPLE_SCENARIO_INPUT } from '../../src/lib/sample-scenario';
import { GET as bahLookupGET } from '../../src/app/api/bah/lookup/route';

const NEXT = String(Number(PAY_YEAR) + 1);
const TODAY: PayBahYears = { payYear: PAY_YEAR, bahYear: PAY_YEAR };
const TRANSITION: PayBahYears = { payYear: PAY_YEAR, bahYear: NEXT }; // BAH release day → January pay flip
const JANUARY: PayBahYears = { payYear: NEXT, bahYear: NEXT }; // after the pay flip

test.describe('combinedPayYear: the three states', () => {
  test('today: one year, nothing pending, lookups unchanged (no ratesYear)', () => {
    expect(combinedPayBahYear(TODAY)).toBe(PAY_YEAR);
    expect(pendingBahYear(TODAY)).toBeNull();
    expect(combinedBahRatesYear(TODAY)).toBeUndefined();
  });

  test('transition: totals stay on the pay year; the newer BAH is pending; lookups ask for the pay year', () => {
    expect(combinedPayBahYear(TRANSITION)).toBe(PAY_YEAR);
    expect(pendingBahYear(TRANSITION)).toBe(NEXT);
    expect(combinedBahRatesYear(TRANSITION)).toBe(PAY_YEAR);
    expect(pendingBahLabel(NEXT)).toBe(`${NEXT} BAH (from Jan. 1)`);
  });

  test('January (pay table flipped): the new year for both, nothing pending', () => {
    expect(combinedPayBahYear(JANUARY)).toBe(NEXT);
    expect(pendingBahYear(JANUARY)).toBeNull();
    expect(combinedBahRatesYear(JANUARY)).toBeUndefined();
  });

  test('a pay table newer than the loaded BAH is a configuration error, never a silent mix', () => {
    expect(() => combinedPayBahYear({ payYear: NEXT, bahYear: PAY_YEAR })).toThrow(/one-year rule/);
  });

  test("the site's current state: pay table and BAH year as configured", () => {
    expect(CURRENT_PAY_BAH_YEARS).toEqual({ payYear: PAY_YEAR, bahYear: BAH_YEAR });
    expect(combinedBahYear()).toBe(combinedPayBahYear());
    if (BAH_YEAR === PAY_YEAR) {
      // Today: nothing pending, and every combined figure reads the same BAH as before.
      expect(pendingBahYear()).toBeNull();
      expect(pendingBahForZip('28310', 'E-5', true)).toBeNull();
      const mha = getMHACode('28310')!;
      expect(combinedBahForZip('28310', 'E-5', true)).toBe(getMHARates(mha, true)!['E-5']);
      expect(combinedBahForZip('28310', 'O-9', true)).toBe(getMHARates(mha, true)!['O-7']); // O-8+ use O-7
      expect(getNationalAverages(combinedBahYear())).toEqual(getNationalAverages());
    }
  });

  test('homepage sample scenario = pay + the combined year’s BAH + BAS', () => {
    const bah = bahRateForZipInYear(SAMPLE_SCENARIO_INPUT.zipCode, 'E-5', true, combinedBahYear())!;
    expect(SAMPLE_SCENARIO.monthlyBAH).toBe(bah);
    expect(SAMPLE_SCENARIO.totalMonthly).toBeCloseTo(lookupBasePay('E-5', 8) + bah + BAS_RATES.enlisted, 2);
  });
});

test.describe('Forced transition fixture: totals use the pay year’s BAH; the newer BAH is its own line', () => {
  // Synthetic next-year BAH: every pay-year rate +$100 (never real data).
  const ZIP = '28310';
  const mha = getMHACode(ZIP)!;
  const payYearW = getMHARates(mha, true)!;
  const payYearWO = getMHARates(mha, false)!;
  const bump = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).map(([g, v]) => [g, v + 100]));
  const fixture: Record<string, { w: Record<string, number>; wo: Record<string, number> }> = {
    [PAY_YEAR]: { w: payYearW, wo: payYearWO },
    [NEXT]: { w: bump(payYearW), wo: bump(payYearWO) },
  };
  // What every combined figure reads in transition mode, and the separate line.
  const year = combinedPayBahYear(TRANSITION);
  const pending = pendingBahYear(TRANSITION)!;
  const bahFor = (grade: string, dep: boolean) => fixture[year][dep ? 'w' : 'wo'][grade];
  const lineFor = (grade: string, dep: boolean) => fixture[pending][dep ? 'w' : 'wo'][grade];

  test('the fixture differs between years (control)', () => {
    expect(year).toBe(PAY_YEAR);
    expect(pending).toBe(NEXT);
    expect(lineFor('E-5', true)).toBe(bahFor('E-5', true) + 100);
  });

  test('total compensation: pay-year pay + pay-year BAH + BAS; the 2027 line is the next-year table', () => {
    const bah = bahFor('E-5', true);
    const r = calculateTotalCompensation(
      { payGrade: 'E-5', yearsOfService: 8, zipCode: ZIP, hasDependents: true, retirementSystem: 'brs', tspContributionPct: 5, govHousing: false, mealCard: false },
      bah,
    );
    expect(r.totalMonthly).toBeCloseTo(lookupBasePay('E-5', 8) + payYearW['E-5'] + BAS_RATES.enlisted, 2);
    expect(r.totalMonthly).not.toBeCloseTo(lookupBasePay('E-5', 8) + lineFor('E-5', true) + BAS_RATES.enlisted, 2);
    expect(lineFor('E-5', true)).toBe(fixture[NEXT].w['E-5']);
  });

  test('PCS compare: both stations’ gross = pay-year pay + pay-year BAH + BAS', () => {
    // Station A from the fixture (pay year); station B's pay-year rate from the data.
    const mhaB = getMHACode('98433')!;
    const bahA = { monthlyBAH: bahFor('E-5', true), locationName: ZIP, bahFound: true, mha };
    const bahB = { monthlyBAH: getMHARates(mhaB, true)!['E-5'], locationName: '98433', bahFound: true, mha: mhaB };
    const r = compareLocations({ payGrade: 'E-5', yearsOfService: 8, hasDependents: true, zipA: ZIP, zipB: '98433', bahA, bahB })!;
    const pay = lookupBasePay('E-5', 8);
    expect(r.locA.grossMonthly).toBeCloseTo(pay + payYearW['E-5'] + BAS_RATES.enlisted, 2);
    expect(r.locB.grossMonthly).toBeCloseTo(pay + getMHARates(getMHACode('98433')!, true)!['E-5'] + BAS_RATES.enlisted, 2);
  });

  test('deployment: pre-deployment gross = pay-year pay + pay-year BAH + BAS', () => {
    const r = calculateDeployment({
      payGrade: 'E-5', yearsOfService: 8, hasDependents: true, filingStatus: defaultDeploymentFilingStatus(true),
      zipCode: ZIP, monthlyBAH: bahFor('E-5', true), bahFound: true, deploymentMonths: 9, isCombatZone: true,
      receivingIDP: true, hdpLevel: 0, hasFSA: true, tspContributionPct: 0, usingSDP: false, sdpDeposit: 0,
    });
    expect(r.pre.grossMonthly).toBeCloseTo(lookupBasePay('E-5', 8) + payYearW['E-5'] + BAS_RATES.enlisted, 2);
  });

  test('transition readiness: military total = pay-year pay + pay-year BAH + BAS', () => {
    const g = TR_EXAMPLE_INPUT.payGrade;
    const dep = TR_EXAMPLE_INPUT.hasDependents;
    const r = calculateTransitionReadiness({ ...TR_EXAMPLE_INPUT, zipCode: ZIP }, bahFor(g, dep));
    const bas = g.startsWith('E-') ? BAS_RATES.enlisted : BAS_RATES.officer;
    expect(r.militaryMonthlyBAH).toBe((dep ? payYearW : payYearWO)[g]);
    expect(r.militaryTotalMonthly).toBeCloseTo(lookupBasePay(g, TR_EXAMPLE_INPUT.yearsOfService) + (dep ? payYearW : payYearWO)[g] + bas, 2);
  });

  test('station page total pay: same helper — pay-year BAH in the rows, the newer year pending', () => {
    const d = stationTotalPayForYears((y) => fixture[y] ?? null, NEXT)!;
    expect(d.payYear).toBe(PAY_YEAR);
    expect(d.pendingYear).toBe(NEXT);
    const e5 = d.rows.find((r) => r.grade === 'E-5')!;
    expect(e5.w!.bah).toBe(payYearW['E-5']);
    expect(e5.w!.totalMin).toBeCloseTo(e5.basicMin! + payYearW['E-5'] + e5.bas, 2);
  });
});

test.describe('Lookup API: ratesYear (what client calculators request in transition mode)', () => {
  test('ratesYear = the current year returns the same rates as no ratesYear (today’s requests unchanged)', async () => {
    const a = await (await bahLookupGET(new Request(`http://localhost/api/bah/lookup?zip=28310&y=${BAH_YEAR}`))).json();
    const b = await (await bahLookupGET(new Request(`http://localhost/api/bah/lookup?zip=28310&y=${BAH_YEAR}&ratesYear=${CURRENT_BAH_YEAR}`))).json();
    expect(b.ratesW).toEqual(a.ratesW);
    expect(b.ratesWO).toEqual(a.ratesWO);
    expect(b.mha).toBe(a.mha);
  });
});
