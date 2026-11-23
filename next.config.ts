import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build date (UTC, YYYY-MM-DD), inlined into server and client bundles alike.
  // src/data/va-rates/registry.ts switches to the next VA rate year on its
  // effective date using this, so prerendered HTML and hydration always agree.
  env: {
    BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'milpaytools.com' }],
        destination: 'https://www.milpaytools.com/:path*',
        permanent: true,
      },
      // Partner page rename
      { source: '/resources', destination: '/partners', permanent: true },
      // Healthcare calculator canonical redirect
      { source: '/calculators/healthcare', destination: '/calculators/healthcare-comparison', permanent: true },
      // Hub consolidation (B2) — calculators absorbed into the /bah and /pay hubs
      { source: '/calculators/bah', destination: '/bah', permanent: true },
      { source: '/calculators/pay-charts', destination: '/pay', permanent: true },
      // LES post consolidation — three near-duplicate posts merged into one survivor
      { source: '/blog/how-to-read-your-military-les', destination: '/blog/how-to-read-your-les', permanent: true },
      { source: '/blog/how-to-read-military-les-2026', destination: '/blog/how-to-read-your-les', permanent: true },
      // Blog consolidation — near-duplicate posts merged into survivors (2026-06)
      { source: '/blog/tsp-fund-options-military', destination: '/blog/tsp-fund-options-explained', permanent: true },
      { source: '/blog/dual-military-bah-guide', destination: '/blog/dual-military-bah-rules', permanent: true },
      // Blog cleanup S7 (2026-11) — near-duplicate posts merged into the URL Google already shows
      { source: '/blog/les-abbreviations-explained', destination: '/blog/how-to-read-your-les', permanent: true },
      { source: '/blog/how-deployment-pay-works', destination: '/blog/deployment-pay-explained', permanent: true },
      { source: '/blog/brs-vs-high-3-retirement', destination: '/blog/brs-vs-high-3-difference', permanent: true },
      { source: '/blog/gi-bill-vs-tuition-assistance', destination: '/blog/tuition-assistance-and-gi-bill-together', permanent: true },
      { source: '/blog/sgli-vgli-private-life-insurance', destination: '/blog/is-sgli-enough-life-insurance', permanent: true },
      { source: '/blog/what-is-scra-military-protection', destination: '/blog/scra-mla-protections-new-service-members', permanent: true },
      { source: '/blog/pcs-out-of-pocket-costs', destination: '/blog/pcs-financial-planning-guide', permanent: true },
      // Base name reversals — 2025 Army renaming rollback
      { source: '/bah/fort-liberty', destination: '/bah/fort-bragg', permanent: true },
      { source: '/bah/fort-cavazos', destination: '/bah/fort-hood', permanent: true },
      { source: '/bah/fort-moore', destination: '/bah/fort-benning', permanent: true },
      { source: '/bah/fort-eisenhower', destination: '/bah/fort-gordon', permanent: true },
      { source: '/bah/fort-johnson', destination: '/bah/fort-polk', permanent: true },
      { source: '/bah/fort-gregg-adams', destination: '/bah/fort-lee', permanent: true },
      // RAF Mildenhall shares RAF Lakenheath's OHA/COLA locality (GB352) and
      // housing office — one combined page. 301 by request (permanent: true is 308).
      { source: '/bah/raf-mildenhall', destination: '/bah/raf-lakenheath', statusCode: 301 },
      // Retired post (build 07): its premise relied on a TLE surplus the JTR doesn't allow.
      { source: '/blog/pcs-that-costs-14000-vs-makes-6000', destination: '/calculators/pcs', statusCode: 301 },
    ];
  },
};

export default nextConfig;
