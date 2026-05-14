import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DUTY_STATIONS, STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates, getLocationName } from '@/lib/calculations/bah';
import { JsonLdScript } from '@/components/JsonLdScript';
import { articleSchema } from '@/lib/schema';
import { STATE_TAX_DATA } from '@/data/compare/stateTax';
import { COLA_AREAS } from '@/data/cola/2026/constants';
import { CollapsibleRateTable } from '@/components/calculators/bah/CollapsibleRateTable';

export async function generateStaticParams() {
  return DUTY_STATIONS.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const station = STATION_BY_SLUG[slug];
  if (!station) return {};
  const title = `${station.name} BAH Rates 2026 | ${station.city}, ${station.state}`;
  const description = `2026 Basic Allowance for Housing rates for ${station.name} in ${station.city}, ${station.stateName}. Monthly BAH for every pay grade — with and without dependents — plus local housing market insights.`;
  const ogImageTitle = `${station.name} BAH Rates 2026`;
  const ogImage = `/api/og?type=station&title=${encodeURIComponent(ogImageTitle)}&v=2`;
  return {
    title,
    description,
    alternates: { canonical: `/bah/${station.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/bah/${station.slug}`,
      siteName: 'MilPayTools',
      images: [{ url: ogImage, width: 2400, height: 1260 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

const NATIONAL_AVG_E5_W = 1987;

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default async function StationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const station = STATION_BY_SLUG[slug];
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
                Contact your gaining unit&apos;s housing office for current OHA ceilings and the DTMO OHA calculator at{' '}
                <a href="https://www.travel.dod.mil/Allowances/Overseas-Housing-Allowance/" target="_blank" rel="noopener noreferrer" className="underline">travel.dod.mil</a>.
              </p>
              <p className="text-sm text-amber-700 mt-3 leading-relaxed italic">{station.rentalNote}</p>
            </div>
          )}

          {/* BAH vs. Local Housing Costs — shown early when data exists, acts as the hook */}
          {!station.oconus && station.bahVsHousing && e5WithDep > 0 && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">BAH vs. Local Housing Costs</h2>
              <p className="text-sm text-zinc-500 mb-5">
                Your BAH isn&apos;t just a rent check — here&apos;s how it stacks up against what housing actually costs in this market.
              </p>

              {/* Rent row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Median rent</p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(station.bahVsHousing.medianRent)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{station.bahVsHousing.medianRentSource}</p>
                </div>
                <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">E-5 w/dep BAH</p>
                  <p className="text-2xl font-bold text-red-700 tabular-nums">
                    {fmt(e5WithDep)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Tax-free</p>
                </div>
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Monthly surplus vs. median rent</p>
                  <p className="text-2xl font-bold text-green-700 tabular-nums">
                    +{fmt(e5WithDep - station.bahVsHousing.medianRent)}
                    <span className="text-sm font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">If renting at median</p>
                </div>
              </div>

              {/* Buying row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Median home price</p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(station.bahVsHousing.medianHomePrice)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{station.bahVsHousing.medianHomePriceSource}</p>
                </div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Est. monthly mortgage (PITI)</p>
                  <p className="text-2xl font-bold text-zinc-900 tabular-nums">
                    {fmt(station.bahVsHousing.mortgageMin)}–{fmt(station.bahVsHousing.mortgageMax)}
                    <span className="text-sm font-normal text-zinc-500">/mo</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{station.bahVsHousing.mortgageAssumptions}</p>
                </div>
              </div>

              <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 mb-4">
                <p className="text-sm text-zinc-700 leading-relaxed">
                  At {fmt(e5WithDep)}/month BAH and an estimated {fmt(station.bahVsHousing.mortgageMin)}–{fmt(station.bahVsHousing.mortgageMax)}/month on a median-priced home,
                  BAH likely covers or nearly covers a typical mortgage in this market.
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Housing cost estimates are approximate and based on publicly available market data. Actual costs vary by neighborhood, property type, and individual circumstances.
                This is not financial advice — use these numbers as a starting point for your own research.
              </p>
            </div>
          )}

          {/* How This Market Compares — moved up, flows after local housing context */}
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

          {/* BAH Rate Table — collapsible, moved down so context comes first */}
          {!station.oconus && ratesW && ratesWO && (
            <CollapsibleRateTable
              locationName={locationName ?? station.city}
              ratesW={ratesW}
              ratesWO={ratesWO}
            />
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

          {/* Local Housing Tips */}
          {station.localHousingTips && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-5">Local Housing Tips</h2>

              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-3">Best neighborhoods for military families</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {station.localHousingTips.neighborhoods.map((n) => (
                  <div key={n.name} className="rounded-lg border border-zinc-200 p-4">
                    <p className="font-semibold text-zinc-900 text-sm mb-1">{n.name}</p>
                    <p className="text-sm text-zinc-600 mb-2">{n.highlight}</p>
                    <p className="text-xs text-zinc-500">Commute: {n.commute}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Best for: {n.bestFor}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-3">Local cost of living context</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">Overall cost of living is roughly {station.localHousingTips.coliNote}.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">Groceries run about {station.localHousingTips.groceryNote}.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600">{station.localHousingTips.stateTaxNote}</p>
                </li>
              </ul>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">The mistake to avoid</p>
                <p className="text-sm text-amber-700 leading-relaxed">{station.localHousingTips.mistakeToAvoid}</p>
              </div>
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
                    An E-5 with dependents receives <strong>{fmt(e5WithDep)}/month</strong> — that&apos;s <strong>{fmt(e5WithDep * 12)}/year</strong> in tax-free housing money to cover costs in the {locationName ?? station.city} market.
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
            <h2 className="text-white font-semibold mb-1">What to do next</h2>
            <p className="text-zinc-400 text-sm mb-5">
              BAH is the starting point. Here are the calculations that matter most for your PCS decision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/calculators/compare"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                <span>Compare {station.name} to another duty station</span>
                <span className="ml-3 text-zinc-400 flex-none">→</span>
              </Link>
              <Link
                href="/calculators/total-compensation"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                <span>See your total military compensation at {station.name}</span>
                <span className="ml-3 text-zinc-400 flex-none">→</span>
              </Link>
              <Link
                href="/calculators/pcs"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                <span>Estimate your PCS move costs</span>
                <span className="ml-3 text-zinc-400 flex-none">→</span>
              </Link>
              <Link
                href="/blog/how-bah-builds-wealth"
                className="flex items-center justify-between px-4 py-3 rounded-md bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors"
              >
                <span>How BAH can build long-term wealth</span>
                <span className="ml-3 flex-none">→</span>
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
