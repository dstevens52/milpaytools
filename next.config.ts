import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // LES post consolidation — three near-duplicate posts merged into one survivor
      { source: '/blog/how-to-read-your-military-les', destination: '/blog/how-to-read-your-les', permanent: true },
      { source: '/blog/how-to-read-military-les-2026', destination: '/blog/how-to-read-your-les', permanent: true },
      // Blog consolidation — near-duplicate posts merged into survivors (2026-06)
      { source: '/blog/tsp-fund-options-military', destination: '/blog/tsp-fund-options-explained', permanent: true },
      { source: '/blog/dual-military-bah-guide', destination: '/blog/dual-military-bah-rules', permanent: true },
      // Base name reversals — 2025 Army renaming rollback
      { source: '/bah/fort-liberty', destination: '/bah/fort-bragg', permanent: true },
      { source: '/bah/fort-cavazos', destination: '/bah/fort-hood', permanent: true },
      { source: '/bah/fort-moore', destination: '/bah/fort-benning', permanent: true },
      { source: '/bah/fort-eisenhower', destination: '/bah/fort-gordon', permanent: true },
      { source: '/bah/fort-johnson', destination: '/bah/fort-polk', permanent: true },
      { source: '/bah/fort-gregg-adams', destination: '/bah/fort-lee', permanent: true },
    ];
  },
};

export default nextConfig;
