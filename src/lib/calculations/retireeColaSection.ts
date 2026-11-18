/**
 * Copy for the /pay/raise "2027 COLA for military retired pay" section (S8).
 * Every figure comes from RETIREE_COLA_2027_SECTION (src/data/retiree-cola/2027.ts);
 * an item that's null there (not published by DFAS yet) produces no copy.
 */
import {
  RETIREE_COLA_2027_SECTION,
  type OfficialSource,
  type RetireeColaSection,
} from '@/data/retiree-cola/2027';
import { formatIsoDate, formatPercent } from '@/lib/calculations/payRaise';

export const RETIREE_COLA_SECTION_ID = 'retiree-cola';

export interface RetireeColaCopy {
  heading: string;
  /** Paragraphs in order; each is plain text with figures filled in. */
  paragraphs: { key: string; text: string }[];
  /** Shown while DFAS hasn't posted its notice (timing still null). */
  pendingNote: string | null;
  sources: OfficialSource[];
}

/** Round to 0.1 point, the precision COLAs are published at. */
const tenth = (n: number) => Math.round(n * 10) / 10;

export function retireeColaSectionCopy(s: RetireeColaSection = RETIREE_COLA_2027_SECTION): RetireeColaCopy {
  const pct = formatPercent(s.percent.value);
  const paragraphs: RetireeColaCopy['paragraphs'] = [
    {
      key: 'percent',
      text: `Military retired pay doesn't get the pay raise. It gets a cost-of-living adjustment (COLA) instead. The ${s.year} COLA is ${pct}, the CPI-W increase Social Security announced for benefits starting with December ${s.year - 1}.`,
    },
  ];
  const sources: OfficialSource[] = [s.percent.source];

  if (s.timing) {
    paragraphs.push({
      key: 'timing',
      text: `It takes effect ${formatIsoDate(s.timing.effectiveDate)}. Retirees first see it in the payment on ${formatIsoDate(s.timing.firstRetiredPayDate)}; Survivor Benefit Plan annuitants on ${formatIsoDate(s.timing.firstAnnuitantPayDate)}.`,
    });
    sources.push(s.timing.source);
  }

  if (s.redux) {
    const redux = formatPercent(tenth(s.percent.value - s.redux.minusPoints));
    const points = s.redux.minusPoints === 1 ? '1 percentage point' : `${s.redux.minusPoints} percentage points`;
    paragraphs.push({
      key: 'redux',
      text: `If you took the Career Status Bonus (CSB/REDUX), DFAS reduces each COLA by ${points}: ${redux} for ${s.year}. At age 62 your retired pay is restored to the High-3 amount, but the COLAs after that stay at the reduced rate.`,
    });
    sources.push(s.redux.source);
  }

  if (s.partialFirstYear) {
    paragraphs.push({
      key: 'partial',
      text: `If your retired pay started during ${s.year - 1}, your first COLA is smaller. DFAS's table: ${s.partialFirstYear.rows
        .map((r) => `${r.retiredPayStarted}: ${formatPercent(r.percent)}${r.reduxPercent !== undefined ? ` (REDUX ${formatPercent(r.reduxPercent)})` : ''}`)
        .join('; ')}.`,
    });
    sources.push(s.partialFirstYear.source);
  }

  return {
    heading: `${s.year} COLA for military retired pay`,
    paragraphs,
    pendingNote: s.timing
      ? null
      : `DFAS hasn't posted its ${s.year} COLA notice yet (checked ${formatIsoDate(s.checked)}). The payment dates and other details go here once it does.`,
    sources,
  };
}
