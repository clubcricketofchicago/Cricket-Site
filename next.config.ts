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
  turbopack: {},
};

export default nextConfig;
