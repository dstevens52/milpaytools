import type { PayGrade } from '@/types/military';
import { ALL_PAY_GRADES } from '@/types/military';

const VALID_GRADES = new Set<string>(ALL_PAY_GRADES);

/**
 * Parse a grade from a URL param to a PayGrade ("E-5", "O-1E", etc.).
 *
 * Forgiving on purpose: links built by other sites, AI assistants and older
 * versions of this site use either form, so case, one hyphen and surrounding
 * whitespace are ignored. All of these return 'E-5': e5, E5, e-5, E-5, " E-5 ".
 * All of these return 'O-1E': o1e, O1E, o-1e, O-1E.
 *
 * Returns null for anything that is not a real pay grade (e10, x5, o4e, '',
 * null). Emitters should still write the canonical short form via
 * gradeToParam().
 */
export function parseGrade(raw: string | null): PayGrade | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  const match = s.match(/^([eow])-?(\d+)(e?)$/);
  if (!match) return null;
  const grade = `${match[1].toUpperCase()}-${match[2]}${match[3].toUpperCase()}`;
  return VALID_GRADES.has(grade) ? (grade as PayGrade) : null;
}

/** Serialize a PayGrade to a URL param (E-5 → e5, O-1E → o1e). Canonical form for every emitted link. */
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

/**
 * Dependents setting from `dependents=`, or from its short alias `dep=` (the VA
 * loan calculator's name, so its links work on /bah too). A valid `dependents`
 * wins when both are set.
 */
export function parseDependents(dependents: string | null, dep: string | null): boolean | null {
  const d = parseBool(dependents);
  return d !== null ? d : parseBool(dep);
}

/** Parse and validate a 5-digit ZIP code string */
export function parseZip(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\D/g, '').slice(0, 5);
  return cleaned.length === 5 ? cleaned : null;
}
