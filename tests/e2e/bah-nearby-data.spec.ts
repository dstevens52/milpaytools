import { test, expect } from '@playwright/test';
// In-process data tests for the station `nearby` cross-link arrays (no server needed).
import { DUTY_STATIONS } from '../../src/data/duty-stations/stations';
import { nearbyDeltas } from '../../src/lib/calculations/bahStats';
import { NEARBY_FIRST3_MAIN } from './fixtures/nearby-first3-main';

const SLUGS = new Set(DUTY_STATIONS.map((s) => s.slug));
const MAX_NEARBY = 6;

test.describe('stations.ts — nearby arrays', () => {
  test('every station is in the main snapshot (and vice versa)', () => {
    expect(DUTY_STATIONS.map((s) => s.slug).sort()).toEqual(Object.keys(NEARBY_FIRST3_MAIN).sort());
  });

  for (const s of DUTY_STATIONS) {
    test(`${s.slug}: targets exist, no self-link, no duplicates, max ${MAX_NEARBY}, first 3 unchanged`, () => {
      for (const t of s.nearby) expect(SLUGS.has(t), `${s.slug} → unknown slug ${t}`).toBe(true);
      expect(s.nearby).not.toContain(s.slug);
      expect(new Set(s.nearby).size).toBe(s.nearby.length);
      expect(s.nearby.length).toBeGreaterThanOrEqual(3);
      expect(s.nearby.length).toBeLessThanOrEqual(MAX_NEARBY);
      // FAQ text depends on these three, in this order — append-only.
      expect(s.nearby.slice(0, 3)).toEqual(NEARBY_FIRST3_MAIN[s.slug].slice(0, 3));
      expect(s.nearby.slice(0, NEARBY_FIRST3_MAIN[s.slug].length)).toEqual(NEARBY_FIRST3_MAIN[s.slug]);
    });
  }
});

test.describe('nearbyDeltas — block order', () => {
  test('original 3 come first in DUTY_STATIONS order, then additions in array order', () => {
    const order = DUTY_STATIONS.map((s) => s.slug);
    for (const s of DUTY_STATIONS.filter((x) => !x.oconus)) {
      const got = nearbyDeltas(s.slug).map((d) => d.slug);
      const first3 = [...s.nearby.slice(0, 3)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      expect(got, s.slug).toEqual([...first3, ...s.nearby.slice(3)]);
    }
  });

  test('a station with additions renders them all (JBLM)', () => {
    const jblm = DUTY_STATIONS.find((s) => s.slug === 'joint-base-lewis-mcchord')!;
    expect(jblm.nearby.length).toBeGreaterThan(3);
    expect(nearbyDeltas('joint-base-lewis-mcchord')).toHaveLength(jblm.nearby.length);
  });
});
