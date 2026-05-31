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
