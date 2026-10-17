import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import {
  OCONUS_V2_STATIONS,
  oconusTitle,
  oconusDescription,
  OCONUS_TITLE_MAX,
  OCONUS_DESC_MAX,
} from '../../src/data/oconus';
import { ramstein } from '../../src/data/oconus/ramstein';
import { allSharedCopy, OFFICIAL_LOOKUPS, EXPLAINER_SOURCES } from '../../src/data/oconus/sharedCopy';
import { lintStation, lintShared, lintText } from '../../scripts/oconusLint';
import { currencyFixture, voiceFixture, publishedUnverifiedFixture } from './helpers/oconusFixtures';

// Unit-level checks for the v2 OCONUS template — no browser page needed.

test.describe('OCONUS v2 — metadata lengths', () => {
  test('registry is non-empty (an empty loop below would prove nothing)', () => {
    expect(OCONUS_V2_STATIONS.length).toBeGreaterThan(0);
  });

  for (const s of OCONUS_V2_STATIONS) {
    test(`${s.slug}: title ≤ ${OCONUS_TITLE_MAX}, description ≤ ${OCONUS_DESC_MAX}`, () => {
      expect(oconusTitle(s).length).toBeLessThanOrEqual(OCONUS_TITLE_MAX);
      expect(oconusDescription(s).length).toBeLessThanOrEqual(OCONUS_DESC_MAX);
    });
  }

  test('Ramstein title matches the spec pattern', () => {
    expect(oconusTitle(ramstein)).toBe("Ramstein AB BAH? It's OHA — Housing & COLA Guide");
  });
});

test.describe('OCONUS v2 — lints', () => {
  test('Ramstein passes all lints (no errors)', () => {
    expect(lintStation(ramstein).filter((i) => i.severity === 'error')).toEqual([]);
  });

  test('shared copy passes all lints (no errors)', () => {
    const copy = allSharedCopy();
    expect(copy.length).toBeGreaterThan(0);
    const issues = lintShared(copy, [...OFFICIAL_LOOKUPS, ...EXPLAINER_SOURCES], false);
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  test('fixture containing "€150" fails the currency lint, naming station and field', () => {
    const issues = lintStation(currencyFixture).filter((i) => i.rule === 'currency');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatchObject({ station: 'fixture-station', field: 'localContext', severity: 'error' });
  });

  test('fixture containing "you should" fails the voice lint, naming station and field', () => {
    const issues = lintStation(voiceFixture).filter((i) => i.rule === 'voice' && i.severity === 'error');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatchObject({ station: 'fixture-station', field: 'beforeYouMove[0]', match: 'you should' });
  });

  test('published station with unverified facts fails the verification lint', () => {
    const issues = lintStation(publishedUnverifiedFixture).filter((i) => i.rule === 'verification');
    expect(issues.length).toBeGreaterThan(0);
  });

  test('currency patterns catch symbol-after, code, and percent forms', () => {
    const ctx = { station: 'x', field: 'f', isStationData: true };
    for (const t of ['150 €', '150€', '1,500 EUR', '20 dollars', '19% VAT', '$2,000']) {
      expect(lintText(t, ctx).some((i) => i.rule === 'currency'), t).toBe(true);
    }
    for (const t of ['DE700', 'Chapter 10', 'twice a month']) {
      expect(lintText(t, ctx).some((i) => i.rule === 'currency'), t).toBe(false);
    }
  });

  test('lint CLI (the prebuild step) exits 0 on the current data', () => {
    const out = execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/lint-oconus.ts'], {
      encoding: 'utf8',
    });
    expect(out).toContain('0 error(s)');
  });
});
