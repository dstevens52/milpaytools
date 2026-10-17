import type { OconusStation, SharedLink } from '@/data/oconus';
import {
  EXPLAINER_HEADING,
  EXPLAINER_LEAD,
  EXPLAINER_POINTS,
  OFFICIAL_LOOKUPS,
  SECONDARY_LOOKUPS,
  EXPLAINER_SOURCES,
  LES_NOTE,
  fillTokens,
} from '@/data/oconus/sharedCopy';

export function isPendingUrl(url: string): boolean {
  return url.startsWith('TODO-DAN') || !/^https?:\/\//.test(url);
}

/** A shared/official link — rendered as plain text while its URL is still a TODO. */
export function MaybeLink({ link, className }: { link: SharedLink | { label: string; url: string }; className?: string }) {
  if (isPendingUrl(link.url)) {
    return (
      <span className={className} data-pending-url={link.url}>
        {link.label} <span className="text-amber-700">[{link.url}]</span>
      </span>
    );
  }
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  );
}

// Shared OHA/COLA explainer rendered on every v2 OCONUS station. Copy lives in
// src/data/oconus/sharedCopy.ts (linted at build time) — edit it there.
export function OconusAllowanceExplainer({ station }: { station: OconusStation }) {
  const tokens = { name: station.name, ohaLocalityCode: station.ohaLocalityCode.value };

  return (
    <section className="bg-white rounded-lg border border-zinc-200 p-6" aria-labelledby="oconus-explainer">
      <h2 id="oconus-explainer" className="text-lg font-semibold text-zinc-900 mb-3">
        {EXPLAINER_HEADING}
      </h2>
      <p className="text-sm text-zinc-700 leading-relaxed mb-5">
        <strong>{EXPLAINER_LEAD.strong}</strong> {EXPLAINER_LEAD.body}
      </p>
      <ul className="space-y-4 mb-6">
        {EXPLAINER_POINTS.map((p) => (
          <li key={p.strong} className="border-l-2 border-red-600 pl-4">
            <p className="text-sm text-zinc-600 leading-relaxed">
              <strong className="text-zinc-900">{p.strong}</strong> {fillTokens(p.body, tokens)}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Official lookups</p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {OFFICIAL_LOOKUPS.map((l) =>
          isPendingUrl(l.url) ? (
            <MaybeLink key={l.label} link={l} className="inline-flex rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-zinc-700" />
          ) : (
            <MaybeLink
              key={l.label}
              link={l}
              className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
            />
          ),
        )}
        {SECONDARY_LOOKUPS.map((l) => (
          <MaybeLink key={l.label} link={l} className="px-2 text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-800" />
        ))}
      </div>
      <p className="text-sm text-zinc-600 mb-5">{LES_NOTE}</p>

      <p className="text-xs text-zinc-400 leading-relaxed">
        Source:{' '}
        {EXPLAINER_SOURCES.map((s, i) => (
          <span key={s.label}>
            {i > 0 && '; '}
            <MaybeLink link={s} className="underline" />
          </span>
        ))}
        .
      </p>
    </section>
  );
}
