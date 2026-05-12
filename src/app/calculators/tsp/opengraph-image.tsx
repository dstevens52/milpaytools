import { makeOgResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
export const runtime = 'edge';
export const alt = 'TSP Growth Projector 2026 | MilPayTools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return makeOgResponse({
    label: 'Free Calculator',
    title: 'TSP Growth Projector',
    subtitle: 'Project your Thrift Savings Plan balance at retirement with BRS matching and compound growth.',
    accent: 'Free · Official 2026 Data · BRS & High-3',
  });
}
