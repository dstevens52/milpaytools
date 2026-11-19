import Link from 'next/link';
import type { DutyStation } from '@/data/duty-stations/stations';

/** One card in the hub list: a duty station, or a v2 OCONUS station with no duty-station entry. */
export type StationCard = Pick<DutyStation, 'name' | 'slug' | 'formerName' | 'city' | 'state' | 'stateName'> & {
  branches: string[];
  oconus?: boolean;
  e5Rate: number | null;
};

/** What the client filter needs per card (StationSearch): no rates, no copy. */
export type StationSearchItem = {
  slug: string;
  group: string;
  /** Lower-cased fields the query is matched against, each on its own (no cross-field matches). */
  fields: string[];
};

/** Only the card fields. Callers pass DutyStation objects, which carry far more (housing tips, market data). */
export function toStationCard(s: StationCard): StationCard {
  const c: StationCard = { name: s.name, slug: s.slug, city: s.city, state: s.state, stateName: s.stateName, branches: s.branches, e5Rate: s.e5Rate };
  if (s.formerName !== undefined) c.formerName = s.formerName;
  if (s.oconus !== undefined) c.oconus = s.oconus;
  return c;
}

const groupOf = (s: StationCard) => (s.oconus ? 'OCONUS' : s.stateName);

/** Cards grouped by state, states A–Z, OCONUS last; cards keep their input order within a group. */
export function groupStationCards(cards: StationCard[]): [string, StationCard[]][] {
  const map = new Map<string, StationCard[]>();
  for (const s of cards) {
    const key = groupOf(s);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries()).sort(([a], [b]) => {
    if (a === 'OCONUS') return 1;
    if (b === 'OCONUS') return -1;
    return a.localeCompare(b);
  });
}

export function stationSearchItems(cards: StationCard[]): StationSearchItem[] {
  return cards.map((s) => ({
    slug: s.slug,
    group: groupOf(s),
    fields: [s.name, s.city, s.state, s.stateName, ...(s.formerName ? [s.formerName] : []), ...s.branches].map((f) => f.toLowerCase()),
  }));
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

/**
 * The /bah station list (P1 #5, docs/perf/p1-step1-report.md), rendered by StationSearch and
 * prerendered in full, so every card is in the HTML. The filter only hides cards and groups by
 * their data-station-slug / data-station-group attributes.
 */
export function StationCards({ cards }: { cards: StationCard[] }) {
  return (
    <div className="space-y-10">
      {groupStationCards(cards).map(([stateName, list]) => (
        <div key={stateName} data-station-group={stateName}>
          <h2
            id={stateName === 'OCONUS' ? 'oconus' : undefined}
            className="scroll-mt-20 text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-200">
            {stateName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((s) => (
              <Link
                key={s.slug}
                href={`/bah/${s.slug}`}
                data-station-slug={s.slug}
                className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <p className="font-semibold text-zinc-900 text-sm group-hover:text-red-700 transition-colors mb-0.5">
                  {s.name}
                </p>
                {s.formerName && (
                  <p className="text-xs text-zinc-400 mb-1">formerly {s.formerName}</p>
                )}
                <p className="text-xs text-zinc-500 mb-2">{s.city}, {s.state} &middot; {s.branches.join(' / ')}</p>
                {s.e5Rate !== null && (
                  <p className="text-sm font-bold text-red-700">
                    {fmt(s.e5Rate)}
                    <span className="text-xs font-normal text-zinc-400">/mo E-5 w/dep</span>
                  </p>
                )}
                {s.oconus && (
                  <p className="text-xs text-amber-600 font-medium">OCONUS — OHA applies</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
