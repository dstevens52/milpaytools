/**
 * Request policy for P1 measurement runs against a deployed site (tooling only).
 *
 * Analytics scripts may download and run (their cost is what item 6 measures), but every
 * collection request is aborted, so a measurement run sends nothing to GA4, Clarity or Vercel
 * Analytics and nothing to the site's /api/ routes (calculation counters, signups).
 * Off-site requests are allowed only to the script hosts below.
 */
import type { BrowserContext } from '@playwright/test';

// Script paths only: gtag.js and its destination scripts (/gtag/*); Clarity's tag and runtime.
const ALLOW_THIRD_PARTY = [/^https:\/\/www\.googletagmanager\.com\/gtag\//, /^https:\/\/www\.clarity\.ms\/tag\//, /^https:\/\/scripts\.clarity\.ms\//];
const SITE_BLOCK = [/\/_vercel\/insights\/(?!script\.js)/, /\/_vercel\/speed-insights\/(?!script\.js)/, /^\/api\//];

export async function blockAnalyticsCollection(context: BrowserContext, base: string, blocked: string[] = []) {
  const host = new URL(base).hostname;
  await context.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const u = new URL(url);
    const own = u.hostname === host;
    const block = own ? SITE_BLOCK.some((r) => r.test(u.pathname)) : !ALLOW_THIRD_PARTY.some((r) => r.test(url));
    if (block) {
      blocked.push(`${req.method()} ${url.slice(0, 140)}`);
      return route.abort();
    }
    return route.continue();
  });
  return blocked;
}
