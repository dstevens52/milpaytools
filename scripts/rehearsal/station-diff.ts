/**
 * REHEARSAL ONLY. Diffs every dollar figure on 20 CONUS station pages against the
 * synthetic 2027 DTMO table and the 2026 DTMO table, read straight from the ASCII
 * files (scripts/rehearsal/ascii.ts; no src/ code). Exits 1 on any mismatch.
 *
 *   npx tsx scripts/rehearsal/station-diff.ts [baseUrl] [--mode transition|2027] [--out file.json] [--vercel]
 *
 * "2026 table" = data/sources/dtmo/2026 (January 2026), except TX270, whose 2026
 * rates as paid were DTMO's May 16, 2026 temporary increase: those rows are read
 * from docs/sources/bah-2026-abilene-temporary-increase.md (the DTMO bahw26.txt /
 * bahwo26.txt rows recorded there).
 *
 * The prior-year comparison uses the MHA the station ZIP had in 2026 (a remapped
 * station ZIP must not compare against its new MHA's 2026 rate).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readAscii, median, GRADES } from './ascii';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const BASE = args.find((a) => a.startsWith('http')) ?? 'http://localhost:3000';
const MODE = (args[args.indexOf('--mode') + 1] ?? 'transition') as 'transition' | '2027';
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
// --vercel: fetch through `vercel curl` (Vercel previews sit behind Vercel login).
const VIA_VERCEL = args.includes('--vercel');
async function getPage(url: string): Promise<{ status: number; html: string }> {
  if (!VIA_VERCEL) {
    const res = await fetch(url);
    return { status: res.status, html: await res.text() };
  }
  const html = execFileSync('vercel', ['curl', url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: true });
  return { status: html.includes('<html') ? 200 : 0, html };
}

export const STATIONS = [
  // increases
  'fort-bragg', 'fort-hood', 'joint-base-lewis-mcchord', 'naval-station-norfolk', 'joint-base-san-antonio',
  'fort-carson', 'naval-air-station-pensacola', 'joint-base-elmendorf-richardson',
  // decreases
  'fort-irwin', 'kirtland-afb', 'naval-base-kitsap', 'fort-lee', 'robins-afb', 'maxwell-afb',
  // unchanged
  'naval-station-san-diego', 'camp-pendleton', 'marine-corps-base-quantico',
  // TX270: below its 2026 temporary increase
  'dyess-afb',
  // station ZIP remapped (99011 WA310 → WA307)
  'fairchild-afb',
  // increase, Hawaii (non-CONUS-48 state, CONUS template)
  'schofield-barracks',
];

const a27 = readAscii(path.join(ROOT, 'data/sources/dtmo/2027-rehearsal'), '27');
const a26 = readAscii(path.join(ROOT, 'data/sources/dtmo/2026'), '26');
// TX270 as paid in 2026 (temporary increase), from the source record's DTMO rows.
{
  const doc = readFileSync(path.join(ROOT, 'docs/sources/bah-2026-abilene-temporary-increase.md'), 'utf8');
  for (const [file, key] of [['bahw26.txt', 'w'], ['bahwo26.txt', 'wo']] as const) {
    const row = doc.match(new RegExp(`^${file.replace('.', '\\.')}\\s+(TX270,[\\d.,]+)`, 'm'));
    if (!row) throw new Error(`TX270 ${file} row not found in the source record`);
    const v = row[1].split(',').slice(1).map(Number);
    a26[key].TX270 = Object.fromEntries(GRADES.map((g, i) => [g, v[i]]));
  }
}

// Stations: slug → zip, name, nearby (regex over the data file, not the module).
const stationsSrc = readFileSync(path.join(ROOT, 'src/data/duty-stations/stations.ts'), 'utf8');
interface St { slug: string; zip: string; name: string; nearby: string[] }
const ST: Record<string, St> = {};
for (const block of stationsSrc.split(/\n  \{\r?\n/).slice(1)) {
  const slug = block.match(/slug: '([^']+)'/)?.[1];
  const zip = block.match(/zip: '(\d{5})'/)?.[1];
  const name = block.match(/\bname: '((?:[^'\\]|\\.)+)'/)?.[1]?.replace(/\\'/g, "'");
  const nearby = [...(block.match(/nearby: \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  if (slug && zip && name) ST[slug] = { slug, zip, name, nearby };
}

const usdN = (s: string) => Number(s.replace(/[$,]/g, ''));
const decode = (s: string) =>
  s.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x2F;/g, '/');
function tokens(html: string): string[] {
  return decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '\n'))
    .split('\n').map((s) => s.trim()).filter(Boolean);
}
/** Inner HTML of the element carrying data-testid=id (tag-balanced). */
function byTestId(html: string, id: string): string | null {
  const at = html.indexOf(`data-testid="${id}"`);
  if (at < 0) return null;
  const open = html.lastIndexOf('<', at);
  const tag = html.slice(open + 1).match(/^[a-z0-9]+/)![0];
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, 'g');
  re.lastIndex = open;
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index + m[0].length);
  }
  return null;
}
/** Dollar amounts as magnitudes (signs like "-$209" / "−$80" are checked by the structural checks). */
const dollars = (s: string) => [...s.matchAll(/\$[\d,]+/g)].map((m) => usdN(m[0]));

