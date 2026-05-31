import Link from 'next/link';
import Image from 'next/image';

// Compact author byline shown at the bottom of guide and blog pages. The full
// photo + narrative bio lives only on /about. The authorship signal for SEO/LLM
// citation is carried by the name + credential here, the Article schema `author`
// on each page, and /about — not by repeating the full bio everywhere.
//
// `date` is the page's reviewed/published date (ISO string); it renders as a
// "Last reviewed [Month Year]" line. If omitted, that line is skipped.
export function AuthorBio({ date }: { date?: string }) {
  const reviewed = date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="mt-8 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 sm:px-5 sm:py-4">
      <Image
        src="/images/dan-stevens.jpg"
        alt="Dan Stevens"
        width={40}
        height={40}
        className="rounded-full object-cover flex-none"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900">Dan Stevens</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          NMLS-licensed mortgage professional · son of a 20-year Air Force veteran
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {reviewed && <span className="text-xs text-zinc-400">Last reviewed {reviewed}</span>}
          <Link href="/about" className="text-xs font-medium text-red-700 hover:text-red-800 transition-colors">
            About MilPayTools →
          </Link>
        </div>
      </div>
    </div>
  );
}
