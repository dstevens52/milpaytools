import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DUTY_STATIONS, STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getLocationName } from '@/lib/calculations/bah';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema } from '@/lib/schema';
import { STATE_TAX_DATA } from '@/data/compare/stateTax';
import { COLA_AREAS } from '@/data/cola/2026/constants';
import {
  RANK_DISPLAY,
  ENLISTED_GRADES,
  WARRANT_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
} from '@/types/military';

export function generateStaticParams() {
  return DUTY_STATIONS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const station = STATION_BY_SLUG[params.slug];
  if (!station) return {};
  const title = `${station.name} BAH Rates 2026 | ${station.city}, ${station.state}`;
  const description = `2026 Basic Allowance for Housing rates for ${station.name} in ${station.city}, ${station.stateName}. Monthly BAH for every pay grade — with and without dependents — plus local housing market insights.`;
  return {
    title,
    description,
    alternates: { canonical: `/bah/${station.slug}` },
  };
}

const NATIONAL_AVG_E5_W = 1987;

const GRADE_ORDER = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  ...PRIOR_ENLISTED_OFFICER_GRADES,
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7',
] as const;

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function StationPage({ params }: { params: { slug: string } }) {
  const station = STATION_BY_SLUG[params.slug];
  if (!station) notFound();

  const mhaCode = station.oconus ? null : getMHACode(station.zip);
  const ratesW = mhaCode ? getMHARates(mhaCode, true) : null;
  const ratesWO = mhaCode ? getMHARates(mhaCode, false) : null;
  const locationName = mhaCode ? getLocationName(station.zip) : null;

  const taxInfo = STATE_TAX_DATA[station.state];
  const colaArea = station.oconus
    ? null
    : COLA_AREAS.find((a) => a.zipPrefixes.includes(station.zip.slice(0, 3))) ?? null;

  const e5WithDep = ratesW?.['E-5'] ?? 0;
  const e5Diff = e5WithDep - NATIONAL_AVG_E5_W;

  const nearbyStations = DUTY_STATIONS.filter((s) => station.nearby.includes(s.slug));

  const pageUrl = `/bah/${station.slug}`;
  const schema = articleSchema({
    title: `${station.name} BAH Rates 2026`,
    description: `2026 BAH rates for ${station.name} — full pay grade table with and without dependents.`,
    datePublished: '2026-04-27',
    url: pageUrl,
  });

  return (
    <>
      <JsonLdScript schema={schema} />

      <div className="bg-zinc-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-zinc-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
            <nav className="text-xs text-zinc-400 mb-4 flex items-center gap-1.5">
              <Link href="/bah" className="hover:text-zinc-600 transition-colors">BAH by Station</Link>
              <span>›</span>
              <span className="text-zinc-600">{station.name}</span>
            </nav>

            <div className="inline-flex items-center gap-2 mb-4">
              <span className="block w-6 h-0.5 bg-red-700" />
              <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
                2026 BAH Rates
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-2">
              {station.name}
            </h1>
            {station.formerName && (
              <p className="text-sm text-zinc-500 mb-3">Formerly {station.formerName}</p>
            )}
            <p className="text-lg text-zinc-600 mb-5">
              {station.city}, {station.stateName} &middot;{' '}
              {station.branches.join(' / ')}
            </p>
            <p className="text-sm text-zinc-600 max-w-2xl">{station.description}</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Quick Facts */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Quick Facts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-zinc-800">{station.city}, {station.state}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">Branch</p>
                <p className="text-sm font-medium text-zinc-800">{station.branches.join(', ')}</p>
              </div>
              {locationName && (
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">MHA</p>
                  <p className="text-sm font-medium text-zinc-800">{locationName}</p>
                </div>
              )}
              {e5WithDep > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">E-5 w/dep BAH</p>
                  <p className="text-sm font-bold text-zinc-900">{fmt(e5WithDep)}/mo</p>
                </div>
              )}
              {taxInfo && (
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">State Tax</p>
                  <p className="text-sm font-medium text-zinc-800">
                    {taxInfo.noTax ? 'No state income tax' : `${(taxInfo.rate * 100).toFixed(1)}% (${taxInfo.name})`}
                  </p>
                </div>
              )}
              {colaArea && (
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">CONUS COLA</p>
                  <p className="text-sm font-medium text-green-700">Eligible ({colaArea.tier})</p>
                </div>
              )}
            </div>
          </div>

          {/* OCONUS notice */}
          {station.oconus && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <p className="font-semibold text-amber-800 mb-2">OCONUS Assignment — OHA, Not BAH</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Members assigned to {station.name} receive <strong>Overseas Housing Allowance (OHA)</strong> instead of BAH.
                OHA is calculated differently — it is based on your actual rental cost (up to a local ceiling), plus a
                utility/recurring maintenance allowance (MIHA). BAH rates do not apply.
              </p>
              <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                Contact your gaining unit's housing office for current OHA ceilings and the DTMO OHA calculator at{' '}
                <a href="https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/" target="_blank" rel="noopener noreferrer" className="underline">travel.dod.mil</a>.
              </p>
              <p className="text-sm text-amber-700 mt-3 leading-relaxed italic">{station.rentalNote}</p>
            </div>
          )}

          {/* BAH Rate Table */}
          {!station.oconus && ratesW && ratesWO && (
            <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100">
                <h2 className="text-lg font-semibold text-zinc-900">
                  2026 BAH Rates — {locationName ?? station.city}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Monthly rates. Source: DTMO 2026 BAH data. BAH is not taxable income.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="text-left px-4 py-3 font-semibold text-zinc-700 w-48">Pay Grade</th>
                      <th className="text-right px-4 py-3 font-semibold text-zinc-700">With Dependents</th>
                      <th className="text-right px-4 py-3 font-semibold text-zinc-700">Without Dependents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {/* Enlisted header row */}
                    <tr className="bg-zinc-50">
                      <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Enlisted
                      </td>
                    </tr>
                    {ENLISTED_GRADES.map((grade) => {
                      const w = ratesW[grade];
                      const wo = ratesWO[grade];
                      if (w === undefined && wo === undefined) return null;
                      return (
                        <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                            {w !== undefined ? fmt(w) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                            {wo !== undefined ? fmt(wo) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Warrant Officer header row */}
                    <tr className="bg-zinc-50">
                      <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Warrant Officer
                      </td>
                    </tr>
                    {WARRANT_GRADES.map((grade) => {
                      const w = ratesW[grade];
                      const wo = ratesWO[grade];
                      if (w === undefined && wo === undefined) return null;
                      return (
                        <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                            {w !== undefined ? fmt(w) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                            {wo !== undefined ? fmt(wo) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Prior-enlisted Officers */}
                    <tr className="bg-zinc-50">
                      <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Officer (Prior Enlisted)
                      </td>
                    </tr>
                    {PRIOR_ENLISTED_OFFICER_GRADES.map((grade) => {
                      const w = ratesW[grade];
                      const wo = ratesWO[grade];
                      if (w === undefined && wo === undefined) return null;
                      return (
                        <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                            {w !== undefined ? fmt(w) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                            {wo !== undefined ? fmt(wo) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Officers */}
                    <tr className="bg-zinc-50">
                      <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Officer
                      </td>
                    </tr>
                    {(['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'] as const).map((grade) => {
                      const w = ratesW[grade];
                      const wo = ratesWO[grade];
                      if (w === undefined && wo === undefined) return null;
                      return (
                        <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                            {w !== undefined ? fmt(w) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                            {wo !== undefined ? fmt(wo) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50">
                <p className="text-xs text-zinc-400">
                  O-8, O-9, and O-10 receive the same BAH as O-7. Rates effective January 1, 2026.
                </p>
              </div>
            </div>
          )}

          {/* No data fallback */}
          {!station.oconus && (!ratesW || !ratesWO) && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <p className="text-zinc-600 text-sm">
                BAH rate data for this ZIP code could not be loaded. Use the{' '}
                <Link href="/calculators/bah" className="text-red-700 hover:text-red-800 underline">
                  BAH calculator
                </Link>{' '}
                and enter the ZIP code manually for exact rates.
              </p>
            </div>
          )}

          {/* Comparison */}
          {e5WithDep > 0 && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">How This Market Compares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">E-5 w/dep BAH here</p>
                  <p className="text-2xl font-bold text-zinc-900">{fmt(e5WithDep)}<span className="text-sm font-normal text-zinc-500">/mo</span></p>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">National avg E-5 w/dep</p>
                  <p className="text-2xl font-bold text-zinc-500">{fmt(NATIONAL_AVG_E5_W)}<span className="text-sm font-normal text-zinc-500">/mo</span></p>
                </div>
                <div className={`rounded-lg border p-4 ${e5Diff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">vs. National avg</p>
                  <p className={`text-2xl font-bold ${e5Diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {e5Diff >= 0 ? '+' : ''}{fmt(e5Diff)}<span className="text-sm font-normal">/mo</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">{station.rentalNote}</p>
            </div>
          )}

          {/* Key Insights */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Key Insights for {station.name}</h2>
            <ul className="space-y-3">
              {e5WithDep > 0 && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    An E-5 with dependents receives <strong>{fmt(e5WithDep)}/month</strong> BAH — or <strong>{fmt(e5WithDep * 12)}/year</strong> — to cover housing costs in the {locationName ?? station.city} area.
                  </p>
                </li>
              )}
              {taxInfo?.noTax && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-700 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    <strong>{station.stateName} has no state income tax</strong> on military pay, meaning your BAH, base pay, and special pays go further here than in high-tax states.
                  </p>
                </li>
              )}
              {taxInfo && !taxInfo.noTax && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    {station.stateName} taxes military base pay at approximately <strong>{(taxInfo.rate * 100).toFixed(1)}%</strong>. BAH and BAS remain tax-free at the federal and state level.
                  </p>
                </li>
              )}
              {colaArea && (
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-700 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">
                    Members at {station.name} are eligible for <strong>CONUS COLA</strong> — a monthly supplement for high-cost areas ({colaArea.name}, {colaArea.tier} tier). Confirm your exact rate with your finance office.
                  </p>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-700 flex-none mt-1.5" />
                <p className="text-sm text-zinc-600">
                  BAH is designed to cover median rental costs — not average or premium rents. Members living in above-median housing pay the difference out of pocket; those in below-median housing keep the surplus.
                </p>
              </li>
            </ul>
          </div>

          {/* Calculator CTAs */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-1">Calculate Your Full Military Pay</h2>
            <p className="text-zinc-400 text-sm mb-4">
              BAH is one component. See your total compensation including base pay, BAS, and tax savings.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/calculators/bah${station.oconus ? '' : `?zip=${station.zip}`}`}
                className="inline-flex items-center px-4 py-2 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
              >
                BAH Calculator →
              </Link>
              <Link
                href="/calculators/total-compensation"
                className="inline-flex items-center px-4 py-2 rounded-md bg-zinc-700 text-white text-sm font-semibold hover:bg-zinc-600 transition-colors"
              >
                Total Compensation
              </Link>
              <Link
                href="/calculators/pcs"
                className="inline-flex items-center px-4 py-2 rounded-md bg-zinc-700 text-white text-sm font-semibold hover:bg-zinc-600 transition-colors"
              >
                PCS Cost Calculator
              </Link>
            </div>
          </div>

          {/* Nearby Stations */}
          {nearbyStations.length > 0 && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Nearby &amp; Comparable Installations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nearbyStations.map((s) => {
                  const nearbyMha = s.oconus ? null : getMHACode(s.zip);
                  const nearbyRates = nearbyMha ? getMHARates(nearbyMha, true) : null;
                  const nearbyE5 = nearbyRates?.['E-5'];
                  return (
                    <Link
                      key={s.slug}
                      href={`/bah/${s.slug}`}
                      className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
                    >
                      <p className="font-semibold text-zinc-900 text-sm mb-1">{s.name}</p>
                      <p className="text-xs text-zinc-500 mb-2">{s.city}, {s.state}</p>
                      {nearbyE5 && (
                        <p className="text-sm font-semibold text-red-700">{fmt(nearbyE5)}/mo <span className="text-xs font-normal text-zinc-400">E-5 w/dep</span></p>
                      )}
                      {s.oconus && (
                        <p className="text-xs text-amber-600">OCONUS — OHA applies</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source note */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-600 mb-1">Data Source & Disclaimer</p>
            <p>
              BAH rates are from the Defense Travel Management Office (DTMO) 2026 BAH data, effective January 1, 2026.
              Rates are set by Military Housing Area (MHA), not individual ZIP code — all ZIPs in the same MHA receive
              identical rates. This page is for informational purposes only and is not affiliated with DoD, DTMO, or
              any government agency. Verify your entitlement at{' '}
              <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/" target="_blank" rel="noopener noreferrer" className="underline">travel.dod.mil</a>.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
