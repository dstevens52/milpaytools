/**
 * Data for the per-station BAH share images (build W2): the 1200×630 link
 * preview every CONUS station page uses as its og:image / twitter:image, and the
 * 1080×1350 portrait image (the realtor kit image, build W3). Both are rendered
 * by src/app/api/bah-image/[slug]/route.tsx from this one object, so the two
 * images can never disagree.
 *
 * Every figure comes from the BAH data modules through src/lib/calculations/bah.ts.
 * The year comes from src/data/bah/current.ts: the release-day switch there flips
 * every image (and, through the `y` URL param, busts CDN and social caches).
 *
 * Wording follows the station page (src/app/bah/[slug]/page.tsx):
 *  - change: "+$21 (+1.2%) from 2025", "−$66 (−3.4%) from 2025", "Unchanged from 2025"
 *    (the page's rose / fell / unchanged; "−" is the page's minus sign).
 *  - a temporary increase in the current year (Dyess/TX270, 2026) or the prior
 *    year (TX270 after the 2027 flip, where the page says the temporary rates
 *    ended): the change is left out and the image says "See page for details".
 *    A bare "+26.1%" with no expiry next to it would mislead.
 *  - effective date: the page's label — "January 1, {year}", or
 *    "{date} (DTMO mid-year change)" for an MHA DTMO changed mid-year.
 *
 * SERVER / BUILD ONLY (reads the full BAH dataset).
 */

import { DUTY_STATIONS, type DutyStation } from '@/data/duty-stations/stations';
import {
  CURRENT_BAH_YEAR,
  PRIOR_BAH_YEAR,
  getBahMidYearChange,
  getMHACode,
  getMHARatesForYear,
  isBahYear,
  priorYearMhaForZip,
} from '@/lib/calculations/bah';
import { formatBahDate, type BahMidYearChange } from '@/data/bah/midYear';
import { formatCurrency } from '@/lib/utils';

/** Bump when the rendered design changes (social sites cache images by URL). */
export const BAH_SHARE_IMAGE_VERSION = 1;

export const BAH_SHARE_FORMATS = {
  preview: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
} as const;
export type BahShareFormat = keyof typeof BAH_SHARE_FORMATS;

/** Pay grades in the portrait table (with dependents). Data keys, not rank titles. */
export const BAH_SHARE_GRADES = ['E-3', 'E-5', 'E-7', 'O-1', 'O-3', 'O-5'] as const;

/**
 * Where the figures come from. LIVE_BAH_SHARE_SOURCE reads the registered data
 * for the years in current.ts; tests pass a stand-in (e.g. a mocked 2027) to
 * prove the year flip needs no other edit.
 */
export interface BahShareSource {
  year: string;
  priorYear: string;
  /** The station ZIP's MHA in `year`. */
  mhaForZip(zip: string): string | null;
  /** The MHA the ZIP was paid under in `priorYear`. */
  priorMhaForZip(zip: string): string | null;
  /** With-dependents monthly rates for an MHA in a year, or null. */
  ratesWithDeps(mha: string, year: string): Record<string, number> | null;
  /** DTMO mid-year change for an MHA in a year, or null. */
  midYearChange(mha: string, year: string): BahMidYearChange | null;
}

export const LIVE_BAH_SHARE_SOURCE: BahShareSource = {
  year: CURRENT_BAH_YEAR,
  priorYear: PRIOR_BAH_YEAR,
  mhaForZip: (zip) => getMHACode(zip),
  priorMhaForZip: (zip) => priorYearMhaForZip(zip),
  ratesWithDeps: (mha, year) => (isBahYear(year) ? getMHARatesForYear(mha, true, year) : null),
  midYearChange: (mha, year) => (isBahYear(year) ? getBahMidYearChange(mha, year) : null),
};

export interface BahShareChange {
  abs: number;
  pct: number;
  /** "+$21 (+1.2%)", "−$66 (−3.4%)" or "Unchanged". */
  text: string;
}

export interface BahShareRow {
  grade: string;
  rate: number;
  rateText: string;
  /** Null when the prior-year rate is missing. */
  change: BahShareChange | null;
}

