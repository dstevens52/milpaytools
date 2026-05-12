import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'Transition Readiness Calculator 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Transition Readiness Calculator',
    subtitle: 'Compare your military compensation to civilian job offers and get a clear financial readiness verdict.',
    accent: 'Free · TAP-Ready · Official 2026 Data',
  });
}
