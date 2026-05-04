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
    ];
  },
};

export default nextConfig;
