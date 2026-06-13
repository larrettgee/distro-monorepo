import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "*.cloudflarestream.com" },
      { protocol: "https", hostname: "videodelivery.net" },
    ],
  },
  // Proxy the NestJS backend so the browser calls it same-origin (no CORS).
  async rewrites() {
    return [{ source: "/api/backend/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
