'use client';

import { useSyncExternalStore } from 'react';
import type { WidgetPayday } from '@/lib/pay-dates/content';

/**
 * "Next active-duty payday" — client-side only. The page is prerendered, so the
 * server renders nothing here; after hydration the widget reads the viewer's local
 * date and picks the next date from the static list. Without JS it stays hidden.
 */

function localIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** The day before a scheduled date: the latest a pending payday can be paid. */
function dayBefore(iso: string): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}

const noopSubscribe = () => () => {};

export function NextPayday({ paydays }: { paydays: WidgetPayday[] }) {
  // Server snapshot is null (prerendered HTML has no widget); the client snapshot
  // is the viewer's local date.
  const today = useSyncExternalStore(noopSubscribe, () => localIso(new Date()), () => null);

  if (!today) return null;
  const next = paydays.find((p) => (p.paid ?? dayBefore(p.scheduled)) >= today);
  if (!next) return null;

  let text: string;
  if (next.paid) {
    const n = daysBetween(today, next.paid);
    const away = n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`;
    text = `${longDate(next.paid)} (${away})`;
  } else {
    text = next.pendingText ?? '';
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3" data-testid="next-payday">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Next active-duty payday</p>
      <p className="text-base font-semibold text-zinc-900 mt-0.5" data-testid="next-payday-date">
        {text}
      </p>
    </div>
  );
}
