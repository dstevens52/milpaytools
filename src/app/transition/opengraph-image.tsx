import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';

export const runtime = 'edge';
export const alt = 'Military Transition Financial Guide — MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return makeOgResponse({
    variant: 'transition',
    label: 'Transition Guide',
    title: 'Are you financially ready to leave the military?',
    subtitle: 'Transition Readiness Calculator + Financial Guide · Official 2026 DoD & VA Data',
    accent: 'Free · No Account · TAP-Ready',
  });
}
