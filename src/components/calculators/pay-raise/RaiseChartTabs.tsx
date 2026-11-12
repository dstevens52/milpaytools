'use client';

import { Children, useState, type ReactNode } from 'react';

interface Panel {
  yos: number;
  label: string;
  key: boolean;
}

/**
 * Year-of-service tabs over server-rendered tables. Every panel is in the HTML
 * (inactive ones use `hidden`), so the full chart is crawlable; the client
 * only switches which one is visible. Key years show by default; "Full chart"
 * reveals every DFAS column.
 */
export function RaiseChartTabs({ panels, children }: { panels: Panel[]; children: ReactNode }) {
  const [active, setActive] = useState(panels.find((p) => p.yos === 6)?.yos ?? panels[0].yos);
  const [showAll, setShowAll] = useState(false);
  const items = Children.toArray(children);
  const visiblePanels = panels.filter((p) => showAll || p.key || p.yos === active);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4" role="tablist" aria-label="Years of service">
        {visiblePanels.map((p) => (
          <button
            key={p.yos}
            type="button"
            role="tab"
            aria-selected={p.yos === active}
            onClick={() => setActive(p.yos)}
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold border transition-colors',
              p.yos === active
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs font-semibold text-red-700 hover:text-red-800 ml-1"
          aria-expanded={showAll}
        >
          {showAll ? 'Key years only' : 'Full chart: every year →'}
        </button>
      </div>
      {panels.map((p, i) => (
        <div key={p.yos} role="tabpanel" hidden={p.yos !== active}>
          {items[i]}
        </div>
      ))}
    </div>
  );
}
