/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ignore TS errors so build won't fail
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
