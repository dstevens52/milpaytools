import Link from 'next/link';
import type { ReactNode } from 'react';
import { JsonLdScript } from '@/components/JsonLdScript';
import { faqPageSchema } from '@/lib/schema';

// One FAQ array → the visible list AND the FAQPage JSON-LD, so schema can never
// carry a question the page doesn't show.
//
// Answers are plain strings. The only markup they support is a markdown-style
// internal link, [text](/path): rendered as <Link> on the page, reduced to its
// link text in the schema.
//
// visibleElsewhere: the question is shown in its own section of the page (with
// a data-faq-question attribute on that section), so this list skips it while
// the schema still includes it. The FAQ-count spec checks every schema
// question has a visible data-faq-question element.
export interface FaqItem {
  question: string;
  answer: string;
  visibleElsewhere?: boolean;
}

const LINK_RE = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;

function renderAnswer(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(
      <Link key={idx} href={m[2]} className="text-blue-700 underline hover:text-blue-800">
        {m[1]}
      </Link>
    );
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function faqPlainText(text: string): string {
  return text.replace(LINK_RE, '$1');
}

export function FaqSection({
  faqs,
  heading = 'Frequently asked questions',
  variant = 'cards',
}: {
  faqs: FaqItem[];
  heading?: string;
  variant?: 'cards' | 'callout';
}) {
  const schema = faqPageSchema(
    faqs.map(({ question, answer }) => ({ question, answer: faqPlainText(answer) }))
  );
  const listed = faqs.filter((f) => !f.visibleElsewhere);

  if (variant === 'callout') {
    return (
      <>
        <JsonLdScript schema={schema} />
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="text-base font-semibold text-zinc-900 mb-3">{heading}</h3>
          <div className="space-y-4">
            {listed.map(({ question, answer }, i) => (
              <div
                key={question}
                data-faq-question={question}
                className={i > 0 ? 'border-t border-zinc-200 pt-4' : undefined}
              >
                <p className="text-sm font-medium text-zinc-800">{question}</p>
                <p className="text-sm text-zinc-600 mt-1 leading-relaxed">{renderAnswer(answer)}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLdScript schema={schema} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900">{heading}</h2>
        {listed.map(({ question, answer }) => (
          <div
            key={question}
            data-faq-question={question}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-4"
          >
            <p className="text-sm font-semibold text-zinc-900 mb-1">{question}</p>
            <p className="text-sm text-zinc-600 leading-relaxed">{renderAnswer(answer)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
