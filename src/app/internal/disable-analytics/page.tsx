'use client';

import { useEffect, useState } from 'react';

export default function DisableAnalyticsPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    localStorage.setItem('milpaytools_disable_analytics', 'true');
    setDone(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <p className="text-sm font-mono text-zinc-400 mb-3">milpaytools / internal</p>
        <p className={`text-base font-medium ${done ? 'text-green-700' : 'text-zinc-400'}`}>
          {done ? 'Vercel Analytics disabled for this browser.' : 'Working…'}
        </p>
      </div>
    </div>
  );
}
