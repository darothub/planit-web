import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Cloudflare R2 (production storage)
      { protocol: 'https', hostname: '*.r2.dev' },
      // Local development (Railway or custom domain)
      { protocol: 'https', hostname: '*.railway.app' },
      // Allow any https image for dev flexibility
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;