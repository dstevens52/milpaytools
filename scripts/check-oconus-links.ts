// OCONUS v2 link check (spec Section 7). HEAD (falling back to GET) every
// officialLinks URL, every station sourceUrl, and the shared explainer links.
// Reports non-2xx/3xx; never edits anything. Run monthly by
// .github/workflows/oconus-link-check.yml, or locally:
//
//   npx tsx scripts/check-oconus-links.ts

import { OCONUS_V2_STATIONS } from '../src/data/oconus/index';
import { ALL_SHARED_LINKS } from '../src/data/oconus/sharedCopy';
import { stationFacts } from './oconusLint';

// Domains that block or drop automated requests, so a scripted check always
// fails even when the page is fine. Their links are still listed in the
// report under "Check manually" but never count as failures.
const MANUAL_CHECK_DOMAINS: { domain: string; why: string }[] = [
  // Connection times out from Node fetch and GitHub runners (UND_ERR_CONNECT_TIMEOUT);
  // the pages load normally in a browser. Accepted by Dan 2026-10-17.
  { domain: 'home.army.mil', why: 'blocks automated requests' },
];

function manualCheckDomain(url: string): { domain: string; why: string } | undefined {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return undefined;
  }
  return MANUAL_CHECK_DOMAINS.find((d) => host === d.domain || host.endsWith(`.${d.domain}`));
}

type Target = { url: string; where: string[] };

const targets = new Map<string, Target>();
function add(url: string, where: string) {
  const t = targets.get(url) ?? { url, where: [] };
  t.where.push(where);
  targets.set(url, t);
}

for (const s of OCONUS_V2_STATIONS) {
  for (const { field, fact } of stationFacts(s)) add(fact.sourceUrl, `${s.slug} › ${field}`);
  s.officialLinks.forEach((l, i) => add(l.url, `${s.slug} › officialLinks[${i}] (${l.label})`));
}
for (const l of ALL_SHARED_LINKS) add(l.url, `shared › ${l.label}`);

const isHttp = (u: string) => /^https?:\/\//.test(u);
const pending = [...targets.values()].filter((t) => !isHttp(t.url));
const manual = [...targets.values()].filter((t) => isHttp(t.url) && manualCheckDomain(t.url));
const checkable = [...targets.values()].filter((t) => isHttp(t.url) && !manualCheckDomain(t.url));

async function check(url: string): Promise<{ status: number | string; ok: boolean; finalUrl?: string }> {
  const opts = { redirect: 'follow' as const, signal: AbortSignal.timeout(20_000), headers: { 'user-agent': 'MilPayTools link check' } };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    // Some government servers reject HEAD — retry with GET before reporting.
    if (res.status >= 400) res = await fetch(url, { ...opts, method: 'GET' });
    return { status: res.status, ok: res.status >= 200 && res.status < 400, finalUrl: res.url };
  } catch (e) {
    return { status: e instanceof Error ? e.message : String(e), ok: false };
  }
}

async function main() {
  console.log(
    `check-oconus-links: ${targets.size} unique URL(s) — ${checkable.length} checkable, ${manual.length} check manually, ${pending.length} pending (not a URL yet)`,
  );
  if (checkable.length === 0) {
    console.error('check-oconus-links: nothing to check — an empty run proves nothing.');
    process.exit(1);
  }
  const results = await Promise.all(checkable.map(async (t) => ({ t, r: await check(t.url) })));
  const bad = results.filter(({ r }) => !r.ok);
  for (const { t, r } of results) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.status}  ${t.url}`);
    // A redirect is reported so the data can be moved to the final URL.
    if (r.finalUrl && r.finalUrl !== t.url) console.log(`       → redirected to ${r.finalUrl}`);
  }
  if (manual.length) {
    console.log('\nCheck manually (not requested; open each in a browser):');
    for (const t of manual) console.log(`  ${t.url}  (${manualCheckDomain(t.url)!.why})  ← ${t.where.join('; ')}`);
  }
  if (pending.length) {
    console.log('\nPending (TODO-DAN, not checked):');
    for (const t of pending) console.log(`  ${t.url}  ← ${t.where.join('; ')}`);
  }
  console.log(
    `\nSummary: ${results.length - bad.length} ok, ${bad.length} failing, ${manual.length} check manually, ${pending.length} pending`,
  );
  if (bad.length) {
    console.log('Failing URLs and where they are used:');
    for (const { t, r } of bad) console.log(`  ${r.status}  ${t.url}  ← ${t.where.join('; ')}`);
    process.exit(1);
  }
}

main();
