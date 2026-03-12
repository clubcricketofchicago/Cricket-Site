import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ccc.cms.midwestcricketconference.org",
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
};

export default nextConfig;
