import { formatCurrency } from '@/lib/utils';

/**
 * Compute year-over-year change between a current and prior rate.
 * Returns null when either value is missing (graceful fallback for future
 * years where an MHA may not exist in the prior dataset).
 */
export function computeYoY(
  curr?: number,
  prev?: number
): { abs: number; pct: number } | null {
  if (curr === undefined || prev === undefined || prev <= 0) return null;
  return { abs: curr - prev, pct: ((curr - prev) / prev) * 100 };
}

interface YoYDeltaProps {
  curr?: number;
  prev?: number;
  priorYear?: string;
  currentYear?: string;
  /** Omit the "vs {priorYear}" suffix (used in dense table rows). */
  compact?: boolean;
  className?: string;
}

/**
 * Renders a small year-over-year indicator: green for an increase, neutral/muted
 * for a decrease or no-change, and "New for {year}" when there is no prior rate.
 * Renders nothing when there is no current rate to compare.
 */
export function YoYDelta({
  curr,
  prev,
  priorYear = '2025',
  currentYear = '2026',
  compact = false,
  className = '',
}: YoYDeltaProps) {
  if (curr === undefined) return null;

  const d = computeYoY(curr, prev);
  if (d === null) {
    return <span className={`text-zinc-400 ${className}`}>New for {currentYear}</span>;
  }
  if (d.abs === 0) {
    return (
      <span className={`text-zinc-400 ${className}`}>
        No change{compact ? '' : ` vs ${priorYear}`}
      </span>
    );
  }

  const up = d.abs > 0;
  const arrow = up ? '▲' : '▼';
  const sign = up ? '+' : '−';
  const color = up ? 'text-green-700' : 'text-zinc-500';

  return (
    <span className={`${color} ${className}`}>
      {arrow} {sign}
      {formatCurrency(Math.abs(d.abs))} ({Math.abs(d.pct).toFixed(1)}%)
      {!compact && <span className="text-zinc-400"> vs {priorYear}</span>}
    </span>
  );
}
