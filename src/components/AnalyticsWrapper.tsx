'use client';

import { Analytics } from '@vercel/analytics/react';
import { analyticsDisabled } from '@/lib/analytics';

export function AnalyticsWrapper() {
  return (
    <Analytics
      // Same per-browser opt-out as GA4 (/internal/disable-analytics).
      beforeSend={(event) => (analyticsDisabled() ? null : event)}
    />
  );
}
