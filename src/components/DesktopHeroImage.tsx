import type { CSSProperties } from 'react';
import { getImageProps } from 'next/image';

/** 1×1 transparent GIF. What narrow screens render; a data: URI never makes a request. */
const BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * A decorative, desktop-only background image (P1 #1, docs/perf/p1-step1-report.md).
 *
 * A plain <img> inside a `hidden sm:block` wrapper still downloads on phones: browsers fetch
 * images under display:none, and React preloads every server-rendered <img> (a
 * `<link rel="preload" as="image">` in the HTML and an `HL` hint in the RSC payload). The hint
 * reaches link prefetches too, so any page linking to the hero's page downloaded the image.
 *
 * Here the real image is a <source> with a min-width media query inside <picture>. React does not
 * preload images inside <picture> (it can't know which source the browser will choose), and below
 * `minWidth` the browser uses the fallback <img>, a data: URI. Above it, the browser picks a
 * next/image optimized width (WebP via /_next/image) from `sizes`.
 */
export function DesktopHeroImage({
  src,
  width,
  height,
  minWidth = 640,
  sizes = '100vw',
  className,
  style,
}: {
  /** Path under /public. */
  src: string;
  /** Intrinsic size of the source file. */
  width: number;
  height: number;
  /** Viewport width (px) from which the image shows; match the wrapper's breakpoint (sm = 640). */
  minWidth?: number;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const {
    props: { srcSet },
  } = getImageProps({ src, alt: '', width, height, sizes });
  return (
    <picture>
      <source media={`(min-width: ${minWidth}px)`} srcSet={srcSet} sizes={sizes} />
      {/* Fallback for narrow screens; inside <picture>, so no-img-element doesn't apply. */}
      <img src={BLANK_GIF} alt="" width={width} height={height} decoding="async" className={className} style={style} />
    </picture>
  );
}
