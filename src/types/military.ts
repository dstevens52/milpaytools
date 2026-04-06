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

export type PayGrade = EnlistedGrade | WarrantGrade | OfficerGrade;

export const ENLISTED_GRADES: EnlistedGrade[] = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
];
export const WARRANT_GRADES: WarrantGrade[] = ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'];
export const OFFICER_GRADES: OfficerGrade[] = [
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10',
];
export const ALL_PAY_GRADES: PayGrade[] = [
  ...ENLISTED_GRADES,
  ...WARRANT_GRADES,
  ...OFFICER_GRADES,
];

// DoD pay table YOS breakpoints (years of service)
export const YOS_BREAKPOINTS = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40] as const;
export type YearsOfService = typeof YOS_BREAKPOINTS[number];

export type DependencyStatus = 'without' | 'with';

// Rank display names for UI (Army-centric, used as fallback)
export const RANK_DISPLAY: Record<PayGrade, string> = {
  'E-1': 'E-1 (PVT/SR/Amn/Pvt)',
  'E-2': 'E-2 (PV2/FA/A1C/PFC)',
  'E-3': 'E-3 (PFC/SA/SrA/LCpl)',
  'E-4': 'E-4 (SPC/Cpl/SN/Cpl)',
  'E-5': 'E-5 (SGT/PO2/SSgt)',
  'E-6': 'E-6 (SSG/PO1/TSgt)',
  'E-7': 'E-7 (SFC/CPO/MSgt)',
  'E-8': 'E-8 (MSG/1SG/SCPO)',
  'E-9': 'E-9 (SGM/CSM/MCPO)',
  'W-1': 'W-1 (WO1)',
  'W-2': 'W-2 (CW2)',
  'W-3': 'W-3 (CW3)',
  'W-4': 'W-4 (CW4)',
  'W-5': 'W-5 (CW5)',
  'O-1': 'O-1 (2LT/ENS/2ndLt)',
  'O-2': 'O-2 (1LT/LTJG/1stLt)',
  'O-3': 'O-3 (CPT/LT/Capt)',
  'O-4': 'O-4 (MAJ/LCDR/Maj)',
  'O-5': 'O-5 (LTC/CDR/LtCol)',
  'O-6': 'O-6 (COL/CAPT/Col)',
  'O-7': 'O-7 (BG/RDML/BGen)',
  'O-8': 'O-8 (MG/RADM/MajGen)',
  'O-9': 'O-9 (LTG/VADM/LtGen)',
  'O-10': 'O-10 (GEN/ADM/Gen)',
};
