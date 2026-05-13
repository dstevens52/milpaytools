'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ShareBar } from '@/components/calculators/shared/ShareButton';
import { fireCalculatorEvent } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'pre' | 'sep' | 'post';
type ItemStatus = 'past' | 'active' | 'approaching' | 'future' | 'sep-day';
type TampOption = 'yes' | 'no' | 'unknown';
type SepType = 'separating' | 'retiring';
type VaOption = 'yes' | 'no' | 'unknown';

interface TimelineItem {
  id: string;
  phase: Phase;
  name: string;
  what: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  isRange: boolean;
  status: ItemStatus;
  daysFromToday: number | null;
  daysUntilStart: number | null;
  daysUntilEnd: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseISODate(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

function fmtDaysLabel(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 0) return `${days} days away`;
  if (days === -1) return '1 day ago';
  return `${Math.abs(days)} days ago`;
}

// ─── Status styles ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ItemStatus, {
  badge: string;
  dot: string;
  border: string;
  dateBg: string;
  dateText: string;
}> = {
  past: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    border: 'border-red-200',
    dateBg: 'bg-red-50',
    dateText: 'text-red-600',
  },
  active: {
    badge: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
    border: 'border-green-300',
    dateBg: 'bg-green-50',
    dateText: 'text-green-700',
  },
  approaching: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    border: 'border-amber-300',
    dateBg: 'bg-amber-50',
    dateText: 'text-amber-700',
  },
  future: {
    badge: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    dot: 'bg-zinc-400',
    border: 'border-zinc-200',
    dateBg: 'bg-zinc-50',
    dateText: 'text-zinc-500',
  },
  'sep-day': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    border: 'border-blue-300',
    dateBg: 'bg-blue-50',
    dateText: 'text-blue-700',
  },
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  past: 'Expired',
  active: 'Active now',
  approaching: 'Approaching',
  future: 'Upcoming',
  'sep-day': 'Separation day',
};

// ─── Build timeline ───────────────────────────────────────────────────────────

