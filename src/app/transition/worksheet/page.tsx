import type { Metadata } from 'next';
import { WorksheetInteractive } from './WorksheetInteractive';

export const metadata: Metadata = {
  title: { absolute: 'TAP Student Worksheet' },
  description: 'Fillable military transition planning worksheet for TAP classes. Enter your numbers, deadlines, and action items, then print or save as PDF.',
  robots: { index: false },
};

export default function WorksheetPage() {
  return <WorksheetInteractive />;
}
