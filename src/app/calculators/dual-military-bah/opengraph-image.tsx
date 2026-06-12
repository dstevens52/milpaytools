import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
export const runtime = 'edge';
export const alt = 'Dual Military BAH Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Dual Military BAH Calculator',
    subtitle: 'Calculate BAH entitlements when both spouses are active duty — with and without dependents.',
    accent: 'Free · Official 2026 DTMO Data',
  });
}
