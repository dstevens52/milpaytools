/**
 * Site chrome on the BAH kit pages (/bah/kit/[slug], build W3). Realtors paste
 * from these pages under their own name, so the page carries no mention of
 * loans or lenders and no email capture (Dan, 2026-11-27). On kit pages only:
 *  - Nav (header) and Footer drop the VA home-loan links below;
 *  - Footer drops the "Built by …" credit line and the email signup.
 * The logo, the link home and the rest of the navigation stay.
 * tests/e2e/bah-kit.spec.ts checks both sides (absent on a kit page, present on
 * /bah/fort-bragg and the homepage).
 *
 * Client-safe: no imports.
 */

/** True on a kit page. */
export function isKitPagePath(pathname: string | null | undefined): boolean {
  return !!pathname && pathname.startsWith('/bah/kit/');
}

/** Header and footer links hidden on kit pages: every VA home-loan page. */
export const KIT_HIDDEN_LINK_HREFS: ReadonlySet<string> = new Set([
  '/calculators/va-loan',
  '/calculators/va-entitlement',
  '/calculators/va-refinance',
  '/guides/va-home-loans',
]);

/** `links` as shown on this path: unchanged everywhere except kit pages. */
export function kitVisibleLinks<T extends { href: string }>(links: readonly T[], pathname: string | null | undefined): T[] {
  return isKitPagePath(pathname) ? links.filter((l) => !KIT_HIDDEN_LINK_HREFS.has(l.href)) : [...links];
}
