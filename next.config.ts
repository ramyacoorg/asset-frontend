// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Note: eslint config is handled via eslint.config.mjs, not next.config
};

export default nextConfig;