function buildTimeline(
  sepDate: Date,
  today: Date,
  sepType: SepType,
  tamp: TampOption,
  vaFiled: VaOption,
): TimelineItem[] {
  function pointStatus(date: Date, isSepDay = false): ItemStatus {
    if (isSepDay) return 'sep-day';
    if (date < today) return 'past';
    const days = diffDays(today, date);
    if (days === 0) return 'active';
    if (days <= 30) return 'approaching';
    return 'future';
  }

  function rangeStatus(startDate: Date, endDate: Date): ItemStatus {
    if (today >= startDate && today <= endDate) return 'active';
    if (endDate < today) return 'past';
    const daysToStart = diffDays(today, startDate);
    if (daysToStart <= 30) return 'approaching';
    return 'future';
  }

  const bddOpens = addDays(sepDate, -180);
  const bddCloses = addDays(sepDate, -90);
  const tampEnd = addDays(sepDate, 180);
  const sgliFreeEnds = addDays(sepDate, 120);
  const vgliNoExamEnd = addDays(sepDate, 240);
  const finalMoveDeadline = sepType === 'retiring' ? addYears(sepDate, 3) : addDays(sepDate, 180);
  const vgliWindowCloses = addDays(sepDate, 485);

  const items: TimelineItem[] = [];

  // ── Pre-separation ────────────────────────────────────────────────────────

  if (vaFiled !== 'yes') {
    items.push({
      id: 'bdd-opens',
      phase: 'pre',
      name: 'BDD Filing Window Opens',
      what: 'File your VA disability claim through Benefits Delivery at Discharge. Filing now may help VA process your claim sooner.',
      date: bddOpens,
      isRange: false,
      status: pointStatus(bddOpens),
      daysFromToday: diffDays(today, bddOpens),
      daysUntilStart: null,
      daysUntilEnd: null,
    });
  }

  items.push({
    id: 'shpe-sha',
    phase: 'pre',
    name: 'Schedule SHPE / SHA',
    what: 'Schedule your Separation Health Physical Exam and Separation Health Assessment. SHA Part A is required for BDD claims.',
    startDate: bddOpens,
    endDate: bddCloses,
    isRange: true,
    status: rangeStatus(bddOpens, bddCloses),
    daysFromToday: null,
    daysUntilStart: diffDays(today, bddOpens),
    daysUntilEnd: diffDays(today, bddCloses),
  });

  if (vaFiled !== 'yes') {
    items.push({
      id: 'bdd-closes',
      phase: 'pre',
      name: 'BDD Filing Window Closes',
      what: 'Last day to file through BDD. After this, file a standard claim post-separation.',
      date: bddCloses,
      isRange: false,
      status: pointStatus(bddCloses),
      daysFromToday: diffDays(today, bddCloses),
      daysUntilStart: null,
      daysUntilEnd: null,
    });
  }

  items.push({
    id: 'tap',
    phase: 'pre',
    name: 'TAP Completion Deadline',
    what: 'All TAP requirements should be complete by this date. Retirees should begin 18–24 months before separation.',
    date: bddCloses,
    isRange: false,
    status: pointStatus(bddCloses),
    daysFromToday: diffDays(today, bddCloses),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  // ── Separation day ─────────────────────────────────────────────────────────

  items.push({
    id: 'last-day',
    phase: 'sep',
    name: 'Last Active Duty Day',
    what: 'Final active-duty paycheck. Base pay, BAH, BAS, and all active-duty entitlements end.',
    date: sepDate,
    isRange: false,
    status: 'sep-day',
    daysFromToday: diffDays(today, sepDate),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  items.push({
    id: 'tricare-ends',
    phase: 'sep',
    name: 'TRICARE Active-Duty Coverage Ends',
    what: 'Active-duty TRICARE coverage ends at midnight on your last day. If TAMP-eligible, transitional coverage begins the next day.',
    date: sepDate,
    isRange: false,
    status: 'sep-day',
    daysFromToday: diffDays(today, sepDate),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  // ── Post-separation ───────────────────────────────────────────────────────

  if (tamp !== 'no') {
    items.push({
      id: 'tamp',
      phase: 'post',
      name: 'TAMP Coverage Period',
      what: "Transitional Assistance Management Program provides 180 days of TRICARE coverage. Not automatic — verify eligibility with your service branch before separation. After TAMP, you'll need employer coverage, VA healthcare, or a marketplace plan.",
      startDate: sepDate,
      endDate: tampEnd,
      isRange: true,
      status: rangeStatus(sepDate, tampEnd),
      daysFromToday: null,
      daysUntilStart: diffDays(today, sepDate),
      daysUntilEnd: diffDays(today, tampEnd),
    });
  }

  items.push({
    id: 'sgli-ends',
    phase: 'post',
    name: 'SGLI Free Coverage Ends',
    what: "Servicemembers' Group Life Insurance continues at no cost for 120 days after separation, then ends unless converted to VGLI.",
    date: sgliFreeEnds,
    isRange: false,
    status: pointStatus(sgliFreeEnds),
    daysFromToday: diffDays(today, sgliFreeEnds),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  items.push({
    id: 'vgli-no-exam',
    phase: 'post',
    name: 'VGLI No-Exam Window',
    what: "Apply for Veterans' Group Life Insurance within 240 days — no health questions required. After 240 days, proof of good health is needed. The full application window extends to 1 year and 120 days (485 days).",
    startDate: sepDate,
    endDate: vgliNoExamEnd,
    isRange: true,
    status: rangeStatus(sepDate, vgliNoExamEnd),
    daysFromToday: null,
    daysUntilStart: diffDays(today, sepDate),
    daysUntilEnd: diffDays(today, vgliNoExamEnd),
  });

  items.push({
    id: 'final-move',
    phase: 'post',
    name: 'Final Move Deadline',
    what: sepType === 'retiring'
      ? 'Deadline to complete your final government-paid move. Retirees have up to 3 years from retirement date. Contact your branch transportation office to begin coordination.'
      : 'Deadline to complete your final government-paid move. Separating members have 180 days. Check your orders and branch transportation office for your specific entitlement.',
    date: finalMoveDeadline,
    isRange: false,
    status: pointStatus(finalMoveDeadline),
    daysFromToday: diffDays(today, finalMoveDeadline),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  items.push({
    id: 'vgli-closes',
    phase: 'post',
    name: 'VGLI Application Window Closes',
    what: "Last day to apply for VGLI. After 485 days (1 year + 120 days), conversion from SGLI is no longer available.",
    date: vgliWindowCloses,
    isRange: false,
    status: pointStatus(vgliWindowCloses),
    daysFromToday: diffDays(today, vgliWindowCloses),
    daysUntilStart: null,
    daysUntilEnd: null,
  });

  return items;
}

// ─── Timeline card ─────────────────────────────────────────────────────────────

function TimelineCard({ item }: { item: TimelineItem }) {
  const s = STATUS_STYLES[item.status];

  const dateNode = item.isRange ? (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-medium text-zinc-600 leading-tight">{fmtDateShort(item.startDate!)}</span>
      <span className="text-[10px] text-zinc-400">↓</span>
      <span className="text-[11px] font-medium text-zinc-600 leading-tight">{fmtDate(item.endDate!)}</span>
    </div>
  ) : (
    <span className="text-[11px] font-medium text-zinc-700 leading-tight text-center">{fmtDate(item.date!)}</span>
  );

  const subLabel = (() => {
    if (item.isRange) {
      if (item.status === 'active') return 'Active now';
      if (item.status === 'past') return 'Ended';
      if (item.status === 'approaching' && item.daysUntilStart !== null && item.daysUntilStart > 0) {
        return `Opens in ${item.daysUntilStart}d`;
      }
      return null;
    }
    if (item.daysFromToday === null) return null;
    return fmtDaysLabel(item.daysFromToday);
  })();

  return (
    <div className={['flex gap-3 rounded-lg border bg-white p-4', s.border].join(' ')}>
      {/* Date badge */}
      <div className={['flex-none w-28 rounded-md px-2 py-3 flex flex-col items-center justify-center gap-1', s.dateBg].join(' ')}>
        {dateNode}
        {subLabel && (
          <span className={['text-[10px] font-semibold leading-tight text-center', s.dateText].join(' ')}>
            {subLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="font-semibold text-zinc-900 text-sm leading-snug">{item.name}</p>
          <span className={['flex-none inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap', s.badge].join(' ')}>
            <span className={['w-1.5 h-1.5 rounded-full flex-none', s.dot].join(' ')} />
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">{item.what}</p>
      </div>
    </div>
  );
}

// ─── Phase header ──────────────────────────────────────────────────────────────

function PhaseHeader({ label, color }: { label: string; color: 'zinc' | 'blue' }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap',
        color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600',
      ].join(' ')}>
        {label}
      </span>
      <div className={['flex-1 h-px', color === 'blue' ? 'bg-blue-200' : 'bg-zinc-200'].join(' ')} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SeparationTimelineCalculator() {
  const [sepDateStr, setSepDateStr] = useState('');
  const [sepType, setSepType] = useState<SepType>('separating');
  const [tamp, setTamp] = useState<TampOption>('unknown');
  const [vaFiled, setVaFiled] = useState<VaOption>('unknown');

  const _gaFiredRef = useRef(false);
  const _gaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sepDate = useMemo(() => parseISODate(sepDateStr), [sepDateStr]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const timelineItems = useMemo(() => {
    if (!sepDate) return null;
    return buildTimeline(sepDate, today, sepType, tamp, vaFiled);
  }, [sepDate, today, sepType, tamp, vaFiled]);

  // GA4 — fire once when timeline first renders
  useEffect(() => {
    if (!timelineItems || _gaFiredRef.current) return;
    clearTimeout(_gaTimerRef.current);
    _gaTimerRef.current = setTimeout(() => {
      fireCalculatorEvent('separation-timeline');
      _gaFiredRef.current = true;
    }, 800);
    return () => clearTimeout(_gaTimerRef.current);
  }, [timelineItems]);

  // Read URL params on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const dateParam = p.get('date');
    const typeParam = p.get('type');
    const tampParam = p.get('tamp');
    const vaParam = p.get('va');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) setSepDateStr(dateParam);
    if (typeParam === 'retiring') setSepType('retiring');
    else if (typeParam === 'separating') setSepType('separating');
    if (tampParam === 'yes') setTamp('yes');
    else if (tampParam === 'no') setTamp('no');
    else if (tampParam === 'unknown') setTamp('unknown');
    if (vaParam === 'yes') setVaFiled('yes');
    else if (vaParam === 'no') setVaFiled('no');
    else if (vaParam === 'unknown') setVaFiled('unknown');
  }, []);

  function getShareUrl(): string {
    const params = new URLSearchParams();
    if (sepDateStr) params.set('date', sepDateStr);
    params.set('type', sepType);
    params.set('tamp', tamp);
    params.set('va', vaFiled);
    return `${window.location.origin}/calculators/separation-timeline?${params.toString()}`;
  }

  const preItems = timelineItems?.filter((i) => i.phase === 'pre') ?? [];
  const sepItems = timelineItems?.filter((i) => i.phase === 'sep') ?? [];
  const postItems = timelineItems?.filter((i) => i.phase === 'post') ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Inputs */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Enter your separation details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="sep-date" className="block text-sm font-medium text-zinc-700 mb-1">
              Separation Date
            </label>
            <input
              id="sep-date"
              type="date"
              value={sepDateStr}
              onChange={(e) => setSepDateStr(e.target.value)}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-zinc-700 mb-1" id="sep-type-label">
              Separation Type
            </p>
            <div
              role="group"
              aria-labelledby="sep-type-label"
              className="flex rounded-md overflow-hidden border border-zinc-300"
            >
              {(['separating', 'retiring'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSepType(opt)}
                  aria-pressed={sepType === opt}
                  className={[
                    'flex-1 py-2 text-sm font-medium transition-colors',
                    sepType === opt
                      ? 'bg-red-700 text-white'
                      : 'bg-white text-zinc-600 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  {opt === 'separating' ? 'Separating' : 'Retiring'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tamp-select" className="block text-sm font-medium text-zinc-700 mb-1">
              TAMP Eligible?
            </label>
            <select
              id="tamp-select"
              value={tamp}
              onChange={(e) => setTamp(e.target.value as TampOption)}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
            >
              <option value="unknown">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label htmlFor="va-select" className="block text-sm font-medium text-zinc-700 mb-1">
              VA Claim Filed?
            </label>
            <select
              id="va-select"
              value={vaFiled}
              onChange={(e) => setVaFiled(e.target.value as VaOption)}
              className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
            >
              <option value="unknown">Not sure</option>
              <option value="no">No, not yet</option>
              <option value="yes">Yes, already filed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!timelineItems && (
        <div className="text-center py-16 text-zinc-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-base font-medium text-zinc-500">
            Enter your separation date above to see your timeline
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            Get a date-by-date checklist for healthcare, insurance, VA filing, final move, and TAP deadlines.
          </p>
        </div>
      )}

      {/* Timeline */}
      {timelineItems && (
        <div className="space-y-8">
          {preItems.length > 0 && (
            <section aria-label="Pre-Separation">
              <PhaseHeader label="Pre-Separation" color="zinc" />
              <div className="space-y-3">
                {preItems.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          <section aria-label="Separation Day">
            <PhaseHeader label="Separation Day" color="blue" />
            <div className="space-y-3">
              {sepItems.map((item) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {postItems.length > 0 && (
            <section aria-label="Post-Separation">
              <PhaseHeader label="Post-Separation" color="zinc" />
              <div className="space-y-3">
                {postItems.map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          <div className="space-y-3 pt-2">
            <ShareBar getUrl={getShareUrl} />
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                />
              </svg>
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
