import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
export const runtime = 'edge';
export const alt = 'Compare Your PCS Move — 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Compare Your PCS Move',
    subtitle: 'Compare BAH, take-home pay, and total compensation between your current and new duty station.',
    accent: 'Free · Official 2026 Data · All Pay Grades',
  });
}
