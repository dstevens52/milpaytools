import { test, expect } from '@playwright/test';
import { getCompensation, type DependentConfig } from '../../src/lib/calculations/va-disability';
import { VA_RATES_2026 } from '../../src/data/va-rates/registry';

/**
 * VA compensation lookup — dependents (VA-01) and spouse Aid & Attendance
 * (VA-04). Pinned to the 2026 table: every expected value is built from that
 * table's own cells here, never typed.
 *
 * Rule (VA-01): 38 U.S.C. § 1115(1)(F); VA rate-table footnote — "Rates for
 * each school child are shown separately… All other entries on this chart
 * reflecting a rate for children show the rate payable for children under 18".
 * The "with 1 child" base is picked from under-18 children only; every school
 * child adds the school-child amount.
 */

const T = VA_RATES_2026.table;
const deps = (p: Partial<DependentConfig>): DependentConfig => ({
  hasSpouse: false, childrenUnder18: 0, schoolChildren: 0, dependentParents: 0, ...p,
});
const comp = (rating: number, p: Partial<DependentConfig>) => getCompensation(rating, deps(p), VA_RATES_2026);
const cents = (n: number) => Math.round(n * 100);

test.describe('VA-01 — school children are never the "with 1 child" base', () => {
  test('100%, spouse, 0 under 18, 1 school child = with spouse + 1 school child', () => {
    const r = comp(100, { hasSpouse: true, schoolChildren: 1 });
    expect(cents(r.monthly)).toBe(cents(T[100].withSpouse + T[100].additionalSchoolChild));
    expect(r.breakdown.map((l) => l.label)).toEqual(['Veteran + spouse', '1 school child (18–23)']);
  });

  test('50%, no spouse, 1 school child = veteran alone + 1 school child', () => {
    const r = comp(50, { schoolChildren: 1 });
    expect(cents(r.monthly)).toBe(cents(T[50].veteranAlone + T[50].additionalSchoolChild));
  });

  test('30%, spouse, 2 school children = with spouse + 2 school children', () => {
    const r = comp(30, { hasSpouse: true, schoolChildren: 2 });
    expect(cents(r.monthly)).toBe(cents(T[30].withSpouse + 2 * T[30].additionalSchoolChild));
  });

  test('control: 30%, spouse, 1 under 18 + 1 school child = with spouse and 1 child + 1 school child', () => {
    const r = comp(30, { hasSpouse: true, childrenUnder18: 1, schoolChildren: 1 });
    expect(cents(r.monthly)).toBe(cents(T[30].withSpouseAnd1Child + T[30].additionalSchoolChild));
  });

  test('parents only and parents + school child pick the no-child columns', () => {
    expect(cents(comp(30, { dependentParents: 2 }).monthly)).toBe(cents(T[30].with2Parents));
    expect(cents(comp(70, { dependentParents: 1, schoolChildren: 1 }).monthly)).toBe(
      cents(T[70].with1Parent + T[70].additionalSchoolChild),
    );
  });

  test('70%, spouse + 1 child + 2 parents uses the Table B cell', () => {
    expect(cents(comp(70, { hasSpouse: true, childrenUnder18: 1, dependentParents: 2 }).monthly)).toBe(
      cents(T[70].withSpouseAnd1ChildAnd2Parents),
    );
  });

  test('20% is flat whatever the dependents', () => {
    expect(comp(20, { hasSpouse: true, childrenUnder18: 3, schoolChildren: 2, dependentParents: 2, spouseAidAttendance: true }).monthly)
      .toBe(comp(20, {}).monthly);
  });
});

test.describe('VA-04 — spouse receives Aid & Attendance', () => {
  test('50%, spouse with A&A = with spouse + spouse A&A', () => {
    const r = comp(50, { hasSpouse: true, spouseAidAttendance: true });
    expect(cents(r.monthly)).toBe(cents(T[50].withSpouse + T[50].spouseAA));
    expect(r.breakdown.at(-1)).toEqual({ label: 'Spouse receives Aid & Attendance', amount: T[50].spouseAA });
  });

  test('100%, spouse with A&A + 2 children under 18', () => {
    const r = comp(100, { hasSpouse: true, childrenUnder18: 2, spouseAidAttendance: true });
    expect(cents(r.monthly)).toBe(cents(T[100].withSpouseAnd1Child + T[100].additionalChild + T[100].spouseAA));
  });

  test('A&A without a spouse adds nothing', () => {
    expect(comp(50, { spouseAidAttendance: true }).monthly).toBe(comp(50, {}).monthly);
  });

  test('A&A below 30% adds nothing', () => {
    expect(comp(20, { hasSpouse: true, spouseAidAttendance: true }).monthly).toBe(T[20].veteranAlone);
  });
});
