import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Duty Station Comparison Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Duty Station Comparison Calculator',
    subtitle: 'Compare BAH, take-home pay, and total compensation between two CONUS duty stations side by side.',
    accent: 'Free · Official 2026 Data · All Pay Grades',
  });
}
