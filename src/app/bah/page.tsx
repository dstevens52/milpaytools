import type { Metadata } from 'next';
import { DUTY_STATIONS } from '@/data/duty-stations/stations';
import { getMHACode, getMHARates } from '@/lib/calculations/bah';
import { StationSearch } from '@/components/bah-stations/StationSearch';

export const metadata: Metadata = {
  title: '2026 BAH Rates by Military Installation | MilPayTools',
  description:
    'Find 2026 Basic Allowance for Housing rates for 70+ U.S. military installations. Full pay grade tables with and without dependents for every major Army, Air Force, Navy, and Marine Corps base.',
  alternates: { canonical: '/bah' },
};

export default function BahStationsIndexPage() {
  const stationsWithRates = DUTY_STATIONS.map((s) => {
    if (s.oconus) return { ...s, e5Rate: null };
    const mhaCode = getMHACode(s.zip);
    const rates = mhaCode ? getMHARates(mhaCode, true) : null;
    return { ...s, e5Rate: rates?.['E-5'] ?? null };
  });

  const totalConus = DUTY_STATIONS.filter((s) => !s.oconus).length;

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Official 2026 DTMO Data
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            BAH Rates by Military Installation
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mb-2">
            2026 Basic Allowance for Housing rates for {totalConus} major U.S. military installations — every pay grade, with and without dependents, plus local housing market context.
          </p>
          <p className="text-sm text-zinc-500">
            Select an installation below, or search by name, city, state, or branch.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <StationSearch stations={stationsWithRates} />
      </div>

      {/* What is BAH explainer */}
      <div className="bg-white border-t border-zinc-200 mt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <h2 className="text-xl font-bold text-zinc-900">How BAH Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-zinc-600 leading-relaxed">
            <div>
              <h3 className="font-semibold text-zinc-800 mb-2">Rate Determination</h3>
              <p>
                BAH is set by Military Housing Area (MHA) — not by installation address. An MHA typically covers a metropolitan area or county cluster. Every ZIP code maps to one MHA, and everyone in the same MHA receives identical rates regardless of which specific base or ZIP they live in.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 mb-2">Median-Cost Design</h3>
              <p>
                DoD sets BAH to cover the median rental cost for each grade in each MHA — not the average, not the lowest. Members in below-median housing keep the difference; members in above-median housing pay the gap out of pocket. The goal is for 80% of members to find housing within their BAH.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 mb-2">Annual Updates</h3>
              <p>
                BAH rates are updated each January 1st based on the previous year&apos;s rental survey data. Rates can increase, decrease, or stay flat. Members whose rates decrease are protected by rate protection rules — they cannot fall below the prior year&apos;s rate while in continuous service in the same MHA.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800 mb-2">Tax-Free Income</h3>
              <p>
                BAH is not subject to federal or state income taxes. This makes each dollar of BAH worth more than an equivalent dollar of taxable civilian compensation. A servicemember receiving $2,000/month in BAH avoids roughly $400–$600 in taxes compared to a civilian earning the same amount as wages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
