/* eslint-disable @typescript-eslint/no-explicit-any */

// Per-calculator timestamp of last Redis track. Persists for the page session.
const _lastTracked: Record<string, number> = {};

export function fireShareEvent(pageType: 'bah-station' | 'calculator', pageName: string): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', 'share_click', {
      page_type: pageType,
      page_name: pageName,
    });
  }
}

export function fireCalculatorEvent(calculatorName: string): void {
  if (typeof window === 'undefined') return;

  // GA4 — fires every time (GA4 handles deduplication on its side)
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', 'calculation_run', {
      calculator_name: calculatorName,
      event_category: 'calculator',
    });
  }

  // Redis counter — 30-second cooldown per calculator to avoid over-counting
  const now = Date.now();
  if (_lastTracked[calculatorName] && now - _lastTracked[calculatorName] < 30_000) return;
  _lastTracked[calculatorName] = now;

  fetch('/api/track-calculation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calculator: calculatorName }),
    keepalive: true,
  }).catch(() => {});
}
