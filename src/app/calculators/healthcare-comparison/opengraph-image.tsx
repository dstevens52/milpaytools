import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Healthcare Cost Comparison Calculator | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Healthcare Cost Comparison',
    subtitle: 'See exactly what healthcare will cost after separation — employer insurance, ACA, VA, and TRICARE Reserve Select compared against active-duty TRICARE.',
    accent: 'Free · 2026 KFF & VA Rate Data',
  });
}
