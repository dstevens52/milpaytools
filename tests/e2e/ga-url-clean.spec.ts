/**
 * GA URL allowlist — no browser or server. Run with:
 *   npx cross-env BASE_URL=http://no-server.invalid playwright test tests/e2e/ga-url-clean.spec.ts --project=chromium
 *
 * - cleanGaUrl / cleanGaReferrer (src/lib/analytics.ts) keep only origin + path +
 *   the allowlisted parameters, and drop the #hash.
 * - The ES5 copy the inline GA loader in layout.tsx runs (GA_URL_CLEANER_JS) gives
 *   identical output for every case.
 */

import { test, expect } from '@playwright/test';
import { cleanGaUrl, cleanGaReferrer, GA_URL_CLEANER_JS, GA_KEEP_PARAMS } from '../../src/lib/analytics';

const inline = new Function(`return ${GA_URL_CLEANER_JS};`)() as {
  url: (h: string) => string;
  ref: (r: string, c: string) => string;
};

const O = 'https://www.milpaytools.com';

/** [input, expected cleaned URL] */
const URLS: [string, string][] = [
  // No query string, trailing slash, hash only.
  [`${O}/`, `${O}/`],
  [`${O}/pay`, `${O}/pay`],
  [`${O}/bah/fort-bragg#rates`, `${O}/bah/fort-bragg`],
  [`${O}/pay?`, `${O}/pay`],
  // Location.
  [`${O}/bah?zip=28310&rank=e5&dependents=yes`, `${O}/bah?rank=e5&dependents=yes`],
  [`${O}/calculators/compare?zip1=28310&zip2=76544&zipb=12345&rank=e5`, `${O}/calculators/compare?rank=e5`],
  [`${O}/calculators/pcs?rank=o3&dep=yes&from=28310&to=76544&movetype=full-ppm`, `${O}/calculators/pcs?rank=o3&dep=yes`],
  [`${O}/calculators/cola?residence=CA&rank=e6`, `${O}/calculators/cola?rank=e6`],
  // Money.
  [`${O}/calculators/va-loan?price=300000&zip=28310&rank=e5&down=10000`, `${O}/calculators/va-loan?rank=e5`],
  [`${O}/calculators/tsp?bal=45000&contribution=5&sal=52000&yos=6`, `${O}/calculators/tsp?yos=6`],
  [`${O}/calculators/transition-readiness?income=60000&sav=12000&ef=6&exp=4000`, `${O}/calculators/transition-readiness`],
  [`${O}/calculators/va-refinance?balance=250000&currRate=6.5&newRate=5.75&closing=4000`, `${O}/calculators/va-refinance`],
  // Health / disability, including free-text condition labels.
  [`${O}/calculators/va-disability?r=70,30,10&l=knee,ptsd&sp=1&c=2`, `${O}/calculators/va-disability`],
  [`${O}/calculators/retirement?currank=e7&curyos=12&varating=40&crsc=1&exempt=1`, `${O}/calculators/retirement?currank=e7&curyos=12`],
  // Personal dates / family.
  [`${O}/calculators/separation-timeline?date=2027-03-01&family=4`, `${O}/calculators/separation-timeline`],
  // Secrets and free text.
  [`${O}/admin/stats?secret=s3cr3t-value`, `${O}/admin/stats`],
  [`${O}/feedback?url=%2Fbah%3Fzip%3D28310&page=x`, `${O}/feedback`],
  // Every approved keep parameter, original order kept.
  [
    `${O}/calculators/dual-military-bah?rank1=e5&zip=28310&rank2=o2&grade=e4&yos=4&dep=no&dependents=yes&rank=e5`,
    `${O}/calculators/dual-military-bah?rank1=e5&rank2=o2&grade=e4&yos=4&dep=no&dependents=yes&rank=e5`,
  ],
  // utm_* (any) and gclid kept; gbraid / wbraid / srsltid stripped.
  [
    `${O}/?utm_source=newsletter&utm_medium=email&zip=12345&gclid=abc&utm_campaign=bah-2027&utm_content=x&gbraid=g&wbraid=w&srsltid=s`,
    `${O}/?utm_source=newsletter&utm_medium=email&gclid=abc&utm_campaign=bah-2027&utm_content=x`,
  ],
  // Encoded values are kept byte-for-byte; an encoded key still matches.
  [`${O}/?utm_campaign=Spring%20Sale%2B2027&zip=28310`, `${O}/?utm_campaign=Spring%20Sale%2B2027`],
  [`${O}/?utm%5Fsource=x&%7Aip=28310`, `${O}/?utm%5Fsource=x`],
  // Bad percent-encoding in a key: stripped, not thrown.
  [`${O}/?%E0%A4%A=1&rank=e5`, `${O}/?rank=e5`],
  // Repeated keys, keys without values, empty segments.
  [`${O}/?rank=e5&rank=e6&zip=1&zip=28310`, `${O}/?rank=e5&rank=e6`],
  [`${O}/?rank&zip&&yos=`, `${O}/?rank&yos=`],
  // Keys are case-sensitive and must match exactly.
  [`${O}/?RANK=e5&Zip=28310&rankx=1&xrank=2&UTM_source=a`, `${O}/`],
  // A value that looks like a keep key doesn't make its key kept.
  [`${O}/?zip=rank&a=utm_source`, `${O}/`],
  // Hash after a query.
  [`${O}/calculators/bah?rank=e5&zip=28310#results`, `${O}/calculators/bah?rank=e5`],
  // Other origins (localhost tests, preview) keep their own origin.
  ['http://localhost:3000/bah?zip=28310&rank=e5', 'http://localhost:3000/bah?rank=e5'],
  // Not a URL: query and hash cut off.
  ['not a url?zip=28310#x', 'not a url'],
];

