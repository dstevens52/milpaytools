import type { Metadata } from 'next';
import Link from 'next/link';
import { PAY_PAGE_RANKS } from '@/data/pay-pages/ranks';
import { payTable } from '@/data/pay-tables/2026';
import type { YearsOfService } from '@/types/military';
import { formatCurrency } from '@/lib/utils';
import { JsonLdScript } from '@/components/JsonLdScript';
import { breadcrumbListSchema } from '@/lib/schema';
import { ogImage } from '@/lib/og';

const PAY_INDEX_TITLE = '2026 Military Pay by Rank';
const PAY_INDEX_DESC =
  'What each rank actually earns in 2026 — basic pay by years of service, plus BAH, BAS, and total compensation. Official DFAS and DTMO data, no account.';
const PAY_INDEX_OG = ogImage({
  type: 'calculator',
  title: PAY_INDEX_TITLE,
  sub: 'Basic pay by years of service, plus BAH, BAS & total compensation',
});

export const metadata: Metadata = {
  title: { absolute: PAY_INDEX_TITLE },
  description: PAY_INDEX_DESC,
  alternates: { canonical: '/pay' },
  openGraph: {
    title: PAY_INDEX_TITLE,
    description: PAY_INDEX_DESC,
    type: 'website',
    url: '/pay',
    siteName: 'MilPayTools',
    images: PAY_INDEX_OG,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAY_INDEX_TITLE,
    description: PAY_INDEX_DESC,
    images: PAY_INDEX_OG,
  },
};

export default function PayIndexPage() {
  // Per-rank basic pay range, read from the same table the rank pages use.
  const ranks = PAY_PAGE_RANKS.map((r) => {
    const entry = payTable[r.grade];
    const keys = Object.keys(entry)
      .map(Number)
      .sort((a, b) => a - b);
    return {
      ...r,
      minPay: entry[keys[0] as YearsOfService]!,
      maxPay: entry[keys[keys.length - 1] as YearsOfService]!,
    };
  });

  return (
    <>
      <JsonLdScript
        schema={breadcrumbListSchema([
          { name: 'Home', url: '/' },
          { name: 'Pay by Rank', url: '/pay' },
        ])}
      />

      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="block w-6 h-0.5 bg-red-700" />
            <span className="text-sm font-semibold text-red-700 uppercase tracking-widest">
              Official 2026 DFAS Data
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-3">
            Military Pay by Rank
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mb-2">
            What each rank actually earns in 2026 — the full basic pay progression by years of
            service, plus the housing and food allowances a base-pay chart leaves out.
          </p>
          <p className="text-sm text-zinc-500">
            Pick your grade below, or use the interactive pay charts to look up any grade and year
            of service.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Rank grid — renders from PAY_PAGE_RANKS, grows as ranks roll out */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranks.map((r) => (
            <Link
              key={r.slug}
              href={`/pay/${r.slug}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <p className="text-lg font-bold text-zinc-900 mb-0.5">{r.title}</p>
              <p className="text-xs text-zinc-500 mb-3">
                {`${r.branchTitles.army} (Army) · ${r.branchTitles.airForce} (Air Force) · ${r.branchTitles.navy} (Navy)`}
              </p>
              <p className="text-sm text-zinc-600">
                {`Basic pay ${formatCurrency(r.minPay)}–${formatCurrency(r.maxPay)}/month`}
              </p>
              <p className="text-sm font-medium text-red-700 mt-2">
                {`See ${r.title} pay & total compensation →`}
              </p>
            </Link>
          ))}
        </div>

        {/* Pay charts CTA */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-sm font-semibold text-zinc-800 mb-1.5">
            Need a grade that isn&apos;t listed yet?
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed mb-3">
            The interactive 2026 pay charts cover every grade — E-1 through O-10, warrant
            officers, and prior-enlisted officers — for every year of service.
          </p>
          <Link
            href="/calculators/pay-charts"
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
          >
            Open the 2026 pay charts →
          </Link>
        </div>
      </div>
    </>
  );
}
