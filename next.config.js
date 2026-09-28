/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    // react-pdf breaks when bundled by webpack on the server — load it from node_modules instead
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
