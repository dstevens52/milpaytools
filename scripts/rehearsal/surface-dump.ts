/**
 * REHEARSAL ONLY. Fetches the BAH-reading pages from a base URL and writes, per
 * page, the head fields (title, description, og:title, og:image), H1, JSON-LD
 * dates/FAQ questions and the visible <main> text, for diffing between modes.
 *
 *   npx tsx scripts/rehearsal/surface-dump.ts <baseUrl> <out.json>
 */
import { writeFileSync } from 'node:fs';

export const SURFACES = [
  '/', '/bah', '/bah/changes', '/bah/fort-bragg', '/bah/dyess-afb', '/bah/fairchild-afb', '/bah/fort-irwin',
  '/bah/naval-station-san-diego', '/bah/ramstein-air-base',
  '/calculators', '/calculators/dual-military-bah', '/calculators/pcs', '/calculators/compare', '/calculators/cola',
  '/calculators/total-compensation', '/calculators/transition-readiness', '/calculators/deployment', '/calculators/education',
  '/calculators/tsp', '/calculators/retirement', '/calculators/guard-reserve', '/calculators/separation-timeline',
  '/calculators/healthcare-comparison', '/calculators/va-disability', '/calculators/va-loan',
  '/guides/education-benefits', '/guides/pcs', '/guides/starting-service', '/guides/military-pay', '/transition',
  '/pay', '/pay/raise', '/pay/dates', '/pay/e5', '/pay/o3',
  '/blog/what-is-bah', '/llms.txt', '/sitemap.xml',
  '/api/bah/lookup?zip=99011&y=2027', '/api/bah/lookup?zip=79601&y=2027', '/api/bah/lookup?zip=92134&ratesYear=2026',
];

const decode = (s: string) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const text = (h: string) => decode(h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '\n'))
  .split('\n').map((s) => s.trim()).filter(Boolean);

(async () => {
  const [base, out] = process.argv.slice(2);
  const res: Record<string, unknown> = {};
  for (const p of SURFACES) {
    const r = await fetch(base + p);
    const body = await r.text();
    if (!(r.headers.get('content-type') ?? '').includes('html')) {
      res[p] = { status: r.status, cache: r.headers.get('cache-control'), body: body.length > 20000 ? body.split('\n') : body };
      continue;
    }
    const meta = (k: string) => decode(body.match(new RegExp(`<meta (?:name|property)="${k}" content="([^"]*)`))?.[1] ?? '');
    const ld = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const main = body.includes('<main') ? body.slice(body.indexOf('<main'), body.indexOf('</main>')) : body;
    res[p] = {
      status: r.status,
      title: decode(body.match(/<title>([^<]*)/)?.[1] ?? ''),
      description: meta('description'), ogTitle: meta('og:title'), ogImage: decodeURIComponent(meta('og:image')),
      h1: text(body.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? '').join(' '),
      ld: ld.map((j) => ({ type: j['@type'], dateModified: j.dateModified, datePublished: j.datePublished, temporalCoverage: j.temporalCoverage,
        faq: j['@type'] === 'FAQPage' ? j.mainEntity.map((q: { name: string; acceptedAnswer: { text: string } }) => [q.name, q.acceptedAnswer.text]) : undefined })),
      main: text(main),
    };
    process.stdout.write('.');
  }
  writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(`\n${Object.keys(res).length} pages → ${out}`);
})();
