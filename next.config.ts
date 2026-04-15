
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,   // ← add this line
  },
  eslint: {
    ignoreDuringBuilds: true,  // ← add this line
  },
};

export default nextConfig;
