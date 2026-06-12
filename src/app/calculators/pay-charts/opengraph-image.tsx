import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
export const runtime = 'edge';
export const alt = 'Military Pay Charts 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Reference',
    title: 'Military Pay Charts — 2026',
    subtitle: 'Official 2026 military base pay tables for all ranks, from E-1 to O-10, by years of service.',
    accent: 'Free · Official 2026 DFAS Pay Tables',
  });
}
