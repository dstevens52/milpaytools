import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-file-image';
export const runtime = 'edge';
export const alt = 'Separation Benefits Timeline Calculator | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'Separation Benefits Timeline',
    subtitle: 'See exactly when TRICARE, SGLI, TAMP, and every other benefit stops or converts — calculated from your separation date.',
    accent: 'Free · Official DoD & VA Data',
  });
}
