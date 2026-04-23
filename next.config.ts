// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.up.railway.app",
      },
    ],
  },
  // Note: eslint config is handled via eslint.config.mjs, not next.config
};

export default nextConfig;
