import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
import { STATION_BY_SLUG } from '@/data/duty-stations/stations';

export const runtime = 'edge';
export const alt = '2026 BAH Rates | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const station = STATION_BY_SLUG[slug];
  const stationName = station?.name ?? 'Military Installation';

  return makeOgResponse({
    variant: 'calculator',
    label: 'DUTY STATION',
    title: `2026 BAH Rates for ${stationName}`,
    subtitle: 'Military housing allowance by rank and dependent status',
    features: ['Official 2026 DTMO data', 'With & without dependents', 'No account required'],
  });
}
