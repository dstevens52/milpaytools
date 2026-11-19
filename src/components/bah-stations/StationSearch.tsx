'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import type { StationSearchItem } from './StationCards';

export type { StationCard } from './StationCards';

interface Props {
  /** One entry per card, in the same order as the cards (stationSearchItems()). */
  items: StationSearchItem[];
  /** The server-rendered card list (<StationCards>). */
  children: ReactNode;
}

/**
 * The /bah hub filter (P1 #5). The cards are server-rendered children; this component holds only
 * the query and hides non-matching cards and empty state groups with a generated <style> rule
 * keyed on their data attributes. Matching is unchanged: a card matches when the query is a
 * substring of its name, city, state, state name, former name or one of its branches.
 */
export function StationSearch({ items, children }: Props) {
  const [query, setQuery] = useState('');
  const scope = `station-cards-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const { matches, css } = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { matches: items.length, css: '' };
    const visibleGroups = new Set<string>();
    const hidden: string[] = [];
    let n = 0;
    for (const it of items) {
      if (it.fields.some((f) => f.includes(q))) {
        n++;
        visibleGroups.add(it.group);
      } else {
        hidden.push(`#${scope} [data-station-slug="${it.slug}"]`);
      }
    }
    for (const g of new Set(items.map((i) => i.group))) {
      if (!visibleGroups.has(g)) hidden.push(`#${scope} [data-station-group="${g.replace(/["\\]/g, '\\$&')}"]`);
    }
    return { matches: n, css: hidden.length ? `${hidden.join(',')}{display:none}` : '' };
  }, [query, items, scope]);

  return (
    <div>
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by base name, city, state, or branch…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-lg px-4 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
        />
        {query && (
          <p className="text-xs text-zinc-500 mt-2">
            {matches} result{matches !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Results */}
      {matches === 0 && (
        <p className="text-sm text-zinc-500">No installations found. Try a different search term.</p>
      )}

      {css && <style>{css}</style>}
      <div id={scope}>{children}</div>
    </div>
  );
}
