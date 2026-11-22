import type { PayGrade } from '@/types/military';
import { gradeToParam } from '@/lib/urlParams';

// V3b VA funnel: the prefilled "VA loan vs. this BAH" line under the BAH and
// PCS calculator results. It shows wherever the ZIP lookup returns a BAH rate
// (CONUS, Alaska and Hawaii); never for a territory (OHA), overseas or a ZIP
// that isn't found. Test plan and read-out: docs/seo/2026-11-va-funnel-test.md.

/**
 * The VA loan calculator with the BAH comparison on and filled from a lookup:
 * `/calculators/va-loan?bah=yes&zip=78234&rank=e5&dep=yes`. The ZIP stays out
 * of GA (cleanGaUrl drops `zip`).
 */
export function vaLoanBahHref(zip: string, grade: PayGrade, hasDependents: boolean): string {
  const p = new URLSearchParams();
  p.set('bah', 'yes');
  p.set('zip', zip);
  p.set('rank', gradeToParam(grade));
  p.set('dep', hasDependents ? 'yes' : 'no');
  return `/calculators/va-loan?${p.toString()}`;
}
