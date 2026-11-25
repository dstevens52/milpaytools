import { RANK_TITLES, rankHelperText } from '@/data/ranks/rankTitles';
import type { PayGrade } from '@/types/military';

/**
 * The helper line under every grade select: the selected grade's rank in each
 * service, full title and abbreviation ("Army: Specialist (SPC) or Corporal (CPL) ·
 * Marine Corps: Corporal (Cpl) · …"). Text from src/data/ranks/rankTitles.ts.
 * Renders nothing for a value that isn't a pay grade.
 */
export function RankHelper({
  grade,
  id,
  className = '',
}: {
  grade: string;
  id?: string;
  className?: string;
}) {
  if (!Object.prototype.hasOwnProperty.call(RANK_TITLES, grade)) return null;
  return (
    <p id={id} data-testid="rank-helper" className={`text-xs leading-snug text-zinc-500 ${className}`}>
      {rankHelperText(grade as PayGrade)}
    </p>
  );
}
