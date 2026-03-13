import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ccc.cms.clubcricketofchicago.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "*", // matches any local dev port
        pathname: "/**",
      },
    ],
  },
  swcMinify: true,
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
