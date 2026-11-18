import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { JsonLdScript } from '@/components/JsonLdScript';
import { FaqSection } from '@/components/FaqSection';
import { BahChangesTable } from '@/components/bah-stations/BahChangesTable';
import { breadcrumbListSchema } from '@/lib/schema';
import { ogImage } from '@/lib/og';
import { formatBahDate } from '@/data/bah/midYear';
import { currentBahChanges } from '@/lib/calculations/bahChangesData';
import {
  BAH_CHANGES_PATH,
  DTMO_BAH_LOOKUP_URL,
  bahChangesDatasetSchema,
  bahChangesDescription,
  bahChangesFaqs,
  bahChangesH1,
  bahChangesProtectionText,
  bahChangesScopeLine,
  bahChangesTitle,
  bahChangesCcgNote,
  bahChangesUnrankedNote,
  DTMO_CCG_FAQ,
  formatChangeDollars,
  formatChangePct,
  formatRate,
  toTableRows,
  type BahChangeRow,
} from '@/lib/calculations/bahChanges';

// Static route; /bah/[slug] has dynamicParams = false and no station slug is
// "changes" (tests/e2e/bah-changes-unit.spec.ts). Every figure comes from the
// BAH registry through currentBahChanges(): BAH_YEAR vs BAH_PRIOR_YEAR.

