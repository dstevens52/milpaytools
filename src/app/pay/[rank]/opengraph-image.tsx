import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { RANK_BY_SLUG } from '@/data/pay-pages/ranks';

export const runtime = 'edge';
export const alt = '2026 Military Pay by Rank | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ rank: string }> }) {
  const { rank: slug } = await params;
  const rank = RANK_BY_SLUG[slug];
  const title = rank ? `${rank.title} Pay in 2026` : 'Military Pay in 2026';

  return makeOgResponse({
    variant: 'calculator',
    label: 'PAY BY RANK',
    title,
    subtitle: 'Basic pay by years of service, plus BAH, BAS & total compensation',
    features: ['Official 2026 DFAS data', 'Full pay progression', 'No account required'],
  });
}
