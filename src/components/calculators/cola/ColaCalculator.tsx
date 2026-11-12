'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { colaForMha, type ColaLookupResult } from '@/lib/calculations/colaMha';
import { COLA_AREAS, COLA_SOURCE } from '@/data/cola/2026/constants';
import { fireCalculatorEvent } from '@/lib/analytics';
import { BaseSearchInput } from '@/components/calculators/shared/BaseSearchInput';
import { COLA_OVERSEAS_LINE } from '@/data/oconus/stationSearchCopy';
import { useBahLookup } from '@/components/calculators/shared/useBahLookup';
import { parseZip } from '@/lib/urlParams';
import { SaveOrShareResults } from '@/components/calculators/shared/SaveOrShareResults';
import { COLA_AREA_TABLE_ID } from './ColaAreaTable';

export function ColaCalculator() {
  const [zip, setZip] = useState('');
  const [overseasInput, setOverseasInput] = useState(false);

  const isValidZip = /^\d{5}$/.test(zip);

  // ZIP → MHA resolved server-side (no client zipToMha), then matched against
  // the 18-entry 2026 list client-side.
  const { data: bahData, loading } = useBahLookup(zip);

  const result = useMemo((): ColaLookupResult | null => {
    if (!isValidZip || !bahData) return null;
    if (!bahData.valid || bahData.territory || !bahData.mha) {
      return { status: 'not-found', eligible: false };
    }
    return colaForMha(bahData.mha, bahData.locationName ?? bahData.mha);
  }, [isValidZip, bahData]);

  const station = bahData?.stationPages?.[0] ?? null;

  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!result) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => fireCalculatorEvent('cola'), 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [result]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const gz = parseZip(p.get('zip'));
    if (gz) setZip(gz);
  }, []);

  function getShareUrl() {
    const p = new URLSearchParams();
    if (zip) p.set('zip', zip);
    return `${window.location.origin}/calculators/cola?${p.toString()}`;
  }

  function showAreaTable(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = document.getElementById(COLA_AREA_TABLE_ID);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${COLA_AREA_TABLE_ID}`);
  }

  const areaListLink = (label: string) => (
    <a
      href={`#${COLA_AREA_TABLE_ID}`}
      onClick={showAreaTable}
      data-testid="cola-area-list-link"
      className="font-medium text-blue-700 underline hover:text-blue-800"
    >
      {label}
    </a>
  );

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm">
      {/* Input panel */}
      <div className="p-6 border-b border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">CONUS COLA Lookup</h2>
        <p className="text-sm text-zinc-600 mb-5" data-testid="cola-overseas-line">
          {COLA_OVERSEAS_LINE.text}{' '}
          <Link href={COLA_OVERSEAS_LINE.href} className="font-medium text-blue-700 underline hover:text-blue-800">
            {COLA_OVERSEAS_LINE.linkLabel}
          </Link>
        </p>

        <div className="max-w-md">
          <BaseSearchInput
            id="zip"
            label="Base or duty station ZIP"
            value={zip}
            onZipChange={setZip}
            overseasVariant="cola"
            onOverseasChange={(m) => setOverseasInput(m !== null)}
            placeholder="Try Camp Pendleton, Fort Hamilton, or 98101"
          />
        </div>
      </div>

      {/* Results panel */}
      <div className="p-6" data-testid="cola-result-area">
        {!isValidZip && (
          <div className="text-sm text-zinc-500 text-center py-6">
            Enter a 5-digit duty station ZIP code to check 2026 CONUS COLA eligibility.
          </div>
        )}

        {isValidZip && !result && loading && (
          <div className="text-sm text-zinc-500 text-center py-6">Checking the 2026 list…</div>
        )}

        {/* Display only: for overseas input the station field's overseas note already
            explains why there's no CONUS COLA result, so these boxes would repeat it. */}
        {isValidZip && result?.status === 'not-found' && !overseasInput && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6" data-testid="cola-result-not-found">
            <p className="text-sm text-zinc-700 leading-relaxed">
              We couldn&apos;t match that ZIP to a military housing area. Check the ZIP or{' '}
              {areaListLink('see the full list below')}.
            </p>
          </div>
        )}

        {isValidZip && result?.status === 'not-eligible' && !overseasInput && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6" data-testid="cola-result-not-eligible">
            <p className="font-semibold text-zinc-900 mb-1">
              {result.mhaName} is not a 2026 CONUS COLA area.
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-3">
              Only {COLA_AREAS.length} military housing areas qualify for 2026.{' '}
              {areaListLink(`See all ${COLA_AREAS.length} areas`)}
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              BAH still applies at every CONUS duty station.{' '}
              <Link href="/bah" className="text-blue-700 underline hover:text-blue-800">
                Look up your BAH for this ZIP →
              </Link>
            </p>
          </div>
        )}

        {isValidZip && result?.status === 'eligible' && (
          <div className="space-y-5">
            <div className="rounded-lg border border-zinc-200 bg-white p-5" data-testid="cola-result-eligible">
              <h3 className="font-bold text-zinc-900 text-lg mb-3">
                {result.dtmoName} is a 2026 CONUS COLA area
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 tabular-nums mb-3" data-testid="cola-result-index">
                Official 2026 COLA index: {result.index}%
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed mb-5">
                CONUS COLA is a taxable allowance for high-cost U.S. duty stations. Your monthly
                amount depends on your pay grade, years of service, and number of dependents.
              </p>
              <a
                href={COLA_SOURCE.rateLookupUrl}
                target="_blank"
                rel="noopener"
                data-testid="cola-dtmo-rate-lookup"
                className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
              >
                Get your exact amount from DTMO&apos;s official rate lookup →
              </a>
            </div>

            <SaveOrShareResults
              pageName="cola"
              headline="Save or share this COLA check"
              supportingText="Useful when comparing duty stations or planning a PCS budget."
              usefulFor={['PCS pay comparison', 'PCS planning', 'Housing budget']}
              getUrl={getShareUrl}
              shareTitle="CONUS COLA eligibility check"
              shareText="Here's a 2026 CONUS COLA eligibility check from MilPayTools."
            />
          </div>
        )}

        {/* Station guide link */}
        {isValidZip && station && (
          <div className="mt-5">
            <Link
              href={`/bah/${station.slug}`}
              className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-zinc-200 bg-white py-3 pl-5 pr-4 text-sm shadow-sm hover:border-zinc-300 hover:shadow transition-all"
            >
              <span className="absolute inset-y-0 left-0 w-[3px] bg-red-600" />
              <span className="text-zinc-800">
                <strong>{station.name}</strong>{' '}housing guide — local rents, neighborhoods &amp; BAH analysis
              </span>
              <span className="flex-none text-red-600">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
