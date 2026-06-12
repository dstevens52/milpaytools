/**
 * Single source of truth for /api/og social-share image references.
 *
 * Every page builds its og:image / twitter:image through ogImage() so the
 * canvas dimensions (1200×630) and cache-busting version stay in lockstep
 * with the route's actual output. Bump OG_VERSION whenever the rendered
 * design changes — Facebook/LinkedIn key their image caches on the URL.
 */

export const OG_VERSION = 3;
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgType = 'home' | 'calculator' | 'guide' | 'blog' | 'station' | 'default';

export interface OgImageParams {
  type: OgType;
  title: string;
  /** Optional one-line subline (calculator value-prop, blog dek, etc.) */
  sub?: string;
}

/** Build the relative /api/og URL for a page (querystring-encoded). */
export function ogImageUrl({ type, title, sub }: OgImageParams): string {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('title', title);
  if (sub) params.set('sub', sub);
  params.set('v', String(OG_VERSION));
  return `/api/og?${params.toString()}`;
}

/**
 * The openGraph/twitter `images` array for a page's metadata export.
 * Width/height match the route's real output — keep them in sync.
 */
export function ogImage(params: OgImageParams) {
  return [{ url: ogImageUrl(params), width: OG_WIDTH, height: OG_HEIGHT }];
}
