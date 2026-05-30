import { useState, useEffect, useRef } from 'react';

/**
 * Client hook that resolves a ZIP to BAH data via the cached /api/bah/lookup
 * route — so calculators don't ship the ~166KB BAH dataset to the browser.
 *
 * - Fetches only when `zip` is a complete 5-digit ZIP.
 * - Module-level cache makes repeat lookups (and shared lookups across
 *   components, e.g. BaseSearchInput + a calculator) instant.
 * - Race-safe: an AbortController cancels superseded requests and a sequence
 *   token guards against any stale response that still resolves.
 *
 * Values are byte-identical to the former client-side lookupBAH/getMHARates.
 */

export interface StationPageInfo {
  slug: string;
  name: string;
}

export interface BahLookupData {
  valid: boolean;
  territory: boolean;
  mha: string | null;
  locationName: string | null;
  ratesW: Record<string, number> | null;
  ratesWO: Record<string, number> | null;
  stationPages: StationPageInfo[];
}

const NOT_FOUND: BahLookupData = {
  valid: false,
  territory: false,
  mha: null,
  locationName: null,
  ratesW: null,
  ratesWO: null,
  stationPages: [],
};

const cache = new Map<string, BahLookupData>();

function isFiveDigitZip(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

function normalize(json: Partial<BahLookupData> & { valid: boolean }): BahLookupData {
  return {
    valid: json.valid,
    territory: json.territory ?? false,
    mha: json.mha ?? null,
    locationName: json.locationName ?? null,
    ratesW: json.ratesW ?? null,
    ratesWO: json.ratesWO ?? null,
    stationPages: json.stationPages ?? [],
  };
}

export function useBahLookup(zip: string): { data: BahLookupData | null; loading: boolean } {
  const [data, setData] = useState<BahLookupData | null>(() =>
    isFiveDigitZip(zip) ? cache.get(zip) ?? null : null,
  );
  const [loading, setLoading] = useState(false);
  const seqRef = useRef(0);

  useEffect(() => {
    if (!isFiveDigitZip(zip)) {
      setData(null);
      setLoading(false);
      return;
    }

    const cached = cache.get(zip);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    const seq = ++seqRef.current;
    const controller = new AbortController();
    setData(null); // clear stale rate while the new ZIP resolves
    setLoading(true);

    fetch(`/api/bah/lookup?zip=${zip}`, { signal: controller.signal })
      .then((r) => r.json() as Promise<Partial<BahLookupData> & { valid: boolean }>)
      .then((json) => {
        const result = normalize(json);
        cache.set(zip, result);
        if (seq === seqRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        // Network failure — surface as "not found" rather than crashing.
        if (seq === seqRef.current) {
          setData(NOT_FOUND);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [zip]);

  return { data, loading };
}
