const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
}

module.exports = withNextIntl(nextConfig);
