import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Deployment Pay Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Deployment Pay Calculator',
    subtitle: 'Calculate hazardous duty pay, combat zone tax exclusion, and total deployment compensation.',
    accent: 'Free · Official 2026 DFAS Rates',
  });
}
