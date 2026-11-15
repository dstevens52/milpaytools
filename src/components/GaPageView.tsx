'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sendGaPageView } from '@/lib/analytics';

/**
 * GA4 page_view for in-site navigation, with the URL cleaned to the allowlist
 * (cleanGaUrl in src/lib/analytics.ts).
 *
 * - First load: nothing here. GA's automatic page_view covers it, cleaned by the
 *   gtag('set') in the layout's loader.
 * - Each pathname change (links, back/forward): one page_view. The referrer is
 *   the previous page.
 * - Query-only changes (the station page's ?rank=, a calculator rewriting its own
 *   query string) are not page views.
 *
 * Requires GA4 admin → Enhanced measurement → Page views → "Page changes based on
 * browser history events" OFF, or in-site views count twice. If this component is
 * removed, turn that setting back on.
 */
export function GaPageView() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const href = window.location.href;
    // href === previous: React's dev-mode double effect run, not a navigation.
    if (previous.current !== null && previous.current !== href) sendGaPageView(href, previous.current);
    previous.current = href;
  }, [pathname]);

  return null;
}
