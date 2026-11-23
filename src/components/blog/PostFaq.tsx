// A post's FAQ, visible on the page. The post route passes the same entries that
// feed the post's FAQPage schema (POST_FAQS in src/app/blog/[slug]/page.tsx), so
// the visible questions and the schema can't drift apart (S7). Server only.

export interface PostFaqEntry {
  question: string;
  answer: string;
}

export function PostFaq({ faqs }: { faqs: PostFaqEntry[] }) {
  return (
    <div className="space-y-5">
      {faqs.map((f) => (
        <div key={f.question} data-faq-question={f.question}>
          <h3>{f.question}</h3>
          <p>{f.answer}</p>
        </div>
      ))}
    </div>
  );
}
