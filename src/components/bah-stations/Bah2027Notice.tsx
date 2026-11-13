import Link from 'next/link';
import {
  BAH_2027_STATUS,
  BAH_LOOKUP_LINK_TEXT,
  bah2027NoticeText,
  bahPayRaiseCrossLinkText,
} from '@/data/bah/2027-status';

/**
 * Dated "2027 BAH rates" notice for /bah and CONUS /bah/[slug] pages.
 * No hooks — renders on the server (passed into StationPageClient as a slot).
 * Both pages render it only in the 'next-year-status' notice mode, so it drops
 * out automatically once BAH_YEAR is '2027' (src/lib/calculations/bahTransition.ts).
 */
export function Bah2027Notice({ stationName }: { stationName?: string }) {
  const text = bah2027NoticeText(stationName);
  const linkAt = text.indexOf(BAH_LOOKUP_LINK_TEXT);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="bah-2027-notice" role="note">
      <p className="text-sm text-zinc-700 leading-relaxed">
        {linkAt === -1 ? (
          text
        ) : (
          <>
            {text.slice(0, linkAt)}
            <a href={BAH_2027_STATUS.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-800">
              {BAH_LOOKUP_LINK_TEXT}
            </a>
            {text.slice(linkAt + BAH_LOOKUP_LINK_TEXT.length)}
          </>
        )}
      </p>
      <p className="text-xs mt-2">
        <Link href="/pay/raise" className="font-medium text-red-700 hover:text-red-800 underline">
          {bahPayRaiseCrossLinkText()}
        </Link>
      </p>
    </div>
  );
}
