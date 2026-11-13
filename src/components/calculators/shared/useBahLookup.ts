import { useState, useEffect, useRef } from 'react';
import { BAH_YEAR } from '@/data/bah/current';

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
 * The request names BAH_YEAR (`&y=`), so a BAH-year flip changes the URL and no
 * cached answer from the previous year can be reused.
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
  /**
   * Prior-year rates, present only while BAH_EFFECTIVE_NOTICE is on (DoD release
   * → Dec 31): the rates still being paid until January 1.
   */
  prior?: { year: string; ratesW: Record<string, number> | null; ratesWO: Record<string, number> | null };
  /** Set when the caller asked for another registered year's rates (`ratesYear`). */
  ratesYear?: string;
}

export interface BahLookupOptions {
  /**
   * Rates for this registered BAH year instead of BAH_YEAR (ZIP → MHA still from
   * the current year). The education calculator passes EDUCATION_BAH_YEAR.
   */
  ratesYear?: string;
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

/**
 * Derive the BAH rate for a grade + dependency status from a resolved lookup.
 * Mirrors the former client-side lookupBAH: O-8/O-9/O-10 map to the O-7 rate.
 * Returns null when the ZIP is invalid, a territory, or the grade is missing.
 */
export function rateFor(
  data: BahLookupData | null,
  grade: string,
  hasDependents: boolean,
): number | null {
  if (!data || !data.valid || data.territory) return null;
  const rates = hasDependents ? data.ratesW : data.ratesWO;
  if (!rates) return null;
  const g = grade === 'O-8' || grade === 'O-9' || grade === 'O-10' ? 'O-7' : grade;
  const r = rates[g];
  return r === undefined ? null : r;
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
    ...(json.prior ? { prior: json.prior } : {}),
    ...(json.ratesYear ? { ratesYear: json.ratesYear } : {}),
  };
}

export function useBahLookup(
  zip: string,
  options: BahLookupOptions = {},
): { data: BahLookupData | null; loading: boolean } {
  const { ratesYear } = options;
  const key = ratesYear ? `${zip}|${ratesYear}` : zip;
  const [data, setData] = useState<BahLookupData | null>(() =>
    isFiveDigitZip(zip) ? cache.get(key) ?? null : null,
  );
  const [loading, setLoading] = useState(false);
  const seqRef = useRef(0);

  useEffect(() => {
    if (!isFiveDigitZip(zip)) {
      setData(null);
      setLoading(false);
      return;
    }

    const cached = cache.get(key);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    const seq = ++seqRef.current;
    const controller = new AbortController();
    setData(null); // clear stale rate while the new ZIP resolves
    setLoading(true);

    const url = `/api/bah/lookup?zip=${zip}&y=${BAH_YEAR}${ratesYear ? `&ratesYear=${ratesYear}` : ''}`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json() as Promise<Partial<BahLookupData> & { valid: boolean }>)
      .then((json) => {
        const result = normalize(json);
        cache.set(key, result);
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
  }, [zip, key, ratesYear]);

  return { data, loading };
}