export interface BahShareData {
  slug: string;
  name: string;
  year: string;
  priorYear: string;
  mhaCode: string;
  /** "Fort Bragg BAH 2026" */
  headline: string;
  e5: BahShareRow;
  /**
   * The line under the E-5 rate: "+$21 (+1.2%) from 2025", "Unchanged from 2025",
   * "See page for details" (temporary increase), or null (no prior-year rate).
   */
  changeLine: string | null;
  /** False for a temporary-increase station: the portrait table shows rates only. */
  showChanges: boolean;
  rows: BahShareRow[];
  /** "January 1, 2026" or "May 16, 2026 (DTMO mid-year change)" — the page's label. */
  effectiveLabel: string;
  /** "milpaytools.com/bah/fort-bragg" */
  pageLabel: string;
}

const MINUS = '−';

function changeOf(current: number, prior: number | undefined): BahShareChange | null {
  if (prior === undefined || prior <= 0) return null;
  const abs = current - prior;
  const pct = (abs / prior) * 100;
  if (abs === 0) return { abs, pct: 0, text: 'Unchanged' };
  const sign = abs > 0 ? '+' : MINUS;
  return { abs, pct, text: `${sign}${formatCurrency(Math.abs(abs))} (${sign}${Math.abs(pct).toFixed(1)}%)` };
}

/** Stations that get these images: CONUS only (overseas pages have no BAH rates). */
export function bahShareStations(): DutyStation[] {
  return DUTY_STATIONS.filter((s) => !s.oconus);
}

export function bahShareData(
  slug: string,
  source: BahShareSource = LIVE_BAH_SHARE_SOURCE,
): BahShareData | null {
  const station = bahShareStations().find((s) => s.slug === slug);
  if (!station) return null;
  const mhaCode = source.mhaForZip(station.zip);
  if (!mhaCode) return null;
  const rates = source.ratesWithDeps(mhaCode, source.year);
  if (!rates || rates['E-5'] === undefined) return null;
  const priorMha = source.priorMhaForZip(station.zip) ?? mhaCode;
  const priorRates = source.ratesWithDeps(priorMha, source.priorYear);

  const rows: BahShareRow[] = BAH_SHARE_GRADES.filter((g) => rates[g] !== undefined).map((grade) => ({
    grade,
    rate: rates[grade],
    rateText: formatCurrency(rates[grade]),
    change: changeOf(rates[grade], priorRates?.[grade]),
  }));
  const e5 = rows.find((r) => r.grade === 'E-5')!;

  const currentMidYear = source.midYearChange(mhaCode, source.year);
  const priorMidYear = source.midYearChange(priorMha, source.priorYear);
  const temporary = Boolean(currentMidYear?.temporary || priorMidYear?.temporary);

  let changeLine: string | null = null;
  if (temporary) changeLine = 'See page for details';
  else if (e5.change) changeLine = `${e5.change.text} from ${source.priorYear}`;

  return {
    slug: station.slug,
    name: station.name,
    year: source.year,
    priorYear: source.priorYear,
    mhaCode,
    headline: `${station.name} BAH ${source.year}`,
    e5,
    changeLine,
    showChanges: !temporary && rows.some((r) => r.change !== null),
    rows,
    effectiveLabel: currentMidYear
      ? `${formatBahDate(currentMidYear.effective)} (DTMO mid-year change)`
      : `January 1, ${source.year}`,
    pageLabel: `milpaytools.com/bah/${station.slug}`,
  };
}

/** Relative image URL. `y` (the BAH year) busts CDN and social caches on the year flip. */
export function bahShareImageUrl(
  slug: string,
  format: BahShareFormat,
  year: string = CURRENT_BAH_YEAR,
): string {
  return `/api/bah-image/${slug}?format=${format}&y=${year}&v=${BAH_SHARE_IMAGE_VERSION}`;
}

/** The openGraph/twitter `images` array for a CONUS station page. */
export function bahShareOgImages(slug: string) {
  const { width, height } = BAH_SHARE_FORMATS.preview;
  return [{ url: bahShareImageUrl(slug, 'preview'), width, height }];
}

/** Download filename: fort-bragg-bah-2026.png (portrait), fort-bragg-bah-2026-preview.png. */
export function bahShareFilename(data: Pick<BahShareData, 'slug' | 'year'>, format: BahShareFormat): string {
  return `${data.slug}-bah-${data.year}${format === 'preview' ? '-preview' : ''}.png`;
}
