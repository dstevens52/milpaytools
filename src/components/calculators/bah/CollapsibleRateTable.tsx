'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  RANK_DISPLAY,
  ENLISTED_GRADES,
  WARRANT_GRADES,
  PRIOR_ENLISTED_OFFICER_GRADES,
} from '@/types/military';

interface Props {
  locationName: string;
  ratesW: Record<string, number>;
  ratesWO: Record<string, number>;
}

const fmt = (n: number) => formatCurrency(n);

const OFFICER_GRADES = ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'] as const;

export function CollapsibleRateTable({ locationName, ratesW, ratesWO }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      {/* Always-visible header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            2026 BAH Rates — {locationName}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Monthly rates for all pay grades. Source: DTMO 2026 BAH data. BAH is not taxable income.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-4 flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          aria-expanded={open}
        >
          {open ? 'Collapse' : 'View all rates'}
          <span className="text-zinc-400 text-xs">{open ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Collapsible table body */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-zinc-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-4 py-3 font-semibold text-zinc-700 w-48">Pay Grade</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-700">With Dependents</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-700">Without Dependents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Enlisted
                  </td>
                </tr>
                {ENLISTED_GRADES.map((grade) => {
                  const w = ratesW[grade];
                  const wo = ratesWO[grade];
                  if (w === undefined && wo === undefined) return null;
                  return (
                    <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                        {w !== undefined ? fmt(w) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                        {wo !== undefined ? fmt(wo) : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Warrant Officer
                  </td>
                </tr>
                {WARRANT_GRADES.map((grade) => {
                  const w = ratesW[grade];
                  const wo = ratesWO[grade];
                  if (w === undefined && wo === undefined) return null;
                  return (
                    <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                        {w !== undefined ? fmt(w) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                        {wo !== undefined ? fmt(wo) : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Officer (Prior Enlisted)
                  </td>
                </tr>
                {PRIOR_ENLISTED_OFFICER_GRADES.map((grade) => {
                  const w = ratesW[grade];
                  const wo = ratesWO[grade];
                  if (w === undefined && wo === undefined) return null;
                  return (
                    <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                        {w !== undefined ? fmt(w) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                        {wo !== undefined ? fmt(wo) : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Officer
                  </td>
                </tr>
                {OFFICER_GRADES.map((grade) => {
                  const w = ratesW[grade];
                  const wo = ratesWO[grade];
                  if (w === undefined && wo === undefined) return null;
                  return (
                    <tr key={grade} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade]}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold">
                        {w !== undefined ? fmt(w) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600">
                        {wo !== undefined ? fmt(wo) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              O-8, O-9, and O-10 receive the same BAH as O-7. Rates effective January 1, 2026.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Collapse ▲
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
