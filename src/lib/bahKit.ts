/**
 * The BAH kit page per CONUS station (build W3, /bah/kit/[slug]): the sentences
 * a realtor, blogger or relief society pastes under their own name, the credit
 * link, the share image links and the rate table data. The page
 * (src/app/bah/kit/[slug]/page.tsx) renders only what this returns.
 *
 * Every figure comes from the BAH data modules (through src/lib/bahShareImage.ts,
 * so the kit and its portrait image can never disagree) and the HUD rents paired
 * with the BAH year (src/lib/stationRent.ts). The years come from
 * src/data/bah/current.ts; tests pass a stand-in source (a mocked 2027) to prove
 * the release-day flip needs no other edit.
 *
 * Wording (approved by Dan, 2026-11-27): no possessives ("The 2026 BAH at Fort
 * Bragg for…"), factual only, no advice. Rate protection reuses
 * RATE_PROTECTION_RULE. The rent sentence states the HUD range and median and
 * whether the E-5 with-dependents rate is above, within or below it: nothing
 * about what that buys. Temporary increases (TX270) state the dates instead of
 * a bare percentage.
 *
 * SERVER / BUILD ONLY (reads the full BAH and FMR datasets).
 */

import { BAH_EFFECTIVE_NOTICE } from '@/data/bah/current';
import { formatBahDate, type BahMidYearChange } from '@/data/bah/midYear';
import { RATE_PROTECTION_RULE } from '@/data/bah/rateProtection';
import { getLocationDisplayName, getMHARatesForYear, isBahYear } from '@/lib/calculations/bah';
import type { PairedFmr } from '@/lib/calculations/fmr';
import { hudFmrSourceLabel } from '@/lib/rentCompare';
import { stationRent } from '@/lib/stationRent';
import { formatCurrency } from '@/lib/utils';
import {
  BAH_SHARE_FORMATS,
  LIVE_BAH_SHARE_SOURCE,
  bahShareData,
  bahShareFilename,
  bahShareImageUrl,
  bahShareStations,
  type BahShareSource,
} from '@/lib/bahShareImage';

const SITE = 'https://www.milpaytools.com';
export const KIT_SOURCE_DTMO = 'Source: DTMO, via MilPayTools.';
export const KIT_SOURCE_DTMO_HUD = 'Source: DTMO and HUD, via MilPayTools.';

/** Everything the kit reads. Extends the share-image source with what the kit adds. */
export interface BahKitSource extends BahShareSource {
  /** current.ts BAH_EFFECTIVE_NOTICE: the year's rates are published but not paid until January 1. */
  effectiveNotice: boolean;
  /** Without-dependents monthly rates for an MHA in a year, or null. */
  ratesWithoutDeps(mha: string, year: string): Record<string, number> | null;
  /** HUD 2-bedroom FMR paired with the BAH year (null = no rent row). */
  rent(mha: string, bahYear: string): PairedFmr | null;
  /** The ZIP's MHA display name, as the station page shows it (null = use the station's city). */
  mhaLabel(zip: string): string | null;
}

export const LIVE_BAH_KIT_SOURCE: BahKitSource = {
  ...LIVE_BAH_SHARE_SOURCE,
  effectiveNotice: BAH_EFFECTIVE_NOTICE,
  ratesWithoutDeps: (mha, year) => (isBahYear(year) ? getMHARatesForYear(mha, false, year) : null),
  rent: (mha, bahYear) =>
    stationRent(mha, { year: bahYear, priorYear: LIVE_BAH_SHARE_SOURCE.priorYear, effectiveNotice: BAH_EFFECTIVE_NOTICE }),
  mhaLabel: (zip) => getLocationDisplayName(zip),
};

/** Also the `item` value of the kit_copy event. */
export type BahKitSentenceId = 'headline' | 'protection' | 'rent';

export interface BahKitSentence {
  id: BahKitSentenceId;
  label: string;
  text: string;
}

