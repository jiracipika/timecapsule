/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@timecapsule/core', '@timecapsule/ui'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
