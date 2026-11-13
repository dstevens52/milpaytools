import { test, expect } from '@playwright/test';
// Import the route handler directly and invoke it in-process. This exercises the
// real route logic without a running server, so it works regardless of BASE_URL
// (the route isn't deployed yet — this is Step 2a, isolated).
import { GET } from '../../src/app/api/bah/lookup/route';
import { getBAH, getLocationName } from './helpers/data';
import { BAH_EXPECTED as X } from './fixtures/bah-expected';
import { BAH_YEAR, BAH_PRIOR_YEAR, BAH_EFFECTIVE_NOTICE } from '../../src/data/bah/current';

async function call(qs: string) {
  const res = await GET(new Request(`http://localhost/api/bah/lookup${qs ? `?${qs}` : ''}`));
  const cache = res.headers.get('cache-control');
  const body = res.status === 204 ? null : await res.json();
  return { status: res.status, cache, body };
}

test.describe('API /api/bah/lookup — contract', () => {
  test(`valid CONUS ZIP (San Antonio ${X.sanAntonio.zip} → ${X.sanAntonio.mha})`, async () => {
    const { status, cache, body } = await call(`zip=${X.sanAntonio.zip}&y=${BAH_YEAR}`);
    expect(status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.territory).toBe(false);
    expect(body.mha).toBe(X.sanAntonio.mha);
    expect(body.locationName).toBe(X.sanAntonio.locationName);
    expect(body.ratesW['E-5']).toBe(X.sanAntonio.e5W);
    expect(body.ratesWO['E-1']).toBe(X.sanAntonio.e1WO);
    expect(body.year).toBe(X.year);
    expect(cache).toContain('immutable');
  });

  test(`Fort Bragg ${X.bragg.zip} → ${X.bragg.mha}, E-5 w/dep (data-accuracy anchor, ${X.year})`, async () => {
    const { body } = await call(`zip=${X.bragg.zip}`);
    expect(body.mha).toBe(X.bragg.mha);
    expect(body.locationName).toBe(X.bragg.locationName);
    expect(body.ratesW['E-5']).toBe(X.bragg.e5W);
  });

  test('valid ZIP includes station-page guide links (28310 → Fort Bragg)', async () => {
    const { body } = await call('zip=28310');
    expect(Array.isArray(body.stationPages)).toBe(true);
    expect(body.stationPages.some((p: { slug: string }) => p.slug === 'fort-bragg')).toBe(true);
  });

  test(`NAS San Diego ${X.sanDiego.zip} → ${X.sanDiego.mha}, E-5 w/dep (data-accuracy anchor, ${X.year})`, async () => {
    const { body } = await call(`zip=${X.sanDiego.zip}`);
    expect(body.mha).toBe(X.sanDiego.mha);
    expect(body.ratesW['E-5']).toBe(X.sanDiego.e5W);
  });

  test('territory ZIP (00601, Puerto Rico) → territory:true, null rates', async () => {
    const { status, body } = await call('zip=00601');
    expect(status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.territory).toBe(true);
    expect(body.ratesW).toBeNull();
    expect(body.ratesWO).toBeNull();
  });

  test('ZIP not in dataset (00000) → valid:false, 200', async () => {
    const { status, body } = await call('zip=00000');
    expect(status).toBe(200);
    expect(body.valid).toBe(false);
  });

  test('malformed ZIP (123) → 400 with error', async () => {
    const { status, body } = await call('zip=123');
    expect(status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  test('non-numeric ZIP (abcde) → 400', async () => {
    const { status } = await call('zip=abcde');
    expect(status).toBe(400);
  });

  test('no params → 400', async () => {
    const { status, body } = await call('');
    expect(status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  test(`MHA-only lookup (mha=${X.sanAntonio.mha}) → rates, no ZIP needed`, async () => {
    const { status, body } = await call(`mha=${X.sanAntonio.mha}`);
    expect(status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.mha).toBe(X.sanAntonio.mha);
    expect(body.ratesW['E-5']).toBe(X.sanAntonio.e5W);
    expect(body.ratesWO['E-5']).toBe(X.sanAntonio.e5WO);
  });

  test('unknown MHA (ZZ999) → valid:false', async () => {
    const { body } = await call('mha=ZZ999');
    expect(body.valid).toBe(false);
  });

  test('cache header is immutable + long s-maxage on a valid response for the current year', async () => {
    const { cache } = await call(`zip=28310&y=${BAH_YEAR}`);
    expect(cache).toContain('public');
    expect(cache).toContain('immutable');
    expect(cache).toContain('s-maxage=31536000');
  });

  test('year-aware cache key: missing or other y → same data, not cached', async () => {
    const current = await call(`zip=28310&y=${BAH_YEAR}`);
    for (const qs of ['zip=28310', `zip=28310&y=${Number(BAH_YEAR) - 1}`, 'zip=00000', 'mha=TX285&y=1999']) {
      const { status, cache, body } = await call(qs);
      expect(status).toBe(200);
      expect(cache).toBe('no-store');
      expect(body.year).toBe(BAH_YEAR);
    }
    const legacy = await call('zip=28310');
    expect(legacy.body).toEqual(current.body);
  });

  test('prior-year rates only inside the effective-date window (BAH_EFFECTIVE_NOTICE)', async () => {
    const { body } = await call(`zip=${X.bragg.zip}&y=${BAH_YEAR}`);
    if (!BAH_EFFECTIVE_NOTICE) {
      expect(body).not.toHaveProperty('prior');
      return;
    }
    // Release day → Dec 31: the rates still paid until January 1.
    expect(body.prior.year).toBe(BAH_PRIOR_YEAR);
    expect(body.prior.ratesW['E-5']).toBe(X.bragg.priorE5W);
    expect(Object.keys(body.prior.ratesWO)).toHaveLength(24);
  });

  test('400 responses are not cached (no-store)', async () => {
    const { cache } = await call('zip=123');
    expect(cache).toContain('no-store');
  });

  test('byte-identical to client lookupBAH across several ZIPs', async () => {
    for (const zip of ['28310', '92134', '78234']) {
      const { body } = await call(`zip=${zip}`);
      expect(body.ratesW['E-5']).toBe(getBAH(zip, 'E-5', true));
      expect(body.ratesWO['E-5']).toBe(getBAH(zip, 'E-5', false));
      expect(body.ratesW['O-7']).toBe(getBAH(zip, 'O-7', true));
      expect(body.locationName).toBe(getLocationName(zip));
    }
  });
});
