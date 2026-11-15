'use client';

import { useEffect, useState } from 'react';
import { ANALYTICS_OPT_OUT_KEY, GA_MEASUREMENT_ID } from '@/lib/analytics';

export default function DisableAnalyticsPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    localStorage.setItem(ANALYTICS_OPT_OUT_KEY, 'true');
    // Also stop GA4 in this tab right away (gtag may already be loaded here).
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    setDone(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <p className="text-sm font-mono text-zinc-400 mb-3">milpaytools / internal</p>
        <p className={`text-base font-medium ${done ? 'text-green-700' : 'text-zinc-400'}`}>
          {done ? 'Google Analytics and Vercel Analytics disabled for this browser.' : 'Working…'}
        </p>
      </div>
    </div>
  );
}
