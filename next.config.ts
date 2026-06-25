import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // CricClubs media — team/player logos & photos used across the site
      { protocol: "https", hostname: "media.cricclubs.com", pathname: "/**" },
      { protocol: "https", hostname: "cricclubs.com", pathname: "/**" },
      // Craft CMS editorial images (prod + local ddev)
      { protocol: "https", hostname: "cms.ccc.clubcricketofchicago.com", pathname: "/**" },
      { protocol: "https", hostname: "cms-ccc.ddev.site", pathname: "/**" },
      // local dev (any port)
      { protocol: "http", hostname: "localhost", port: "*", pathname: "/**" },
    ],
  },
  turbopack: {},
};

export default nextConfig;
