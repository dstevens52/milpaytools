import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Military Retirement Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Military Retirement Calculator',
    subtitle: 'Estimate your pension under High-3 or BRS, project TSP balance, and see lifetime retirement value.',
    accent: 'Free · Official 2026 DFAS Data · High-3 & BRS',
  });
}
