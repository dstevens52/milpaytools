import Link from 'next/link';
import Image from 'next/image';
import type { OconusStation, SourcedFact } from '@/data/oconus';
import { oconusH1 } from '@/data/oconus';
import {
  HERO_EYEBROW,
  PLAN_STEPS,
  UNCHANGED_HEADING,
  UNCHANGED_POINTS,
  OCONUS_DISCLAIMER,
  OCONUS_APPROVED_NEXT_LINKS,
  OFFICIAL_LOOKUPS,
  EXPLAINER_SOURCES,
} from '@/data/oconus/sharedCopy';
import { CALCULATORS } from '@/data/calculators';
import { STATION_BY_SLUG } from '@/data/duty-stations/stations';
import { OconusAllowanceExplainer, MaybeLink, isPendingUrl } from '@/components/oconus/OconusAllowanceExplainer';

// v2 OCONUS station template. No rates, no cost figures: every station fact
// comes from src/data/oconus/<station>.ts and carries its own source link.

const BRANCH_EMBLEM: Record<string, string> = {
  'Army': 'army',
  'Navy': 'navy',
  'Air Force': 'air-force',
  'Marine Corps': 'marines',
  'Space Force': 'space-force',
  'Coast Guard': 'coast-guard',
};

function branchEmblem(branches: string[]): string | null {
  for (const b of branches) {
    const key = Object.keys(BRANCH_EMBLEM).find((k) => b.startsWith(k));
    if (key) return BRANCH_EMBLEM[key];
  }
  return null;
}

/** "2026-10-17" → "October 2026"; anything that isn't an ISO date shows as-is. */
function monthYear(iso: string): string {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function SourceLink({ fact }: { fact: SourcedFact<unknown> }) {
  if (isPendingUrl(fact.sourceUrl)) {
    return <span className="text-[11px] text-amber-700">[source: {fact.sourceUrl}]</span>;
  }
  return (
    <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-400 underline hover:text-zinc-600">
      source
    </a>
  );
}

function Checklist({ items }: { items: SourcedFact[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.value} className="flex items-start gap-3">
          <svg className="w-4 h-4 flex-none mt-0.5 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l3 3 5-6" />
          </svg>
          <p className="text-sm text-zinc-700 leading-relaxed">
            {item.value} <SourceLink fact={item} />
          </p>
        </li>
      ))}
    </ul>
  );
}

