// Copy for the overseas note in the calculators' station input
// (BaseSearchInput) and the COLA page's "Stationed overseas?" line.
//
// No numbers, no rates, no directives: every string here runs through the
// currency and voice rules in scripts/lint-oconus.ts (stationSearchLintCopy).

import { EXPLAINER_SOURCES } from './sharedCopy';

/** What the station input recognized as overseas. */
export type OverseasMatch =
  | { kind: 'station'; name: string; shortName: string; slug: string } // has a v2 guide
  | { kind: 'installation'; name: string } // overseas base with no v2 guide
  | { kind: 'mail-zip' } // APO/FPO/DPO ZIP
  | { kind: 'mail-text' }; // the words APO / FPO / DPO

/** Which allowance the host calculator prices. */
export type OverseasVariant = 'housing' | 'cola';

export type OverseasNoteLink = { label: string; href: string; external: boolean };
export type OverseasNoteCopy = { headline: string; body: string; links: OverseasNoteLink[] };

export const OVERSEAS_BROWSE_HREF = '/bah#oconus';

// DTMO program pages, reused from the verified shared explainer sources.
function sourceUrl(label: string): string {
  const s = EXPLAINER_SOURCES.find((l) => l.label === label);
  if (!s) throw new Error(`stationSearchCopy: shared source "${label}" not found`);
  return s.url;
}
const DTMO_OHA_URL = sourceUrl('DTMO OHA program page');
const DTMO_COLA_URL = sourceUrl('DTMO OCONUS COLA program page');

const BROWSE_LABEL = 'Browse overseas station guides →';
const OHA_DTMO_LABEL = 'Look up OHA on DTMO →';
const COLA_DTMO_LABEL = 'Look up overseas COLA on DTMO →';

const HOUSING_BODY_STATION =
  "Overseas stations use OHA (Overseas Housing Allowance) instead of BAH, so this calculator can't price housing there.";
const HOUSING_BODY_GENERIC = "Overseas stations use OHA instead of BAH, so this calculator can't price housing there.";
const COLA_BODY =
  "Overseas stations get overseas COLA instead of CONUS COLA. DTMO sets it separately, so this calculator can't price it.";

const MAIL_ZIP_HEADLINE = 'That looks like an overseas military mail ZIP.';
const MAIL_TEXT_HEADLINE = 'That looks like an overseas military mail address.';

function stationHeadline(name: string): string {
  return `${name} is an overseas station.`;
}

export function overseasNoteCopy(match: OverseasMatch, variant: OverseasVariant): OverseasNoteCopy {
  const headline =
    match.kind === 'station' || match.kind === 'installation'
      ? stationHeadline(match.name)
      : match.kind === 'mail-zip'
        ? MAIL_ZIP_HEADLINE
        : MAIL_TEXT_HEADLINE;

  const body =
    variant === 'cola' ? COLA_BODY : match.kind === 'station' ? HOUSING_BODY_STATION : HOUSING_BODY_GENERIC;

  const links: OverseasNoteLink[] =
    match.kind === 'station'
      ? [{ label: `See the ${match.shortName} station guide →`, href: `/bah/${match.slug}`, external: false }]
      : [
          { label: BROWSE_LABEL, href: OVERSEAS_BROWSE_HREF, external: false },
          variant === 'cola'
            ? { label: COLA_DTMO_LABEL, href: DTMO_COLA_URL, external: true }
            : { label: OHA_DTMO_LABEL, href: DTMO_OHA_URL, external: true },
        ];

  return { headline, body, links };
}

/** CONUS COLA page: one line near the top of the input card. */
export const COLA_OVERSEAS_LINE = {
  text: 'Stationed overseas? Overseas COLA is a separate allowance set by DTMO.',
  linkLabel: 'See overseas station guides →',
  href: OVERSEAS_BROWSE_HREF,
};

/**
 * Every rendered string, for scripts/lint-oconus.ts. `names` are the station
 * and installation names the note can show, so the lint covers the copy as
 * users see it, not just the templates.
 */
export function stationSearchLintCopy(matches: OverseasMatch[]): { field: string; text: string }[] {
  const out: { field: string; text: string }[] = [
    { field: 'COLA_OVERSEAS_LINE.text', text: COLA_OVERSEAS_LINE.text },
    { field: 'COLA_OVERSEAS_LINE.linkLabel', text: COLA_OVERSEAS_LINE.linkLabel },
  ];
  for (const m of matches) {
    for (const v of ['housing', 'cola'] as const) {
      const c = overseasNoteCopy(m, v);
      const tag = `${m.kind}${'name' in m ? `:${m.name}` : ''}/${v}`;
      out.push({ field: `${tag}.headline`, text: c.headline });
      out.push({ field: `${tag}.body`, text: c.body });
      c.links.forEach((l, i) => out.push({ field: `${tag}.links[${i}]`, text: l.label }));
    }
  }
  return out;
}
