import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'PCS Cost Estimator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'PCS Cost Estimator',
    subtitle: 'Estimate DLA, MALT mileage, per diem, TLE, and PPM net proceeds for your next PCS move.',
    accent: 'Free · Official 2026 DTMO Rates · All Entitlements',
  });
}
