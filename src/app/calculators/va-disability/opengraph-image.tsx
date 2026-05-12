import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'VA Disability Rating Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'VA Disability Rating Calculator',
    subtitle: 'Calculate your combined VA disability rating and monthly compensation using the official VA math formula.',
    accent: 'Free · Official 2026 VA Rates · No Account Required',
  });
}
