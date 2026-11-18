/**
 * /va-disability-rates — every word and figure the page shows, from the status
 * file and the rate tables. Two modes, from ONE field
 * (src/data/va-rates/2027-status.ts → status):
 *
 *   pending   — VA hasn't published its 2027 tables (status 'law-pending' or
 *               'law-enacted'). Dated status box, then the full 2026 table.
 *               No 2027 dollar figure anywhere.
 *   published — status 'published' with src/data/va-rates/2027.ts filled.
 *               The 2027 table, with the change from 2026 in every cell.
 *
 * Flipping the status changes the title, H1, description, status box, table
 * and FAQ with no edit to the page. Pure functions (config passed in) so tests
 * can render both modes.
 */

import type { VADependentRates } from '@/data/types';
import { VA_RATES_2027_STATUS, type VaRates2027StatusConfig } from '@/data/va-rates/2027-status';
import { VA_2027_EFFECTIVE_DATE, VA_RATES_2026, vaRates2027, type VaRatesYear } from '@/data/va-rates/registry';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';
import { formatVaDate, vaFirstPaymentText } from '@/lib/calculations/vaRatesStatus';

export type VaRatesPageMode = 'pending' | 'published';

export const VA_RATES_PAGE_PATH = '/va-disability-rates';
export const VA_CALCULATOR_PATH = '/calculators/va-disability';

export function vaRatesPageMode(published2027: VaRatesYear | null = vaRates2027()): VaRatesPageMode {
  return published2027 ? 'published' : 'pending';
}

/** <title> (absolute; the root template would push it past SERP width). */
export function vaRatesPageTitle(mode: VaRatesPageMode): string {
  return mode === 'pending'
    ? 'VA Disability Rates 2027: COLA Status and 2026 Pay Chart'
    : 'VA Disability Rates 2027: Official Pay Chart by Rating';
}

export function vaRatesPageH1(mode: VaRatesPageMode): string {
  return mode === 'pending'
    ? 'VA Disability Compensation Rates: 2027 Status and 2026 Rates'
    : 'VA Disability Compensation Rates 2027';
}

export function vaRatesPageDescription(mode: VaRatesPageMode, published2027: VaRatesYear | null = vaRates2027()): string {
  if (mode === 'pending' || !published2027) {
    return '2027 VA disability rates: what is official so far, the date they take effect, and the full 2026 compensation table by rating and dependents until VA publishes.';
  }
  return `Official 2027 VA disability compensation rates by rating and dependents, effective ${formatVaDate(published2027.effectiveDate)} (${published2027.colaPercent}% COLA), with the change from 2026 for every amount.`;
}

// ─── Status box ──────────────────────────────────────────────────────────────

export interface VaRatesStatusBox {
  label: string;
  official: string[];
  pending: string[];
  effective: string;
  payment: string;
  checked: string;
}

/** Pending mode only: what's official, what's pending, the effective date, "checked {date}". Plain text, no $. */
export function vaRatesStatusBox(config: VaRates2027StatusConfig = VA_RATES_2027_STATUS): VaRatesStatusBox {
  const checkedDate = formatVaDate(config.checkedDate);
  const ssa = `${RETIREE_COLA_2027.percent}%`;
  const enacted = config.status !== 'law-pending';
  const official = [
    `The 2026 rates in the table below: effective ${formatVaDate(VA_RATES_2026.effectiveDate)} (${VA_RATES_2026.colaPercent}% COLA), as published by VA.`,
    `The Social Security COLA for 2027: ${ssa}, announced ${formatVaDate(RETIREE_COLA_2027.announcedDate)}. The veterans' COLA bill ties VA's increase to it.`,
  ];
  if (enacted) {
    official.push(`The annual veterans' COLA law${config.lawCitation ? ` (${config.lawCitation})` : ''} is enacted.`);
  }
  const pending = [
    ...(enacted ? [] : [`The annual veterans' COLA law: ${config.billCitation} ${config.pendingDetail}.`]),
    `VA's 2027 rate tables: not published as of ${checkedDate}. This page shows only VA's published figures, so it has no 2027 dollar amounts yet.`,
  ];
  return {
    label: enacted ? '2027 COLA enacted · VA tables not yet published' : '2027 COLA pending · VA tables not yet published',
    official,
    pending,
    effective: `The 2027 rates take effect ${formatVaDate(VA_2027_EFFECTIVE_DATE)}.`,
    payment: vaFirstPaymentText(VA_2027_EFFECTIVE_DATE, !enacted),
    checked: `Checked ${checkedDate}.`,
  };
}

// ─── Rate tables ─────────────────────────────────────────────────────────────

type Col = keyof VADependentRates;

