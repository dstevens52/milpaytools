import { OPEN_SEASON_2026_STATUS, OPEN_SEASON_SOURCE } from '@/data/tricare/2027/openSeason';
import { openSeasonParagraphs, tricarePostFaqs } from '@/lib/tricarePost';

// Sections of the TRICARE costs post that change with OPEN_SEASON_2026_STATUS.
// Server only; wording lives in src/lib/tricarePost.ts.

export function TricareOpenSeason() {
  return (
    <div data-open-season-status={OPEN_SEASON_2026_STATUS}>
      {openSeasonParagraphs(OPEN_SEASON_2026_STATUS).map((p) => (
        <p key={p}>{p}</p>
      ))}
      <p>
        Official dates and details:{' '}
        <a href={OPEN_SEASON_SOURCE.url} rel="noopener">
          tricare.mil/openseason
        </a>
        .
      </p>
    </div>
  );
}

/** The post's FAQ, visible on the page; the same answers feed its FAQPage schema (POST_FAQS). */
export function TricarePostFaq() {
  return (
    <div className="space-y-5">
      {tricarePostFaqs(OPEN_SEASON_2026_STATUS).map((f) => (
        <div key={f.question} data-faq-question={f.question}>
          <h3>{f.question}</h3>
          <p>{f.answer}</p>
        </div>
      ))}
    </div>
  );
}
