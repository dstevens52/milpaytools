'use client';

import { useEffect, useState } from 'react';
import { ANALYTICS_OPT_OUT_KEY, LEGACY_ANALYTICS_OPT_OUT_KEY, GA_MEASUREMENT_ID } from '@/lib/analytics';

export default function EnableAnalyticsPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    localStorage.removeItem(LEGACY_ANALYTICS_OPT_OUT_KEY);
    // GA4 itself loads on the next page load (the loader skips it while opted out).
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    setDone(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <p className="text-sm font-mono text-zinc-400 mb-3">milpaytools / internal</p>
        <p className={`text-base font-medium ${done ? 'text-blue-700' : 'text-zinc-400'}`}>
          {done ? 'Google Analytics and Vercel Analytics enabled for this browser.' : 'Working…'}
        </p>
      </div>
    </div>
  );
}
