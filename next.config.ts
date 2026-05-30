import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/worship-chord",
  assetPrefix: "/worship-chord/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
