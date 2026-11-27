import { NextRequest } from 'next/server';
import { bahShareData, bahShareFilename, type BahShareFormat } from '@/lib/bahShareImage';
import { renderBahShareImage } from '@/lib/bahShareImageRender';

// Per-station BAH share images (build W2), CONUS stations only.
//   ?format=preview   1200×630 link preview (the station page's og:image)
//   ?format=portrait  1080×1350 kit image
//   &download=1       Content-Disposition: attachment
// `y` (BAH year) and `v` (design version) are cache-busters only.
// Node.js runtime: reads the BAH dataset and the committed Inter fonts.
export const runtime = 'nodejs';

export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const formatParam = searchParams.get('format') ?? 'preview';
  if (formatParam !== 'preview' && formatParam !== 'portrait') {
    return new Response('format must be preview or portrait', { status: 400 });
  }
  const format: BahShareFormat = formatParam;

  // Unknown and overseas slugs: no BAH rates, no image (OCONUS pages keep /api/og).
  const data = bahShareData(slug);
  if (!data) return new Response('Not found', { status: 404 });

  const image = renderBahShareImage(data, format);
  image.headers.set('Content-Type', 'image/png');
  // Same caching as /api/og: static per data year, served from the CDN for a
  // day; the year flip and design changes change the URL (y=, v=).
  image.headers.set('Cache-Control', 'public, immutable, no-transform, s-maxage=86400, max-age=86400');
  // Share artwork, not a page (same reasoning as /api/og).
  image.headers.set('X-Robots-Tag', 'noindex');
  if (searchParams.get('download') === '1') {
    image.headers.set('Content-Disposition', `attachment; filename="${bahShareFilename(data, format)}"`);
  }
  return image;
}
