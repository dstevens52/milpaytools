import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'BAH Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'BAH Calculator — 2026 Rates',
    subtitle: 'Look up Basic Allowance for Housing by ZIP code, pay grade, and dependency status.',
    accent: 'Free · Instant Results · Official 2026 DTMO Data',
  });
}