export interface RateColumn {
  key: Col;
  label: string;
}

/** 30%–100%, no children (VA's first table). */
export const NO_CHILD_COLUMNS: RateColumn[] = [
  { key: 'veteranAlone', label: 'Veteran alone' },
  { key: 'withSpouse', label: 'With spouse' },
  { key: 'withSpouseAnd1Parent', label: 'Spouse + 1 parent' },
  { key: 'withSpouseAnd2Parents', label: 'Spouse + 2 parents' },
  { key: 'with1Parent', label: '1 parent' },
  { key: 'with2Parents', label: '2 parents' },
];

/** 30%–100%, with one child under 18 (VA's second table). */
export const WITH_CHILD_COLUMNS: RateColumn[] = [
  { key: 'with1Child', label: '1 child' },
  { key: 'withSpouseAnd1Child', label: 'Spouse + 1 child' },
  { key: 'withSpouseAnd1ChildAnd1Parent', label: 'Spouse, 1 child + 1 parent' },
  { key: 'withSpouseAnd1ChildAnd2Parents', label: 'Spouse, 1 child + 2 parents' },
  { key: 'with1ChildAnd1Parent', label: '1 child + 1 parent' },
  { key: 'with1ChildAnd2Parents', label: '1 child + 2 parents' },
];

/** Added amounts, 30%–100%. */
export const ADDED_COLUMNS: RateColumn[] = [
  { key: 'additionalChild', label: 'Each additional child under 18' },
  { key: 'additionalSchoolChild', label: 'Each child 18–23 in school' },
  { key: 'spouseAA', label: 'Spouse receiving Aid & Attendance' },
];

export const FLAT_RATINGS = [10, 20] as const;
export const DEPENDENT_RATINGS = [30, 40, 50, 60, 70, 80, 90, 100] as const;

export interface RateCell {
  amount: number;
  /** Change from the prior year's cell; null in pending mode. */
  change: number | null;
}

/** The rate year the page's tables show. */
export function vaRatesPageYear(published2027: VaRatesYear | null = vaRates2027()): VaRatesYear {
  return published2027 ?? VA_RATES_2026;
}

export function rateCell(rating: number, col: Col, published2027: VaRatesYear | null = vaRates2027()): RateCell {
  const year = vaRatesPageYear(published2027);
  const amount = year.table[rating][col];
  const change = published2027 ? Math.round((amount - VA_RATES_2026.table[rating][col]) * 100) / 100 : null;
  return { amount, change };
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const CALC = `[VA disability calculator](${VA_CALCULATOR_PATH})`;

/**
 * Three FAQs, one array for the visible list and the FAQPage schema. Each
 * answer ends by naming the combined-rating calculator.
 */
export function vaRatesPageFaqs(
  config: VaRates2027StatusConfig = VA_RATES_2027_STATUS,
  published2027: VaRatesYear | null = vaRates2027(config),
): { question: string; answer: string }[] {
  const effective = formatVaDate(VA_2027_EFFECTIVE_DATE);
  const checked = formatVaDate(config.checkedDate);
  const ssa = `${RETIREE_COLA_2027.percent}%`;
  const lawPending = config.status === 'law-pending';

  let when: string;
  if (published2027) {
    when = `The 2027 rates take effect ${effective}. VA has published its 2027 tables (a ${published2027.colaPercent}% COLA), shown above.`;
  } else if (lawPending) {
    when = `${effective}, once the annual veterans' COLA law is signed. As of ${checked}, ${config.billCitation} ${config.pendingDetail}, and VA hasn't published its 2027 rate tables. The bill ties the increase to the Social Security COLA, ${ssa}.`;
  } else {
    when = `${effective}. The annual veterans' COLA law${config.lawCitation ? ` (${config.lawCitation})` : ''} raises compensation by the Social Security COLA, ${ssa}. As of ${checked}, VA hasn't published its 2027 rate tables.`;
  }

  return [
    {
      question: 'When do the 2027 VA disability rates take effect?',
      answer: `${when} To see how your ratings combine, use the ${CALC}.`,
    },
    {
      question: 'When does the first payment at the 2027 rates arrive?',
      answer: `VA pays each month's compensation on the 1st of the following month. ${vaFirstPaymentText(VA_2027_EFFECTIVE_DATE, lawPending && !published2027)} The ${CALC} shows the monthly amount for your combined rating and dependents.`,
    },
    {
      question: 'Is the VA disability COLA increase automatic?',
      answer: `Yes. Veterans already receiving compensation don't apply for the cost-of-living increase: VA applies the new rates to current awards from the effective date. The amount still depends on your combined rating and dependents; the ${CALC} works out the combined rating.`,
    },
  ];
}
