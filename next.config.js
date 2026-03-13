/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cms-ccc.ddev.site'],
  },
  swcMinify: false,
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
   turbopack: {},
}

module.exports = nextConfig 