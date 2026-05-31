'use client';

import { Analytics } from '@vercel/analytics/react';

export function AnalyticsWrapper() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (
          typeof window !== 'undefined' &&
          localStorage.getItem('milpaytools_internal') === 'true'
        ) {
          return null;
        }
        return event;
      }}
    />
  );
}
