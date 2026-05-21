import Link from 'next/link';
import type { StationPageInfo } from '@/data/bah/2026/mhaToStationPage';

interface StationPageCardProps {
  pages: StationPageInfo[];
  /** Appended to each /bah/[slug] URL — e.g. "?rank=E-5&dep=yes" */
  linkSuffix?: string;
  context?: 'bah' | 'pcs';
}

function StationLink({
  page,
  linkSuffix = '',
  context,
}: {
  page: StationPageInfo;
  linkSuffix?: string;
  context?: 'bah' | 'pcs';
}) {
  return (
    <Link
      href={`/bah/${page.slug}${linkSuffix}`}
      className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-zinc-200 bg-white py-3 pl-5 pr-4 text-sm shadow-sm hover:border-zinc-300 hover:shadow transition-all"
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-red-600" />
      <span className="text-zinc-800">
        {context === 'pcs' ? (
          <>Moving to <strong>{page.name}</strong>? See BAH rates &amp; local housing</>
        ) : (
          <><strong>{page.name}</strong>{' '}housing guide — local rents, neighborhoods &amp; BAH analysis</>
        )}
      </span>
      <span className="flex-none text-red-600">→</span>
    </Link>
  );
}

/** Renders /bah/ station page link(s) for a set of stations in the same MHA. Returns null if pages is empty. */
export function StationPageCard({ pages, linkSuffix, context }: StationPageCardProps) {
  if (pages.length === 0) return null;
  return (
    <div className="space-y-2">
      {pages.map((page) => (
        <StationLink key={page.slug} page={page} linkSuffix={linkSuffix} context={context} />
      ))}
    </div>
  );
}