export interface BahKitData {
  slug: string;
  name: string;
  year: string;
  priorYear: string;
  mhaCode: string;
  /** "Fayetteville, NC": the station page's MHA label. */
  mhaLabel: string;
  sentences: BahKitSentence[];
  /** The sentences joined by a blank line (the "Copy all" text). */
  allText: string;
  /** The rate table, as the station page passes it to CollapsibleRateTable. */
  table: {
    ratesW: Record<string, number>;
    ratesWO: Record<string, number>;
    ratesWPrev: Record<string, number>;
    ratesWOPrev: Record<string, number>;
  };
  /** "January 1, 2026" or "May 16, 2026 (DTMO mid-year change)". */
  effectiveLabel: string;
  image: { src: string; downloadHref: string; filename: string; width: number; height: number };
  credit: { url: string; linkText: string; html: string };
  /** "/bah/fort-bragg" */
  pageHref: string;
  /** "2-bedroom Fair Market Rent (HUD, FY2026)" when the rent sentence is shown, else null. */
  rentSourceLabel: string | null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function temporaryOf(change: BahMidYearChange | null): (BahMidYearChange & { temporary: NonNullable<BahMidYearChange['temporary']> }) | null {
  return change?.temporary ? (change as BahMidYearChange & { temporary: NonNullable<BahMidYearChange['temporary']> }) : null;
}

/** "above" / "within" / "below" the p25–p75 range. */
export function rentPosition(rate: number, range: { p25: number; p75: number }): 'above' | 'within' | 'below' {
  if (rate > range.p75) return 'above';
  if (rate < range.p25) return 'below';
  return 'within';
}

/** Stations with a kit page: CONUS stations whose ZIP has a rate (all 142 today). */
export function bahKitStations(source: BahKitSource = LIVE_BAH_KIT_SOURCE) {
  return bahShareStations().filter((s) => bahShareData(s.slug, source) !== null);
}

export function bahKitData(slug: string, source: BahKitSource = LIVE_BAH_KIT_SOURCE): BahKitData | null {
  const share = bahShareData(slug, source);
  if (!share) return null;
  const station = bahShareStations().find((s) => s.slug === slug)!;
  const { year, priorYear, mhaCode, name } = share;
  const priorMha = source.priorMhaForZip(station.zip) ?? mhaCode;
  const mhaLabel = source.mhaLabel(station.zip) ?? station.city;

  const currentTemp = temporaryOf(source.midYearChange(mhaCode, year));
  const priorTemp = temporaryOf(source.midYearChange(priorMha, priorYear));

  const e5 = share.e5;
  const lead = `The ${year} BAH at ${name} for an E-5 with dependents ${
    source.effectiveNotice ? `will be ${e5.rateText} a month starting January 1, ${year}` : `is ${e5.rateText} a month`
  }`;

  // ── Headline ──
  let headline: string;
  if (currentTemp) {
    headline = `${lead} (temporary rates effective ${formatBahDate(currentTemp.effective)}, through ${formatBahDate(currentTemp.temporary.expires)}).`;
  } else if (e5.change) {
    const prior = e5.rate - e5.change.abs;
    const priorRef = priorTemp
      ? `the temporary ${priorYear} rate of ${formatCurrency(prior)} (in effect through ${formatBahDate(priorTemp.temporary.expires)})`
      : priorYear;
    headline =
      e5.change.abs === 0
        ? `${lead}, unchanged from ${priorRef}.`
        : `${lead}, ${e5.change.abs > 0 ? 'up' : 'down'} ${formatCurrency(Math.abs(e5.change.abs))} (${Math.abs(e5.change.pct).toFixed(1)}%) from ${priorRef}.`;
  } else {
    headline = `${lead}.`;
  }

  const sentences: BahKitSentence[] = [{ id: 'headline', label: 'Headline', text: `${headline} ${KIT_SOURCE_DTMO}` }];

  // ── Rate protection: only where the E-5 with-dependents rate fell, and not from
  // or into a temporary increase (protection doesn't cover those). ──
  if (e5.change && e5.change.abs < 0 && !currentTemp && !priorTemp) {
    sentences.push({ id: 'protection', label: 'Rate protection', text: `${RATE_PROTECTION_RULE} ${KIT_SOURCE_DTMO}` });
  }

  // ── Rent: the HUD 2-bedroom FMR paired with this BAH year, where the MHA has a row. ──
  const rent = source.rent(mhaCode, year);
  let rentSourceLabel: string | null = null;
  if (rent && e5.rate > 0) {
    const r = rent.range;
    rentSourceLabel = hudFmrSourceLabel(rent.fmrYear);
    sentences.push({
      id: 'rent',
      label: 'Rent comparison',
      text: `Across the ${mhaLabel} area, ${rentSourceLabel} runs about ${formatCurrency(r.p25)}–${formatCurrency(r.p75)} a month (median ${formatCurrency(r.median)}). The ${year} BAH at ${name} for an E-5 with dependents (${e5.rateText}) is ${rentPosition(e5.rate, r)} that range. ${KIT_SOURCE_DTMO_HUD}`,
    });
  }

  const src = bahShareImageUrl(slug, 'portrait', year);
  const url = `${SITE}/bah/${slug}?utm_source=kit&utm_medium=realtor`;
  const linkText = `${name} BAH rates from MilPayTools`;

  return {
    slug,
    name,
    year,
    priorYear,
    mhaCode,
    mhaLabel,
    sentences,
    allText: sentences.map((s) => s.text).join('\n\n'),
    table: {
      ratesW: source.ratesWithDeps(mhaCode, year) ?? {},
      ratesWO: source.ratesWithoutDeps(mhaCode, year) ?? {},
      ratesWPrev: source.ratesWithDeps(priorMha, priorYear) ?? {},
      ratesWOPrev: source.ratesWithoutDeps(priorMha, priorYear) ?? {},
    },
    effectiveLabel: share.effectiveLabel,
    image: {
      src,
      downloadHref: `${src}&download=1`,
      filename: bahShareFilename(share, 'portrait'),
      ...BAH_SHARE_FORMATS.portrait,
    },
    credit: { url, linkText, html: `<a href="${escapeHtml(url)}">${escapeHtml(linkText)}</a>` },
    pageHref: `/bah/${slug}`,
    rentSourceLabel,
  };
}
