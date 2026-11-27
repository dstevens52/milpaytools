/**
 * BAH share images (build W2), served: the station page's og:image/twitter:image
 * point at /api/bah-image, and the route answers with PNGs. The figures are
 * checked in bah-share-image-unit.spec.ts; every slug × format is smoke-tested
 * by `npm run check:bah-images`.
 */
import { test, expect } from '@playwright/test';
import { bahShareImageUrl } from '../../src/lib/bahShareImage';
import { BAH_YEAR } from '../../src/data/bah/current';

test.describe('BAH share images', () => {
  test('Fort Bragg page renders and its og:image / twitter:image point at the share image', async ({ page }) => {
    await page.goto('/bah/fort-bragg');
    await expect(page.locator('h1')).toContainText('Fort Bragg');
    const expected = bahShareImageUrl('fort-bragg', 'preview');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    const tw = await page.locator('meta[name="twitter:image"]').getAttribute('content');
    expect(new URL(og!).pathname + new URL(og!).search).toBe(expected);
    expect(new URL(tw!).pathname + new URL(tw!).search).toBe(expected);
    expect(expected).toContain(`y=${BAH_YEAR}`);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  });

  test('overseas station pages keep the /api/og image', async ({ page }) => {
    await page.goto('/bah/ramstein-air-base');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(new URL(og!).pathname).toBe('/api/og');
  });

  test('route: both formats are PNGs; download=1 sets the filename', async ({ request }) => {
    const preview = await request.get(bahShareImageUrl('fort-bragg', 'preview'));
    expect(preview.status()).toBe(200);
    expect(preview.headers()['content-type']).toBe('image/png');
    expect(preview.headers()['content-disposition']).toBeUndefined();
    expect(preview.headers()['x-robots-tag']).toBe('noindex');

    const portrait = await request.get(`${bahShareImageUrl('fort-bragg', 'portrait')}&download=1`);
    expect(portrait.status()).toBe(200);
    expect(portrait.headers()['content-type']).toBe('image/png');
    expect(portrait.headers()['content-disposition']).toBe(`attachment; filename="fort-bragg-bah-${BAH_YEAR}.png"`);
  });

  test('route: unknown or overseas slug is 404; a bad format is 400', async ({ request }) => {
    expect((await request.get('/api/bah-image/not-a-station?format=preview')).status()).toBe(404);
    expect((await request.get('/api/bah-image/ramstein-air-base?format=preview')).status()).toBe(404);
    expect((await request.get('/api/bah-image/fort-bragg?format=square')).status()).toBe(400);
  });
});
