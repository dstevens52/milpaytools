import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { getPost, getAllSlugs } from '@/lib/blog';

export const alt = 'MilPayTools Blog';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  const title = post?.title ?? 'MilPayTools Blog';
  const subtitle = post?.description ?? 'Military pay & benefits insights.';
  const label = post?.category ?? 'Article';

  return makeOgResponse({ label, title, subtitle, accent: 'MilPayTools · Free · No Account Required' });
}
