import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Military Education Benefits Comparison Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Education Benefits Comparison Calculator',
    subtitle: 'Compare Post-9/11 GI Bill, VR&E, Tuition Assistance, and Montgomery GI Bill side by side.',
    accent: 'Free · Official 2026 VA MHA Rates',
  });
}
