/**
 * Smoke test for the BAH share images (build W2): every CONUS station slug ×
 * both formats must answer 200 with image/png. Needs a running server.
 *
 *   npm run check:bah-images                       # http://localhost:3000
 *   BASE_URL=https://<preview> npm run check:bah-images
 *
 * Prints the request count before the result (an empty slug list is a failure,
 * not a pass) and the slowest responses. Exits 1 on any failure.
 */
import { bahShareImageUrl, bahShareStations, BAH_SHARE_FORMATS, type BahShareFormat } from '../src/lib/bahShareImage';

const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const FORMATS = Object.keys(BAH_SHARE_FORMATS) as BahShareFormat[];

async function main() {
  const slugs = bahShareStations().map((s) => s.slug);
  const total = slugs.length * FORMATS.length;
  console.log(`target: ${BASE_URL}  stations: ${slugs.length}  formats: ${FORMATS.length}  requests: ${total}`);
  if (slugs.length === 0) {
    console.error('FAIL: no CONUS station slugs');
    process.exit(1);
  }

  const failures: string[] = [];
  const timings: { url: string; ms: number }[] = [];
  for (const slug of slugs) {
    for (const format of FORMATS) {
      const url = `${BASE_URL}${bahShareImageUrl(slug, format)}`;
      const t = performance.now();
      try {
        const res = await fetch(url);
        const body = Buffer.from(await res.arrayBuffer());
        const ms = Math.round(performance.now() - t);
        timings.push({ url, ms });
        const type = res.headers.get('content-type');
        const png = body.subarray(0, 4).toString('latin1') === '\x89PNG';
        if (res.status !== 200 || type !== 'image/png' || !png) {
          failures.push(`${slug} ${format}: status ${res.status}, ${type}, ${body.length} bytes`);
        }
      } catch (err) {
        failures.push(`${slug} ${format}: ${(err as Error).message}`);
      }
    }
  }

  timings.sort((a, b) => b.ms - a.ms);
  console.log(`checked: ${timings.length}/${total}  failures: ${failures.length}`);
  console.log('slowest:');
  for (const t of timings.slice(0, 5)) console.log(`  ${t.ms} ms  ${t.url}`);
  if (failures.length || timings.length !== total) {
    for (const f of failures) console.error(`FAIL ${f}`);
    process.exit(1);
  }
  console.log('OK: every CONUS station returns 200 image/png in both formats');
}

main();
