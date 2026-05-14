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
  selectedGrade?: string;
  selectedHasDependents?: boolean;
}

const fmt = (n: number) => formatCurrency(n);

const OFFICER_GRADES = ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'] as const;

const PREVIEW_GRADES = ['E-5', 'E-6', 'E-7'] as const;

export function CollapsibleRateTable({ locationName, ratesW, ratesWO, selectedGrade, selectedHasDependents }: Props) {
  const [open, setOpen] = useState(false);

  const previewRates = PREVIEW_GRADES.flatMap((g) => {
    const rate = ratesW[g];
    return rate !== undefined ? [{ grade: g as string, rate }] : [];
  });

  function renderRow(grade: string) {
    const w = ratesW[grade];
    const wo = ratesWO[grade];
    if (w === undefined && wo === undefined) return null;
    const isSelected = selectedGrade === grade;
    return (
      <tr key={grade} className={`hover:bg-zinc-50 transition-colors ${isSelected ? 'bg-red-50' : ''}`}>
        <td className="px-4 py-2.5 text-zinc-700 font-medium">{RANK_DISPLAY[grade as keyof typeof RANK_DISPLAY]}</td>
        <td className={`px-4 py-2.5 text-right tabular-nums text-zinc-900 font-semibold ${isSelected && selectedHasDependents === true ? 'font-bold' : ''}`}>
          {w !== undefined ? fmt(w) : '—'}
        </td>
        <td className={`px-4 py-2.5 text-right tabular-nums text-zinc-600 ${isSelected && selectedHasDependents === false ? 'font-bold' : ''}`}>
          {wo !== undefined ? fmt(wo) : '—'}
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      {/* Always-visible header */}
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">
          2026 BAH Rates — {locationName}
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Monthly rates for all pay grades. Source: DTMO 2026 BAH data. BAH is not taxable income.
        </p>

        {/* Rate preview — visible when collapsed */}
        {!open && previewRates.length > 0 && (
          <p className="text-sm text-zinc-600 tabular-nums mb-4">
            {previewRates.map((x, i) => (
              <span key={x.grade}>
                <span className={`font-medium ${selectedGrade === x.grade ? 'font-bold text-red-700' : ''}`}>{x.grade} w/dep:</span>{' '}
                <span className={`font-semibold text-zinc-900 ${selectedGrade === x.grade ? 'font-bold text-red-700' : ''}`}>{fmt(x.rate)}/mo</span>
                {i < previewRates.length - 1 && <span className="text-zinc-300 mx-2">·</span>}
              </span>
            ))}
          </p>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
          aria-expanded={open}
        >
          {open
            ? <>Collapse <span className={`inline-block transition-transform duration-200 rotate-180`}>▼</span></>
            : <>View all 2026 BAH rates by pay grade <span className={`inline-block transition-transform duration-200`}>▼</span></>
          }
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
                {ENLISTED_GRADES.map((grade) => renderRow(grade))}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Warrant Officer
                  </td>
                </tr>
                {WARRANT_GRADES.map((grade) => renderRow(grade))}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Officer (Prior Enlisted)
                  </td>
                </tr>
                {PRIOR_ENLISTED_OFFICER_GRADES.map((grade) => renderRow(grade))}
                <tr className="bg-zinc-50">
                  <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Officer
                  </td>
                </tr>
                {OFFICER_GRADES.map((grade) => renderRow(grade))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50">
            <p className="text-xs text-zinc-400">
              O-8, O-9, and O-10 receive the same BAH as O-7. Rates effective January 1, 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
