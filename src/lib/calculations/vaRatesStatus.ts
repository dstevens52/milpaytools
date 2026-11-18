/**
 * Status-driven wording about the VA compensation rate year. Plain text, no
 * dollar figures: every sentence here must stay true while the 2027 table is
 * unpublished. Data: src/data/va-rates/2027-status.ts and registry.ts.
 *
 * Client-safe (no heavy imports).
 */

import { VA_RATES_2027_STATUS, type VaRates2027StatusConfig } from '@/data/va-rates/2027-status';
import {
  CURRENT_VA_RATES,
  VA_2027_EFFECTIVE_DATE,
  vaRates2027,
  type VaRatesYear,
} from '@/data/va-rates/registry';
import { RETIREE_COLA_2027 } from '@/data/retiree-cola/2027';

/** "December 1, 2026" from an ISO date (UTC, no clock dependence). */
export function formatVaDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "December 2026" — the month a rate year's effective date falls in. */
function monthYear(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * When the first payment at a new rate arrives. VA pays each month's
 * compensation after the month ends, on the 1st of the next month; when the 1st
 * is a weekend or legal holiday it pays on the business day before
 * (38 U.S.C. § 5120(e)). January 1 is always a holiday, so the December payment
 * — the first at the new rates — arrives at the end of December.
 */
export function vaFirstPaymentText(effectiveDate: string): string {
  return `VA pays each month's compensation after the month ends, so the first payment at the new rates is the one for ${monthYear(effectiveDate)}. VA normally pays on the 1st of the next month; because January 1 is a federal holiday, that payment arrives on the last business day of December (38 U.S.C. § 5120(e)).`;
}

/** "the 2026 rates, effective December 1, 2025 (2.8% COLA)" */
export function vaRatesYearPhrase(rates: VaRatesYear = CURRENT_VA_RATES): string {
  return `the ${rates.year} rates, effective ${formatVaDate(rates.effectiveDate)} (${rates.colaPercent}% COLA)`;
}

export interface VaRatesNotice {
  heading: string;
  body: string;
}

/**
 * The dated notice shown while the site still uses the 2026 table. null once
 * the 2027 table is current.
 */
export function vaRatesNotice(
  config: VaRates2027StatusConfig = VA_RATES_2027_STATUS,
  current: VaRatesYear = CURRENT_VA_RATES,
  published2027: VaRatesYear | null = vaRates2027(config),
): VaRatesNotice | null {
  if (current.year === '2027') return null;

  const effective = formatVaDate(VA_2027_EFFECTIVE_DATE);
  const checked = formatVaDate(config.checkedDate);
  const ssa = `${RETIREE_COLA_2027.percent}%`;
  const using = `This site shows only VA's published figures, so the amounts on this page use ${vaRatesYearPhrase(current)}.`;
  const timing = vaFirstPaymentText(VA_2027_EFFECTIVE_DATE);

  if (config.status === 'published' && published2027) {
    return {
      heading: `2027 VA disability rates: published, effective ${effective}`,
      body: `VA has published its 2027 rate tables (${published2027.colaPercent}% COLA), effective ${effective}. This calculator switches to them on that date. ${timing}`,
    };
  }

  if (config.status === 'law-enacted') {
    const law = config.lawCitation ? ` (${config.lawCitation})` : '';
    return {
      heading: `2027 VA disability rates: COLA enacted, table not yet published (checked ${checked})`,
      body: `The annual veterans' COLA law${law} raises compensation by the Social Security COLA (${ssa}), effective ${effective}. As of ${checked}, VA hasn't published its 2027 rate tables. ${using} ${timing}`,
    };
  }

  return {
    heading: `2027 VA disability rates: not yet published (checked ${checked})`,
    body: `The annual veterans' COLA bill (${config.billCitation}) ${config.pendingDetail}. It ties the increase to the Social Security COLA (${ssa}), effective ${effective}. As of ${checked}, VA hasn't published its 2027 rate tables. ${using} ${timing}`,
  };
}

/** One short clause for the calculator's result caption; null once 2027 rates are current. */
export function vaRatesShortStatus(
  config: VaRates2027StatusConfig = VA_RATES_2027_STATUS,
  current: VaRatesYear = CURRENT_VA_RATES,
): string | null {
  if (current.year === '2027') return null;
  return config.status === 'published' && vaRates2027(config)
    ? `2027 rates take effect ${formatVaDate(VA_2027_EFFECTIVE_DATE)}`
    : '2027 rates not yet published';
}