const C = currentBahChanges();
const TITLE = bahChangesTitle(C.year);
const H1 = bahChangesH1(C.year);
const DESC = bahChangesDescription(C);
const OG = ogImage({ type: 'guide', title: `${C.year} BAH Changes`, sub: `Every military housing area, ${C.priorYear} → ${C.year}` });

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: BAH_CHANGES_PATH },
  openGraph: {
    title: `${TITLE} | MilPayTools`,
    description: DESC,
    type: 'website',
    url: BAH_CHANGES_PATH,
    siteName: 'MilPayTools',
    images: OG,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | MilPayTools`,
    description: DESC,
    images: OG,
  },
};

/** Area name with a line-break opportunity after each "/" (e.g. "Shreveport/Barksdale AFB"). */
function breakable(name: string) {
  return name.split('/').map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <>/<wbr /></>}
      {part}
    </Fragment>
  ));
}

function AreaName({ row }: { row: BahChangeRow }) {
  return (
    <>
      {row.station ? (
        <Link href={`/bah/${row.station.slug}`} className="text-blue-700 underline hover:text-blue-800">
          {breakable(row.name)}
        </Link>
      ) : (
        breakable(row.name)
      )}
      {row.note && <sup className="text-amber-700 ml-0.5">†</sup>}
    </>
  );
}

function TopTable({ rows, caption, testId }: { rows: BahChangeRow[]; caption: string; testId: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-[13px] sm:text-sm" data-testid={testId}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200 text-left">
            <th scope="col" className="px-2 sm:px-3 py-2.5 font-semibold text-zinc-700">Area</th>
            <th scope="col" className="px-2 sm:px-3 py-2.5 font-semibold text-zinc-700 text-right">{C.priorYear}</th>
            <th scope="col" className="px-2 sm:px-3 py-2.5 font-semibold text-zinc-700 text-right">{C.year}</th>
            <th scope="col" className="px-2 sm:px-3 py-2.5 font-semibold text-zinc-700 text-right sm:whitespace-nowrap">$ change</th>
            <th scope="col" className="px-2 sm:px-3 py-2.5 font-semibold text-zinc-700 text-right sm:whitespace-nowrap">% change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.mha} className="border-b border-zinc-100 last:border-0" data-mha={r.mha}>
              <th scope="row" className="px-2 sm:px-3 py-2 text-left font-normal text-zinc-800">
                <AreaName row={r} />
              </th>
              <td className="px-2 sm:px-3 py-2 text-right tabular-nums text-zinc-600 whitespace-nowrap">{formatRate(r.prior!)}</td>
              <td className="px-2 sm:px-3 py-2 text-right tabular-nums text-zinc-900 whitespace-nowrap">{formatRate(r.current)}</td>
              <td className={`px-2 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap ${r.abs! > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatChangeDollars(r.abs!)}
              </td>
              <td className={`px-2 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap ${r.pct! > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatChangePct(r.pct!)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Notes({ rows }: { rows: BahChangeRow[] }) {
  const noted = rows.filter((r) => r.note);
  if (noted.length === 0) return null;
  return (
    <ul className="text-xs text-zinc-600 mt-2 space-y-1" data-testid="bah-changes-notes">
      {noted.map((r) => (
        <li key={r.mha}>
          <sup className="text-amber-700">†</sup> {`${r.name}: ${r.note!.text}`}
        </li>
      ))}
    </ul>
  );
}

export default function BahChangesPage() {
  const faqs = bahChangesFaqs(C);
  const protection = bahChangesProtectionText(C);
  const inc = C.largestIncrease;
  const dec = C.largestDecrease;
  const unrankedNote = bahChangesUnrankedNote(C);

  return (
    <>
      <JsonLdScript
        schema={breadcrumbListSchema([
          { name: 'Home', url: '/' },
          { name: 'BAH Calculator', url: '/bah' },
          { name: `${C.year} BAH Changes`, url: BAH_CHANGES_PATH },
        ])}
      />
      <JsonLdScript schema={bahChangesDatasetSchema(C)} />

      {/* ── Hero + first-screen stats ───────────────────────────────────── */}
      <section
        className="border-b border-zinc-200"
        style={{ background: 'linear-gradient(to bottom, #f2e8d8 0%, #faf8f5 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6">
          <div className="inline-flex items-center gap-2.5 mb-3 rounded-full bg-zinc-900 px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-none" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-white uppercase tracking-wide">
              Free · No Account · Official DTMO Rates
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[34px] font-extrabold text-zinc-900 leading-tight tracking-tight mb-2">
            {H1}
          </h1>
          <p className="text-sm text-zinc-700 mb-4" data-testid="bah-changes-scope">
            {bahChangesScopeLine(C)}
          </p>

          <div className="grid gap-3 sm:grid-cols-3" data-testid="bah-changes-tiles">
            <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="bah-changes-tile-national">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">DoD national average</p>
              {C.release ? (
                <>
                  <p className="text-2xl font-extrabold text-zinc-900">{`${C.release.avgIncreasePct < 0 ? '−' : '+'}${Math.abs(C.release.avgIncreasePct)}%`}</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {`DoD's average increase for ${C.year}, all pay grades. `}
                    <a href={C.release.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-800">
                      {C.release.sourceLabel}
                    </a>
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-700">{`DoD's ${C.year} release isn't in our record yet.`}</p>
              )}
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="bah-changes-tile-counts">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">{`Areas, E-5 with dependents`}</p>
              <p className="text-base font-bold text-zinc-900 leading-snug">
                <span className="text-green-700 whitespace-nowrap">{`${C.up} up`}</span>
                {' · '}
                <span className="text-zinc-700 whitespace-nowrap">{`${C.same} unchanged`}</span>
                {' · '}
                <span className="text-red-700 whitespace-nowrap">{`${C.down} down`}</span>
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {`Of ${C.count} housing areas, ${C.priorYear} → ${C.year}.`}
                {C.noPrior > 0 && ` ${C.noPrior} new this year.`}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="bah-changes-tile-largest">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">Largest changes</p>
              {inc && (
                <p className="text-sm text-zinc-800">
                  <span className="font-semibold text-green-700">{`${formatChangeDollars(inc.abs!)} (${formatChangePct(inc.pct!)})`}</span>{' '}
                  <AreaName row={inc} />
                </p>
              )}
              {dec && (
                <p className="text-sm text-zinc-800 mt-1">
                  <span className="font-semibold text-red-700">{`${formatChangeDollars(dec.abs!)} (${formatChangePct(dec.pct!)})`}</span>{' '}
                  <AreaName row={dec} />
                </p>
              )}
              <p className="text-xs text-zinc-600 mt-1">{`Monthly, by % change.${unrankedNote ? " Areas DTMO changed mid-year aren't ranked." : ''}`}</p>
            </div>
          </div>
          {unrankedNote && (
            <p className="text-xs text-zinc-600 mt-2" data-testid="bah-changes-unranked">
              <sup className="text-amber-700">†</sup> {unrankedNote}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ── Top 10s ─────────────────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="increases-h" className="min-w-0">
            <h2 id="increases-h" className="text-xl font-semibold text-zinc-900 mb-1">
              {`Top ${C.topIncreases.length} largest BAH increases for ${C.year}`}
            </h2>
            <p className="text-sm text-zinc-600 mb-3">{`E-5 with dependents, by % change from ${C.priorYear}. Monthly rates.`}</p>
            <TopTable rows={C.topIncreases} caption={`Largest BAH increases, ${C.priorYear} to ${C.year}, E-5 with dependents`} testId="bah-changes-top-increases" />
          </section>

          <section aria-labelledby="decreases-h" className="min-w-0">
            <h2 id="decreases-h" className="text-xl font-semibold text-zinc-900 mb-1">
              {`Top ${C.topDecreases.length} largest BAH decreases for ${C.year}`}
            </h2>
            <p className="text-sm text-zinc-600 mb-3">{`E-5 with dependents, by % change from ${C.priorYear}. Monthly rates.`}</p>
            <TopTable rows={C.topDecreases} caption={`Largest BAH decreases, ${C.priorYear} to ${C.year}, E-5 with dependents`} testId="bah-changes-top-decreases" />
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mt-4" role="note" data-testid="bah-changes-protection">
              <p className="text-sm font-semibold text-zinc-900 mb-1">Already stationed in an area that went down?</p>
              <p className="text-sm text-zinc-800 leading-relaxed">{protection.join(' ')}</p>
              <p className="text-sm mt-2">
                <Link href="/bah" className="font-semibold text-red-700 underline hover:text-red-800">
                  Look up your BAH by ZIP code and pay grade →
                </Link>
              </p>
            </div>
          </section>
        </div>

        {/* ── Every MHA (server-rendered in full) ─────────────────────────── */}
        <section aria-labelledby="all-h">
          <h2 id="all-h" className="text-xl font-semibold text-zinc-900 mb-1">
            {`All ${C.count} military housing areas: ${C.priorYear} vs ${C.year} BAH`}
          </h2>
          <p className="text-sm text-zinc-600 mb-3">
            {`Monthly BAH for an E-5 with dependents, sorted by % change. Sort by $ change or area name with the column buttons. Areas with a MilPayTools station page link to it.`}
          </p>
          <BahChangesTable rows={toTableRows(C.rows)} year={C.year} priorYear={C.priorYear} />
          <Notes rows={C.rows} />
          {C.countyCostGroups > 0 && (
            <p className="text-xs text-zinc-600 mt-2" data-testid="bah-changes-ccg-note">
              {bahChangesCcgNote(C.countyCostGroups)}{' '}
              <a href={DTMO_CCG_FAQ.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-800">
                {DTMO_CCG_FAQ.label}
              </a>
              .
            </p>
          )}
          <p className="text-xs text-zinc-500 mt-2">
            Source:{' '}
            <a href={DTMO_BAH_LOOKUP_URL} target="_blank" rel="noopener noreferrer" className="underline">
              DTMO BAH rates
            </a>
            {`, ${C.priorYear} and ${C.year} rate files. Rates take effect January 1.`}
          </p>
        </section>

        {/* ── FAQ (one array: visible list + FAQPage schema) ──────────────── */}
        <FaqSection faqs={faqs} />

        <section className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Related</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/bah" className="text-blue-700 underline hover:text-blue-800">BAH Calculator</Link>{' '}
              <span className="text-zinc-500">{`— your ${C.year} rate by ZIP code, pay grade and dependency status`}</span>
            </li>
            <li>
              <Link href="/bah#stations" className="text-blue-700 underline hover:text-blue-800">BAH by duty station</Link>{' '}
              <span className="text-zinc-500">— every grade, with and without dependents, for major installations</span>
            </li>
            <li>
              <Link href="/pay/raise" className="text-blue-700 underline hover:text-blue-800">2027 Military Pay Raise</Link>{' '}
              <span className="text-zinc-500">— 2027 basic pay and the key dates calendar</span>
            </li>
          </ul>
        </section>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">Disclaimer</p>
          <p>
            {`These are DTMO's published BAH rates, shown for education. Your BAH depends on your duty station, pay grade and dependency status; verify it with your finance office or the `}
            <a href={DTMO_BAH_LOOKUP_URL} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-800">
              DTMO BAH Rate Lookup
            </a>
            . MilPayTools is not affiliated with the Department of Defense.
          </p>
          {C.release && (
            <p className="mt-2">{`DoD's ${C.year} release: ${formatBahDate(C.release.releasedDate)}.`}</p>
          )}
        </div>
      </div>
    </>
  );
}
