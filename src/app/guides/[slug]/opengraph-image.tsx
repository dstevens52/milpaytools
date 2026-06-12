import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
import { getGuide, getAllGuideSlugs } from '@/lib/guides';

export const alt = 'MilPayTools Guide';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);

  const title = guide?.title ?? 'MilPayTools Guide';
  const subtitle = guide?.description ?? 'Comprehensive military finance guide.';

  return makeOgResponse({
    variant: 'guide',
    label: 'Comprehensive Guide',
    title,
    subtitle,
    accent: 'Official 2026 DoD & VA Data · milpaytools.com',
  });
}
