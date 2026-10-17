import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import {
  OCONUS_V2_STATIONS,
  oconusTitle,
  oconusDescription,
  oconusRenderedTitle,
  OCONUS_RENDERED_TITLE_MAX,
  OCONUS_DESC_MAX,
} from '../../src/data/oconus';
import { ramstein } from '../../src/data/oconus/ramstein';
import { allSharedCopy, ALL_SHARED_LINKS, oconusFaqs, EXPLAINER_LEAD, EXPLAINER_POINTS } from '../../src/data/oconus/sharedCopy';
import { lintStation, lintShared, lintText } from '../../scripts/oconusLint';
import { currencyFixture, voiceFixture, publishedUnverifiedFixture } from './helpers/oconusFixtures';

// Unit-level checks for the v2 OCONUS template — no browser page needed.

test.describe('OCONUS v2 — metadata lengths', () => {
  test('registry is non-empty (an empty loop below would prove nothing)', () => {
    expect(OCONUS_V2_STATIONS.length).toBeGreaterThan(0);
  });

  for (const s of OCONUS_V2_STATIONS) {
    test(`${s.slug}: rendered title ≤ ${OCONUS_RENDERED_TITLE_MAX}, description ≤ ${OCONUS_DESC_MAX}`, () => {
      expect(oconusRenderedTitle(s).length).toBeLessThanOrEqual(OCONUS_RENDERED_TITLE_MAX);
      expect(oconusDescription(s).length).toBeLessThanOrEqual(OCONUS_DESC_MAX);
    });
  }

  test('Ramstein title matches the spec pattern', () => {
    expect(oconusTitle(ramstein)).toBe("Ramstein AB BAH? It's OHA — Housing & COLA Guide");
  });

  test('Ramstein description keeps full name and country (no fallback)', () => {
    expect(oconusDescription(ramstein)).toBe(
      'Ramstein Air Base, Germany: eligible members renting privately generally get OHA, not BAH. How OHA and COLA work, with official DTMO lookups.',
    );
  });

  test('long names fall back to short name + country, still within the limit', () => {
    const long = { ...ramstein, name: 'Royal Air Force Lakenheath and Royal Air Force Mildenhall', shortName: 'RAF Lakenheath', hostCountry: { ...ramstein.hostCountry, value: 'United Kingdom' } };
    const d = oconusDescription(long);
    expect(d.length).toBeLessThanOrEqual(OCONUS_DESC_MAX);
    expect(d.startsWith('RAF Lakenheath, United Kingdom:')).toBe(true);
  });

  test('very long short names drop the country last, still within the limit', () => {
    const long = { ...ramstein, name: 'Royal Air Force Lakenheath and Royal Air Force Mildenhall', shortName: 'RAF Lakenheath/Mildenhall', hostCountry: { ...ramstein.hostCountry, value: 'United Kingdom' } };
    const d = oconusDescription(long);
    expect(d.length).toBeLessThanOrEqual(OCONUS_DESC_MAX);
    expect(d.startsWith('RAF Lakenheath/Mildenhall:')).toBe(true);
  });
});

test.describe('OCONUS v2 — lints', () => {
  test('Ramstein passes all lints (no errors)', () => {
    expect(lintStation(ramstein).filter((i) => i.severity === 'error')).toEqual([]);
  });

  test('shared copy passes all lints (no errors)', () => {
    const copy = allSharedCopy();
    expect(copy.length).toBeGreaterThan(0);
    const issues = lintShared(copy, ALL_SHARED_LINKS, true);
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

  test('"150 €" (symbol after the number, with a space) fails the currency lint', () => {
    const issues = lintText('Heating can run 150 € a month.', { station: 'x', field: 'f', isStationData: true });
    expect(issues.some((i) => i.rule === 'currency' && i.severity === 'error')).toBe(true);
  });

  test('lint CLI (the prebuild step) exits 0 on the current data', () => {
    const out = execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/lint-oconus.ts'], {
      encoding: 'utf8',
    });
    expect(out).toContain('0 error(s)');
  });
});

test.describe('OCONUS v2 — FAQ schema', () => {
  test('answers are built verbatim from the visible explainer copy', () => {
    const faqs = oconusFaqs({ name: ramstein.name, ohaLocalityCode: ramstein.ohaLocalityCode.value });
    expect(faqs.map((f) => f.question)).toEqual([
      'Do members at Ramstein Air Base receive BAH?',
      'How does OHA work?',
      'How often do OHA and OCONUS COLA change?',
    ]);
    expect(faqs[0].answer).toContain(EXPLAINER_LEAD.body);
    expect(faqs[1].answer).toContain(EXPLAINER_POINTS[3].body);
    expect(faqs[1].answer).toContain('DE700 for Ramstein Air Base');
    expect(faqs[2].answer).toContain('twice a month');
    for (const f of faqs) expect(f.answer).not.toMatch(/\{\w+\}/); // no unfilled tokens
  });
});
