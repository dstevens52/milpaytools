/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PayGrade } from '@/types/military';
import { gradeToParam } from '@/lib/urlParams';

/**
 * GA4 measurement ID. Also used by the inline gtag loader in src/app/layout.tsx.
 */
export const GA_MEASUREMENT_ID = 'G-YQFJ5J3P52';

/**
 * localStorage key for the per-browser analytics opt-out. Set by
 * /internal/disable-analytics, cleared by /internal/enable-analytics. When set:
 * the GA4 loader in layout.tsx doesn't load gtag, every gtag event below is
 * skipped, Vercel Analytics drops its events (AnalyticsWrapper.tsx), and the
 * Microsoft Clarity loader (CLARITY_LOADER_JS) doesn't load Clarity.
 * The Redis calculator counters (/admin/stats) are not affected.
 */
export const ANALYTICS_OPT_OUT_KEY = 'milpaytools_disable_analytics';

/** Older opt-out key that AnalyticsWrapper used to check. Still honored. */
export const LEGACY_ANALYTICS_OPT_OUT_KEY = 'milpaytools_internal';

/** True when this browser has opted out of analytics. Never throws (private mode, blocked storage). */
export function analyticsDisabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === 'true' ||
      localStorage.getItem(LEGACY_ANALYTICS_OPT_OUT_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

// ─── Where the inline loaders may run ─────────────────────────────────────────

/**
 * The only hosts where GA4 and Microsoft Clarity load. Both inline loaders in
 * layout.tsx check location.hostname against this list, behind the server-side
 * NEXT_PUBLIC_VERCEL_ENV === 'production' guard, so localhost, `next start` and
 * *.vercel.app previews load neither.
 */
export const ANALYTICS_HOSTS = ['milpaytools.com', 'www.milpaytools.com'] as const;

/**
 * ANALYTICS_HOSTS as the JS array literal the inline loaders embed:
 * `['milpaytools.com', 'www.milpaytools.com']`. Single quotes and ', ' on
 * purpose: the GA loader's rendered output is byte-identical to the
 * hand-written list it replaced.
 */
export const ANALYTICS_HOSTS_JS = '[' + ANALYTICS_HOSTS.map((h) => `'${h}'`).join(', ') + ']';

// ─── Microsoft Clarity ────────────────────────────────────────────────────────

/** Microsoft Clarity project ID. */
export const CLARITY_PROJECT_ID = 'wpo718gj4q';

/**
 * The inline Clarity loader for layout.tsx (plain ES5; it runs outside the
 * bundle). It loads Clarity only when all of these hold:
 * - the host is in ANALYTICS_HOSTS;
 * - the opt-out flag isn't set (either key);
 * - the browser isn't automated (`navigator.webdriver`). Every Playwright
 *   browser sets it, so test runs never reach Clarity, including
 *   test:e2e:live against production; so do most headless crawlers.
 * Then the standard Clarity snippet, unchanged.
 * Tested by tests/e2e/clarity-guard.spec.ts, which runs this exact string.
 */
export const CLARITY_LOADER_JS = `(function(){
  var ALLOWED = ${ANALYTICS_HOSTS_JS};
  if (ALLOWED.indexOf(window.location.hostname) === -1) return;
  try {
    if (localStorage.getItem('${ANALYTICS_OPT_OUT_KEY}') === 'true' ||
        localStorage.getItem('${LEGACY_ANALYTICS_OPT_OUT_KEY}') === 'true') return;
  } catch (e) {}
  if (navigator.webdriver) return;
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
})();`;

// ─── Page URLs sent to GA (allowlist) ─────────────────────────────────────────
//
// Shared calculator links carry ZIPs, incomes, balances, prices, VA ratings and
// free-text condition labels in the query string. GA only ever gets a cleaned
// URL: origin + path + the allowlisted parameters below, in their original order
// and encoding. Every other parameter and the #hash are dropped, including
// parameters added to the site later.

/** Query parameters GA may see, besides any `utm_*`. Rank and service-length only. */
export const GA_KEEP_PARAMS = [
  'gclid',
  'rank',
  'grade',
  'dependents',
  'dep',
  'yos',
  'rank1',
  'rank2',
  'currank',
  'curyos',
] as const;

const _keep: readonly string[] = GA_KEEP_PARAMS;

/** `href` reduced to origin + path + allowlisted parameters. */
export function cleanGaUrl(href: string): string {
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return String(href).split(/[?#]/)[0];
  }
  const kept: string[] = [];
  for (const seg of u.search.slice(1).split('&')) {
    if (!seg) continue;
    let key = seg.split('=')[0];
    try {
      key = decodeURIComponent(key.replace(/\+/g, ' '));
    } catch {
      continue;
    }
    if (key.indexOf('utm_') === 0 || _keep.indexOf(key) !== -1) kept.push(seg);
  }
  return u.protocol + '//' + u.host + u.pathname + (kept.length ? '?' + kept.join('&') : '');
}

/**
 * A referrer as GA may see it. Same host as the current page: cleaned like a
 * page URL. Any other site: scheme + host + path only (no query, no hash).
 */
export function cleanGaReferrer(referrer: string, currentHref: string): string {
  if (!referrer) return '';
  let r: URL;
  let c: URL;
  try {
    r = new URL(referrer);
    c = new URL(currentHref);
  } catch {
    return '';
  }
  if (r.hostname === c.hostname) return cleanGaUrl(referrer);
  return r.protocol + '//' + r.host + r.pathname;
}

/**
 * The same two functions as an ES5 expression for the inline GA loader in
 * layout.tsx, which runs before any bundle and can't import this module.
 * Evaluates to { url(href), ref(referrer, currentHref) }. Kept identical to
 * cleanGaUrl / cleanGaReferrer by tests/e2e/ga-url-clean.spec.ts.
 */
export const GA_URL_CLEANER_JS =
  '(function(){' +
  'var K=' + JSON.stringify(GA_KEEP_PARAMS) + ';' +
  'function url(h){' +
  'var u;try{u=new URL(h);}catch(e){return String(h).split(/[?#]/)[0];}' +
  'var q=u.search.slice(1).split("&"),kept=[];' +
  'for(var i=0;i<q.length;i++){var s=q[i];if(!s)continue;var k=s.split("=")[0];' +
  'try{k=decodeURIComponent(k.replace(/\\+/g," "));}catch(e){continue;}' +
  'if(k.indexOf("utm_")===0||K.indexOf(k)!==-1)kept.push(s);}' +
  'return u.protocol+"//"+u.host+u.pathname+(kept.length?"?"+kept.join("&"):"");}' +
  'function ref(r,c){if(!r)return "";var a,b;try{a=new URL(r);b=new URL(c);}catch(e){return "";}' +
  'if(a.hostname===b.hostname)return url(r);return a.protocol+"//"+a.host+a.pathname;}' +
  'return {url:url,ref:ref};})()';

/** window.gtag when GA may be used: browser, not opted out, gtag loaded. */
function gaTag(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined' || analyticsDisabled()) return null;
  const gtag = (window as any).gtag;
  return typeof gtag === 'function' ? gtag : null;
}

/**
 * The only path to window.gtag. A no-op on the server, when opted out, and
 * wherever gtag isn't loaded (preview, localhost — see the guard in layout.tsx).
 * Parameters must never carry personal data: no ZIP, no email, no free text.
 */
function sendGaEvent(name: string, params: Record<string, string>): void {
  gaTag()?.('event', name, params);
}

/**
 * page_view for an in-site navigation to a new path (GaPageView.tsx). GA's own
 * page_view covers the first load; the GA4 Enhanced Measurement setting "Page
 * changes based on browser history events" must be off, or these count twice.
 * The `set` makes every later event on this page carry the same cleaned URL.
 */
export function sendGaPageView(href: string, previousHref: string): void {
  const gtag = gaTag();
  if (!gtag) return;
  const page_location = cleanGaUrl(href);
  const page_referrer = cleanGaUrl(previousHref);
  gtag('set', { page_location, page_referrer });
  gtag('event', 'page_view', { page_location, page_referrer });
}

// Per-calculator timestamp of last Redis track. Persists for the page session.
const _lastTracked: Record<string, number> = {};

export function fireShareEvent(pageType: 'bah-station' | 'calculator', pageName: string): void {
  if (typeof window === 'undefined') return;

  // GA4 — fires every time
  sendGaEvent('share_click', {
    page_type: pageType,
    page_name: pageName,
  });

  // Redis counter — 30-second cooldown per page to avoid over-counting
  const trackKey = `share:${pageName}`;
  const now = Date.now();
  if (_lastTracked[trackKey] && now - _lastTracked[trackKey] < 30_000) return;
  _lastTracked[trackKey] = now;

  fetch('/api/track-calculation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calculator: trackKey }),
    keepalive: true,
  }).catch(() => {});
}

export function fireCalculatorEvent(calculatorName: string): void {
  if (typeof window === 'undefined') return;

  // GA4 — fires every time (GA4 handles deduplication on its side)
  sendGaEvent('calculation_run', {
    calculator_name: calculatorName,
    event_category: 'calculator',
  });

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

// ─── Key events ───────────────────────────────────────────────────────────────

const STATION_ALERT_PREFIX = 'bah-alert-';

/**
 * newsletter_signup — call only after /api/subscribe reports success.
 * `station` is the station slug, taken from a `bah-alert-{slug}` source
 * (CONUS station pages); omitted for every other source.
 */
export function fireNewsletterSignup(source: string, variant: 'inline' | 'card'): void {
  const params: Record<string, string> = { source, variant };
  if (source.startsWith(STATION_ALERT_PREFIX)) params.station = source.slice(STATION_ALERT_PREFIX.length);
  sendGaEvent('newsletter_signup', params);
}

/** Pages that link into a calculator with URL parameters. */
export type DeepLinkFromPage = 'bah-station' | 'pay-hub' | 'pay-rank' | 'guide';
/** Calculators those links open. */
export type DeepLinkToCalculator = 'total-compensation' | 'pay-raise';
/**
 * Which link on the page, where a page has more than one (station pages, Build
 * 04: the rate card's button and the mid-page total-comp section). GA4 needs an
 * event-scoped custom dimension "placement" to report it.
 */
export type DeepLinkPlacement = 'rate-card' | 'mid-page';

/**
 * calc_deeplink_click — a click on a page-to-calculator link that carries URL
 * parameters. `grade` is sent in the short form (e7); `station` is a slug.
 */
export function fireDeepLinkEvent(
  fromPageType: DeepLinkFromPage,
  toCalculator: DeepLinkToCalculator,
  extra: { grade?: PayGrade; station?: string; placement?: DeepLinkPlacement } = {},
): void {
  const params: Record<string, string> = { from_page_type: fromPageType, to_calculator: toCalculator };
  if (extra.grade) params.grade = gradeToParam(extra.grade);
  if (extra.station) params.station = extra.station;
  if (extra.placement) params.placement = extra.placement;
  sendGaEvent('calc_deeplink_click', params);
}

/**
 * station_rate_lookup — the first rank or dependents change on a station page
 * (the caller ensures once per page view). Grade in the short form (e7).
 */
export function fireStationRateLookup(station: string, grade: PayGrade, hasDependents: boolean): void {
  sendGaEvent('station_rate_lookup', {
    station,
    grade: gradeToParam(grade),
    dependents: hasDependents ? 'yes' : 'no',
  });
}
