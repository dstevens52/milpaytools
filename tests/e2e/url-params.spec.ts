/**
 * Unit tests for the grade URL helpers in src/lib/urlParams.ts.
 *
 * Data-only: no page fixture, so no browser or server is needed. Run with
 *   cross-env BASE_URL=http://no-server.invalid npx playwright test tests/e2e/url-params.spec.ts --project=chromium
 * (a non-localhost BASE_URL turns off the config's webServer).
 *
 * Why: the station page sent ?rank=E-7 to calculators whose parser only took
 * e7, so the rank was silently dropped and the calculator showed E-5.
 */

import { test, expect } from '@playwright/test';
import { parseGrade, gradeToParam } from '@/lib/urlParams';
import { ALL_PAY_GRADES } from '@/types/military';

test.describe('parseGrade — accepted forms', () => {
  for (const raw of ['e5', 'E5', 'e-5', 'E-5', ' E-5 ', '\tE-5\n']) {
    test(`${JSON.stringify(raw)} → E-5`, () => {
      expect(parseGrade(raw)).toBe('E-5');
    });
  }

  for (const raw of ['o1e', 'O1E', 'o-1e', 'O-1E', ' O-1E ']) {
    test(`${JSON.stringify(raw)} → O-1E`, () => {
      expect(parseGrade(raw)).toBe('O-1E');
    });
  }

  test('two-digit grade: o10 / O-10 → O-10', () => {
    expect(parseGrade('o10')).toBe('O-10');
    expect(parseGrade('O-10')).toBe('O-10');
  });

  test('warrant: w2 / W-2 → W-2', () => {
    expect(parseGrade('w2')).toBe('W-2');
    expect(parseGrade('W-2')).toBe('W-2');
  });
});

test.describe('parseGrade — invalid input returns null', () => {
  const invalid: (string | null)[] = [
    'e10', // no such enlisted grade
    'x5', // no such category
    'o4e', // -E scale exists only for O-1 to O-3
    'w6',
    'e0',
    'e',
    '5',
    'e--5',
    'e 5',
    'e5x',
    'E-5E',
    '',
    '   ',
    null,
  ];
  for (const raw of invalid) {
    test(`${JSON.stringify(raw)} → null`, () => {
      expect(parseGrade(raw)).toBeNull();
    });
  }
});

test.describe('gradeToParam ↔ parseGrade round trip', () => {
  test('ALL_PAY_GRADES is non-empty (guards against an empty loop)', () => {
    expect(ALL_PAY_GRADES.length).toBe(27);
  });

  for (const g of ALL_PAY_GRADES) {
    test(`${g} → ${gradeToParam(g)} → ${g}`, () => {
      const param = gradeToParam(g);
      expect(param).toMatch(/^[eow]\d+e?$/); // canonical short form
      expect(parseGrade(param)).toBe(g);
      expect(parseGrade(g)).toBe(g); // the hyphen form is accepted too
    });
  }
});
