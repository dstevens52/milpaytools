import Link from 'next/link';
import {
  COMPACT_IDS,
  KEY_DATES_HREF,
  calendarLastChecked,
  calendarSources,
  getCalendar2027,
  type CalendarStatus,
} from '@/data/calendar-2027';
import { formatIsoDate } from '@/lib/calculations/payRaise';

/**
 * 2027 military pay calendar. Server component, no hooks, no client JS.
 *   full    — every key date, with body, status chip, link, footer and sources (/pay/raise#key-dates)
 *   compact — final raise, BAH, Jan 1 and Jan 15, plus a link to the full list (/pay)
 * All text comes from src/data/calendar-2027.ts.
 */

const CHIP: Record<CalendarStatus, { label: string; className: string }> = {
  official: { label: 'Official', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  expected: { label: 'Expected', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  pending: { label: 'Pending', className: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
};

function StatusChip({ status }: { status: CalendarStatus }) {
  const chip = CHIP[status];
  return (
    <span
      className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${chip.className}`}
      data-testid="key-date-status"
      data-status={status}
    >
      {chip.label}
    </span>
  );
}

export function KeyDates2027({ variant }: { variant: 'full' | 'compact' }) {
  const all = getCalendar2027();

  if (variant === 'compact') {
    const rows = COMPACT_IDS.map((id) => all.find((e) => e.id === id)!).filter(Boolean);
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="key-dates-compact">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">2027 key dates</p>
        <ul className="divide-y divide-zinc-100">
          {rows.map((e) => (
            <li key={e.id} className="py-2 flex items-start justify-between gap-3" data-testid="key-date-row" data-id={e.id}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">{e.title}</p>
                <p className="text-xs text-zinc-600">{e.dateLabel}</p>
              </div>
              <StatusChip status={e.status} />
            </li>
          ))}
        </ul>
        <p className="text-sm mt-2">
          <Link href={KEY_DATES_HREF} className="font-medium text-red-700 hover:text-red-800 underline">
            See every 2027 key date →
          </Link>
        </p>
      </div>
    );
  }

  const sources = calendarSources(all);
  return (
    <div data-testid="key-dates-full">
      <ol className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {all.map((e) => (
          <li key={e.id} className="px-4 py-3 sm:px-5" data-testid="key-date-row" data-id={e.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-500">{e.dateLabel}</p>
                <h3 className="text-sm font-semibold text-zinc-900 mt-0.5">{e.title}</h3>
              </div>
              <StatusChip status={e.status} />
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed mt-1">{e.body}</p>
            {e.link && (
              <p className="text-sm mt-1">
                <Link href={e.link.href} className="font-medium text-red-700 hover:text-red-800 underline">
                  {e.link.label}
                </Link>
              </p>
            )}
          </li>
        ))}
      </ol>
      <p className="text-xs text-zinc-500 mt-2 leading-relaxed" data-testid="key-dates-footer">
        {`Last checked ${formatIsoDate(calendarLastChecked())}. Official means set by law, regulation or an official announcement; expected dates follow past years and can change.`}
      </p>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed" data-testid="key-dates-sources">
        Sources:{' '}
        {sources.map((s, i) => (
          <span key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
              {s.name}
            </a>
            {i < sources.length - 1 ? '; ' : '.'}
          </span>
        ))}
      </p>
    </div>
  );
}
