import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const runtime = 'edge';
export const alt = 'MilPayTools — Military Pay & Benefits Calculators';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return makeOgResponse({
    variant: 'home',
    title: 'Military Pay & Benefits Calculators',
    subtitle: 'Stop guessing what your pay is worth. Free tools using official 2026 DoD & VA data.',
    features: ['16 Free Calculators', 'Official 2026 DoD & VA Data'],
    accent: 'Free · No Account Required',
  });
}