/** [referrer, current page, expected] */
const REFS: [string, string, string][] = [
  ['', `${O}/pay`, ''],
  // Same site: cleaned like a page URL.
  [`${O}/calculators/total-compensation?rank=e5&zip=28310`, `${O}/pay`, `${O}/calculators/total-compensation?rank=e5`],
  [`${O}/?utm_source=a&income=90000`, `${O}/pay`, `${O}/?utm_source=a`],
  // Other sites: scheme + host + path only (decision K).
  ['https://www.google.com/', `${O}/pay`, 'https://www.google.com/'],
  ['https://www.reddit.com/r/army/comments/abc/bah_question/?utm_source=share&zip=28310', `${O}/bah`, 'https://www.reddit.com/r/army/comments/abc/bah_question/'],
  ['https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.milpaytools.com%2Fbah%3Fzip%3D28310', `${O}/bah`, 'https://l.facebook.com/l.php'],
  ['https://milpaytools.com/bah?zip=28310', `${O}/bah`, 'https://milpaytools.com/bah'], // apex is another host
  ['android-app://com.google.android.gm/', `${O}/bah`, 'android-app://com.google.android.gm/'],
  // Unparseable referrer: nothing.
  ['::not a url::', `${O}/pay`, ''],
];

test.describe('GA URL allowlist', () => {
  test('keep list is exactly the approved one (decision I)', () => {
    expect([...GA_KEEP_PARAMS]).toEqual(['gclid', 'rank', 'grade', 'dependents', 'dep', 'yos', 'rank1', 'rank2', 'currank', 'curyos']);
  });

  for (const [input, expected] of URLS) {
    test(`url: ${input}`, () => {
      expect(cleanGaUrl(input)).toBe(expected);
      expect(inline.url(input)).toBe(expected);
    });
  }

  for (const [ref, cur, expected] of REFS) {
    test(`referrer: ${ref || '(empty)'}`, () => {
      expect(cleanGaReferrer(ref, cur)).toBe(expected);
      expect(inline.ref(ref, cur)).toBe(expected);
    });
  }

  test('no cleaned URL in the table carries a 5-digit number or a secret', () => {
    const all = [...URLS.map(([i]) => cleanGaUrl(i)), ...REFS.map(([r, c]) => cleanGaReferrer(r, c))].join('\n');
    expect(all).not.toMatch(/\b\d{5}\b/);
    expect(all).not.toMatch(/secret|ptsd|knee|income|price|bal=/);
  });
});
