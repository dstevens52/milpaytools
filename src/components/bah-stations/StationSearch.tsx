'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DutyStation } from '@/data/duty-stations/stations';

interface Props {
  stations: Array<DutyStation & { e5Rate: number | null }>;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function StationSearch({ stations }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.stateName.toLowerCase().includes(q) ||
        (s.formerName && s.formerName.toLowerCase().includes(q)) ||
        s.branches.some((b) => b.toLowerCase().includes(q))
    );
  }, [query, stations]);

  // Group filtered results by state
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const s of filtered) {
      const key = s.oconus ? 'OCONUS' : s.stateName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === 'OCONUS') return 1;
      if (b === 'OCONUS') return -1;
      return a.localeCompare(b);
    });
  }, [filtered]);

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
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Results */}
      {grouped.length === 0 && (
        <p className="text-sm text-zinc-500">No installations found. Try a different search term.</p>
      )}

      <div className="space-y-10">
        {grouped.map(([stateName, list]) => (
          <div key={stateName}>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-200">
              {stateName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((s) => (
                <Link
                  key={s.slug}
                  href={`/bah/${s.slug}`}
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
    </div>
  );
}
