'use client';

import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

export function AnalyticsWrapper() {
  const [mounted, setMounted] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setDisabled(localStorage.getItem('milpaytools_disable_analytics') === 'true');
    setMounted(true);
  }, []);

  if (!mounted || disabled) return null;
  return <Analytics />;
}
