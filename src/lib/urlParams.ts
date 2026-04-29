import type { PayGrade } from '@/types/military';
import { ALL_PAY_GRADES } from '@/types/military';

const VALID_GRADES = new Set<string>(ALL_PAY_GRADES);

/** Parse a URL-style grade (e5, o3, w2, o1e) to a PayGrade ("E-5", "O-3", etc.) */
export function parseGrade(raw: string | null): PayGrade | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  let grade: string;
  const priorMatch = s.match(/^o([123])e$/);
  if (priorMatch) {
    grade = `O-${priorMatch[1]}E`;
  } else {
    const match = s.match(/^([eow])(\d+)$/);
    if (!match) return null;
    grade = `${match[1].toUpperCase()}-${match[2]}`;
  }
  return VALID_GRADES.has(grade) ? (grade as PayGrade) : null;
}

/** Serialize a PayGrade to a URL param (E-5 → e5, O-1E → o1e) */
export function gradeToParam(grade: PayGrade): string {
  return grade.replace(/-/g, '').toLowerCase();
}

/** Parse yes/no/1/0/true/false to boolean */
export function parseBool(raw: string | null): boolean | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s === 'yes' || s === '1' || s === 'true') return true;
  if (s === 'no' || s === '0' || s === 'false') return false;
  return null;
}

/** Parse and validate a 5-digit ZIP code string */
export function parseZip(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\D/g, '').slice(0, 5);
  return cleaned.length === 5 ? cleaned : null;
}