interface Result { slug: string; mha27: string; mha26: string; checks: number; failures: string[]; years2026: string[] }

async function check(slug: string): Promise<Result> {
  const st = ST[slug];
  const failures: string[] = [];
  let checks = 0;
  const eq = (what: string, got: number | string | undefined, want: number | string) => {
    checks++;
    if (got !== want) failures.push(`${what}: page ${got} ≠ expected ${want}`);
  };
  const m27 = a27.zip[st.zip];
  const m26 = a26.zip[st.zip];
  const C = { w: a27.w[m27], wo: a27.wo[m27] };
  const P = { w: a26.w[m26], wo: a26.wo[m26] };
  const { status, html } = await getPage(`${BASE}/bah/${slug}`);
  eq('HTTP status', status, 200);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const e5 = C.w['E-5'];
  const med = median(Object.values(a27.w).map((r) => r['E-5']));

  // 1. Rate card
  const card = tokens(byTestId(html, 'bah-rate-card-amount') ?? '');
  eq('rate card E-5 w/dep', usdN(card[0] ?? ''), e5);
  const yoy = tokens(byTestId(html, 'bah-rate-card-yoy') ?? '').join(' ');
  const d5 = C.w['E-5'] - P.w['E-5'];
  checks++;
  if (d5 === 0 ? !/No change/.test(yoy) : !yoy.includes(`${d5 > 0 ? '+' : '−'}$${Math.abs(d5).toLocaleString('en-US')}`))
    failures.push(`rate card YoY: "${yoy}" vs expected ${d5}`);

  // 2. Rate table: grade, with $, change, without $, change
  const table = tokens(byTestId(html, 'bah-rate-table') ?? '');
  for (const g of GRADES) {
    const i = table.indexOf(g);
    if (i < 0) { failures.push(`rate table: no row ${g}`); continue; }
    const vals = table.slice(i + 1, i + 12).filter((t) => /^\$[\d,]+$/.test(t)).slice(0, 2).map(usdN);
    eq(`rate table ${g} w/dep`, vals[0], C.w[g]);
    eq(`rate table ${g} w/o dep`, vals[1], C.wo[g]);
    const changes = table.slice(i + 1, i + 12).filter((t) => /^[▲▼]|^No change/.test(t)).slice(0, 2);
    for (const [k, dep] of [[0, 'w'], [1, 'wo']] as const) {
      const d = C[dep][g] - P[dep][g];
      const t = changes[k] ?? '';
      checks++;
      if (d === 0 ? !/No change/.test(t) : !t.includes(`$${Math.abs(d).toLocaleString('en-US')}`) || (d > 0) !== t.startsWith('▲'))
        failures.push(`rate table ${g} ${dep} change: "${t}" vs expected ${d}`);
    }
  }

  // 3. Total pay table (2026 pay table → 2026 BAH, the MHA the ZIP had in 2026)
  const tp = tokens(byTestId(html, 'station-total-pay') ?? '');
  if (tp.length) {
    const head = tp.join(' ');
    checks++;
    if (!/by rank \(2026\)/.test(head)) failures.push('total pay heading year is not 2026');
    for (const g of GRADES) {
      const i = tp.indexOf(g);
      if (i < 0) continue;
      const cells = tp.slice(i + 1, i + 5);
      const [basic, bah, bas, total] = cells;
      eq(`total pay ${g} BAH (2026)`, usdN(bah ?? ''), P.w[g]);
      const lo = (s: string) => usdN(s.split('–')[0]);
      const hi = (s: string) => usdN(s.split('–').pop()!);
      checks++;
      if (Math.abs(lo(basic) + usdN(bah) + usdN(bas) - lo(total)) > 1 || Math.abs(hi(basic) + usdN(bah) + usdN(bas) - hi(total)) > 1)
        failures.push(`total pay ${g}: ${basic} + ${bah} + ${bas} ≠ ${total}`);
    }
  }

  // 4. Transition notice
  const tn = tokens(byTestId(html, 'bah-transition-notice') ?? '').join(' ');
  if (MODE === 'transition') {
    eq('transition line prior E-5', dollars(tn)[0], P.w['E-5']);
  } else {
    eq('no transition line in 2027 mode', tn, '');
  }

  // 5. Market comparison + HUD + quick facts + sweep
  const T = tokens(main);
  const text = T.join(' | ');
  const mk = text.match(/BAH for an E-5 with dependents is \$([\d,]+)\/month — \$([\d,]+)\/month (above|below) the national median of \$([\d,]+)/);
  if (mk) {
    eq('market: E-5', usdN(mk[1]), e5);
    eq('market: median', usdN(mk[4]), med);
    eq('market: gap', usdN(mk[2]), Math.abs(e5 - med));
  } else if (!/right at/.test(text)) failures.push('market sentence not found');
  const fmr = text.match(/Fair Market Rent runs about \| \$([\d,]+)–\$([\d,]+) \| \(median \| \$([\d,]+)/);
  const fmrVals = fmr ? [usdN(fmr[1]), usdN(fmr[2]), usdN(fmr[3])] : [];
  const hud = text.match(/E-5 with dependents \(\$([\d,]+)\)/);
  if (hud) eq('HUD sentence E-5', usdN(hud[1]), e5);

  // Known values for the sweep
  const K = new Set<number>([med, Math.abs(e5 - med), e5 * 12, ...fmrVals]);
  for (const dep of ['w', 'wo'] as const) for (const g of GRADES) {
    const c = C[dep][g], p = P[dep][g];
    K.add(c); K.add(p); K.add(Math.abs(c - p)); K.add(Math.abs(c - p) * 12);
  }
  const reciprocal = Object.values(ST).filter((s) => s.nearby.includes(slug)).map((s) => s.slug);
  for (const n of [...st.nearby, ...reciprocal]) {
    const z = ST[n]?.zip;
    const m = z && a27.zip[z];
    if (m && a27.w[m]) { K.add(a27.w[m]['E-5']); K.add(Math.abs(a27.w[m]['E-5'] - e5)); }
  }
  // Sweep <main> minus the total-pay section (checked above).
  const tpHtml = byTestId(html, 'station-total-pay') ?? '';
  // Non-BAH figures in static station copy (state tax notes), named so nothing else is skipped.
  const NON_BAH = [/Permanent Fund Dividend \(typically \$[\d,]+–\$[\d,]+/g];
  let sweepText = tokens(main.replace(tpHtml, '')).join(' | ');
  for (const re of NON_BAH) sweepText = sweepText.replace(re, '[non-BAH figure]');
  const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1])).find((j) => j['@type'] === 'FAQPage');
  const faqText = faq ? faq.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => `${q.name} ${q.acceptedAnswer.text}`).join(' | ') : '';
  for (const [where, s] of [['page', sweepText], ['FAQ schema', faqText]] as const) {
    for (const v of dollars(s)) {
      checks++;
      if (!K.has(v)) failures.push(`${where}: $${v.toLocaleString('en-US')} matches nothing in the 2027/2026 tables`);
    }
  }

  // 6. FAQ: first answer states 2027 rates
  if (faq) {
    const a0: string = faq.mainEntity[0].acceptedAnswer.text;
    checks++;
    if (!faq.mainEntity[0].name.includes(`2027 BAH rate for an E-5`)) failures.push(`FAQ 1 question: ${faq.mainEntity[0].name}`);
    eq('FAQ 1 E-5 w/dep', dollars(a0)[0], e5);
    checks++;
    if (MODE === 'transition' ? !a0.startsWith('Starting January 1, 2027') : a0.startsWith('Starting January 1')) failures.push(`FAQ 1 tense: ${a0.slice(0, 60)}`);
  } else failures.push('no FAQPage schema');

  // 7. Head: title, description, og
  const title = decode(html.match(/<title>([^<]*)/)?.[1] ?? '');
  const desc = decode(html.match(/<meta name="description" content="([^"]*)/)?.[1] ?? '');
  const ogt = decode(html.match(/<meta property="og:title" content="([^"]*)/)?.[1] ?? '');
  const ogi = decode(html.match(/<meta property="og:image" content="([^"]*)/)?.[1] ?? '');
  for (const [k, v] of [['title', title], ['og:title', ogt], ['og:image', decodeURIComponent(ogi)]]) {
    checks++;
    if (!v.includes('2027') || v.includes('2026')) failures.push(`${k} year: ${v}`);
  }
  const range = desc.match(/\$([\d,]+)–\$([\d,]+)\/mo/);
  if (range) {
    const all = GRADES.flatMap((g) => [C.w[g], C.wo[g]]);
    eq('meta range min', usdN(range[1]), Math.min(...all));
    eq('meta range max', usdN(range[2]), Math.max(...all));
  } else {
    const ab = desc.match(/E-5 with dependents \$([\d,]+)\/mo, without \$([\d,]+)\/mo/);
    if (!ab) failures.push(`meta description has no figures: ${desc}`);
    else { eq('meta E-5 w', usdN(ab[1]), e5); eq('meta E-5 wo', usdN(ab[2]), C.wo['E-5']); }
  }
  checks++;
  if (!desc.includes('2027')) failures.push(`meta description year: ${desc}`);

  // Sentences mentioning 2026, for review (not failures).
  const years2026 = [...new Set(sweepText.split(/(?<=[.!?])\s|\s\|\s/).filter((s) => s.includes('2026')))];
  return { slug, mha27: m27, mha26: m26, checks, failures, years2026 };
}

(async () => {
  const results: Result[] = [];
  for (const s of STATIONS) results.push(await check(s));
  let bad = 0;
  for (const r of results) {
    const tag = r.mha27 === r.mha26 ? r.mha27 : `${r.mha26}→${r.mha27}`;
    console.log(`${r.failures.length ? '✗' : '✓'} ${r.slug} (${tag}): ${r.checks} checks, ${r.failures.length} mismatches`);
    for (const f of r.failures) console.log(`    - ${f}`);
    bad += r.failures.length;
  }
  const y = [...new Set(results.flatMap((r) => r.years2026.map((s) => s.replace(new RegExp(ST[r.slug].name.replace(/[()]/g, '\\$&'), 'g'), '{station}'))))];
  console.log(`\n"2026" in visible text (outside total pay), deduped across stations (${y.length}):`);
  for (const s of y.slice(0, 40)) console.log(`  · ${s.slice(0, 200)}`);
  console.log(`\n${MODE}: ${results.length} stations, ${results.reduce((n, r) => n + r.checks, 0)} checks, ${bad} mismatches`);
  if (OUT) writeFileSync(OUT, JSON.stringify(results, null, 2));
  process.exit(bad ? 1 : 0);
})();
