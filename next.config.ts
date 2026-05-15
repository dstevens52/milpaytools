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
      // Base name reversals — 2025 Army renaming rollback
      { source: '/bah/fort-liberty', destination: '/bah/fort-bragg', permanent: true },
      { source: '/bah/fort-cavazos', destination: '/bah/fort-hood', permanent: true },
      { source: '/bah/fort-moore', destination: '/bah/fort-benning', permanent: true },
      { source: '/bah/fort-eisenhower', destination: '/bah/fort-gordon', permanent: true },
    ];
  },
};

export default nextConfig;
