import {
  changeRange,
  formatUsd,
  fmtPct,
  tricareChange,
  tricareDate,
  tricareValue,
  type CHANGE_SETS,
  type Format,
  type PostYear,
} from '@/lib/tricarePost';
import { TRICARE_COST_YEAR } from '@/data/tricare/current';

// MDX posts can't import data modules, so TRICARE figures are rendered here
// from the TRICARE year files (src/data/tricare/). Server only. Props arrive as
// strings from MDX (next-mdx-remote drops JS-expression props).

interface Props {
  /** Dot path into the year's cost file, e.g. "retiree.selectB.enrollmentFee.family"; "comparison.<field>" reads the official 2027 comparison. */
  path: string;
  year?: PostYear;
  format?: Format | 'pct';
  /** Show the 2026 → 2027 change instead of the value: in dollars, or in percent. */
  change?: 'dollars' | 'pct';
  /** Multiply the value (e.g. times="12" for a year of monthly premiums). */
  times?: string;
  /** Subtract the value at this path (same year). */
  minus?: string;
}

export function TricareFigure({ path, year = '2027', format = 'auto', change, times, minus }: Props) {
  if (change) {
    const c = tricareChange(path);
    return <>{change === 'pct' ? fmtPct(Math.abs(c.pct)) : formatUsd(Math.abs(c.dollars), format === 'pct' ? 'auto' : format)}</>;
  }
  const mult = times === undefined ? 1 : Number(times);
  if (!Number.isFinite(mult) || mult <= 0) throw new Error(`TricareFigure: bad times "${times}"`);
  let v = tricareValue(year, path) * mult;
  if (minus) v -= tricareValue(year, minus);
  v = Math.round(v * 100 + 1e-7) / 100;
  if (format === 'pct') return <>{`${v}%`}</>;
  return <>{formatUsd(v, format)}</>;
}

/** "3.6–3.7%" or "$0–$5": the range of 2026 → 2027 changes across a set of figures. */
export function TricareChangeRange({ set, unit }: { set: keyof typeof CHANGE_SETS; unit: 'pct' | 'dollars' }) {
  return <>{changeRange(set, unit)}</>;
}

/** The TRICARE cost year calculators show (TRICARE_COST_YEAR), for labels next to year="current" figures. */
export function TricareCostYear() {
  return <>{TRICARE_COST_YEAR}</>;
}

/** Open Season and effective dates, AP style ("Nov. 9–Dec. 8, 2026"). */
export function TricareDate({ which }: { which: Parameters<typeof tricareDate>[0] }) {
  return <>{tricareDate(which)}</>;
}
