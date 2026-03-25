/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Next.js dev defaults to Turbopack in newer versions.
  // Because we define custom `webpack` config below, we explicitly provide a
  // (possibly empty) Turbopack config to avoid the runtime startup error:
  // "build using Turbopack, with a `webpack` config and no `turbopack` config."
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
