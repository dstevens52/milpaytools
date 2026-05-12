import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Guard & Reserve Pay Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Guard & Reserve Pay Calculator',
    subtitle: 'Calculate drill pay, AT pay, and TRICARE Reserve Select premiums for part-time military service.',
    accent: 'Free · Official 2026 DFAS Rates',
  });
}
