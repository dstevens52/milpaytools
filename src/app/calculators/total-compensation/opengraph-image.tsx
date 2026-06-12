import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
export const runtime = 'edge';
export const alt = 'Total Military Compensation Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Total Military Compensation Calculator',
    subtitle: 'See your full compensation package — base pay, BAH, BAS, TSP, and tax advantages — in one place.',
    accent: 'Free · Official 2026 DFAS Data · No Account Required',
  });
}
