import { RANK_LABELS } from '@/data/ranks/rankTitles';

export type Branch =
  | 'Army'
  | 'Navy'
  | 'Air Force'
  | 'Marine Corps'
  | 'Coast Guard'
  | 'Space Force';

export type EnlistedGrade = 'E-1' | 'E-2' | 'E-3' | 'E-4' | 'E-5' | 'E-6' | 'E-7' | 'E-8' | 'E-9';
export type WarrantGrade = 'W-1' | 'W-2' | 'W-3' | 'W-4' | 'W-5';
export type OfficerGrade =
  | 'O-1' | 'O-2' | 'O-3' | 'O-4' | 'O-5' | 'O-6'
  | 'O-7' | 'O-8' | 'O-9' | 'O-10';

// Prior-enlisted officers: separate pay rates, same BAH rates as their O grade
export type PriorEnlistedOfficerGrade = 'O-1E' | 'O-2E' | 'O-3E';

export type PayGrade = EnlistedGrade | WarrantGrade | OfficerGrade | PriorEnlistedOfficerGrade;

export const ENLISTED_GRADES: EnlistedGrade[] = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
];
export const WARRANT_GRADES: WarrantGrade[] = ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'];
export const OFFICER_GRADES: OfficerGrade[] = [
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
];
export const PRIOR_ENLISTED_OFFICER_GRADES: PriorEnlistedOfficerGrade[] = ['O-1E', 'O-2E', 'O-3E'];
export const ALL_PAY_GRADES: PayGrade[] = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  ...OFFICER_GRADES,
  ...PRIOR_ENLISTED_OFFICER_GRADES,
];

// DoD pay table YOS breakpoints (years of service)
export const YOS_BREAKPOINTS = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40] as const;
export type YearsOfService = typeof YOS_BREAKPOINTS[number];

export type DependencyStatus = 'without' | 'with';

// Grade dropdown labels for UI (E-4 shows SPC/CPL · Cpl · PO3 · SrA · Spc4), all five
// services in DoD order. Built from src/data/ranks/rankTitles.ts (the one source for
// rank names); never type a label here.
export const RANK_DISPLAY: Readonly<Record<PayGrade, string>> = RANK_LABELS;
