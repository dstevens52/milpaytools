/**
 * GET /api/bah/lookup
 *
 * Server-side BAH resolution so calculator clients don't have to ship the
 * ~166KB BAH dataset (zipToMha + mhaRates + mhaNames). The data is immutable
 * for the year, so responses are aggressively CDN-cacheable.
 *
 * This route imports bah.ts SERVER-SIDE only. It is purely additive — nothing
 * depends on it yet. Returned values are byte-identical to the client-side
 * lookupBAH / getMHARates output (same bah.ts functions, same data).
 *
 * Query params:
 *   ?zip=NNNNN   5-digit ZIP (primary). Takes precedence if both are given.
 *   ?mha=XX000   known MHA code (rates-only lookup for callers that have it).
 *
 * Response (200), all small + stable:
 *   valid CONUS/OCONUS-BAH ZIP → { valid:true, territory:false, mha, locationName, ratesW, ratesWO }
 *   territory (OHA) ZIP        → { valid:true, territory:true,  mha:null, locationName:null, ratesW:null, ratesWO:null }
 *   ZIP/MHA not in dataset     → { valid:false }
 *   malformed / no params      → 400 { error }
 */

import {
  getMHACode,
  getMHARates,
  getLocationName,
  isZipInDataset,
  isTerritory,
} from '@/lib/calculations/bah';
import { getStationPagesForZip, MHA_TO_STATION_PAGES } from '@/data/bah/2026/mhaToStationPage';
import { isValidZip } from '@/lib/utils';

// BAH data is fixed for the calendar year → safe to cache hard at the edge.
const IMMUTABLE_CACHE = 'public, max-age=86400, s-maxage=31536000, immutable';
// Don't persist transient client errors.
const NO_STORE = 'no-store';

function json(body: unknown, status = 200, cache = IMMUTABLE_CACHE): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cache,
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');
  const mhaParam = searchParams.get('mha');

  // ── ZIP path (primary; takes precedence when provided) ──────────────────────
  if (zip !== null) {
    if (!isValidZip(zip)) {
      return json({ error: 'Invalid zip — must be exactly 5 digits' }, 400, NO_STORE);
    }
    if (isTerritory(zip)) {
      // U.S. territory (OHA area) — recognized but no BAH. Mirrors bah.ts, where
      // getMHACode/getLocationName both return null for territories.
      return json({
        valid: true,
        territory: true,
        mha: null,
        locationName: null,
        ratesW: null,
        ratesWO: null,
      });
    }
    if (!isZipInDataset(zip)) {
      return json({ valid: false });
    }
    const mha = getMHACode(zip) as string; // non-null after isZipInDataset
    return json({
      valid: true,
      territory: false,
      mha,
      locationName: getLocationName(zip),
      ratesW: getMHARates(mha, true),
      ratesWO: getMHARates(mha, false),
      // Resolved server-side so calculator clients don't import zipToMha for guide links.
      stationPages: getStationPagesForZip(zip),
    });
  }

  // ── MHA-only path (rates lookup for callers that already resolved the MHA) ───
  if (mhaParam) {
    const ratesW = getMHARates(mhaParam, true);
    const ratesWO = getMHARates(mhaParam, false);
    if (!ratesW || !ratesWO) {
      return json({ valid: false });
    }
    return json({
      valid: true,
      territory: false,
      mha: mhaParam,
      locationName: null, // getLocationName resolves by ZIP, not MHA
      ratesW,
      ratesWO,
      stationPages: MHA_TO_STATION_PAGES[mhaParam] ?? [],
    });
  }

  return json({ error: 'Provide a `zip` or `mha` query param' }, 400, NO_STORE);
}
