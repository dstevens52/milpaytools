'use client';

import { useState, useMemo } from 'react';
import { lookupCola } from '@/lib/calculations/cola';
import type { PayGrade } from '@/types/military';

const PAY_GRADES: { group: string; grades: PayGrade[] }[] = [
  {
    group: 'Enlisted',
    grades: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'],
  },
  {
    group: 'Warrant Officer',
    grades: ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'],
  },
  {
    group: 'Officer',
    grades: ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'],
  },
];

function formatDollar(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const TIER_BADGE_STYLES: Record<string, string> = {
  'high': 'bg-red-50 text-red-700 border-red-200',
  'moderate-high': 'bg-amber-50 text-amber-700 border-amber-200',
  'moderate': 'bg-blue-50 text-blue-700 border-blue-200',
};

export function ColaCalculator() {
  const [zip, setZip] = useState('');
  const [payGrade, setPayGrade] = useState<PayGrade>('E-5');
  const [hasDependents, setHasDependents] = useState(false);

  const zipDigits = zip.replace(/\D/g, '');
  const isValidZip = zipDigits.length === 5;

  const result = useMemo(() => {
    if (!isValidZip) return null;
    return lookupCola({ zipCode: zipDigits, payGrade, hasDependents });
  }, [zipDigits, payGrade, hasDependents, isValidZip]);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm">
      {/* Input panel */}
      <div className="p-6 border-b border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-900 mb-5">CONUS COLA Lookup</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* ZIP Code */}
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Duty station ZIP code
            </label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="e.g. 92101"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Pay Grade */}
          <div>
            <label htmlFor="pay-grade" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Pay grade
            </label>
            <select
              id="pay-grade"
              value={payGrade}
              onChange={(e) => setPayGrade(e.target.value as PayGrade)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              {PAY_GRADES.map(({ group, grades }) => (
                <optgroup key={group} label={group}>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Dependency Status */}
          <div>
            <span className="block text-sm font-medium text-zinc-700 mb-1.5">
              Dependency status
            </span>
            <div className="flex rounded-md border border-zinc-300 overflow-hidden h-[38px]">
              <button
                onClick={() => setHasDependents(false)}
                className={[
                  'flex-1 text-sm font-medium transition-colors',
                  !hasDependents
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                Without
              </button>
              <button
                onClick={() => setHasDependents(true)}
                className={[
                  'flex-1 text-sm font-medium border-l border-zinc-300 transition-colors',
                  hasDependents
                    ? 'bg-red-700 text-white'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50',
                ].join(' ')}
              >
                With deps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="p-6">
        {/* 2026 eligibility change notice — always visible */}
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">2026 update: </span>
          CONUS COLA eligibility changed significantly for FY2026. Several areas lost eligibility,
          including Greater Boston and multiple California locations. Seattle/Puget Sound gained
          eligibility. NYC rates were reduced from 8% to 4%.{' '}
          <span className="font-semibold">
            Always verify your specific ZIP code rate at DTMO before relying on this tool.
          </span>
        </div>

        {!isValidZip && (
          <div className="text-sm text-zinc-500 text-center py-6">
            Enter a 5-digit duty station ZIP code to check CONUS COLA eligibility.
          </div>
        )}

        {isValidZip && result && !result.isColaArea && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-none">📍</span>
              <div>
                <p className="font-semibold text-zinc-900 mb-1">
                  ZIP {zipDigits} is not a CONUS COLA area
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                  Most duty stations do not qualify for CONUS COLA — it applies only to a small number
                  of high-cost locations. CONUS COLA is paid in addition to BAH, which all members
                  receive based on their duty station.
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                  CONUS COLA eligibility changes annually. Several areas that previously qualified
                  (including Greater Boston, MA) lost eligibility in 2026. If your previous station
                  received CONUS COLA, verify whether your current station still qualifies.
                </p>
                <p className="text-sm text-zinc-500">
                  If you believe your duty station qualifies, verify at{' '}
                  <a
                    href="https://www.travel.dod.mil/Pay-Entitlements/CONUS-COLA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline hover:text-blue-800"
                  >
                    DTMO CONUS COLA
                  </a>{' '}
                  — the official source.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-200">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                Related calculator
              </p>
              <a
                href="/calculators/bah"
                className="text-sm text-blue-700 hover:text-blue-800 underline"
              >
                Look up your BAH rate for this ZIP code →
              </a>
            </div>
          </div>
        )}

        {isValidZip && result?.isColaArea && result.area && (
          <div className="space-y-5">
            {/* Area banner */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">📍</span>
                    <h3 className="font-bold text-zinc-900 text-lg">{result.area.name}</h3>
                    <span className="text-sm text-zinc-500">{result.area.state}</span>
                  </div>
                  {result.area.notes && (
                    <p className="text-sm text-zinc-500 ml-7">{result.area.notes}</p>
                  )}
                </div>
                <span
                  className={[
                    'inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap',
                    TIER_BADGE_STYLES[result.area.tier] ?? 'bg-zinc-50 text-zinc-700 border-zinc-200',
                  ].join(' ')}
                >
                  {result.tierLabel}
                </span>
              </div>

              {/* Rate estimates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-md bg-red-50 border border-red-100 p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 tabular-nums">
                    {formatDollar(result.approxMonthly!)}
                  </p>
                  <p className="text-xs font-semibold text-red-600 mt-1 uppercase tracking-wide">
                    Est. per month
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {payGrade} · {hasDependents ? 'with dependents' : 'without dependents'}
                  </p>
                </div>
                <div className="rounded-md bg-zinc-50 border border-zinc-200 p-4 text-center">
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {formatDollar(result.approxAnnual!)}
                  </p>
                  <p className="text-xs font-semibold text-zinc-600 mt-1 uppercase tracking-wide">
                    Est. per year
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Monthly × 12</p>
                </div>
                <div className="rounded-md bg-amber-50 border border-amber-100 p-4 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold text-amber-800">Taxable income</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Unlike BAH/BAS, CONUS COLA is subject to federal and state income tax.
                  </p>
                </div>
              </div>
            </div>

            {/* Verify at DTMO callout */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-none">⚠️</span>
                <div>
                  <p className="font-semibold text-blue-900 text-sm mb-1">
                    These are estimates — verify your exact rate at DTMO
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed mb-3">
                    DTMO publishes the official CONUS COLA rates for every eligible grade and
                    dependency combination. Rates change annually and the amounts above are approximate
                    figures based on area cost tier. Your finance office uses the official DTMO table
                    to calculate your actual entitlement.
                  </p>
                  <a
                    href="https://www.travel.dod.mil/Pay-Entitlements/CONUS-COLA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                  >
                    Look up your exact rate at DTMO →
                  </a>
                </div>
              </div>
            </div>

            {/* Grade group note */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                Grade group used for this estimate
              </p>
              <p className="text-sm text-zinc-600">
                {payGrade} falls in the{' '}
                <span className="font-semibold text-zinc-800">{result.gradeGroup}</span> group.
                DTMO publishes exact rates by individual grade — use the DTMO link above for your
                precise amount.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
