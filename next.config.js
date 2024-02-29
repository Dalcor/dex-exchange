const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.coingecko.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.github.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.**',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**',
        port: ''
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig);
