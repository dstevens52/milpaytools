import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
export const runtime = 'edge';
export const alt = 'CONUS COLA Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'CONUS COLA Calculator',
    subtitle: 'Check whether your duty station qualifies for CONUS Cost of Living Allowance and see monthly rates.',
    accent: 'Free · Official 2026 DTMO Data',
  });
}
