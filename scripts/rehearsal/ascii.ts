/**
 * REHEARSAL ONLY. Independent reader for DTMO ASCII files: no src/ imports, so the
 * rehearsal's checks never compare the lib with itself.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

/** DTMO ASCII columns 1–24 (25–27 repeat O-7 for O-8..O-10). */
export const GRADES = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'W-1', 'W-2', 'W-3', 'W-4', 'W-5', 'O-1E', 'O-2E', 'O-3E', 'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7'] as const;

export interface AsciiYear {
  w: Record<string, Record<string, number>>;
  wo: Record<string, Record<string, number>>;
  zip: Record<string, string>;
  names: Record<string, string>;
}

export function readAscii(dir: string, yy: string): AsciiYear {
  const f = (n: string) => readFileSync(path.join(dir, n), 'latin1').split(/\r?\n/).filter(Boolean);
  const rates = (n: string) =>
    Object.fromEntries(
      f(n).map((l) => {
        const [m, ...v] = l.split(',');
        return [m, Object.fromEntries(GRADES.map((g, i) => [g, Number(v[i])]))];
      }),
    );
  return {
    w: rates(`bahw${yy}.txt`),
    wo: rates(`bahwo${yy}.txt`),
    zip: Object.fromEntries(f(`sorted_zipmha${yy}.txt`).map((l) => l.trim().split(/\s+/) as [string, string])),
    names: Object.fromEntries(f(`mhanames${yy}.txt`).map((l) => l.split(';') as [string, string])),
  };
}

export const median = (arr: number[]) => {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid];
};
