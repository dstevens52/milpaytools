import type { Metadata } from 'next';
import { WorksheetInteractive } from './WorksheetInteractive';
import { ogImage } from '@/lib/og';

export const metadata: Metadata = {
  title: { absolute: 'TAP Student Worksheet' },
  description: 'Fillable military transition planning worksheet for TAP classes. Enter your numbers, deadlines, and action items, then print or save as PDF.',
  robots: { index: false },
  openGraph: {
    title: 'TAP Student Worksheet | MilPayTools',
    description: 'Fillable military transition planning worksheet for TAP classes. Enter your numbers, deadlines, and action items, then print or save as PDF.',
    type: 'website',
    url: '/transition/worksheet',
    siteName: 'MilPayTools',
    images: ogImage({ type: 'default', title: 'TAP Student Worksheet' }),
  },
};

export default function WorksheetPage() {
  return <WorksheetInteractive />;
}
