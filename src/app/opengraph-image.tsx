import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const runtime = 'edge';
export const alt = 'MilPayTools — Military Pay & Benefits Calculators';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return makeOgResponse({
    title: 'Stop guessing what your military pay and benefits are worth.',
    subtitle: 'Free military pay & benefits calculators using official 2026 DoD and VA data.',
    accent: '14 Calculators · Official 2026 Data · No Account Required',
  });
}
