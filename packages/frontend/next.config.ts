import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@autodev/shared", "@xyflow/react", "@xyflow/system"],
  devIndicators: false,
};

export default nextConfig;
