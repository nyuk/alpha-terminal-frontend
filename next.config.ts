import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
