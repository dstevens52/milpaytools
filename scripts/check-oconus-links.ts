// OCONUS v2 link check (spec Section 7). HEAD (falling back to GET) every
// officialLinks URL, every station sourceUrl, and the shared explainer links.
// Reports non-2xx/3xx; never edits anything. Run monthly by
// .github/workflows/oconus-link-check.yml, or locally:
//
//   npx tsx scripts/check-oconus-links.ts

import { OCONUS_V2_STATIONS } from '../src/data/oconus/index';
import { OFFICIAL_LOOKUPS, EXPLAINER_SOURCES } from '../src/data/oconus/sharedCopy';
import { stationFacts } from './oconusLint';

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
for (const l of [...OFFICIAL_LOOKUPS, ...EXPLAINER_SOURCES]) add(l.url, `shared › ${l.label}`);

const isHttp = (u: string) => /^https?:\/\//.test(u);
const pending = [...targets.values()].filter((t) => !isHttp(t.url));
const checkable = [...targets.values()].filter((t) => isHttp(t.url));

async function check(url: string): Promise<{ status: number | string; ok: boolean }> {
  const opts = { redirect: 'follow' as const, signal: AbortSignal.timeout(20_000), headers: { 'user-agent': 'MilPayTools link check' } };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    // Some government servers reject HEAD — retry with GET before reporting.
    if (res.status >= 400) res = await fetch(url, { ...opts, method: 'GET' });
    return { status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (e) {
    return { status: e instanceof Error ? e.message : String(e), ok: false };
  }
}

async function main() {
  console.log(`check-oconus-links: ${targets.size} unique URL(s) — ${checkable.length} checkable, ${pending.length} pending (not a URL yet)`);
  if (checkable.length === 0) {
    console.error('check-oconus-links: nothing to check — an empty run proves nothing.');
    process.exit(1);
  }
  const results = await Promise.all(checkable.map(async (t) => ({ t, r: await check(t.url) })));
  const bad = results.filter(({ r }) => !r.ok);
  for (const { t, r } of results) console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.status}  ${t.url}`);
  if (pending.length) {
    console.log('\nPending (TODO-DAN, not checked):');
    for (const t of pending) console.log(`  ${t.url}  ← ${t.where.join('; ')}`);
  }
  console.log(`\nSummary: ${results.length - bad.length} ok, ${bad.length} failing, ${pending.length} pending`);
  if (bad.length) {
    console.log('Failing URLs and where they are used:');
    for (const { t, r } of bad) console.log(`  ${r.status}  ${t.url}  ← ${t.where.join('; ')}`);
    process.exit(1);
  }
}

main();
