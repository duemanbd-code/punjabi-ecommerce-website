/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
        domains: ['localhost', 'puti-client-production.onrender.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
