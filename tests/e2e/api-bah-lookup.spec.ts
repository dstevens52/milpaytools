import { test, expect } from '@playwright/test';
// Import the route handler directly and invoke it in-process. This exercises the
// real route logic without a running server, so it works regardless of BASE_URL
// (the route isn't deployed yet — this is Step 2a, isolated).
import { GET } from '../../src/app/api/bah/lookup/route';
import { getBAH, getLocationName } from './helpers/data';

async function call(qs: string) {
  const res = await GET(new Request(`http://localhost/api/bah/lookup${qs ? `?${qs}` : ''}`));
  const cache = res.headers.get('cache-control');
  const body = res.status === 204 ? null : await res.json();
  return { status: res.status, cache, body };
}

test.describe('API /api/bah/lookup — contract', () => {
  test('valid CONUS ZIP (San Antonio 78234 → TX285)', async () => {
    const { status, cache, body } = await call('zip=78234');
    expect(status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.territory).toBe(false);
    expect(body.mha).toBe('TX285');
    expect(body.locationName).toBe('San Antonio, TX');
    expect(body.ratesW['E-5']).toBe(1869);
    expect(body.ratesWO['E-1']).toBe(1359);
    expect(cache).toContain('immutable');
  });

  test('Fort Bragg 28310 → NC182, E-5 w/dep = 1806 (data-accuracy anchor)', async () => {
    const { body } = await call('zip=28310');
    expect(body.mha).toBe('NC182');
    expect(body.locationName).toBe('Fort Bragg/Pope, NC');
    expect(body.ratesW['E-5']).toBe(1806);
  });

  test('NAS San Diego 92134 → CA038, E-5 w/dep = 3975 (data-accuracy anchor)', async () => {
    const { body } = await call('zip=92134');
    expect(body.mha).toBe('CA038');
    expect(body.ratesW['E-5']).toBe(3975);
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

  test('MHA-only lookup (mha=TX285) → rates, no ZIP needed', async () => {
    const { status, body } = await call('mha=TX285');
    expect(status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.mha).toBe('TX285');
    expect(body.ratesW['E-5']).toBe(1869);
    expect(body.ratesWO['E-5']).toBe(1500);
  });

  test('unknown MHA (ZZ999) → valid:false', async () => {
    const { body } = await call('mha=ZZ999');
    expect(body.valid).toBe(false);
  });

  test('cache header is immutable + long s-maxage on a valid response', async () => {
    const { cache } = await call('zip=28310');
    expect(cache).toContain('public');
    expect(cache).toContain('immutable');
    expect(cache).toContain('s-maxage=31536000');
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
