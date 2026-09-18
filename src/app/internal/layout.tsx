import type { Metadata } from 'next';

/**
 * Everything under /internal is an operator utility, not a page for readers.
 * Both analytics routes mutate localStorage on mount, so an organic visitor
 * landing on one from search would silently flip their own analytics state.
 *
 * The metadata lives here rather than on the pages because both are
 * 'use client' components, which cannot export `metadata`. A segment layout
 * also means any future /internal route is noindexed by default.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