export function OconusStationPage({
  station,
  heroImage,
  heroImageCredit,
}: {
  station: OconusStation;
  heroImage?: string;
  heroImageCredit?: string;
}) {
  const oconusCalcs = CALCULATORS.filter((c) => c.supportsOconus);
  const pcsSupportsOconus = oconusCalcs.some((c) => c.href === '/calculators/pcs');
  const nextLinks = [
    ...oconusCalcs.map((c) => ({ label: c.name, href: c.href })),
    ...OCONUS_APPROVED_NEXT_LINKS,
  ];

  // Related stations: OCONUS only — a CONUS slug here is dropped, never linked.
  const related = station.relatedStations
    .map((slug) => STATION_BY_SLUG[slug])
    .filter((s): s is NonNullable<typeof s> => !!s && !!s.oconus);

  const emblem = branchEmblem(station.branches.value);
  const subtitle = [station.cityRegion.value, station.hostCountry.value, station.branches.value.join(' / ')].join(' · ');

  const facts: { label: string; value: string; fact: SourcedFact<unknown> }[] = [
    { label: 'Location', value: `${station.cityRegion.value}, ${station.hostCountry.value}`, fact: station.cityRegion },
    { label: 'Branches', value: station.branches.value.join(', '), fact: station.branches },
    { label: 'OHA locality code', value: station.ohaLocalityCode.value, fact: station.ohaLocalityCode },
    { label: 'COLA locality', value: station.colaLocality.value, fact: station.colaLocality },
  ];
  if (station.coLocated) {
    facts.push({ label: 'Co-located installations', value: station.coLocated.value.join(', '), fact: station.coLocated });
  }

  // Every source used on the page, deduplicated (station facts + shared links).
  const stationFacts: SourcedFact<unknown>[] = [
    station.hostCountry,
    station.cityRegion,
    station.branches,
    station.ohaLocalityCode,
    station.colaLocality,
    ...(station.coLocated ? [station.coLocated] : []),
    station.localContext,
    ...station.leaseQuestions,
    ...station.beforeYouMove,
  ];
  const sourceUrls = Array.from(
    new Set([
      ...stationFacts.map((f) => f.sourceUrl),
      ...station.officialLinks.map((l) => l.url),
      ...OFFICIAL_LOOKUPS.map((l) => l.url),
      ...EXPLAINER_SOURCES.map((l) => l.url),
    ]),
  );
  const verifiedSources = sourceUrls.filter((u) => !isPendingUrl(u));
  const pendingSources = sourceUrls.filter(isPendingUrl);

  const step3Sub = pcsSupportsOconus ? PLAN_STEPS[2].subPcs : PLAN_STEPS[2].subAnchor;
  const step3Href = pcsSupportsOconus ? '/calculators/pcs' : '#before-you-move';

  return (
    <>
      {/* Breadcrumb — hub label kept as "BAH by Station" (URL/intent match) */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Link href="/bah" className="hover:text-zinc-600 transition-colors">
              BAH by Station
            </Link>
            <span>›</span>
            <span className="text-zinc-600">{station.name}</span>
          </nav>
        </div>
      </div>

      {/* 1. Hero + 2. 3-step plan */}
      <div className="relative overflow-hidden bg-slate-800">
        {heroImage ? (
          <Image src={heroImage} alt={station.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-zinc-800 to-stone-700" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        {emblem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/branches/${emblem}.svg`}
            alt=""
            aria-hidden="true"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-28 sm:w-44 md:w-56 pointer-events-none select-none opacity-[0.15] sm:opacity-[0.22]"
          />
        )}
        <div className="relative">
          <div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-5 sm:pb-6">
            <span className="inline-flex items-center mb-2 px-2.5 py-1 rounded-full text-xs font-semibold text-white/90 bg-white/15 border border-white/20">
              {HERO_EYEBROW}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1">{oconusH1(station)}</h1>
            <p className="text-sm text-white/60">{subtitle}</p>
          </div>
          <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-5">
            <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
              {PLAN_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className={[
                    'flex items-start gap-3 flex-1',
                    i > 0 ? 'sm:pl-6 sm:border-l sm:border-white/10' : '',
                    i < PLAN_STEPS.length - 1 ? 'sm:pr-6' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs flex-none mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    {i < 2 ? (
                      <p className="text-xs text-white/50">{'sub' in step ? step.sub : ''}</p>
                    ) : (
                      <Link href={step3Href} className="text-xs text-white/70 underline underline-offset-2 hover:text-white">
                        {step3Sub}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        {heroImage && (
          <p className="absolute bottom-2 right-3 text-xs text-white/35 select-none z-10">
            {heroImageCredit ?? 'Photo: U.S. Military / DVIDS'}
          </p>
        )}
      </div>

      <div className="bg-zinc-50 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* 3. Shared allowance explainer */}
          <OconusAllowanceExplainer station={station} />

          {/* 4. Quick facts */}
          <section className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Quick facts</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wide">{f.label}</dt>
                  <dd className="text-sm font-medium text-zinc-800">
                    {f.value} <SourceLink fact={f.fact} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 5. Local context */}
          <section className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-3">Living near {station.name}</h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {station.localContext.value} <SourceLink fact={station.localContext} />
            </p>
            {station.officialLinks.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1.5">
                {station.officialLinks.map((l) => (
                  <li key={l.label} className="text-sm">
                    <MaybeLink link={l} className="text-red-700 underline underline-offset-2 hover:text-red-800" />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 6. Lease questions */}
          <section className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-4">Questions to ask before you sign a lease</h2>
            <Checklist items={station.leaseQuestions} />
          </section>

          {/* 7. Before you move */}
          <section id="before-you-move" className="rounded-lg bg-sky-50 border border-sky-200 p-6 scroll-mt-4">
            <h2 className="text-base font-semibold text-sky-900 mb-4">Before you move</h2>
            <Checklist items={station.beforeYouMove} />
          </section>

          {/* 8. What doesn't change overseas */}
          <section className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-3">{UNCHANGED_HEADING}</h2>
            <ul className="space-y-2 mb-4">
              {UNCHANGED_POINTS.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 flex-none mt-1.5" />
                  <p className="text-sm text-zinc-600 leading-relaxed">{t}</p>
                </li>
              ))}
            </ul>
            <Link href="/pay" className="text-sm font-semibold text-red-700 hover:underline">
              See the military pay charts →
            </Link>
          </section>

          {/* 9. What to do next — supportsOconus calculators + Dan-approved links only */}
          {nextLinks.length > 0 && (
            <section className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-white font-semibold mb-4">What to do next</h2>
              <div className="flex flex-col gap-2.5">
                {nextLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-zinc-300 hover:text-white transition-colors">
                    {l.label} →
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 10. Other overseas stations */}
          {related.length > 0 && (
            <section className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Other overseas stations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/bah/${s.slug}`}
                    data-related-station={s.slug}
                    className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
                  >
                    <p className="font-semibold text-zinc-900 text-sm mb-1">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.stateName}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 11. Sources & last reviewed */}
          <section className="rounded-lg bg-white border border-zinc-200 p-5 text-xs text-zinc-500 leading-relaxed">
            <p className="font-semibold text-zinc-700 mb-2">Sources · Last reviewed {monthYear(station.lastReviewed)}</p>
            <ul className="space-y-1">
              {verifiedSources.map((u) => (
                <li key={u} className="break-all">
                  <a href={u} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
                    {u}
                  </a>
                </li>
              ))}
              {pendingSources.map((u) => (
                <li key={u} className="text-amber-700">[{u}]</li>
              ))}
            </ul>
          </section>

          {/* 12. OCONUS disclaimer */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs text-slate-500 leading-relaxed">{OCONUS_DISCLAIMER}</p>
          </div>

          {/* 13. No in-page signup — the sitewide footer signup is the only one. */}
        </div>
      </div>
    </>
  );
}
