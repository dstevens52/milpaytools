import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';

export const runtime = 'edge';
export const alt = '2026 BAH Rates by Military Installation | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return makeOgResponse({
    variant: 'calculator',
    label: 'DUTY STATION',
    title: '2026 BAH Rates by Military Installation',
    subtitle: 'All ranks • With & without dependents • 2026 DTMO rates',
    features: ['Official 2026 Data', 'ZIP & installation lookup', 'No account required'],
  });
}
